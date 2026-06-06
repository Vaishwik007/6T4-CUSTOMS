/**
 * Rule-based cross-sell engine. Reads cart contents (by static part lookup),
 * applies category-correlation rules, returns recommended products.
 *
 * Surface points:
 *   - Cart page footer
 *   - PDP "Pairs With" (uses lib/products/queries.getRelatedProducts which
 *     piggybacks on the same correlation map below).
 *   - Future: post-purchase email.
 *
 * Migrate to embeddings / co-purchase matrix when we have >500 orders.
 */
import { getPartById } from "@/lib/data/parts";
import type { PartCategory } from "@/lib/data/types";
import { getAllProducts, type Product } from "@/lib/products/queries";

type Rule = {
  match: { category?: PartCategory; brand?: string };
  recommend: { category: PartCategory; limit?: number };
  reason: string;
};

const RULES: Rule[] = [
  // Exhaust → Stage 2 ECU flash recommend (most common upgrade pairing)
  { match: { category: "Exhaust" }, recommend: { category: "ECU Tuning", limit: 3 }, reason: "Pairs with this exhaust" },
  // Exhaust → Air filter
  { match: { category: "Exhaust" }, recommend: { category: "Air Filter", limit: 2 }, reason: "Unrestrict the intake to match" },
  // Air Filter → Stage 1+
  { match: { category: "Air Filter" }, recommend: { category: "ECU Tuning", limit: 2 }, reason: "Map for the new airflow" },
  // ECU Tuning → Air Filter
  { match: { category: "ECU Tuning" }, recommend: { category: "Air Filter", limit: 2 }, reason: "Complete the breathe-tune-burn loop" },
  // Performance Kit (any) → cosmetic finishers
  { match: { category: "Performance Kit" }, recommend: { category: "Cosmetic", limit: 2 }, reason: "Finish the look" }
];

export async function getCrossSellsForCart(cartPartIds: string[], limit = 4): Promise<{ product: Product; reason: string }[]> {
  const cartCategories = new Set<PartCategory>();
  const cartIds = new Set(cartPartIds);
  for (const id of cartPartIds) {
    const p = getPartById(id);
    if (p) cartCategories.add(p.category);
  }

  const all = await getAllProducts();
  const recommendations = new Map<string, { product: Product; reason: string; score: number }>();

  for (const rule of RULES) {
    if (rule.match.category && !cartCategories.has(rule.match.category)) continue;

    const candidates = all
      .filter((p) => p.category === rule.recommend.category)
      .filter((p) => !cartIds.has(p.id))
      .filter((p) => p.inStock);

    let score = 100;
    for (const candidate of candidates.slice(0, rule.recommend.limit ?? 2)) {
      const existing = recommendations.get(candidate.id);
      if (!existing || existing.score < score) {
        recommendations.set(candidate.id, { product: candidate, reason: rule.reason, score });
      }
      score -= 1;
    }
  }

  return [...recommendations.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, reason }) => ({ product, reason }));
}

/**
 * Synchronous version for client-side use after a one-time fetch of all
 * products. Avoids server roundtrip on every cart change.
 */
export function getCrossSellsSync(
  cartPartIds: string[],
  allProducts: Product[],
  limit = 4
): { product: Product; reason: string }[] {
  const cartCategories = new Set<PartCategory>();
  const cartIds = new Set(cartPartIds);
  for (const id of cartPartIds) {
    const p = getPartById(id);
    if (p) cartCategories.add(p.category);
  }

  const recommendations = new Map<string, { product: Product; reason: string; score: number }>();
  for (const rule of RULES) {
    if (rule.match.category && !cartCategories.has(rule.match.category)) continue;
    const candidates = allProducts
      .filter((p) => p.category === rule.recommend.category)
      .filter((p) => !cartIds.has(p.id))
      .filter((p) => p.inStock);
    let score = 100;
    for (const candidate of candidates.slice(0, rule.recommend.limit ?? 2)) {
      const existing = recommendations.get(candidate.id);
      if (!existing || existing.score < score) {
        recommendations.set(candidate.id, { product: candidate, reason: rule.reason, score });
      }
      score -= 1;
    }
  }
  return [...recommendations.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, reason }) => ({ product, reason }));
}
