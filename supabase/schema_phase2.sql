-- DashTrashTX — Phase 2 schema additions
-- Auth-backed customer/driver/admin portals, subscriptions, homes, routes, completions, storage

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$ begin
  create type user_role as enum ('customer', 'driver', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'paused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stop_action as enum ('pull_out', 'return_in');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stop_status as enum ('pending', 'in_progress', 'completed', 'skipped', 'issue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type route_status as enum ('draft', 'assigned', 'in_progress', 'completed', 'canceled');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- PROFILES (one row per auth user)
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on profiles(role);

-- Auto-create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'customer')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- CUSTOMERS
-- ============================================================================
create table if not exists customers (
  profile_id uuid primary key references profiles(id) on delete cascade,
  email text not null,
  customer_type customer_type not null default 'residential',
  stripe_customer_id text unique,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists customers_email_idx on customers(email);
create index if not exists customers_stripe_idx on customers(stripe_customer_id);

-- ============================================================================
-- DRIVERS
-- ============================================================================
create table if not exists drivers (
  profile_id uuid primary key references profiles(id) on delete cascade,
  email text not null,
  active boolean not null default true,
  vehicle_make_model text,
  has_truck_or_suv boolean,
  license_state text default 'TX',
  hire_date date,
  pay_per_home_cents int not null default 100,
  pay_per_mile_cents int not null default 15,
  created_at timestamptz not null default now()
);
create index if not exists drivers_active_idx on drivers(active);

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(profile_id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_customer_idx on subscriptions(customer_id);
create index if not exists subscriptions_status_idx on subscriptions(status);

-- ============================================================================
-- HOMES (one or many per customer)
-- ============================================================================
create table if not exists homes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(profile_id) on delete cascade,
  label text,
  street_address text not null,
  city text not null,
  state text not null default 'TX',
  zip text not null,
  lat double precision,
  lng double precision,
  pickup_day text not null default 'tuesday',
  num_bins int not null default 1,
  gate_code text,
  bin_location_notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists homes_customer_idx on homes(customer_id);
create index if not exists homes_active_idx on homes(active);
create index if not exists homes_pickup_day_idx on homes(pickup_day);

-- ============================================================================
-- ROUTES + ROUTE_STOPS
-- ============================================================================
create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  route_date date not null,
  driver_id uuid references drivers(profile_id) on delete set null,
  name text,
  status route_status not null default 'draft',
  total_miles double precision,
  total_stops int,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists routes_date_idx on routes(route_date);
create index if not exists routes_driver_idx on routes(driver_id);
create index if not exists routes_status_idx on routes(status);

create table if not exists route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete cascade,
  home_id uuid not null references homes(id) on delete cascade,
  sequence int not null default 0,
  action stop_action not null,
  status stop_status not null default 'pending',
  completed_at timestamptz,
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists route_stops_route_idx on route_stops(route_id);
create index if not exists route_stops_home_idx on route_stops(home_id);
create index if not exists route_stops_status_idx on route_stops(status);

-- ============================================================================
-- STORAGE BUCKET — completion photos
-- ============================================================================
insert into storage.buckets (id, name, public)
select 'completion-photos', 'completion-photos', false
where not exists (select 1 from storage.buckets where id = 'completion-photos');

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table customers enable row level security;
alter table drivers enable row level security;
alter table subscriptions enable row level security;
alter table homes enable row level security;
alter table routes enable row level security;
alter table route_stops enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Helper: is the current user a driver?
create or replace function public.is_driver()
returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'driver');
$$;

-- PROFILES: user can read+update own; admin can read all
drop policy if exists "self read profile" on profiles;
create policy "self read profile" on profiles for select using (auth.uid() = id or public.is_admin());
drop policy if exists "self update profile" on profiles;
create policy "self update profile" on profiles for update using (auth.uid() = id);
drop policy if exists "admin all profile" on profiles;
create policy "admin all profile" on profiles for all using (public.is_admin());

-- CUSTOMERS: self read/insert/update; admin all
drop policy if exists "self read customer" on customers;
create policy "self read customer" on customers for select using (auth.uid() = profile_id or public.is_admin() or public.is_driver());
drop policy if exists "self insert customer" on customers;
create policy "self insert customer" on customers for insert with check (auth.uid() = profile_id);
drop policy if exists "self update customer" on customers;
create policy "self update customer" on customers for update using (auth.uid() = profile_id);
drop policy if exists "admin all customer" on customers;
create policy "admin all customer" on customers for all using (public.is_admin());

-- DRIVERS: self read; admin all
drop policy if exists "self read driver" on drivers;
create policy "self read driver" on drivers for select using (auth.uid() = profile_id or public.is_admin());
drop policy if exists "admin all driver" on drivers;
create policy "admin all driver" on drivers for all using (public.is_admin());

-- SUBSCRIPTIONS: customer reads own; admin all (only writes via service role)
drop policy if exists "self read subscription" on subscriptions;
create policy "self read subscription" on subscriptions for select using (auth.uid() = customer_id or public.is_admin());
drop policy if exists "admin all subscription" on subscriptions;
create policy "admin all subscription" on subscriptions for all using (public.is_admin());

-- HOMES: customer manages own; driver can read (for routes); admin all
drop policy if exists "self crud home" on homes;
create policy "self crud home" on homes for all using (auth.uid() = customer_id or public.is_admin());
drop policy if exists "driver read home" on homes;
create policy "driver read home" on homes for select using (public.is_driver() or public.is_admin());

-- ROUTES: driver sees own routes; admin all
drop policy if exists "driver read route" on routes;
create policy "driver read route" on routes for select using (auth.uid() = driver_id or public.is_admin());
drop policy if exists "driver update route" on routes;
create policy "driver update route" on routes for update using (auth.uid() = driver_id or public.is_admin());
drop policy if exists "admin all route" on routes;
create policy "admin all route" on routes for all using (public.is_admin());

-- ROUTE_STOPS: customer sees their own (via home); driver sees on their route; admin all
drop policy if exists "self read stop" on route_stops;
create policy "self read stop" on route_stops for select using (
  public.is_admin()
  or auth.uid() = (select driver_id from routes where routes.id = route_stops.route_id)
  or auth.uid() = (select customer_id from homes where homes.id = route_stops.home_id)
);
drop policy if exists "driver update stop" on route_stops;
create policy "driver update stop" on route_stops for update using (
  public.is_admin()
  or auth.uid() = (select driver_id from routes where routes.id = route_stops.route_id)
);
drop policy if exists "admin all stop" on route_stops;
create policy "admin all stop" on route_stops for all using (public.is_admin());

-- STORAGE: driver can write to completion-photos; customer can read photos for own stops; admin all
drop policy if exists "driver upload photo" on storage.objects;
create policy "driver upload photo" on storage.objects for insert
  to authenticated with check (bucket_id = 'completion-photos' and (public.is_driver() or public.is_admin()));

drop policy if exists "read photo" on storage.objects;
create policy "read photo" on storage.objects for select
  to authenticated using (bucket_id = 'completion-photos');

-- ============================================================================
-- VIEWS for convenience
-- ============================================================================
create or replace view v_route_with_stops as
select
  r.id as route_id,
  r.route_date,
  r.driver_id,
  r.name as route_name,
  r.status as route_status,
  r.total_miles,
  r.total_stops,
  s.id as stop_id,
  s.sequence,
  s.action,
  s.status as stop_status,
  s.completed_at,
  s.photo_url,
  s.notes,
  h.id as home_id,
  h.street_address,
  h.city,
  h.state,
  h.zip,
  h.lat,
  h.lng,
  h.pickup_day,
  h.bin_location_notes,
  h.gate_code,
  p.full_name as customer_name,
  p.phone as customer_phone
from routes r
join route_stops s on s.route_id = r.id
join homes h on h.id = s.home_id
join profiles p on p.id = h.customer_id
order by r.route_date, s.sequence;
