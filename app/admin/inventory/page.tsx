"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Upload, Edit3, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
  low_stock_threshold: number;
  active: boolean;
  updated_at: string;
};

const CATS = ["all", "Exhaust", "ECU Tuning", "Air Filter", "Performance Kit", "Cosmetic", "Service Kit"];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [lowOnly, setLowOnly] = useState(false);

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat !== "all") params.set("category", cat);
    if (lowOnly) params.set("lowStock", "1");
    const res = await fetch(`/api/admin/products?${params.toString()}`).then((r) => r.json());
    if (res.ok) setProducts(res.products);
    else setProducts([]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, lowOnly]);

  const remove = async (id: string) => {
    if (!confirm("Delete this product? This is permanent.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  };

  const stats = useMemo(() => {
    if (!products) return { total: 0, low: 0, out: 0, value: 0 };
    return {
      total: products.length,
      low: products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold).length,
      out: products.filter((p) => p.stock === 0).length,
      value: products.reduce((s, p) => s + p.stock * p.cost_price, 0)
    };
  }, [products]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Inventory</p>
          <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">Parts Bay</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/inventory/import"
            data-cursor="cta"
            className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 text-display text-[11px] uppercase tracking-[0.2em] text-bone/80 hover:border-neon hover:text-neon"
          >
            <Upload className="h-4 w-4" /> CSV Import
          </Link>
          <Link
            href="/admin/inventory/new"
            data-cursor="cta"
            className="inline-flex items-center gap-2 bg-neon px-4 py-2 text-display text-[11px] uppercase tracking-[0.2em] font-bold text-black hover:bg-white"
          >
            <Plus className="h-4 w-4" /> New Product
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBlock label="Total Products" value={stats.total} />
        <StatBlock label="Low Stock" value={stats.low} tone={stats.low > 0 ? "yellow" : "muted"} />
        <StatBlock label="Out of Stock" value={stats.out} tone={stats.out > 0 ? "neon" : "muted"} />
        <StatBlock label="Inventory Value" value={formatPrice(stats.value)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / SKU…"
            className="w-72 border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm outline-none focus:border-neon"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon"
        >
          {CATS.map((c) => (
            <option key={c} value={c} className="bg-black">
              {c === "all" ? "All categories" : c}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-bone/70">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="accent-neon"
          />
          Low stock only
        </label>
      </div>

      <div className="overflow-x-auto border border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-black/60 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-px"></th>
            </tr>
          </thead>
          <tbody>
            {!products && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-bone/40">Loading…</td>
              </tr>
            )}
            {products && products.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-bone/40">
                  No products match. Add one or import via CSV.
                </td>
              </tr>
            )}
            {products?.map((p) => {
              const low = p.stock > 0 && p.stock <= p.low_stock_threshold;
              const out = p.stock === 0;
              return (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-white/5"
                >
                  <td className="px-4 py-3 text-[10px] text-bone/50">{p.sku}</td>
                  <td className="px-4 py-3 text-bone">{p.name}</td>
                  <td className="px-4 py-3 text-neon">{p.brand}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-bone/70">{p.category}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-right text-bone/60">{formatPrice(p.cost_price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-stencil text-lg",
                        out ? "text-neon" : low ? "text-yellow-400" : "text-bone"
                      )}
                    >
                      {p.stock}
                      {low && !out && <AlertTriangle className="h-3 w-3" />}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {out ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-neon">
                        <AlertTriangle className="h-3 w-3" /> Out
                      </span>
                    ) : low ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-yellow-400">
                        Only {p.stock} left
                      </span>
                    ) : p.active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-bone/40">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/inventory/${p.id}`}
                        aria-label="Edit"
                        data-cursor="cta"
                        className="grid h-8 w-8 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        aria-label="Delete"
                        className="grid h-8 w-8 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone = "neon"
}: {
  label: string;
  value: string | number;
  tone?: "neon" | "yellow" | "muted";
}) {
  return (
    <div className="border border-white/5 bg-carbon p-4">
      <div className="text-[10px] uppercase tracking-[0.3em] text-bone/50">{label}</div>
      <div
        className={cn(
          "mt-2 text-stencil text-3xl",
          tone === "neon" && "text-neon",
          tone === "yellow" && "text-yellow-400",
          tone === "muted" && "text-bone/70"
        )}
      >
        {value}
      </div>
    </div>
  );
}
