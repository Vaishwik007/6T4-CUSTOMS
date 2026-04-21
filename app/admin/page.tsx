import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Target,
  Boxes
} from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { computeDashboard } from "@/lib/admin/analytics";
import { formatPrice } from "@/lib/utils/formatPrice";
import { RevenueChart, TopProductsChart, CategoryPieChart } from "@/components/admin/DashboardCharts";
import { DashboardRefresher } from "@/components/admin/DashboardRefresher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOverview() {
  const data = await computeDashboard();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">
            Bay 01 · Command Console
          </p>
          <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">
            Overview
          </h1>
          <p className="mt-2 text-sm text-bone/60">
            Live snapshot of revenue, inventory, orders and customers.
          </p>
        </div>
        <DashboardRefresher intervalMs={15000} />
      </header>

      {/* Revenue strip */}
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard
          icon={<IndianRupee className="h-3.5 w-3.5" />}
          label="Total Revenue"
          value={formatPrice(data.revenue.total)}
          accent="All-time, excl. cancelled"
        />
        <MetricCard
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Revenue · Month"
          value={formatPrice(data.revenue.month)}
          accent="Rolling 30-day window"
          tone="green"
        />
        <MetricCard
          icon={<ShoppingCart className="h-3.5 w-3.5" />}
          label="Orders"
          value={data.orders.total}
          accent={`${data.orders.pending} pending · ${data.orders.inProgress} in progress`}
        />
        <MetricCard
          icon={<Target className="h-3.5 w-3.5" />}
          label="Conversion"
          value={`${data.conversion}%`}
          accent="Orders per customer"
          tone="yellow"
        />
      </div>

      {/* Inventory strip */}
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard
          icon={<Package className="h-3.5 w-3.5" />}
          label="Products"
          value={data.inventory.totalProducts}
          accent="Active catalogue"
        />
        <MetricCard
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="Low Stock"
          value={data.inventory.lowStock}
          accent="At or below threshold"
          tone={data.inventory.lowStock > 0 ? "yellow" : "muted"}
        />
        <MetricCard
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="Out of Stock"
          value={data.inventory.outOfStock}
          accent="Restock immediately"
          tone={data.inventory.outOfStock > 0 ? "neon" : "muted"}
        />
        <MetricCard
          icon={<Boxes className="h-3.5 w-3.5" />}
          label="Inventory Value"
          value={formatPrice(data.inventory.totalValue)}
          accent="at cost price"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="neon-edge relative border border-white/5 bg-carbon p-6 lg:col-span-2">
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">
            Revenue · Last 12 Months
          </h3>
          <RevenueChart data={data.monthlyRevenue} />
        </div>
        <div className="neon-edge relative border border-white/5 bg-carbon p-6">
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">
            Category Sales
          </h3>
          <CategoryPieChart data={data.categoryRevenue} />
        </div>
      </div>

      {/* Top products */}
      <div className="neon-edge relative border border-white/5 bg-carbon p-6">
        <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
        <h3 className="mb-4 text-display text-xs uppercase tracking-[0.3em] text-neon">
          Top Selling Products
        </h3>
        <TopProductsChart
          data={data.topProducts.map((p) => ({ name: p.name, revenue: p.revenue, units: p.units }))}
        />
      </div>

      {/* Recent orders */}
      <div className="neon-edge relative border border-white/5 bg-carbon">
        <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="text-display text-xs uppercase tracking-[0.3em] text-neon">
            Latest Orders
          </h3>
          <a
            href="/admin/orders"
            className="text-[10px] uppercase tracking-[0.2em] text-bone/50 hover:text-neon"
          >
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/40 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
              <tr>
                <th className="px-6 py-3">Token</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Placed</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-xs text-bone/40">
                    {data.configured
                      ? "No orders yet — new orders will appear here live."
                      : "Backend not connected. Set Supabase keys and run migrations to see live orders."}
                  </td>
                </tr>
              )}
              {data.recent.map((o) => (
                <tr key={o.id} className="border-t border-white/5 text-bone/80">
                  <td className="px-6 py-3 text-stencil text-neon">{o.booking_token}</td>
                  <td className="px-6 py-3">{o.address?.fullName ?? "—"}</td>
                  <td className="px-6 py-3">{formatPrice(o.total)}</td>
                  <td className="px-6 py-3 text-xs uppercase tracking-[0.2em]">{o.status}</td>
                  <td className="px-6 py-3 text-[10px] text-bone/50">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
