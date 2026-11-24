"use client";

import { BRAND } from "@/brand";

import { Fragment, useMemo, useState } from "react";
import type { AdminTrainer } from "@/lib/admin-data";
import { saveTrainerOutreach } from "@/app/admin/actions";
import { TRAINING_STYLES, nameFor } from "@/lib/taxonomy";
import { downloadCsv } from "./csv";
import { OutreachEditor, Pipeline, StatusPill } from "./OutreachEditor";

const uniq = (xs: (string | null)[]) => [...new Set(xs.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
const SORTS = { name: "Name A–Z", views: "Most viewed", contacts: "Most contacted", city: "Town" } as const;

export function TrainerTable({ trainers, statuses }: { trainers: AdminTrainer[]; statuses: string[] }) {
  const [rows, setRows] = useState(trainers);
  const [q, setQ] = useState("");
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [style, setStyle] = useState("");
  const [listing, setListing] = useState("published");
  const [outreach, setOutreach] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sort, setSort] = useState<keyof typeof SORTS>("name");
  const [open, setOpen] = useState<string | null>(null);
  const [limit, setLimit] = useState(100);

  const counties = useMemo(() => uniq(rows.map((t) => t.county)), [rows]);
  const cities = useMemo(() => uniq(rows.filter((t) => !county || t.county === county).map((t) => t.city)), [rows, county]);

  const base = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((t) =>
      (listing === "all" ? true : listing === "sample" ? t.is_sample : t.status === listing && !t.is_sample) &&
      (!county || t.county === county) && (!city || t.city === city) && (!style || t.styles.includes(style)) &&
      (!onlineOnly || t.online) &&
      (!s || [t.name, t.business_name, t.city, t.county, t.website, t.postcode_district].some((v) => v?.toLowerCase().includes(s))));
  }, [rows, q, county, city, style, listing, onlineOnly]);

  const filtered = useMemo(() => {
    const out = base.filter((t) => !outreach || t.outreach_status === outreach);
    const cmp: Record<keyof typeof SORTS, (a: AdminTrainer, b: AdminTrainer) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      views: (a, b) => b.views - a.views || b.contacts - a.contacts,
      contacts: (a, b) => b.contacts - a.contacts || b.views - a.views,
      city: (a, b) => (a.city ?? "").localeCompare(b.city ?? "") || a.name.localeCompare(b.name),
    };
    return out.sort(cmp[sort]);
  }, [base, outreach, sort]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach((t) => m.set(t.outreach_status, (m.get(t.outreach_status) ?? 0) + 1));
    return m;
  }, [base]);

  const exportCsv = () =>
    downloadCsv(`${BRAND.slug}-trainers-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Name", "Business", "Town", "County", "Postcode district", "Specialisms", "Online", "Website", "Email", "Phone", "Instagram", "Profile", "Listing status", "Profile views", "Contact clicks", "Outreach status", "Last contacted", "Notes"],
      filtered.map((t) => [t.name, t.business_name, t.city, t.county, t.postcode_district, t.styles.map((s) => nameFor(TRAINING_STYLES, s)).join("; "),
        t.online ? "Yes" : "No", t.website, t.email, t.phone, t.instagram, `${location.origin}/trainers/${t.slug}`, t.status, t.views, t.contacts, t.outreach_status, t.last_contacted, t.notes]));

  return (
    <div className="flex flex-col gap-4">
      <Pipeline statuses={statuses} counts={counts} active={outreach} onPick={setOutreach} />
      <div className="grid gap-2 rounded-3xl bg-paper p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <input className="input lg:col-span-2" placeholder="Search name, business, town, website…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={county} onChange={(e) => { setCounty(e.target.value); setCity(""); }}>
          <option value="">All counties</option>{counties.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All towns</option>{cities.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>
          <option value="">All specialisms</option>{TRAINING_STYLES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
        <select className="input" value={listing} onChange={(e) => setListing(e.target.value)}>
          <option value="published">Live listings</option><option value="hidden">Hidden</option><option value="removed">Removed</option>
          <option value="sample">Sample (fake) trainers</option><option value="all">Everything</option>
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)}>
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v}</option>)}
        </select>
        <label className="flex items-center gap-2 px-2"><input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} /> Online coaching only</label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p><strong>{filtered.length.toLocaleString("en-GB")}</strong> trainers</p>
        <button type="button" onClick={exportCsv} className="btn px-4 py-2">Download CSV</button>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-paper">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr className="border-b border-line">
              <th className="p-3">Trainer</th><th className="p-3">Town</th><th className="p-3">County</th><th className="p-3">Specialisms</th>
              <th className="p-3">Contact</th><th className="p-3 text-right">Views</th><th className="p-3 text-right">Contacts</th><th className="p-3">Outreach</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.slice(0, limit).map((t) => (
              <Fragment key={t.id}>
                <tr className={`cursor-pointer align-top hover:bg-soft ${open === t.id ? "bg-soft" : ""}`} onClick={() => setOpen(open === t.id ? null : t.id)}>
                  <td className="p-3">
                    <p className="font-semibold">{t.name}</p>
                    {t.business_name && t.business_name !== t.name && <p className="text-xs text-muted">{t.business_name}</p>}
                    {t.status !== "published" && <p className="text-xs font-semibold text-red-700">{t.status}</p>}
                  </td>
                  <td className="p-3">{t.city}{t.postcode_district && <span className="text-xs text-muted"> {t.postcode_district}</span>}</td>
                  <td className="p-3">{t.county}</td>
                  <td className="p-3 text-xs">{t.styles.slice(0, 3).map((s) => nameFor(TRAINING_STYLES, s)).join(", ")}{t.styles.length > 3 && ` +${t.styles.length - 3}`}{t.online && <span className="ml-1 rounded-full bg-zap px-2 text-accent">online</span>}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                      {t.website && <a className="rounded-full bg-ink px-2.5 py-1 text-paper hover:bg-accent" href={t.website} target="_blank" rel="noopener noreferrer">Website</a>}
                      {t.email && <a className="rounded-full bg-ink px-2.5 py-1 text-paper hover:bg-accent" href={`mailto:${t.email}`}>Email</a>}
                      {t.phone && <a className="rounded-full bg-ink px-2.5 py-1 text-paper hover:bg-accent" href={`tel:${t.phone}`}>Call</a>}
                      {t.instagram && <a className="rounded-full bg-ink px-2.5 py-1 text-paper hover:bg-accent" href={`https://instagram.com/${t.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
                      <a className="rounded-full border border-ink px-2.5 py-1 hover:bg-ink hover:text-paper" href={`/trainers/${t.slug}`} target="_blank">Profile</a>
                    </div>
                  </td>
                  <td className="p-3 text-right tabular-nums">{t.views}</td>
                  <td className="p-3 text-right tabular-nums">{t.contacts}</td>
                  <td className="p-3"><StatusPill status={t.outreach_status} />{t.last_contacted && <p className="mt-1 text-xs text-muted">{new Date(t.last_contacted).toLocaleDateString("en-GB")}</p>}{t.notes && <p className="mt-1 max-w-[180px] truncate text-xs text-muted">{t.notes}</p>}</td>
                </tr>
                {open === t.id && (
                  <tr className="bg-soft"><td colSpan={8} className="p-4">
                    <OutreachEditor statuses={statuses}
                      value={{ status: t.outreach_status, notes: t.notes, last_contacted: t.last_contacted }}
                      save={(u) => saveTrainerOutreach(t.id, u)}
                      onSaved={(u) => setRows((rs) => rs.map((r) => r.id === t.id ? { ...r, outreach_status: u.status, notes: u.notes, last_contacted: u.last_contacted } : r))} />
                  </td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length > limit && (
          <div className="p-4 text-center"><button type="button" className="btn-ghost px-4 py-2 text-xs" onClick={() => setLimit(limit + 200)}>Show more ({filtered.length - limit} left)</button></div>
        )}
      </div>
    </div>
  );
}
