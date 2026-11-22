// Shop catalogue. Prices are in pence (GBP). The PDFs live in private/plans/ and are
// only ever served by /api/download after Stripe confirms payment.
export type Product = {
  slug: string;
  name: string;
  short: string;
  description: string;
  price: number;
  file: string;
  pages: number;
  level: string;
  inside: string[];
  goal?: string; // trainer search goal to suggest afterwards
};

export const PRODUCTS: Product[] = [
  {
    slug: "beginner-gym-plan",
    name: "Your first 8 weeks in the gym",
    short: "Beginner gym plan",
    description:
      "A confidence-building plan for anyone new to the gym. Three full-body sessions a week, every exercise explained in plain English.",
    price: 700,
    file: "train-local-beginner-gym-plan.pdf",
    pages: 8,
    level: "Beginner",
    inside: [
      "8-week plan, 3 sessions a week",
      "Two full-body workouts using machines and dumbbells",
      "How heavy to go and when to add weight",
      "Step-by-step guide to 12 exercises",
      "Gym confidence tips and a printable training log",
    ],
    goal: "general-fitness",
  },
  {
    slug: "postnatal-return-plan",
    name: "Return to exercise after birth",
    short: "Postnatal return plan",
    description:
      "A gentle 12-week plan to rebuild your pelvic floor, core and everyday strength, for after your postnatal check and GP clearance.",
    price: 800,
    file: "train-local-postnatal-return-plan.pdf",
    pages: 9,
    level: "Postnatal",
    inside: [
      "Clear safety guidance and warning signs to look out for",
      "Breathing and daily pelvic floor routine",
      "Three phases over 12 weeks, at your own pace",
      "Home-based, no equipment needed to start",
      "Week 12 check-in before any higher-impact exercise",
    ],
    goal: "pre-post-natal",
  },
  {
    slug: "high-protein-guide",
    name: "Fuel your training",
    short: "High-protein eating guide",
    description:
      "Simple, balanced high-protein eating for gym-goers. Easy meals, a week of ideas, recipes and a shopping list. No calorie counting.",
    price: 600,
    file: "train-local-high-protein-guide.pdf",
    pages: 7,
    level: "All levels",
    inside: [
      "Three simple protein habits",
      "The training plate and protein foods at a glance",
      "A week of meal ideas, with vegetarian swaps",
      "Four easy recipes",
      "Common questions and a shopping list",
    ],
    goal: "muscle-gain",
  },
  {
    slug: "dumbbell-only-plan",
    name: "Dumbbells only",
    short: "Dumbbell-only plan",
    description:
      "An 8-week strength plan you can do at home with just a pair of dumbbells. Upper, lower and full-body days that get harder every week.",
    price: 700,
    file: "train-local-dumbbell-only-plan.pdf",
    pages: 7,
    level: "Beginner to intermediate",
    inside: [
      "8-week plan, 3 sessions a week",
      "Upper, lower and full-body workouts",
      "Six ways to progress without buying heavier weights",
      "Step-by-step guide to 12 exercises",
      "Printable training log",
    ],
    goal: "muscle-gain",
  },
  {
    slug: "first-half-marathon-plan",
    name: "My first half marathon",
    short: "First half marathon plan",
    description:
      "A 12-week plan to take you from regular 5K runner to half marathon finisher, with strength sessions, fuelling tips and a race-day checklist.",
    price: 800,
    file: "train-local-first-half-marathon-plan.pdf",
    pages: 7,
    level: "Can run 5K",
    inside: [
      "12-week plan: 3 runs plus 1 strength session a week",
      "Effort guide for easy, tempo and interval runs",
      "Strength routine for runners",
      "Kit, fuelling and pacing advice",
      "Race-week and race-morning checklists",
    ],
    goal: "endurance",
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const formatPrice = (pence: number) => `£${(pence / 100).toFixed(pence % 100 ? 2 : 0)}`;
