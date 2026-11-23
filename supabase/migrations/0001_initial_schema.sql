-- FleetOps — initial schema
-- Run once in Supabase SQL Editor (or via `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums: small, stable vocabularies shared by the UI and the database.
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'operator', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.driver_status as enum ('active', 'on_leave', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.vehicle_status as enum ('moving', 'idle', 'offline', 'attention');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.trip_status as enum ('completed', 'in_progress', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_type as enum (
    'trip_started', 'trip_completed', 'vehicle_stopped', 'vehicle_resumed',
    'overspeed_detected', 'ignition_on', 'ignition_off', 'went_offline',
    'low_fuel', 'low_battery', 'long_idle'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_severity as enum ('info', 'warning', 'critical');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role public.user_role not null default 'operator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  license_number text not null unique,
  status public.driver_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique,
  vehicle_name text not null,
  vehicle_type text not null check (
    vehicle_type in ('Delivery Van', 'Cargo Truck', 'Passenger Van', 'Pickup', 'Electric Van', 'Box Truck')
  ),
  manufacturer text not null,
  model text not null,
  driver_id uuid references public.drivers (id) on delete set null,
  status public.vehicle_status not null default 'offline',
  fuel_level numeric(5, 2) not null default 0 check (fuel_level between 0 and 100),
  battery_level numeric(5, 2) not null default 0 check (battery_level between 0 and 100),
  ignition_state boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  driver_id uuid references public.drivers (id) on delete set null,
  start_location text not null,
  end_location text not null,
  start_latitude double precision not null,
  start_longitude double precision not null,
  end_latitude double precision not null,
  end_longitude double precision not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  distance_km numeric(8, 2) not null default 0 check (distance_km >= 0),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  average_speed numeric(6, 2) not null default 0,
  maximum_speed numeric(6, 2) not null default 0,
  idle_minutes integer not null default 0 check (idle_minutes >= 0),
  halt_count integer not null default 0 check (halt_count >= 0),
  overspeed_events integer not null default 0 check (overspeed_events >= 0),
  status public.trip_status not null default 'completed',
  created_at timestamptz not null default now(),
  constraint trips_time_order check (ended_at is null or ended_at >= started_at)
);

create table if not exists public.vehicle_locations (
  id bigint generated always as identity primary key,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  trip_id uuid references public.trips (id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  speed numeric(6, 2) not null default 0 check (speed >= 0),
  recorded_at timestamptz not null,
  ignition_state boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_events (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  trip_id uuid references public.trips (id) on delete cascade,
  event_type public.event_type not null,
  severity public.event_severity not null default 'info',
  description text not null,
  occurred_at timestamptz not null,
  acknowledged boolean not null default false,
  acknowledged_by uuid references public.profiles (id) on delete set null,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (dashboard queries are ordered by time and filtered by status)
-- ---------------------------------------------------------------------------
create index if not exists idx_vehicles_status on public.vehicles (status);
create index if not exists idx_vehicles_driver on public.vehicles (driver_id);
create index if not exists idx_trips_started_at on public.trips (started_at desc);
create index if not exists idx_trips_vehicle_started on public.trips (vehicle_id, started_at desc);
create index if not exists idx_trips_status on public.trips (status);
create index if not exists idx_locations_vehicle_time on public.vehicle_locations (vehicle_id, recorded_at desc);
create index if not exists idx_locations_trip_time on public.vehicle_locations (trip_id, recorded_at);
create index if not exists idx_events_occurred_at on public.vehicle_events (occurred_at desc);
create index if not exists idx_events_vehicle on public.vehicle_events (vehicle_id);
create index if not exists idx_events_unacknowledged on public.vehicle_events (acknowledged, occurred_at desc)
  where acknowledged = false;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_vehicles_updated_at on public.vehicles;
create trigger trg_vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Read models used by the dashboard map and fleet summary.
-- security_invoker makes RLS on the base tables apply to callers.
-- ---------------------------------------------------------------------------
create or replace view public.vehicle_latest_location as
select distinct on (vehicle_id)
  vehicle_id, trip_id, latitude, longitude, speed, recorded_at, ignition_state
from public.vehicle_locations
order by vehicle_id, recorded_at desc;
alter view public.vehicle_latest_location set (security_invoker = true);

create or replace view public.fleet_status_summary as
select status, count(*)::int as vehicle_count
from public.vehicles
group by status;
alter view public.fleet_status_summary set (security_invoker = true);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Internal operations workflow: any authenticated user may READ operational
-- data. No table-level INSERT/UPDATE/DELETE is granted; the only writes go
-- through the narrow SECURITY DEFINER functions below.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.vehicle_locations enable row level security;
alter table public.vehicle_events enable row level security;

drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "drivers readable by authenticated users" on public.drivers;
create policy "drivers readable by authenticated users"
  on public.drivers for select to authenticated using (true);

drop policy if exists "vehicles readable by authenticated users" on public.vehicles;
create policy "vehicles readable by authenticated users"
  on public.vehicles for select to authenticated using (true);

drop policy if exists "trips readable by authenticated users" on public.trips;
create policy "trips readable by authenticated users"
  on public.trips for select to authenticated using (true);

drop policy if exists "locations readable by authenticated users" on public.vehicle_locations;
create policy "locations readable by authenticated users"
  on public.vehicle_locations for select to authenticated using (true);

drop policy if exists "events readable by authenticated users" on public.vehicle_events;
create policy "events readable by authenticated users"
  on public.vehicle_events for select to authenticated using (true);

grant usage on schema public to authenticated;
grant select on public.profiles, public.drivers, public.vehicles, public.trips,
  public.vehicle_locations, public.vehicle_events,
  public.vehicle_latest_location, public.fleet_status_summary to authenticated;

-- ---------------------------------------------------------------------------
-- Narrow write RPCs
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    'operator'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.update_my_profile(p_full_name text)
returns public.profiles
language plpgsql security definer set search_path = public
as $$
declare result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if length(trim(p_full_name)) = 0 or length(p_full_name) > 80 then
    raise exception 'Display name must be 1-80 characters';
  end if;
  update public.profiles
     set full_name = trim(p_full_name), updated_at = now()
   where id = auth.uid()
  returning * into result;
  return result;
end; $$;

create or replace function public.acknowledge_event(p_event_id uuid)
returns public.vehicle_events
language plpgsql security definer set search_path = public
as $$
declare result public.vehicle_events;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  update public.vehicle_events
     set acknowledged = true, acknowledged_at = now(), acknowledged_by = auth.uid()
   where id = p_event_id and acknowledged = false
  returning * into result;
  return result;
end; $$;

revoke all on function public.update_my_profile(text) from public;
revoke all on function public.acknowledge_event(uuid) from public;
grant execute on function public.update_my_profile(text) to authenticated;
grant execute on function public.acknowledge_event(uuid) to authenticated;
