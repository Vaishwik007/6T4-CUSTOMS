"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import { CompatibilityPicker } from "./CompatibilityPicker";
import type { CompatibilityRule } from "@/lib/data/types";

type Initial = {
  id?: string;
  sku?: string;
  name?: string;
  brand?: string;
  category?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  stock?: number;
  low_stock_threshold?: number;
  images?: string[];
  compatibility?: unknown;
  active?: boolean;
};

const CATS = ["Exhaust", "ECU Tuning", "Air Filter", "Performance Kit", "Cosmetic", "Service Kit"];

/** Coerce whatever is stored in the DB into a typed rule list. */
function parseInitialRules(input: unknown): CompatibilityRule[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (r): r is CompatibilityRule =>
        r != null &&
        typeof r === "object" &&
        typeof (r as { brand?: unknown }).brand === "string" &&
        typeof (r as { model?: unknown }).model === "string" &&
        typeof (r as { yearStart?: unknown }).yearStart === "number"
    )
    .map((r) => ({
      brand: r.brand,
      model: r.model,
      yearStart: r.yearStart,
      yearEnd: r.yearEnd ?? null
    }));
}

export function ProductForm({
  initial,
  mode
}: {
  initial?: Initial;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [v, setV] = useState({
    sku: initial?.sku ?? "",
    name: initial?.name ?? "",
    brand: initial?.brand ?? "",
    category: initial?.category ?? "Exhaust",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    costPrice: initial?.cost_price ?? 0,
    stock: initial?.stock ?? 0,
    lowStockThreshold: initial?.low_stock_threshold ?? 5,
    images: (initial?.images ?? []).join("\n")
  });

  const [compatibilityMode, setCompatibilityMode] = useState<"universal" | "specific">(
    initial?.compatibility === "universal" || initial?.compatibility == null
      ? "universal"
      : "specific"
  );
  const [rules, setRules] = useState<CompatibilityRule[]>(parseInitialRules(initial?.compatibility));

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const margin =
    v.price > 0 ? Math.round(((v.price - v.costPrice) / v.price) * 1000) / 10 : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const compatibility: unknown =
      compatibilityMode === "universal"
        ? "universal"
        : rules;

    if (compatibilityMode === "specific" && rules.length === 0) {
      setErr("Add at least one compatible bike, or switch to 'Fits all bikes'.");
      return;
    }

    setBusy(true);
    const body = {
      sku: v.sku,
      name: v.name,
      brand: v.brand,
      category: v.category,
      description: v.description,
      price: Number(v.price),
      costPrice: Number(v.costPrice),
      stock: Number(v.stock),
      lowStockThreshold: Number(v.lowStockThreshold),
      images: v.images.split("\n").map((s) => s.trim()).filter(Boolean),
      compatibility
    };

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${initial!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!data.ok) {
      setErr(data.error ?? "Failed");
      setBusy(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin/inventory"), 700);
  };

  const del = async () => {
    if (!initial?.id) return;
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${initial.id}`, { method: "DELETE" });
    router.push("/admin/inventory");
  };

  return (
    <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Section title="Product Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="SKU" required>
              <input className="input" value={v.sku} onChange={(e) => setV({ ...v, sku: e.target.value })} required />
            </Field>
            <Field label="Category" required>
              <select
                className="input"
                value={v.category}
                onChange={(e) => setV({ ...v, category: e.target.value })}
              >
                {CATS.map((c) => (
                  <option key={c} value={c} className="bg-black">{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Name" required className="md:col-span-2">
              <input className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} required />
            </Field>
            <Field label="Part Manufacturer / Brand" required>
              <input
                className="input"
                value={v.brand}
                onChange={(e) => setV({ ...v, brand: e.target.value })}
                placeholder="e.g. Akrapovič, SC-Project, K&N"
                required
              />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea
                className="input min-h-[100px]"
                value={v.description}
                onChange={(e) => setV({ ...v, description: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        <Section title="Pricing & Stock">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Price (₹)">
              <input
                className="input"
                type="number"
                value={v.price}
                onChange={(e) => setV({ ...v, price: Number(e.target.value) })}
              />
            </Field>
            <Field label="Cost Price (₹)">
              <input
                className="input"
                type="number"
                value={v.costPrice}
                onChange={(e) => setV({ ...v, costPrice: Number(e.target.value) })}
              />
            </Field>
            <Field label="Stock">
              <input
                className="input"
                type="number"
                value={v.stock}
                onChange={(e) => setV({ ...v, stock: Number(e.target.value) })}
              />
            </Field>
            <Field label="Low-stock threshold">
              <input
                className="input"
                type="number"
                value={v.lowStockThreshold}
                onChange={(e) => setV({ ...v, lowStockThreshold: Number(e.target.value) })}
              />
            </Field>
          </div>
        </Section>

        <Section title="Images (one URL per line)">
          <textarea
            className="input min-h-[100px]"
            value={v.images}
            onChange={(e) => setV({ ...v, images: e.target.value })}
            placeholder="https://cdn.../image.webp"
          />
        </Section>

        <Section title="Bike Compatibility">
          <CompatibilityPicker
            mode={compatibilityMode}
            onModeChange={setCompatibilityMode}
            rules={rules}
            onRulesChange={setRules}
          />
        </Section>
      </div>

      <aside className="space-y-4">
        <div className="neon-edge sticky top-20 border border-white/5 bg-carbon p-5">
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">Margin</p>
          <div className="mt-2 text-stencil text-3xl text-neon">{margin}%</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/50">
            Profit/unit {formatPrice(Math.max(0, v.price - v.costPrice))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.2em]">
            <div className="border border-white/5 bg-black/40 p-2">
              <div className="text-bone/50">Stock</div>
              <div className="mt-1 text-stencil text-lg text-bone">{v.stock}</div>
            </div>
            <div className="border border-white/5 bg-black/40 p-2">
              <div className="text-bone/50">Total cost</div>
              <div className="mt-1 text-stencil text-lg text-bone">
                {formatPrice(v.stock * v.costPrice)}
              </div>
            </div>
          </div>
          <div className="mt-3 border border-white/5 bg-black/40 p-2 text-[10px] uppercase tracking-[0.2em]">
            <div className="text-bone/50">Fits</div>
            <div className="mt-1 text-stencil text-lg text-bone">
              {compatibilityMode === "universal"
                ? "All bikes"
                : `${rules.length} bike${rules.length === 1 ? "" : "s"}`}
            </div>
          </div>
        </div>

        {err && (
          <div className="flex items-center gap-2 border border-neon/40 bg-neon-900/10 p-3 text-[11px] text-neon">
            <AlertCircle className="h-4 w-4" /> {err}
          </div>
        )}
        {done && (
          <div className="flex items-center gap-2 border border-green-500/40 bg-green-500/10 p-3 text-[11px] text-green-400">
            <CheckCircle2 className="h-4 w-4" /> Saved. Redirecting…
          </div>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          disabled={busy}
          data-cursor="cta"
          className="flex w-full items-center justify-center gap-2 bg-neon px-4 py-3 text-display text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-white hover:shadow-neon-lg disabled:opacity-40"
        >
          <Save className="h-4 w-4" /> {mode === "create" ? "Create Product" : "Save Changes"}
        </motion.button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={del}
            className="flex w-full items-center justify-center gap-2 border border-neon/40 px-4 py-3 text-display text-xs uppercase tracking-[0.2em] text-neon hover:bg-neon-900/20"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        )}
      </aside>

      <style jsx global>{`
        .input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e6e6e6;
          padding: 10px 12px;
          transition: border-color 200ms;
          outline: none;
          font-family: var(--font-inter);
          font-size: 14px;
        }
        .input:focus {
          border-color: #ff0000;
        }
        .input[disabled] {
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/5 bg-carbon/60 p-5">
      <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
        {label}
        {required && <span className="ml-1 text-neon">*</span>}
      </span>
      {children}
    </label>
  );
}
