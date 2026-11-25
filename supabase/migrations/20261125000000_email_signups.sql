-- Free plan samples: people swap their email for a few sample pages of a plan.
-- RLS on with no policies: only the server (service role) can read or write.
create table if not exists public.email_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254 and email like '%@%'),
  plan_slug text not null,
  -- true only if they ticked the box to get occasional emails about new plans and guides (PECR consent)
  marketing_ok boolean not null default false,
  source_path text,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create index if not exists email_signups_created_idx on public.email_signups (created_at desc);
create index if not exists email_signups_email_idx on public.email_signups (lower(email));
alter table public.email_signups enable row level security;
