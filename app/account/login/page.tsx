"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle, ShieldAlert, KeyRound, Lock, X, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type EmailState = "idle" | "sending" | "awaiting-code" | "verifying" | "signed-in" | "error";

export default function LoginPage() {
  // Customer email OTP
  const [email, setEmail] = useState("");
  const [state, setState] = useState<EmailState>("idle");
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for resend
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!data.ok) {
        setState("error");
        setMsg(
          data.error === "rate_limited"
            ? "Too many codes. Wait 10 minutes."
            : data.error === "backend_unconfigured"
              ? "OTP requires Supabase. Configure env keys."
              : "Failed to send code."
        );
        return;
      }
      setState("awaiting-code");
      setSecondsLeft(60);
      if (data.devCode) setDevCode(data.devCode); // dev fallback only
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setState("error");
      setMsg("Network error.");
    }
  };

  const onDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every((d) => d) && !digit.includes(" ")) {
      verify(next.join(""));
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      verify(pasted);
    }
  };

  const verify = async (full: string) => {
    setState("verifying");
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: full })
    });
    const data = await res.json();
    if (!data.ok) {
      setState("awaiting-code");
      setMsg(
        data.error === "invalid_code"
          ? "Incorrect code"
          : data.error === "too_many_attempts"
            ? "Too many tries. Request a new code."
            : data.error === "no_active_code"
              ? "Code expired. Request a new one."
              : "Verification failed."
      );
      return;
    }
    setState("signed-in");
    setTimeout(() => (window.location.href = "/account"), 900);
  };

  return (
    <section className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-24 pt-32">
      <SectionHeader
        eyebrow="Access"
        title="Sign In"
        subtitle="6-digit code to your email. 5 minutes validity."
        align="center"
        className="text-center"
      />

      <AnimatePresence mode="wait">
        {state === "idle" || state === "sending" || state === "error" ? (
          <motion.form
            key="email-step"
            onSubmit={sendCode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="neon-edge relative mt-6 border border-white/5 bg-carbon p-6"
          >
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-bone outline-none transition-colors focus:border-neon"
                  placeholder="rider@example.com"
                />
              </div>
            </label>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={state === "sending"}
              data-cursor="cta"
              className="mt-4 flex w-full items-center justify-center gap-2 bg-neon px-6 py-3 text-display text-xs font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white hover:shadow-neon-lg disabled:opacity-40"
            >
              {state === "sending" ? "Sending…" : "Send Code"} <ArrowRight className="h-4 w-4" />
            </motion.button>

            {state === "error" && msg && (
              <p className="mt-4 flex items-center gap-2 text-xs text-neon">
                <AlertCircle className="h-4 w-4" /> {msg}
              </p>
            )}
          </motion.form>
        ) : (
          <motion.div
            key="code-step"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="neon-edge relative mt-6 border border-white/5 bg-carbon p-6"
          >
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

            <p className="text-[10px] uppercase tracking-[0.3em] text-neon">Code sent</p>
            <h3 className="mt-1 text-display text-lg font-bold uppercase">Check {email}</h3>
            <p className="mt-1 text-xs text-bone/50">Enter the 6-digit code.</p>

            <div className="mt-6 flex justify-between gap-2" onPaste={onPaste}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => onDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !d && i > 0) inputRefs.current[i - 1]?.focus();
                  }}
                  disabled={state === "verifying" || state === "signed-in"}
                  className="h-14 w-full border border-white/10 bg-black/40 text-center text-stencil text-2xl text-neon outline-none transition-colors focus:border-neon disabled:opacity-50"
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em]">
              <button
                type="button"
                disabled={secondsLeft > 0}
                onClick={() => sendCode()}
                data-cursor="cta"
                className="text-neon transition-opacity hover:text-white disabled:opacity-40"
              >
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setState("idle");
                  setCode(["", "", "", "", "", ""]);
                  setMsg("");
                }}
                className="text-bone/40 hover:text-neon"
              >
                Change email
              </button>
            </div>

            {devCode && (
              <p className="mt-4 border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-yellow-300">
                Dev mode · code: <span className="text-stencil">{devCode}</span>
              </p>
            )}

            {state === "verifying" && (
              <p className="mt-4 text-xs text-bone/60">Verifying…</p>
            )}
            {state === "signed-in" && (
              <p className="mt-4 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Signed in. Redirecting…
              </p>
            )}
            {state === "awaiting-code" && msg && (
              <p className="mt-4 flex items-center gap-2 text-xs text-neon">
                <AlertCircle className="h-4 w-4" /> {msg}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stealth admin entry */}
      <StealthAdminButton />
    </section>
  );
}

/** Tiny near-invisible button bottom-right, opens admin modal. */
function StealthAdminButton() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await fetch("/api/admin/bootstrap", { method: "POST" });
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data.ok) {
        setErr(
          data.error === "backend_unconfigured"
            ? "Backend unconfigured"
            : data.error === "rate_limited"
              ? "Rate limited"
              : "Invalid credentials"
        );
        setBusy(false);
        return;
      }
      window.location.href = data.forcePasswordChange ? "/admin/change-password" : "/admin";
    } catch {
      setErr("Network error");
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Admin access"
        data-cursor="cta"
        className="group fixed bottom-6 right-6 z-40 grid h-10 w-10 place-items-center border border-white/5 bg-black/60 text-bone/20 backdrop-blur transition-all hover:border-neon hover:text-neon hover:shadow-neon-sm md:h-12 md:w-12"
      >
        <ShieldAlert className="h-3.5 w-3.5 transition-transform group-hover:scale-110 md:h-4 md:w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.form
              onSubmit={submit}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="neon-edge relative w-full max-w-sm border border-neon/40 bg-carbon p-6 shadow-neon-lg"
            >
              <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-neon" />
              <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-neon" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-neon" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-neon" />

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 text-bone/40 hover:text-neon"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center border border-neon bg-neon-900/30">
                  <ShieldAlert className="h-4 w-4 text-neon" />
                </div>
                <div>
                  <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
                    Restricted
                  </p>
                  <h2 className="text-display text-lg font-bold uppercase">Admin Portal</h2>
                </div>
              </div>

              <label className="mb-3 block">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">Admin ID</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
                  <input
                    autoFocus
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-white/10 bg-black/40 py-2.5 pl-10 pr-3 text-sm text-bone outline-none focus:border-neon"
                    placeholder="6T4CUSTOMS"
                    required
                  />
                </div>
              </label>

              <label className="mb-4 block">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-white/10 bg-black/40 py-2.5 pl-10 pr-3 text-sm text-bone outline-none focus:border-neon"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </label>

              {err && (
                <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neon">
                  <AlertCircle className="h-3.5 w-3.5" /> {err}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                data-cursor="cta"
                className="flex w-full items-center justify-center gap-2 bg-neon px-6 py-3 text-display text-xs font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white hover:shadow-neon-lg disabled:opacity-40"
              >
                {busy ? "Authorizing…" : "Authorize"}
              </button>
              <p className="mt-4 text-center text-[9px] uppercase tracking-[0.3em] text-bone/30">
                Unauthorised access is logged
              </p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
