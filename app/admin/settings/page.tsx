"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Shield,
  Trash2,
  KeyRound,
  AlertCircle,
  Check,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type AdminUser = {
  id: string;
  username: string;
  email: string | null;
  role: "super_admin" | "admin" | "staff";
  force_password_change: boolean;
  last_login_at: string | null;
  created_at: string;
  disabled: boolean;
};

export default function SettingsPage() {
  const [me, setMe] = useState<{ id: string; username: string; role: string } | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Create form
  const [cUsername, setCUsername] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cRole, setCRole] = useState<"admin" | "staff" | "super_admin">("admin");
  const [cPassword, setCPassword] = useState("");

  // Self password change
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const load = async () => {
    const meRes = await fetch("/api/admin/me").then((r) => r.json());
    if (meRes.ok) setMe(meRes.admin);
    const uRes = await fetch("/api/admin/users").then((r) => (r.status === 403 ? null : r.json()));
    if (uRes?.ok) setUsers(uRes.users);
    else setUsers([]);
  };
  useEffect(() => {
    load();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cUsername, email: cEmail || undefined, role: cRole, initialPassword: cPassword })
    });
    const data = await res.json();
    if (!data.ok) {
      setErr(data.error ?? "Failed");
      return;
    }
    setMsg(`Created ${data.user.username}. They must change password on first login.`);
    setCUsername("");
    setCEmail("");
    setCPassword("");
    load();
  };

  const changeSelfPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw })
    });
    const data = await res.json();
    if (!data.ok) {
      setErr(data.error === "weak_password" ? data.reason : data.error ?? "Failed");
      return;
    }
    setMsg("Password updated.");
    setCurPw("");
    setNewPw("");
  };

  const resetUser = async (id: string) => {
    const p = prompt("New password for this admin (min 10 chars):");
    if (!p || p.length < 10) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetPassword: p })
    });
    const data = await res.json();
    if (!data.ok) setErr(data.error ?? "Failed");
    else setMsg("Password reset. User must change on next login.");
  };

  const toggleRole = async (u: AdminUser) => {
    const next = u.role === "admin" ? "super_admin" : u.role === "super_admin" ? "staff" : "admin";
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next })
    });
    load();
  };

  const removeUser = async (id: string) => {
    if (!confirm("Delete this admin?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  };

  const isSuper = me?.role === "super_admin";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Admin</p>
        <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">Settings</h1>
      </header>

      {msg && (
        <div className="flex items-center gap-2 border border-green-500/40 bg-green-500/10 p-3 text-[11px] text-green-400">
          <Check className="h-4 w-4" /> {msg}
        </div>
      )}
      {err && (
        <div className="flex items-center gap-2 border border-neon/40 bg-neon-900/10 p-3 text-[11px] text-neon">
          <AlertCircle className="h-4 w-4" /> {err}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Change own password */}
        <form onSubmit={changeSelfPassword} className="neon-edge relative border border-white/5 bg-carbon p-6">
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <h3 className="mb-4 inline-flex items-center gap-2 text-display text-xs uppercase tracking-[0.3em] text-neon">
            <Lock className="h-4 w-4" /> Your Password
          </h3>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">Current</span>
              <input
                type="password"
                value={curPw}
                onChange={(e) => setCurPw(e.target.value)}
                className="w-full border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">New (min 10 chars)</span>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                minLength={10}
                className="w-full border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon"
                required
              />
            </label>
          </div>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className="mt-4 inline-flex items-center gap-2 bg-neon px-4 py-2 text-display text-[11px] uppercase tracking-[0.2em] font-bold text-black hover:bg-white"
          >
            Update Password
          </motion.button>
        </form>

        {/* 2FA */}
        <div className="neon-edge relative border border-white/5 bg-carbon p-6">
          <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
          <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
          <h3 className="mb-4 inline-flex items-center gap-2 text-display text-xs uppercase tracking-[0.3em] text-neon">
            <Shield className="h-4 w-4" /> Two-Factor Auth
          </h3>
          <p className="text-sm text-bone/60">
            TOTP 2FA (Google Authenticator / 1Password) — enrollment surface wired, activation deferred to next release.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex items-center gap-2 border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-bone/40"
          >
            Enroll 2FA (coming soon)
          </button>
        </div>
      </div>

      {/* Admin users (super admin only) */}
      {isSuper ? (
        <>
          <div className="neon-edge relative border border-white/5 bg-carbon p-6">
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
            <h3 className="mb-4 inline-flex items-center gap-2 text-display text-xs uppercase tracking-[0.3em] text-neon">
              <UserPlus className="h-4 w-4" /> Add New Admin
            </h3>
            <form onSubmit={createUser} className="grid gap-3 md:grid-cols-5">
              <input
                placeholder="Username"
                value={cUsername}
                onChange={(e) => setCUsername(e.target.value)}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon md:col-span-1"
                required
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon md:col-span-1"
              />
              <select
                value={cRole}
                onChange={(e) => setCRole(e.target.value as "super_admin" | "admin" | "staff")}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon md:col-span-1"
              >
                <option value="admin" className="bg-black">admin</option>
                <option value="staff" className="bg-black">staff</option>
                <option value="super_admin" className="bg-black">super_admin</option>
              </select>
              <input
                type="password"
                placeholder="Initial password"
                value={cPassword}
                onChange={(e) => setCPassword(e.target.value)}
                className="border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-neon md:col-span-1"
                minLength={10}
                required
              />
              <button
                type="submit"
                className="bg-neon px-4 py-2 text-display text-[11px] uppercase tracking-[0.2em] font-bold text-black hover:bg-white md:col-span-1"
              >
                Create
              </button>
            </form>
          </div>

          <div className="overflow-x-auto border border-white/5">
            <table className="w-full text-sm">
              <thead className="bg-black/60 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-px"></th>
                </tr>
              </thead>
              <tbody>
                {!users && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-bone/40">Loading…</td></tr>
                )}
                {users?.map((u) => (
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-bone">{u.username}</td>
                    <td className="px-4 py-3 text-[11px] text-bone/60">{u.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleRole(u)}
                        className={cn(
                          "border px-2 py-1 text-[10px] uppercase tracking-[0.2em] hover:border-neon hover:text-neon",
                          u.role === "super_admin"
                            ? "border-neon text-neon"
                            : u.role === "admin"
                              ? "border-white/30 text-bone"
                              : "border-white/10 text-bone/50"
                        )}
                        title="Click to cycle role"
                      >
                        {u.role.replace("_", " ")}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-bone/50">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em]">
                      {u.force_password_change ? (
                        <span className="text-yellow-400">Must reset pw</span>
                      ) : u.disabled ? (
                        <span className="text-bone/40">Disabled</span>
                      ) : (
                        <span className="text-green-400">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => resetUser(u.id)}
                          aria-label="Reset password"
                          className="grid h-8 w-8 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        {u.id !== me?.id && (
                          <button
                            type="button"
                            onClick={() => removeUser(u.id)}
                            aria-label="Delete"
                            className="grid h-8 w-8 place-items-center border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="border border-dashed border-white/10 p-6 text-center text-sm text-bone/50">
          Admin-user management requires <span className="text-neon">super_admin</span> role.
        </div>
      )}
    </div>
  );
}
