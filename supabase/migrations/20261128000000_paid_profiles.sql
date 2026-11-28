-- Paid trainer profiles (£10 a month). Free listings are untouched: everything here is extra,
-- and only shows on a trainer's page while trainers.is_paid is true.
-- Safe to run more than once.

-- 1. Which trainers are paying ------------------------------------------------------------
alter table public.trainers
  add column if not exists is_paid boolean not null default false,
  add column if not exists paid_since timestamptz,
  -- ed switched them on by hand (e.g. paid another way); Stripe never switches these off
  add column if not exists paid_manual boolean not null default false;
create index if not exists trainers_is_paid_idx on public.trainers (is_paid) where is_paid;

-- 2. What a paying trainer has on their page ----------------------------------------------
-- Read and written by the server only (service role), so private fields such as the
-- enquiry email never reach the browser. RLS on, no policies.
create table if not exists public.paid_profiles (
  trainer_id uuid primary key references public.trainers (id) on delete cascade,
  about text,                                   -- the trainer's own words; replaces our bio while paid
  gallery text[] not null default '{}',         -- public photo URLs, first one is the main photo
  videos jsonb not null default '[]',           -- [{ url, title }]  YouTube / Vimeo links
  prices jsonb not null default '[]',           -- [{ label, price, note }]  supplied by the trainer
  prices_updated_at date,
  workouts jsonb not null default '[]',         -- [{ title, body, link }]
  sections jsonb not null default '[]',         -- [{ heading, body }]  anything else they want
  reviews jsonb not null default '[]',          -- [{ author, body, rating, source, date }]  supplied by the trainer
  taking_clients text check (taking_clients in ('yes', 'waitlist', 'no')),
  taking_clients_updated_at date,
  enquiry_email text,                           -- where enquiries are forwarded (private)
  whatsapp text,
  updated_at timestamptz not null default now()
);
alter table public.paid_profiles enable row level security;

-- 3. Stripe subscriptions -------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers (id) on delete set null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  email text,
  name text,                                    -- name on the card / Stripe customer
  status text not null default 'incomplete',    -- Stripe's status: active, past_due, canceled, ...
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_trainer_idx on public.subscriptions (trainer_id);
alter table public.subscriptions enable row level security;

-- 4. Enquiries: remember whether we passed them on ------------------------------------------
alter table public.enquiries
  add column if not exists forwarded_at timestamptz,
  add column if not exists forward_error text;

-- 5. Photo storage: a public bucket. Only ed's /admin can upload, through short-lived signed
-- links the server hands out.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trainer-media', 'trainer-media', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
