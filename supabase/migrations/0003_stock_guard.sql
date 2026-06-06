-- ────────────────────────────────────────────────────────────────────────────
-- CRIT-04 FIX: Stock oversell guard
--
-- Problem: The old trigger used greatest(0, stock - qty) which silently clamps
-- to 0, allowing unlimited concurrent over-sells. Both customers get a
-- confirmed order for the last unit.
--
-- Fix:
--   1. Add a CHECK constraint so stock can never go negative.
--   2. Rewrite the trigger to use SELECT ... FOR UPDATE (row lock) and
--      RAISE EXCEPTION when stock is insufficient. This serialises concurrent
--      inserts on the same product and rolls back the transaction cleanly.
-- ────────────────────────────────────────────────────────────────────────────

-- 1. Add a non-negative stock constraint
ALTER TABLE public.products
  ADD CONSTRAINT stock_non_negative CHECK (stock >= 0);

-- 2. Drop the old silently-clamping trigger and function
DROP TRIGGER IF EXISTS trg_deduct_stock ON public.order_items;
DROP FUNCTION IF EXISTS deduct_stock();

-- 3. Create the safe replacement
CREATE OR REPLACE FUNCTION deduct_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  available integer;
BEGIN
  -- Lock the product row to serialise concurrent deductions
  SELECT stock INTO available
  FROM public.products
  WHERE id = NEW.part_id
  FOR UPDATE;

  IF available IS NULL THEN
    -- Part doesn't exist in products table (custom/service SKU) — skip
    RETURN NEW;
  END IF;

  IF available < NEW.qty THEN
    RAISE EXCEPTION 'out_of_stock: part_id=%, available=%, requested=%',
      NEW.part_id, available, NEW.qty
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.products
  SET stock = stock - NEW.qty
  WHERE id = NEW.part_id;

  RETURN NEW;
END;
$$;

-- 4. Attach the new trigger
CREATE TRIGGER trg_deduct_stock
BEFORE INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION deduct_stock();

-- 5. Add a stock_reserved column for future pre-auth pattern (non-breaking)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_reserved integer NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0);

COMMENT ON COLUMN public.products.stock_reserved IS
  'Units held for pending orders (not yet fulfilled). stock - stock_reserved = truly available.';
