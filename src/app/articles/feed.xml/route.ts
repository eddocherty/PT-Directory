import { publishedArticles, sectionName } from "@/lib/articles";
import { SITE_NAME, abs } from "@/lib/site";

export const revalidate = 21600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** RSS feed of published articles, so feed readers, news aggregators and bloggers can follow new pieces. */
export function GET() {
  const items = publishedArticles().map(
    (a) => `<item><title>${esc(a.headline)}</title><link>${abs(`/articles/${a.slug}`)}</link><guid>${abs(`/articles/${a.slug}`)}</guid><pubDate>${new Date(`${a.published}T08:00:00Z`).toUTCString()}</pubDate><category>${esc(sectionName(a.section))}</category><description>${esc(a.summary)}</description><enclosure url="${abs(`/articles/${a.slug}.jpg`)}" type="image/jpeg" length="0"/></item>`,
  ).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(SITE_NAME)} articles</title><link>${abs("/articles")}</link><description>Training, running, Pilates and choosing a personal trainer.</description><language>en-gb</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
