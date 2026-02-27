export type FaqItem = {
  question: string;
  answer: string;
};

export const faqsData: FaqItem[] = [
  {
    question: "What types of documents can I upload?",
    answer: "You can upload PDFs, Word documents, PowerPoint slides, and plain text files. Knowte's AI will process and index them for instant Q&A and material generation.",
  },
  {
    question: "How accurate are the AI-generated answers?",
    answer: "Knowte's AI uses advanced retrieval-augmented generation to pull answers directly from your uploaded documents, ensuring high accuracy and source-backed responses.",
  },
  {
    question: "Can I generate quizzes and flashcards from my notes?",
    answer: "Absolutely! Simply upload your study materials and Knowte will automatically generate quizzes, flashcards, and practice tests tailored to the content.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. All uploaded documents are encrypted and stored securely. Your data is never shared with third parties or used to train external models.",
  },
  {
    question: "Can educators use Knowte for their classes?",
    answer: "Yes! Educators can create rooms, upload course materials, and share AI-generated study resources with their students through collaborative workspaces.",
  },
];
