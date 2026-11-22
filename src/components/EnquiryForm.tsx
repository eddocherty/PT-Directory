"use client";

import { useActionState } from "react";
import { sendEnquiryAction, type RequestState } from "@/app/actions";
import { FITNESS_GOALS } from "@/lib/taxonomy";

export function EnquiryForm({ slug, firstName, freeConsult }: { slug: string; firstName: string; freeConsult: boolean }) {
  const [state, action, pending] = useActionState<RequestState, FormData>(sendEnquiryAction, {});
  if (state.ok)
    return (
      <div className="rounded-2xl bg-zap p-5 text-ink">
        <p className="display text-2xl">Message sent!</p>
        <p className="mt-1 text-sm">{firstName} will get back to you by email. Time to get those trainers on.</p>
      </div>
    );
  return (
    <form action={action} className="flex flex-col gap-3 text-sm">
      <input type="hidden" name="slug" value={slug} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className="input" aria-label="Your name" />
        <input name="email" type="email" required placeholder="Email" className="input" aria-label="Email" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="phone" type="tel" placeholder="Phone (optional)" className="input" aria-label="Phone" />
        <select name="goal" className="input" aria-label="Your main goal" defaultValue="">
          <option value="">Your main goal</option>
          {FITNESS_GOALS.map((g) => <option key={g.slug} value={g.name}>{g.name}</option>)}
        </select>
      </div>
      <textarea name="message" rows={4} className="input" placeholder={`Tell ${firstName} a bit about you and what you want to achieve`} />
      {state.error && <p className="font-semibold text-accent">{state.error}</p>}
      <button disabled={pending} className="btn">
        {pending ? "Sending…" : freeConsult ? `Book a free consultation` : `Message ${firstName}`}
      </button>
    </form>
  );
}
