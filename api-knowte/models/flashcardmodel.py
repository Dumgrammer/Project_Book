from dataclasses import dataclass, field


@dataclass(slots=True)
class FlashcardItem:
    question: str
    answer: str


@dataclass(slots=True)
class FlashcardDeck:
    document_id: str
    prompt: str
    flashcards: list[FlashcardItem] = field(default_factory=list)
    model: str = "phi3"
