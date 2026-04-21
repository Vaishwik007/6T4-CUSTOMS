import type { Part } from "@/lib/data/types";

/**
 * Compound HP gain — successive parts have diminishing returns.
 * Each new part adds 92% of its rated gain on top of previous total.
 */
export function estimateTotalHpGain(parts: Part[]): number {
  let total = 0;
  let factor = 1;
  for (const part of parts) {
    total += (part.hpGain ?? 0) * factor;
    factor *= 0.92;
  }
  return Math.round(total * 10) / 10;
}

export function estimateInstallMinutes(parts: Part[]): number {
  return parts.reduce((sum, p) => sum + (p.installMinutes ?? 30), 0);
}
