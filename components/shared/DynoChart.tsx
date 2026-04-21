"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import type { FeaturedBuild } from "@/lib/data/types";

export function DynoChart({ data }: { data: NonNullable<FeaturedBuild["dynoData"]> }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="rpm"
            stroke="#666"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            label={{ value: "RPM", position: "insideBottom", offset: -6, fill: "#888", fontSize: 10 }}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            label={{ value: "HP", angle: -90, position: "insideLeft", fill: "#888", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: "#000",
              border: "1px solid rgba(255,0,0,0.5)",
              fontSize: 12
            }}
            labelStyle={{ color: "#ff0000", fontFamily: "var(--font-orbitron)" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
          <Line
            type="monotone"
            dataKey="stockHp"
            name="Stock"
            stroke="#666"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="tunedHp"
            name="6T4 Tuned"
            stroke="#ff0000"
            strokeWidth={2.5}
            dot={{ fill: "#ff0000", r: 3 }}
            activeDot={{ r: 5, fill: "#ff0000" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
