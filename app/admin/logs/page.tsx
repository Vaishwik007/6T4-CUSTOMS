"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type LogRow = {
  id: string;
  admin_username: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};
type AttemptRow = {
  id: string;
  identifier: string;
  kind: string;
  success: boolean;
  ip: string | null;
  created_at: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null);
  const [tab, setTab] = useState<"activity" | "logins">("activity");

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => (r.status === 503 ? null : r.json()))
      .then((d) => {
        setLogs(d?.activity ?? []);
        setAttempts(d?.attempts ?? []);
      });
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Audit</p>
        <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">Activity Trail</h1>
      </header>

      <div className="flex gap-1">
        {(
          [
            { k: "activity", label: "Admin Activity", Icon: Activity },
            { k: "logins", label: "Login Attempts", Icon: ShieldAlert }
          ] as const
        ).map(({ k, label, Icon }) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-display text-[11px] uppercase tracking-[0.2em] transition-colors",
              tab === k ? "bg-neon text-black" : "border border-white/10 text-bone/70 hover:border-neon hover:text-neon"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "activity" && (
        <div className="overflow-x-auto border border-white/5">
          <table className="w-full text-sm">
            <thead className="bg-black/60 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {!logs && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-bone/40">Loading…</td></tr>
              )}
              {logs && logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-bone/40">No activity recorded.</td></tr>
              )}
              {logs?.map((l) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-[10px] text-bone/50">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-neon">{l.admin_username ?? "—"}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.2em]">
                    {l.action.replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-bone/60">
                    {l.target_type ? (
                      <>
                        {l.target_type}
                        <span className="text-bone/30"> · {l.target_id?.slice(0, 12)}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-bone/40">{l.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "logins" && (
        <div className="overflow-x-auto border border-white/5">
          <table className="w-full text-sm">
            <thead className="bg-black/60 text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Identifier</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {!attempts && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-bone/40">Loading…</td></tr>
              )}
              {attempts && attempts.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-bone/40">No login attempts.</td></tr>
              )}
              {attempts?.map((a) => (
                <tr key={a.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-[10px] text-bone/50">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-neon">{a.identifier}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.2em]">{a.kind}</td>
                  <td className="px-4 py-3">
                    {a.success ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-neon">
                        <XCircle className="h-3 w-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-bone/40">{a.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
