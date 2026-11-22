export type Option = { slug: string; name: string };

export const TRAINING_STYLES: Option[] = [
  { slug: "strength", name: "Strength training" },
  { slug: "bodybuilding", name: "Bodybuilding" },
  { slug: "powerlifting", name: "Powerlifting" },
  { slug: "hiit", name: "HIIT" },
  { slug: "crossfit", name: "CrossFit style" },
  { slug: "boxing", name: "Boxing & combat" },
  { slug: "yoga", name: "Yoga" },
  { slug: "pilates", name: "Pilates" },
  { slug: "kettlebells", name: "Kettlebells" },
  { slug: "calisthenics", name: "Calisthenics" },
  { slug: "running", name: "Running coaching" },
  { slug: "functional", name: "Functional training" },
  { slug: "bootcamp", name: "Outdoor bootcamp" },
  { slug: "mobility", name: "Mobility & stretching" },
];

export const FITNESS_GOALS: Option[] = [
  { slug: "weight-loss", name: "Weight loss" },
  { slug: "muscle-gain", name: "Muscle gain" },
  { slug: "general-fitness", name: "General fitness" },
  { slug: "sports-performance", name: "Sports performance" },
  { slug: "rehab", name: "Injury rehab" },
  { slug: "pre-post-natal", name: "Pre & post natal" },
  { slug: "older-adults", name: "Older adults" },
  { slug: "flexibility", name: "Flexibility" },
  { slug: "endurance", name: "Endurance" },
  { slug: "competition-prep", name: "Competition prep" },
  { slug: "confidence", name: "Beginners & confidence" },
];

export const GENDERS: Option[] = [
  { slug: "female", name: "Female" },
  { slug: "male", name: "Male" },
  { slug: "non-binary", name: "Non-binary" },
];

export const RADII = [5, 10, 25, 50];

export type City = { slug: string; name: string; region: string; lat: number; lng: number };

export const CITIES: City[] = [
  { slug: "london", name: "London", region: "London", lat: 51.5074, lng: -0.1278 },
  { slug: "manchester", name: "Manchester", region: "North West", lat: 53.4808, lng: -2.2426 },
  { slug: "birmingham", name: "Birmingham", region: "West Midlands", lat: 52.4862, lng: -1.8904 },
  { slug: "leeds", name: "Leeds", region: "Yorkshire", lat: 53.8008, lng: -1.5491 },
  { slug: "glasgow", name: "Glasgow", region: "Scotland", lat: 55.8642, lng: -4.2518 },
  { slug: "edinburgh", name: "Edinburgh", region: "Scotland", lat: 55.9533, lng: -3.1883 },
  { slug: "liverpool", name: "Liverpool", region: "North West", lat: 53.4084, lng: -2.9916 },
  { slug: "bristol", name: "Bristol", region: "South West", lat: 51.4545, lng: -2.5879 },
  { slug: "cardiff", name: "Cardiff", region: "Wales", lat: 51.4816, lng: -3.1791 },
  { slug: "belfast", name: "Belfast", region: "Northern Ireland", lat: 54.5973, lng: -5.9301 },
  { slug: "newcastle", name: "Newcastle", region: "North East", lat: 54.9783, lng: -1.6178 },
  { slug: "sheffield", name: "Sheffield", region: "Yorkshire", lat: 53.3811, lng: -1.4701 },
  { slug: "nottingham", name: "Nottingham", region: "East Midlands", lat: 52.9548, lng: -1.1581 },
  { slug: "brighton", name: "Brighton", region: "South East", lat: 50.8225, lng: -0.1372 },
];

export const nameFor = (list: Option[], slug: string) =>
  list.find((o) => o.slug === slug)?.name ?? slug;

export const SPORTS: Option[] = [
  { slug: "running", name: "Running" },
  { slug: "marathon", name: "Marathon" },
  { slug: "triathlon", name: "Triathlon" },
  { slug: "hyrox", name: "HYROX" },
  { slug: "cycling", name: "Cycling" },
  { slug: "swimming", name: "Swimming" },
  { slug: "football", name: "Football" },
  { slug: "rugby", name: "Rugby" },
  { slug: "golf", name: "Golf" },
  { slug: "tennis", name: "Tennis" },
  { slug: "boxing", name: "Boxing" },
  { slug: "martial-arts", name: "Martial arts" },
  { slug: "climbing", name: "Climbing" },
  { slug: "skiing", name: "Skiing" },
  { slug: "surfing", name: "Surfing" },
  { slug: "powerlifting-comp", name: "Competitive powerlifting" },
  { slug: "bodybuilding-comp", name: "Bodybuilding shows" },
  { slug: "crossfit-comp", name: "CrossFit competitions" },
];
