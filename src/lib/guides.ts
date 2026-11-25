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
    slug: "starting-with-a-personal-trainer-in-january",
    title: "Starting with a personal trainer in January: a realistic first 12 weeks",
    summary: "How to start training in the new year without burning out by February: what to expect month by month, how to set a goal you can keep, and when to book.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "Why January plans fall apart",
        body: [
          "Most new year fitness plans don't fail because people are lazy. They fail because the plan is built for the most motivated version of you, the one who exists for about a fortnight. Five hard sessions a week, a strict diet and no rest days is a lot to fit around work, family and short, dark days.",
          "A trainer's real job in January is to slow you down a little: to build a routine you can still keep in March, when the motivation has worn off and the habit has to do the work.",
        ],
      },
      {
        heading: "Pick one goal you can measure",
        body: [
          "\"Get fit\" is hard to plan around. Something like \"squat my own body weight\", \"run 5k without stopping\", \"walk up the stairs at work without being out of breath\" or \"train twice a week until Easter\" gives you and your trainer something to work towards and a way to see progress.",
          "It is fine if your goal is about how you feel rather than how you look. Tell the trainer that at the start, so the plan fits.",
        ],
      },
      {
        heading: "Weeks 1 to 4: learn the basics",
        body: [
          "Expect the first month to feel easier than you thought. A good trainer will spend it teaching you a handful of movements (squatting, hinging, pushing, pulling and carrying) and finding a starting weight or level that leaves you with a bit in reserve.",
          "You will probably feel stiff for a day or two after the first few sessions. That usually settles as your body gets used to it. Sharp pain, or pain in a joint that doesn't go away, is different, so mention it.",
        ],
      },
      {
        heading: "Weeks 5 to 8: build the routine",
        body: [
          "By now the movements should feel familiar and your trainer should be adding a little each week: a bit more weight, an extra set, or a harder version of an exercise. This is also the point where most people start missing sessions, so it is worth agreeing fixed days and times that you treat like any other appointment.",
          "If you only see a trainer once a week, ask them for a short plan to do on your own on one other day. The UK Chief Medical Officers' guidelines suggest adults do muscle-strengthening activity on at least two days a week, alongside around 150 minutes of moderate activity such as brisk walking.",
        ],
      },
      {
        heading: "Weeks 9 to 12: check your progress",
        body: [
          "Around the three-month mark, sit down with your trainer and look back. Are you lifting more than in week one? Is the walk, run or flight of stairs easier? Are you still turning up? Use that to decide what comes next: the same goal with a harder target, a new goal, or fewer sessions with more training on your own.",
        ],
      },
      {
        heading: "When to book",
        body: [
          "Trainers are busiest in the first few weeks of January, and popular early morning and evening slots fill first. Getting in touch in December, even just to have a first conversation, gives you a better choice of times. If you start in mid-January or February instead, that is fine too. There is nothing special about the first of the month.",
        ],
      },
      {
        heading: "If you are new, older, pregnant or have a health condition",
        body: [
          "Tell the trainer before the first session. If you have a heart condition, high blood pressure, are pregnant or have recently given birth, or have had recent surgery, check with your GP or midwife first. Look for a trainer who lists the experience you need, such as working with beginners, older adults, or pre and postnatal clients.",
        ],
      },
    ],
    related: [
      { href: "/specialisms/confidence", label: "Trainers who work well with beginners" },
      { href: "/guides/how-often-should-you-see-a-personal-trainer", label: "How often should you see a trainer?" },
    ],
  },
  {
    slug: "bootcamps-and-small-group-training",
    title: "Bootcamps and small group training: what to expect and how to choose",
    summary: "What happens at an outdoor bootcamp or small group class, who it suits, how it differs from one-to-one training, and what to ask before you join.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "What a bootcamp actually is",
        body: [
          "A bootcamp is a group exercise class, usually outdoors in a park or on a playing field, run by a personal trainer. Sessions tend to last 45 minutes to an hour and mix bodyweight exercises, running or shuttle drills, and simple kit such as kettlebells, resistance bands or medicine balls.",
          "Despite the name, a well-run bootcamp shouldn't feel like the army. The trainer should give easier and harder versions of each exercise, so a beginner and a regular can work side by side.",
        ],
      },
      {
        heading: "Small group personal training",
        body: [
          "Small group personal training sits between a bootcamp and one-to-one sessions. Groups are usually somewhere between two and eight people, often indoors in a small studio, and the trainer has time to watch each person's technique and adjust weights for them. Some trainers let you bring a friend or partner to a one-to-one slot and split it between you.",
        ],
      },
      {
        heading: "Who group training suits",
        body: [
          "It suits people who enjoy training with others, find it easier to turn up when a group is expecting them, and want a trainer's structure without one-to-one costs. Lots of people also like being outside, especially in spring and summer.",
          "It is less suited to anyone who needs close individual attention: if you are coming back from an injury, are pregnant or recently postnatal, have a health condition, or want to learn technical lifts, a few one-to-one sessions first are usually a better start.",
        ],
      },
      {
        heading: "Questions to ask before you join",
        body: [
          "How many people are in a typical session, and is there a limit? Is there a trial session? What happens when it rains, gets dark early, or the park is waterlogged? Do they ask about your health and injuries before your first class? Are they qualified and insured, and do they carry a first aid kit?",
          "Ask what a typical week of sessions looks like, and whether the programme changes over time or repeats. Classes that build from one week to the next help you see progress.",
        ],
      },
      {
        heading: "Your first session",
        body: [
          "Arrive five or ten minutes early so the trainer can talk to you before it starts. Wear layers you can take off, trainers with a good grip (grass gets slippery), and bring water. In winter, a hat and gloves for the warm-up make a big difference. Take the easier option on everything the first time, then build up.",
        ],
      },
      {
        heading: "Outdoor training in the UK weather",
        body: [
          "Most outdoor groups run all year, but winter sessions are often shorter, move under cover or switch to an indoor space. Ask about lighting if sessions are early in the morning or after work, and how you will hear about cancellations.",
        ],
      },
    ],
    related: [
      { href: "/specialisms/bootcamp", label: "Outdoor bootcamps near you" },
      { href: "/guides/questions-to-ask-a-personal-trainer", label: "Questions to ask a trainer" },
    ],
  },
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
  {
    slug: "how-to-choose-a-postnatal-personal-trainer",
    title: "How to choose a postnatal personal trainer",
    summary: "The qualifications, questions and warning signs to look for when you pick a trainer to help you get back to exercise after having a baby.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "Start with your postnatal check",
        body: [
          "Before you book anyone, have your six to eight week check with your GP and mention any leaking, heaviness, pain or a gap down the middle of your stomach. A trainer is not the right person to clear you to exercise. Their job is to build on the go-ahead from your GP, midwife or a women's health physiotherapist.",
        ],
      },
      {
        heading: "The qualification to ask about",
        body: [
          "General personal training courses cover pregnancy only briefly. Look for a specific pre and postnatal exercise qualification, usually a Level 3 course from a recognised awarding body, taken on top of their main personal training qualification. Ask what it was called and roughly when they did it.",
          "Some trainers have also done extra courses on the pelvic floor, abdominal separation or return to running after birth. These are useful, but they don't replace a physiotherapist if you have symptoms.",
        ],
      },
      {
        heading: "What a good first session looks like",
        body: [
          "Expect plenty of questions: what kind of birth you had, how you are sleeping, whether you are feeding, and any symptoms you have noticed. A good trainer will usually start with breathing, pelvic floor and gentle strength work, then build up slowly over weeks and months.",
          "They should be happy to work around naps, feeds and cancelled sessions. Ask whether you can bring your baby, train at home, or join a buggy or small group class if that suits you better.",
        ],
      },
      {
        heading: "Signs to keep looking",
        body: [
          "Be wary of anyone promising to get your body back by a deadline, pushing very low calorie diets while you are recovering or feeding, or putting you straight back on running, jumping or heavy lifting without checking how your body is coping. If something leaks, aches or bulges during a session, a good trainer will stop, change the exercise and suggest you speak to a physiotherapist.",
        ],
      },
      {
        heading: "Questions to ask before you book",
        body: [
          "What pre and postnatal qualification do you hold? How do you check how my pelvic floor and stomach are coping? How would you progress me from the basics back to the training I used to do? Do you ever refer clients to a physiotherapist, and who do you work with locally?",
        ],
      },
    ],
    related: [
      { href: "/specialisms/pre-post-natal", label: "Pre and postnatal trainers across the UK" },
      { href: "/guides/pre-and-postnatal-personal-training", label: "Pre and postnatal training: what it is and when to start" },
    ],
  },
  {
    slug: "reformer-vs-mat-pilates",
    title: "Reformer or mat Pilates: which should you choose?",
    summary: "How reformer and mat Pilates differ, what each one is good for, and how to pick a class or instructor if you are new to Pilates.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "Same method, different equipment",
        body: [
          "Both come from the exercises Joseph Pilates developed in the early 1900s. Mat Pilates uses your body weight on a mat, sometimes with small equipment such as bands, balls or rings. Reformer Pilates uses a sliding carriage with springs and straps, so the instructor can make an exercise lighter or heavier by changing the springs.",
        ],
      },
      {
        heading: "What reformer is good for",
        body: [
          "The springs can support you as well as add resistance, which helps people who find some mat exercises hard to control. It often feels more like a strength workout, and many people like the variety. Classes are usually smaller because of the number of machines, and they tend to cost more per session.",
        ],
      },
      {
        heading: "What mat is good for",
        body: [
          "Mat work can be done anywhere, including at home between classes. It can be harder than it looks, because nothing is helping you. Classes are often bigger and cheaper, and they are widely run in community halls and leisure centres, so they are easier to fit around the week.",
        ],
      },
      {
        heading: "Classical, contemporary and studio equipment",
        body: [
          "Classical studios teach Joseph Pilates' original order of exercises, often on several pieces of equipment such as the tower, Cadillac and Wunda Chair. Contemporary classes adapt the method using modern exercise science. Neither is better. It comes down to the teaching and how you feel after a few sessions.",
        ],
      },
      {
        heading: "If you are new, injured or pregnant",
        body: [
          "Many reformer studios ask beginners to do an introduction or a private session first, which is worth doing. If you have an injury, a long-term condition or are pregnant, tell the instructor before you start. Some studios work alongside physiotherapists, and one-to-one sessions are often a better place to begin than a busy class.",
        ],
      },
    ],
    related: [
      { href: "/specialisms/pilates", label: "Pilates instructors across the UK" },
      { href: "/specialisms/flexibility", label: "Trainers for flexibility" },
    ],
  },
  {
    slug: "what-happens-in-a-personal-training-session",
    title: "What happens in a personal training session?",
    summary: "What to expect from your first session with a personal trainer, what a normal session looks like, and what to wear and bring.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "Before the first session",
        body: [
          "Most trainers will send you a health questionnaire, often called a PAR-Q, asking about medical conditions, injuries and medication. Answer it honestly. If you have a heart condition, high blood pressure, are pregnant or have had recent surgery, the trainer may ask you to check with your GP before you start.",
        ],
      },
      {
        heading: "The first session",
        body: [
          "The first session is usually lighter than people expect. You will talk about your goals, your week and what has or hasn't worked before. Then the trainer will watch you move: squatting, lunging, pushing, pulling and balancing. Some will take measurements, but you can say no to anything you aren't comfortable with.",
        ],
      },
      {
        heading: "A normal session",
        body: [
          "Most sessions last 45 to 60 minutes. A typical session starts with a warm-up, moves on to the main strength or fitness work, and finishes with a cool-down or some stretching. The trainer should explain why each exercise is there and adjust it if something hurts or feels too easy.",
          "Over the weeks, a good trainer will keep a record of what you lifted or did, so they can make it a little harder as you get stronger.",
        ],
      },
      {
        heading: "What to wear and bring",
        body: [
          "Wear comfortable clothes you can move in and trainers with a flat, grippy sole. Bring a water bottle and a small towel. Eat something light an hour or two before if you can, and tell the trainer if you feel dizzy or unwell at any point.",
        ],
      },
      {
        heading: "Feeling sore afterwards",
        body: [
          "It is normal to feel stiff a day or two after your first few sessions, especially in your legs. That usually eases within a few days and gets less as your body adapts. Sharp pain, or pain in a joint that doesn't go away, is different, so mention it to your trainer.",
        ],
      },
    ],
    related: [
      { href: "/guides/questions-to-ask-a-personal-trainer", label: "Questions to ask before your first session" },
      { href: "/specialisms/confidence", label: "Trainers who work well with beginners" },
    ],
  },
  {
    slug: "how-often-should-you-see-a-personal-trainer",
    title: "How often should you see a personal trainer?",
    summary: "How many sessions a week make sense for different goals and budgets, and how to keep progressing between sessions.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "What the guidelines say",
        body: [
          "NHS guidance for adults is at least 150 minutes of moderate activity a week, such as brisk walking, plus strength exercises on at least two days a week. A trainer doesn't have to supply all of that. Their sessions can be the backbone, with walking and some work on your own filling the rest.",
        ],
      },
      {
        heading: "Once a week",
        body: [
          "One session a week works well if you also train on your own. The trainer checks your technique, sets your plan for the week and makes things harder over time. It is the most common choice for people fitting training around work and family.",
        ],
      },
      {
        heading: "Twice or three times a week",
        body: [
          "Two or three sessions suit people who are brand new to exercise, coming back from an injury, or working towards a date such as a wedding, a race or an operation. You get more coaching and more accountability, though it costs more, so it is common to do this for a few months and then drop back.",
        ],
      },
      {
        heading: "Every few weeks",
        body: [
          "If you already train regularly, a session every two to four weeks can be enough to review your technique and update your programme. Online coaching, where a coach writes your plan and checks in each week, is another way to keep support going for less money.",
        ],
      },
      {
        heading: "Small group sessions",
        body: [
          "Small group personal training, usually with two to eight people, gives you a coach and a set time to turn up, at a lower price per session than one-to-one. It suits people who like company and don't need a fully individual plan.",
        ],
      },
    ],
    related: [
      { href: "/guides/online-vs-in-person-personal-training", label: "Online or in-person personal training?" },
      { href: "/specialisms/general-fitness", label: "Trainers for general fitness" },
    ],
  },
  {
    slug: "personal-training-for-over-50s",
    title: "Personal training for over-50s: what to look for",
    summary: "Why strength and balance work matters more as you get older, what a good trainer for over-50s does, and the questions to ask.",
    updated: "2026-11-24",
    sections: [
      {
        heading: "Why strength matters more with age",
        body: [
          "From middle age, people slowly lose muscle and bone strength unless they work to keep it. NHS guidance says older adults should do activities that build strength and improve balance and flexibility on at least two days a week, alongside regular moderate activity. It is never too late to start, and people often notice a difference within a few weeks.",
        ],
      },
      {
        heading: "What a good trainer does differently",
        body: [
          "A good trainer for older adults will start by asking about your health, medication, joints and any falls. They will build up gradually, include balance work, and focus on everyday strength: getting up from a chair, carrying shopping, climbing stairs and getting down to the floor and back up.",
          "Look for experience with conditions that become more common with age, such as arthritis, osteoporosis, high blood pressure or recovering from a joint replacement. Some trainers hold an extra qualification in exercise for older adults or exercise referral.",
        ],
      },
      {
        heading: "Where to train",
        body: [
          "A quiet private studio or home visits can feel more comfortable than a busy gym, especially at the start. Small group classes aimed at older adults are another good option, and some Pilates studios run seniors classes too.",
        ],
      },
      {
        heading: "Check with your GP if you need to",
        body: [
          "If you have a heart or lung condition, have had a fall, are recovering from surgery or have been told to be careful with exercise, speak to your GP first. They may be able to refer you to a local exercise referral scheme, and a trainer can work from their advice.",
        ],
      },
      {
        heading: "Questions to ask",
        body: [
          "Have you trained people my age before? How do you include balance work? What would you do differently because of my joints or condition? How will we know I am getting stronger?",
        ],
      },
    ],
    related: [
      { href: "/specialisms/older-adults", label: "Personal trainers for older adults" },
      { href: "/specialisms/home-visits", label: "Trainers who come to your home" },
    ],
  },
];

export const guideBy = (slug: string) => GUIDES.find((g) => g.slug === slug);
