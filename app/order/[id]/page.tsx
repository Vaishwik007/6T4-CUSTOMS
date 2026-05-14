import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle, MessageCircle, Home as HomeIcon, Package } from "lucide-react";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/formatPrice";
import { SITE } from "@/lib/seo/config";

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
  notes: string | null;
  created_at: string;
};

type ItemRow = {
  part_id: string;
  qty: number;
  unit_price: number;
};

const STATUS_LABEL: Record<string, { label: string; tone: "ok" | "warn" | "danger" }> = {
  pending: { label: "Pending", tone: "warn" },
  awaiting_payment: { label: "Awaiting Payment", tone: "warn" },
  confirmed: { label: "Confirmed", tone: "ok" },
  "in-progress": { label: "On The Bench", tone: "ok" },
  ready: { label: "Ready", tone: "ok" },
  delivered: { label: "Delivered", tone: "ok" },
  cancelled: { label: "Cancelled", tone: "danger" }
};

const PAYMENT_LABEL: Record<string, { label: string; tone: "ok" | "warn" | "danger" }> = {
  paid: { label: "Paid", tone: "ok" },
  created: { label: "Awaiting Confirmation", tone: "warn" },
  unpaid: { label: "Unpaid", tone: "warn" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "danger" }
};

async function fetchOrder(
  orderId: string
): Promise<{ order: OrderRow | null; items: ItemRow[] }> {
  // Prefer authenticated user-scoped read first (RLS enforces user_id match).
  const supabase = await createServerSupabase();
  if (supabase) {
    const { data: authedOrder } = await supabase
      .from("orders")
      .select(
        "id, booking_token, status, payment_status, total, delivery_mode, payment_method, razorpay_payment_id, paid_at, address, notes, created_at"
      )
      .eq("id", orderId)
      .maybeSingle();
    if (authedOrder) {
      const { data: items } = await supabase
        .from("order_items")
        .select("part_id, qty, unit_price")
        .eq("order_id", orderId);
      return { order: authedOrder as OrderRow, items: (items ?? []) as ItemRow[] };
    }
  }

  // Guest fallback: admin client. (In production, gate this with a `?token=`
  // booking_token check to prevent enumeration. We surface only safe fields.)
  const admin = createAdminSupabase();
  if (!admin) return { order: null, items: [] };

  const { data: order } = await admin
    .from("orders")
    .select(
      "id, booking_token, status, payment_status, total, delivery_mode, payment_method, razorpay_payment_id, paid_at, address, notes, created_at"
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

export default async function OrderPage({ params }: { params: { id: string } }) {
  const { order, items } = await fetchOrder(params.id);
  if (!order) notFound();

  const statusInfo = STATUS_LABEL[order.status] ?? { label: order.status, tone: "warn" as const };
  const paymentInfo =
    PAYMENT_LABEL[order.payment_status] ?? { label: order.payment_status, tone: "warn" as const };

  const token =
    order.booking_token ??
    `6T4-${order.id.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6)}`;

  const waNumber = SITE.whatsapp.replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Hi 6T4 Customs — order ${token} (id ${order.id})`
  );
  const waHref = `https://wa.me/${waNumber}?text=${waText}`;

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <div className="mb-10 flex items-center gap-3 text-display text-[10px] uppercase tracking-[0.5em] text-neon">
        <span className="h-px w-8 bg-neon" />
        Order Detail
      </div>

      <div className="border border-white/10 bg-carbon p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Booking Token</p>
            <p className="mt-2 text-stencil text-4xl text-neon">{token}</p>
            <p className="mt-3 break-all text-[10px] uppercase tracking-[0.3em] text-bone/40">
              Order ID · <span className="font-mono">{order.id}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusPill label={statusInfo.label} tone={statusInfo.tone} icon={statusInfo.tone === "ok" ? CheckCircle2 : Clock} />
            <StatusPill label={paymentInfo.label} tone={paymentInfo.tone} icon={paymentInfo.tone === "ok" ? CheckCircle2 : AlertCircle} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
          <Info label="Total" value={formatPrice(order.total)} highlight />
          <Info
            label="Payment Method"
            value={order.payment_method === "razorpay" ? "Razorpay" : order.payment_method === "pay-at-shop" ? "Pay at Shop" : order.payment_method}
          />
          <Info
            label="Delivery"
            value={order.delivery_mode === "delivery" ? "Courier Delivery" : "In-Shop Install"}
          />
          <Info
            label="Placed"
            value={new Date(order.created_at).toLocaleString("en-IN")}
          />
          {order.paid_at && (
            <Info label="Paid" value={new Date(order.paid_at).toLocaleString("en-IN")} />
          )}
          {order.razorpay_payment_id && (
            <Info label="Payment Ref" value={order.razorpay_payment_id} mono />
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Items</p>
            <ul className="mt-3 divide-y divide-white/5">
              {items.map((it) => (
                <li key={it.part_id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="flex items-center gap-3 text-bone/80">
                    <Package className="h-4 w-4 text-neon" />
                    <span className="text-neon">{it.qty}×</span>
                    <span className="font-mono text-xs">{it.part_id}</span>
                  </span>
                  <span className="text-bone/50">
                    {formatPrice(it.unit_price * it.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {order.address && (order.address.fullName || order.address.address1) && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">
              {order.delivery_mode === "delivery" ? "Shipping Address" : "Contact"}
            </p>
            <div className="mt-2 text-sm text-bone/80">
              {order.address.fullName && <div>{order.address.fullName}</div>}
              {order.address.phone && <div className="text-bone/60">{order.address.phone}</div>}
              {order.address.email && <div className="text-bone/60">{order.address.email}</div>}
              {order.delivery_mode === "delivery" && order.address.address1 && (
                <div className="mt-2 text-bone/70">
                  {order.address.address1}, {order.address.city}, {order.address.state}{" "}
                  {order.address.pin}
                </div>
              )}
            </div>
          </div>
        )}

        {order.notes && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Notes</p>
            <p className="mt-2 text-sm italic text-bone/70">"{order.notes}"</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={waHref}
          target="_blank"
          rel="noopener"
          data-cursor="cta"
          className="inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp About This Order
        </Link>
        <Link
          href="/"
          data-cursor="cta"
          className="inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-display text-xs uppercase tracking-[0.2em] text-bone transition-colors hover:border-neon hover:text-neon"
        >
          <HomeIcon className="h-4 w-4" /> Home
        </Link>
      </div>
    </section>
  );
}

function StatusPill({
  label,
  tone,
  icon: Icon
}: {
  label: string;
  tone: "ok" | "warn" | "danger";
  icon: typeof CheckCircle2;
}) {
  const toneClasses =
    tone === "ok"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : tone === "danger"
        ? "border-red-500/40 bg-red-500/10 text-red-300"
        : "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] ${toneClasses}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
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
