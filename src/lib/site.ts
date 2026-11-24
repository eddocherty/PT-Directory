export const SITE_NAME = "LocalPT";
export const TAGLINE = "Independent trainers, near you.";

/** The site's real home. Every canonical link, the sitemap and structured data point here once the domain is attached. */
export const CANONICAL_HOST = "localpt.co.uk";

// Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the project's production domain. Until localpt.co.uk is
// attached it is the *.vercel.app address, so canonical links keep pointing at an address that works.
const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const CUSTOM_DOMAIN_LIVE = !!prodHost && !prodHost.endsWith(".vercel.app");

export const SITE_URL = CUSTOM_DOMAIN_LIVE
  ? `https://${CANONICAL_HOST}`
  : prodHost
    ? `https://${prodHost}`
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Only the production deployment is indexed. Preview builds tell search engines to stay away. */
export const INDEXABLE = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : false;

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com";

export const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
