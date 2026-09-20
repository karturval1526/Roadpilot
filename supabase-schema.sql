-- RoadPilot V11 — esquema inicial Supabase
create table if not exists public.uber_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  uber_driver_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text[] default '{}',
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.driver_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_mode text default 'both',
  weekly_goal numeric default 600000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.uber_connections enable row level security;
alter table public.driver_profiles enable row level security;

create policy "users manage own driver profile"
on public.driver_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users read own uber connection"
on public.uber_connections for select
using (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE de tokens debe realizarse desde una Edge Function
-- con validación del usuario y secretos almacenados en Supabase Secrets.
