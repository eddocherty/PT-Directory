# Train Local

A directory of personal trainers across the UK. Visitors filter by location and radius, training style, fitness goal, online or in-person sessions, home visits, price and trainer gender.

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind) on Vercel, with Supabase Postgres and PostGIS. postcodes.io (free, Open Government Licence) turns postcodes and towns into coordinates.

Until Supabase env vars are set, the site runs on the fictional sample listings in `data/sample-trainers.json`, so it can be deployed and previewed straight away.

## Setup

1. **Database.** In the Supabase SQL editor, run `supabase/migrations/20261122000000_init.sql`. Or run `supabase db push` with the Supabase CLI.
2. **Env vars.** Copy `.env.example` to `.env.local`, then add the same values in Vercel under Project → Settings → Environment Variables. The service role key is only for the import script. Don't add it to Vercel.
3. **Load data.**
   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-trainers.mjs data/sample-trainers.json
   ```
4. Run `npm run dev` to work locally.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Hero search, browse by style, popular cities |
| `/trainers` | Search with every filter. Filters live in the URL, so every result page can be shared and indexed. |
| `/trainers/[slug]` | Trainer profile, plus "claim" and "remove" links |
| `/locations`, `/locations/[city]` | City landing pages for SEO |
| `/for-trainers` | Claim or add a profile |
| `/remove` | Opt-out request |
| `/privacy` | Draft UK GDPR privacy notice. Get it reviewed before launch. |

Claim, removal and correction requests land in the `listing_requests` table, which only the service role can read. To remove a trainer, set `trainers.status = 'removed'`. The import script never re-adds a removed slug.

## Data sourcing rules

- Use only sources that allow reuse: trainers' own public business websites, openly licensed data (for example OpenStreetMap, ODbL, with attribution), or paid APIs used within their terms.
- Don't scrape social networks or other directories. Their terms forbid it.
- Store business contact details only, never home addresses. Set `source`, `source_url` and `source_licence` on every record.
- Respond to opt-outs promptly.
