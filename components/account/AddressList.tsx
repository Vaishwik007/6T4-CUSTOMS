"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2, Star, MapPin, AlertCircle } from "lucide-react";
import { AddressForm, type AddressFormInitial } from "./AddressForm";
import {
  deleteAddress,
  setDefaultAddress
} from "@/app/account/addresses/actions";

export type AddressRow = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pin: string;
  is_default: boolean;
  created_at: string;
};

type Mode =
  | { kind: "idle" }
  | { kind: "creating" }
  | { kind: "editing"; row: AddressRow };

export function AddressList({ initial }: { initial: AddressRow[] }) {
  const [rows, setRows] = useState<AddressRow[]>(initial);
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const closeForm = (refresh = true) => {
    setMode({ kind: "idle" });
    if (refresh) {
      // server action revalidated /account/addresses — page will re-render
      // server props on next nav. For optimistic refresh within the SPA we
      // refetch via location.reload, but cheaper: rely on Next's RSC refresh.
      // The form's parent passes a stable callback; we just close here and
      // let revalidatePath propagate.
    }
  };

  const handleDelete = (row: AddressRow) => {
    if (!confirm(`Delete address "${row.label ?? row.line1}"?`)) return;
    setBusyId(row.id);
    setError(null);
    startTransition(async () => {
      const res = await deleteAddress(row.id);
      setBusyId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    });
  };

  const handleMakeDefault = (row: AddressRow) => {
    setBusyId(row.id);
    setError(null);
    startTransition(async () => {
      const res = await setDefaultAddress(row.id);
      setBusyId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRows((prev) =>
        prev.map((r) => ({ ...r, is_default: r.id === row.id }))
      );
    });
  };

  const toFormInitial = (row: AddressRow): AddressFormInitial => ({
    id: row.id,
    label: row.label,
    full_name: row.full_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    pin: row.pin,
    is_default: row.is_default
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-bone/60">
          {rows.length === 0
            ? "No saved addresses yet."
            : `${rows.length} address${rows.length === 1 ? "" : "es"} on file`}
        </p>
        {mode.kind === "idle" && (
          <button
            type="button"
            onClick={() => setMode({ kind: "creating" })}
            data-cursor="cta"
            className="inline-flex items-center gap-2 bg-neon px-4 py-2 text-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white"
          >
            <Plus className="h-3 w-3" /> Add Address
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      <AnimatePresence>
        {mode.kind === "creating" && (
          <AddressForm
            mode="create"
            onDone={() => {
              closeForm();
              // Force a refresh because new row is server-side; simplest path:
              window.location.reload();
            }}
          />
        )}
        {mode.kind === "editing" && (
          <AddressForm
            mode="edit"
            initial={toFormInitial(mode.row)}
            onDone={() => {
              closeForm();
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>

      <ul className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
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
                  <MapPin className="h-3 w-3" />
                  {row.label ?? "Address"}
                </p>
                <p className="mt-1 text-display text-base font-bold uppercase text-bone">
                  {row.full_name}
                </p>
              </div>
              {row.is_default && (
                <span className="inline-flex items-center gap-1 border border-neon/40 bg-neon/10 px-2 py-1 text-[9px] uppercase tracking-[0.3em] text-neon">
                  <Star className="h-2.5 w-2.5 fill-neon" /> Default
                </span>
              )}
            </div>

            <address className="mt-3 not-italic text-sm leading-relaxed text-bone/70">
              {row.line1}
              {row.line2 ? <><br />{row.line2}</> : null}
              <br />
              {row.city}, {row.state} {row.pin}
              <br />
              <span className="text-bone/40">{row.phone}</span>
            </address>

            <div className="mt-4 flex flex-wrap gap-2">
              {!row.is_default && (
                <button
                  type="button"
                  onClick={() => handleMakeDefault(row)}
                  disabled={busyId === row.id}
                  className="inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-neon hover:text-neon disabled:opacity-40"
                >
                  <Star className="h-3 w-3" /> Set default
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode({ kind: "editing", row })}
                className="inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-neon hover:text-neon"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
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
        ))}
      </ul>

      {rows.length === 0 && mode.kind === "idle" && (
        <div className="border border-dashed border-white/10 p-10 text-center text-sm text-bone/50">
          Add your first delivery address — it pre-fills at checkout and on
          service bookings.
        </div>
      )}
    </div>
  );
}
