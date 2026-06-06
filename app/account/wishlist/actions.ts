"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { isTableMissing } from "@/components/account/schema";

export type WishlistResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: string; needsAuth?: boolean };

export async function toggleWishlist(productId: string): Promise<WishlistResult> {
  if (!productId) return { ok: false, error: "Missing product." };

  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "Sign in to save to wishlist.", needsAuth: true };
  }

  const userId = userData.user.id;

  // Read current state
  const { data: existing, error: readErr } = await supa
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (readErr) {
    if (isTableMissing(readErr)) {
      return { ok: false, error: "Wishlist is being provisioned. Try again later." };
    }
    return { ok: false, error: readErr.message };
  }

  if (existing) {
    const { error } = await supa
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (error) {
      if (isTableMissing(error)) {
        return { ok: false, error: "Wishlist is being provisioned. Try again later." };
      }
      return { ok: false, error: error.message };
    }
    revalidatePath("/account/wishlist");
    revalidatePath(`/parts/${productId}`);
    return { ok: true, saved: false };
  }

  const { error } = await supa.from("wishlists").insert({
    user_id: userId,
    product_id: productId
  });
  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Wishlist is being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/account/wishlist");
  revalidatePath(`/parts/${productId}`);
  return { ok: true, saved: true };
}

export async function removeFromWishlist(productId: string): Promise<WishlistResult> {
  if (!productId) return { ok: false, error: "Missing product." };

  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "Not signed in.", needsAuth: true };
  }

  const { error } = await supa
    .from("wishlists")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("product_id", productId);

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Wishlist is being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/account/wishlist");
  return { ok: true, saved: false };
}

export async function isProductInWishlist(productId: string): Promise<boolean> {
  const supa = await createServerSupabase();
  if (!supa) return false;
  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return false;
  const { data, error } = await supa
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userData.user.id)
    .eq("product_id", productId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}
