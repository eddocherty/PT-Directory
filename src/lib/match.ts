/**
 * The "find your training match" quiz: questions, and how answers map to a kind of training,
 * the trainers to show, a guide and a plan. Plain rules, no scoring magic, so results are easy to explain.
 */
export type Choice = { value: string; label: string; hint?: string };
export type Question = { key: "goal" | "style" | "where" | "level"; title: string; choices: Choice[] };

export const QUESTIONS: Question[] = [
  {
    key: "goal",
    title: "What would you most like to change?",
    choices: [
      { value: "lose", label: "Lose some weight", hint: "and keep it off" },
      { value: "muscle", label: "Get stronger", hint: "build muscle, lift more" },
      { value: "fitter", label: "Feel fitter", hint: "more energy, less puffing" },
      { value: "run", label: "Run further", hint: "a first 10K or half" },
      { value: "baby", label: "Get back to it after having a baby" },
      { value: "pain", label: "Move without aches", hint: "back, knees, stiffness" },
    ],
  },
  {
    key: "style",
    title: "Which sounds most like you?",
    choices: [
      { value: "weights", label: "I like lifting things", hint: "dumbbells, barbells, kettlebells" },
      { value: "energy", label: "Make me sweat", hint: "fast, loud, high energy" },
      { value: "calm", label: "Slow and controlled", hint: "Pilates, mobility, form first" },
      { value: "outdoors", label: "Get me outside", hint: "parks, fresh air, all weathers" },
      { value: "unsure", label: "No idea yet", hint: "that’s fine" },
    ],
  },
  {
    key: "where",
    title: "Where would you rather train?",
    choices: [
      { value: "gym", label: "At a gym or studio" },
      { value: "home", label: "At home", hint: "a trainer who comes to you" },
      { value: "group", label: "In a small group", hint: "a few people, one coach" },
      { value: "online", label: "Online", hint: "a plan on your phone, check-ins" },
    ],
  },
  {
    key: "level",
    title: "How much training have you done?",
    choices: [
      { value: "new", label: "Hardly any", hint: "I’d be starting from scratch" },
      { value: "returning", label: "Some, a while ago", hint: "getting back into it" },
      { value: "regular", label: "I train already", hint: "and want to get more out of it" },
    ],
  },
];

export type Answers = { goal?: string; style?: string; where?: string; level?: string; loc?: string };

export type Match = {
  key: string;
  title: string;
  /** Second person, one or two sentences on why this fits. */
  why: string;
  /** What to look for in a trainer. */
  lookFor: string[];
  styles: string[];
  goals: string[];
  guide: string;
  plan: string;
};

const M = {
  postnatal: {
    title: "A postnatal comeback",
    why: "You want to rebuild gently, starting with your core and pelvic floor, with someone who knows what pregnancy and birth change.",
    lookFor: ["A pre and postnatal qualification", "Asks about your birth and your postnatal check", "Happy to go slowly before adding impact"],
    styles: [], goals: ["pre-post-natal"], guide: "how-to-choose-a-postnatal-personal-trainer", plan: "postnatal-return-plan",
  },
  runner: {
    title: "A distance runner in the making",
    why: "You want structure: easy runs, a few harder ones, and strength work so your legs hold up as the miles go up.",
    lookFor: ["Coaches running, not just gym sessions", "Builds in strength work for runners", "Plans backwards from your race date"],
    styles: ["running"], goals: ["endurance"], guide: "how-often-should-you-see-a-personal-trainer", plan: "first-half-marathon-plan",
  },
  calm: {
    title: "Calm and strong",
    why: "Controlled movement suits you: getting the basics right, moving better and building strength that makes everyday life easier.",
    lookFor: ["Pilates, mobility or rehab experience", "Asks about aches and old injuries first", "Explains why each exercise is there"],
    styles: ["pilates", "mobility"], goals: ["rehab", "flexibility"], guide: "reformer-vs-mat-pilates", plan: "beginner-gym-plan",
  },
  group: {
    title: "Small group energy",
    why: "You’ll train harder with a few other people around you, a coach keeping an eye on your form and a set time to turn up.",
    lookFor: ["Groups small enough for coaching, often two to eight", "Options for every level in the same session", "A taster session before you commit"],
    styles: ["bootcamp", "hiit"], goals: [], guide: "bootcamps-and-small-group-training", plan: "beginner-gym-plan",
  },
  strength: {
    title: "A strength builder",
    why: "Lifting suits you. A trainer who teaches the main lifts well and adds a little each week will get you further than any app.",
    lookFor: ["Strength or weightlifting experience", "Writes down what you lift and builds on it", "Checks your technique before adding weight"],
    styles: ["strength"], goals: ["muscle-gain"], guide: "what-happens-in-a-personal-training-session", plan: "dumbbell-only-plan",
  },
  weightloss: {
    title: "Steady, lasting change",
    why: "You want habits that stick: regular training you enjoy, sensible food and progress you can see, not a crash plan.",
    lookFor: ["Talks about habits, sleep and food, not just workouts", "Sets goals you can measure beyond the scales", "Builds a routine you can keep without them"],
    styles: [], goals: ["weight-loss"], guide: "starting-with-a-personal-trainer-in-january", plan: "high-protein-guide",
  },
  beginner: {
    title: "A confident beginner",
    why: "You’re starting fresh, which is a great place to be. The right trainer will make the first few weeks feel easy and build from there.",
    lookFor: ["Works with beginners and nervous starters", "Teaches you to train on your own too", "No shouting, no judgement"],
    styles: [], goals: ["confidence"], guide: "questions-to-ask-a-personal-trainer", plan: "beginner-gym-plan",
  },
  fitter: {
    title: "All-round fitness",
    why: "You want to feel fitter, stronger and more energetic. A mix of strength and conditioning, done regularly, is the way there.",
    lookFor: ["A mix of strength and cardio", "Sessions that change as you improve", "Fits around your week"],
    styles: ["functional"], goals: ["general-fitness"], guide: "how-often-should-you-see-a-personal-trainer", plan: "beginner-gym-plan",
  },
} satisfies Record<string, Omit<Match, "key">>;

export function matchFor(a: Answers): Match {
  const key: keyof typeof M =
    a.goal === "baby" ? "postnatal"
    : a.goal === "run" ? "runner"
    : a.goal === "pain" || a.style === "calm" ? "calm"
    : a.where === "group" || a.style === "energy" || a.style === "outdoors" ? "group"
    : a.goal === "muscle" || a.style === "weights" ? "strength"
    : a.goal === "lose" ? "weightloss"
    : a.level === "new" ? "beginner"
    : "fitter";
  const m: Match = { key, ...M[key] };
  // Training at home with no gym: the dumbbell plan fits better than the gym one.
  if (a.where === "home" && m.plan === "beginner-gym-plan") m.plan = "dumbbell-only-plan";
  return m;
}

const valid = (q: Question["key"], v: unknown) => (typeof v === "string" && QUESTIONS.find((x) => x.key === q)!.choices.some((c) => c.value === v) ? v : undefined);

export function parseAnswers(p: Record<string, string | string[] | undefined>): Answers {
  const one = (k: string) => (Array.isArray(p[k]) ? p[k]![0] : p[k]) as string | undefined;
  return {
    goal: valid("goal", one("goal")),
    style: valid("style", one("style")),
    where: valid("where", one("where")),
    level: valid("level", one("level")),
    loc: one("loc")?.trim().slice(0, 60) || undefined,
  };
}
