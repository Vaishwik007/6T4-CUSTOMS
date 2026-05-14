import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { rateLimit, getClientKey } from "@/lib/security/rate-limit";
import { PARTS } from "@/lib/data/parts";
import { SERVICES } from "@/lib/services/catalog";
import { JOURNAL_POSTS } from "@/lib/journal/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PART_LIMIT = 8;
const SERVICE_LIMIT = 6;
const POST_LIMIT = 6;

type PartHit = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  inStock: boolean;
};

type ServiceHit = {
  slug: string;
  name: string;
  category: string;
  basePrice: number;
  priceLabel?: string;
};

type PostHit = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
};

type SearchResponse = {
  parts: PartHit[];
  services: ServiceHit[];
  posts: PostHit[];
};

function staticPartFallback(query: string): PartHit[] {
  const q = query.toLowerCase();
  const matches: PartHit[] = [];
  for (const p of PARTS) {
    if (matches.length >= PART_LIMIT) break;
    const haystack = `${p.name} ${p.brand} ${p.category} ${p.id} ${p.description}`.toLowerCase();
    if (haystack.includes(q)) {
      matches.push({
        id: p.id,
        slug: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        inStock: true
      });
    }
  }
  return matches;
}

type ProductRpcRow = {
  id: string;
  slug?: string | null;
  name?: string | null;
  brand?: string | null;
  category?: string | null;
  price?: number | null;
  stock?: number | null;
  active?: boolean | null;
};

async function searchParts(query: string): Promise<PartHit[]> {
  const admin = createAdminSupabase();
  if (!admin) return staticPartFallback(query);

  try {
    const { data, error } = await admin.rpc("search_products", {
      p_query: query,
      p_limit: PART_LIMIT
    });

    if (error || !Array.isArray(data) || data.length === 0) {
      return staticPartFallback(query);
    }

    return (data as ProductRpcRow[]).map((row) => {
      const stock = row.stock ?? 0;
      const active = row.active ?? true;
      return {
        id: row.id,
        slug: row.slug ?? row.id,
        name: row.name ?? row.id,
        brand: row.brand ?? "",
        category: row.category ?? "",
        price: row.price ?? 0,
        inStock: active && stock > 0
      };
    });
  } catch {
    return staticPartFallback(query);
  }
}

function searchServices(query: string): ServiceHit[] {
  const q = query.toLowerCase();
  const hits: ServiceHit[] = [];
  for (const s of SERVICES) {
    if (hits.length >= SERVICE_LIMIT) break;
    const haystack = `${s.name} ${s.slug} ${s.category} ${s.shortDescription}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        slug: s.slug,
        name: s.name,
        category: s.category,
        basePrice: s.basePrice,
        priceLabel: s.priceLabel
      });
    }
  }
  return hits;
}

function searchPosts(query: string): PostHit[] {
  const q = query.toLowerCase();
  const hits: PostHit[] = [];
  for (const post of JOURNAL_POSTS) {
    if (hits.length >= POST_LIMIT) break;
    const haystack = `${post.title} ${post.slug} ${post.category} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        slug: post.slug,
        title: post.title,
        category: post.category,
        excerpt: post.excerpt
      });
    }
  }
  return hits;
}

/**
 * GET /api/search?q=string
 *
 * Returns up to {@link PART_LIMIT} parts, {@link SERVICE_LIMIT} services, and
 * {@link POST_LIMIT} journal posts that match the query.
 *
 * Parts: tries Supabase `search_products` RPC first; falls back to a
 * substring scan of the static catalog when Supabase is unconfigured or
 * the RPC errors. Services and posts always come from the static catalogs.
 *
 * Rate-limited to 30 requests/minute/IP.
 */
export async function GET(req: NextRequest) {
  const ip = getClientKey(req.headers);
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "30" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") ?? "").trim();

  if (raw.length < 2) {
    return NextResponse.json(
      { parts: [], services: [], posts: [] } satisfies SearchResponse,
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // Defensive cap — keeps the substring scan bounded.
  const query = raw.slice(0, 80);

  const [parts, services, posts] = await Promise.all([
    searchParts(query),
    Promise.resolve(searchServices(query)),
    Promise.resolve(searchPosts(query))
  ]);

  const payload: SearchResponse = { parts, services, posts };
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" }
  });
}
