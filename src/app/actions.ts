"use server";

import { submitListingRequest } from "@/lib/trainers";

export type RequestState = { ok?: boolean; error?: string };

export async function sendListingRequest(_prev: RequestState, form: FormData): Promise<RequestState> {
  const kind = String(form.get("kind"));
  const email = String(form.get("email") ?? "").trim();
  if (!["claim", "removal", "correction"].includes(kind)) return { error: "Unknown request type." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (form.get("website")) return { ok: true }; // honeypot: silently drop bots
  return submitListingRequest({
    kind: kind as "claim" | "removal" | "correction",
    trainer_slug: String(form.get("listing") ?? "").trim() || undefined,
    requester_name: String(form.get("name") ?? "").trim(),
    requester_email: email,
    message: String(form.get("message") ?? "").trim().slice(0, 2000),
  });
}
