# 6T4 CUSTOMS — Razorpay Integration

End-to-end payment flow with **dynamic inventory decrement** on successful capture,
**atomic stock guards** to prevent overselling, and a webhook fallback so no paid
order is ever lost.

## What you get

- `POST /api/razorpay/create-order` — validates live stock, inserts an `awaiting_payment`
  order + items, creates a Razorpay order, returns `{ orderId, razorpayOrderId, amount, keyId, prefill }`.
- `POST /api/razorpay/verify` — HMAC-SHA256 verifies the checkout signature, then calls
  the Postgres RPC `finalize_paid_order(...)` which **atomically** decrements stock for
  every line item + marks the order paid. Oversold races are refunded automatically via
  the Razorpay refund API.
- `POST /api/razorpay/webhook` — verifies the webhook signature (`RAZORPAY_WEBHOOK_SECRET`),
  reconciles `payment.captured` / `payment.failed` / `refund.processed` idempotently.
- `GET /api/stock?ids=a,b,c` — live stock + price lookup, powers the cart/checkout UI.
- `/thank-you?orderId=<uuid>` — success page that reads Supabase and confirms capture.

## Env vars

Add these to `.env.local` (already gitignored) and Vercel → Project → Environment Variables:

```
RAZORPAY_KEY_ID=rzp_test_XXXX
RAZORPAY_KEY_SECRET=XXXX
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXX
RAZORPAY_WEBHOOK_SECRET=<strong-random-string>
```

Get the keys from: https://dashboard.razorpay.com/app/keys

## Webhook setup

1. Razorpay Dashboard → Settings → Webhooks → **Add**.
2. URL: `https://<your-domain>/api/razorpay/webhook`
3. Active events:
   - `payment.captured` (required)
   - `payment.failed`
   - `refund.processed`
4. Secret: paste the same value you put in `RAZORPAY_WEBHOOK_SECRET`.

The webhook is the authoritative fallback — if the user closes the tab before the
client-side verify runs, the webhook still finalizes the order + stock.

## Migration

Run once against your Supabase project:

```bash
npm run migrate
```

That applies `supabase/migrations/0003_razorpay_payments.sql` which:

- Adds `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `paid_at` to `orders`.
- Adds the `awaiting_payment` order status and the `razorpay` payment method.
- Creates the `payments` ledger + `webhook_events` idempotency table.
- **Modifies the `on_order_item_insert` trigger** to skip stock decrement while
  `status = 'awaiting_payment'` (decrement happens in the `finalize_paid_order` RPC instead).
- Creates the atomic `finalize_paid_order(order_id, rzp_order, rzp_payment, rzp_sig)` RPC.

The migration is idempotent (`create ... if not exists`, `alter ... add column if not exists`).

## Happy path

1. User clicks **Pay Online** → `POST /api/razorpay/create-order`.
2. Server validates stock, inserts order row, creates Razorpay order, returns IDs + prefill.
3. Client loads `checkout.razorpay.com/v1/checkout.js` and opens the modal.
4. User pays → Razorpay fires the client `handler` with `razorpay_payment_id / order_id / signature`.
5. Client `POST /api/razorpay/verify` → server verifies HMAC → calls RPC → atomic stock decrement + mark paid.
6. Client redirects to `/thank-you?orderId=...` which reads Supabase and shows the confirmation.
7. Webhook arrives async → no-op because order is already `paid` (idempotent).

## Edge cases handled

- **Oversold race** (another buyer drains stock between create-order and verify): the
  RPC raises `insufficient_stock:<ids>`, the verify route calls `rzp.payments.refund(...)`,
  order is marked `refunded`, user is redirected to `/thank-you?status=failed`.
- **Tab closed before verify**: webhook arrives → server calls the same RPC → order finalized.
- **Duplicate webhook delivery**: `webhook_events.event_id` unique constraint de-dupes.
- **Duplicate verify call**: `finalize_paid_order` returns `{ok:true, already:true}` on the 2nd call.
- **Client tampering with total / part IDs**: server recomputes total from live `products.price`.

## Testing

Use Razorpay test cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/

- `4111 1111 1111 1111` — success
- `5104 0600 0000 0008` — 3DS
- UPI success: `success@razorpay`
- UPI failure: `failure@razorpay`

## Files

- `supabase/migrations/0003_razorpay_payments.sql` — schema + RPC.
- `lib/razorpay/client.ts` — server SDK factory.
- `lib/razorpay/verify.ts` — HMAC verification (checkout + webhook).
- `lib/razorpay/checkout.ts` — client-side modal loader.
- `lib/hooks/useLiveStock.ts` — polls `/api/stock` every 15s.
- `app/api/razorpay/create-order/route.ts`
- `app/api/razorpay/verify/route.ts`
- `app/api/razorpay/webhook/route.ts`
- `app/api/stock/route.ts`
- `app/checkout/page.tsx` — wired to Razorpay + live stock.
- `app/thank-you/page.tsx` — server-rendered confirmation.
- `app/cart/page.tsx` — live stock badges + out-of-stock gating.
