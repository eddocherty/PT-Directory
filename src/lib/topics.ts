import { FITNESS_GOALS, TRAINING_STYLES } from "./taxonomy";

/** A specialism people search for: either a training style or a goal. Each gets its own landing pages. */
export type Topic = {
  slug: string;
  name: string;
  kind: "style" | "goal" | "home";
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
  { slug: "home-visits", name: "Home visits", kind: "home", people: "Mobile personal trainers" },
];

/** The search parameter that selects a topic: ?style=, ?goal= or ?home=1. */
export const topicParam = (t: Topic): [string, string] => (t.kind === "home" ? ["home", "1"] : [t.kind, t.slug]);

export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);

/** A town page for a specialism only goes live with at least this many real trainers, so no page is thin. */
export const MIN_TRAINERS = 3;

/** Radius used for every town page, matching the default search. */
export const TOWN_RADIUS = 25;

/** "Pilates instructors" → "pilates instructors" for use mid-sentence, leaving HIIT and CrossFit alone. */
export const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) && !/^(CrossFit|Pilates)/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

/** Two or three plain sentences per specialism for its UK page: what it is, who it suits, what to ask a trainer.
 *  General guidance only. Nothing here promises results or describes any one trainer. */
export const TOPIC_INTROS: Record<string, string> = {
  strength:
    "Strength training means lifting progressively heavier weights in a few basic movements: squats, hinges, presses and pulls. It suits complete beginners as much as experienced lifters. A good coach will start lighter than you expect and write down what you lift each week.",
  bodybuilding:
    "Bodybuilding coaching is about building muscle size and shape, usually with higher training volume and close attention to food. Ask a coach how they adjust your plan when progress stalls, and whether they have prepared people for a show if that is your aim.",
  powerlifting:
    "Powerlifting is the squat, bench press and deadlift, trained for your best single lift. Coaches focus on technique and planned blocks of training. If you want to compete, ask whether they know the rules of the federation you would enter.",
  hiit:
    "HIIT sessions alternate short, hard efforts with rest. They are quick and leave you out of breath, so they suit busy people, but they are not a good place to start if you have a heart condition or have been inactive for a long time without a check from your GP.",
  crossfit:
    "CrossFit style training mixes lifting, gymnastics and conditioning in varied, timed workouts. The trainers listed here are independent and use the style, not official CrossFit affiliates unless they say so. Ask how they scale the workouts for a beginner.",
  boxing:
    "Boxing personal training is pad work, bag work and footwork for fitness, usually without sparring. It is good for conditioning and coordination. Ask whether sessions are contact-free if you only want the workout.",
  yoga:
    "Yoga teachers listed here offer one-to-one or small group sessions, from gentle and restorative styles to faster, more athletic flows. Ask which style they teach and whether they adapt poses for injuries or stiff joints.",
  pilates:
    "Pilates works on core strength, posture and controlled movement, on a mat or on reformer machines. Many people use it alongside other training or after injury. Ask whether sessions are mat or equipment based, and what training the instructor has done.",
  kettlebells:
    "Kettlebell training builds strength and fitness with swings, cleans, presses and carries, using one or two bells. The swing is the movement to learn properly first, so a coach who spends time on it early is a good sign.",
  calisthenics:
    "Calisthenics is bodyweight strength training: push-ups, pull-ups, dips and harder skills like handstands and muscle-ups. You need very little kit, so it works at home or in a park. Ask a coach how they would get you to your first pull-up.",
  running:
    "Running coaches help with technique, pacing and training plans, from a first 5k to a marathon. Ask how they plan your weeks around a race date and what they do if you pick up a niggle.",
  functional:
    "Functional training means exercises that carry over to daily life and sport: lifting, carrying, twisting and getting up and down off the floor. It is a broad label, so ask a trainer what a typical session with them actually involves.",
  bootcamp:
    "Outdoor bootcamps are small group sessions in parks and open spaces, usually early in the morning or after work. They cost less per session than one-to-one training and suit people who like training with others. Ask about group size and what happens in bad weather.",
  mobility:
    "Mobility coaching works on how freely your joints move, through stretching, controlled movement and strength at end range. It suits desk workers, older adults and lifters with stiff hips or shoulders.",
  "weight-loss":
    "Trainers who help with weight loss combine regular exercise with habits around food, sleep and daily activity. Be wary of anyone promising a set number of pounds in a set time. Ask how they track progress beyond the scales.",
  "muscle-gain":
    "Building muscle takes progressive training, enough protein and patience. A trainer can plan your sessions and check your form so you keep adding weight safely. Ask how often they review your programme.",
  "general-fitness":
    "General fitness training is for people who want to feel fitter, stronger and more energetic without a specific event in mind. It is the most common reason people hire a personal trainer, and a good one will set small, clear goals with you in the first session.",
  "sports-performance":
    "Sports performance coaches train speed, power, agility and resilience for a particular sport. Tell them your sport, position and season dates, and ask how they would fit training around matches.",
  rehab:
    "Some trainers specialise in helping people return to exercise after an injury or operation. A personal trainer is not a physiotherapist, so the usual route is to be discharged or cleared by your physio or GP first, then train with someone who will work from their advice.",
  "pre-post-natal":
    "Pre and postnatal trainers adapt exercise for pregnancy and the months after birth, with attention to the pelvic floor and abdominal separation. Most people wait for their six to eight week postnatal check before starting. Ask what pre and postnatal qualification the trainer holds.",
  "older-adults":
    "Training for older adults focuses on strength, balance and confidence, which helps prevent falls and keeps everyday tasks easy. Look for a trainer who is patient, starts gently and asks about your health before the first session.",
  flexibility:
    "Flexibility coaching aims to improve your range of movement through regular stretching and mobility work, whether for splits, yoga poses or simply touching your toes. Progress is slow and steady, so ask how often they suggest you practise between sessions.",
  endurance:
    "Endurance coaches plan training for long events: marathons, triathlons, sportives and long hikes. Ask how they balance easy and hard sessions, and how they build in recovery weeks.",
  "competition-prep":
    "Competition prep coaches guide bodybuilders and physique athletes through the months before a show: training, diet phases and peak week. Ask how many people they have taken to the stage and how they handle the period after the show.",
  confidence:
    "These trainers work well with complete beginners and people who feel nervous about gyms. Sessions often start with the basics, at a quiet time or away from the gym floor. It is fine to ask for a chat before you book anything.",
  "home-visits":
    "Mobile personal trainers come to you, at home, in a local park or at your workplace, and bring the kit with them. It suits parents, people with busy jobs and anyone who would rather not train in a gym. Ask how far they travel and whether you need any space or equipment.",
};
