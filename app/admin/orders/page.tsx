"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, FileDown, MessageCircle } from "lucide-react";
import type { DbOrder, DbOrderItem } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";
import { generateInvoicePdf } from "@/lib/admin/invoice";

const STATUSES: DbOrder["status"][] = [
  "pending",
  "confirmed",
  "in-progress",
  "ready",
  "delivered",
  "cancelled"
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DbOrder[] | null>(null);
  const [items, setItems] = useState<DbOrderItem[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [stat, setStat] = useState<string>("all");

  const load = async () => {
    const res = await fetch("/api/admin/sales").then((r) => (r.status === 503 ? null : r.json()));
    if (!res) {
      setOrders([]);
      return;
    }
    setOrders(res.orders ?? []);
    setItems(res.items ?? []);
    setProducts((res.products ?? []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
  };
  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: DbOrder["status"]) => {
    const prev = orders;
    setOrders((o) => o?.map((x) => (x.id === id ? { ...x, status } : x)) ?? null);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) setOrders(prev ?? []);
  };

  const filtered = useMemo(() => {
    if (!orders) return [] as DbOrder[];
    return orders.filter((o) => {
      if (stat !== "all" && o.status !== stat) return false;
      if (!q) return true;
      const hay = `${o.booking_token} ${o.address?.fullName ?? ""} ${o.address?.phone ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [orders, q, stat]);

  const invoice = (o: DbOrder) => {
    const lines = items
      .filter((it) => it.order_id === o.id)
      .map((it) => ({
        name: products.find((p) => p.id === it.part_id)?.name ?? it.part_id,
        qty: it.qty,
        unit: it.unit_price,
        total: it.qty * it.unit_price
      }));
    generateInvoicePdf({
      order: o,
      items: lines
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Orders</p>
          <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">Order Bay</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Token, name, phone…"
              className="w-64 border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm outline-none focus:border-neon"
            />
          </div>
          <select
            value={stat}
            onChange={(e) => setStat(e.target.value)}
            className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon"
          >
            <option value="all" className="bg-black">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-black">{s}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="overflow-x-auto border border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-black/60 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
            <tr>
              <th className="px-4 py-3">Token</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pay</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3 w-px"></th>
            </tr>
          </thead>
          <tbody>
            {!orders && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-bone/40">Loading…</td></tr>
            )}
            {orders && filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-bone/40">No orders match.</td></tr>
            )}
            {filtered.map((o) => {
              const waHref = `https://wa.me/${(o.address?.phone ?? "").replace(/[^\d]/g, "")}?text=${encodeURIComponent("Hi " + (o.address?.fullName ?? "") + " — 6T4 Customs update on " + o.booking_token)}`;
              return (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-white/5"
                >
                  <td className="px-4 py-3 text-stencil text-neon">{o.booking_token}</td>
                  <td className="px-4 py-3">
                    <div className="text-bone">{o.address?.fullName ?? "—"}</div>
                    <div className="text-[10px] text-bone/50">{o.address?.phone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-xs uppercase">{o.payment_method}</td>
                  <td className="px-4 py-3 text-xs uppercase">{o.delivery_mode}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as DbOrder["status"])}
                      className={cn(
                        "border bg-black/80 px-2 py-1 text-[11px] uppercase tracking-[0.2em] outline-none",
                        o.status === "pending" && "border-yellow-500/60 text-yellow-400",
                        o.status === "confirmed" && "border-blue-500/60 text-blue-400",
                        o.status === "in-progress" && "border-neon/60 text-neon",
                        o.status === "ready" && "border-green-500/60 text-green-400",
                        o.status === "delivered" && "border-white/20 text-bone/60",
                        o.status === "cancelled" && "border-red-900 text-red-400"
                      )}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-black">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-bone/50">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => invoice(o)}
                        aria-label="Generate invoice"
                        className="grid h-8 w-8 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                      </button>
                      {o.address?.phone && (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="WhatsApp customer"
                          className="grid h-8 w-8 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}
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
