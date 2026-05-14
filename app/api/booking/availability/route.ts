import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { rateLimit, getClientKey } from "@/lib/security/rate-limit";
import {
  BAY_CLOSE_HOUR,
  BAY_COUNT,
  BAY_OPEN_HOUR,
  type BookingSlot
} from "@/lib/booking/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/booking/availability?service=<slug>&date=YYYY-MM-DD
 *
 * Returns available `(start, end, bay)` slots for the selected service on the
 * given calendar date, scoped to IST shop hours and de-duped against existing
 * bookings + blocked bays via the `get_available_slots` Postgres RPC.
 *
 * Rate-limit: 60 requests/min/IP.
 */

const Query = z.object({
  service: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
});

interface RpcRow {
  slot_start: string;
  slot_end: string;
  bay_number: number;
}

export async function GET(req: NextRequest) {
  const ip = getClientKey(req.headers);
  if (!rateLimit(`booking-avail:${ip}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "30" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = Query.safeParse({
    service: searchParams.get("service") ?? "",
    date: searchParams.get("date") ?? ""
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Block obviously-past dates (allows today — RPC will naturally exclude
  // already-elapsed windows because they sit inside a bay already).
  const today = new Date();
  const todayKey = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
  if (parsed.data.date < todayKey) {
    return NextResponse.json({ slots: [] satisfies BookingSlot[] });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json(
      { error: "backend_unconfigured" },
      { status: 503 }
    );
  }

  // Resolve service slug -> service_id (RPC keys off id, not slug).
  const { data: svc, error: svcErr } = await admin
    .from("services")
    .select("id, active")
    .eq("slug", parsed.data.service)
    .maybeSingle();

  if (svcErr) {
    return NextResponse.json({ error: "service_lookup_failed" }, { status: 500 });
  }
  if (!svc || !svc.active) {
    return NextResponse.json({ error: "service_not_found" }, { status: 404 });
  }

  const { data: rows, error: rpcErr } = await admin.rpc("get_available_slots", {
    p_service_id: svc.id,
    p_date: parsed.data.date,
    p_bay_count: BAY_COUNT,
    p_open_hour: BAY_OPEN_HOUR,
    p_close_hour: BAY_CLOSE_HOUR
  });

  if (rpcErr) {
    return NextResponse.json(
      { error: "availability_lookup_failed" },
      { status: 500 }
    );
  }

  const nowMs = Date.now();
  const slots: BookingSlot[] = ((rows ?? []) as RpcRow[])
    // Hide slots whose start is in the past (e.g. when querying today).
    .filter((r) => new Date(r.slot_start).getTime() > nowMs)
    .map((r) => ({
      start: r.slot_start,
      end: r.slot_end,
      bay: r.bay_number
    }));

  return NextResponse.json(
    { slots },
    { headers: { "Cache-Control": "no-store" } }
  );
}
