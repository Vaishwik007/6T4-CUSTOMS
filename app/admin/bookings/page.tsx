"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Bookings — simple month grid. Click a cell to view/add (stub).
 * Real booking rows live in Supabase `bookings` table (bookings:admin-all policy).
 */
function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export default function AdminBookings() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });

  const cells = useMemo(() => monthMatrix(cursor.y, cursor.m), [cursor]);
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleString("en-US", { month: "long" });

  const prev = () =>
    setCursor(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const next = () =>
    setCursor(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));

  // Mock slot availability — deterministic pattern for preview
  const load = (d: number) => (d * 7) % 5; // 0-4

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neon">Bay Schedule</p>
          <h2 className="mt-1 text-display text-3xl font-bold uppercase">
            {monthName} <span className="text-neon">{cursor.y}</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-black py-2 text-[10px] uppercase tracking-[0.3em] text-bone/50"
          >
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          const booked = cell ? load(cell) : 0;
          const full = booked >= 4;
          return (
            <motion.button
              key={i}
              type="button"
              disabled={!cell}
              whileHover={cell ? { scale: 1.02 } : undefined}
              className={
                cell
                  ? full
                    ? "relative aspect-square bg-neon-900/20 p-2 text-left"
                    : "relative aspect-square bg-black p-2 text-left hover:bg-neon-900/10"
                  : "aspect-square bg-black/40"
              }
            >
              {cell && (
                <>
                  <span className="text-display text-sm text-bone">{cell}</span>
                  <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[9px] uppercase tracking-widest">
                    <span className={full ? "text-neon" : "text-bone/50"}>
                      {booked}/4 bays
                    </span>
                    {full && <span className="h-1 w-1 bg-neon" />}
                  </div>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-bone/40">
        Mocked availability shown. Wire to Supabase `bookings` table to reflect real slots.
      </p>
    </div>
  );
}
