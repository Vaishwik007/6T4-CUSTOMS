# Wave 2 — expanding the model catalogue

The Wave 1 catalogue (~280 models across 24 brands, ~1,400 year combos) ships in `lib/data/models.ts`. To expand the long tail:

## Options

1. **Hand-edit `lib/data/models.ts`** — TypeScript array, fully typed. Add rows in the same format:
   ```ts
   m("brand-slug", "model-slug", "Display Name", "Category", engineCc, hp, yearStart, yearEnd | null)
   ```
   No code changes elsewhere. Year ranges drive the YearSelect dropdown automatically.

2. **Scrape + transform** — responsibly scrape public model listings (Wikipedia "List of X motorcycles" pages, manufacturer site archives). Suggested pipeline:
   - `cheerio` / `playwright` → fetch model tables
   - Normalise to the schema above
   - Diff against current data, human-review additions
   - Commit

3. **Admin dashboard (future)** — once parts CRUD is built, extend to model CRUD backed by the Supabase `models` table (not currently persisted; models live in code because they rarely change).

## Compatibility rules

Parts reference models via `compatibility: { brand, model, yearStart, yearEnd | null }[]` or `"universal"`. New bikes added need at least universal parts listed in their year range — but most parts already include universal entries (exhausts, ECUs, filters).

## Images

Drop WebP files at `public/images/bikes/<brand>/<model>.webp` matching the slugs. Configurator uses SVG silhouettes as fallback.
