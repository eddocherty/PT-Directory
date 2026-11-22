import { createDecipheriv } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { checkOrder, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Streams a purchased PDF. The files are never public: every request is checked against Stripe.
//   ?session_id=cs_...  straight after checkout (from the thank-you page)
//   ?order=<uuid>       from the link in the receipt email
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id") ?? "";
  const order = url.searchParams.get("order") ?? "";
  const stripe = getStripe();
  const fail = (msg: string, status = 404) =>
    new NextResponse(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });
  if (!stripe) return fail("The shop is not set up yet.", 503);

  let slug: string | undefined;
  try {
    const res = await checkOrder(stripe, { sessionId, order });
    if (res.status === "non-uk") return fail("Sorry, our plans are only available to UK customers. Your payment has been refunded in full.", 403);
    if (res.status === "ok") slug = res.slug;
  } catch (e) {
    console.error("Stripe lookup failed", e);
    return fail("We couldn't check your order just now. Please try again in a minute.", 502);
  }

  const product = slug ? getProduct(slug) : undefined;
  if (!product) return fail("We couldn't find a paid order for this link. If you've just paid, wait a minute and try again, or contact us with your receipt.");

  // The repo is public, so the PDFs are stored encrypted. PLANS_KEY (Vercel env var) unlocks them.
  const key = Buffer.from(process.env.PLANS_KEY ?? "", "base64");
  if (key.length !== 32) return fail("Downloads are not set up yet. Please contact us and we'll email your plan.", 503);
  let pdf: Buffer;
  try {
    const blob = await readFile(join(process.cwd(), "private", "plans", `${product.file}.enc`));
    const d = createDecipheriv("aes-256-gcm", key, blob.subarray(0, 12));
    d.setAuthTag(blob.subarray(12, 28));
    pdf = Buffer.concat([d.update(blob.subarray(28)), d.final()]);
  } catch (e) {
    console.error("Could not unlock plan file", e);
    return fail("Sorry, something went wrong preparing your download. Please contact us and we'll email your plan.", 500);
  }
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${product.file}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
