"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Wrench, Package, Plus, User as UserIcon, Save } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useBuildStore } from "@/store/useBuildStore";
import { BRANDS_BY_SLUG } from "@/lib/data/brands";
import { getModel } from "@/lib/data/models";
import { getPartById } from "@/lib/data/parts";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { DbBuild, DbOrder } from "@/lib/supabase/types";
import { estimateTotalHpGain } from "@/lib/utils/hpEstimator";

type ViewState =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "unconfigured" }
  | { kind: "authed"; email: string; builds: DbBuild[]; orders: DbOrder[] };

export default function AccountPage() {
  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const build = useBuildStore();

  useEffect(() => {
    const supa = createSupabaseBrowser();
    if (!supa) {
      setView({ kind: "unconfigured" });
      return;
    }
    (async () => {
      const { data } = await supa.auth.getUser();
      if (!data.user) {
        setView({ kind: "anonymous" });
        return;
      }
      const [{ data: builds }, { data: orders }] = await Promise.all([
        supa
          .from("builds")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false }),
        supa
          .from("orders")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })
      ]);
      setView({
        kind: "authed",
        email: data.user.email ?? "",
        builds: (builds ?? []) as DbBuild[],
        orders: (orders ?? []) as DbOrder[]
      });
    })();
  }, []);

  const saveCurrentBuild = async () => {
    const supa = createSupabaseBrowser();
    if (!supa || view.kind !== "authed") return;
    if (!build.brand || !build.model || !build.year) return;
    const parts = build.selectedParts.map(getPartById).filter(Boolean) as NonNullable<
      ReturnType<typeof getPartById>
    >[];
    const total = parts.reduce((s, p) => s + p.price, 0);
    const estHp = estimateTotalHpGain(parts);
    const { data: inserted, error } = await supa
      .from("builds")
      .insert({
        brand: build.brand,
        model: build.model,
        year: build.year,
        parts: build.selectedParts,
        total_price: total,
        est_hp: estHp,
        name: `${BRANDS_BY_SLUG[build.brand]?.name} ${getModel(build.brand, build.model)?.name}`
      })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setView((v) =>
      v.kind === "authed"
        ? { ...v, builds: [inserted as DbBuild, ...v.builds] }
        : v
    );
  };

  const signOut = async () => {
    const supa = createSupabaseBrowser();
    if (!supa) return;
    await supa.auth.signOut();
    window.location.href = "/";
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 pt-32 md:px-8 md:py-32">
      <SectionHeader eyebrow="Account" title="Your Garage." />

      {view.kind === "loading" && <div className="text-bone/60">Loading…</div>}

      {view.kind === "unconfigured" && (
        <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
          <UserIcon className="mx-auto h-10 w-10 text-neon" />
          <p className="mt-6 text-bone/80">
            Supabase backend not configured. Saved builds and order history need env keys set in{" "}
            <code className="text-neon">.env.local</code>.
          </p>
          <p className="mt-4 text-xs text-bone/50">
            The configurator, cart and checkout still work without auth — orders will be visible
            only via the booking token on the confirmation screen.
          </p>
        </div>
      )}

      {view.kind === "anonymous" && (
        <div className="neon-edge relative border border-white/5 bg-carbon p-10 text-center">
          <UserIcon className="mx-auto h-10 w-10 text-neon" />
          <p className="mt-6 text-bone/80">Sign in to save builds and track orders.</p>
          <Link
            href="/account/login"
            className="mt-6 inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs font-bold uppercase tracking-[0.2em] text-black"
            data-cursor="cta"
          >
            Sign In with Magic Link
          </Link>
        </div>
      )}

      {view.kind === "authed" && (
        <>
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Signed in as</p>
              <p className="mt-1 text-display text-lg font-bold">{view.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              data-cursor="cta"
              className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-bone/70 hover:border-neon hover:text-neon"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>

          {/* Save current build */}
          {build.brand && build.model && build.year && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border border-neon/30 bg-neon-900/10 p-4">
              <p className="text-sm text-bone/80">
                You have a configuration in progress:{" "}
                <span className="text-neon">
                  {BRANDS_BY_SLUG[build.brand]?.name} {getModel(build.brand, build.model)?.name} ·{" "}
                  {build.year}
                </span>{" "}
                ({build.selectedParts.length} mods)
              </p>
              <button
                type="button"
                onClick={saveCurrentBuild}
                data-cursor="cta"
                className="inline-flex items-center gap-2 bg-neon px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-bold text-black hover:bg-white"
              >
                <Save className="h-3 w-3" /> Save Build
              </button>
            </div>
          )}

          {/* Builds */}
          <div className="mt-10">
            <h3 className="flex items-center gap-2 text-display text-xs uppercase tracking-[0.3em] text-neon">
              <Wrench className="h-4 w-4" /> Saved Builds
            </h3>
            {view.builds.length === 0 ? (
              <p className="mt-4 text-sm text-bone/50">
                No builds saved yet. Configure a bike and save it.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {view.builds.map((b) => {
                  const brandMeta = BRANDS_BY_SLUG[b.brand];
                  const modelMeta = getModel(b.brand, b.model);
                  return (
                    <motion.article
                      key={b.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="neon-edge relative border border-white/5 bg-carbon p-5"
                    >
                      <p className="text-[10px] uppercase tracking-[0.3em] text-neon">
                        {brandMeta?.name} · {b.year}
                      </p>
                      <h4 className="mt-1 text-display text-lg font-bold uppercase">
                        {modelMeta?.name ?? b.model}
                      </h4>
                      <p className="mt-2 text-xs text-bone/60">{b.parts.length} parts selected</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.3em] text-bone/40">
                            Total
                          </div>
                          <div className="text-stencil text-xl text-bone">
                            {formatPrice(b.total_price)}
                          </div>
                        </div>
                        {b.est_hp != null && (
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-[0.3em] text-bone/40">
                              Est. Gain
                            </div>
                            <div className="text-stencil text-xl text-neon">+{b.est_hp} HP</div>
                          </div>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="mt-12">
            <h3 className="flex items-center gap-2 text-display text-xs uppercase tracking-[0.3em] text-neon">
              <Package className="h-4 w-4" /> Orders
            </h3>
            {view.orders.length === 0 ? (
              <p className="mt-4 text-sm text-bone/50">No orders yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto border border-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-black/60 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
                    <tr>
                      <th className="px-4 py-3">Token</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Placed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.orders.map((o) => (
                      <tr key={o.id} className="border-t border-white/5 text-bone/80">
                        <td className="px-4 py-3 text-stencil text-neon">{o.booking_token}</td>
                        <td className="px-4 py-3 uppercase">{o.status}</td>
                        <td className="px-4 py-3">{formatPrice(o.total)}</td>
                        <td className="px-4 py-3 text-bone/50">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Config CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/configurator"
              data-cursor="cta"
              className="inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-display text-xs uppercase tracking-[0.2em] text-bone hover:border-neon hover:text-neon"
            >
              <Plus className="h-4 w-4" /> Build Another Machine
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
