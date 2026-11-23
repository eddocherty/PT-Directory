import { NextResponse, type NextRequest } from "next/server";
import { recordEvent } from "@/lib/analytics";
import { ADMIN_COOKIE, isValidSession } from "@/lib/admin-auth";

const DETAILS = new Set(["website", "instagram", "phone", "email", "contact_button"]);

export async function POST(req: NextRequest) {
  // Don't count ed's own browsing while he's logged in to the admin area.
  if (isValidSession(req.cookies.get(ADMIN_COOKIE)?.value)) return new NextResponse(null, { status: 204 });
  try {
    const body = JSON.parse((await req.text()).slice(0, 2000)) as { k?: string; p?: string; r?: string; d?: string };
    if (typeof body.p !== "string" || !body.p.startsWith("/")) return new NextResponse(null, { status: 204 });
    if (body.k === "pageview") {
      await recordEvent({ kind: "pageview", path: body.p, referrer: body.r ?? null, headers: req.headers });
    } else if (body.k === "contact" && body.d && DETAILS.has(body.d)) {
      await recordEvent({ kind: "contact", path: body.p, detail: body.d, headers: req.headers });
    }
  } catch {
    // ignore malformed beacons
  }
  return new NextResponse(null, { status: 204 });
}
