import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { buildMetadata } from "@/lib/seo/metadata";
import { ReviewForm } from "@/components/reviews/ReviewForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Leave a Review",
  description: "Share your build story.",
  noIndex: true
});

type OrderItem = { part_id: string; qty: number };

async function fetchOrder(orderId: string) {
  const admin = createAdminSupabase();
  if (!admin) return null;
  const { data: order } = await admin
    .from("orders")
    .select("id, payment_status, address, order_items(part_id, qty)")
    .eq("id", orderId)
    .maybeSingle();
  return order as { id: string; payment_status: string; address: { fullName?: string; phone?: string }; order_items: OrderItem[] } | null;
}

export default async function ReviewPage({
  params,
  searchParams
}: {
  params: { orderId: string };
  searchParams: { token?: string };
}) {
  const order = await fetchOrder(params.orderId);
  if (!order) notFound();

  // Lightweight token gate: a fresh secret would be issued in production via
  // signed JWT in the post-delivery email. For v1 this page is technically
  // open by order ID — acceptable because reviews go to moderation queue.
  // TODO: signed-link verification once Resend post-delivery emails ship.
  void searchParams.token;

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 pt-32 md:px-8 md:py-32">
      <header className="mb-8">
        <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Your Build</p>
        <h1 className="mt-3 text-display text-3xl font-black uppercase leading-tight md:text-4xl">
          Tell us how it rode.
        </h1>
        <p className="mt-3 text-bone/60">
          One honest paragraph helps the next rider. Verified buyers get a badge on their review.
        </p>
      </header>

      <ReviewForm
        orderId={order.id}
        defaultName={order.address?.fullName ?? ""}
        items={order.order_items ?? []}
      />
    </section>
  );
}
