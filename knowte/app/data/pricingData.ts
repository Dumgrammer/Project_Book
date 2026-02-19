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
    title: "Starter",
    price: 19,
    buttonText: "Choose Starter",
    mostPopular: false,
    features: [
      { name: "1 project", icon: CheckIcon },
      { name: "Email support", icon: ZapIcon },
      { name: "Community access", icon: SparklesIcon },
    ],
  },
  {
    title: "Pro",
    price: 49,
    buttonText: "Choose Pro",
    mostPopular: true,
    features: [
      { name: "10 projects", icon: CheckIcon },
      { name: "Priority support", icon: ZapIcon },
      { name: "AI enhancements", icon: SparklesIcon },
    ],
  },
  {
    title: "Scale",
    price: 99,
    buttonText: "Contact Sales",
    mostPopular: false,
    features: [
      { name: "Unlimited projects", icon: CheckIcon },
      { name: "Dedicated manager", icon: ZapIcon },
      { name: "Advanced analytics", icon: SparklesIcon },
    ],
  },
];
