import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { initials, price } from "@/components/TrainerCard";
import { FITNESS_GOALS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";
import { getTrainer } from "@/lib/trainers";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTrainer((await params).slug);
  if (!t) return {};
  return {
    title: `${t.name}, personal trainer${t.city ? ` in ${t.city}` : ""}`,
    description: t.headline ?? undefined,
    robots: t.is_sample ? { index: false } : undefined,
  };
}

export default async function TrainerPage({ params }: Props) {
  const t = await getTrainer((await params).slug);
  if (!t) notFound();

  const contact = [
    t.website && { label: "Website", href: t.website },
    t.email && { label: "Email", href: `mailto:${t.email}` },
    t.phone && { label: "Phone", href: `tel:${t.phone}` },
    t.instagram && { label: "Instagram", href: `https://instagram.com/${t.instagram.replace(/^@/, "")}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[1fr_300px]">
      <article className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6">
        <header className="flex items-center gap-4">
          {t.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.image_url} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-2xl font-bold text-brand">
              {initials(t.name)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{t.name}</h1>
            {t.business_name && <p className="text-muted">{t.business_name}</p>}
            <p className="text-sm text-muted">{[t.postcode_district, t.city, t.region].filter(Boolean).join(", ")}</p>
            {t.claimed && <span className="chip mt-1">Verified by trainer</span>}
            {t.is_sample && <span className="mt-1 block text-xs italic text-muted">Example listing, not a real trainer</span>}
          </div>
        </header>

        {t.headline && <p className="text-lg">{t.headline}</p>}
        {t.bio && <p className="whitespace-pre-line text-sm leading-relaxed">{t.bio}</p>}

        <section>
          <h2 className="mb-2 font-semibold">Training styles</h2>
          <div className="flex flex-wrap gap-1.5">
            {t.styles.map((s) => (
              <Link key={s} href={`/trainers?style=${s}`} className="chip">{nameFor(TRAINING_STYLES, s)}</Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-2 font-semibold">Helps with</h2>
          <div className="flex flex-wrap gap-1.5">
            {t.goals.map((g) => (
              <Link key={g} href={`/trainers?goal=${g}`} className="rounded-full border border-line px-2.5 py-0.5 text-xs">
                {nameFor(FITNESS_GOALS, g)}
              </Link>
            ))}
          </div>
        </section>
        {t.qualifications.length > 0 && (
          <section>
            <h2 className="mb-2 font-semibold">Qualifications</h2>
            <ul className="list-disc pl-5 text-sm">
              {t.qualifications.map((q) => <li key={q}>{q}</li>)}
            </ul>
          </section>
        )}
      </article>

      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border border-line bg-surface p-5 text-sm">
          <p className="text-xl font-bold">{price(t)}</p>
          <p className="text-muted">per session</p>
          <ul className="mt-3 flex flex-col gap-1">
            <li>{t.in_person ? "✓" : "✗"} In-person sessions</li>
            <li>{t.online ? "✓" : "✗"} Online coaching</li>
            <li>{t.home_visits ? "✓" : "✗"} Home visits</li>
            {t.years_experience != null && <li>{t.years_experience} years’ experience</li>}
          </ul>
          {contact.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {contact.map((c) => (
                <a key={c.label} href={c.href} rel="nofollow noopener" target="_blank" className="btn">{c.label}</a>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 text-xs text-muted">
          {t.source_url ? (
            <p>Listing compiled from <a href={t.source_url} rel="nofollow noopener" className="underline">public business information</a>.</p>
          ) : (
            <p>Listing compiled from public business information.</p>
          )}
          <p className="mt-2">
            Is this you?{" "}
            <Link href={`/for-trainers?listing=${t.slug}`} className="text-brand underline">Claim or correct this profile</Link>{" "}
            or <Link href={`/remove?listing=${t.slug}`} className="text-brand underline">ask us to remove it</Link>.
          </p>
        </div>
      </aside>
    </div>
  );
}
