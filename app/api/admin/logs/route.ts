import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const [activity, attempts] = await Promise.all([
    supa
      .from("admin_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supa
      .from("login_attempts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
  ]);

  return NextResponse.json({
    ok: true,
    activity: activity.data ?? [],
    attempts: attempts.data ?? []
  });
}
