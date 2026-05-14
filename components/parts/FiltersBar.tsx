"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PartCategory } from "@/lib/data/types";
import type { PartsFilters } from "@/lib/products/queries";

type Props = {
  brands: string[];
  categories: readonly PartCategory[];
  current: PartsFilters;
};

const SORTS: { value: NonNullable<PartsFilters["sort"]>; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price · Low → High" },
  { value: "price-desc", label: "Price · High → Low" },
  { value: "hp-desc", label: "HP Gain" },
  { value: "newest", label: "Newest" }
];

export function FiltersBar({ brands, categories, current }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const apply = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp?.toString() ?? "");
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
      const qs = params.toString();
      router.push(qs ? `/parts?${qs}` : "/parts", { scroll: false });
    },
    [sp, router]
  );

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp?.toString() ?? "");
      const existing = (params.get(key) ?? "").split(",").filter(Boolean);
      const next = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      if (next.length === 0) params.delete(key);
      else params.set(key, next.join(","));
      const qs = params.toString();
      router.push(qs ? `/parts?${qs}` : "/parts", { scroll: false });
    },
    [sp, router]
  );

  const clear = useCallback(() => {
    router.push("/parts", { scroll: false });
  }, [router]);

  const activeCount = useMemo(() => {
    return (
      (current.brand?.length ?? 0) +
      (current.category?.length ?? 0) +
      (current.inStock ? 1 : 0) +
      (current.priceMin != null ? 1 : 0) +
      (current.priceMax != null ? 1 : 0)
    );
  }, [current]);

  return (
    <aside className="space-y-6 md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:pr-2">
      <div className="flex items-center justify-between">
        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          Filters {activeCount > 0 ? `(${activeCount})` : ""}
        </p>
        {activeCount > 0 && (
          <button
            onClick={clear}
            type="button"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-bone/60 hover:text-neon"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <FilterGroup title="Sort">
        <select
          value={current.sort ?? "featured"}
          onChange={(e) => apply("sort", e.target.value === "featured" ? null : e.target.value)}
          className="w-full border border-white/10 bg-black/40 px-3 py-2 text-sm text-bone outline-none focus:border-neon"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-bone/80">
          <input
            type="checkbox"
            checked={!!current.inStock}
            onChange={(e) => apply("stock", e.target.checked ? "1" : null)}
            className="peer sr-only"
          />
          <span className="grid h-4 w-4 place-items-center border border-white/20 bg-black/40 peer-checked:border-neon peer-checked:bg-neon/20 peer-checked:text-neon">
            {current.inStock && <Check className="h-3 w-3" />}
          </span>
          In stock only
        </label>
      </FilterGroup>

      <FilterGroup title="Category">
        <ul className="space-y-1.5">
          {categories.map((c) => {
            const active = current.category?.includes(c) ?? false;
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => toggleMulti("category", c)}
                  className={cn(
                    "w-full text-left text-sm transition-colors",
                    active ? "text-neon" : "text-bone/70 hover:text-bone"
                  )}
                >
                  <span className="mr-2 inline-block h-1.5 w-1.5 align-middle border border-white/30 bg-transparent" style={{ background: active ? "var(--neon)" : undefined }} />
                  {c}
                </button>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Brand">
        <ul className="space-y-1.5">
          {brands.map((b) => {
            const active = current.brand?.includes(b) ?? false;
            return (
              <li key={b}>
                <button
                  type="button"
                  onClick={() => toggleMulti("brand", b)}
                  className={cn(
                    "w-full text-left text-sm transition-colors",
                    active ? "text-neon" : "text-bone/70 hover:text-bone"
                  )}
                >
                  <span className="mr-2 inline-block h-1.5 w-1.5 align-middle border border-white/30" style={{ background: active ? "var(--neon)" : undefined }} />
                  {b}
                </button>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Price (₹)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            defaultValue={current.priceMin ?? ""}
            onBlur={(e) => apply("pmin", e.target.value || null)}
            className="w-full border border-white/10 bg-black/40 px-2 py-2 text-sm text-bone outline-none focus:border-neon"
          />
          <span className="text-bone/40">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            defaultValue={current.priceMax ?? ""}
            onBlur={(e) => apply("pmax", e.target.value || null)}
            className="w-full border border-white/10 bg-black/40 px-2 py-2 text-sm text-bone outline-none focus:border-neon"
          />
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/5 pt-4 first:border-t-0 first:pt-0">
      <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-bone/50">{title}</p>
      {children}
    </div>
  );
}
