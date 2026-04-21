"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, KeyRound, AlertCircle, Shield } from "lucide-react";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      // Make sure default admin exists (idempotent)
      await fetch("/api/admin/bootstrap", { method: "POST" });
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data.ok) {
        setErr(
          data.error === "rate_limited"
            ? "Too many attempts. Slow down."
            : data.error === "backend_unconfigured"
              ? "Backend not configured. Set Supabase env keys."
              : "Invalid credentials."
        );
        setBusy(false);
        return;
      }
      if (data.forcePasswordChange) {
        router.push("/admin/change-password");
      } else {
        router.push(next);
      }
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 pt-24">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-neon to-transparent opacity-60" />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="neon-edge relative z-10 w-full max-w-md border border-white/5 bg-carbon/95 p-8 backdrop-blur"
      >
        <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-neon" />

        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center border border-neon bg-neon-900/30">
            <Shield className="h-5 w-5 text-neon" />
          </div>
          <div>
            <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
              Bay 01 / Access
            </p>
            <h1 className="text-display text-2xl font-bold uppercase">Admin Login</h1>
          </div>
        </div>

        <label className="mb-4 block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
            Admin ID
          </span>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
            <input
              type="text"
              required
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-bone outline-none transition-colors focus:border-neon"
              placeholder="6T4CUSTOMS"
            />
          </div>
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
            Password
          </span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-bone outline-none transition-colors focus:border-neon"
              placeholder="••••••••"
            />
          </div>
        </label>

        {err && (
          <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neon">
            <AlertCircle className="h-3.5 w-3.5" /> {err}
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          disabled={busy}
          data-cursor="cta"
          className="flex w-full items-center justify-center gap-2 bg-neon px-6 py-3 text-display text-xs font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white hover:shadow-neon-lg disabled:opacity-40"
        >
          {busy ? "Authenticating…" : "Authorize"}
        </motion.button>

        <p className="mt-6 border-t border-white/5 pt-4 text-[10px] uppercase tracking-[0.3em] text-bone/40">
          First time? Default <span className="text-neon">6T4CUSTOMS</span> / <span className="text-neon">6T4CUSTOMS</span> — forced reset on first login.
        </p>
      </motion.form>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
