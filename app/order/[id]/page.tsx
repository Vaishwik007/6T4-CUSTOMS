"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Copy, Check, Home as HomeIcon, Phone } from "lucide-react";
import { use, useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default function OrderPage({ params, searchParams }: OrderPageProps) {
  const { id } = use(params);
  const { token: searchToken } = use(searchParams);
  const [token, setToken] = useState<string>(searchToken ?? "");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!searchToken);

  useEffect(() => {
    // If a real token was passed via query param, use it directly
    if (searchToken) {
      setToken(searchToken);
      setLoading(false);
      return;
    }

    // Otherwise try to fetch the real booking_token from Supabase
    const fetchToken = async () => {
      const supa = createSupabaseBrowser();
      if (supa) {
        try {
          const { data } = await supa
            .from("orders")
            .select("booking_token")
            .eq("id", id)
            .single();
          if (data?.booking_token) {
            setToken(data.booking_token);
            setLoading(false);
            return;
          }
        } catch {
          // fall through to graceful degradation
        }
      }

      // Last resort: derive a stable token from the UUID
      const hash = id.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6);
      setToken(`6T4-${hash || "LOCKED"}`);
      setLoading(false);
    };

    fetchToken();
  }, [id, searchToken]);

  const waNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "+919999999999";
  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_PHONE ?? waNumber;
  const waText = encodeURIComponent(
    `Hi 6T4 Customs — my order token is ${token} (order id: ${id}). Can you confirm?`
  );
  const waHref = `https://wa.me/${waNumber.replace(/[^\d]/g, "")}?text=${waText}`;
  const hasWhatsapp = waNumber !== "+919999999999";

  const copy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-neon to-transparent" />

      <div className="relative mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto grid h-20 w-20 place-items-center border border-neon bg-neon-900/30 shadow-neon"
        >
          <CheckCircle2 className="h-10 w-10 text-neon" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 text-display text-[10px] uppercase tracking-[0.5em] text-neon"
        >
          Order Confirmed
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-4 text-display font-black uppercase leading-[0.95] text-bone"
          style={{ fontSize: "clamp(2.25rem, 8.5vw, 5.5rem)" }}
        >
          Your Machine
          <br />
          Is <span className="text-neon text-glow">Locked In.</span>
        </motion.h1>

        {/* Booking Token Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 border border-neon/40 bg-black/70 px-6 py-4 backdrop-blur"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Booking Token</p>
              {loading ? (
                <div className="mt-1 h-8 w-32 animate-pulse bg-white/5 rounded" />
              ) : (
                <p className="mt-1 text-stencil text-3xl text-neon">{token}</p>
              )}
            </div>
            <button
              type="button"
              onClick={copy}
              disabled={loading}
              data-cursor="cta"
              className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-bone/70 transition-colors hover:border-neon hover:text-neon disabled:opacity-40"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-3 border-t border-white/10 pt-3 text-left text-[10px] uppercase tracking-[0.3em] text-bone/40">
            Order id · {id}
          </p>
        </motion.div>

        {/* Notification instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-6 border border-white/5 bg-carbon/60 px-5 py-4 text-left"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-neon mb-2">What Happens Next</p>
          <ul className="space-y-2 text-sm text-bone/60">
            <li className="flex gap-2">
              <span className="text-neon shrink-0">01</span>
              <span>Save your booking token — it&apos;s your proof of order.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon shrink-0">02</span>
              <span>
                {hasWhatsapp
                  ? "Arjun will verify on WhatsApp within 24 hours and reserve a bay slot."
                  : "Call or visit the garage — we'll confirm your slot and reserve parts."}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neon shrink-0">03</span>
              <span>Bring your bike + token on the confirmed date. Parts will be ready.</span>
            </li>
          </ul>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {hasWhatsapp ? (
            <Link
              href={waHref}
              target="_blank"
              data-cursor="cta"
              className="inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
            >
              <MessageCircle className="h-4 w-4" /> Message on WhatsApp
            </Link>
          ) : (
            <Link
              href={`tel:${ownerPhone}`}
              data-cursor="cta"
              className="inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white"
            >
              <Phone className="h-4 w-4" /> Call the Garage
            </Link>
          )}
          <Link
            href="/account"
            data-cursor="cta"
            className="inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-display text-xs uppercase tracking-[0.2em] text-bone transition-colors hover:border-neon hover:text-neon"
          >
            View Account
          </Link>
          <Link
            href="/"
            data-cursor="cta"
            className="inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-display text-xs uppercase tracking-[0.2em] text-bone transition-colors hover:border-neon hover:text-neon"
          >
            <HomeIcon className="h-4 w-4" /> Home
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
