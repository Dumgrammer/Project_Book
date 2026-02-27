export type Testimonial = {
  name: string;
  handle: string;
  image: string;
  quote: string;
};

export const testimonialsData: Testimonial[] = [
  {
    name: "Avery Lane",
    handle: "@averylane",
    image: "https://i.pravatar.cc/100?img=11",
    quote: "Knowte turned my 200-page textbook into digestible flashcards in minutes. A total game-changer for exam prep!",
  },
  {
    name: "Mia Chen",
    handle: "@miachen",
    image: "https://i.pravatar.cc/100?img=32",
    quote: "I upload my lecture PDFs and ask questions like I'm talking to a tutor. The AI answers are incredibly accurate.",
  },
  {
    name: "David Park",
    handle: "@davidpark",
    image: "https://i.pravatar.cc/100?img=44",
    quote: "As a professor, I use Knowte to generate quizzes from my course materials. Saves me hours every week.",
  },
];
