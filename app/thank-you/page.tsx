import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Home as HomeIcon, XCircle } from "lucide-react";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils/formatPrice";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  booking_token: string | null;
  status: string;
  payment_status: string;
  total: number;
  delivery_mode: string;
  payment_method: string;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  address: Record<string, string>;
  created_at: string;
};

type ItemRow = {
  part_id: string;
  qty: number;
  unit_price: number;
};

async function fetchOrder(
  orderId: string
): Promise<{ order: OrderRow | null; items: ItemRow[] }> {
  const admin = createAdminSupabase();
  if (!admin) return { order: null, items: [] };

  const { data: order } = await admin
    .from("orders")
    .select(
      "id, booking_token, status, payment_status, total, delivery_mode, payment_method, razorpay_payment_id, paid_at, address, created_at"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { order: null, items: [] };

  const { data: items } = await admin
    .from("order_items")
    .select("part_id, qty, unit_price")
    .eq("order_id", orderId);

  return { order: order as OrderRow, items: (items ?? []) as ItemRow[] };
}

export default async function ThankYouPage({
  searchParams
}: {
  searchParams: { orderId?: string; status?: string };
}) {
  const orderId = searchParams.orderId ?? "";
  const failed = searchParams.status === "failed";
  const { order, items } = orderId ? await fetchOrder(orderId) : { order: null, items: [] };

  const isPaid = order?.payment_status === "paid" && !failed;
  const token =
    order?.booking_token ??
    `6T4-${orderId.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6) || "LOCKED"}`;

  const waNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "+919999999999";
  const waText = encodeURIComponent(
    `Hi 6T4 Customs — order ${token} (id ${orderId})`
  );
  const waHref = `https://wa.me/${waNumber.replace(/[^\d]/g, "")}?text=${waText}`;

  return (
    <Suspense>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24 pt-32 md:py-32">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-neon to-transparent" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div
            className={
              isPaid
                ? "mx-auto grid h-20 w-20 place-items-center border border-neon bg-neon-900/30 shadow-neon"
                : "mx-auto grid h-20 w-20 place-items-center border border-red-500/60 bg-red-500/10"
            }
          >
            {isPaid ? (
              <CheckCircle2 className="h-10 w-10 text-neon" />
            ) : (
              <XCircle className="h-10 w-10 text-red-400" />
            )}
          </div>

          <p
            className={
              "mt-8 text-display text-[10px] uppercase tracking-[0.5em] " +
              (isPaid ? "text-neon" : "text-red-400")
            }
          >
            {isPaid
              ? "Payment Captured"
              : failed
                ? "Payment Issue"
                : order?.payment_status === "paid"
                  ? "Payment Captured"
                  : "Pending"}
          </p>

          <h1
            className="mt-4 text-display font-black uppercase leading-[0.95] text-bone"
            style={{ fontSize: "clamp(2.25rem, 8.5vw, 5.5rem)" }}
          >
            {isPaid ? (
              <>
                Thank You.
                <br />
                Your Build Is <span className="text-neon text-glow">Locked In.</span>
              </>
            ) : (
              <>
                We Could Not <span className="text-red-400">Confirm</span> Your Payment.
              </>
            )}
          </h1>

          {isPaid && order && (
            <div className="mt-10 border border-neon/40 bg-black/70 px-6 py-5 text-left backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Booking Token" value={token} highlight />
                <Info label="Order ID" value={orderId} mono />
                <Info label="Total Paid" value={formatPrice(order.total)} highlight />
                <Info
                  label="Payment Ref"
                  value={order.razorpay_payment_id ?? "—"}
                  mono
                />
                <Info
                  label="Delivery"
                  value={order.delivery_mode === "delivery" ? "Courier" : "In-Shop Install"}
                />
                <Info
                  label="Captured"
                  value={order.paid_at ? new Date(order.paid_at).toLocaleString() : "—"}
                />
              </div>

              {items.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Items</p>
                  <ul className="mt-2 space-y-1 text-xs text-bone/70">
                    {items.map((it) => (
                      <li key={it.part_id} className="flex justify-between gap-4">
                        <span>
                          <span className="text-neon">{it.qty}×</span> {it.part_id}
                        </span>
                        <span className="text-bone/50">
                          {formatPrice(it.unit_price * it.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!isPaid && (
            <p className="mt-8 text-sm text-bone/60">
              If you were charged, don&apos;t worry — ping us on WhatsApp with your order ID
              and we&apos;ll confirm within minutes. Most payment failures are reversed
              automatically by the bank in 3-5 business days.
            </p>
          )}

          <p className="mt-6 text-sm text-bone/60">
            {isPaid
              ? "Arjun will verify on WhatsApp within 24 hours and reserve a bay slot for your install. Bring your bike + token."
              : ""}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={waHref}
              target="_blank"
              data-cursor="cta"
              className="inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
            >
              <MessageCircle className="h-4 w-4" /> Message on WhatsApp
            </Link>
            {isPaid && orderId && (
              <Link
                href={`/order/${orderId}`}
                data-cursor="cta"
                className="inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-display text-xs uppercase tracking-[0.2em] text-bone transition-colors hover:border-neon hover:text-neon"
              >
                View Order
              </Link>
            )}
            <Link
              href="/"
              data-cursor="cta"
              className="inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-display text-xs uppercase tracking-[0.2em] text-bone transition-colors hover:border-neon hover:text-neon"
            >
              <HomeIcon className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </section>
    </Suspense>
  );
}

function Info({
  label,
  value,
  highlight,
  mono
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">{label}</p>
      <p
        className={
          "mt-1 break-all " +
          (highlight ? "text-stencil text-2xl text-neon" : "text-sm text-bone") +
          (mono ? " font-mono" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}
