import { CheckIcon, SparklesIcon, ZapIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PlanFeature = {
  name: string;
  icon: LucideIcon;
};

export type PricingPlan = {
  title: string;
  price: number;
  buttonText: string;
  mostPopular: boolean;
  features: PlanFeature[];
};

export const pricingData: PricingPlan[] = [
  {
    title: "Student",
    price: 0,
    buttonText: "Get Started Free",
    mostPopular: false,
    features: [
      { name: "5 document uploads", icon: CheckIcon },
      { name: "AI document Q&A", icon: SparklesIcon },
      { name: "Basic quiz generation", icon: ZapIcon },
    ],
  },
  {
    title: "Pro Learner",
    price: 12,
    buttonText: "Upgrade to Pro",
    mostPopular: true,
    features: [
      { name: "Unlimited documents", icon: CheckIcon },
      { name: "Advanced AI answers", icon: SparklesIcon },
      { name: "Flashcards & study guides", icon: ZapIcon },
    ],
  },
  {
    title: "Institution",
    price: 49,
    buttonText: "Contact Sales",
    mostPopular: false,
    features: [
      { name: "Unlimited rooms & users", icon: CheckIcon },
      { name: "Bulk document processing", icon: SparklesIcon },
      { name: "Analytics & admin dashboard", icon: ZapIcon },
    ],
  },
];
