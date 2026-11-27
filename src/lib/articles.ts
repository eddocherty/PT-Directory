/**
 * The Articles section: practical pieces on choosing a trainer, plus softer features on training, running,
 * Pilates and how exercise fits into ordinary life. Plain UK English, general guidance only.
 *
 * House rules for every piece: no free workout plans (the structured plans are sold in the shop, so point
 * there instead), no prices, no invented quotes, experts or statistics, NHS or UK guidance where health is
 * involved, and at least two links to other pages on the site.
 *
 * To add a piece: copy one below, give it a new slug, set `status: "draft"` while it is being reviewed (drafts
 * only appear on preview links, never on the live site), then remove `status` to publish it.
 */
export const SECTIONS = [
  { slug: "choosing", name: "Choosing a trainer" },
  { slug: "training", name: "Training" },
  { slug: "running", name: "Running and athletics" },
  { slug: "pilates-yoga", name: "Pilates and yoga" },
  { slug: "nutrition", name: "Nutrition" },
  { slug: "body-mind", name: "Body and mind" },
] as const;
export type SectionSlug = (typeof SECTIONS)[number]["slug"];
export const sectionName = (slug: SectionSlug) => SECTIONS.find((x) => x.slug === slug)!.name;

export type Article = {
  slug: string;
  /** The search-friendly title, used for the browser tab and Google. */
  title: string;
  /** The punchier magazine headline shown on the page and in lists. Must stay true to the piece. */
  headline: string;
  /** One sentence for the meta description, the standfirst and the index. */
  summary: string;
  /** First published, and last properly revised. YYYY-MM-DD. */
  published: string;
  updated: string;
  section: SectionSlug;
  /** "draft" pieces show on preview links only. */
  status?: "draft";
  /** A shop plan (products.ts slug) to point to for readers who want something structured to follow. */
  shop?: string;
  /**
   * The cover photo, stored at public/articles/<slug>.jpg. Only free-licence stock (Unsplash or Pexels) or photos
   * we own, never images found through Google. `source` is the photo's page, kept as the licence record.
   */
  photo: { alt: string; credit: string; source: string };
  /** "The short version": three snappy takeaways, each already said in the piece. */
  quick: string[];
  /** One big-number callout, shown after section `at` (counted from 0). Only facts the piece itself states. */
  callout?: { at: number; big: string; text: string };
  sections: { heading: string; body: string[] }[];
  related: { href: string; label: string }[];
};

const ALL_ARTICLES: Article[] = [
  {
    slug: "personal-trainer-pt-private-trainer-names",
    title: "Personal trainer, PT or private trainer: what's the difference?",
    summary: "PT, 1-2-1 training, private trainer, mobile PT, coach, instructor: what each name usually means in the UK, and which one fits what you want.",
    updated: "2026-11-27",
    published: "2026-11-27",
    section: "choosing",
    headline: "PT, 1-2-1, private trainer, coach: the names decoded",
    photo: { alt: "A trainer kneels beside a client doing push-ups in a gym", credit: "Jonathan Borba", source: "https://unsplash.com/photos/woman-kneeling-beside-man-R0y_bEUjiOM" },
    quick: [
      "Personal trainer, PT and 1-2-1 training all mean much the same thing.",
      "What changes the price is where you train, who else is there and who the trainer works for.",
      "None of these titles is protected by law in the UK, so always ask about qualifications.",
    ],
    callout: { at: 5, big: "0", text: "of these job titles are protected by law in the UK" },
    sections: [
      {
        heading: "Mostly, they mean the same thing",
        body: [
          "Personal trainer, PT, personal training and one-to-one training all describe the same basic service: a trainer plans sessions around you, coaches you through them and keeps track of your progress. PT is simply the short form. Some people also say personal PT or private PT, which mean the same.",
          "The names start to matter when they tell you where you train, who else is in the session, and who the trainer works for. Those three things change the price and the feel of it far more than the label does.",
        ],
      },
      {
        heading: "1-2-1, one-to-one and small group",
        body: [
          "1-2-1 or one-to-one personal training means it is just you and the trainer for the whole session. It is the most flexible option and the most expensive per hour, because the trainer's time is all yours.",
          "Small group personal training, including bootcamps, puts a few people with one trainer. Each person gets less individual attention, but it costs less per session and some people find training with others keeps them going. Ask how many people are in a group, because small group can mean anything from three to twenty.",
          "Duo or partner training sits in between: two people, usually friends or a couple, sharing one trainer and splitting the cost.",
        ],
      },
      {
        heading: "Private trainer and gym PT",
        body: [
          "A private trainer or private PT is usually self-employed. They might rent space in a gym, run their own small studio, train people outdoors or come to your home. You book and pay them directly.",
          "Big gyms also employ or host trainers, and you normally need a membership there to train with them. We list independent trainers and small studios rather than big gym chains, so the trainers you find here run their own diaries and set their own way of working.",
        ],
      },
      {
        heading: "Mobile and home personal trainers",
        body: [
          "A mobile personal trainer comes to you, at home, in a park or at your workplace, and brings the equipment. It suits parents, people with busy jobs and anyone who would rather not go to a gym. Some charge a little more to cover travel, and ask how far they will go and how much space you need.",
        ],
      },
      {
        heading: "Online personal trainers",
        body: [
          "An online personal trainer coaches you remotely. That might be live video sessions, or a written plan in an app with check-ins each week. It usually costs less than in-person training and works wherever you live, but nobody is there to correct your form in the moment, so it suits people who already know the basics. Our guide to online and in-person training goes into this in more detail.",
        ],
      },
      {
        heading: "Coach, instructor and teacher",
        body: [
          "Coach often means someone who specialises: a strength coach, running coach or online coach. Instructor is common for Pilates and for gym staff, and teacher for yoga. A Level 2 gym instructor can supervise you in a gym, while a Level 3 personal trainer is qualified to write programmes and coach you one to one.",
          "None of these titles is protected by law in the UK, so whatever someone calls themselves, it is worth asking what qualifications and insurance they hold.",
        ],
      },
      {
        heading: "Which should you search for?",
        body: [
          "If you want someone's full attention and a plan built for you, look for 1-2-1 personal training near you. If cost matters most, try small group sessions or a bootcamp. If getting to a gym is the problem, search for a mobile trainer or an online coach. You can filter by all of these here, and every listing shows what that trainer offers.",
        ],
      },
    ],
    related: [
      { href: "/locations", label: "Personal trainers by town" },
      { href: "/specialisms/home-visits", label: "Mobile personal trainers" },
      { href: "/online", label: "Online personal trainers" },
      { href: "/specialisms/bootcamp", label: "Small group and bootcamps" },
    ],
  },
  {
    slug: "pilates-for-beginners",
    title: "Pilates for beginners: what happens at your first class",
    summary: "What a first Pilates class is like, the words instructors use, what to wear and bring, how often to go, and how to choose a class or instructor.",
    updated: "2026-11-26",
    published: "2026-11-26",
    section: "pilates-yoga",
    headline: "Your first Pilates class: the shaking is normal (and other things nobody tells you)",
    photo: { alt: "People stretching forward on mats in a studio", credit: "Christian Harb", source: "https://unsplash.com/photos/people-stretching-on-yoga-mats-in-a-studio-UGNGnSdEklQ" },
    quick: [
      "Mention any injury, pregnancy or recent birth on the health form, even if it seems minor.",
      "Small, slow movements are harder than they look. Shaking is normal; pain isn't.",
      "Once or twice a week is a good start.",
    ],
    callout: { at: 2, big: "45-60", text: "minutes: how long most Pilates classes last" },
    sections: [
      {
        heading: "What Pilates is",
        body: [
          "Pilates is a way of exercising that focuses on control, breathing and the deep muscles around your middle, hips and back. Movements are slow and precise rather than fast and sweaty. It suits most ages and fitness levels, because nearly every exercise has an easier and a harder version.",
          "You will usually choose between mat classes, done on the floor with your body weight, and reformer classes, done on a machine with springs. If you are not sure which, our guide to reformer and mat Pilates explains the difference.",
        ],
      },
      {
        heading: "Before your first class",
        body: [
          "Most instructors ask you to fill in a short health form. Mention any injuries, back or joint problems, recent surgery, pregnancy or a recent birth, even if they seem minor. Arrive five or ten minutes early so the instructor can talk to you and show you how to set up.",
          "Many reformer studios ask new clients to book an introduction class or a private session first. It is worth doing, because the machine takes a little getting used to.",
        ],
      },
      {
        heading: "What happens in the class",
        body: [
          "Classes usually last 45 to 60 minutes. Expect to start lying on your back, learning how to breathe and how to find a comfortable position for your spine. From there the class works through a series of exercises for your middle, legs, arms and back, often finishing with some stretching.",
          "It may feel gentle at first, and then surprisingly hard. Small, slow movements done properly ask a lot of muscles you don't often use. Shaking is normal. If something pinches or hurts, stop and tell the instructor, who should give you another option.",
        ],
      },
      {
        heading: "Words you might hear",
        body: [
          "Neutral spine means keeping the natural curves of your back, neither flattened nor arched. Imprint means gently pressing your lower back towards the mat. Your powerhouse, or centre, is the band of muscles around your middle, hips and lower back. Instructors also talk a lot about breathing in through the nose and out through the mouth to help you move with control.",
          "You don't need to know any of this before you go. A good instructor will explain each term the first time it comes up.",
        ],
      },
      {
        heading: "What to wear and bring",
        body: [
          "Wear close-fitting clothes you can move in, so the instructor can see your position. Most people do Pilates barefoot on a mat, and many reformer studios ask for grip socks, so check before you go. Bring water. Mat classes usually provide mats, but some people prefer to bring their own.",
        ],
      },
      {
        heading: "How often to go, and when you'll notice a difference",
        body: [
          "Once or twice a week is a good start. Many people say they feel steadier, stand taller or move more easily after a few weeks of regular classes, though it varies from person to person. Pilates works well alongside walking, running or strength training, and the UK Chief Medical Officers' guidelines suggest adults do some muscle-strengthening activity on at least two days a week.",
        ],
      },
      {
        heading: "Choosing a class or instructor",
        body: [
          "Pilates teacher isn't a protected title in the UK, so ask what training your instructor has done, how long the course was, and whether it covered mat, reformer or both. Ask how many people are in a class and whether there is a beginners' class. Smaller groups mean more help with your position.",
          "If you have a back problem, an injury, a long-term condition, or are pregnant or recently postnatal, start with one-to-one sessions or a small group, and check with your GP, midwife or physiotherapist first. Some instructors specialise in these groups and will say so.",
        ],
      },
    ],
    related: [
      { href: "/specialisms/pilates", label: "Pilates instructors near you" },
      { href: "/articles/reformer-vs-mat-pilates", label: "Reformer or mat Pilates?" },
    ],
  },
  {
    slug: "starting-with-a-personal-trainer-in-january",
    title: "Starting with a personal trainer in January: a realistic first 12 weeks",
    summary: "How to start training in the new year without burning out by February: what to expect month by month, how to set a goal you can keep, and when to book.",
    updated: "2026-11-24",
    published: "2026-11-24",
    section: "training",
    headline: "Why most January fitness plans are dead by February, and how to make yours last",
    photo: { alt: "Two people training with battle ropes in a gym", credit: "Meghan Holmes", source: "https://unsplash.com/photos/two-person-inside-gym-exercising-buWcS7G1_28" },
    quick: [
      "New year plans fail when they're built for the most motivated version of you.",
      "Pick one goal you can measure, like running 5k without stopping.",
      "Book in December: early morning and evening slots fill first.",
    ],
    callout: { at: 4, big: "150", text: "minutes of moderate activity a week, plus strength work on two days: the UK Chief Medical Officers' guideline" },
    shop: "beginner-gym-plan",
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
      { href: "/articles/how-often-should-you-see-a-personal-trainer", label: "How often should you see a trainer?" },
    ],
  },
  {
    slug: "bootcamps-and-small-group-training",
    title: "Bootcamps and small group training: what to expect and how to choose",
    summary: "What happens at an outdoor bootcamp or small group class, who it suits, how it differs from one-to-one training, and what to ask before you join.",
    updated: "2026-11-24",
    published: "2026-11-24",
    section: "training",
    headline: "Bootcamp isn't the army: what really happens at a group session in the park",
    photo: { alt: "A coach watches a group doing push-ups outdoors", credit: "Will Haddock", source: "https://unsplash.com/photos/trainer-watches-athletes-doing-push-ups-outdoors-JmtGnsl_NuE" },
    quick: [
      "A good bootcamp gives easier and harder versions of every exercise.",
      "Small group training sits between a bootcamp and one-to-one sessions.",
      "Ask what happens when it rains, gets dark early or the park is waterlogged.",
    ],
    callout: { at: 1, big: "2-8", text: "people: the usual size of a small group personal training session" },
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
      { href: "/articles/questions-to-ask-a-personal-trainer", label: "Questions to ask a trainer" },
    ],
  },
  {
    slug: "how-to-check-a-personal-trainer-is-qualified",
    title: "How to check a personal trainer is qualified",
    summary: "What a Level 3 qualification means, how to look a trainer up on the CIMSPA register, and the insurance they should hold.",
    updated: "2026-11-24",
    published: "2026-11-24",
    section: "choosing",
    headline: "Anyone can call themselves a personal trainer. Here's how to check yours is the real deal",
    photo: { alt: "A trainer watches a woman lift a barbell", credit: "Vitaly Gariev", source: "https://unsplash.com/photos/woman-lifting-weights-with-trainer-watching-rD0poLlu57M" },
    quick: [
      "Personal trainer isn't a protected title in the UK.",
      "Look for a Level 3 qualification, and search the CIMSPA directory.",
      "A self-employed trainer should have insurance and be happy to show it.",
    ],
    callout: { at: 1, big: "L3", text: "the Level 3 Diploma in Personal Training: the standard qualification to look for" },
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
      { href: "/articles/questions-to-ask-a-personal-trainer", label: "Questions to ask before your first session" },
      { href: "/trainers", label: "Search independent trainers" },
    ],
  },
  {
    slug: "pre-and-postnatal-personal-training",
    title: "Pre and postnatal personal training: what it is and when to start",
    summary: "What a pre and postnatal trainer does differently, when it is usually safe to start after birth, and what to ask them.",
    updated: "2026-11-24",
    published: "2026-11-24",
    section: "body-mind",
    headline: "Exercise while pregnant and after birth: what's safe, and when to start",
    photo: { alt: "A pregnant woman in a tank top, side on", credit: "Jeferson Santu", source: "https://unsplash.com/photos/a-pregnant-woman-in-black-pants-and-a-tan-tank-top-qH3kUl3JUxc" },
    quick: [
      "NHS guidance: if you were active before pregnancy, you can usually keep going and adjust as you go.",
      "After birth, your GP or midwife gives the go-ahead, not a trainer.",
      "Leaking, heaviness or doming down the middle of your stomach? Mention it at your check.",
    ],
    callout: { at: 2, big: "6-8", text: "weeks after birth: when most people have their postnatal check, before structured exercise" },
    shop: "postnatal-return-plan",
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
    published: "2026-11-24",
    section: "choosing",
    headline: "Online coach or someone in the room? The honest pros and cons",
    photo: { alt: "A woman stretches on a mat at home while watching a laptop", credit: "Vitaly Gariev", source: "https://unsplash.com/photos/woman-stretching-on-yoga-mat-watching-laptop-02_PUCjs7pw" },
    quick: [
      "Online coaching suits people who know the basics, train at odd hours or travel a lot.",
      "New, injured, pregnant or learning technical lifts? Someone in the room makes a real difference.",
      "Plenty of local trainers do both.",
    ],
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
    published: "2026-11-24",
    section: "choosing",
    headline: "Ten questions to ask a personal trainer before you hand over any money",
    photo: { alt: "A trainer and client go through a plan on a clipboard", credit: "Vitaly Gariev", source: "https://unsplash.com/photos/trainer-and-client-discussing-workout-plan-in-gym-6ESp0qoio_I" },
    quick: [
      "Ask about qualifications, insurance and who they usually train.",
      "Ask where sessions happen and whether you need your own gym membership.",
      "A good trainer will have plenty of questions for you too.",
    ],
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
      { href: "/articles/how-to-check-a-personal-trainer-is-qualified", label: "How to check a trainer is qualified" },
      { href: "/specialisms/confidence", label: "Trainers who work well with beginners" },
    ],
  },
  {
    slug: "how-to-choose-a-postnatal-personal-trainer",
    title: "How to choose a postnatal personal trainer",
    summary: "The qualifications, questions and warning signs to look for when you pick a trainer to help you get back to exercise after having a baby.",
    updated: "2026-11-24",
    published: "2026-11-24",
    section: "choosing",
    headline: "Choosing a postnatal trainer: the red flags to watch for",
    photo: { alt: "A woman and a small child exercising on mats in a living room", credit: "Vitaly Gariev", source: "https://unsplash.com/photos/a-woman-and-a-child-doing-yoga-in-a-living-room-lnQF8Z32VHE" },
    quick: [
      "Have your six to eight week check before you book anyone.",
      "Look for a specific pre and postnatal qualification on top of their main one.",
      "Be wary of anyone promising to get your body back by a deadline.",
    ],
    shop: "postnatal-return-plan",
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
      { href: "/articles/pre-and-postnatal-personal-training", label: "Pre and postnatal training: what it is and when to start" },
    ],
  },
  {
    slug: "reformer-vs-mat-pilates",
    title: "Reformer or mat Pilates: which should you choose?",
    summary: "How reformer and mat Pilates differ, what each one is good for, and how to pick a class or instructor if you are new to Pilates.",
    updated: "2026-11-24",
    published: "2026-11-24",
    section: "pilates-yoga",
    headline: "Reformer or mat Pilates? What those springs are really for",
    photo: { alt: "A leg extended on a Pilates reformer", credit: "Roxana Popovici", source: "https://unsplash.com/photos/woman-does-pilates-exercise-on-a-reformer-machine-aY5uOJ2o96g" },
    quick: [
      "Same method: mat uses your body weight, reformer uses springs and a sliding carriage.",
      "The springs can support you as well as add resistance.",
      "Mat classes are usually bigger, cheaper and easier to find.",
    ],
    callout: { at: 0, big: "1900s", text: "when Joseph Pilates developed the exercises both styles come from" },
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
    published: "2026-11-24",
    section: "training",
    headline: "Your first PT session: what really happens (it's gentler than you think)",
    photo: { alt: "A trainer watches a man do push-ups", credit: "Vitaly Gariev", source: "https://unsplash.com/photos/man-does-push-ups-with-woman-spotting-him-chXrzX3WjEw" },
    quick: [
      "You'll fill in a health form first, often called a PAR-Q.",
      "The first session is mostly talking and watching how you move.",
      "Stiff for a day or two is normal. Sharp pain, or pain in a joint, isn't.",
    ],
    callout: { at: 2, big: "45-60", text: "minutes: how long most personal training sessions last" },
    shop: "beginner-gym-plan",
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
      { href: "/articles/questions-to-ask-a-personal-trainer", label: "Questions to ask before your first session" },
      { href: "/specialisms/confidence", label: "Trainers who work well with beginners" },
    ],
  },
  {
    slug: "how-often-should-you-see-a-personal-trainer",
    title: "How often should you see a personal trainer?",
    summary: "How many sessions a week make sense for different goals and budgets, and how to keep progressing between sessions.",
    updated: "2026-11-24",
    published: "2026-11-24",
    section: "training",
    headline: "Once a week, three times, or once a month? How often you really need a PT",
    photo: { alt: "A row of dumbbells on a gym rack", credit: "Samuel Girven", source: "https://unsplash.com/photos/gym-dumbbells-on-rack-VJ2s0c20qCo" },
    quick: [
      "Once a week works well if you also train on your own.",
      "Two or three a week suits beginners, injury comebacks and big dates.",
      "Already training regularly? A check-in every two to four weeks can be enough.",
    ],
    callout: { at: 0, big: "150", text: "minutes of moderate activity a week, plus strength on two days: the NHS guideline for adults" },
    shop: "dumbbell-only-plan",
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
      { href: "/articles/online-vs-in-person-personal-training", label: "Online or in-person personal training?" },
      { href: "/specialisms/general-fitness", label: "Trainers for general fitness" },
    ],
  },
  {
    slug: "personal-training-for-over-50s",
    title: "Personal training for over-50s: what to look for",
    summary: "Why strength and balance work matters more as you get older, what a good trainer for over-50s does, and the questions to ask.",
    updated: "2026-11-24",
    published: "2026-11-24",
    section: "body-mind",
    headline: "Strong at 50, 60 and beyond: what to look for in a trainer",
    photo: { alt: "An older man and a younger man high-five in a sports hall", credit: "Centre for Ageing Better", source: "https://unsplash.com/photos/two-men-giving-each-other-a-high-five-indoors-oFQHh4jBREc" },
    quick: [
      "From middle age, people slowly lose muscle and bone strength unless they work to keep it.",
      "A good trainer focuses on everyday strength: chairs, shopping, stairs.",
      "It's never too late to start.",
    ],
    callout: { at: 0, big: "2", text: "days a week of strength and balance work: what NHS guidance recommends for older adults" },
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
  {
    slug: "how-parkrun-changed-saturday-mornings",
    title: "Thirteen runners and a stopwatch: how parkrun changed Saturday mornings",
    summary: "It started with a handful of club runners in a London park. Why a free, timed 5k became part of so many people's week, and where a running coach fits in.",
    published: "2026-11-27",
    updated: "2026-11-27",
    section: "running",
    headline: "Thirteen runners and a stopwatch: how parkrun took over Saturday mornings",
    photo: { alt: "A parkrun finish sign by the water", credit: "C", source: "https://unsplash.com/photos/finish-line-sign-at-a-parkrun-event-ed45rw905E8" },
    quick: [
      "parkrun began with 13 runners in Bushy Park, London, on 2 October 2004.",
      "It's free, weekly and timed, and you're allowed to walk.",
      "Want to go faster or further? That's where a running coach comes in.",
    ],
    callout: { at: 1, big: "5k", text: "free and timed, every Saturday morning. Walkers welcome" },
    shop: "first-half-marathon-plan",
    sections: [
      {
        heading: "A time trial in Bushy Park",
        body: [
          "On 2 October 2004, thirteen runners lined up in Bushy Park, in south-west London, for a free, timed 5k. It was organised by Paul Sinton-Hewitt, a club runner who was injured at the time and wanted a way to keep seeing his running friends. It was called the Bushy Park Time Trial. Nobody there was trying to start a movement.",
          "Two decades on, parkrun is the event that people who would never call themselves runners talk about on a Friday night. It has spread to parks, beaches and country estates across the UK and well beyond, and the basic idea has barely changed.",
        ],
      },
      {
        heading: "What actually happens",
        body: [
          "parkrun is a 5k on a Saturday morning, every week, in the same place. It is free. You register once online and bring your barcode, and your time is emailed to you afterwards. There is no entry fee, no medal and no prize, and the people in high-vis jackets pointing the way are volunteers, many of them runners taking a week off.",
          "You don't have to run. Walking is welcome, and every event has a volunteer tail walker who finishes last, so nobody else has to. On Sunday mornings there is also junior parkrun, a 2k for children aged 4 to 14.",
        ],
      },
      {
        heading: "Why it works",
        body: [
          "Most fitness advice is about effort. parkrun quietly gets the other things right. It is at the same time every week, so it becomes a habit rather than a decision. It costs nothing, so there is no barrier on a skint month. And it is social without being a club: you can turn up alone, speak to nobody and still feel part of something.",
          "It also changes what counts as success. Your finish time is yours, and the only person you are compared with is last week's you. For people coming back to exercise after a long break, a baby or an illness, that matters more than any training plan.",
        ],
      },
      {
        heading: "When you want more than Saturday",
        body: [
          "Plenty of people are happy with one parkrun a week, and that is a perfectly good reason to get up on a Saturday. Others get curious: about getting under 30 minutes, running a 10k, or entering a half marathon.",
          "That is the point where a running coach earns their place. A good coach can look at how you run, spread your training so the miles go up without the niggles, and add the strength work that most runners skip. If something keeps hurting, they will also tell you when it is time to see a physio instead. Our running coaches are listed by town, and many coach online.",
        ],
      },
      {
        heading: "If you are thinking of trying it",
        body: [
          "Find your nearest event on the parkrun website, register, and print or save your barcode. Arrive ten minutes early for the first-timers' briefing, start near the back, and walk whenever you need to. If you have a heart condition, are pregnant or are recovering from an injury or illness, check with your GP first.",
        ],
      },
    ],
    related: [
      { href: "/specialisms/running", label: "Running coaches" },
      { href: "/online", label: "Online coaches" },
      { href: "/articles/starting-with-a-personal-trainer-in-january", label: "Starting with a trainer in January" },
    ],
  },
  {
    slug: "training-through-a-british-winter",
    title: "Dark mornings, cold hands: keeping going through a British winter",
    summary: "Why routines slip between November and February, and the small, unglamorous changes that keep people training until the evenings get light again.",
    published: "2026-11-27",
    updated: "2026-11-27",
    section: "training",
    headline: "Dark mornings, cold hands: how to keep training until spring",
    photo: { alt: "Snow falling on a city park at night", credit: "Evan Wise", source: "https://unsplash.com/photos/a-woman-is-walking-through-the-snow-at-night-SBVWM7Ysmes" },
    quick: [
      "The winter slump is normal: you're reacting to cold, dark and tired.",
      "Make training easy to start, and lower the bar for what counts.",
      "Be seen, stick to lit routes and move indoors when it's icy.",
    ],
    callout: { at: 4, big: "10µg", text: "of vitamin D a day in autumn and winter: what the NHS advises everyone to consider" },
    shop: "dumbbell-only-plan",
    sections: [
      {
        heading: "The slump is normal",
        body: [
          "Once the clocks go back at the end of October, the day shrinks at both ends. The run you did after work in September now happens in the dark, the morning session means scraping the car, and the sofa makes a very good argument. If your routine has wobbled, you are not lacking willpower. You are reacting sensibly to cold, dark and tired.",
          "The trick most trainers use with their clients is not to fight winter head on. It is to make training easier to start, and to lower the bar for what counts.",
        ],
      },
      {
        heading: "Make it easier to start",
        body: [
          "Lay your kit out the night before. Book sessions as fixed appointments rather than hoping you will feel like it. Move a session to lunchtime, when there is still daylight. Short, regular sessions beat long ones you keep cancelling.",
          "It helps to have somewhere to go that isn't outside. A trainer who comes to your home, or an online coach who sets you sessions you can do in the living room, takes the weather out of the decision.",
        ],
      },
      {
        heading: "Lower the bar for what counts",
        body: [
          "The UK Chief Medical Officers' guidelines suggest adults aim for around 150 minutes of moderate activity a week, such as brisk walking, plus muscle-strengthening activity on at least two days. That can be broken into small pieces. A 20-minute walk at lunch and two short strength sessions at home is a respectable winter week.",
          "Think of winter as a season for keeping what you have built, not for personal bests. Spring is much more pleasant if you arrive at it still in the habit.",
        ],
      },
      {
        heading: "If you train outside",
        body: [
          "Be seen: wear something bright or reflective and carry a light if you run or cycle in the dark. Stick to lit, familiar routes, and switch to an indoor session when paths are icy. Dress in layers you can take off, and spend a few extra minutes warming up, because cold muscles take longer to get going.",
          "Cold air can set off symptoms for some people with asthma, so if that is you, follow the advice from your GP or asthma nurse and carry your reliever inhaler.",
        ],
      },
      {
        heading: "Look after the basics",
        body: [
          "Winter training is easier when the rest of life is in decent shape. Sleep, a proper meal before an evening session and a warm drink afterwards all make it more likely you will go again. The NHS also advises that everyone consider taking a daily vitamin D supplement of 10 micrograms in autumn and winter, when there isn't enough sunlight for the body to make its own.",
        ],
      },
    ],
    related: [
      { href: "/specialisms/home-visits", label: "Trainers who come to your home" },
      { href: "/online", label: "Online coaches" },
      { href: "/specialisms/bootcamp", label: "Outdoor bootcamps" },
    ],
  },
];

/** Drafts show on preview links (and locally) so ed can read them, never on the live site. */
const SHOW_DRAFTS = process.env.VERCEL_ENV !== "production";

/** Every live article, newest first. */
export const ARTICLES: Article[] = ALL_ARTICLES.filter((a) => SHOW_DRAFTS || a.status !== "draft").sort(
  (a, b) => b.published.localeCompare(a.published) || ALL_ARTICLES.indexOf(a) - ALL_ARTICLES.indexOf(b),
);

/** Live articles that search engines should know about (no drafts, even on previews). */
export const PUBLISHED_ARTICLES = ARTICLES.filter((a) => a.status !== "draft");

export const articleBy = (slug: string) => ARTICLES.find((g) => g.slug === slug);

export const articlesIn = (section: SectionSlug) => ARTICLES.filter((a) => a.section === section);

export const dateLabel = (iso: string, short = false) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: short ? "short" : "long", year: "numeric", timeZone: "UTC" });

/** Specialisms (and "online" / "home-visits") each guide is most useful for. Drives "keep reading" panels. */
const ARTICLE_TOPICS: Record<string, string[]> = {
  "how-parkrun-changed-saturday-mornings": ["running", "endurance", "general-fitness"],
  "training-through-a-british-winter": ["home-visits", "online", "general-fitness"],
  "pilates-for-beginners": ["pilates", "confidence", "mobility", "flexibility"],
  "personal-trainer-pt-private-trainer-names": ["general-fitness", "home-visits", "bootcamp", "online"],
  "starting-with-a-personal-trainer-in-january": ["confidence", "general-fitness", "weight-loss"],
  "bootcamps-and-small-group-training": ["bootcamp", "hiit", "functional", "crossfit"],
  "how-to-check-a-personal-trainer-is-qualified": [],
  "pre-and-postnatal-personal-training": ["pre-post-natal"],
  "online-vs-in-person-personal-training": ["online"],
  "questions-to-ask-a-personal-trainer": ["confidence"],
  "how-to-choose-a-postnatal-personal-trainer": ["pre-post-natal"],
  "reformer-vs-mat-pilates": ["pilates", "yoga", "mobility", "flexibility"],
  "what-happens-in-a-personal-training-session": ["confidence", "strength", "general-fitness"],
  "how-often-should-you-see-a-personal-trainer": ["general-fitness", "muscle-gain", "weight-loss", "strength"],
  "personal-training-for-over-50s": ["older-adults", "rehab", "home-visits"],
};

export const articleTopics = (slug: string) => ARTICLE_TOPICS[slug] ?? [];

/** The articles that best fit a set of specialisms, best match first; general articles fill any gaps. */
export function articlesForTopics(topics: string[], n = 2, exclude?: string): Article[] {
  const fallback = ["questions-to-ask-a-personal-trainer", "how-to-check-a-personal-trainer-is-qualified", "what-happens-in-a-personal-training-session"];
  return ARTICLES.filter((g) => g.slug !== exclude)
    .map((g, i) => ({ g, i, score: articleTopics(g.slug).filter((t) => topics.includes(t)).length * 10 - (fallback.includes(g.slug) ? 0 : 1) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, n)
    .map((x) => x.g);
}

/** The guide after this one, going round in a loop, so every guide ends with somewhere to go next. */
export function nextArticle(slug: string): Article {
  const pool = ARTICLES.filter((g) => g.status !== "draft" || g.slug === slug);
  const i = pool.findIndex((g) => g.slug === slug);
  return pool[(i + 1) % pool.length];
}

/** Rough reading time for a guide, in minutes. */
export function readingMinutes(g: Article): number {
  const words = [g.summary, ...g.sections.flatMap((s) => [s.heading, ...s.body])].join(" ").split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}
