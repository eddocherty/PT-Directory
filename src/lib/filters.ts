import type { SearchFilters } from "./trainers";

export type RawParams = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : []).flatMap((s) => s.split(",")).filter(Boolean);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Parse URL search params into filters (location is geocoded separately). */
export function parseFilters(p: RawParams): SearchFilters & { location?: string } {
  return {
    location: one(p.location)?.trim(),
    radius: num(p.radius) ?? 25,
    styles: list(p.style),
    goals: list(p.goal),
    online: one(p.online) === "1" ? true : undefined,
    homeVisits: one(p.home) === "1" ? true : undefined,
    maxPrice: num(p.maxPrice),
    gender: one(p.gender),
    q: one(p.q)?.trim(),
    page: num(p.page) ?? 1,
  };
}

export function toQuery(p: RawParams, overrides: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (k in overrides) continue;
    for (const item of Array.isArray(v) ? v : v ? [v] : []) qs.append(k, item);
  }
  for (const [k, v] of Object.entries(overrides)) if (v) qs.set(k, v);
  return qs.toString();
}
