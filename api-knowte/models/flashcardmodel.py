from dataclasses import dataclass, field


@dataclass(slots=True)
class FlashcardItem:
    """Single flashcard generated from a source document."""

    question: str
    answer: str


@dataclass(slots=True)
class FlashcardDeck:
    """
    Group of generated flashcards tied to one document and one generation prompt.

    Notes:
    - `document_id` links this deck to an uploaded PDF.
    - `prompt` stores user instructions used during generation.
    - `model` records which LLM produced the cards.
    """

    document_id: str
    prompt: str
    flashcards: list[FlashcardItem] = field(default_factory=list)
    model: str = "phi3"
