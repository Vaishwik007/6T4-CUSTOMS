# 6T4 CUSTOMS — Deploy to Vercel

End-to-end guide: from zero to a live site with working admin console + OTP login, **no manual SQL pasting**.

## Prereqs (5 min, one-time)

1. Accounts: [Supabase](https://supabase.com), [Vercel](https://vercel.com), optional [Resend](https://resend.com) for email OTP.
2. CLIs: `npm i -g vercel` (optional but makes env setup a single command).

---

## 1 · Create the Supabase project

1. Dashboard → New Project → pick a region close to you (e.g. `ap-south-1` Mumbai for India).
2. Wait ~60s for provisioning.
3. Grab these **4 values**:

| Where | Name | What for |
|---|---|---|
| Project Settings → API → `Project URL` | `NEXT_PUBLIC_SUPABASE_URL` | Public REST endpoint |
| Project Settings → API → `anon public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe key |
| Project Settings → API → `service_role` | `SUPABASE_SERVICE_ROLE_KEY` | Server-only, bypasses RLS |
| Project Settings → Database → Connection string → **Transaction pooler** (port 6543) | `SUPABASE_DB_URL` | For `pnpm migrate` only |

> ⚠️ Use the **Transaction pooler** URL, not the direct 5432 one. The pooler works from any environment; 5432 often fails from serverless / Vercel.

---

## 2 · Generate secrets locally

```bash
# Clone + install
git clone <your repo>
cd "6T4 CUSTOMS"
npm install

# Make .env.local from the template
cp .env.local.example .env.local

# Generate the admin JWT secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# → paste the output as ADMIN_JWT_SECRET in .env.local

# (optional) Resend key for real email OTP
#   https://resend.com/api-keys → Full access
# Without a key the OTP prints to the dev server console in dev mode only.
```

Fill `.env.local` with all 4 Supabase values + `ADMIN_JWT_SECRET` + (optionally) Resend keys + `NEXT_PUBLIC_OWNER_WHATSAPP`.

---

## 3 · One-command database setup

```bash
npm run setup
```

That runs `scripts/apply-migrations.ts` + `scripts/seed-supabase.ts` in order. You'll see:

```
▶ Step 1/2 · Applying migrations
✓ Connected to Supabase Postgres
→ 0001_init.sql ... ✓
→ 0002_admin_system.sql ... ✓
✓ All migrations applied

▶ Step 2/2 · Seeding catalog + bootstrapping admin
  ✓ Default super-admin created: 6T4CUSTOMS / 6T4CUSTOMS
  ✓ 50 products
  ✓ 4 testimonials
  ✓ 5 featured builds
```

Re-running is idempotent — migrations use `create if not exists`; seeds upsert on conflict.

**Verify locally:**
```bash
npm run dev
# http://localhost:3000/account/login → stealth shield bottom-right → 6T4CUSTOMS / 6T4CUSTOMS
```

---

## 4 · Push to Vercel

### Option A — via Vercel CLI (fastest)

```bash
vercel link                                   # link repo to Vercel project
vercel env pull .env.production.local         # pulls existing (empty) env
```

Push each secret to Vercel (`production` scope):

```bash
# One-liner to push everything from .env.local to production:
#   each value is prompted individually — paste, Enter
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_JWT_SECRET production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM production
vercel env add NEXT_PUBLIC_OWNER_WHATSAPP production

# Optional: duplicate to preview + development scopes
#   vercel env add NAME preview
#   vercel env add NAME development

vercel --prod
```

> **Do NOT** push `SUPABASE_DB_URL` to Vercel. That variable is only used by migrations run from your laptop / CI. The app itself never needs it.

### Option B — via dashboard

1. Vercel → New Project → Import this repo.
2. Before first deploy, expand **Environment Variables** and paste all 7 (same list as above, minus `SUPABASE_DB_URL`).
3. Deploy.

---

## 5 · Re-running migrations on schema changes

Whenever you add or edit `supabase/migrations/*.sql`:

```bash
npm run migrate      # applies any new SQL files against the linked Supabase
```

The script runs every SQL file in `supabase/migrations/` in filename order. Because migrations use `create ... if not exists` / `create or replace` patterns, safely re-running them is fine — only new DDL actually changes the DB.

> If you want strict migration tracking (applied-once semantics), switch to the official [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started): `supabase link` + `supabase db push`. Both migration files are already CLI-compatible.

---

## 6 · Optional: GitHub Action for auto-migrations

Drop this into `.github/workflows/migrate.yml` if you want migrations applied automatically when SQL changes land on `main`:

```yaml
name: Apply Supabase migrations
on:
  push:
    branches: [main]
    paths: ["supabase/migrations/**"]
  workflow_dispatch:

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run migrate
        env:
          SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
```

Add `SUPABASE_DB_URL` to your repo's secrets (Settings → Secrets → Actions).

---

## 7 · Post-deploy checklist

- [ ] `/` renders the home page with cinematic loader
- [ ] `/account/login` → enter email → receive 6-digit OTP in inbox (or in dev console if no Resend key)
- [ ] Bottom-right shield → admin modal → sign in with default creds
- [ ] Forced reset page loads → change password + username
- [ ] `/admin` dashboard shows zeros (no data yet, normal)
- [ ] Place a test order from `/configurator` → appears in `/admin/orders`
- [ ] Generate invoice PDF from the order row
- [ ] Low-stock + new-order notifications appear in the bell

---

## Architecture reminder

| Component | Deploys where | Env needed |
|---|---|---|
| Next.js app (SSR + API routes) | Vercel | `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_JWT_SECRET`, `RESEND_*`, `NEXT_PUBLIC_OWNER_WHATSAPP` |
| Middleware (JWT verify on `/admin/*`) | Vercel Edge | `ADMIN_JWT_SECRET` |
| Database + auth.users | Supabase Postgres | — |
| Migrations + seed | Your laptop / CI (not Vercel) | `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Email OTP delivery | Resend | `RESEND_API_KEY` |

The app itself never runs migrations at request time. Schema changes are a deliberate local/CI action.

---

## Troubleshooting

**`password authentication failed for user "postgres"`**
You're using the 5432 direct connection from a network that blocks outbound 5432. Switch `SUPABASE_DB_URL` to the 6543 pooler URL.

**`permission denied for schema public` during migrations**
Migrations need the default `postgres` role. If you've reset it, use the service role JWT via `supabase db push` instead.

**Stealth admin login → "backend_unconfigured"**
Env vars missing on Vercel. Check `vercel env ls` or dashboard. Redeploy after adding them — Vercel re-reads env on new deploys only.

**OTP email not arriving**
In dev, any missing `RESEND_API_KEY` makes the OTP print to the dev-server console (look for `[email:fallback] OTP for ...`). In production on Vercel, you must set a real Resend key and verify your sender domain.

**`too many admin accounts`**
Wait — there's no such error. The bootstrap endpoint is idempotent; if an admin already exists, it no-ops.
