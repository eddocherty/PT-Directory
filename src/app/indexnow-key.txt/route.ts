import { INDEXNOW_KEY } from "@/lib/indexnow";

export const dynamic = "force-static";

/** The IndexNow ownership key, so Bing can check pings really come from this site. */
export function GET() {
  return new Response(INDEXNOW_KEY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
