# LocalPT

A directory of personal trainers across the UK. Visitors filter by location and radius, training style, fitness goal, online or in-person sessions, home visits, price and trainer gender.

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind) on Vercel, with Supabase Postgres and PostGIS. postcodes.io (free, Open Government Licence) turns postcodes and towns into coordinates.

The site needs the Supabase env vars set; without them pages render with no trainers.

## Setup

1. **Database.** In the Supabase SQL editor, run `supabase/migrations/20261122000000_init.sql`. Or run `supabase db push` with the Supabase CLI.
2. **Env vars.** Copy `.env.example` to `.env.local`, then add the same values in Vercel under Project → Settings → Environment Variables. The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is used server-side only, by the admin area and visitor tracking. Never prefix it with `NEXT_PUBLIC_`.
3. **Load data.**
   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-trainers.mjs data/<file>.json
   ```
4. Run `npm run dev` to work locally.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Hero search, UK town map, browse by style and goal, popular towns |
| `/trainers` | Search with every filter. Only the unfiltered page is indexed; filtered views are `noindex, follow`. |
| `/trainers/[slug]` | Trainer profile with breadcrumbs, LocalBusiness structured data and a removal link |
| `/locations`, `/locations/[town]` | Town pages with real counts, specialism links and nearby towns |
| `/locations/[town]/[specialism]` | Town × specialism landing pages. They exist only with 3+ trainers (`MIN_TRAINERS` in `src/lib/topics.ts`). |
| `/locations/[city]/[area]` | Neighbourhood pages for London, Manchester and Birmingham (3-mile radius, list in `src/lib/areas.ts`). They share the route with specialisms. |
| `/locations/[town]/home-visits` | Trainers who come to your home, built like a specialism page |
| `/guides`, `/guides/[slug]` | Short guides for people choosing a trainer (`src/lib/guides.ts`) |
| `/badge.svg` | "Find me on LocalPT" badge for listed trainers' own sites |
| `/counties/[county]` | County hubs linking every town |
| `/specialisms`, `/specialisms/[specialism]` | UK-wide specialism pages linking each town page |
| `/online` | Online coaches across the UK |
| `/sitemap.xml`, `/robots.txt` | Built from live data. Previews are blocked from indexing. |
| `/remove` | Opt-out and correction requests |
| `/privacy` | Draft UK GDPR privacy notice. Get it reviewed before launch. |
| `/shop`, `/shop/[slug]` | Downloadable training plans, sold through Stripe Checkout |
| `/shop/thanks`, `/api/download` | Post-payment download. Every request is checked with Stripe first. |

## Domain and SEO

The site's home is **localpt.co.uk**. Canonical links, the sitemap and structured data use it automatically once it is the project's production domain in Vercel (`VERCEL_PROJECT_PRODUCTION_URL`). From then on, the old `*.vercel.app` address redirects there permanently (see `next.config.ts`). Town and specialism counts are cached for six hours (`src/lib/stats.ts`).

**Renaming the site:** the name, wordmark, tagline and domain all live in `src/brand.ts`. Change that one file and the logo, titles, share images, badge, CSV names and redirects follow.

**What Google sees:** each trainer belongs to the town (and city area) they are nearest to. A town, area or town × specialism page is indexed only when at least 3 trainers belong to it, so towns close together don't compete with the same list. Visitors can still open every page. Profiles with a bio under 80 characters are `noindex` and left out of the sitemap until they have more detail. A removed profile redirects to its town page.

## Admin area

`/admin` is a private dashboard (noindex, signed httpOnly session cookie) with traffic stats, trainer rankings, a filterable client list with CSV export and outreach notes, the outreach-lead pipeline, and removal requests. It needs these Vercel env vars: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` (make one with `node scripts/hash-admin-password.mjs "new password"`), `ADMIN_SESSION_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`. Tables are in `supabase/migrations/20261123000000_admin_analytics.sql`.

Traffic is counted first-party in `analytics_events`, with no cookies and no stored IPs (a daily-rotating visitor hash). Add `data-track="website"` (or `instagram`, `phone`, `email`, `contact_button`) to a link to count clicks on it. Vercel Web Analytics also runs via `<Analytics />`.

## Shop

Plans are defined in `src/lib/products.ts` (prices in pence). The PDFs are stored encrypted in `private/plans/` because this repo is public; see the README there. Vercel needs `STRIPE_SECRET_KEY` (a restricted key is best) and `PLANS_KEY`. After changing either, redeploy.

Claim, removal and correction requests land in the `listing_requests` table, which only the service role can read. To remove a trainer, set `trainers.status = 'removed'`. The import script never re-adds a removed slug.

## Data sourcing rules

- Use only sources that allow reuse: trainers' own public business websites, openly licensed data (for example OpenStreetMap, ODbL, with attribution), or paid APIs used within their terms.
- Don't scrape social networks or other directories. Their terms forbid it.
- Store business contact details only, never home addresses. Set `source`, `source_url` and `source_licence` on every record.
- Respond to opt-outs promptly.
