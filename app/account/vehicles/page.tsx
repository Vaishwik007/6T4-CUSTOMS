import Link from "next/link";
import { Bike, UserPlus } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VehicleList, type VehicleRow } from "@/components/account/VehicleList";
import { isTableMissing } from "@/components/account/schema";
import { PARTS, isCompatible } from "@/lib/data/parts";

export const dynamic = "force-dynamic";

type DbVehicle = {
  id: string;
  brand_slug: string;
  model_slug: string;
  year: number;
  nickname: string | null;
  plate: string | null;
  current_mods: string[] | null;
  is_primary: boolean;
  created_at: string;
};

function countFittingParts(brand: string, model: string, year: number): number {
  let count = 0;
  for (const p of PARTS) {
    if (isCompatible(p, brand, model, year)) count++;
  }
  return count;
}

export default async function VehiclesPage() {
  const supa = await createServerSupabase();

  if (!supa) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Vehicles." />
        <UnconfiguredCard />
      </section>
    );
  }

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Vehicles." />
        <SignInCard />
      </section>
    );
  }

  const { data, error } = await supa
    .from("customer_vehicles")
    .select(
      "id, brand_slug, model_slug, year, nickname, plate, current_mods, is_primary, created_at"
    )
    .eq("user_id", userData.user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (error && isTableMissing(error)) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Vehicles." />
        <ProvisioningCard />
      </section>
    );
  }

  const dbRows = (data ?? []) as DbVehicle[];
  const rows: VehicleRow[] = dbRows.map((v) => ({
    id: v.id,
    brand_slug: v.brand_slug,
    model_slug: v.model_slug,
    year: v.year,
    nickname: v.nickname,
    plate: v.plate,
    current_mods: v.current_mods ?? [],
    is_primary: v.is_primary,
    created_at: v.created_at,
    fits_count: countFittingParts(v.brand_slug, v.model_slug, v.year)
  }));

  return (
    <section className="py-12">
      <SectionHeader
        eyebrow="Account"
        title="Vehicles."
        subtitle="Your garage. Pre-filters parts and pre-fills bookings."
      />
      <VehicleList initial={rows} />
    </section>
  );
}

function UnconfiguredCard() {
  return (
    <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
      <Bike className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">
        Supabase backend not configured. Saved vehicles need env keys in{" "}
        <code className="text-neon">.env.local</code>.
      </p>
    </div>
  );
}

function SignInCard() {
  return (
    <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
      <UserPlus className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">Sign in to manage your saved vehicles.</p>
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
      <Bike className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">Coming soon — your account is being provisioned.</p>
      <p className="mt-2 text-xs text-bone/40">
        Vehicle profiles roll out next. Until then, use the configurator to
        pick a bike for each session.
      </p>
    </div>
  );
}
