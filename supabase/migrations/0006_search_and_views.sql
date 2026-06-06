-- 6T4 Customs — Search, indexes, materialized views v1
-- Adds: full-text search vector on products, parts_browse materialized view,
-- additional indexes for review/journal queries.

create extension if not exists pg_trgm;

-- =======================================================
-- PRODUCTS: search_vector for full-text + trigram lookups
-- =======================================================
alter table public.products
  add column if not exists search_vector tsvector;

create or replace function public.products_search_vector_update() returns trigger
language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.brand, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C');
  return new;
end; $$;

drop trigger if exists products_search_vector_trigger on public.products;
create trigger products_search_vector_trigger
  before insert or update of name, brand, category, description, tags
  on public.products
  for each row execute procedure public.products_search_vector_update();

-- Backfill existing rows
update public.products set name = name where search_vector is null;

create index if not exists products_search_vector_idx
  on public.products using gin(search_vector);
create index if not exists products_name_trgm_idx
  on public.products using gin(name gin_trgm_ops);

-- =======================================================
-- PARTS_BROWSE materialized view — fast filter/sort surface for /parts
-- =======================================================
drop materialized view if exists public.parts_browse;
create materialized view public.parts_browse as
select
  p.id,
  p.slug,
  p.sku,
  p.name,
  p.brand,
  p.category,
  p.price,
  p.stock,
  p.stock > 0 as in_stock,
  p.stock > 0 and p.stock <= p.low_stock_threshold as low_stock,
  p.hp_gain,
  p.sound_db,
  p.install_minutes,
  p.fits_universal,
  p.featured,
  p.stage,
  p.tags,
  case when array_length(p.images, 1) > 0 then p.images[1] else null end as primary_image,
  p.short_description,
  coalesce(avg(r.rating)::numeric(3,2), 0) as avg_rating,
  count(distinct r.id) as review_count,
  array_agg(distinct pf.bike_model_id)
    filter (where pf.bike_model_id is not null) as fits_bikes,
  p.created_at
from public.products p
left join public.reviews r on r.product_id = p.id and r.status = 'published'
left join public.product_fitment pf on pf.product_id = p.id
where p.active
group by p.id;

create unique index if not exists parts_browse_id_idx on public.parts_browse(id);
create index if not exists parts_browse_brand_idx on public.parts_browse(brand);
create index if not exists parts_browse_category_idx on public.parts_browse(category);
create index if not exists parts_browse_price_idx on public.parts_browse(price);
create index if not exists parts_browse_featured_idx on public.parts_browse(featured) where featured;
create index if not exists parts_browse_bikes_gin on public.parts_browse using gin(fits_bikes);

-- =======================================================
-- search_products RPC — combines full-text + trigram fallback
-- =======================================================
create or replace function public.search_products(
  p_query text,
  p_limit int default 20
) returns setof public.products
language sql stable as $$
  select p.*
    from public.products p
   where p.active
     and (
       p.search_vector @@ plainto_tsquery('english', p_query)
       or p.name ilike '%' || p_query || '%'
       or p.brand ilike '%' || p_query || '%'
     )
   order by
     ts_rank(p.search_vector, plainto_tsquery('english', p_query)) desc,
     similarity(p.name, p_query) desc,
     p.featured desc,
     p.name asc
   limit p_limit;
$$;

-- =======================================================
-- Refresh helper — call after bulk catalog edits or via cron
-- =======================================================
create or replace function public.refresh_parts_browse() returns void
language plpgsql security definer as $$
begin
  refresh materialized view concurrently public.parts_browse;
exception
  when feature_not_supported then
    -- First refresh can't be concurrent
    refresh materialized view public.parts_browse;
end; $$;
