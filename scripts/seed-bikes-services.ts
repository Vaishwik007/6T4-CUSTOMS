/**
 * Seed bike_models + services tables from the static catalog so the
 * runtime queries (parts_for_bike, get_available_slots, /garage/[slug])
 * can resolve cleanly without scanning the JSONB compat columns.
 *
 * Idempotent: upserts on primary key.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { Client } from "pg";
import { MODELS } from "../lib/data/models";
import { BRANDS } from "../lib/data/brands";
import { SERVICES } from "../lib/services/catalog";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("❌ Missing SUPABASE_DB_URL.");
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log("✓ Connected to Supabase");

  const brandByKey = new Map(BRANDS.map((b) => [b.slug, b]));

  // ---- bike_models ----
  let bikeUpserts = 0;
  for (const m of MODELS) {
    const id = `${m.brand}-${m.slug}`;
    const brand = brandByKey.get(m.brand);
    await client.query(
      `insert into public.bike_models
        (id, brand_slug, brand_name, name, category, engine_cc, hp, year_start, year_end, image)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (id) do update set
         brand_name = excluded.brand_name,
         name = excluded.name,
         category = excluded.category,
         engine_cc = excluded.engine_cc,
         hp = excluded.hp,
         year_start = excluded.year_start,
         year_end = excluded.year_end,
         image = excluded.image`,
      [
        id,
        m.brand,
        brand?.name ?? m.brand,
        m.name,
        m.category,
        m.engineCc,
        m.hp != null ? Math.round(m.hp) : null,
        m.yearStart,
        m.yearEnd,
        m.image ?? null
      ]
    );
    bikeUpserts++;
  }
  console.log(`✓ Upserted ${bikeUpserts} bike_models`);

  // ---- services ----
  let svcUpserts = 0;
  for (const s of SERVICES) {
    await client.query(
      `insert into public.services
        (id, slug, name, category, short_description, long_description,
         base_price, price_label, duration_minutes, requires_quote,
         requires_bike, bay_required, active, tier, prerequisites,
         includes, faqs)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       on conflict (id) do update set
         name = excluded.name,
         category = excluded.category,
         short_description = excluded.short_description,
         long_description = excluded.long_description,
         base_price = excluded.base_price,
         price_label = excluded.price_label,
         duration_minutes = excluded.duration_minutes,
         requires_quote = excluded.requires_quote,
         requires_bike = excluded.requires_bike,
         bay_required = excluded.bay_required,
         tier = excluded.tier,
         prerequisites = excluded.prerequisites,
         includes = excluded.includes,
         faqs = excluded.faqs`,
      [
        s.slug,
        s.slug,
        s.name,
        s.category,
        s.shortDescription,
        s.longDescription,
        s.basePrice,
        s.priceLabel ?? null,
        s.durationMinutes,
        s.requiresQuote,
        true,
        s.bayRequired,
        true,
        s.tier ?? null,
        s.prerequisites,
        s.includes,
        JSON.stringify(s.faqs)
      ]
    );
    svcUpserts++;
  }
  console.log(`✓ Upserted ${svcUpserts} services`);

  // ---- product_fitment from existing JSONB compatibility ----
  const { rows: products } = await client.query<{ id: string; compatibility: unknown }>(
    "select id, compatibility from public.products where active and compatibility is not null"
  );

  let fitUpserts = 0;
  for (const p of products) {
    if (p.compatibility === "universal") {
      await client.query(
        "update public.products set fits_universal = true where id = $1",
        [p.id]
      );
      continue;
    }
    if (!Array.isArray(p.compatibility)) continue;
    const rules = p.compatibility as Array<{ brand: string; model: string; yearStart?: number; yearEnd?: number | null }>;
    for (const r of rules) {
      const bikeId = `${r.brand}-${r.model}`;
      // ensure bike exists before linking
      const { rowCount } = await client.query(
        "select 1 from public.bike_models where id = $1",
        [bikeId]
      );
      if (!rowCount) continue;

      await client.query(
        `insert into public.product_fitment (product_id, bike_model_id, year_start, year_end)
         values ($1, $2, $3, $4)
         on conflict (product_id, bike_model_id) do update set
           year_start = excluded.year_start,
           year_end = excluded.year_end`,
        [p.id, bikeId, r.yearStart ?? null, r.yearEnd ?? null]
      );
      fitUpserts++;
    }
  }
  console.log(`✓ Upserted ${fitUpserts} product_fitment rows`);

  // ---- refresh materialized view ----
  try {
    await client.query("select public.refresh_parts_browse()");
    console.log("✓ Refreshed parts_browse materialized view");
  } catch (err) {
    console.warn("⚠ Could not refresh parts_browse:", err);
  }

  await client.end();
  console.log("\n✓ Seed complete.");
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
