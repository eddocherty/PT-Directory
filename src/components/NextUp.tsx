import Link from "next/link";
import { Arrow } from "./Arrow";
import { PlanCover } from "./PlanCover";
import { TrainerCard } from "./TrainerCard";
import Image from "next/image";
import { articleTopics, nextArticle, readingMinutes, sectionName, type Article } from "@/lib/articles";
import { formatPrice, pickPlan, type Product } from "@/lib/products";
import { FITNESS_GOALS, TRAINING_STYLES } from "@/lib/taxonomy";
import { topicBySlug } from "@/lib/topics";
import { cachedSearch, type SearchFilters } from "@/lib/trainers";

export function ArticleCard({ g, big = false }: { g: Article; big?: boolean }) {
  return (
    <Link href={`/articles/${g.slug}`} className={`group flex flex-col justify-between gap-4 border border-line bg-paper p-5 transition hover:border-ink ${big ? "sm:p-7" : ""}`}>
      <div>
        <div className={`relative -mx-5 -mt-5 mb-4 overflow-hidden bg-soft ${big ? "aspect-[2/1] sm:-mx-7 sm:-mt-7" : "aspect-[16/9]"}`}>
          <Image src={`/articles/${g.slug}.jpg`} alt="" fill sizes={big ? "(min-width: 1024px) 700px, 100vw" : "(min-width: 1024px) 400px, 50vw"} className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        </div>
        <p className="text-xs font-semibold text-accent">{sectionName(g.section)} · {readingMinutes(g)} min read</p>
        <p className={`display mt-2 group-hover:text-accent ${big ? "text-2xl sm:text-3xl" : "text-xl"}`}>{g.headline}</p>
        {big && <p className="mt-3 text-muted">{g.summary}</p>}
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-semibold">Read it <Arrow className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
    </Link>
  );
}

export function PlanCard({ p, eyebrow = "Start on your own" }: { p: Product; eyebrow?: string }) {
  return (
    <Link href={`/shop/${p.slug}`} className="group flex items-center gap-4 bg-zap p-5 transition hover:bg-[#d8e4fa]">
      <div className="w-20 shrink-0"><PlanCover p={p} className="transition group-hover:-translate-y-0.5" sizes="80px" /></div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-accent">{eyebrow}</p>
        <p className="display mt-1 text-xl">{p.name}</p>
        <p className="mt-1 text-sm text-muted">{p.short}, {formatPrice(p.price)}. Instant PDF, free sample pages.</p>
      </div>
    </Link>
  );
}

/** Turn a topic slug into search filters. */
export function filtersFor(topic: string | undefined): SearchFilters {
  if (!topic) return {};
  if (topic === "online") return { online: true };
  if (topic === "home-visits") return { homeVisits: true };
  if (TRAINING_STYLES.some((s) => s.slug === topic)) return { styles: [topic] };
  if (FITNESS_GOALS.some((g) => g.slug === topic)) return { goals: [topic] };
  return {};
}

export function topicHref(topic: string | undefined) {
  if (!topic) return "/trainers";
  if (topic === "online") return "/online";
  return topicBySlug(topic) ? `/specialisms/${topic}` : "/trainers";
}

/** End of an article: what to read next, trainers who fit the guide, and the plan that fits. No dead ends. */
export async function ArticleNextUp({ g }: { g: Article }) {
  const topics = articleTopics(g.slug);
  const main = topics[0];
  const plan = pickPlan(topics, topics);
  const next = nextArticle(g.slug);
  let trainers: Awaited<ReturnType<typeof cachedSearch>>["trainers"] = [];
  try {
    trainers = (await cachedSearch(filtersFor(main))).trainers.slice(0, 3);
  } catch {}
  const label = main === "online" ? "Online coaches" : main ? topicBySlug(main)?.people ?? "Trainers" : "Independent trainers";
  return (
    <section className="border-t border-line bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="eyebrow text-accent">Keep going</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <ArticleCard g={next} big />
          <PlanCard p={plan} eyebrow="Want a plan to follow?" />
        </div>
        {trainers.length > 0 && (
          <>
            <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
              <h2 className="display text-2xl sm:text-3xl">{label} to look at</h2>
              <Link href={topicHref(main)} className="btn-ghost">See them all</Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {trainers.map((t, i) => <div key={t.id} className={i === 2 ? "hidden lg:block" : ""}><TrainerCard t={t} /></div>)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
