import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/admin-db";
import { loadDashboard, loadInbox, loadLeads, loadTrainers, OUTREACH_STATUSES, type Dashboard } from "@/lib/admin-data";
import { logoutAction, setRequestStatus } from "./actions";
import { DailyChart } from "@/components/admin/DailyChart";
import { TrainerTable } from "@/components/admin/TrainerTable";
import { LeadTable } from "@/components/admin/LeadTable";
import { BRAND } from "@/brand";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "overview", label: "Traffic" },
  { id: "trainers", label: "Trainers (client list)" },
  { id: "leads", label: "Outreach pipeline" },
  { id: "inbox", label: "Requests & enquiries" },
] as const;
const RANGES = [7, 30, 90, 365];

type Props = { searchParams: Promise<{ tab?: string; days?: string }> };

const fmt = (n: number) => n.toLocaleString("en-GB");

export default async function AdminPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.id === sp.tab)?.id ?? "overview";
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const href = (p: { tab?: string; days?: number }) => `/admin?tab=${p.tab ?? tab}&days=${p.days ?? days}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">{BRAND.name} admin</p>
          <h1 className="display mt-1 text-4xl">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/password" className="btn-ghost px-4 py-2 text-xs">Change password</Link>
          <form action={logoutAction}><button className="btn-ghost px-4 py-2 text-xs">Log out</button></form>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
        {TABS.map((t) => (
          <Link key={t.id} href={href({ tab: t.id })} className={`rounded-full px-4 py-2 ${t.id === tab ? "bg-ink text-paper" : "bg-paper hover:bg-zap"}`}>{t.label}</Link>
        ))}
      </nav>

      {!getAdminDb() ? (
        <Setup />
      ) : (
        <Body tab={tab} days={days} href={href} />
      )}
    </div>
  );
}

function Setup() {
  return (
    <div className="mt-8 rounded-3xl bg-paper p-6 text-sm">
      <p className="display text-2xl">One more setting needed</p>
      <p className="mt-2">Add <code>SUPABASE_SERVICE_ROLE_KEY</code> in Vercel (Settings → Environment Variables), then redeploy. The dashboard reads your data with it.</p>
    </div>
  );
}

async function Body({ tab, days, href }: { tab: string; days: number; href: (p: { tab?: string; days?: number }) => string }) {
  let dash: Dashboard;
  try {
    dash = await loadDashboard(days);
  } catch (e) {
    return (
      <div className="mt-8 rounded-3xl bg-paper p-6 text-sm">
        <p className="display text-2xl">Database setup needed</p>
        <p className="mt-2">The admin tables aren’t in Supabase yet. Run the admin SQL file in the Supabase SQL editor.</p>
        <p className="mt-2 text-muted">{(e as Error).message}</p>
      </div>
    );
  }

  const rangePicker = (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
      <span className="text-muted">Period:</span>
      {RANGES.map((d) => (
        <Link key={d} href={href({ days: d })} className={`rounded-full px-3 py-1.5 ${d === days ? "bg-accent text-paper" : "bg-paper hover:bg-zap"}`}>
          {d === 365 ? "12 months" : `${d} days`}
        </Link>
      ))}
    </div>
  );

  if (tab === "trainers") {
    const trainers = await loadTrainers(dash.trainer_stats);
    return (
      <section className="mt-6 flex flex-col gap-4">
        {rangePicker}
        <p className="text-xs text-muted">Views and contact clicks are for the period picked above. Click a trainer to open their notes.</p>
        <TrainerTable trainers={trainers} statuses={OUTREACH_STATUSES} />
      </section>
    );
  }

  if (tab === "leads") {
    const leads = await loadLeads();
    return (
      <section className="mt-6">
        {leads.length === 0 ? (
          <p className="rounded-3xl bg-paper p-6 text-sm">No outreach leads yet. Run the admin SQL file in Supabase to import the outreach list.</p>
        ) : (
          <LeadTable leads={leads} statuses={OUTREACH_STATUSES} />
        )}
      </section>
    );
  }

  if (tab === "inbox") {
    const { requests, enquiries, pendingReviews } = await loadInbox();
    return (
      <section className="mt-6 grid gap-6">
        <div className="rounded-3xl bg-paper p-6">
          <h2 className="display text-2xl">Removal and correction requests</h2>
          <p className="mt-1 text-xs text-muted">UK GDPR: deal with removals promptly (within a month at most). To remove someone, set their status to removed in Supabase.</p>
          {requests.length === 0 ? <p className="mt-4 text-sm text-muted">None yet.</p> : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      <span className={`mr-2 rounded-full px-2 py-0.5 text-xs ${r.kind === "removal" ? "bg-red-100 text-red-800" : "bg-zap text-accent"}`}>{r.kind}</span>
                      {r.trainers ? <Link className="underline" href={`/trainers/${r.trainers.slug}`} target="_blank">{r.trainers.name}</Link> : "No listing named"}
                    </p>
                    <p className="mt-1 text-muted">{r.requester_name} · <a className="underline" href={`mailto:${r.requester_email}`}>{r.requester_email}</a> · {new Date(r.created_at).toLocaleDateString("en-GB")}</p>
                    {r.message && <p className="mt-1 whitespace-pre-line">{r.message}</p>}
                  </div>
                  <form action={setRequestStatus.bind(null, r.id, r.status === "open" ? "done" : "open")}>
                    <button className={`rounded-full px-3 py-1.5 text-xs font-semibold ${r.status === "open" ? "bg-ink text-paper" : "bg-soft"}`}>
                      {r.status === "open" ? "Mark done" : `Done · reopen`}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-3xl bg-paper p-6">
          <h2 className="display text-2xl">Enquiries sent through the site</h2>
          <p className="mt-1 text-xs text-muted">{pendingReviews} review{pendingReviews === 1 ? "" : "s"} waiting for moderation in Supabase.</p>
          {enquiries.length === 0 ? <p className="mt-4 text-sm text-muted">None yet.</p> : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {enquiries.map((e) => (
                <li key={e.id} className="py-3">
                  <p className="font-semibold">{e.name} → {e.trainers?.name ?? "?"}</p>
                  <p className="text-muted">{e.email} · {e.goal ?? "No goal given"} · {new Date(e.created_at).toLocaleDateString("en-GB")}</p>
                  {e.message && <p className="mt-1 whitespace-pre-line">{e.message}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  // Overview
  const trainers = await loadTrainers(dash.trainer_stats);
  const byViews = [...trainers].filter((t) => t.views > 0).sort((a, b) => b.views - a.views || b.contacts - a.contacts).slice(0, 10);
  const byContacts = [...trainers].filter((t) => t.contacts > 0).sort((a, b) => b.contacts - a.contacts || b.views - a.views).slice(0, 10);

  return (
    <section className="mt-6 flex flex-col gap-6">
      {rangePicker}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Page views" value={dash.pageviews} />
        <Stat label="Visitors" value={dash.visitors} note="Counted once per day" />
        <Stat label="Trainer profile views" value={dash.profile_views} />
        <Stat label="Contact clicks" value={dash.contacts} note="Website, phone, Instagram, enquiries" />
      </div>
      <div className="rounded-3xl bg-paper p-6">
        <h2 className="font-semibold">Page views per day</h2>
        <DailyChart daily={dash.daily} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Ranking title="Most viewed trainers" rows={byViews} metric="views" />
        <Ranking title="Most contacted trainers" rows={byContacts} metric="contacts" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Table title="Top pages" head={["Page", "Views", "Visitors"]} rows={dash.top_pages.map((p) => [p.path, fmt(p.views), fmt(p.visitors)])} />
        <Table title="Where visitors came from" head={["Source", "Views"]} rows={dash.referrers.map((r) => [r.source, fmt(r.views)])} />
        <Table title="Devices" head={["Device", "Views"]} rows={dash.devices.map((r) => [r.device, fmt(r.views)])} />
        <Table title="Countries" head={["Country", "Views"]} rows={dash.countries.map((r) => [r.country, fmt(r.views)])} />
      </div>
      <p className="text-xs text-muted">
        Counted by {BRAND.name} itself, with no cookies and no IP addresses stored. Bots and your own visits while logged in are left out.
        Vercel’s Analytics tab shows a second, independent count.
      </p>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-3xl bg-paper p-5">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="display mt-2 text-4xl">{fmt(Number(value))}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

function Ranking({ title, rows, metric }: { title: string; rows: Awaited<ReturnType<typeof loadTrainers>>; metric: "views" | "contacts" }) {
  return (
    <div className="rounded-3xl bg-paper p-6">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? <p className="mt-3 text-sm text-muted">No data for this period yet.</p> : (
        <ol className="mt-3 divide-y divide-line text-sm">
          {rows.map((t, i) => (
            <li key={t.id} className="flex items-center gap-3 py-2">
              <span className="w-6 text-right font-semibold text-muted">{i + 1}</span>
              <Link href={`/trainers/${t.slug}`} target="_blank" className="min-w-0 flex-1 truncate font-medium hover:underline">{t.name}</Link>
              <span className="text-muted">{t.city}</span>
              <span className="w-24 text-right">
                <strong>{fmt(t[metric])}</strong> {metric === "views" ? "views" : "contacts"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Table({ title, head, rows }: { title: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="rounded-3xl bg-paper p-6">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? <p className="mt-3 text-sm text-muted">No data for this period yet.</p> : (
        <table className="mt-3 w-full text-sm">
          <thead><tr className="text-left text-xs text-muted">{head.map((h, i) => <th key={h} className={`pb-2 font-semibold ${i ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j} className={`py-2 ${j ? "text-right tabular-nums" : "max-w-0 truncate pr-3"}`}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
