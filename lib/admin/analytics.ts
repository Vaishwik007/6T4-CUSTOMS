import { createAdminSupabase } from "@/lib/supabase/admin";
import type { DbOrder, DbOrderItem } from "@/lib/supabase/types";

export type DashboardSnapshot = {
  revenue: { total: number; today: number; month: number };
  orders: { total: number; pending: number; inProgress: number; delivered: number };
  inventory: { totalProducts: number; lowStock: number; outOfStock: number; totalValue: number };
  customers: number;
  conversion: number;
  topProducts: { id: string; name: string; revenue: number; units: number }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  categoryRevenue: { category: string; revenue: number }[];
  marginByCategory: { category: string; profit: number; revenue: number }[];
  recent: DbOrder[];
  configured: boolean;
};

export async function computeDashboard(): Promise<DashboardSnapshot> {
  const empty: DashboardSnapshot = {
    revenue: { total: 0, today: 0, month: 0 },
    orders: { total: 0, pending: 0, inProgress: 0, delivered: 0 },
    inventory: { totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 },
    customers: 0,
    conversion: 0,
    topProducts: [],
    monthlyRevenue: [],
    categoryRevenue: [],
    marginByCategory: [],
    recent: [],
    configured: false
  };

  const supa = createAdminSupabase();
  if (!supa) return empty;

  const [ordersRes, itemsRes, productsRes, customersRes] = await Promise.all([
    supa.from("orders").select("*").order("created_at", { ascending: false }),
    supa.from("order_items").select("*"),
    supa.from("products").select("*"),
    supa.from("customers").select("id", { count: "exact", head: true })
  ]);

  const orders = (ordersRes.data ?? []) as DbOrder[];
  const items = (itemsRes.data ?? []) as DbOrderItem[];
  const products = productsRes.data ?? [];

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const todayRev = orders
    .filter((o) => o.status !== "cancelled" && new Date(o.created_at).getTime() >= startOfDay)
    .reduce((s, o) => s + o.total, 0);
  const monthRev = orders
    .filter((o) => o.status !== "cancelled" && new Date(o.created_at).getTime() >= startOfMonth)
    .reduce((s, o) => s + o.total, 0);

  // Top products
  const perProduct: Record<string, { revenue: number; units: number; name: string }> = {};
  const productNameById: Record<string, string> = Object.fromEntries(
    products.map((p) => [p.id, p.name])
  );
  for (const it of items) {
    const name = productNameById[it.part_id] ?? it.part_id;
    const cur = perProduct[it.part_id] ?? { revenue: 0, units: 0, name };
    cur.revenue += it.unit_price * it.qty;
    cur.units += it.qty;
    cur.name = name;
    perProduct[it.part_id] = cur;
  }
  const topProducts = Object.entries(perProduct)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Monthly revenue (last 12 months)
  const monthMap: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = { revenue: 0, orders: 0 };
  }
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthMap[key]) {
      monthMap[key].revenue += o.total;
      monthMap[key].orders += 1;
    }
  }
  const monthlyRevenue = Object.entries(monthMap).map(([month, v]) => ({
    month,
    revenue: v.revenue,
    orders: v.orders
  }));

  // Category revenue + margin
  const catRev: Record<string, number> = {};
  const catCost: Record<string, number> = {};
  const productCatById: Record<string, { category: string; cost: number }> = Object.fromEntries(
    products.map((p) => [p.id, { category: p.category, cost: p.cost_price ?? 0 }])
  );
  for (const it of items) {
    const meta = productCatById[it.part_id];
    if (!meta) continue;
    catRev[meta.category] = (catRev[meta.category] ?? 0) + it.unit_price * it.qty;
    catCost[meta.category] = (catCost[meta.category] ?? 0) + meta.cost * it.qty;
  }
  const categoryRevenue = Object.entries(catRev).map(([category, revenue]) => ({
    category,
    revenue
  }));
  const marginByCategory = Object.entries(catRev).map(([category, revenue]) => ({
    category,
    revenue,
    profit: revenue - (catCost[category] ?? 0)
  }));

  // Inventory
  const totalProducts = products.length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= p.low_stock_threshold
  ).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + p.stock * (p.cost_price ?? 0), 0);

  // Conversion (orders / visitors) — no visitor tracking yet, approximate with orders/customers
  const customers = customersRes.count ?? 0;
  const conversion = customers > 0 ? (orders.length / customers) * 100 : 0;

  return {
    revenue: { total: totalRevenue, today: todayRev, month: monthRev },
    orders: {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      inProgress: orders.filter((o) => o.status === "in-progress").length,
      delivered: orders.filter((o) => o.status === "delivered").length
    },
    inventory: { totalProducts, lowStock, outOfStock, totalValue },
    customers,
    conversion: Math.round(conversion * 10) / 10,
    topProducts,
    monthlyRevenue,
    categoryRevenue,
    marginByCategory,
    recent: orders.slice(0, 5),
    configured: true
  };
}
