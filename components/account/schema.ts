import { z } from "zod";

/** Postgrest error code emitted when relation does not exist. */
export const TABLE_MISSING_CODE = "42P01";

export type SupabaseLikeError =
  | { code?: string | null; message?: string | null }
  | null
  | undefined;

export function isTableMissing(err: SupabaseLikeError): boolean {
  if (!err) return false;
  if (err.code === TABLE_MISSING_CODE) return true;
  const msg = err.message ?? "";
  return /relation .* does not exist|does not exist/i.test(msg);
}

/** Indian mobile — 10 digits, optional leading +91 / 91. */
const phoneRegex = /^(\+?91[-\s]?)?[6-9]\d{9}$/;

export const addressSchema = z.object({
  label: z.string().max(40).optional(),
  full_name: z.string().min(2, "Name is required").max(80),
  phone: z
    .string()
    .min(10, "10-digit Indian mobile")
    .regex(phoneRegex, "Use a valid Indian mobile (10 digits)"),
  line1: z.string().min(3, "Required").max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2, "Required").max(60),
  state: z.string().min(2, "Required").max(60),
  pin: z.string().regex(/^\d{6}$/, "Use a 6-digit PIN"),
  is_default: z.boolean().optional()
});

export type AddressInput = z.infer<typeof addressSchema>;

export const vehicleSchema = z.object({
  brand_slug: z.string().min(1, "Pick a brand"),
  model_slug: z.string().min(1, "Pick a model"),
  year: z.coerce
    .number()
    .int()
    .min(2000, "Year too old")
    .max(new Date().getFullYear() + 1, "Future year"),
  nickname: z.string().max(40).optional(),
  plate: z.string().max(20).optional(),
  current_mods: z.string().max(400).optional(),
  is_primary: z.boolean().optional()
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

/** Parse a comma-separated mods string into a trimmed unique array. */
export function parseModsList(input: string | undefined | null): string[] {
  if (!input) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}
