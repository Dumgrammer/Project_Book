export type FaqItem = {
  question: string;
  answer: string;
};

export const faqsData: FaqItem[] = [
  {
    question: "Can I use this for commercial projects?",
    answer: "Yes. You can use these UI sections in personal and commercial projects.",
  },
  {
    question: "Do I need Tailwind knowledge?",
    answer: "Basic Tailwind familiarity helps, but the components are ready to use.",
  },
  {
    question: "Is this mobile responsive?",
    answer: "Yes, all sections are built to adapt cleanly across device sizes.",
  },
];
