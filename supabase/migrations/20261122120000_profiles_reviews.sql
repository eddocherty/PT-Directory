-- Profile must-haves: photos, sports & hobbies, reviews, contact enquiries

alter table public.trainers
  add column if not exists sports text[] not null default '{}',
  add column if not exists photos text[] not null default '{}',
  add column if not exists free_consultation boolean not null default false;

create index if not exists trainers_sports_idx on public.trainers using gin (sports);

-- Reviews ---------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  author_name text not null,
  author_email text,
  rating smallint not null check (rating between 1 and 5),
  body text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reviews_trainer_idx on public.reviews (trainer_id) where status = 'published';

alter table public.reviews enable row level security;
create policy "published reviews are public" on public.reviews
  for select using (status = 'published');
create policy "anyone can submit a review for moderation" on public.reviews
  for insert with check (status = 'pending' and is_sample = false);

-- Contact enquiries -------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  goal text,
  message text,
  created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
create policy "anyone can send an enquiry" on public.enquiries for insert with check (true);
-- No select policy: only the service role (and later the claimed trainer) reads enquiries.

-- Rating summary helper -------------------------------------------------------------
create or replace view public.trainer_ratings
with (security_invoker = true) as
select trainer_id, round(avg(rating)::numeric, 1)::double precision as rating_avg, count(*)::int as review_count
from public.reviews where status = 'published'
group by trainer_id;

grant select on public.trainer_ratings to anon, authenticated;

-- Search: add sports filter, photo, sports, ratings ----------------------------------
drop function if exists public.search_trainers(double precision, double precision, double precision, text, text[], text[], boolean, boolean, integer, text, text, integer, integer);

create or replace function public.search_trainers(
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_miles double precision default 25,
  p_city text default null,
  p_styles text[] default null,
  p_goals text[] default null,
  p_sports text[] default null,
  p_online boolean default null,
  p_home_visits boolean default null,
  p_max_price integer default null,
  p_gender text default null,
  p_query text default null,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid, slug text, name text, business_name text, headline text, city text, region text,
  postcode_district text, in_person boolean, online boolean, home_visits boolean,
  price_from integer, price_to integer, gender text, image_url text, is_sample boolean,
  claimed boolean, free_consultation boolean, styles text[], goals text[], sports text[],
  rating_avg double precision, review_count integer, distance_miles double precision, total_count bigint
)
language sql stable
set search_path = public, extensions
as $$
  with origin as (
    select case when p_lat is not null and p_lng is not null
      then st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography end as g
  ),
  base as (
    select t.*,
      (select array_agg(ts.style_slug order by ts.style_slug) from trainer_styles ts where ts.trainer_id = t.id) as style_list,
      (select array_agg(tg.goal_slug order by tg.goal_slug) from trainer_goals tg where tg.trainer_id = t.id) as goal_list,
      case when o.g is not null and t.location is not null
        then st_distance(t.location, o.g) / 1609.344 end as dist
    from trainers t cross join origin o
    where t.status = 'published'
      and (o.g is null
           or (t.location is not null and st_dwithin(t.location, o.g, p_radius_miles * 1609.344))
           or (p_online is true and t.online))
      and (p_city is null or lower(t.city) = lower(p_city))
      and (p_online is null or t.online = p_online)
      and (p_home_visits is null or t.home_visits = p_home_visits)
      and (p_max_price is null or coalesce(t.price_from, 0) <= p_max_price)
      and (p_gender is null or t.gender = p_gender)
      and (p_sports is null or t.sports && p_sports)
      and (p_query is null or t.name ilike '%' || p_query || '%'
           or t.business_name ilike '%' || p_query || '%'
           or t.headline ilike '%' || p_query || '%')
  )
  select b.id, b.slug, b.name, b.business_name, b.headline, b.city, b.region,
    b.postcode_district, b.in_person, b.online, b.home_visits, b.price_from,
    b.price_to, b.gender, b.image_url, b.is_sample, b.claimed_by is not null, b.free_consultation,
    coalesce(b.style_list, '{}'), coalesce(b.goal_list, '{}'), b.sports,
    r.rating_avg, coalesce(r.review_count, 0), b.dist,
    count(*) over ()
  from base b
  left join trainer_ratings r on r.trainer_id = b.id
  where (p_styles is null or b.style_list && p_styles)
    and (p_goals is null or b.goal_list && p_goals)
  order by b.dist asc nulls last, b.claimed_by is not null desc, r.rating_avg desc nulls last, b.name
  limit p_limit offset p_offset;
$$;

grant execute on function public.search_trainers to anon, authenticated;
