import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { Client } from "pg";

/**
 * Remove a migration entry from public.schema_migrations so it will be
 * re-run on the next `npm run migrate`. Useful after accidentally marking
 * an unapplied migration with --mark-all.
 *
 * Usage: npx tsx scripts/unmark-migration.ts 0003_razorpay_payments.sql
 */
const name = process.argv[2];
if (!name) {
  console.error("Usage: tsx scripts/unmark-migration.ts <migration_file_name>");
  process.exit(1);
}

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL");
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const r = await client.query(
    "delete from public.schema_migrations where name = $1",
    [name]
  );
  console.log(`✓ Unmarked ${name} (${r.rowCount ?? 0} rows removed)`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
