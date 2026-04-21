"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, KeyRound, Lock, AlertCircle, User } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ username: string; forcePasswordChange: boolean } | null>(null);
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setMe(d.admin);
          setNewUsername(d.admin.username);
        }
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (newPassword !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        newUsername: newUsername !== me?.username ? newUsername : undefined
      })
    });
    const data = await res.json();
    if (!data.ok) {
      setErr(
        data.error === "invalid_current_password"
          ? "Current password is wrong"
          : data.error === "weak_password"
            ? data.reason || "Password too weak"
            : data.error === "username_taken"
              ? "Username already in use"
              : "Failed to update"
      );
      setBusy(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin"), 900);
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center px-4 pt-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="neon-edge relative w-full max-w-md border border-white/5 bg-carbon/95 p-8 backdrop-blur"
      >
        <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-neon" />

        <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
          Mandatory Reset
        </p>
        <h1 className="mt-2 text-display text-2xl font-bold uppercase">Secure Your Account</h1>
        <p className="mt-2 text-sm text-bone/60">
          Default credentials must be replaced before accessing the dashboard.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
              New Admin ID (optional)
            </span>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-bone outline-none focus:border-neon"
                placeholder="6T4CUSTOMS"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
              Current Password
            </span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-bone outline-none focus:border-neon"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
              New Password
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
              <input
                type="password"
                required
                minLength={10}
                value={newPassword}
                onChange={(e) => setNew(e.target.value)}
                className="w-full border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-bone outline-none focus:border-neon"
                placeholder="min 10 chars, incl. letter + number"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
              Confirm Password
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-bone outline-none focus:border-neon"
              />
            </div>
          </label>
        </div>

        {err && (
          <p className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neon">
            <AlertCircle className="h-3.5 w-3.5" /> {err}
          </p>
        )}
        {done && (
          <p className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-green-400">
            <Check className="h-3.5 w-3.5" /> Updated. Redirecting…
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          disabled={busy || done}
          data-cursor="cta"
          className="mt-6 flex w-full items-center justify-center gap-2 bg-neon px-6 py-3 text-display text-xs font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white hover:shadow-neon-lg disabled:opacity-40"
        >
          {busy ? "Updating…" : "Lock In New Credentials"}
        </motion.button>
      </motion.form>
    </section>
  );
}
