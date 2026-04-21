-- 6T4 Customs — schema v1
-- Run via `supabase db push` or paste into SQL editor.

create extension if not exists "uuid-ossp";

-- =======================================================
-- profiles (role + loyalty bound to auth.users)
-- =======================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user','admin')),
  loyalty_points int not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create profile row on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =======================================================
-- builds (user-saved configurations)
-- =======================================================
create table if not exists public.builds (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  brand text not null,
  model text not null,
  year int not null,
  parts text[] not null default '{}',
  total_price int not null default 0,
  est_hp numeric(6,1),
  created_at timestamptz not null default now()
);

create index if not exists builds_user_idx on public.builds(user_id);

-- =======================================================
-- orders + order_items + bookings
-- =======================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','in-progress','ready','delivered','cancelled')),
  total int not null,
  delivery_mode text not null check (delivery_mode in ('in-shop','delivery')),
  payment_method text not null check (payment_method in ('upi','card','pay-at-shop')),
  booking_token text unique,
  address jsonb not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  part_id text not null,
  qty int not null default 1,
  unit_price int not null,
  for_build jsonb
);

create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  notes text
);

-- =======================================================
-- parts + compatibility (mirrored from JSON for admin-editable catalogue)
-- =======================================================
create table if not exists public.parts (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null,
  description text,
  price int not null,
  hp_gain numeric(4,1),
  sound_db int,
  install_minutes int,
  compatibility jsonb not null,
  image text,
  created_at timestamptz not null default now()
);

-- =======================================================
-- testimonials + featured_builds (public content)
-- =======================================================
create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  bike text not null,
  content text not null,
  rating int not null default 5,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.featured_builds (
  id text primary key,
  title text not null,
  bike text not null,
  mods text[] not null default '{}',
  hp_gain int not null default 0,
  before_image text,
  after_image text,
  dyno_data jsonb,
  created_at timestamptz not null default now()
);

-- =======================================================
-- RLS
-- =======================================================
alter table public.profiles enable row level security;
alter table public.builds enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.bookings enable row level security;
alter table public.parts enable row level security;
alter table public.testimonials enable row level security;
alter table public.featured_builds enable row level security;

-- profiles
create policy "profiles:self-read" on public.profiles for select using (auth.uid() = id);
create policy "profiles:self-update" on public.profiles for update using (auth.uid() = id);
create policy "profiles:admin-read" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- builds
create policy "builds:self-rw" on public.builds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "builds:admin-read" on public.builds for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- orders
create policy "orders:self-read" on public.orders for select using (auth.uid() = user_id);
create policy "orders:self-insert" on public.orders for insert with check (auth.uid() = user_id or user_id is null);
create policy "orders:admin-all" on public.orders for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "order_items:self-read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null))
);
create policy "order_items:self-insert" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null))
);
create policy "order_items:admin-all" on public.order_items for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- bookings
create policy "bookings:self-rw" on public.bookings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "bookings:admin-all" on public.bookings for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- parts / public content — public read
create policy "parts:read" on public.parts for select using (true);
create policy "parts:admin-write" on public.parts for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "testimonials:read" on public.testimonials for select using (true);
create policy "testimonials:admin-write" on public.testimonials for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "featured:read" on public.featured_builds for select using (true);
create policy "featured:admin-write" on public.featured_builds for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
