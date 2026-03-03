from dataclasses import dataclass, field


@dataclass(slots=True)
class QuizItem:
    """Single quiz question with options and expected answer."""

    question: str
    options: list[str] = field(default_factory=list)
    answer: str = ""
    explanation: str | None = None


@dataclass(slots=True)
class QuizSet:
    """Generated quiz payload tied to one source document and prompt."""

    document_id: str
    prompt: str
    questions: list[QuizItem] = field(default_factory=list)
    model: str = "qwen3.5:4b"
