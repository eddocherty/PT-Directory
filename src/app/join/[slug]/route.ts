import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/admin-db";
import { startCheckout } from "@/lib/join";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A trainer's own payment link, e.g. localpt.co.uk/join/jo-marsh-pt-kendal. ed sends it to them.
// Link previews (WhatsApp, email) may open it too; that only starts a Stripe page nobody pays on.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getAdminDb();
  const { data } = db
    ? await db.from("trainers").select("id, slug, name").eq("slug", slug).neq("status", "removed").maybeSingle()
    : { data: null };
  if (!data) return NextResponse.redirect(new URL("/", req.url), 303);
  return startCheckout(req, data as { id: string; slug: string; name: string });
}
