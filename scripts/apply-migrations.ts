/**
 * Apply all supabase/migrations/*.sql to the Supabase Postgres.
 *
 * Usage:
 *   # in .env.local, set one of:
 *   SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
 *     -- OR --
 *   SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
 *
 *   pnpm migrate
 *
 * Idempotency: all migrations use `create ... if not exists` / `create or replace`,
 * so re-running is safe.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("❌ Missing SUPABASE_DB_URL. Get it from Supabase dashboard → Project Settings → Database → Connection string.");
  console.error("   Use the 'Transaction pooler' (port 6543) — it works from any environment.");
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log("✓ Connected to Supabase Postgres");

  const dir = path.join(process.cwd(), "supabase", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error("❌ No migration files found in supabase/migrations/");
    process.exit(1);
  }

  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), "utf8");
    process.stdout.write(`→ ${f} ... `);
    try {
      await client.query(sql);
      console.log("✓");
    } catch (err) {
      console.log("✗");
      console.error(`Migration ${f} failed:`, err);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log("\n✓ All migrations applied");
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
