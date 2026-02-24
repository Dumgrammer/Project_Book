from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4


@dataclass(slots=True)
class Document:
    # id: unique identifier para sa document
    id: str = field(default_factory=lambda: str(uuid4()))
    # filename: name ng file na in-upload
    filename: str = ""
    page_count: int = 0
    # extracted_text: (fallback for phi3)
    extracted_text: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class DocumentAnswer:
    # document_id: which document the question is about
    document_id: str = ""

    question: str = ""

    answer: str = ""
    # confidence: gaano ka-sure ang model sa sagot (0.0 to 1.0)
    confidence: float = 0.0
