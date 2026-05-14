import Link from "next/link";
import { Heart, UserPlus } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  WishlistGrid,
  type WishlistEntry
} from "@/components/account/WishlistGrid";
import { isTableMissing } from "@/components/account/schema";
import { getAllProducts } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

type WishlistRow = { product_id: string; added_at: string };

export default async function WishlistPage() {
  const supa = await createServerSupabase();

  if (!supa) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Wishlist." />
        <UnconfiguredCard />
      </section>
    );
  }

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Wishlist." />
        <SignInCard />
      </section>
    );
  }

  const { data, error } = await supa
    .from("wishlists")
    .select("product_id, added_at")
    .eq("user_id", userData.user.id)
    .order("added_at", { ascending: false });

  if (error && isTableMissing(error)) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Wishlist." />
        <ProvisioningCard />
      </section>
    );
  }

  const rows = (data ?? []) as WishlistRow[];

  if (rows.length === 0) {
    return (
      <section className="py-12">
        <SectionHeader
          eyebrow="Account"
          title="Wishlist."
          subtitle="Parts you've saved. Cleared after purchase or on demand."
        />
        <WishlistGrid initial={[]} />
      </section>
    );
  }

  // Hydrate product data — pull the full catalog once and stitch.
  const allProducts = await getAllProducts();
  const productById = new Map(allProducts.map((p) => [p.id, p]));

  const entries: WishlistEntry[] = rows
    .map((row) => {
      const product = productById.get(row.product_id);
      if (!product) return null;
      return { product, added_at: row.added_at };
    })
    .filter((e): e is WishlistEntry => e !== null);

  return (
    <section className="py-12">
      <SectionHeader
        eyebrow="Account"
        title="Wishlist."
        subtitle={`${entries.length} part${entries.length === 1 ? "" : "s"} saved.`}
      />
      <WishlistGrid initial={entries} />
    </section>
  );
}

function UnconfiguredCard() {
  return (
    <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
      <Heart className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">
        Supabase backend not configured. Wishlist needs env keys in{" "}
        <code className="text-neon">.env.local</code>.
      </p>
    </div>
  );
}

function SignInCard() {
  return (
    <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
      <UserPlus className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">Sign in to access your saved parts.</p>
      <Link
        href="/account/login"
        className="mt-6 inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs font-bold uppercase tracking-[0.2em] text-black"
        data-cursor="cta"
      >
        Sign In
      </Link>
    </div>
  );
}

function ProvisioningCard() {
  return (
    <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
      <Heart className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">Coming soon — your account is being provisioned.</p>
      <p className="mt-2 text-xs text-bone/40">
        Wishlist rolls out once the catalog migration runs.
      </p>
    </div>
  );
}
