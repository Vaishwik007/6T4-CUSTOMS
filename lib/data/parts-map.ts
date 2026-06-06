/**
 * CRIT-03: Server-side price authority.
 * This module is imported ONLY in API routes (server-side).
 * The checkout API uses this to look up canonical prices — client-supplied
 * prices are always discarded.
 *
 * Import the full PARTS array and build a lookup map by id.
 */
import { PARTS } from "@/lib/data/parts";

export type ServerPart = { id: string; name: string; price: number };

// Build once at module load time (cached per server instance)
const _map: Record<string, ServerPart> = {};
for (const part of PARTS) {
  _map[part.id] = { id: part.id, name: part.name, price: part.price };
}

export const PARTS_MAP: Readonly<Record<string, ServerPart>> = _map;
