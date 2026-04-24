import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createServerSupabase } from "@/lib/supabase/server";

type CheckoutPayload = {
  items: {
    partId: string;
    qty: number;
    unitPrice: number;
    forBuild?: { brand: string; model: string; year: number } | null;
  }[];
  total: number;
  fullName: string;
  phone: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  pin: string;
  delivery: "in-shop" | "delivery";
  payment: "upi" | "card" | "pay-at-shop" | "razorpay";
  notes?: string;
};

const BOOKING_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function bookingToken() {
  let s = "";
  for (let i = 0; i < 6; i++) s += BOOKING_CHARS[Math.floor(Math.random() * BOOKING_CHARS.length)];
  return `6T4-${s}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CheckoutPayload;

  // Defensive defaults (when Supabase isn't configured, still return an order id + token).
  const orderId = randomUUID();
  const token = bookingToken();

  try {
    const supabase = await createServerSupabase();
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      await supabase.from("orders").insert({
        id: orderId,
        user_id: userId,
        status: "pending",
        total: body.total,
        delivery_mode: body.delivery,
        payment_method: body.payment,
        booking_token: token,
        address: {
          fullName: body.fullName,
          phone: body.phone,
          email: body.email,
          address1: body.address1,
          city: body.city,
          state: body.state,
          pin: body.pin
        },
        notes: body.notes ?? null
      });

      if (body.items.length > 0) {
        await supabase.from("order_items").insert(
          body.items.map((it) => ({
            order_id: orderId,
            part_id: it.partId,
            qty: it.qty,
            unit_price: it.unitPrice,
            for_build: it.forBuild ?? null
          }))
        );
      }
    }
  } catch (err) {
    console.error("Checkout insert failed, returning best-effort confirmation:", err);
  }

  return NextResponse.json({ orderId, token });
}
