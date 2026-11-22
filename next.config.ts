import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle the encrypted plan PDFs with the download function only. They are never in public/.
  outputFileTracingIncludes: {
    "/api/download": ["./private/plans/*.pdf.enc"],
  },
};

export default nextConfig;
