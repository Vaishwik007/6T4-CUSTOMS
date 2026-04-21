import { NextResponse, type NextRequest } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: true, notifications: [] });

  const { data } = await supa
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return NextResponse.json({ ok: true, notifications: data ?? [] });
}

/** POST /api/admin/notifications — mark one/all read. Body: { id?: string, all?: true } */
export async function POST(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { id?: string; all?: boolean };
  let query = supa.from("notifications").update({ read_at: new Date().toISOString() });
  if (body.all) query = query.is("read_at", null);
  else if (body.id) query = query.eq("id", body.id);
  else return NextResponse.json({ ok: false, error: "missing_target" }, { status: 400 });

  const { error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
