"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Props = {
  reviewId: string;
  currentStatus: "pending" | "published" | "rejected" | "flagged";
};

export function ReviewActions({ reviewId, currentStatus }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const moderate = async (action: "approve" | "reject") => {
    setBusy(action);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "moderation_failed");
        setBusy(null);
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErr("network_error");
    } finally {
      setBusy(null);
    }
  };

  const isDone = currentStatus === "published" || currentStatus === "rejected";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || busy !== null || currentStatus === "published"}
          onClick={() => moderate("approve")}
          className={cn(
            "inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] transition-colors",
            currentStatus === "published"
              ? "border-green-500/40 text-green-400/60"
              : "border-green-500/60 text-green-400 hover:bg-green-500/10",
            (pending || busy === "approve") && "opacity-50"
          )}
          aria-label="Approve review"
        >
          <Check className="h-3 w-3" />
          {busy === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={pending || busy !== null || currentStatus === "rejected"}
          onClick={() => moderate("reject")}
          className={cn(
            "inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] transition-colors",
            currentStatus === "rejected"
              ? "border-red-900 text-red-400/60"
              : "border-red-700 text-red-400 hover:bg-red-500/10",
            (pending || busy === "reject") && "opacity-50"
          )}
          aria-label="Reject review"
        >
          <X className="h-3 w-3" />
          {busy === "reject" ? "Rejecting…" : "Reject"}
        </button>
        {isDone && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-bone/40">
            Moderated · {currentStatus}
          </span>
        )}
      </div>
      {err && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-red-400">{err}</p>
      )}
    </div>
  );
}
