import Stripe from "stripe";

// Server-only. The secret key lives in Vercel env vars, never in the browser or the repo.
let client: Stripe | null = null;
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

export const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
export const ORDER_ID = /^[a-f0-9-]{36}$/;
