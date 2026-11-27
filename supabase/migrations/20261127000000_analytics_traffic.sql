-- Separate real visitors from our own visits and bots.
-- Each analytics row now says what kind of traffic it was:
--   traffic = 'real'      a member of the public
--   traffic = 'internal'  ed's own devices or Claude's testing
--   traffic = 'bot'       crawlers, bots and automated browsers
-- reason says why a row isn't 'real'. Still no cookies on visitors and no IP addresses stored.
-- Safe to run more than once.

alter table public.analytics_events add column if not exists traffic text not null default 'real';
alter table public.analytics_events add column if not exists reason text;
do $$ begin
  alter table public.analytics_events add constraint analytics_events_traffic_check check (traffic in ('real', 'internal', 'bot'));
exception when duplicate_object then null; end $$;
create index if not exists analytics_events_traffic_idx on public.analytics_events (traffic, created_at);

-- Reclassify past rows (before this change nothing was tagged) -----------------------------
-- 1. Before the localpt.co.uk launch on 25 Nov the site wasn't public, so every view was ours.
update public.analytics_events set traffic = 'internal', reason = 'before-launch'
where created_at < '2026-11-25' and traffic = 'real' and reason is null;
-- 2. Any device that viewed 40+ pages in one day before this fix: our own testing sessions.
update public.analytics_events e set traffic = 'internal', reason = 'heavy-testing'
from (
  select created_at::date as d, visitor_hash
  from public.analytics_events
  where visitor_hash is not null and kind = 'pageview' and created_at < '2026-11-28'
  group by 1, 2 having count(*) >= 40
) h
where e.created_at::date = h.d and e.visitor_hash = h.visitor_hash and e.traffic = 'real' and e.reason is null
  and e.created_at < '2026-11-28';

-- Dashboard numbers in one call (service role only) ------------------------------------------
-- p_traffic: 'real' (default), 'excluded' (internal + bots) or 'all'.
-- A device that was tagged as ours at any point in a day counts as ours for that whole day,
-- and any device with 100+ page views in a day is treated as testing.
drop function if exists public.admin_dashboard(integer);
create or replace function public.admin_dashboard(p_days integer default 30, p_traffic text default 'real')
returns jsonb
language sql stable
set search_path = public
as $$
  with base as (
    select e.*, e.created_at::date as d from analytics_events e
    where e.created_at >= now() - make_interval(days => p_days)
  ),
  flagged as (
    select d, visitor_hash, min(reason) as reason from base
    where visitor_hash is not null and traffic <> 'real' group by 1, 2
  ),
  heavy as (
    select d, visitor_hash from base
    where visitor_hash is not null and kind = 'pageview' group by 1, 2 having count(*) >= 100
  ),
  tagged as (
    select b.*,
      case when b.traffic <> 'real' then b.traffic
           when f.d is not null or h.d is not null then 'internal'
           else 'real' end as eff,
      case when b.traffic <> 'real' then coalesce(b.reason, b.traffic)
           when f.d is not null then 'same-device'
           when h.d is not null then 'heavy'
           end as eff_reason
    from base b
    left join flagged f on f.d = b.d and f.visitor_hash = b.visitor_hash
    left join heavy h on h.d = b.d and h.visitor_hash = b.visitor_hash
  ),
  ev as (
    select * from tagged
    where case p_traffic when 'all' then true when 'excluded' then eff <> 'real' else eff = 'real' end
  ),
  pv as (select * from ev where kind = 'pageview')
  select jsonb_build_object(
    'pageviews', (select count(*) from pv),
    'visitors', (select count(distinct (visitor_hash, d)) from pv where visitor_hash is not null),
    'profile_views', (select count(*) from pv where trainer_id is not null),
    'contacts', (select count(*) from ev where kind = 'contact'),
    'split', jsonb_build_object(
      'real', (select count(*) from tagged where kind = 'pageview' and eff = 'real'),
      'internal', (select count(*) from tagged where kind = 'pageview' and eff = 'internal'),
      'bot', (select count(*) from tagged where kind = 'pageview' and eff = 'bot'),
      'real_visitors', (select count(distinct (visitor_hash, d)) from tagged where kind = 'pageview' and eff = 'real' and visitor_hash is not null),
      'real_contacts', (select count(*) from tagged where kind = 'contact' and eff = 'real'),
      'excluded_contacts', (select count(*) from tagged where kind = 'contact' and eff <> 'real')
    ),
    'reasons', coalesce((
      select jsonb_agg(x order by x.views desc) from (
        select eff_reason as reason, eff as traffic, count(*) as views
        from tagged where kind = 'pageview' and eff <> 'real' group by 1, 2) x), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', g.day, 'pageviews', g.pv, 'visitors', g.uv, 'excluded', g.ex) order by g.day)
      from (
        select s.day::date as day,
          (select count(*) from pv where pv.d = s.day::date) as pv,
          (select count(distinct visitor_hash) from pv where pv.d = s.day::date) as uv,
          (select count(*) from tagged t where t.kind = 'pageview' and t.eff <> 'real' and t.d = s.day::date) as ex
        from generate_series((now() - make_interval(days => p_days - 1))::date, now()::date, interval '1 day') s(day)
      ) g), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(x) from (
        select path, count(*) as views, count(distinct (visitor_hash, d)) as visitors
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

revoke execute on function public.admin_dashboard(integer, text) from public, anon, authenticated;
grant execute on function public.admin_dashboard(integer, text) to service_role;
