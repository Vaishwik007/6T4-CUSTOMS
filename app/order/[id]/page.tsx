"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Copy, Check, Home as HomeIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderPage({ params }: { params: { id: string } }) {
  const [token, setToken] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Derive a stable 6-char booking token from the order id so this page works even
    // if the user reloads or the Supabase write was deferred.
    const hash = params.id.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6);
    setToken(`6T4-${hash || "LOCKED"}`);
  }, [params.id]);

  const waNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "+919999999999";
  const waText = encodeURIComponent(`Hi 6T4 Customs — order ${token} (id ${params.id})`);
  const waHref = `https://wa.me/${waNumber.replace(/[^\d]/g, "")}?text=${waText}`;

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
          className="mt-4 text-display text-[44px] font-black uppercase leading-[0.95] text-bone md:text-[88px]"
        >
          Your Machine
          <br />
          Is <span className="text-neon text-glow">Locked In.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 border border-neon/40 bg-black/70 px-6 py-4 backdrop-blur"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-[0.3em] text-bone/50">Booking Token</p>
              <p className="mt-1 text-stencil text-3xl text-neon">{token}</p>
            </div>
            <button
              type="button"
              onClick={copy}
              data-cursor="cta"
              className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-bone/70 transition-colors hover:border-neon hover:text-neon"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-3 border-t border-white/10 pt-3 text-left text-[10px] uppercase tracking-[0.3em] text-bone/40">
            Order id · {params.id}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-8 space-y-2 text-sm text-bone/60"
        >
          <p>
            Arjun will verify on WhatsApp within 24 hours and reserve a bay slot for your install.
          </p>
          <p>
            Bring your bike + token. Or track the parts dispatch from your account.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link
            href={waHref}
            target="_blank"
            data-cursor="cta"
            className="inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:bg-white hover:shadow-neon-lg"
          >
            <MessageCircle className="h-4 w-4" /> Message on WhatsApp
          </Link>
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
