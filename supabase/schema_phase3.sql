-- ============================================================================
-- PHASE 3: Stripe Connect (driver payouts) + driver payouts ledger
-- Run after schema_phase2.sql. Idempotent — safe to re-run.
-- ============================================================================

-- Drivers: add Stripe Connect account columns
alter table drivers add column if not exists stripe_account_id text;
alter table drivers add column if not exists stripe_payouts_enabled boolean not null default false;
alter table drivers add column if not exists stripe_details_submitted boolean not null default false;
alter table drivers add column if not exists stripe_charges_enabled boolean not null default false;
create unique index if not exists drivers_stripe_account_idx on drivers(stripe_account_id) where stripe_account_id is not null;

-- Payouts ledger — one row per completed route paid to a driver
do $$ begin
  create type payout_status as enum ('pending', 'paid', 'failed', 'manual');
exception when duplicate_object then null; end $$;

create table if not exists driver_payouts (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references drivers(profile_id) on delete cascade,
  route_id uuid not null references routes(id) on delete cascade,
  stops_count int not null default 0,
  miles double precision not null default 0,
  pay_per_home_cents int not null,
  pay_per_mile_cents int not null,
  home_pay_cents int not null default 0,
  mileage_pay_cents int not null default 0,
  total_cents int not null default 0,
  status payout_status not null default 'pending',
  stripe_transfer_id text,
  failure_reason text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists driver_payouts_route_idx on driver_payouts(route_id);
create index if not exists driver_payouts_driver_idx on driver_payouts(driver_id);
create index if not exists driver_payouts_status_idx on driver_payouts(status);

alter table driver_payouts enable row level security;

-- Driver sees own payouts; admin sees all
drop policy if exists "driver read payouts" on driver_payouts;
create policy "driver read payouts" on driver_payouts for select
  using (auth.uid() = driver_id or public.is_admin());
drop policy if exists "admin all payouts" on driver_payouts;
create policy "admin all payouts" on driver_payouts for all using (public.is_admin());

-- View: driver earnings rollup
create or replace view v_driver_earnings as
select
  d.profile_id as driver_id,
  d.email,
  count(distinct dp.route_id) filter (where dp.status = 'paid') as routes_paid,
  count(distinct dp.route_id) filter (where dp.status = 'pending') as routes_pending,
  coalesce(sum(dp.total_cents) filter (where dp.status = 'paid'), 0) as paid_cents,
  coalesce(sum(dp.total_cents) filter (where dp.status = 'pending'), 0) as pending_cents,
  coalesce(sum(dp.stops_count) filter (where dp.status = 'paid'), 0) as homes_serviced,
  coalesce(sum(dp.miles) filter (where dp.status = 'paid'), 0) as miles_driven
from drivers d
left join driver_payouts dp on dp.driver_id = d.profile_id
group by d.profile_id, d.email;

grant select on v_driver_earnings to authenticated;
