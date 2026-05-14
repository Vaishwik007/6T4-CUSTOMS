import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import {
  orderConfirmation,
  type OrderForEmail,
  type OrderItemForEmail
} from "@/lib/email/templates/order-confirmation";
import { reviewRequest } from "@/lib/email/templates/review-request";
import {
  bookingConfirmation,
  type BookingForEmail
} from "@/lib/email/templates/booking-confirmation";
import { bookingReminder } from "@/lib/email/templates/booking-reminder";
import { bookingCancelled } from "@/lib/email/templates/booking-cancelled";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel cron entrypoint — runs every 5 minutes (see vercel.json).
 *
 * Pulls up to BATCH_SIZE pending notification_queue rows whose
 * scheduled_for has elapsed, renders the appropriate template, and posts
 * via the shared `sendEmail` wrapper. On failure, increments `attempts` and
 * either re-queues with a +5min back-off or marks `failed` once
 * `max_attempts` is exhausted.
 *
 * Authentication: requires `Authorization: Bearer ${CRON_SECRET}`. Vercel
 * cron sets this header automatically when CRON_SECRET is configured.
 */

const BATCH_SIZE = 50;
const RETRY_DELAY_MS = 5 * 60 * 1000;

interface QueueRow {
  id: string;
  channel: string;
  recipient: string;
  template: string;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
}

interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const token = header.slice(7).trim();
  // Constant-time compare via Buffer.
  if (token.length !== expected.length) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "backend_unconfigured" }, { status: 503 });
  }

  const nowIso = new Date().toISOString();
  const { data: rows, error: pickErr } = await admin
    .from("notification_queue")
    .select("id, channel, recipient, template, payload, attempts, max_attempts")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .order("scheduled_for", { ascending: true })
    .limit(BATCH_SIZE);

  if (pickErr) {
    return NextResponse.json(
      { error: "queue_lookup_failed", details: pickErr.message },
      { status: 500 }
    );
  }

  const batch = (rows ?? []) as QueueRow[];
  let sent = 0;
  let failed = 0;

  for (const row of batch) {
    try {
      if (row.channel !== "email") {
        // Non-email channels are not implemented yet — park as failed so they
        // surface in admin without blocking the queue.
        await admin
          .from("notification_queue")
          .update({
            status: "failed",
            error: `channel_unsupported:${row.channel}`,
            attempts: row.attempts + 1
          })
          .eq("id", row.id);
        failed++;
        continue;
      }

      const rendered = renderTemplate(row.template, row.payload);
      if (!rendered) {
        await admin
          .from("notification_queue")
          .update({
            status: "failed",
            error: `template_not_found:${row.template}`,
            attempts: row.attempts + 1
          })
          .eq("id", row.id);
        failed++;
        continue;
      }

      const res = await sendEmail({
        to: row.recipient,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text
      });

      if (res.ok) {
        await admin
          .from("notification_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            attempts: row.attempts + 1,
            error: null
          })
          .eq("id", row.id);
        sent++;
      } else {
        const nextAttempts = row.attempts + 1;
        if (nextAttempts >= row.max_attempts) {
          await admin
            .from("notification_queue")
            .update({
              status: "failed",
              attempts: nextAttempts,
              error: res.error
            })
            .eq("id", row.id);
          failed++;
        } else {
          await admin
            .from("notification_queue")
            .update({
              attempts: nextAttempts,
              scheduled_for: new Date(Date.now() + RETRY_DELAY_MS).toISOString(),
              error: res.error
            })
            .eq("id", row.id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const nextAttempts = row.attempts + 1;
      if (nextAttempts >= row.max_attempts) {
        await admin
          .from("notification_queue")
          .update({
            status: "failed",
            attempts: nextAttempts,
            error: msg
          })
          .eq("id", row.id);
        failed++;
      } else {
        await admin
          .from("notification_queue")
          .update({
            attempts: nextAttempts,
            scheduled_for: new Date(Date.now() + RETRY_DELAY_MS).toISOString(),
            error: msg
          })
          .eq("id", row.id);
      }
    }
  }

  return NextResponse.json({
    processed: batch.length,
    sent,
    failed
  });
}

/**
 * Render a queue row to an email template. Returns `null` when the template
 * key is unknown, which surfaces as a `failed` row in the dispatch loop.
 */
function renderTemplate(
  template: string,
  payload: Record<string, unknown>
): RenderedTemplate | null {
  switch (template) {
    case "order_confirmation": {
      const order = (payload.order ?? payload) as Partial<OrderForEmail>;
      const items = ((payload.items ?? []) as OrderItemForEmail[]) ?? [];
      if (!order?.id) return null;
      return orderConfirmation(order as OrderForEmail, items);
    }
    case "review_request": {
      const order = (payload.order ?? payload) as Partial<OrderForEmail>;
      const items = ((payload.items ?? []) as OrderItemForEmail[]) ?? [];
      if (!order?.id) return null;
      const reviewUrl =
        typeof payload.review_url === "string"
          ? (payload.review_url as string)
          : undefined;
      return reviewRequest(order as OrderForEmail, items, reviewUrl);
    }
    case "booking_confirmation": {
      const booking = payloadToBooking(payload);
      if (!booking) return null;
      return bookingConfirmation(booking);
    }
    case "booking_reminder": {
      const booking = payloadToBooking(payload);
      if (!booking) return null;
      return bookingReminder(booking);
    }
    case "booking_cancelled": {
      const booking = payloadToBooking(payload);
      if (!booking) return null;
      const reason =
        typeof payload.reason === "string" ? (payload.reason as string) : null;
      return bookingCancelled(booking, reason);
    }
    default:
      return null;
  }
}

function payloadToBooking(
  payload: Record<string, unknown>
): BookingForEmail | null {
  const id = typeof payload.booking_id === "string" ? payload.booking_id : null;
  const serviceName =
    typeof payload.service_name === "string"
      ? payload.service_name
      : "Service";
  const scheduledFor =
    typeof payload.scheduled_for === "string"
      ? payload.scheduled_for
      : null;
  const duration =
    typeof payload.duration_minutes === "number"
      ? payload.duration_minutes
      : null;
  if (!id || !scheduledFor || duration == null) return null;

  const ref =
    typeof payload.booking_ref === "string"
      ? payload.booking_ref
      : null;
  const bayNumber =
    typeof payload.bay_number === "number"
      ? payload.bay_number
      : null;
  const customerName =
    typeof payload.customer_name === "string"
      ? payload.customer_name
      : "Rider";

  return {
    id,
    booking_ref: ref,
    service_name: serviceName,
    scheduled_for: scheduledFor,
    duration_minutes: duration,
    bay_number: bayNumber,
    customer_name: customerName,
    bike_info: (payload.bike_info as BookingForEmail["bike_info"]) ?? null
  };
}
