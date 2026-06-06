import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { rateLimit, getClientKey } from "@/lib/security/rate-limit";
import { generateBookingRef } from "@/lib/booking/ref";
import type { BookingSlot } from "@/lib/booking/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/booking/create
 *
 * Creates a `pending` service booking and enqueues a confirmation email via
 * `notification_queue` (dispatched by the /api/cron/dispatch-notifications
 * Vercel cron). Validates input with Zod, generates a short human ref like
 * `6T4-B-XXXXX`, and re-checks slot availability right before insert so the
 * UI's stale-slot race is caught with a 409 instead of a silent overlap.
 *
 * Rate-limit: 5 bookings/hour/IP.
 */

const BikeInfoSchema = z.object({
  brandSlug: z.string().min(1).max(80),
  modelSlug: z.string().min(1).max(80),
  year: z.number().int().min(1970).max(new Date().getFullYear() + 1),
  plate: z.string().min(1).max(20).optional()
});

const BodySchema = z.object({
  serviceSlug: z.string().min(1).max(80),
  scheduledFor: z.string().datetime({ message: "scheduledFor must be ISO 8601" }),
  bayNumber: z.number().int().min(1).max(10),
  fullName: z.string().min(2).max(120),
  phone: z.string().regex(/^[+\d\s-]{7,20}$/, "phone format invalid"),
  email: z.string().email(),
  bikeInfo: BikeInfoSchema,
  notes: z.string().max(2000).optional()
});

const MAX_ATTEMPTS = 3;

interface OverlapRow {
  id: string;
}

export async function POST(req: NextRequest) {
  const ip = getClientKey(req.headers);
  if (!rateLimit(`booking-create:${ip}`, 5, 60 * 60_000)) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many bookings. Try again in an hour." },
      { status: 429, headers: { "Retry-After": "600" } }
    );
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch (err) {
    const details = err instanceof z.ZodError ? err.flatten() : null;
    return NextResponse.json({ error: "invalid_payload", details }, { status: 400 });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "backend_unconfigured" }, { status: 503 });
  }

  // Resolve service slug -> id + duration.
  const { data: svc, error: svcErr } = await admin
    .from("services")
    .select("id, name, duration_minutes, base_price, active")
    .eq("slug", parsed.serviceSlug)
    .maybeSingle();
  if (svcErr || !svc || !svc.active) {
    return NextResponse.json({ error: "service_not_found" }, { status: 404 });
  }

  // Future-only check.
  const scheduledMs = new Date(parsed.scheduledFor).getTime();
  if (!Number.isFinite(scheduledMs) || scheduledMs <= Date.now()) {
    return NextResponse.json({ error: "slot_in_past" }, { status: 400 });
  }

  const duration = svc.duration_minutes as number;
  const endMs = scheduledMs + duration * 60_000;

  // Race-safe overlap check: any pending/confirmed/in_progress booking on
  // the same bay that overlaps this window blocks the insert.
  const startIso = new Date(scheduledMs).toISOString();
  const endIso = new Date(endMs).toISOString();
  const { data: overlaps, error: overlapErr } = await admin
    .from("service_bookings")
    .select("id, scheduled_for, duration_minutes")
    .eq("bay_number", parsed.bayNumber)
    .in("status", ["pending", "confirmed", "in_progress"])
    .lt("scheduled_for", endIso)
    .gte("scheduled_for", new Date(scheduledMs - 12 * 60 * 60_000).toISOString());

  if (overlapErr) {
    return NextResponse.json({ error: "overlap_lookup_failed" }, { status: 500 });
  }

  const conflicting = ((overlaps ?? []) as Array<{
    id: string;
    scheduled_for: string;
    duration_minutes: number;
  }>).find((row) => {
    const rowStart = new Date(row.scheduled_for).getTime();
    const rowEnd = rowStart + row.duration_minutes * 60_000;
    return rowStart < endMs && rowEnd > scheduledMs;
  }) as OverlapRow | undefined;

  if (conflicting) {
    return NextResponse.json(
      { error: "slot_taken", message: "That slot just filled — pick another." },
      { status: 409 }
    );
  }

  // Insert with a fresh booking_ref. Retry on the unlikely (1-in-millions)
  // collision because `booking_ref` is unique.
  let bookingId: string | null = null;
  let bookingRef: string | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = generateBookingRef();
    const { data: inserted, error: insErr } = await admin
      .from("service_bookings")
      .insert({
        service_id: svc.id,
        booking_ref: candidate,
        scheduled_for: startIso,
        duration_minutes: duration,
        bay_number: parsed.bayNumber,
        customer_name: parsed.fullName.trim(),
        customer_phone: parsed.phone.trim(),
        customer_email: parsed.email.trim().toLowerCase(),
        bike_info: parsed.bikeInfo,
        notes: parsed.notes?.trim() || null,
        status: "pending",
        balance_due: svc.base_price ?? 0
      })
      .select("id, booking_ref")
      .single();

    if (!insErr && inserted) {
      bookingId = inserted.id;
      bookingRef = inserted.booking_ref;
      break;
    }

    const msg = String(insErr?.message ?? "");
    // Unique-violation on booking_ref — retry with a new ref.
    if (msg.toLowerCase().includes("booking_ref")) continue;
    return NextResponse.json(
      { error: "create_failed", details: msg },
      { status: 500 }
    );
  }

  if (!bookingId || !bookingRef) {
    return NextResponse.json({ error: "ref_collision" }, { status: 500 });
  }

  // Enqueue confirmation email — dispatched by the cron route.
  await admin.from("notification_queue").insert({
    channel: "email",
    recipient: parsed.email.trim().toLowerCase(),
    template: "booking_confirmation",
    payload: {
      booking_id: bookingId,
      booking_ref: bookingRef,
      service_id: svc.id,
      service_name: svc.name as string,
      scheduled_for: startIso,
      duration_minutes: duration,
      bay_number: parsed.bayNumber,
      customer_name: parsed.fullName.trim(),
      bike_info: parsed.bikeInfo
    },
    scheduled_for: new Date().toISOString()
  });

  // Echo the booking shape useful for the post-submit confirmation card.
  const slot: BookingSlot = {
    start: startIso,
    end: endIso,
    bay: parsed.bayNumber
  };

  return NextResponse.json({
    ok: true,
    bookingId,
    bookingRef,
    slot
  });
}
