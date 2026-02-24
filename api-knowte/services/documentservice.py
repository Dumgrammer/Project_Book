from pathlib import Path
from datetime import datetime, timedelta
from uuid import uuid4

import fitz  # PyMuPDF — to extract text and convert PDF pages to images
import torch
from PIL import Image
from transformers import DonutProcessor, VisionEncoderDecoderModel

from fastapi import HTTPException, UploadFile, status

from models.documentmodel import Document
from schemas.documentschema import (
    DocumentQuestionResponse,
    DocumentUploadResponse,
)

# Folder where uploaded files are saved
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MODEL_NAME = "naver-clova-ix/donut-base-finetuned-docvqa"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB
MAX_STORED_DOCUMENTS = 20
MAX_TEXT_CHARS = 200_000
DOCUMENT_TTL_SECONDS = 60 * 60 * 24  # 24 hours


class DocumentService:
    def __init__(self) -> None:
        # In-memory storage 
        self._documents: dict[str, Document] = {}
        # Converted page images per document — key: "{doc_id}_{page}"
        self._page_images: dict[str, Image.Image] = {}

        # Load the Donut model and processor — takes a while to download initially
        self._processor = DonutProcessor.from_pretrained(MODEL_NAME)
        self._model = VisionEncoderDecoderModel.from_pretrained(MODEL_NAME)
        self._model.eval()  # Evaluation mode — no training, only inference

    def upload_document(self, file: UploadFile) -> DocumentUploadResponse:
        """
        Upload a PDF file.
        Save to disk, convert each page to image for Donut,
        and extract the text for fallback (phi3).
        """
        self._cleanup_expired_documents()
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are accepted.",
            )
        if file.content_type and file.content_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Please upload a PDF.",
            )

        doc_id = str(uuid4())
        file_bytes = file.file.read()
        if len(file_bytes) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size is {MAX_UPLOAD_BYTES // (1024 * 1024)}MB.",
            )

        save_path = UPLOAD_DIR / f"{doc_id}.pdf"
        save_path.write_bytes(file_bytes)

        pdf = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(pdf)
        extracted_text_chunks: list[str] = []

        for page_num in range(page_count):
            page = pdf[page_num]

            # Fallback for phi3
            extracted_text_chunks.append(page.get_text())

            # zoom=2 para mas malinaw yung image na nakuha angas (mas accurate si Donut)
            mat = fitz.Matrix(2, 2)
            pix = page.get_pixmap(matrix=mat)
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            self._page_images[f"{doc_id}_{page_num + 1}"] = img

        pdf.close()
        file.file.close()

        extracted_text = "\n".join(extracted_text_chunks).strip()[:MAX_TEXT_CHARS]

        document = Document(
            id=doc_id,
            filename=file.filename,
            page_count=page_count,
            extracted_text=extracted_text,
        )
        self._evict_if_needed()
        self._documents[doc_id] = document

        return DocumentUploadResponse(
            document_id=doc_id,
            filename=file.filename,
            page_count=page_count,
        )

    def ask_question(self, document_id: str, question: str, page: int) -> DocumentQuestionResponse:
        """
        Ask a question about a page of the document.
        Uses the page image to answer the question.
        """
        self._cleanup_expired_documents()
        if document_id not in self._documents:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        document = self._documents[document_id]
        if page > document.page_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Page {page} wala — ang document ay {document.page_count} page(s) lang.",
            )

        image_key = f"{document_id}_{page}"
        image = self._page_images.get(image_key)
        if image is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Page image not loaded.",
            )

        answer, confidence = self._run_donut(image, question)

        return DocumentQuestionResponse(
            document_id=document_id,
            question=question,
            answer=answer,
            confidence=confidence,
            model=MODEL_NAME,
        )

    def get_extracted_text(self, document_id: str) -> str:
        """
        Get the plain text of the document. Can be passed to phi3 for chat.
        """
        self._cleanup_expired_documents()
        if document_id not in self._documents:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )
        return self._documents[document_id].extracted_text

    def _evict_if_needed(self) -> None:
        while len(self._documents) >= MAX_STORED_DOCUMENTS:
            oldest_id = next(iter(self._documents))
            self._delete_document(oldest_id)

    def _cleanup_expired_documents(self) -> None:
        now = datetime.utcnow()
        expired_ids = [
            doc_id
            for doc_id, doc in self._documents.items()
            if (now - doc.created_at) > timedelta(seconds=DOCUMENT_TTL_SECONDS)
        ]
        for doc_id in expired_ids:
            self._delete_document(doc_id)

    def _delete_document(self, document_id: str) -> None:
        self._documents.pop(document_id, None)

        image_prefix = f"{document_id}_"
        image_keys = [k for k in self._page_images if k.startswith(image_prefix)]
        for key in image_keys:
            self._page_images.pop(key, None)

        saved_file = UPLOAD_DIR / f"{document_id}.pdf"
        if saved_file.exists():
            saved_file.unlink()

    def _run_donut(self, image: Image.Image, question: str) -> tuple[str, float]:
        """
        Run the Donut model on a page image + question.
        Returns (answer, confidence).
        """
        # Prepare the prompt — Donut expects a specific format
        task_prompt = "<s_docvqa><s_question>{user_input}</s_question><s_answer>"
        prompt = task_prompt.replace("{user_input}", question)

        # Encode the image and prompt
        decoder_input_ids = self._processor.tokenizer(
            prompt, add_special_tokens=False, return_tensors="pt"
        ).input_ids
        pixel_values = self._processor(image, return_tensors="pt").pixel_values

        # Generate the answer — no gradient computation, only inference
        with torch.no_grad():
            outputs = self._model.generate(
                pixel_values,
                decoder_input_ids=decoder_input_ids,
                max_length=self._model.decoder.config.max_position_embeddings,
                pad_token_id=self._processor.tokenizer.pad_token_id,
                eos_token_id=self._processor.tokenizer.eos_token_id,
                use_cache=True,
                bad_words_ids=[[self._processor.tokenizer.unk_token_id]],
                return_dict_in_generate=True,
                output_scores=True,
            )

        # Decode the output tokens → text
        raw_output = self._processor.batch_decode(outputs.sequences)[0]
        # Clean the output — remove special tokens
        raw_output = raw_output.replace(self._processor.tokenizer.eos_token, "")
        raw_output = raw_output.replace(self._processor.tokenizer.pad_token, "")

        # Parse the structured output of Donut
        parsed = self._processor.token2json(raw_output)

        answer = ""
        confidence = 0.0

        if isinstance(parsed, dict):
            answer = parsed.get("answer", str(parsed))
        else:
            answer = str(parsed)

        # Calculate the confidence from the generation scores
        if outputs.scores:
            probs = torch.stack(outputs.scores, dim=1).softmax(-1)
            token_probs = probs[0].max(dim=-1).values
            confidence = round(token_probs.mean().item(), 4)

        return answer, confidence


_document_service: DocumentService | None = None


def get_document_service() -> DocumentService:
    # Lazy init — model is not loaded until it is used
    # To avoid slowing down the server startup if it is not used immediately
    global _document_service
    if _document_service is None:
        _document_service = DocumentService()
    return _document_service
