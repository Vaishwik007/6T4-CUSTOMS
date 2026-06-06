"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  vehicleSchema,
  isTableMissing,
  parseModsList
} from "@/components/account/schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

type VehicleFormValues = {
  brand_slug: string;
  model_slug: string;
  year: number;
  nickname?: string;
  plate?: string;
  current_mods?: string;
  is_primary?: boolean;
};

async function clearOtherPrimary(userId: string, exceptId?: string) {
  const supa = await createServerSupabase();
  if (!supa) return;
  let q = supa
    .from("customer_vehicles")
    .update({ is_primary: false })
    .eq("user_id", userId)
    .eq("is_primary", true);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
}

export async function createVehicle(values: VehicleFormValues): Promise<ActionResult> {
  const parsed = vehicleSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };
  const userId = userData.user.id;

  if (parsed.data.is_primary) {
    await clearOtherPrimary(userId);
  }

  const { error } = await supa.from("customer_vehicles").insert({
    user_id: userId,
    brand_slug: parsed.data.brand_slug,
    model_slug: parsed.data.model_slug,
    year: parsed.data.year,
    nickname: parsed.data.nickname || null,
    plate: parsed.data.plate || null,
    current_mods: parseModsList(parsed.data.current_mods),
    is_primary: parsed.data.is_primary ?? false
  });

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Vehicles are being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/account/vehicles");
  return { ok: true };
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };

  const { error } = await supa
    .from("customer_vehicles")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Vehicles are being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/account/vehicles");
  return { ok: true };
}

export async function setPrimaryVehicle(id: string): Promise<ActionResult> {
  const supa = await createServerSupabase();
  if (!supa) return { ok: false, error: "Backend not configured." };

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };
  const userId = userData.user.id;

  await clearOtherPrimary(userId, id);

  const { error } = await supa
    .from("customer_vehicles")
    .update({ is_primary: true })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Vehicles are being provisioned. Try again later." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/account/vehicles");
  return { ok: true };
}
