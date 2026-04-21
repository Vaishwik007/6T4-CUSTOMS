import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminJwt } from "@/lib/admin/session";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/admin/activity-log";

export async function POST() {
  const jar = cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) {
    const payload = await verifyAdminJwt(token);
    if (payload) {
      const supa = createAdminSupabase();
      if (supa) {
        await supa
          .from("admin_sessions")
          .update({ revoked_at: new Date().toISOString() })
          .eq("id", payload.sid);
        await logActivity({ adminId: payload.sub, adminUsername: payload.username, action: "logout" });
      }
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
