"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";
import { getPartById } from "@/lib/data/parts";
import { cn } from "@/lib/utils/cn";
import { track } from "@/lib/analytics/events";

const schema = z.object({
  productId: z.string().min(1, "Pick a part to review"),
  authorName: z.string().min(2, "Required"),
  bike: z.string().max(80).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().min(20, "At least 20 characters").max(2000)
});

type Values = z.infer<typeof schema>;

export function ReviewForm({
  orderId,
  defaultName,
  items
}: {
  orderId: string;
  defaultName: string;
  items: { part_id: string; qty: number }[];
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      authorName: defaultName,
      rating: 5,
      productId: items[0]?.part_id ?? ""
    }
  });

  const rating = watch("rating");

  const onSubmit = handleSubmit(async (values) => {
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, orderId })
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Could not submit. Try again later.");
        setStatus("error");
        return;
      }
      track({ name: "review_submit", product_id: values.productId, rating: values.rating });
      setStatus("success");
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    }
  });

  if (status === "success") {
    return (
      <div className="border border-emerald-500/40 bg-emerald-500/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <p className="mt-4 text-display text-base font-bold uppercase tracking-wide text-emerald-300">
          Submitted
        </p>
        <p className="mt-2 text-sm text-bone/70">
          Thanks — your review is in the moderation queue. It'll be live within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 border border-white/10 bg-carbon p-6 md:p-8">
      {/* Part picker */}
      {items.length > 0 && (
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
            Which part?
          </label>
          <select
            className="w-full border border-white/10 bg-black/40 px-3 py-3 text-sm text-bone outline-none focus:border-neon"
            {...register("productId")}
          >
            {items.map((it) => {
              const p = getPartById(it.part_id);
              return (
                <option key={it.part_id} value={it.part_id}>
                  {p ? p.name : it.part_id}
                </option>
              );
            })}
          </select>
          {formState.errors.productId && (
            <p className="mt-1 text-[10px] text-neon">{formState.errors.productId.message}</p>
          )}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue("rating", n, { shouldValidate: true })}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="group"
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  n <= rating ? "fill-neon text-neon" : "text-bone/30 hover:text-neon/60"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Name + bike */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
            Your name
          </label>
          <input
            className="w-full border border-white/10 bg-black/40 px-3 py-3 text-sm text-bone outline-none focus:border-neon"
            {...register("authorName")}
          />
          {formState.errors.authorName && (
            <p className="mt-1 text-[10px] text-neon">{formState.errors.authorName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
            Your bike (optional)
          </label>
          <input
            placeholder="KTM 390 Duke 2023"
            className="w-full border border-white/10 bg-black/40 px-3 py-3 text-sm text-bone outline-none focus:border-neon"
            {...register("bike")}
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
          Headline (optional)
        </label>
        <input
          placeholder='"Sharper throttle response than I expected"'
          className="w-full border border-white/10 bg-black/40 px-3 py-3 text-sm text-bone outline-none focus:border-neon"
          {...register("title")}
        />
      </div>

      {/* Body */}
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
          Your review
        </label>
        <textarea
          rows={6}
          placeholder="What surprised you? Sound, throttle response, install quality — be specific."
          className="w-full border border-white/10 bg-black/40 px-3 py-3 text-sm text-bone outline-none focus:border-neon"
          {...register("content")}
        />
        {formState.errors.content && (
          <p className="mt-1 text-[10px] text-neon">{formState.errors.content.message}</p>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}

      <div className="flex flex-col items-stretch gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-bone/40">
          Reviews go to moderation before they're public
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          data-cursor="cta"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-8 py-3 text-display text-xs uppercase tracking-[0.2em] font-bold transition-all",
            status === "submitting"
              ? "cursor-not-allowed bg-white/10 text-bone/40"
              : "bg-neon text-black hover:bg-white hover:shadow-neon-lg"
          )}
        >
          {status === "submitting" ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
