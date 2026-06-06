"use client";

import { useEffect, useRef, useState } from "react";

export type StockInfo = {
  stock: number;
  price: number;
  active: boolean;
  low: boolean;
};

type StockMap = Record<string, StockInfo>;

type StockState = {
  stock: StockMap;
  loading: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
};

/**
 * Fetches live stock for a set of part IDs from /api/stock. Polls every
 * `refreshMs` (default 15s) so the cart/checkout reflect other shoppers
 * draining inventory in near real time.
 *
 * When Supabase isn't configured the API returns {configured:false} and
 * the caller should fall back to the static price/assume in-stock UI.
 */
export function useLiveStock(ids: string[], refreshMs = 15_000): StockState {
  const [stock, setStock] = useState<StockMap>({});
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const mountedRef = useRef(true);
  const idsKey = [...new Set(ids)].sort().join(",");

  const fetchStock = useRef(async (_key: string) => {});
  fetchStock.current = async (key: string) => {
    if (!key) {
      setStock({});
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/stock?ids=${encodeURIComponent(key)}`, {
        cache: "no-store"
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        stock: StockMap;
        configured?: boolean;
      };
      if (!mountedRef.current) return;
      setStock(json.stock ?? {});
      setConfigured(json.configured !== false);
    } catch {
      /* offline — keep stale data */
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchStock.current(idsKey);
    const t = setInterval(() => fetchStock.current(idsKey), refreshMs);
    return () => {
      mountedRef.current = false;
      clearInterval(t);
    };
  }, [idsKey, refreshMs]);

  return {
    stock,
    loading,
    configured,
    refresh: () => fetchStock.current(idsKey)
  };
}
