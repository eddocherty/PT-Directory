"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { PaidProfile } from "@/lib/paid";
import { createUploadTargets, savePaidProfile } from "@/app/admin/paid/actions";
import { getSupabase } from "@/lib/supabase";
import { MEDIA_BUCKET as MEDIA_BUCKET_PUBLIC } from "@/lib/media";

type Draft = Omit<PaidProfile, "trainer_id" | "updated_at">;

/** Shrinks a photo in the browser to at most 1800px on its long side, as a JPEG, so pages stay fast. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/jpeg", 0.85));
  } catch {
    return file; // the browser couldn't read it (e.g. some HEIC files): try the original
  }
}

function Card({ title, help, children }: { title: string; help?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-paper p-6">
      <h2 className="display text-2xl">{title}</h2>
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}

/** A list of rows (videos, prices, workouts…) with add, remove and move up. */
function Rows<T>({ items, onChange, blank, addLabel, render }: {
  items: T[]; onChange: (v: T[]) => void; blank: T; addLabel: string;
  render: (item: T, set: (patch: Partial<T>) => void, i: number) => React.ReactNode;
}) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className="border-t border-line pt-3">
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
          <div className="mt-2 flex gap-4 text-xs">
            {i > 0 && <button type="button" className="underline" onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>Move up</button>}
            <button type="button" className="text-red-700 underline" onClick={() => onChange(items.filter((_, j) => j !== i))}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-ghost self-start text-sm" onClick={() => onChange([...items, { ...blank }])}>{addLabel}</button>
    </>
  );
}

export function PaidEditor({ trainerId, initial, freeBio, listingEmail, emailReady }: {
  trainerId: string; initial: PaidProfile; freeBio: string | null; listingEmail: string | null; emailReady: boolean;
}) {
  const { trainer_id: _id, updated_at, ...start } = initial;
  void _id;
  const [d, setD] = useState<Draft>(start);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(updated_at ? { ok: true, text: `Last saved ${new Date(updated_at).toLocaleString("en-GB")}` } : null);
  const [saving, startSave] = useTransition();
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => { setD((x) => ({ ...x, [k]: v })); setDirty(true); };

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => startSave(async () => {
    const r = await savePaidProfile(trainerId, d);
    if (r.ok) { setDirty(false); setMsg({ ok: true, text: `Saved ${new Date(r.savedAt!).toLocaleTimeString("en-GB")}. It’s live on their page if they’re paying.` }); }
    else setMsg({ ok: false, text: r.error ?? "Couldn’t save." });
  });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const db = getSupabase();
    if (!db) { setMsg({ ok: false, text: "Supabase isn’t connected in this browser." }); return; }
    const list = [...files].slice(0, 30);
    setUploading(`Preparing ${list.length} photo${list.length === 1 ? "" : "s"}…`);
    const blobs = await Promise.all(list.map(shrink));
    const kinds = blobs.map((b) => (["image/jpeg", "image/png", "image/webp"].includes(b.type) ? b.type : "image/jpeg"));
    const { targets, error } = await createUploadTargets(trainerId, kinds);
    if (error || !targets) { setUploading(null); setMsg({ ok: false, text: error ?? "Upload failed." }); return; }
    const done: string[] = [];
    for (let i = 0; i < targets.length; i++) {
      setUploading(`Uploading ${i + 1} of ${targets.length}…`);
      const { error: e } = await db.storage.from(MEDIA_BUCKET_PUBLIC).uploadToSignedUrl(targets[i].path, targets[i].token, blobs[i], { contentType: kinds[i] });
      if (e) { setMsg({ ok: false, text: `Photo ${i + 1} didn’t upload: ${e.message}` }); continue; }
      done.push(targets[i].publicUrl);
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
    if (done.length) {
      setD((x) => ({ ...x, gallery: [...x.gallery, ...done] }));
      setDirty(true);
      setMsg({ ok: true, text: `${done.length} photo${done.length === 1 ? "" : "s"} uploaded. Press Save to put them on the page.` });
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-6 pb-28">
      <Card title="Availability and contact" help="Enquiries from their page are emailed to this address, and Reply goes straight to the client.">
        <Field label="Taking new clients?">
          <select className="input" value={d.taking_clients ?? ""} onChange={(e) => set("taking_clients", (e.target.value || null) as Draft["taking_clients"])}>
            <option value="">Don’t show</option>
            <option value="yes">Taking new clients</option>
            <option value="waitlist">Waiting list</option>
            <option value="no">Not taking new clients</option>
          </select>
        </Field>
        <Field label="Email for enquiries">
          <input className="input" type="email" value={d.enquiry_email ?? ""} placeholder={listingEmail ?? "trainer@example.com"} onChange={(e) => set("enquiry_email", e.target.value)} />
        </Field>
        {!emailReady && <p className="text-xs font-semibold text-red-700">Email sending isn’t set up yet, so enquiries wait in Admin › Requests & enquiries for you to pass on.</p>}
        <Field label="WhatsApp number (optional)">
          <input className="input" value={d.whatsapp ?? ""} placeholder="07700 900123" onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
      </Card>

      <Card title="About them" help="In their own words. Leave blank to keep the bio we wrote for the free listing.">
        <textarea className="input min-h-48" value={d.about ?? ""} placeholder={freeBio ?? ""} onChange={(e) => set("about", e.target.value)} />
      </Card>

      <Card title="Photos" help="The first photo is the big one at the top of their page and on search cards. Only use photos the trainer owns or has permission to use, and never photos of clients without the client’s written OK.">
        {d.gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {d.gallery.map((src, i) => (
              <div key={src} className="flex flex-col gap-1 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className={`aspect-square w-full object-cover ${i === 0 ? "ring-4 ring-accent" : ""}`} />
                <div className="flex justify-between gap-2">
                  {i === 0 ? <span className="font-semibold">Main</span> : (
                    <button type="button" className="underline" onClick={() => set("gallery", [src, ...d.gallery.filter((g) => g !== src)])}>Make main</button>
                  )}
                  <button type="button" className="text-red-700 underline" onClick={() => set("gallery", d.gallery.filter((g) => g !== src))}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} id="photos" type="file" accept="image/*" multiple className="text-sm" onChange={(e) => upload(e.target.files)} disabled={!!uploading} />
        {uploading && <p className="text-sm font-semibold">{uploading}</p>}
      </Card>

      <Card title="Videos" help="Paste a YouTube or Vimeo link. It plays right on their page.">
        <Rows items={d.videos} onChange={(v) => set("videos", v)} blank={{ url: "", title: "" }} addLabel="Add a video" render={(v, s) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Link"><input className="input" value={v.url} placeholder="https://youtu.be/…" onChange={(e) => s({ url: e.target.value })} /></Field>
            <Field label="Caption (optional)"><input className="input" value={v.title} onChange={(e) => s({ title: e.target.value })} /></Field>
          </div>
        )} />
      </Card>

      <Card title="Prices" help="From the trainer. The page says “Prices from [name], last updated [date]”, and the date moves on by itself when you change them.">
        <Rows items={d.prices} onChange={(v) => set("prices", v)} blank={{ label: "", price: "", note: "" }} addLabel="Add a price" render={(p, s) => (
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Field label="What"><input className="input" value={p.label} placeholder="1-to-1 session, 60 minutes" onChange={(e) => s({ label: e.target.value })} /></Field>
            <Field label="Price"><input className="input" value={p.price} placeholder="£40" onChange={(e) => s({ price: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Note (optional)"><input className="input" value={p.note} placeholder="Block of 10 for £360" onChange={(e) => s({ note: e.target.value })} /></Field></div>
          </div>
        )} />
      </Card>

      <Card title="Workouts to try" help="A free taster workout or two from the trainer. Visitors open each one on the page.">
        <Rows items={d.workouts} onChange={(v) => set("workouts", v)} blank={{ title: "", body: "", link: "" }} addLabel="Add a workout" render={(w, s) => (
          <div className="flex flex-col gap-3">
            <Field label="Title"><input className="input" value={w.title} placeholder="20-minute kettlebell starter" onChange={(e) => s({ title: e.target.value })} /></Field>
            <Field label="The workout"><textarea className="input min-h-32" value={w.body} onChange={(e) => s({ body: e.target.value })} /></Field>
            <Field label="Link to more (optional)"><input className="input" value={w.link} placeholder="https://…" onChange={(e) => s({ link: e.target.value })} /></Field>
          </div>
        )} />
      </Card>

      <Card title="Client reviews" help="Only real reviews from real clients, copied word for word, and pass on the critical ones as well as the glowing ones (hiding bad reviews is against the law since April 2025). Add where each came from, e.g. Google. They show as “Shared by [name]”.">
        <Rows items={d.reviews} onChange={(v) => set("reviews", v)} blank={{ author: "", body: "", rating: null, source: "", date: "" }} addLabel="Add a review" render={(r, s) => (
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Client’s name"><input className="input" value={r.author} placeholder="Sarah T." onChange={(e) => s({ author: e.target.value })} /></Field>
            <Field label="Stars">
              <select className="input" value={r.rating ?? ""} onChange={(e) => s({ rating: e.target.value ? Number(e.target.value) : null })}>
                <option value="">None</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="From"><input className="input" value={r.source} placeholder="Google" onChange={(e) => s({ source: e.target.value })} /></Field>
            <Field label="Date"><input className="input" type="date" value={r.date} onChange={(e) => s({ date: e.target.value })} /></Field>
            <div className="sm:col-span-4"><Field label="Review"><textarea className="input min-h-24" value={r.body} onChange={(e) => s({ body: e.target.value })} /></Field></div>
          </div>
        )} />
      </Card>

      <Card title="Anything else" help="Their own sections: success stories, where they train, FAQs, kit, class timetable… A success story needs the client’s written consent, and no weight-loss promises (nothing like “lose a stone in a month”).">
        <Rows items={d.sections} onChange={(v) => set("sections", v)} blank={{ heading: "", body: "" }} addLabel="Add a section" render={(x, s) => (
          <div className="flex flex-col gap-3">
            <Field label="Heading"><input className="input" value={x.heading} placeholder="Success stories" onChange={(e) => s({ heading: e.target.value })} /></Field>
            <Field label="Text"><textarea className="input min-h-32" value={x.body} onChange={(e) => s({ body: e.target.value })} /></Field>
          </div>
        )} />
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <p role="status" className={`text-sm ${msg && !msg.ok ? "font-semibold text-red-700" : "text-muted"}`}>
            {dirty ? "Unsaved changes" : msg?.text ?? "Nothing changed yet"}
            {dirty && msg && !msg.ok && ` · ${msg.text}`}
          </p>
          <button type="button" onClick={save} disabled={saving || !!uploading} className="btn">{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
