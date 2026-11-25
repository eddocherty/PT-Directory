"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState } from "react";
import { requestSampleAction, type SampleState } from "@/app/actions";

/** "Try before you buy": email in, sample pages of the plan out. */
export function FreeSample({ slug, name, compact = false }: { slug: string; name: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<SampleState, FormData>(requestSampleAction, {});
  const path = usePathname();
  if (state.ok)
    return (
      <div className={` bg-zap ${compact ? "p-5" : "p-6"}`}>
        <p className="display text-2xl">Your sample is ready</p>
        <p className="mt-1 text-sm text-muted">The cover, the safety page and a full page from inside {name}.</p>
        <a href={`/free/${slug}-sample.pdf`} download className="btn mt-4">Download the free sample (PDF)</a>
      </div>
    );
  return (
    <form action={action} className={` border border-line ${compact ? "p-5" : "p-6"}`}>
      <p className="display text-2xl">Try a few pages free</p>
      <p className="mt-1 text-sm text-muted">Pop in your email and download sample pages from {name} straight away, so you can see exactly what you’d be buying.</p>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="path" value={path ?? ""} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input name="email" type="email" required placeholder="Your email" aria-label="Your email" autoComplete="email" className="input flex-1 text-base" />
        <button disabled={pending} className="btn whitespace-nowrap">{pending ? "One moment…" : "Send me the sample"}</button>
      </div>
      <label className="mt-3 flex items-start gap-3 text-xs text-muted">
        <input type="checkbox" name="marketing" value="yes" className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
        <span>Also email me now and then about new plans and guides. Unsubscribe any time.</span>
      </label>
      {state.error && <p className="mt-2 text-sm font-semibold text-red-700">{state.error}</p>}
      <p className="mt-2 text-xs text-muted">We only email you if you tick the box. <Link href="/privacy" className="underline">Privacy</Link></p>
    </form>
  );
}
