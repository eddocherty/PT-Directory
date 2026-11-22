"use client";

import { Fragment, useActionState } from "react";
import { submitReviewAction, type RequestState } from "@/app/actions";

export function ReviewForm({ slug, firstName }: { slug: string; firstName: string }) {
  const [state, action, pending] = useActionState<RequestState, FormData>(submitReviewAction, {});
  if (state.ok)
    return <p className="rounded-2xl bg-soft p-4 text-sm">Thanks! Your review will appear once we’ve checked it.</p>;
  return (
    <form action={action} className="flex flex-col gap-3 text-sm">
      <input type="hidden" name="slug" value={slug} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="text-sm font-bold">How was training with {firstName}?</p>
      <div className="stars text-3xl" role="radiogroup" aria-label="Rating">
        {[5, 4, 3, 2, 1].map((n) => (
          <Fragment key={n}>
            <input type="radio" id={`star-${n}`} name="rating" value={n} className="sr-only" required />
            <label htmlFor={`star-${n}`} className="cursor-pointer" aria-label={`${n} stars`}>★</label>
          </Fragment>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Your name (shown)" className="input" aria-label="Your name" />
        <input name="email" type="email" required placeholder="Email (not shown)" className="input" aria-label="Email" />
      </div>
      <textarea name="body" rows={3} className="input" placeholder="What was it like?" />
      {state.error && <p className="font-semibold text-accent">{state.error}</p>}
      <button disabled={pending} className="btn-dark self-start">{pending ? "Sending…" : "Post review"}</button>
    </form>
  );
}
