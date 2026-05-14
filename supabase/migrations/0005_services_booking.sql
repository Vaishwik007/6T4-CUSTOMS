-- 6T4 Customs — Services + Bookings v1
-- Service catalog + bay-slot reservation system. Idempotent.

create extension if not exists "uuid-ossp";

-- =======================================================
-- SERVICES catalog (replaces static lib/services/catalog.ts at runtime)
-- =======================================================
create table if not exists public.services (
  id text primary key,                          -- 'stage-2-flash'
  slug text unique not null,
  name text not null,
  category text not null check (category in ('tuning','service','dyno','fabrication','installation','diagnostic')),
  short_description text not null,
  long_description text,
  base_price int not null default 0,            -- 0 = quote-only
  price_label text,                             -- e.g. "From ₹32,000"
  duration_minutes int not null,
  requires_quote boolean not null default false,
  requires_bike boolean not null default true,
  advance_amount int,                           -- optional Razorpay pre-pay
  bay_required int not null default 1,
  active boolean not null default true,
  tier smallint check (tier between 1 and 3),
  position int not null default 0,
  images text[] not null default '{}',
  prerequisites text[] not null default '{}',
  includes text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_category_idx on public.services(category);
create index if not exists services_active_idx on public.services(active) where active = true;

create or replace function public.touch_services_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists services_touch on public.services;
create trigger services_touch before update on public.services
  for each row execute procedure public.touch_services_updated_at();

alter table public.services enable row level security;
drop policy if exists "services:public-read" on public.services;
create policy "services:public-read" on public.services for select using (active);

-- =======================================================
-- BAY CALENDAR (admin can block specific bays/dates)
-- =======================================================
create table if not exists public.bay_calendar (
  date date not null,
  bay_number int not null,
  blocked boolean not null default false,
  block_reason text,
  primary key (date, bay_number)
);

alter table public.bay_calendar enable row level security;
-- no public policy — service role only

-- =======================================================
-- SERVICE BOOKINGS (customer-facing slot reservations)
-- =======================================================
create table if not exists public.service_bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  service_id text not null references public.services(id),
  order_id uuid references public.orders(id) on delete set null,
  booking_ref text unique,
  scheduled_for timestamptz not null,
  duration_minutes int not null,
  bay_number int,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  bike_info jsonb not null,                     -- {brandSlug, modelSlug, year, plate?}
  notes text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','in_progress','completed','cancelled','no_show')),
  advance_paid int not null default 0,
  balance_due int not null default 0,
  reminder_sent_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now()
);
create index if not exists service_bookings_date_idx on public.service_bookings(scheduled_for);
create index if not exists service_bookings_user_idx on public.service_bookings(user_id);
create index if not exists service_bookings_status_idx on public.service_bookings(status);
create index if not exists service_bookings_service_idx on public.service_bookings(service_id, scheduled_for);

alter table public.service_bookings enable row level security;
drop policy if exists "bookings:self-read" on public.service_bookings;
create policy "bookings:self-read" on public.service_bookings for select
  using (auth.uid() = user_id or user_id is null);
drop policy if exists "bookings:self-insert" on public.service_bookings;
create policy "bookings:self-insert" on public.service_bookings for insert with check (true);

-- =======================================================
-- get_available_slots — query available time windows for a service+date
-- =======================================================
create or replace function public.get_available_slots(
  p_service_id text,
  p_date date,
  p_bay_count int default 3,
  p_open_hour int default 10,
  p_close_hour int default 19
) returns table(slot_start timestamptz, slot_end timestamptz, bay_number int)
language plpgsql stable as $$
declare
  service_dur int;
begin
  select duration_minutes into service_dur from public.services where id = p_service_id;
  if service_dur is null then
    return;
  end if;

  return query
  with candidates as (
    select
      ((p_date::timestamptz at time zone 'Asia/Kolkata')
        + make_interval(hours => h)) as start_ts,
      ((p_date::timestamptz at time zone 'Asia/Kolkata')
        + make_interval(hours => h, mins => service_dur)) as end_ts,
      b.bay_number
    from generate_series(p_open_hour, p_close_hour - 1) h
    cross join generate_series(1, p_bay_count) b(bay_number)
  )
  select c.start_ts, c.end_ts, c.bay_number
    from candidates c
    left join public.bay_calendar bc
      on bc.date = p_date and bc.bay_number = c.bay_number and bc.blocked
   where bc.bay_number is null
     and not exists (
       select 1 from public.service_bookings sb
        where sb.bay_number = c.bay_number
          and sb.status in ('pending','confirmed','in_progress')
          and tstzrange(sb.scheduled_for, sb.scheduled_for + make_interval(mins => sb.duration_minutes))
              && tstzrange(c.start_ts, c.end_ts)
     )
     and c.end_ts <= ((p_date::timestamptz at time zone 'Asia/Kolkata') + make_interval(hours => p_close_hour))
   order by c.start_ts, c.bay_number;
end; $$;

-- =======================================================
-- NOTIFICATION QUEUE (dispatches via Vercel cron)
-- =======================================================
create table if not exists public.notification_queue (
  id uuid primary key default uuid_generate_v4(),
  channel text not null check (channel in ('email','whatsapp','sms')),
  recipient text not null,
  template text not null,                       -- 'order_confirmation', 'review_request', 'booking_reminder'
  payload jsonb not null,
  scheduled_for timestamptz not null default now(),
  attempts int not null default 0,
  max_attempts int not null default 3,
  status text not null default 'pending'
    check (status in ('pending','sent','failed','cancelled')),
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists notification_queue_due_idx
  on public.notification_queue(scheduled_for, status) where status = 'pending';
create index if not exists notification_queue_recipient_idx
  on public.notification_queue(recipient, template, created_at desc);

alter table public.notification_queue enable row level security;
-- service role only
