"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { addressSchema, isTableMissing } from "@/components/account/schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

type AddressFormValues = {
  label?: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pin: string;
  is_default?: boolean;
};

async function clearOtherDefaults(userId: string, exceptId?: string) {
  const supa = await createServerSupabase();
  if (!supa) return;
  let q = supa
    .from("customer_addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
}

export async function createAddress(values: AddressFormValues): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };
  const userId = userData.user.id;

  if (parsed.data.is_default) {
    await clearOtherDefaults(userId);
  }

  const { error } = await supa.from("customer_addresses").insert({
    user_id: userId,
    label: parsed.data.label || null,
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    city: parsed.data.city,
    state: parsed.data.state,
    pin: parsed.data.pin,
    is_default: parsed.data.is_default ?? false
  });

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Addresses are being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function updateAddress(
  id: string,
  values: AddressFormValues
): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };
  const userId = userData.user.id;

  if (parsed.data.is_default) {
    await clearOtherDefaults(userId, id);
  }

  const { error } = await supa
    .from("customer_addresses")
    .update({
      label: parsed.data.label || null,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      pin: parsed.data.pin,
      is_default: parsed.data.is_default ?? false
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Addresses are being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };

  const { error } = await supa
    .from("customer_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Addresses are being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };
  const userId = userData.user.id;

  await clearOtherDefaults(userId, id);

  const { error } = await supa
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Addresses are being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/account/addresses");
  return { ok: true };
}
