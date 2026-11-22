"use server";

import { sendEnquiry, submitListingRequest, submitReview } from "@/lib/trainers";

export type RequestState = { ok?: boolean; error?: string };

export async function sendListingRequest(_prev: RequestState, form: FormData): Promise<RequestState> {
  const kind = String(form.get("kind"));
  const email = String(form.get("email") ?? "").trim();
  if (!["removal", "correction"].includes(kind)) return { error: "Unknown request type." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (form.get("website")) return { ok: true }; // honeypot: silently drop bots
  return submitListingRequest({
    kind: kind as "removal" | "correction",
    trainer_slug: String(form.get("listing") ?? "").trim() || undefined,
    requester_name: String(form.get("name") ?? "").trim(),
    requester_email: email,
    message: String(form.get("message") ?? "").trim().slice(0, 2000),
  });
}

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function sendEnquiryAction(_prev: RequestState, form: FormData): Promise<RequestState> {
  if (form.get("website")) return { ok: true };
  const name = str(form, "name", 120);
  const email = str(form, "email", 200);
  if (!name) return { error: "Please tell the trainer your name." };
  if (!EMAIL.test(email)) return { error: "Please enter a valid email address." };
  return sendEnquiry({
    slug: str(form, "slug", 200), name, email, phone: str(form, "phone", 40), goal: str(form, "goal", 80), message: str(form, "message"),
  });
}

export async function submitReviewAction(_prev: RequestState, form: FormData): Promise<RequestState> {
  if (form.get("website")) return { ok: true };
  const rating = Number(form.get("rating"));
  const author_name = str(form, "name", 80);
  const author_email = str(form, "email", 200);
  if (!(rating >= 1 && rating <= 5)) return { error: "Pick a star rating." };
  if (!author_name) return { error: "Please add your name." };
  if (!EMAIL.test(author_email)) return { error: "Please enter a valid email address. We won’t show it." };
  return submitReview({ slug: str(form, "slug", 200), author_name, author_email, rating, body: str(form, "body") });
}
