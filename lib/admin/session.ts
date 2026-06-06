import { SignJWT, jwtVerify } from "jose";

// CRIT-01 FIX: No fallback. The server refuses to start if this is absent.
// This prevents forging admin JWTs with a publicly-known default.
const rawSecret = process.env.ADMIN_JWT_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  throw new Error(
    "[6T4] ADMIN_JWT_SECRET env var is missing or too short (min 32 chars). " +
    "Generate one with: openssl rand -hex 32"
  );
}
const SECRET = new TextEncoder().encode(rawSecret);

const ALG = "HS256";
const COOKIE_NAME = "6t4_admin";
const SESSION_TTL_HOURS = 8;

export type AdminJwtPayload = {
  sub: string; // admin_id
  sid: string; // session_id
  username: string;
  role: "super_admin" | "admin" | "staff";
  fpc?: boolean; // force_password_change
};

export async function signAdminJwt(payload: AdminJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_HOURS}h`)
    .sign(SECRET);
}

export async function verifyAdminJwt(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: [ALG] });
    return payload as unknown as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
}

export const ADMIN_COOKIE = COOKIE_NAME;
