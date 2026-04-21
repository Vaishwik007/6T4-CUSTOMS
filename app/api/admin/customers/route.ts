import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const supa = createAdminSupabase();
  if (!supa) return NextResponse.json({ ok: false, error: "backend_unconfigured" }, { status: 503 });

  const { data } = await supa
    .from("customers")
    .select("*")
    .order("total_spent", { ascending: false })
    .limit(500);
  return NextResponse.json({ ok: true, customers: data ?? [] });
}
