/**
 * Short, practical guides for people choosing a trainer. Plain UK English, general guidance only,
 * written to answer the questions people actually type into Google before they book.
 * Each section is a heading and one or more paragraphs. `related` links them to specialism pages.
 */
export type Guide = {
  slug: string;
  title: string;
  /** One sentence for the meta description and the guides index. */
  summary: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
  related: { href: string; label: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-check-a-personal-trainer-is-qualified",
    title: "How to check a personal trainer is qualified",
    summary: "What a Level 3 qualification means, how to look a trainer up on the CIMSPA register, and the insurance they should hold.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "Personal training isn't a protected title",
        body: [
          "In the UK anyone can call themselves a personal trainer. There is no law that says they need a qualification first. Most good trainers are qualified, but it is worth checking before you hand over money, especially if you have an injury or a health condition.",
        ],
      },
      {
        heading: "Level 2 and Level 3",
        body: [
          "A Level 2 Certificate in Gym Instructing lets someone supervise people in a gym and show them equipment. A Level 3 Diploma in Personal Training is the standard qualification for writing programmes and coaching people one to one. If someone is selling personal training, Level 3 is what to look for.",
          "Many trainers add specialist courses on top, such as antenatal and postnatal exercise, exercise referral, or training older adults. Ask which awarding body issued the course and roughly when they did it.",
        ],
      },
      {
        heading: "The CIMSPA register",
        body: [
          "CIMSPA, the Chartered Institute for the Management of Sport and Physical Activity, is the professional body for the sector. Trainers who hold a recognised qualification can join its directory as a member. Membership is voluntary, so not being listed doesn't mean someone is unqualified, but being listed is a good sign.",
          "You can search the directory on the CIMSPA website by name. If a trainer says they are a member and you can't find them, ask for their membership number.",
        ],
      },
      {
        heading: "Insurance and first aid",
        body: [
          "A self-employed trainer should have public liability insurance and professional indemnity insurance that covers personal training. It is reasonable to ask to see the certificate, and a professional won't mind.",
          "Ask whether they hold a current first aid certificate that includes CPR. If they train people in parks or homes, they are often the only person there if something goes wrong.",
        ],
      },
      {
        heading: "Questions that tell you more than a certificate",
        body: [
          "Do they ask about your health, injuries and medication before the first session? Do they have a written plan for you, and do they record what you do? Can they explain why each exercise is there? Qualifications set a minimum. These answers show how a trainer actually works.",
        ],
      },
    ],
    related: [
      { href: "/guides/questions-to-ask-a-personal-trainer", label: "Questions to ask before your first session" },
      { href: "/trainers", label: "Search independent trainers" },
    ],
  },
  {
    slug: "pre-and-postnatal-personal-training",
    title: "Pre and postnatal personal training: what it is and when to start",
    summary: "What a pre and postnatal trainer does differently, when it is usually safe to start after birth, and what to ask them.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "What makes it different",
        body: [
          "Pregnancy changes your balance, joints, breathing and core. A pre and postnatal trainer adapts exercise around that: fewer movements lying flat on your back later in pregnancy, careful core work, and a lot of attention to the pelvic floor.",
          "After birth, the focus is on rebuilding. That usually means breathing and pelvic floor work first, then gradually adding strength training and, much later, running or jumping.",
        ],
      },
      {
        heading: "Exercising while pregnant",
        body: [
          "NHS guidance says that if you were active before pregnancy you can usually keep going, adjusting as you go, and that it is fine to start gentle exercise if you weren't. Tell your midwife or GP what you plan to do, and stop and get advice if you feel pain, dizziness, bleeding or anything that worries you.",
        ],
      },
      {
        heading: "When to start after birth",
        body: [
          "Most people wait until their postnatal check, around six to eight weeks after birth, before starting structured exercise. After a caesarean it is often longer. Gentle walking and pelvic floor exercises can usually start sooner. Your GP or midwife is the person to give you the go-ahead, not a trainer.",
          "If you notice leaking, heaviness, or a gap or doming down the middle of your stomach (abdominal separation), mention it at your check. A women's health physiotherapist can assess it, and a good trainer will work from their advice.",
        ],
      },
      {
        heading: "What to ask a trainer",
        body: [
          "Ask what pre and postnatal qualification they hold, how they screen you before the first session, and how they would progress you from the basics back to your usual training. Ask whether they can train you at home, or whether you can bring your baby.",
        ],
      },
    ],
    related: [
      { href: "/specialisms/pre-post-natal", label: "Pre and postnatal trainers across the UK" },
      { href: "/specialisms/home-visits", label: "Trainers who come to your home" },
    ],
  },
  {
    slug: "online-vs-in-person-personal-training",
    title: "Online or in-person personal training?",
    summary: "How online coaching works, who it suits, and when training in person with someone local is the better choice.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "How online coaching works",
        body: [
          "Online coaches usually write you a programme in an app, check in weekly, and review videos of your lifts. Some also run live video sessions. You train on your own, at your gym or at home, at times that suit you.",
        ],
      },
      {
        heading: "Who online suits",
        body: [
          "Online coaching works well if you already know your way around a gym, train at odd hours, travel a lot, or live somewhere without a specialist nearby. It usually costs less per month than weekly one-to-one sessions, because the coach's time is spread across more people.",
        ],
      },
      {
        heading: "When in person is better",
        body: [
          "If you are new to exercise, coming back from an injury, pregnant or recently postnatal, or learning technical lifts, having someone in the room makes a real difference. They can see and correct things a video misses, and having a booked session makes it harder to skip.",
        ],
      },
      {
        heading: "Doing both",
        body: [
          "Many people start with a few sessions in person to learn the basics, then move to online check-ins. Lots of local trainers offer both, so it is worth asking.",
        ],
      },
    ],
    related: [
      { href: "/online", label: "Online coaches across the UK" },
      { href: "/locations", label: "Trainers near you" },
    ],
  },
  {
    slug: "questions-to-ask-a-personal-trainer",
    title: "Questions to ask a personal trainer before your first session",
    summary: "Ten questions to ask when you contact a trainer, so you know what you are paying for before you book.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "About them",
        body: [
          "What qualifications do you hold, and are you insured? Who do you usually train, and have you worked with people like me? How long have you been training clients?",
        ],
      },
      {
        heading: "About the sessions",
        body: [
          "Where do sessions happen: a gym, a studio, a park or my home? If it is a gym, do I need my own membership? How long is a session, and how many people are in it?",
        ],
      },
      {
        heading: "About the plan",
        body: [
          "What happens in the first session? How will we measure progress? Do you give me anything to do between sessions, and do you help with food or just training?",
        ],
      },
      {
        heading: "About the money",
        body: [
          "How much is a session, and is it cheaper in a block? What is the cancellation policy? Is there a minimum commitment? Prices vary a lot between towns and trainers, so it is normal to ask before you book anything.",
        ],
      },
      {
        heading: "A good sign",
        body: [
          "A good trainer will have questions for you too: about your health, injuries, goals and how much time you really have. If someone is keen to sign you up without asking anything, keep looking.",
        ],
      },
    ],
    related: [
      { href: "/guides/how-to-check-a-personal-trainer-is-qualified", label: "How to check a trainer is qualified" },
      { href: "/specialisms/confidence", label: "Trainers who work well with beginners" },
    ],
  },
];

export const guideBy = (slug: string) => GUIDES.find((g) => g.slug === slug);
