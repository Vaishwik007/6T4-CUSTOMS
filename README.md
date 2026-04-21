# 6T4 CUSTOMS

> Built Different. Tuned Brutal.

Full-stack marketing + e-commerce + configurator + **enterprise admin console** for a premium motorcycle garage. Next.js 14 · Tailwind · Framer Motion · Zustand · Supabase · bcrypt + jose JWT · Resend.

## What's inside

### Customer-facing
- **Cinematic tachometer loading sequence** with engine-rev audio toggle
- **Home** — hero, what-we-do grid, animated stats, featured builds carousel
- **Configurator (4-step flow)** — Brand carousel → Model carousel → Year dropdown → Compatible parts with live HP/price overlay on a parallax bike preview
- **Why Us** — pillars, interactive dyno chart, before/after slider, tools, testimonials
- **Owner** — Bachupally Arjun timeline + philosophy
- **Cart + Checkout** (zod-validated) → animated confirmation with booking token + WhatsApp deep-link
- **Account** — **6-digit email OTP login** (Resend), saved builds, order history
- **Catalog** — 24 ICE motorcycle brands · ~220 production models with year ranges · 50+ parts with per-model compatibility rules · zero electric bikes

### Admin — "Bay 01 Ops Console"
- **Stealth admin entry** — near-invisible shield icon bottom-right of the customer sign-in page opens a modal
- **Custom bcrypt + jose JWT auth** with DB-backed sessions (independent of Supabase auth)
- **Role-based access control** — `super_admin` / `admin` / `staff`
- **Default creds `6T4CUSTOMS` / `6T4CUSTOMS`** with **forced password + username reset** on first login (middleware funnel)
- **Analytics Overview** — revenue strip, inventory KPIs, 12-month revenue line chart, top products bar, category pie, live recent orders
- **Sales & Revenue** — 7d/30d/90d/12m/all filters · AOV · profit vs cost · margin % · top products · category split
- **Inventory Management** — product CRUD, stock adjustments with history, CSV bulk import with error reporting, auto low-stock/out-of-stock notifications
- **Orders** — inline status edits, per-order WhatsApp deep-link, **PDF invoice generation** (jspdf + autotable)
- **Customers** — lifetime-value table with VIP tier, purchase count, last order, search
- **Activity Logs** — admin action trail + login attempt history
- **Settings** — password change, admin user CRUD (super-admin gated), role cycling, password reset, 2FA enrollment surface
- **Notifications** — real-time bell with unread counter, 30s auto-refresh, severity-coded (low stock / out of stock / new order / failed login)
- **Rate limiting** — DB-backed sliding window (5 failed attempts / 10 min per username + IP)
- **Security** — bcrypt 12 rounds · JWT HS256 signed 8-hour sessions · httpOnly cookies · secure in prod · middleware guard on every `/admin/*` route · CSRF-safe sameSite lax · input sanitization via zod · RLS-locked admin tables (service role only)

### Design language
Black + neon-red industrial, glassmorphism panels, custom red cursor glow with inertia, grain overlay, Lenis smooth scroll, Orbitron + Bebas Neue + Inter typography. Superbike-cockpit sidebar on admin with live "dyno online" pulse.

## Quickstart

```bash
# 1. install
npm install   # or pnpm install / yarn

# 2. run dev
npm run dev
# → http://localhost:3000
```

Customer-facing pages work immediately against local state. **Admin + OTP login require Supabase**.

## Supabase + admin setup

1. Create a project at [supabase.com](https://supabase.com)
2. Fill `.env.local` (see `.env.local.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ADMIN_JWT_SECRET=$(openssl rand -hex 48)
   RESEND_API_KEY=re_...         # for email OTP (falls back to console log in dev)
   RESEND_FROM="6T4 Customs <no-reply@yourdomain.com>"
   NEXT_PUBLIC_OWNER_WHATSAPP=+91XXXXXXXXXX
   ```
3. Apply schema (in order):
   - `supabase/migrations/0001_init.sql` — orders, profiles, builds
   - `supabase/migrations/0002_admin_system.sql` — admin users/sessions/logs, products, inventory history, notifications, customers, invoices, OTP codes
4. Seed everything including bootstrapping the default admin:
   ```bash
   npm run seed
   ```
   This creates:
   - Default super-admin **`6T4CUSTOMS` / `6T4CUSTOMS`** with `force_password_change=true`
   - All ~50 parts upserted into the `products` table
   - Testimonials + featured builds

5. Sign in:
   - Customer: `/account/login` — email OTP (6-digit, 5 min expiry)
   - Admin: click the subtle shield icon bottom-right on the sign-in page **or** visit `/admin/login`
   - You'll be forced to change the default password + can optionally change the admin ID

## Admin flow

```
[/account/login page]  ← customer OTP sign-in
        │
        ↓ bottom-right stealth shield button
[Admin modal] → POST /api/admin/bootstrap (idempotent) → POST /api/admin/login
        │
        ↓ JWT cookie (8h, httpOnly)
        │      if force_password_change:
        │         middleware redirects → /admin/change-password
        ↓      else:
[/admin — Overview dashboard]
  ├── /admin/sales         ← revenue charts + filters
  ├── /admin/inventory     ← CRUD + CSV import
  │     ├── /new
  │     ├── /[id]          ← edit + stock history
  │     └── /import
  ├── /admin/orders        ← status edits, invoice PDF, WhatsApp link
  ├── /admin/customers
  ├── /admin/bookings      ← bay calendar
  ├── /admin/logs          ← activity + login attempts
  └── /admin/settings      ← password + admin user CRUD (super_admin)
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server at :3000 |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run seed` | Bootstrap admin + push catalog to Supabase |

## Project structure

```
app/
  layout.tsx                    # Fonts, providers, cursor, grain, Lenis, loader
  page.tsx                      # Home
  configurator/ cart/ checkout/ order/
  account/
    page.tsx                    # Customer account (saved builds + orders)
    login/page.tsx              # OTP + stealth admin entry
  admin/
    layout.tsx                  # AdminShell (sidebar, bell, status rail)
    login/page.tsx              # Admin login
    change-password/page.tsx    # Forced first-login reset
    page.tsx                    # Analytics overview
    sales/ inventory/ orders/ customers/ bookings/ logs/ settings/
  api/
    admin/                      # bootstrap, login, logout, me, change-password, users, products, orders, notifications, sales, logs, customers
    otp/send + verify           # 6-digit email OTP
    checkout
middleware.ts                   # Edge guard for /admin/* + force-reset funnel
components/
  admin/                        # AdminShell, MetricCard, DashboardCharts, ProductForm
  chrome/ home/ configurator/ shared/ loading/ ui/
lib/
  admin/                        # password (bcrypt), session (jose JWT), tokens, rate-limit, activity-log, email (resend), context, invoice (jspdf), analytics
  supabase/                     # client/server/admin wrappers
  data/                         # static catalogue (brands, models, parts, featured)
  utils/                        # cn, formatPrice, hpEstimator
store/                          # Zustand stores
supabase/migrations/            # 0001_init + 0002_admin_system
scripts/                        # seed-supabase.ts, scrape-models.md
```

## Security model

| Concern | Mechanism |
|---|---|
| Passwords | bcrypt (12 rounds), min-strength enforced (≥10 chars, letter + digit, not default) |
| Sessions | jose JWT HS256 signed by `ADMIN_JWT_SECRET`, 8h TTL, backed by `admin_sessions` DB row for revocation |
| Cookies | httpOnly, sameSite=lax, secure in production, path=/ |
| Edge guard | `middleware.ts` runs on `/admin/:path*` — verifies JWT, funnels force-password-change |
| Rate limiting | Sliding window over `login_attempts` (5 failures / 10 min / identifier + IP) |
| CSRF | sameSite=lax cookies + POST-only mutating routes + zod input validation |
| RLS | All admin tables enable RLS with no anon policies; only service-role bypasses |
| Audit trail | `admin_activity_log` captures every mutation with admin id, action, target, metadata, IP, UA |
| OTP | 6-digit, bcrypt-hashed, 5-min TTL, 3 sends / 10 min / email, 5 verify attempts max |
| Service role | Server-only — never leaked client-side |

## Known deferred items

- TOTP 2FA activation (enrollment surface present, wiring deferred)
- Real payment gateway (UPI/Razorpay/Stripe) — checkout records intent + booking token
- R3F 3D bike previews (slot ready behind feature flag in `BikePreview`)
- PWA manifest / service worker
- AI demand prediction + frequently-bought-together (schema + hooks ready)
- Product image CDN upload (admin takes URL strings; drop-in S3/R2 later)
- CSV export for reports (present plumbing for jspdf, extend to xlsx via `xlsx` lib)

## License

Copyright © 6T4 Customs. All bike brand names and marks are trademarks of their respective owners.
