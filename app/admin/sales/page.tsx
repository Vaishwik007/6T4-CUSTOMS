"use client";

import { useEffect, useMemo, useState } from "react";
import { IndianRupee, ShoppingCart, TrendingUp, Percent } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import {
  RevenueChart,
  TopProductsChart,
  CategoryPieChart,
  MarginChart
} from "@/components/admin/DashboardCharts";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { DbOrder, DbOrderItem } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

type Range = "7d" | "30d" | "90d" | "12m" | "all";

export default function SalesPage() {
  const [range, setRange] = useState<Range>("30d");
  const [orders, setOrders] = useState<DbOrder[] | null>(null);
  const [items, setItems] = useState<DbOrderItem[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; category: string; cost_price: number }[]>([]);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sales")
      .then((r) => (r.status === 503 ? null : r.json()))
      .then((d) => {
        if (!d) {
          setConfigured(false);
          setOrders([]);
          return;
        }
        setOrders(d.orders ?? []);
        setItems(d.items ?? []);
        setProducts(d.products ?? []);
      });
  }, []);

  const { filtered, filteredItems } = useMemo(() => {
    if (!orders) return { filtered: [] as DbOrder[], filteredItems: [] as DbOrderItem[] };
    const now = Date.now();
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : range === "12m" ? 365 : Infinity;
    const cutoff = days === Infinity ? 0 : now - days * 24 * 60 * 60 * 1000;
    const f = orders.filter((o) => new Date(o.created_at).getTime() >= cutoff && o.status !== "cancelled");
    const ids = new Set(f.map((o) => o.id));
    const fi = items.filter((it) => ids.has(it.order_id));
    return { filtered: f, filteredItems: fi };
  }, [orders, items, range]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, o) => s + o.total, 0);
    const orderCount = filtered.length;
    const aov = orderCount > 0 ? revenue / orderCount : 0;
    const cost = filteredItems.reduce((s, it) => {
      const p = products.find((p) => p.id === it.part_id);
      return s + (p?.cost_price ?? 0) * it.qty;
    }, 0);
    const profit = revenue - cost;
    return { revenue, orderCount, aov, profit, margin: revenue > 0 ? (profit / revenue) * 100 : 0 };
  }, [filtered, filteredItems, products]);

  const monthly = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    const now = new Date();
    const months = range === "12m" || range === "all" ? 12 : range === "90d" ? 3 : range === "30d" ? 1 : 1;
    const bins = range === "7d" ? 7 : months * 30;
    for (let i = bins - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { revenue: 0, orders: 0 };
    }
    for (const o of filtered) {
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      if (!map[key]) map[key] = { revenue: 0, orders: 0 };
      map[key].revenue += o.total;
      map[key].orders += 1;
    }
    return Object.entries(map).map(([month, v]) => ({ month, ...v }));
  }, [filtered, range]);

  const catRev = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of filteredItems) {
      const p = products.find((p) => p.id === it.part_id);
      if (!p) continue;
      m[p.category] = (m[p.category] ?? 0) + it.unit_price * it.qty;
    }
    return Object.entries(m).map(([category, revenue]) => ({ category, revenue }));
  }, [filteredItems, products]);

  const marginByCat = useMemo(() => {
    const rev: Record<string, number> = {};
    const cost: Record<string, number> = {};
    for (const it of filteredItems) {
      const p = products.find((p) => p.id === it.part_id);
      if (!p) continue;
      rev[p.category] = (rev[p.category] ?? 0) + it.unit_price * it.qty;
      cost[p.category] = (cost[p.category] ?? 0) + p.cost_price * it.qty;
    }
    return Object.keys(rev).map((category) => ({
      category,
      revenue: rev[category],
      profit: rev[category] - (cost[category] ?? 0)
    }));
  }, [filteredItems, products]);

  const topProducts = useMemo(() => {
    const m: Record<string, { name: string; revenue: number; units: number }> = {};
    for (const it of filteredItems) {
      const name = products.find((p) => p.id === it.part_id)?.name ?? it.part_id;
      const cur = m[it.part_id] ?? { name, revenue: 0, units: 0 };
      cur.revenue += it.unit_price * it.qty;
      cur.units += it.qty;
      cur.name = name;
      m[it.part_id] = cur;
    }
    return Object.values(m).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [filteredItems, products]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Revenue</p>
          <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">
            Sales Analytics
          </h1>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d", "12m", "all"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              data-cursor="cta"
              className={cn(
                "px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors",
                range === r
                  ? "bg-neon text-black"
                  : "border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      {!configured && (
        <div className="border border-yellow-500/40 bg-yellow-500/10 p-4 text-xs text-yellow-300">
          Supabase not configured. Live sales data requires backend connection.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard icon={<IndianRupee className="h-3.5 w-3.5" />} label="Revenue" value={formatPrice(totals.revenue)} accent={range.toUpperCase()} />
        <MetricCard icon={<ShoppingCart className="h-3.5 w-3.5" />} label="Orders" value={totals.orderCount} accent="Excl. cancelled" tone="green" />
        <MetricCard icon={<TrendingUp className="h-3.5 w-3.5" />} label="AOV" value={formatPrice(Math.round(totals.aov))} accent="Average order value" tone="yellow" />
        <MetricCard icon={<Percent className="h-3.5 w-3.5" />} label="Margin" value={`${Math.round(totals.margin * 10) / 10}%`} accent={`Profit: ${formatPrice(totals.profit)}`} />
      </div>

      <div className="neon-edge relative border border-white/5 bg-carbon p-6">
        <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
        <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">Revenue Trend</h3>
        <RevenueChart data={monthly} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="neon-edge relative border border-white/5 bg-carbon p-6">
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">Top Products</h3>
          <TopProductsChart data={topProducts} />
        </div>
        <div className="neon-edge relative border border-white/5 bg-carbon p-6">
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">Category Split</h3>
          <CategoryPieChart data={catRev} />
        </div>
      </div>

      <div className="neon-edge relative border border-white/5 bg-carbon p-6">
        <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
        <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">Profit vs Cost by Category</h3>
        <MarginChart data={marginByCat} />
      </div>
    </div>
  );
}
