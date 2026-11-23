"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-3 text-sm">
      <label className="font-semibold" htmlFor="username">Admin ID</label>
      <input id="username" name="username" required autoComplete="username" defaultValue={state.username} className="input" />
      <label className="font-semibold" htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      {state.error && <p className="font-semibold text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn mt-2">{pending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
