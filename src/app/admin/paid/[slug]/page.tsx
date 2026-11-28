import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/admin-db";
import { emptyProfile, getPaidProfile } from "@/lib/paid";
import { emailConfigured } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { PaidEditor } from "@/components/admin/PaidEditor";
import { setManualPaid } from "../actions";

export const dynamic = "force-dynamic";

/** ed's private editor for one trainer's paid page. Trainers never see this. */
export default async function EditPaid({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const sp = await searchParams;
  const db = getAdminDb();
  if (!db) notFound();
  const { data: t } = await db.from("trainers").select("id, slug, name, city, email, bio, is_paid, paid_manual").eq("slug", slug).maybeSingle();
  if (!t) notFound();
  const profile = (await getPaidProfile(t.id)) ?? emptyProfile(t.id);
  const join = `${SITE_URL}/join/${t.slug}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin?tab=paid" className="text-sm text-muted hover:text-ink">← Paid profiles</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">{t.name}</h1>
          <p className="mt-1 text-sm text-muted">{t.city} · <Link href={`/trainers/${t.slug}`} target="_blank" className="underline">Open their page</Link></p>
        </div>
        <p className={`text-sm font-semibold ${t.is_paid ? "text-emerald-700" : "text-muted"}`}>
          {t.is_paid ? (t.paid_manual ? "Paid page ON (switched on by hand)" : "Paid page ON") : "Free listing (extras hidden)"}
        </p>
      </div>
      {sp.saved && <p role="status" className="mt-4 border-l-4 border-accent bg-paper px-4 py-3 text-sm">{sp.saved === "on" ? "Paid page switched on." : "Paid page switched off. Their extras are kept but hidden."}</p>}

      <div className="mt-6 rounded-3xl bg-paper p-6 text-sm">
        <p><b>Payment link:</b> <code className="break-all">{join}</code></p>
        <p className="mt-1 text-xs text-muted">You can fill this page in before they pay. Nothing shows on the site until their page is paid.</p>
        <form action={setManualPaid.bind(null, t.id, !t.paid_manual)} className="mt-3">
          <button className="btn-ghost text-xs">{t.paid_manual ? "Stop the hand switch (Stripe decides)" : "Switch on by hand (paid another way)"}</button>
        </form>
      </div>

      <PaidEditor
        trainerId={t.id}
        initial={profile}
        freeBio={t.bio}
        listingEmail={t.email}
        emailReady={emailConfigured()}
      />
    </div>
  );
}
