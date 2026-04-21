// Node-runtime only helpers (not safe for Edge middleware).
import { randomBytes, createHash } from "crypto";

export function generateSessionToken(): { raw: string; hash: string } {
  const raw = randomBytes(24).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
