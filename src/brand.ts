/**
 * The brand, in one place. To rename the site, change these values (and rebuild the shop PDFs,
 * see shop-plans/src/lib.mjs in the project files). Nothing else in the code spells the name or domain.
 */
export const BRAND = {
  /** Shown in titles, copy and structured data. */
  name: "LocalPT",
  /** The logo: the first part in type, the second on a cobalt tag. */
  wordmark: ["Local", "PT"] as const,
  tagline: "Independent trainers, near you.",
  /** The production domain, without https:// or www. */
  domain: "localpt.co.uk",
  /** Old addresses that should redirect to the domain once it is live. */
  oldHosts: ["pt-directory-vf6t.vercel.app"],
  /** Used in file names such as CSV exports. */
  slug: "localpt",
};
