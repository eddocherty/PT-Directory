import { NextResponse, type NextRequest } from "next/server";
import { recordEvent } from "@/lib/analytics";
import { ADMIN_COOKIE, MINE_COOKIE, isMineValue, isValidSession, makeMineValue, mineCookieOptions } from "@/lib/admin-auth";

const DETAILS = new Set(["website", "instagram", "phone", "email", "contact_button"]);

export async function POST(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  // A browser that's logged in to the admin area is ed's: mark it for good, so it stays
  // out of the real-visitor count even after the 7-day login runs out.
  if (isValidSession(req.cookies.get(ADMIN_COOKIE)?.value) && !isMineValue(req.cookies.get(MINE_COOKIE)?.value)) {
    res.cookies.set(MINE_COOKIE, makeMineValue(), mineCookieOptions);
  }
  try {
    const body = JSON.parse((await req.text()).slice(0, 2000)) as { k?: string; p?: string; r?: string; d?: string; w?: number };
    if (typeof body.p !== "string" || !body.p.startsWith("/")) return res;
    const automated = body.w === 1;
    if (body.k === "pageview") {
      await recordEvent({ kind: "pageview", path: body.p, referrer: body.r ?? null, headers: req.headers, automated });
    } else if (body.k === "contact" && body.d && DETAILS.has(body.d)) {
      await recordEvent({ kind: "contact", path: body.p, detail: body.d, headers: req.headers, automated });
    }
  } catch {
    // ignore malformed beacons
  }
  return res;
}
