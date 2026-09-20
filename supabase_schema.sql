-- ROADPILOT V6 — SUPABASE DATABASE
-- Run this whole script in Supabase SQL Editor.
-- IMPORTANT: Review policies before production use.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text default 'Driver',
  phone text,
  daily_goal numeric default 150,
  weekly_goal numeric default 900,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  radius_km numeric default 5,
  created_at timestamptz default now()
);

create table if not exists public.planner (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_name text not null,
  active boolean default false,
  start_time time default '09:00',
  end_time time default '17:00',
  goal numeric default 120,
  unique(user_id, day_name)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text,
  pay numeric default 0,
  miles numeric default 0,
  minutes numeric default 0,
  zone text,
  score integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.vehicle_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  efficiency numeric default 25,
  fuel_price numeric default 3.50,
  maintenance_per_mile numeric default .12,
  other_per_hour numeric default 1
);

create table if not exists public.platform_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  status text default 'not_connected',
  external_account_label text,
  connected_at timestamptz,
  unique(user_id, platform)
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text default 'free',
  status text default 'inactive',
  price_usd_week numeric default 50,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.support_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  admin_email text,
  note text not null,
  created_at timestamptz default now()
);

-- Helper: determine admin by JWT app_metadata.
create or replace function public.is_admin()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Profiles
alter table public.profiles enable row level security;
create policy "profile_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profile_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profile_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Reusable own-data policy blocks
alter table public.zones enable row level security;
create policy "zones_own_all" on public.zones for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.planner enable row level security;
create policy "planner_own_all" on public.planner for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.orders enable row level security;
create policy "orders_own_all" on public.orders for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.vehicle_settings enable row level security;
create policy "vehicle_own_all" on public.vehicle_settings for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.platform_connections enable row level security;
create policy "platform_own_all" on public.platform_connections for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.subscriptions enable row level security;
create policy "subscription_own_read" on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);

alter table public.support_notes enable row level security;
create policy "support_own_read" on public.support_notes for select to authenticated using ((select auth.uid()) = user_id or public.is_admin());
create policy "support_admin_insert" on public.support_notes for insert to authenticated with check (public.is_admin());

-- Admin read access for support dashboard.
create policy "admin_profiles_read" on public.profiles for select to authenticated using (public.is_admin());
create policy "admin_subscriptions_read" on public.subscriptions for select to authenticated using (public.is_admin());
create policy "admin_connections_read" on public.platform_connections for select to authenticated using (public.is_admin());
create policy "admin_orders_read" on public.orders for select to authenticated using (public.is_admin());

-- Auto-create profile/subscription after signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name','Driver'))
  on conflict (id) do nothing;
  insert into public.subscriptions(user_id, plan, status, price_usd_week)
  values (new.id,'free','inactive',50)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create index if not exists zones_user_idx on public.zones(user_id);
create index if not exists planner_user_idx on public.planner(user_id);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists connections_user_idx on public.platform_connections(user_id);
create index if not exists support_user_idx on public.support_notes(user_id);

-- ADMIN SETUP:
-- After creating your user, set its app_metadata role using the Supabase dashboard
-- or a trusted server-side/admin environment:
-- {"role":"admin"}
-- NEVER put a service-role key in index.html/config.js.
