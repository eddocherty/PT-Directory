"use client";

import { useActionState } from "react";
import { sendListingRequest, type RequestState } from "@/app/actions";

export function RequestForm({
  kind, listing, cta,
}: { kind: "claim" | "removal" | "correction"; listing?: string; cta: string }) {
  const [state, action, pending] = useActionState<RequestState, FormData>(sendListingRequest, {});
  if (state.ok)
    return (
      <p className="rounded-2xl bg-zap p-4 text-sm">
        Thanks. We’ve got your request and will reply by email, usually within 2 working days.
      </p>
    );
  return (
    <form action={action} className="flex flex-col gap-3 text-sm">
      <input type="hidden" name="kind" value={kind} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex flex-col gap-1">
        Listing link or name
        <input name="listing" defaultValue={listing} className="input" placeholder="e.g. /trainers/jane-smith-leeds" />
      </label>
      <label className="flex flex-col gap-1">
        Your name
        <input name="name" className="input" />
      </label>
      <label className="flex flex-col gap-1">
        Email address (required)
        <input name="email" type="email" required className="input" />
      </label>
      <label className="flex flex-col gap-1">
        Anything else we should know?
        <textarea name="message" rows={4} className="input" />
      </label>
      {state.error && <p className="font-semibold text-accent">{state.error}</p>}
      <button disabled={pending} className="btn self-start">{pending ? "Sending…" : cta}</button>
    </form>
  );
}
