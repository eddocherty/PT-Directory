# LocalPT

A directory of personal trainers across the UK. Visitors filter by location and radius, training style, fitness goal, online or in-person sessions, home visits, price and trainer gender.

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind) on Vercel, with Supabase Postgres and PostGIS. postcodes.io (free, Open Government Licence) turns postcodes and towns into coordinates.

Until Supabase env vars are set, the site runs on the fictional sample listings in `data/sample-trainers.json`, so it can be deployed and previewed straight away.

## Setup

1. **Database.** In the Supabase SQL editor, run `supabase/migrations/20261122000000_init.sql`. Or run `supabase db push` with the Supabase CLI.
2. **Env vars.** Copy `.env.example` to `.env.local`, then add the same values in Vercel under Project → Settings → Environment Variables. The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is used server-side only, by the admin area and visitor tracking. Never prefix it with `NEXT_PUBLIC_`.
3. **Load data.**
   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-trainers.mjs data/sample-trainers.json
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
