"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, AlertCircle } from "lucide-react";
import { toggleWishlist } from "@/app/account/wishlist/actions";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export function WishlistButton({
  productId,
  initialSaved = false
}: {
  productId: string;
  initialSaved?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Hydrate per-user saved state without making the PDP user-dependent.
  useEffect(() => {
    let alive = true;
    const supa = createSupabaseBrowser();
    if (!supa) return;
    (async () => {
      const { data: userData } = await supa.auth.getUser();
      if (!alive || !userData.user) return;
      const { data, error: dbErr } = await supa
        .from("wishlists")
        .select("product_id")
        .eq("user_id", userData.user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (!alive) return;
      if (dbErr) return; // table missing or other — silent
      setSaved(!!data);
    })();
    return () => {
      alive = false;
    };
  }, [productId]);

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if (!res.ok) {
        if (res.needsAuth) {
          // Redirect to login
          router.push("/account/login");
          return;
        }
        setError(res.error);
        return;
      }
      setSaved(res.saved);
    });
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={saved}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        data-cursor="cta"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 border px-6 py-3 text-display text-xs uppercase tracking-[0.2em] transition-all",
          saved
            ? "border-neon bg-neon/10 text-neon hover:bg-neon hover:text-black"
            : "border-white/20 text-bone hover:border-neon hover:text-neon",
          pending && "opacity-60"
        )}
      >
        <Heart
          className={cn("h-4 w-4 transition-transform", saved && "fill-current")}
        />
        {saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>
      {error && (
        <p className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-neon">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
