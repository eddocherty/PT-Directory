import Link from "next/link";
import { isMyDevice, requireAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/admin-db";
import { loadDashboard, loadInbox, loadLeads, loadTrainers, OUTREACH_STATUSES, type Dashboard, type TrafficView } from "@/lib/admin-data";
import { logoutAction, pingIndexNowAction, setMyDeviceAction, setRequestStatus } from "./actions";
import { MineFlag } from "@/components/admin/MineFlag";
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
const VIEWS: { id: TrafficView; label: string }[] = [
  { id: "real", label: "Real visitors" },
  { id: "excluded", label: "Internal / bots" },
  { id: "all", label: "Everything" },
];

/** Why a page view wasn't counted as a real visitor, in plain words. */
const REASONS: Record<string, string> = {
  admin: "You, logged in to admin",
  "my-device": "A device you marked as yours",
  "claude-browser": "Claude’s built-in browser",
  "same-device": "Same device as one of the above, same day",
  heavy: "Very heavy use (100+ pages in a day)",
  preview: "Preview or test address, not the live site",
  automated: "Automated test browser",
  bot: "Search engine bots and crawlers",
  "before-launch": "Before launch (23–24 Nov, only us)",
  "heavy-testing": "Our testing sessions before this fix (40+ pages in a day)",
};

type Href = (p: { tab?: string; days?: number; view?: TrafficView }) => string;
type Props = { searchParams: Promise<{ tab?: string; days?: string; view?: string; indexnow?: string; device?: string }> };

const fmt = (n: number) => n.toLocaleString("en-GB");

export default async function AdminPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.id === sp.tab)?.id ?? "overview";
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const view = VIEWS.find((v) => v.id === sp.view)?.id ?? "real";
  const href: Href = (p) => `/admin?tab=${p.tab ?? tab}&days=${p.days ?? days}${(p.view ?? view) === "real" ? "" : `&view=${p.view ?? view}`}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">{BRAND.name} admin</p>
          <h1 className="display mt-1 text-4xl">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <form action={pingIndexNowAction}><button className="btn-ghost px-4 py-2 text-xs" title="Tells Bing about every page on the site">Send pages to Bing</button></form>
          <Link href="/admin/password" className="btn-ghost px-4 py-2 text-xs">Change password</Link>
          <form action={logoutAction}><button className="btn-ghost px-4 py-2 text-xs">Log out</button></form>
        </div>
      </div>

      {sp.indexnow && <p role="status" className="mt-4 bg-soft px-4 py-3 text-sm">{sp.indexnow.slice(0, 200)}</p>}
      {sp.device && (
        <p role="status" className="mt-4 border-l-4 border-accent bg-paper px-4 py-3 text-sm">
          {sp.device === "on" ? "Done. Visits from this browser won’t count as real visitors." : "Done. This browser now counts like any other visitor."}
        </p>
      )}

      <nav className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
        {TABS.map((t) => (
          <Link key={t.id} href={href({ tab: t.id })} className={`rounded-full px-4 py-2 ${t.id === tab ? "bg-ink text-paper" : "bg-paper hover:bg-zap"}`}>{t.label}</Link>
        ))}
      </nav>

      {!getAdminDb() ? (
        <Setup />
      ) : (
        <Body tab={tab} days={days} view={view} href={href} />
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

async function Body({ tab, days, view, href }: { tab: string; days: number; view: TrafficView; href: Href }) {
  let dash: Dashboard;
  try {
    dash = await loadDashboard(days, view);
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
    const { requests, enquiries, pendingReviews, signups } = await loadInbox();
    const optedIn = signups.filter((x) => x.marketing_ok && !x.unsubscribed_at);
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
        <div className="rounded-3xl bg-paper p-6">
          <h2 className="display text-2xl">Free sample sign-ups</h2>
          <p className="mt-1 text-xs text-muted">
            {signups.length} sign-up{signups.length === 1 ? "" : "s"}, {optedIn.length} happy to get emails. Only email people marked “emails OK”, and include an unsubscribe link.
          </p>
          {optedIn.length > 0 && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-semibold">Copy the “emails OK” list</summary>
              <textarea readOnly rows={4} className="input mt-2 font-mono text-xs" value={[...new Set(optedIn.map((x) => x.email))].join(", ")} />
            </details>
          )}
          {signups.length === 0 ? <p className="mt-4 text-sm text-muted">None yet.</p> : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {signups.slice(0, 100).map((x) => (
                <li key={x.id} className="flex flex-wrap justify-between gap-2 py-2">
                  <span className="font-semibold">{x.email}</span>
                  <span className="text-muted">{x.plan_slug} · {x.marketing_ok && !x.unsubscribed_at ? "emails OK" : "sample only"} · {new Date(x.created_at).toLocaleDateString("en-GB")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  // Overview
  const [trainers, mine] = await Promise.all([loadTrainers(dash.trainer_stats), isMyDevice()]);
  const byViews = [...trainers].filter((t) => t.views > 0).sort((a, b) => b.views - a.views || b.contacts - a.contacts).slice(0, 10);
  const byContacts = [...trainers].filter((t) => t.contacts > 0).sort((a, b) => b.contacts - a.contacts || b.views - a.views).slice(0, 10);

  return (
    <section className="mt-6 flex flex-col gap-6">
      {rangePicker}
      <MineFlag mine={mine} />
      <WhoCounted dash={dash} view={view} href={href} mine={mine} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={view === "real" ? "Page views" : view === "excluded" ? "Page views (internal / bots)" : "Page views (everything)"} value={dash.pageviews} />
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
        Counted by {BRAND.name} itself, with no cookies on visitors and no IP addresses stored. Unless you pick another view above,
        these numbers are real visitors only. Vercel’s Analytics tab shows a second, independent count, which also leaves out
        your marked devices and Claude’s browsers from now on.
      </p>
    </section>
  );
}

function WhoCounted({ dash, view, href, mine }: { dash: Dashboard; view: TrafficView; href: Href; mine: boolean }) {
  const s = dash.split;
  const fmtN = (n: number | undefined) => fmt(Number(n ?? 0));
  return (
    <div className="bg-paper p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="display text-2xl">Real visitors vs internal / bots</h2>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Show</span>
          {VIEWS.map((v) => (
            <Link key={v.id} href={href({ view: v.id })} aria-current={v.id === view ? "page" : undefined}
              className={`border-b-4 pb-1 font-bold ${v.id === view ? "border-accent text-ink" : "border-transparent text-muted hover:border-line hover:text-ink"}`}>
              {v.label}
            </Link>
          ))}
        </div>
      </div>

      {!s ? (
        <p className="mt-4 border-t border-line pt-4 text-sm">
          The split isn’t switched on yet. Run the file <code>20261127000000_analytics_traffic.sql</code> in the Supabase SQL editor, then refresh this page.
          Until then, the numbers below leave out bots and your logged-in visits, but can include Claude’s testing.
        </p>
      ) : (
        <>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-ink text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-2 font-semibold">Who</th><th className="pb-2 text-right font-semibold">Page views</th><th className="pb-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                { label: "Real visitors", sub: `${fmtN(s.real_visitors)} people, ${fmtN(s.real_contacts)} contact clicks`, n: s.real, strong: true },
                { label: "Internal: you and Claude", sub: "Your devices, Claude’s browsers and test addresses", n: s.internal },
                { label: "Bots and automated browsers", sub: "Search engines, crawlers, test robots", n: s.bot },
              ].map((r) => {
                const total = Number(s.real) + Number(s.internal) + Number(s.bot);
                return (
                  <tr key={r.label}>
                    <td className="py-3 pr-3"><span className={r.strong ? "font-bold" : "font-semibold"}>{r.label}</span><span className="block text-xs text-muted">{r.sub}</span></td>
                    <td className={`py-3 text-right tabular-nums ${r.strong ? "display text-2xl" : ""}`}>{fmtN(r.n)}</td>
                    <td className="py-3 pl-3 text-right tabular-nums text-muted">{total ? Math.round((100 * Number(r.n)) / total) : 0}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(dash.reasons?.length ?? 0) > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-semibold">Why views were left out</summary>
              <table className="mt-2 w-full">
                <tbody className="divide-y divide-line">
                  {dash.reasons!.map((r) => (
                    <tr key={`${r.traffic}-${r.reason}`}>
                      <td className="py-2 pr-3">{REASONS[r.reason] ?? r.reason}</td>
                      <td className="py-2 text-right tabular-nums">{fmt(Number(r.views))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted">Views from before 27 Nov were sorted after the fact, so a handful of them may be guesses.</p>
            </details>
          )}
        </>
      )}

      <form action={setMyDeviceAction} className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <p>
          <span className="font-semibold">This device:</span>{" "}
          {mine ? "yours, so its visits aren’t counted." : "counted like any other visitor."}
          <span className="block text-xs text-muted">Logging in here marks a browser as yours automatically. Do it once on your phone too.</span>
        </p>
        <input type="hidden" name="mine" value={mine ? "0" : "1"} />
        <button className={mine ? "btn-ghost text-sm" : "btn text-sm"}>{mine ? "Count this device again" : "This device is mine, don’t count it"}</button>
      </form>
    </div>
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
