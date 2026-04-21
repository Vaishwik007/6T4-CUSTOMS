import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Simple strength check — min 10 chars, at least one letter + number. */
export function passwordStrength(pw: string): { ok: boolean; reason?: string } {
  if (pw.length < 10) return { ok: false, reason: "Minimum 10 characters" };
  if (!/[a-zA-Z]/.test(pw)) return { ok: false, reason: "Needs at least one letter" };
  if (!/\d/.test(pw)) return { ok: false, reason: "Needs at least one number" };
  if (/^6T4CUSTOMS$/i.test(pw)) return { ok: false, reason: "Cannot be the default password" };
  return { ok: true };
}
