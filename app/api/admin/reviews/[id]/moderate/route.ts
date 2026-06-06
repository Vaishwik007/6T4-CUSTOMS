import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAdmin, getClientIp } from "@/lib/admin/context";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const Body = z.object({
  action: z.enum(["approve", "reject"])
});

/**
 * POST /api/admin/reviews/[id]/moderate
 *
 * Approves or rejects a pending/flagged review. Sets `status`, `moderated_at`,
 * and `moderated_by` to the current admin. Revalidates the admin reviews page
 * and the product PDP so newly published reviews show up immediately.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const supa = createAdminSupabase();
  if (!supa) {
    return NextResponse.json(
      { ok: false, error: "backend_unconfigured" },
      { status: 503 }
    );
  }

  const nextStatus = parsed.data.action === "approve" ? "published" : "rejected";

  const { data: existing, error: fetchErr } = await supa
    .from("reviews")
    .select("id, product_id")
    .eq("id", params.id)
    .maybeSingle();

  if (fetchErr) {
    const msg = String(fetchErr.message ?? "");
    if (msg.includes("relation") && msg.includes("reviews")) {
      return NextResponse.json(
        { ok: false, error: "reviews_table_pending" },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { error: updateErr } = await supa
    .from("reviews")
    .update({
      status: nextStatus,
      moderated_at: new Date().toISOString(),
      moderated_by: me.sub
    })
    .eq("id", params.id);

  if (updateErr) {
    return NextResponse.json(
      { ok: false, error: updateErr.message },
      { status: 500 }
    );
  }

  await supa.from("admin_activity_log").insert({
    admin_id: me.sub,
    admin_username: me.username,
    action: "review_moderated",
    target_type: "review",
    target_id: params.id,
    metadata: { action: parsed.data.action, status: nextStatus },
    ip: getClientIp(req.headers)
  });

  revalidatePath("/admin/reviews");
  if (existing.product_id) {
    revalidatePath(`/parts/${existing.product_id}`);
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
