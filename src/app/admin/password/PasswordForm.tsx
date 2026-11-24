"use client";

import Link from "next/link";
import { useActionState } from "react";
import { changePasswordAction, type PasswordState } from "../actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  if (state.ok)
    return (
      <div className="text-sm">
        <p className="display text-2xl">Password changed</p>
        <p className="mt-2">Use your new password next time you log in. Your admin ID hasn’t changed.</p>
        <Link href="/admin" className="btn mt-4">Back to the dashboard</Link>
      </div>
    );
  return (
    <form action={action} className="flex flex-col gap-3 text-sm">
      <input type="text" name="username" autoComplete="username" defaultValue="ed" className="hidden" aria-hidden tabIndex={-1} />
      <label className="font-semibold" htmlFor="current">Current password</label>
      <input id="current" name="current" type="password" required autoComplete="current-password" className="input" />
      <label className="font-semibold" htmlFor="next">New password (at least 10 characters)</label>
      <input id="next" name="next" type="password" required minLength={10} autoComplete="new-password" className="input" />
      <label className="font-semibold" htmlFor="confirm">New password again</label>
      <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" className="input" />
      {state.error && <p className="font-semibold text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn mt-2">{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}
