"use client";

import { PARTS, PART_CATEGORIES } from "@/lib/data/parts";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function AdminPartsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const list = PARTS.filter((p) => {
    if (cat !== "all" && p.category !== cat) return false;
    if (!q) return true;
    const hay = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search parts…"
            className="border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-bone outline-none focus:border-neon"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {["all", ...PART_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              data-cursor="cta"
              className={cn(
                "px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors",
                cat === c
                  ? "bg-neon text-black"
                  : "border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-black/60 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">HP</th>
              <th className="px-4 py-3">Fit</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-white/5 text-bone/80">
                <td className="px-4 py-3 text-[10px] text-bone/40">{p.id}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-neon">{p.brand}</td>
                <td className="px-4 py-3 text-xs uppercase">{p.category}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.hpGain ? `+${p.hpGain}` : "—"}</td>
                <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em]">
                  {p.compatibility === "universal"
                    ? "universal"
                    : `${p.compatibility.length} rules`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-bone/40">
        Read-only view. Full CRUD wired to Supabase once migration is applied.
      </p>
    </>
  );
}
