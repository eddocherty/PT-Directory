import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle the encrypted plan PDFs with the download function only. They are never in public/.
  outputFileTracingIncludes: {
    "/api/download": ["./private/plans/*.pdf.enc"],
  },
  async headers() {
    return [{ source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] }];
  },
};

export default nextConfig;
