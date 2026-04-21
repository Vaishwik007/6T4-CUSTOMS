"use client";

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { PARTS, PART_CATEGORIES } from "@/lib/data/parts";
import { MODELS } from "@/lib/data/models";
import { BRANDS } from "@/lib/data/brands";

const COLORS = ["#ff0000", "#d40000", "#a00000", "#6e0000", "#3d0000", "#ff5050"];

export default function AdminMetrics() {
  const byCat = PART_CATEGORIES.map((c) => ({
    name: c,
    count: PARTS.filter((p) => p.category === c).length
  }));

  const byRegion = BRANDS.reduce<Record<string, number>>((acc, b) => {
    acc[b.region] = (acc[b.region] ?? 0) + 1;
    return acc;
  }, {});

  const regionData = Object.entries(byRegion).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="neon-edge border border-white/5 bg-carbon p-6">
        <h3 className="text-display text-xs uppercase tracking-[0.3em] text-neon">
          Parts by Category
        </h3>
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer>
            <BarChart data={byCat}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#666"
                tick={{ fill: "#888", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 11 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#000",
                  border: "1px solid rgba(255,0,0,0.5)"
                }}
                cursor={{ fill: "rgba(255,0,0,0.08)" }}
              />
              <Bar dataKey="count" fill="#ff0000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="neon-edge border border-white/5 bg-carbon p-6">
        <h3 className="text-display text-xs uppercase tracking-[0.3em] text-neon">
          Brands by Region
        </h3>
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={regionData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={50}
                stroke="#000"
              >
                {regionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#000", border: "1px solid rgba(255,0,0,0.5)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="neon-edge border border-white/5 bg-carbon p-6 md:col-span-2">
        <h3 className="text-display text-xs uppercase tracking-[0.3em] text-neon">
          Catalogue Coverage
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Brands" value={BRANDS.length} />
          <Stat label="Models" value={MODELS.length} />
          <Stat label="Parts" value={PARTS.length} />
          <Stat
            label="Universal Parts"
            value={PARTS.filter((p) => p.compatibility === "universal").length}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-white/5 bg-black p-4">
      <div className="text-[10px] uppercase tracking-[0.3em] text-bone/50">{label}</div>
      <div className="mt-2 text-stencil text-3xl text-neon">{value}</div>
    </div>
  );
}
