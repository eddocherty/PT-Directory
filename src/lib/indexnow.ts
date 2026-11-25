import { BRAND } from "@/brand";
import sitemap from "@/app/sitemap";
import { CUSTOM_DOMAIN_LIVE, abs } from "./site";

/**
 * IndexNow tells Bing (and Yandex, Seznam, Naver) which pages exist or changed, so they are crawled within
 * hours instead of weeks. The key is public by design: it only proves we own the site, served at /indexnow-key.txt.
 */
export const INDEXNOW_KEY = "423233eed42cf7b5d6734c2d203ec796";

export type IndexNowResult = { ok: boolean; message: string };

/** Sends every URL in the sitemap. Only works once the real domain is live, because the key must sit on that host. */
export async function submitSitemapToIndexNow(): Promise<IndexNowResult> {
  if (!CUSTOM_DOMAIN_LIVE) return { ok: false, message: `Not sent: ${BRAND.domain} isn't live on this site yet.` };
  const urlList = (await sitemap()).map((e) => e.url).slice(0, 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: BRAND.domain, key: INDEXNOW_KEY, keyLocation: abs("/indexnow-key.txt"), urlList }),
  }).catch(() => null);
  if (!res) return { ok: false, message: "Couldn't reach IndexNow. Try again in a few minutes." };
  // 200 and 202 both mean accepted; 202 means the key is still being checked.
  if (res.status === 200 || res.status === 202) return { ok: true, message: `Sent ${urlList.length} pages to Bing and other IndexNow search engines.` };
  return { ok: false, message: `IndexNow said no (status ${res.status}). Check that ${BRAND.domain}/indexnow-key.txt opens.` };
}
