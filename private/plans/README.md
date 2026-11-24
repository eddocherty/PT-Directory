# Shop plan PDFs (encrypted)

These are the paid LocalPT plans, encrypted with AES-256-GCM because this repository is public.
`/api/download` decrypts them with the `PLANS_KEY` env var, only after Stripe confirms payment.

The plan source and the build script live in the project files (`shop-plans/src/build.mjs`), not in this repo.
To rebuild: `PLANS_KEY=<key> node shop-plans/src/build.mjs <path to this repo>`. If the key is lost, make a new
32-byte key, rebuild, and update `PLANS_KEY` on Vercel (Production and Preview).
