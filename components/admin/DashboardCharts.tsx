"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const COLORS = ["#ff0000", "#ff5050", "#d40000", "#a00000", "#6e0000", "#ff8080"];

const gridStroke = "rgba(255,255,255,0.06)";
const axisTick = { fill: "#888", fontSize: 11 };
const tooltipStyle = {
  background: "#000",
  border: "1px solid rgba(255,0,0,0.4)",
  fontSize: 12
};

export function RevenueChart({ data }: { data: { month: string; revenue: number; orders: number }[] }) {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: gridStroke }} tickLine={false} />
          <YAxis tick={axisTick} axisLine={{ stroke: gridStroke }} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#ff0000"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#ff0000" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsChart({ data }: { data: { name: string; revenue: number; units: number }[] }) {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke={gridStroke} horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={{ stroke: gridStroke }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#ccc", fontSize: 11 }}
            width={160}
            axisLine={{ stroke: gridStroke }}
            tickLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,0,0,0.06)" }} />
          <Bar dataKey="revenue" fill="#ff0000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: { category: string; revenue: number }[] }) {
  if (data.length === 0)
    return (
      <div className="grid h-[280px] place-items-center text-xs text-bone/40">No sales yet.</div>
    );
  return (
    <div className="h-[280px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="category"
            outerRadius={100}
            innerRadius={50}
            stroke="#000"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarginChart({ data }: { data: { category: string; revenue: number; profit: number }[] }) {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="category" tick={axisTick} axisLine={{ stroke: gridStroke }} />
          <YAxis tick={axisTick} axisLine={{ stroke: gridStroke }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
          <Bar dataKey="revenue" fill="#6e0000" name="Revenue" />
          <Bar dataKey="profit" fill="#ff0000" name="Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
