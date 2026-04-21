-- 6T4 Customs — Admin System + Inventory v1
-- Run via `supabase db push` or paste into SQL editor.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =======================================================
-- ADMIN USERS (custom auth, independent of auth.users)
-- =======================================================
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  email text,
  password_hash text not null,
  role text not null default 'admin' check (role in ('super_admin','admin','staff')),
  force_password_change boolean not null default true,
  two_factor_enabled boolean not null default false,
  two_factor_secret text,
  last_login_at timestamptz,
  last_login_ip text,
  created_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id) on delete set null,
  disabled boolean not null default false
);

create table if not exists public.admin_sessions (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.admin_users(id) on delete cascade,
  token_hash text unique not null,
  user_agent text,
  ip text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index if not exists admin_sessions_admin_idx on public.admin_sessions(admin_id);

create table if not exists public.admin_activity_log (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references public.admin_users(id) on delete set null,
  admin_username text,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists activity_admin_idx on public.admin_activity_log(admin_id);
create index if not exists activity_created_idx on public.admin_activity_log(created_at desc);

create table if not exists public.login_attempts (
  id uuid primary key default uuid_generate_v4(),
  identifier text not null, -- username or email
  kind text not null check (kind in ('admin','customer')),
  success boolean not null default false,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_ident_idx on public.login_attempts(identifier, created_at desc);
create index if not exists login_attempts_ip_idx on public.login_attempts(ip, created_at desc);

-- =======================================================
-- OTP CODES (6-digit email codes for customer login)
-- =======================================================
create table if not exists public.otp_codes (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  used_at timestamptz,
  ip text,
  created_at timestamptz not null default now()
);
create index if not exists otp_email_idx on public.otp_codes(email, created_at desc);

-- =======================================================
-- PRODUCTS (live inventory, admin-editable)
-- Seed from lib/data/parts.ts via `pnpm seed`.
-- =======================================================
create table if not exists public.products (
  id text primary key,
  sku text unique not null,
  name text not null,
  brand text not null,
  category text not null check (category in ('Exhaust','ECU Tuning','Air Filter','Performance Kit','Cosmetic','Service Kit')),
  description text,
  price int not null,
  cost_price int not null default 0,
  stock int not null default 0,
  low_stock_threshold int not null default 5,
  images text[] not null default '{}',
  compatibility jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_stock_idx on public.products(stock);

create or replace function public.touch_products_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute procedure public.touch_products_updated_at();

create table if not exists public.inventory_history (
  id uuid primary key default uuid_generate_v4(),
  product_id text not null references public.products(id) on delete cascade,
  change int not null, -- positive add, negative sold/removed
  new_stock int not null,
  reason text not null check (reason in ('restock','sale','adjust','return','damage','initial')),
  reference text, -- order id / csv batch / etc.
  admin_id uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists inventory_history_product_idx on public.inventory_history(product_id, created_at desc);

-- =======================================================
-- CUSTOMERS (extended view over auth users/profiles + guest buyers)
-- =======================================================
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  full_name text,
  phone text,
  total_spent int not null default 0,
  order_count int not null default 0,
  last_ordered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email)
);

-- =======================================================
-- NOTIFICATIONS (admin-facing alerts feed)
-- =======================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('low_stock','out_of_stock','new_order','revenue_milestone','failed_login','admin_action','system')),
  title text not null,
  body text,
  severity text not null default 'info' check (severity in ('info','warning','critical','success')),
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_created_idx on public.notifications(created_at desc);
create index if not exists notifications_unread_idx on public.notifications(read_at) where read_at is null;

-- =======================================================
-- INVOICES (attached to orders)
-- =======================================================
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  number text unique not null,
  pdf_url text,
  total int not null,
  tax int not null default 0,
  issued_at timestamptz not null default now()
);

-- =======================================================
-- ORDERS: auto-update customers + inventory on order placement
-- =======================================================
create or replace function public.on_order_insert() returns trigger
language plpgsql security definer as $$
declare
  cust_email text := new.address->>'email';
begin
  if cust_email is not null then
    insert into public.customers (user_id, email, full_name, phone, order_count, total_spent, last_ordered_at)
    values (new.user_id, cust_email, new.address->>'fullName', new.address->>'phone', 1, new.total, now())
    on conflict (email) do update
      set order_count = public.customers.order_count + 1,
          total_spent = public.customers.total_spent + excluded.total_spent,
          last_ordered_at = now(),
          full_name = coalesce(public.customers.full_name, excluded.full_name);
  end if;
  return new;
end; $$;

drop trigger if exists orders_customer_sync on public.orders;
create trigger orders_customer_sync after insert on public.orders
  for each row execute procedure public.on_order_insert();

-- Deduct stock on order_items insert (if product exists)
create or replace function public.on_order_item_insert() returns trigger
language plpgsql security definer as $$
begin
  update public.products set stock = greatest(0, stock - new.qty) where id = new.part_id;
  insert into public.inventory_history (product_id, change, new_stock, reason, reference)
  select new.part_id, -new.qty, stock, 'sale', new.order_id::text
  from public.products where id = new.part_id;
  return new;
exception when others then
  return new; -- don't block order on inventory mismatch
end; $$;

drop trigger if exists order_items_stock on public.order_items;
create trigger order_items_stock after insert on public.order_items
  for each row execute procedure public.on_order_item_insert();

-- =======================================================
-- RLS: admin-only tables locked down (service role bypasses)
-- =======================================================
alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_activity_log enable row level security;
alter table public.login_attempts enable row level security;
alter table public.otp_codes enable row level security;
alter table public.products enable row level security;
alter table public.inventory_history enable row level security;
alter table public.customers enable row level security;
alter table public.notifications enable row level security;
alter table public.invoices enable row level security;

-- Public read of products (for catalogue)
create policy "products:public-read" on public.products for select using (active);

-- Everything else — no policies means no anon access; service-role always bypasses.
