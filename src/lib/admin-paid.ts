import "server-only";
import { getAdminDb } from "./admin-db";

export type PaidRow = {
  id: string; slug: string; name: string; city: string | null; paid_since: string | null; paid_manual: boolean;
  status: string | null; current_period_end: string | null; cancel_at_period_end: boolean; updated_at: string | null; filled: number;
};
export type LooseSub = { id: string; email: string | null; name: string | null; status: string; created_at: string };
export type PickTrainer = { slug: string; name: string; city: string | null };

/** Everything the "Paid profiles" tab in /admin shows. */
export async function loadPaid(): Promise<{ paid: PaidRow[]; unlinked: LooseSub[]; ended: PaidRow[]; trainers: PickTrainer[] }> {
  const db = getAdminDb()!;
  const [subs, paidTrainers, profiles] = await Promise.all([
    db.from("subscriptions").select("id, trainer_id, email, name, status, current_period_end, cancel_at_period_end, created_at").order("created_at", { ascending: false }).limit(2000),
    db.from("trainers").select("id, slug, name, city, paid_since, paid_manual, is_paid").or("is_paid.eq.true,paid_manual.eq.true").limit(5000),
    db.from("paid_profiles").select("trainer_id, updated_at, about, gallery, videos, prices, workouts, sections, reviews").limit(5000),
  ]);
  if (subs.error) throw new Error(subs.error.message);
  const prof = new Map((profiles.data ?? []).map((p) => [p.trainer_id as string, p]));
  const filled = (id: string) => {
    const p = prof.get(id);
    if (!p) return 0;
    return [p.about, p.gallery?.length, p.videos?.length, p.prices?.length, p.workouts?.length, p.sections?.length, p.reviews?.length].filter(Boolean).length;
  };
  const latest = new Map<string, (typeof subs.data)[number]>();
  for (const s of subs.data ?? []) if (s.trainer_id && !latest.has(s.trainer_id)) latest.set(s.trainer_id, s);

  const paid: PaidRow[] = (paidTrainers.data ?? []).filter((t) => t.is_paid).map((t) => {
    const s = latest.get(t.id);
    return { id: t.id, slug: t.slug, name: t.name, city: t.city, paid_since: t.paid_since, paid_manual: t.paid_manual,
      status: s?.status ?? null, current_period_end: s?.current_period_end ?? null, cancel_at_period_end: s?.cancel_at_period_end ?? false,
      updated_at: (prof.get(t.id)?.updated_at as string | undefined) ?? null, filled: filled(t.id) };
  }).sort((a, b) => (b.paid_since ?? "").localeCompare(a.paid_since ?? ""));

  // Trainers who used to pay: their extras are kept, ready if they come back.
  const paidIds = new Set(paid.map((p) => p.id));
  const endedIds = [...latest.keys()].filter((id) => !paidIds.has(id));
  const { data: endedT } = endedIds.length
    ? await db.from("trainers").select("id, slug, name, city").in("id", endedIds.slice(0, 500))
    : { data: [] };
  const ended: PaidRow[] = (endedT ?? []).map((t) => {
    const s = latest.get(t.id)!;
    return { id: t.id, slug: t.slug, name: t.name, city: t.city, paid_since: null, paid_manual: false, status: s.status,
      current_period_end: s.current_period_end, cancel_at_period_end: s.cancel_at_period_end, updated_at: null, filled: filled(t.id) };
  });

  const unlinked = (subs.data ?? []).filter((s) => !s.trainer_id).map((s) => ({ id: s.id, email: s.email, name: s.name, status: s.status, created_at: s.created_at }));

  const trainers: PickTrainer[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("trainers").select("slug, name, city").eq("status", "published").order("name").range(from, from + 999);
    trainers.push(...((data ?? []) as PickTrainer[]));
    if (!data || data.length < 1000) break;
  }
  return { paid, unlinked, ended, trainers };
}
