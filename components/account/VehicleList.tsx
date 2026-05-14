"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Star, Bike, AlertCircle, Search } from "lucide-react";
import { VehicleForm } from "./VehicleForm";
import {
  deleteVehicle,
  setPrimaryVehicle
} from "@/app/account/vehicles/actions";
import { BRANDS_BY_SLUG } from "@/lib/data/brands";
import { getModel } from "@/lib/data/models";

export type VehicleRow = {
  id: string;
  brand_slug: string;
  model_slug: string;
  year: number;
  nickname: string | null;
  plate: string | null;
  current_mods: string[];
  is_primary: boolean;
  created_at: string;
  fits_count: number;
};

export function VehicleList({ initial }: { initial: VehicleRow[] }) {
  const [rows, setRows] = useState<VehicleRow[]>(initial);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDelete = (row: VehicleRow) => {
    const label =
      row.nickname ??
      `${BRANDS_BY_SLUG[row.brand_slug]?.name ?? row.brand_slug} ${row.model_slug}`;
    if (!confirm(`Delete ${label}?`)) return;
    setBusyId(row.id);
    setError(null);
    startTransition(async () => {
      const res = await deleteVehicle(row.id);
      setBusyId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    });
  };

  const handleMakePrimary = (row: VehicleRow) => {
    setBusyId(row.id);
    setError(null);
    startTransition(async () => {
      const res = await setPrimaryVehicle(row.id);
      setBusyId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRows((prev) =>
        prev.map((r) => ({ ...r, is_primary: r.id === row.id }))
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-bone/60">
          {rows.length === 0
            ? "No bikes saved yet."
            : `${rows.length} bike${rows.length === 1 ? "" : "s"} in your garage`}
        </p>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            data-cursor="cta"
            className="inline-flex items-center gap-2 bg-neon px-4 py-2 text-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white"
          >
            <Plus className="h-3 w-3" /> Add Vehicle
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      <AnimatePresence>
        {creating && (
          <VehicleForm
            onDone={() => {
              setCreating(false);
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>

      <ul className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => {
          const brand = BRANDS_BY_SLUG[row.brand_slug];
          const model = getModel(row.brand_slug, row.model_slug);
          const modelName = model?.name ?? row.model_slug;
          const partsHref = `/parts?brand=${encodeURIComponent(row.brand_slug)}&model=${encodeURIComponent(row.model_slug)}&year=${row.year}`;
          return (
            <motion.li
              key={row.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="neon-edge relative border border-white/10 bg-carbon p-5"
            >
              <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
              <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-neon">
                    <Bike className="h-3 w-3" />
                    {brand?.name ?? row.brand_slug} · {row.year}
                  </p>
                  <h3 className="mt-1 text-display text-lg font-bold uppercase leading-tight text-bone">
                    {row.nickname ?? modelName}
                  </h3>
                  {row.nickname && (
                    <p className="text-xs text-bone/50">{modelName}</p>
                  )}
                </div>
                {row.is_primary && (
                  <span className="inline-flex items-center gap-1 border border-neon/40 bg-neon/10 px-2 py-1 text-[9px] uppercase tracking-[0.3em] text-neon">
                    <Star className="h-2.5 w-2.5 fill-neon" /> Primary
                  </span>
                )}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-bone/70">
                {row.plate && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.3em] text-bone/40">
                      Plate
                    </dt>
                    <dd className="mt-0.5 font-mono uppercase">{row.plate}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.3em] text-bone/40">
                    Parts that fit
                  </dt>
                  <dd className="mt-0.5 text-stencil text-lg text-neon">
                    {row.fits_count}
                  </dd>
                </div>
              </dl>

              {row.current_mods.length > 0 && (
                <div className="mt-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-bone/40">
                    Current mods
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {row.current_mods.map((mod) => (
                      <li
                        key={mod}
                        className="border border-white/10 px-2 py-1 text-[10px] text-bone/70"
                      >
                        {mod}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={partsHref}
                  className="inline-flex items-center gap-1 border border-neon/40 bg-neon/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-neon transition-colors hover:bg-neon hover:text-black"
                  data-cursor="cta"
                >
                  <Search className="h-3 w-3" /> Browse fitting parts
                </Link>
                {!row.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleMakePrimary(row)}
                    disabled={busyId === row.id}
                    className="inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-neon hover:text-neon disabled:opacity-40"
                  >
                    <Star className="h-3 w-3" /> Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(row)}
                  disabled={busyId === row.id}
                  className="inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-red-500/60 hover:text-red-400 disabled:opacity-40"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </motion.li>
          );
        })}
      </ul>

      {rows.length === 0 && !creating && (
        <div className="border border-dashed border-white/10 p-10 text-center text-sm text-bone/50">
          Add your bike — we&apos;ll pre-filter the parts catalog and pre-fill
          service bookings.
        </div>
      )}
    </div>
  );
}
