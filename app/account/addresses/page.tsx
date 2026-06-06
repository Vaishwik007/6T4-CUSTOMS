import Link from "next/link";
import { MapPin, UserPlus } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AddressList, type AddressRow } from "@/components/account/AddressList";
import { isTableMissing } from "@/components/account/schema";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const supa = await createServerSupabase();

  if (!supa) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Addresses." />
        <UnconfiguredCard />
      </section>
    );
  }

  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Addresses." />
        <SignInCard />
      </section>
    );
  }

  const { data, error } = await supa
    .from("customer_addresses")
    .select(
      "id, label, full_name, phone, line1, line2, city, state, pin, is_default, created_at"
    )
    .eq("user_id", userData.user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error && isTableMissing(error)) {
    return (
      <section className="py-12">
        <SectionHeader eyebrow="Account" title="Addresses." />
        <ProvisioningCard />
      </section>
    );
  }

  const rows = (data ?? []) as AddressRow[];

  return (
    <section className="py-12">
      <SectionHeader
        eyebrow="Account"
        title="Addresses."
        subtitle="Used for checkout shipping and service bookings."
      />
      <AddressList initial={rows} />
    </section>
  );
}

function UnconfiguredCard() {
  return (
    <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
      <MapPin className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">
        Supabase backend not configured. Saved addresses need env keys in{" "}
        <code className="text-neon">.env.local</code>.
      </p>
    </div>
  );
}

function SignInCard() {
  return (
    <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
      <UserPlus className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">Sign in to manage your delivery addresses.</p>
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
      <MapPin className="mx-auto h-10 w-10 text-neon" />
      <p className="mt-6 text-bone/80">Coming soon — your account is being provisioned.</p>
      <p className="mt-2 text-xs text-bone/40">
        We&apos;re rolling out saved addresses. Until then, enter your address
        at checkout.
      </p>
    </div>
  );
}
