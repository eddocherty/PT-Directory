import type { NextConfig } from "next";

// Once localpt.co.uk is attached in Vercel, VERCEL_PROJECT_PRODUCTION_URL becomes that domain, and every
// request to the old *.vercel.app address is sent there with a permanent (308) redirect, keeping the path.
const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const customDomainLive = process.env.VERCEL_ENV === "production" && !!prodHost && !prodHost.endsWith(".vercel.app");
const OLD_HOSTS = ["pt-directory-vf6t.vercel.app"];

const nextConfig: NextConfig = {
  // Bundle the encrypted plan PDFs with the download function only. They are never in public/.
  outputFileTracingIncludes: {
    "/api/download": ["./private/plans/*.pdf.enc"],
  },
  async redirects() {
    if (!customDomainLive) return [];
    return OLD_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://localpt.co.uk/:path*",
      permanent: true,
    }));
  },
  async headers() {
    return [{ source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] }];
  },
};

export default nextConfig;
