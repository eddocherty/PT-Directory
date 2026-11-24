import { BRAND } from "@/brand";

/** "Find me on LocalPT" badge that listed trainers can put on their own site, linking to their profile.
 *  Built from the brand config so a rename changes it too. */
export function GET() {
  const [a, b] = BRAND.wordmark;
  const w = Math.round(84 + a.length * 9.6 + b.length * 11 + 24);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="44" viewBox="0 0 ${w} 44" role="img" aria-label="Find me on ${BRAND.name}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="43" rx="10" fill="#ffffff" stroke="#d9dee8"/>
  <text x="14" y="27" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#5b6475">Find me on</text>
  <text x="84" y="28" font-family="Helvetica, Arial, sans-serif" font-size="17" font-weight="800" fill="#111827">${a}</text>
  <rect x="${84 + a.length * 9.6}" y="12" width="${b.length * 11 + 10}" height="22" rx="5" fill="#2457c5"/>
  <text x="${89 + a.length * 9.6}" y="28" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="800" fill="#ffffff">${b}</text>
</svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
}
