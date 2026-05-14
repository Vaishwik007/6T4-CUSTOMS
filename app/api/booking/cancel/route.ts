import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { rateLimit, getClientKey } from "@/lib/security/rate-limit";
import { CANCEL_MIN_NOTICE_MS } from "@/lib/booking/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/booking/cancel
 *
 * Marks a booking `cancelled` and enqueues a cancellation email. Refuses
 * cancellations less than `CANCEL_MIN_NOTICE_MS` before the scheduled slot so
 * walk-up bays don't sit empty.
 *
 * Rate-limit: 20 cancels/hour/IP.
 */

const BodySchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().max(500).optional()
});

interface BookingLookupRow {
  id: string;
  booking_ref: string | null;
  scheduled_for: string;
  duration_minutes: number;
  bay_number: number | null;
  customer_name: string;
  customer_email: string;
  status: string;
  bike_info: unknown;
  service_id: string;
}

export async function POST(req: NextRequest) {
  const ip = getClientKey(req.headers);
  if (!rateLimit(`booking-cancel:${ip}`, 20, 60 * 60_000)) {
    return NextResponse.json(
      { error: "rate_limited" },
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

  const { data: booking, error: lookupErr } = await admin
    .from("service_bookings")
    .select(
      "id, booking_ref, scheduled_for, duration_minutes, bay_number, customer_name, customer_email, status, bike_info, service_id"
    )
    .eq("id", parsed.bookingId)
    .maybeSingle<BookingLookupRow>();

  if (lookupErr) {
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }
  if (!booking) {
    return NextResponse.json({ error: "booking_not_found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true, already: true });
  }
  if (booking.status === "completed" || booking.status === "in_progress") {
    return NextResponse.json(
      { error: "cannot_cancel", message: "Booking is already underway or completed." },
      { status: 409 }
    );
  }

  // Enforce the 4-hour cutoff.
  const scheduledMs = new Date(booking.scheduled_for).getTime();
  if (!Number.isFinite(scheduledMs)) {
    return NextResponse.json({ error: "booking_corrupt" }, { status: 500 });
  }
  if (scheduledMs - Date.now() < CANCEL_MIN_NOTICE_MS) {
    return NextResponse.json(
      {
        error: "too_late",
        message:
          "Cancellations need to be at least 4 hours before the slot. WhatsApp us instead."
      },
      { status: 409 }
    );
  }

  const reason = parsed.reason?.trim() || null;
  const cancelledAt = new Date().toISOString();

  const { error: updErr } = await admin
    .from("service_bookings")
    .update({
      status: "cancelled",
      cancelled_at: cancelledAt,
      cancellation_reason: reason
    })
    .eq("id", booking.id);

  if (updErr) {
    return NextResponse.json({ error: "cancel_failed" }, { status: 500 });
  }

  // Resolve service name for the email payload.
  const { data: svc } = await admin
    .from("services")
    .select("name")
    .eq("id", booking.service_id)
    .maybeSingle();
  const serviceName = (svc?.name as string | undefined) ?? "Service";

  await admin.from("notification_queue").insert({
    channel: "email",
    recipient: booking.customer_email,
    template: "booking_cancelled",
    payload: {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      service_name: serviceName,
      scheduled_for: booking.scheduled_for,
      duration_minutes: booking.duration_minutes,
      bay_number: booking.bay_number,
      customer_name: booking.customer_name,
      bike_info: booking.bike_info,
      reason
    },
    scheduled_for: cancelledAt
  });

  return NextResponse.json({ ok: true, cancelled_at: cancelledAt });
}
