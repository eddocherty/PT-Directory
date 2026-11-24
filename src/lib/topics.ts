import { FITNESS_GOALS, TRAINING_STYLES } from "./taxonomy";

/** A specialism people search for: either a training style or a goal. Each gets its own landing pages. */
export type Topic = {
  slug: string;
  name: string;
  kind: "style" | "goal";
  /** How people search for it, used in page titles and headings: "Pilates instructors in Leeds". */
  people: string;
};

const PEOPLE: Record<string, string> = {
  strength: "Strength coaches",
  bodybuilding: "Bodybuilding coaches",
  powerlifting: "Powerlifting coaches",
  hiit: "HIIT personal trainers",
  crossfit: "CrossFit style coaches",
  boxing: "Boxing personal trainers",
  yoga: "Yoga teachers",
  pilates: "Pilates instructors",
  kettlebells: "Kettlebell coaches",
  calisthenics: "Calisthenics coaches",
  running: "Running coaches",
  functional: "Functional training coaches",
  bootcamp: "Outdoor bootcamps",
  mobility: "Mobility coaches",
  "weight-loss": "Personal trainers for weight loss",
  "muscle-gain": "Personal trainers for muscle gain",
  "general-fitness": "Personal trainers for general fitness",
  "sports-performance": "Sports performance coaches",
  rehab: "Personal trainers for injury rehab",
  "pre-post-natal": "Pre and postnatal personal trainers",
  "older-adults": "Personal trainers for older adults",
  flexibility: "Flexibility coaches",
  endurance: "Endurance coaches",
  "competition-prep": "Competition prep coaches",
  confidence: "Personal trainers for beginners",
};

export const TOPICS: Topic[] = [
  ...TRAINING_STYLES.map((s) => ({ ...s, kind: "style" as const, people: PEOPLE[s.slug] ?? `${s.name} trainers` })),
  ...FITNESS_GOALS.map((g) => ({ ...g, kind: "goal" as const, people: PEOPLE[g.slug] ?? `Trainers for ${g.name.toLowerCase()}` })),
];

export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);

/** A town page for a specialism only goes live with at least this many real trainers, so no page is thin. */
export const MIN_TRAINERS = 3;

/** Radius used for every town page, matching the default search. */
export const TOWN_RADIUS = 25;

/** "Pilates instructors" → "pilates instructors" for use mid-sentence, leaving HIIT and CrossFit alone. */
export const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) && !/^(CrossFit|Pilates)/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
