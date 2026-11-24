import type { MetadataRoute } from "next";
import { INDEXABLE, abs } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must never compete with the real site in search results.
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/shop/thanks"] },
    sitemap: abs("/sitemap.xml"),
  };
}
