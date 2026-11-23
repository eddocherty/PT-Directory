-- Admin area: first-party analytics, trainer outreach tracking, outreach leads.
-- Every table here has row level security on and NO policies, so only the
-- service role (used by the server-side admin pages) can read or write them.

-- Analytics events -------------------------------------------------------------
-- No cookies and no IP addresses are stored. visitor_hash is a one-way hash of
-- (IP + browser + a salt that changes every day), so a visitor can be counted
-- once per day but can't be followed from one day to the next.
create table if not exists public.analytics_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('pageview', 'contact')),
  path text not null,
  referrer_host text,
  trainer_id uuid references public.trainers (id) on delete set null,
  detail text,                 -- for kind = 'contact': website, enquiry, instagram, phone, contact_button
  visitor_hash text,
  country text,
  device text check (device in ('mobile', 'tablet', 'desktop'))
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_events_trainer_idx on public.analytics_events (trainer_id, kind, created_at)
  where trainer_id is not null;
alter table public.analytics_events enable row level security;

-- Outreach status for listed trainers -----------------------------------------------
create table if not exists public.trainer_outreach (
  trainer_id uuid primary key references public.trainers (id) on delete cascade,
  status text not null default 'Not contacted',
  notes text,
  last_contacted date,
  updated_at timestamptz not null default now()
);
alter table public.trainer_outreach enable row level security;

-- Outreach leads (social-only trainers, not on the site) ------------------------------
create table if not exists public.outreach_leads (
  id bigserial primary key,
  list_city text not null,
  name text not null,
  area text,
  area_confirmed text,
  specialism text,
  facebook_url text,
  instagram_url text,
  website text,
  contact_route text,
  status text not null default 'Not contacted',
  notes text,
  last_contacted date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (list_city, name)
);
alter table public.outreach_leads enable row level security;

-- Dashboard numbers in one call (service role only) ------------------------------
create or replace function public.admin_dashboard(p_days integer default 30)
returns jsonb
language sql stable
set search_path = public
as $$
  with ev as (
    select * from analytics_events where created_at >= now() - make_interval(days => p_days)
  ),
  pv as (select * from ev where kind = 'pageview')
  select jsonb_build_object(
    'pageviews', (select count(*) from pv),
    'visitors', (select count(distinct (visitor_hash, created_at::date)) from pv where visitor_hash is not null),
    'profile_views', (select count(*) from pv where trainer_id is not null),
    'contacts', (select count(*) from ev where kind = 'contact'),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'pageviews', d.pv, 'visitors', d.uv) order by d.day)
      from (
        select g.day::date as day,
          (select count(*) from pv where pv.created_at::date = g.day::date) as pv,
          (select count(distinct visitor_hash) from pv where pv.created_at::date = g.day::date) as uv
        from generate_series((now() - make_interval(days => p_days - 1))::date, now()::date, interval '1 day') g(day)
      ) d), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(x) from (
        select path, count(*) as views, count(distinct (visitor_hash, created_at::date)) as visitors
        from pv group by path order by views desc limit 15) x), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(x) from (
        select coalesce(referrer_host, 'Direct / none') as source, count(*) as views
        from pv group by 1 order by views desc limit 15) x), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(x) from (
        select coalesce(country, '??') as country, count(*) as views
        from pv group by 1 order by views desc limit 10) x), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(x) from (
        select coalesce(device, 'unknown') as device, count(*) as views
        from pv group by 1 order by views desc) x), '[]'::jsonb),
    'trainer_stats', coalesce((
      select jsonb_agg(x) from (
        select trainer_id,
          count(*) filter (where kind = 'pageview') as views,
          count(*) filter (where kind = 'contact') as contacts
        from ev where trainer_id is not null group by trainer_id) x), '[]'::jsonb)
  );
$$;

revoke execute on function public.admin_dashboard(integer) from public, anon, authenticated;
grant execute on function public.admin_dashboard(integer) to service_role;
