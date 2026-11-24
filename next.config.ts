import type { NextConfig } from "next";
import { BRAND } from "./src/brand";

// Once BRAND.domain is attached in Vercel, VERCEL_PROJECT_PRODUCTION_URL becomes that domain, and every
// request to the old *.vercel.app address is sent there with a permanent (308) redirect, keeping the path.
const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const customDomainLive = process.env.VERCEL_ENV === "production" && !!prodHost && !prodHost.endsWith(".vercel.app");

const nextConfig: NextConfig = {
  // The whole stylesheet is about 9 KB, so it goes straight into the page instead of a separate request
  // that holds up the first paint on mobile.
  experimental: { inlineCss: true },
  // Bundle the encrypted plan PDFs with the download function only. They are never in public/.
  outputFileTracingIncludes: {
    "/api/download": ["./private/plans/*.pdf.enc"],
  },
  async redirects() {
    if (!customDomainLive) return [];
    return BRAND.oldHosts.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${BRAND.domain}/:path*`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      // Plan covers rarely change, so phones can keep them for a week.
      { source: "/shop/:file*.jpg", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] }];
  },
};

export default nextConfig;
