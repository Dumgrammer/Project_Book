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
    quote: "Knowte helped us ship onboarding in a weekend.",
  },
  {
    name: "Mia Chen",
    handle: "@miachen",
    image: "https://i.pravatar.cc/100?img=32",
    quote: "The templates are clean, fast, and super easy to customize.",
  },
  {
    name: "David Park",
    handle: "@davidpark",
    image: "https://i.pravatar.cc/100?img=44",
    quote: "We moved from idea to launch without fighting UI boilerplate.",
  },
];
