/**
 * Seed script — pushes JSON catalog (parts → products, testimonials, featured_builds)
 * into Supabase and bootstraps the default super-admin.
 *
 * Run: `pnpm seed` (requires .env.local with SUPABASE_SERVICE_ROLE_KEY)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { PARTS } from "../lib/data/parts";
import { TESTIMONIALS, FEATURED_BUILDS } from "../lib/data/featured";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supa = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log("Bootstrapping default admin…");
  const { count: adminCount } = await supa
    .from("admin_users")
    .select("*", { count: "exact", head: true });
  if ((adminCount ?? 0) === 0) {
    const hash = await bcrypt.hash("6T4CUSTOMS", 12);
    const { error } = await supa.from("admin_users").insert({
      username: "6T4CUSTOMS",
      password_hash: hash,
      role: "super_admin",
      force_password_change: true
    });
    if (error) throw error;
    console.log("  ✓ Default super-admin created: 6T4CUSTOMS / 6T4CUSTOMS (force reset on first login)");
  } else {
    console.log(`  ✓ ${adminCount} admin(s) already exist, skipping`);
  }

  console.log("Seeding products (from lib/data/parts.ts)…");
  const rows = PARTS.map((p) => ({
    id: p.id,
    sku: p.id.toUpperCase().slice(0, 60),
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: p.description,
    price: p.price,
    cost_price: Math.round(p.price * 0.58),
    stock: 20,
    low_stock_threshold: 5,
    images: [],
    compatibility: p.compatibility,
    active: true
  }));
  const { error: prodErr } = await supa.from("products").upsert(rows, { onConflict: "id" });
  if (prodErr) throw prodErr;
  console.log(`  ✓ ${rows.length} products`);

  console.log("Seeding testimonials…");
  // Table uses uuid PK with default — strip the string slugs and replace the set.
  await supa.from("testimonials").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: tErr } = await supa
    .from("testimonials")
    .insert(
      TESTIMONIALS.map(({ id: _id, ...rest }) => rest)
    );
  if (tErr) throw tErr;
  console.log(`  ✓ ${TESTIMONIALS.length} testimonials`);

  console.log("Seeding featured builds…");
  const { error: fbErr } = await supa.from("featured_builds").upsert(
    FEATURED_BUILDS.map((b) => ({
      id: b.id,
      title: b.title,
      bike: b.bike,
      mods: b.mods,
      hp_gain: b.hpGain,
      dyno_data: null
    })),
    { onConflict: "id" }
  );
  if (fbErr) throw fbErr;
  console.log(`  ✓ ${FEATURED_BUILDS.length} featured builds`);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
