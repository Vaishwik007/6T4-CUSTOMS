import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "6t4-customs-dev-secret-change-me-in-production"
);
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
