-- 6T4 Customs — Catalog expansion v1
-- Adds: product fitment (relational), bike_models, customer_addresses,
--       customer_vehicles, wishlists, reviews, journal_posts.
-- Idempotent. Tracked via public.schema_migrations.

create extension if not exists "uuid-ossp";

-- =======================================================
-- PRODUCT METADATA: add SEO slug, hp/sound/install fields,
-- short_description, fits_universal flag, search-friendly fields.
-- (We keep `products` flat for now; variant split lands in 0005 once data
-- is mirrored from the static catalog.)
-- =======================================================
alter table public.products
  add column if not exists slug text,
  add column if not exists short_description text,
  add column if not exists hp_gain numeric(4,1),
  add column if not exists sound_db int,
  add column if not exists install_minutes int,
  add column if not exists fits_universal boolean not null default false,
  add column if not exists weight_grams int,
  add column if not exists tags text[] not null default '{}',
  add column if not exists stage smallint check (stage between 1 and 3),
  add column if not exists featured boolean not null default false;

-- Backfill slug from id where missing
update public.products set slug = id where slug is null;
create unique index if not exists products_slug_unq on public.products(slug);

-- =======================================================
-- BIKE MODELS (relational catalog of supported bikes)
-- =======================================================
create table if not exists public.bike_models (
  id text primary key,                 -- e.g. 'ktm-390-duke'
  brand_slug text not null,
  brand_name text not null,
  name text not null,                  -- '390 Duke'
  category text not null,              -- Naked, Supersport, etc.
  engine_cc int,
  hp int,
  year_start int not null,
  year_end int,                        -- null = current
  image text,
  created_at timestamptz not null default now()
);
create index if not exists bike_models_brand_idx on public.bike_models(brand_slug);

alter table public.bike_models enable row level security;
drop policy if exists "bike_models:public-read" on public.bike_models;
create policy "bike_models:public-read" on public.bike_models for select using (true);

-- =======================================================
-- PRODUCT FITMENT (many-to-many, indexed, query-friendly)
-- =======================================================
create table if not exists public.product_fitment (
  product_id text not null references public.products(id) on delete cascade,
  bike_model_id text not null references public.bike_models(id) on delete cascade,
  year_start int,                      -- override defaults from bike_models
  year_end int,
  notes text,
  created_at timestamptz not null default now(),
  primary key (product_id, bike_model_id)
);
create index if not exists product_fitment_bike_idx on public.product_fitment(bike_model_id);

alter table public.product_fitment enable row level security;
drop policy if exists "fitment:public-read" on public.product_fitment;
create policy "fitment:public-read" on public.product_fitment for select using (true);

-- =======================================================
-- CUSTOMER ADDRESSES (replace inline address JSON on orders for logged-in users)
-- =======================================================
create table if not exists public.customer_addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pin text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists addresses_one_default_per_user
  on public.customer_addresses(user_id) where is_default;

alter table public.customer_addresses enable row level security;
drop policy if exists "addr:self-rw" on public.customer_addresses;
create policy "addr:self-rw" on public.customer_addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =======================================================
-- CUSTOMER VEHICLES (user's bikes for fitment + booking pre-fill)
-- =======================================================
create table if not exists public.customer_vehicles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  brand_slug text not null,
  model_slug text not null,
  year int not null,
  nickname text,
  plate text,
  vin text,
  current_mods text[] not null default '{}',
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists vehicles_user_idx on public.customer_vehicles(user_id);

alter table public.customer_vehicles enable row level security;
drop policy if exists "vehicles:self-rw" on public.customer_vehicles;
create policy "vehicles:self-rw" on public.customer_vehicles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =======================================================
-- WISHLISTS
-- =======================================================
create table if not exists public.wishlists (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlists enable row level security;
drop policy if exists "wishlists:self-rw" on public.wishlists;
create policy "wishlists:self-rw" on public.wishlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =======================================================
-- REVIEWS (product + service, moderation queue)
-- =======================================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id text references public.products(id) on delete cascade,
  service_id text,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  bike text,
  rating int not null check (rating between 1 and 5),
  title text,
  content text not null,
  images text[] not null default '{}',
  verified_purchase boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending','published','rejected','flagged')),
  helpful_count int not null default 0,
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by uuid references public.admin_users(id) on delete set null
);
create index if not exists reviews_product_idx
  on public.reviews(product_id, status, created_at desc) where status = 'published';
create index if not exists reviews_pending_idx
  on public.reviews(status, created_at) where status = 'pending';

alter table public.reviews enable row level security;
drop policy if exists "reviews:public-read" on public.reviews;
create policy "reviews:public-read" on public.reviews for select using (status = 'published');
drop policy if exists "reviews:self-insert" on public.reviews;
create policy "reviews:self-insert" on public.reviews for insert
  with check (auth.uid() = user_id or user_id is null);

-- =======================================================
-- JOURNAL POSTS (long-form content surface for SEO)
-- =======================================================
create table if not exists public.journal_posts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  subtitle text,
  excerpt text,
  content_md text not null,
  cover_image text,
  author_id uuid references public.admin_users(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  published_at timestamptz,
  category text,
  tags text[] not null default '{}',
  reading_time_minutes int,
  related_build_id text,
  related_part_id text references public.products(id) on delete set null,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists journal_status_idx
  on public.journal_posts(status, published_at desc);
create index if not exists journal_slug_idx on public.journal_posts(slug);

alter table public.journal_posts enable row level security;
drop policy if exists "journal:public-read" on public.journal_posts;
create policy "journal:public-read" on public.journal_posts for select using (status = 'published');

-- =======================================================
-- HELPER FUNCTION: get parts fitting a bike + year
-- =======================================================
create or replace function public.parts_for_bike(
  p_bike_model_id text,
  p_year int default null,
  p_category text default null
) returns setof public.products
language sql stable as $$
  select p.*
    from public.products p
   where p.active
     and (
       p.fits_universal
       or exists (
         select 1
           from public.product_fitment pf
           join public.bike_models bm on bm.id = pf.bike_model_id
          where pf.product_id = p.id
            and pf.bike_model_id = p_bike_model_id
            and (p_year is null or p_year between coalesce(pf.year_start, bm.year_start)
                                              and coalesce(pf.year_end, bm.year_end, 9999))
       )
     )
     and (p_category is null or p.category = p_category)
   order by p.featured desc, p.stock desc, p.name asc;
$$;
