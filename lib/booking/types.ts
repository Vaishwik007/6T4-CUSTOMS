/**
 * Shared booking-domain types. The DB schema is in
 * supabase/migrations/0005_services_booking.sql — keep these in sync with the
 * `service_bookings` columns and the `bike_info` JSONB shape.
 */

export interface BikeInfo {
  brandSlug: string;
  modelSlug: string;
  year: number;
  plate?: string;
}

export interface BookingSlot {
  start: string; // ISO timestamp
  end: string;   // ISO timestamp
  bay: number;
}

export interface BookingRow {
  id: string;
  booking_ref: string | null;
  service_id: string;
  scheduled_for: string;
  duration_minutes: number;
  bay_number: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  bike_info: BikeInfo;
  notes: string | null;
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
}

export interface ServiceForBooking {
  id: string;
  slug: string;
  name: string;
  duration_minutes: number;
  bay_required: number;
  base_price: number;
}

/** Default daily window — overridden per-service in the future. */
export const BAY_OPEN_HOUR = 10;
export const BAY_CLOSE_HOUR = 19;
export const BAY_COUNT = 3;

/**
 * Cancel cutoff — bookings less than this many ms in the future cannot be
 * cancelled via the public API.
 */
export const CANCEL_MIN_NOTICE_MS = 4 * 60 * 60 * 1000;
