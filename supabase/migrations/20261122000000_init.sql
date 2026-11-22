-- UK personal trainer directory: initial schema
create extension if not exists postgis with schema extensions;

-- Lookup tables -------------------------------------------------------------
create table public.training_styles (
  slug text primary key,
  name text not null
);

create table public.fitness_goals (
  slug text primary key,
  name text not null
);

-- Trainers ------------------------------------------------------------------
create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  business_name text,
  headline text,
  bio text,
  gender text check (gender in ('female', 'male', 'non-binary')),
  city text,
  region text,
  postcode_district text,            -- e.g. "M4", never a full home postcode
  location extensions.geography(point, 4326),
  in_person boolean not null default true,
  online boolean not null default false,
  home_visits boolean not null default false,
  price_from integer,                -- GBP per session
  price_to integer,
  qualifications text[] not null default '{}',
  years_experience integer,
  website text,
  email text,
  phone text,
  instagram text,
  image_url text,
  -- provenance + GDPR
  source text not null default 'manual',   -- e.g. 'osm', 'google_places', 'website', 'self'
  source_url text,
  source_licence text,
  last_verified_at timestamptz,
  is_sample boolean not null default false,
  claimed_by uuid references auth.users (id) on delete set null,
  claimed_at timestamptz,
  status text not null default 'published' check (status in ('published', 'hidden', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trainers_location_idx on public.trainers using gist (location);
create index trainers_city_idx on public.trainers (lower(city));
create index trainers_status_idx on public.trainers (status);

create table public.trainer_styles (
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  style_slug text not null references public.training_styles (slug) on delete cascade,
  primary key (trainer_id, style_slug)
);

create table public.trainer_goals (
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  goal_slug text not null references public.fitness_goals (slug) on delete cascade,
  primary key (trainer_id, goal_slug)
);

-- Claim / removal requests ---------------------------------------------------
create table public.listing_requests (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers (id) on delete set null,
  kind text not null check (kind in ('claim', 'removal', 'correction')),
  requester_name text,
  requester_email text not null,
  message text,
  status text not null default 'open' check (status in ('open', 'done', 'rejected')),
  created_at timestamptz not null default now()
);

-- updated_at trigger ---------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trainers_touch before update on public.trainers
for each row execute function public.touch_updated_at();

-- Row level security ---------------------------------------------------------
alter table public.training_styles enable row level security;
alter table public.fitness_goals enable row level security;
alter table public.trainers enable row level security;
alter table public.trainer_styles enable row level security;
alter table public.trainer_goals enable row level security;
alter table public.listing_requests enable row level security;

create policy "styles are public" on public.training_styles for select using (true);
create policy "goals are public" on public.fitness_goals for select using (true);
create policy "published trainers are public" on public.trainers
  for select using (status = 'published' or claimed_by = auth.uid());
create policy "owners edit their listing" on public.trainers
  for update using (claimed_by = auth.uid()) with check (claimed_by = auth.uid());
create policy "trainer styles are public" on public.trainer_styles for select using (true);
create policy "trainer goals are public" on public.trainer_goals for select using (true);
create policy "anyone can submit a request" on public.listing_requests
  for insert with check (true);
-- No select policy on listing_requests: only the service role can read them.

-- Search ---------------------------------------------------------------------
create or replace function public.search_trainers(
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_miles double precision default 25,
  p_city text default null,
  p_styles text[] default null,
  p_goals text[] default null,
  p_online boolean default null,
  p_home_visits boolean default null,
  p_max_price integer default null,
  p_gender text default null,
  p_query text default null,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  business_name text,
  headline text,
  city text,
  region text,
  postcode_district text,
  in_person boolean,
  online boolean,
  home_visits boolean,
  price_from integer,
  price_to integer,
  gender text,
  image_url text,
  is_sample boolean,
  claimed boolean,
  styles text[],
  goals text[],
  distance_miles double precision,
  total_count bigint
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
      (select array_agg(ts.style_slug order by ts.style_slug) from trainer_styles ts where ts.trainer_id = t.id) as styles,
      (select array_agg(tg.goal_slug order by tg.goal_slug) from trainer_goals tg where tg.trainer_id = t.id) as goals,
      case when o.g is not null and t.location is not null
        then st_distance(t.location, o.g) / 1609.344 end as distance_miles
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
      and (p_query is null or t.name ilike '%' || p_query || '%'
           or t.business_name ilike '%' || p_query || '%'
           or t.headline ilike '%' || p_query || '%')
  )
  select b.id, b.slug, b.name, b.business_name, b.headline, b.city, b.region,
    b.postcode_district, b.in_person, b.online, b.home_visits, b.price_from,
    b.price_to, b.gender, b.image_url, b.is_sample, b.claimed_by is not null,
    coalesce(b.styles, '{}'), coalesce(b.goals, '{}'), b.distance_miles,
    count(*) over ()
  from base b
  where (p_styles is null or b.styles && p_styles)
    and (p_goals is null or b.goals && p_goals)
  order by b.distance_miles asc nulls last, b.claimed_by is not null desc, b.name
  limit p_limit offset p_offset;
$$;

grant execute on function public.search_trainers to anon, authenticated;

-- Seed lookup data -----------------------------------------------------------
insert into public.training_styles (slug, name) values
  ('strength', 'Strength training'),
  ('bodybuilding', 'Bodybuilding'),
  ('powerlifting', 'Powerlifting'),
  ('hiit', 'HIIT'),
  ('crossfit', 'CrossFit style'),
  ('boxing', 'Boxing & combat'),
  ('yoga', 'Yoga'),
  ('pilates', 'Pilates'),
  ('kettlebells', 'Kettlebells'),
  ('calisthenics', 'Calisthenics'),
  ('running', 'Running coaching'),
  ('functional', 'Functional training'),
  ('bootcamp', 'Outdoor bootcamp'),
  ('mobility', 'Mobility & stretching')
on conflict (slug) do nothing;

insert into public.fitness_goals (slug, name) values
  ('weight-loss', 'Weight loss'),
  ('muscle-gain', 'Muscle gain'),
  ('general-fitness', 'General fitness'),
  ('sports-performance', 'Sports performance'),
  ('rehab', 'Injury rehab'),
  ('pre-post-natal', 'Pre & post natal'),
  ('older-adults', 'Older adults'),
  ('flexibility', 'Flexibility'),
  ('endurance', 'Endurance'),
  ('competition-prep', 'Competition prep'),
  ('confidence', 'Beginners & confidence')
on conflict (slug) do nothing;
