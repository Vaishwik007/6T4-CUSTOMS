"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Search, Crown } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";

type Customer = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  total_spent: number;
  order_count: number;
  last_ordered_at: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => (r.status === 503 ? null : r.json()))
      .then((d) => setCustomers(d?.customers ?? []));
  }, []);

  const filtered = useMemo(() => {
    if (!customers) return [];
    if (!q) return customers;
    return customers.filter((c) =>
      `${c.email ?? ""} ${c.full_name ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [customers, q]);

  const stats = useMemo(() => {
    if (!customers) return { total: 0, vip: 0, repeat: 0, revenue: 0 };
    return {
      total: customers.length,
      vip: customers.filter((c) => c.total_spent >= 100000).length,
      repeat: customers.filter((c) => c.order_count > 1).length,
      revenue: customers.reduce((s, c) => s + c.total_spent, 0)
    };
  }, [customers]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Riders</p>
          <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">Customers</h1>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email, name, phone…"
            className="w-72 border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm outline-none focus:border-neon"
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBlock label="Total" value={stats.total} Icon={Users} />
        <StatBlock label="VIP (₹1L+)" value={stats.vip} Icon={Crown} />
        <StatBlock label="Repeat Buyers" value={stats.repeat} />
        <StatBlock label="Total Spent" value={formatPrice(stats.revenue)} />
      </div>

      <div className="overflow-x-auto border border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-black/60 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Lifetime Value</th>
              <th className="px-4 py-3">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {!customers && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-bone/40">Loading…</td></tr>
            )}
            {customers && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-bone/40">No customers yet.</td></tr>
            )}
            {filtered.map((c) => (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-white/5"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {c.total_spent >= 100000 && <Crown className="h-3.5 w-3.5 text-yellow-400" />}
                    <div>
                      <div className="text-bone">{c.full_name ?? "—"}</div>
                      <div className="text-[10px] text-bone/40">
                        Since {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[11px] text-neon">{c.email ?? "—"}</div>
                  <div className="text-[10px] text-bone/50">{c.phone ?? ""}</div>
                </td>
                <td className="px-4 py-3 text-right text-stencil text-neon">{c.order_count}</td>
                <td className="px-4 py-3 text-right text-stencil text-bone">
                  {formatPrice(c.total_spent)}
                </td>
                <td className="px-4 py-3 text-[10px] text-bone/60">
                  {c.last_ordered_at ? new Date(c.last_ordered_at).toLocaleDateString() : "—"}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  Icon
}: {
  label: string;
  value: string | number;
  Icon?: typeof Users;
}) {
  return (
    <div className="border border-white/5 bg-carbon p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/50">
        {Icon && <Icon className="h-3 w-3 text-neon" />}
        {label}
      </div>
      <div className="mt-2 text-stencil text-3xl text-neon">{value}</div>
    </div>
  );
}
