/**
 * Apply Supabase migrations (supabase/migrations/*.sql), tracking applied
 * files in public.schema_migrations so re-runs are safe and incremental.
 *
 * Usage:
 *   # in .env.local, set one of:
 *   SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
 *     -- OR --
 *   SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
 *
 *   npm run migrate                 # apply pending migrations
 *   npm run migrate -- --mark-all   # mark every file as already applied (no SQL run)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { Client } from "pg";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error(
    "❌ Missing SUPABASE_DB_URL. Get it from Supabase dashboard → Project Settings → Database → Connection string."
  );
  console.error(
    "   Use the 'Transaction pooler' (port 6543) — it works from any environment."
  );
  process.exit(1);
}

const markAll = process.argv.includes("--mark-all");

async function main() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log("✓ Connected to Supabase Postgres");

  // Tracking table
  await client.query(`
    create table if not exists public.schema_migrations (
      name text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    );
  `);

  const dir = path.join(process.cwd(), "supabase", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error("❌ No migration files found in supabase/migrations/");
    process.exit(1);
  }

  const { rows: applied } = await client.query<{ name: string }>(
    "select name from public.schema_migrations"
  );
  const appliedSet = new Set(applied.map((r) => r.name));

  if (markAll) {
    for (const f of files) {
      if (appliedSet.has(f)) continue;
      const sql = fs.readFileSync(path.join(dir, f), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      await client.query(
        "insert into public.schema_migrations (name, checksum) values ($1, $2) on conflict (name) do nothing",
        [f, checksum]
      );
      console.log(`↳ marked ${f} as applied`);
    }
    await client.end();
    console.log("\n✓ All existing migrations marked applied.");
    return;
  }

  let ran = 0;
  for (const f of files) {
    if (appliedSet.has(f)) {
      console.log(`↳ ${f} (already applied)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, f), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    process.stdout.write(`→ ${f} ... `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into public.schema_migrations (name, checksum) values ($1, $2)",
        [f, checksum]
      );
      await client.query("commit");
      console.log("✓");
      ran++;
    } catch (err) {
      await client.query("rollback").catch(() => {});
      console.log("✗");
      console.error(`Migration ${f} failed:`, err);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  if (ran === 0) {
    console.log("\n✓ Nothing to do — database already up to date.");
  } else {
    console.log(`\n✓ Applied ${ran} migration(s).`);
  }
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
