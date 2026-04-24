-- 6T4 Customs — Razorpay payments + atomic stock finalize v1
-- Run via `npm run migrate` or paste into Supabase SQL editor.

create extension if not exists "pgcrypto";

-- =======================================================
-- ORDERS: expand status + payment tracking
-- =======================================================
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending','awaiting_payment','confirmed','in-progress','ready','delivered','cancelled'));

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('upi','card','pay-at-shop','razorpay'));

alter table public.orders
  add column if not exists payment_status text not null default 'unpaid';

-- Drop any legacy payment_status check, then add the canonical one.
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('unpaid','created','paid','failed','refunded'));

alter table public.orders
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists paid_at timestamptz;

create index if not exists orders_razorpay_order_idx on public.orders(razorpay_order_id);
create index if not exists orders_payment_status_idx on public.orders(payment_status);

-- =======================================================
-- PAYMENTS LEDGER (one row per Razorpay order)
-- =======================================================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  gateway text not null default 'razorpay',
  gateway_order_id text not null,
  gateway_payment_id text,
  gateway_signature text,
  amount int not null,
  currency text not null default 'INR',
  status text not null default 'created'
    check (status in ('created','authorized','captured','failed','refunded')),
  method text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists payments_gateway_order_unq on public.payments(gateway_order_id);
create index if not exists payments_order_idx on public.payments(order_id);

create or replace function public.touch_payments_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists payments_touch on public.payments;
create trigger payments_touch before update on public.payments
  for each row execute procedure public.touch_payments_updated_at();

-- =======================================================
-- WEBHOOK EVENTS (idempotency for Razorpay webhooks)
-- =======================================================
create table if not exists public.webhook_events (
  id uuid primary key default uuid_generate_v4(),
  gateway text not null default 'razorpay',
  event_id text unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists webhook_events_type_idx on public.webhook_events(event_type, created_at desc);

-- =======================================================
-- STOCK TRIGGER: skip decrement while awaiting payment.
-- Pay-at-shop keeps the original behaviour; Razorpay flow
-- defers decrement until finalize_paid_order().
-- =======================================================
create or replace function public.on_order_item_insert() returns trigger
language plpgsql security definer as $$
declare
  order_status text;
  cur_stock int;
begin
  select status into order_status from public.orders where id = new.order_id;
  if order_status = 'awaiting_payment' then
    return new; -- defer: finalize_paid_order will decrement on verify
  end if;

  update public.products set stock = greatest(0, stock - new.qty) where id = new.part_id
    returning stock into cur_stock;
  if cur_stock is not null then
    insert into public.inventory_history (product_id, change, new_stock, reason, reference)
    values (new.part_id, -new.qty, cur_stock, 'sale', new.order_id::text);
  end if;
  return new;
exception when others then
  return new; -- never block order on inventory bookkeeping
end; $$;

drop trigger if exists order_items_stock on public.order_items;
create trigger order_items_stock after insert on public.order_items
  for each row execute procedure public.on_order_item_insert();

-- =======================================================
-- ATOMIC FINALIZE: on successful Razorpay payment, decrement
-- stock for every order item + mark order paid/confirmed in
-- one transaction. Idempotent: calling twice returns {ok:true, already:true}.
-- Returns jsonb: {ok, error?, parts?, already?}.
-- =======================================================
create or replace function public.finalize_paid_order(
  p_order_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_razorpay_signature text default null
) returns jsonb
language plpgsql security definer as $$
declare
  item record;
  new_stock int;
  insufficient text[] := array[]::text[];
  existing_status text;
begin
  -- Lock + fetch current state
  select payment_status into existing_status
    from public.orders where id = p_order_id for update;
  if existing_status is null then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  if existing_status = 'paid' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  -- Attempt atomic decrement per line. If any line fails, roll back all decrements.
  for item in select part_id, qty from public.order_items where order_id = p_order_id loop
    update public.products
      set stock = stock - item.qty
      where id = item.part_id and stock >= item.qty
      returning stock into new_stock;
    if new_stock is null then
      insufficient := array_append(insufficient, item.part_id);
    else
      insert into public.inventory_history (product_id, change, new_stock, reason, reference)
      values (item.part_id, -item.qty, new_stock, 'sale', p_order_id::text);
    end if;
  end loop;

  if array_length(insufficient, 1) > 0 then
    -- plpgsql can't undo already-committed updates inside one function call,
    -- but since the whole function runs in a single transaction, raising
    -- will roll everything back.
    raise exception 'insufficient_stock:%', array_to_string(insufficient, ',');
  end if;

  update public.orders
     set status = 'confirmed',
         payment_status = 'paid',
         razorpay_order_id = p_razorpay_order_id,
         razorpay_payment_id = p_razorpay_payment_id,
         paid_at = now()
   where id = p_order_id;

  update public.payments
     set status = 'captured',
         gateway_payment_id = p_razorpay_payment_id,
         gateway_signature = coalesce(p_razorpay_signature, gateway_signature)
   where order_id = p_order_id and status <> 'captured';

  insert into public.notifications (type, title, body, severity, metadata)
  values (
    'new_order',
    'Paid order ' || p_order_id::text,
    'Razorpay payment captured',
    'success',
    jsonb_build_object(
      'order_id', p_order_id,
      'razorpay_payment_id', p_razorpay_payment_id,
      'razorpay_order_id', p_razorpay_order_id
    )
  );

  return jsonb_build_object('ok', true);
exception
  when raise_exception then raise;
  when others then
    return jsonb_build_object('ok', false, 'error', sqlerrm);
end; $$;

-- =======================================================
-- LIVE STOCK LOOKUP (public read of products.stock already allowed)
-- =======================================================

alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
-- no public policies: server-role only
