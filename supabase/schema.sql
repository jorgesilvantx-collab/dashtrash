-- DashTrashTX — Phase 1 schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/aikmjiryhfaiofejpsfy/sql)

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$ begin
  create type customer_type as enum ('residential', 'enterprise', 'elderly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new', 'contacted', 'converted', 'declined');
exception when duplicate_object then null; end $$;

do $$ begin
  create type waitlist_status as enum ('waiting', 'cluster_ready', 'notified', 'converted', 'declined');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('new', 'reviewing', 'interview', 'hired', 'rejected');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- SERVICE AREAS
-- ============================================================================
create table if not exists service_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  center_lat double precision not null,
  center_lng double precision not null,
  radius_miles double precision not null default 15,
  active boolean not null default true,
  cluster_threshold int not null default 25,
  created_at timestamptz not null default now()
);

-- Seed a default service area (user can edit later in dispatch panel)
insert into service_areas (name, center_lat, center_lng, radius_miles, active, cluster_threshold)
select 'Primary Service Area', 30.2672, -97.7431, 15, true, 25
where not exists (select 1 from service_areas);

-- ============================================================================
-- CUSTOMER LEADS (signups before they become paying customers)
-- ============================================================================
create table if not exists customer_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  customer_type customer_type not null default 'residential',
  street_address text not null,
  city text not null,
  state text not null default 'TX',
  zip text not null,
  lat double precision,
  lng double precision,
  pickup_day text,
  num_bins int default 1,
  num_properties int default 1,
  insurance_provider text,
  insurance_member_id text,
  notes text,
  status lead_status not null default 'new',
  in_service_area boolean,
  created_at timestamptz not null default now()
);

create index if not exists customer_leads_email_idx on customer_leads(email);
create index if not exists customer_leads_status_idx on customer_leads(status);

-- ============================================================================
-- WAITLIST (customers outside service radius)
-- ============================================================================
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  customer_type customer_type not null default 'residential',
  street_address text not null,
  city text not null,
  state text not null default 'TX',
  zip text not null,
  lat double precision not null,
  lng double precision not null,
  cluster_key text,
  cluster_size_at_signup int,
  status waitlist_status not null default 'waiting',
  notes text,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_cluster_key_idx on waitlist(cluster_key);
create index if not exists waitlist_status_idx on waitlist(status);
create index if not exists waitlist_email_idx on waitlist(email);

-- ============================================================================
-- JOB APPLICATIONS (drivers + ops)
-- ============================================================================
create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  city text,
  state text default 'TX',
  position text not null default 'driver',
  vehicle_make_model text,
  has_truck_or_suv boolean,
  availability text,
  years_driving int,
  has_license boolean,
  has_insurance boolean,
  why_join text,
  status application_status not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists job_applications_status_idx on job_applications(status);
create index if not exists job_applications_email_idx on job_applications(email);

-- ============================================================================
-- NOTIFICATIONS OUTBOX (email queue — processed by edge function later)
-- ============================================================================
create table if not exists notifications_outbox (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  subject text not null,
  body text not null,
  template text,
  payload jsonb,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_outbox_sent_idx on notifications_outbox(sent_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table customer_leads enable row level security;
alter table waitlist enable row level security;
alter table job_applications enable row level security;
alter table service_areas enable row level security;
alter table notifications_outbox enable row level security;

-- Anonymous can INSERT into lead-capture tables (public forms)
drop policy if exists "anon can insert leads" on customer_leads;
create policy "anon can insert leads" on customer_leads for insert to anon with check (true);

drop policy if exists "anon can insert waitlist" on waitlist;
create policy "anon can insert waitlist" on waitlist for insert to anon with check (true);

drop policy if exists "anon can insert applications" on job_applications;
create policy "anon can insert applications" on job_applications for insert to anon with check (true);

-- Anonymous can READ active service areas (for radius check in the browser)
drop policy if exists "anon can read service areas" on service_areas;
create policy "anon can read service areas" on service_areas for select to anon using (active = true);

-- Anonymous can count waitlist entries by cluster_key (for "X others in your area" UX)
drop policy if exists "anon can read waitlist counts" on waitlist;
create policy "anon can read waitlist counts" on waitlist for select to anon using (true);
