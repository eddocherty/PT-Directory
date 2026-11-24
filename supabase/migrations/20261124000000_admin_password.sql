-- Lets ed change the admin password from /admin/password.
-- One row (id = 1) holding a scrypt hash. RLS on with no policies: service role only.
create table if not exists public.admin_credentials (
  id smallint primary key check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.admin_credentials enable row level security;
