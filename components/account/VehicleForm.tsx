"use client";

import { useState, useTransition, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { vehicleSchema, type VehicleInput } from "./schema";
import { createVehicle, type ActionResult } from "@/app/account/vehicles/actions";
import { BRANDS } from "@/lib/data/brands";
import { MODELS_BY_BRAND } from "@/lib/data/models";
import { cn } from "@/lib/utils/cn";

export function VehicleForm({ onDone }: { onDone: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const out: number[] = [];
    for (let y = currentYear; y >= 2000; y--) out.push(y);
    return out;
  }, [currentYear]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand_slug: "",
      model_slug: "",
      year: currentYear,
      nickname: "",
      plate: "",
      current_mods: "",
      is_primary: false
    }
  });

  const brandSlug = watch("brand_slug");
  const models = brandSlug ? MODELS_BY_BRAND[brandSlug] ?? [] : [];

  const onSubmit = (values: VehicleInput) => {
    setServerError(null);
    startTransition(async () => {
      const result: ActionResult = await createVehicle({
        brand_slug: values.brand_slug,
        model_slug: values.model_slug,
        year: values.year,
        nickname: values.nickname,
        plate: values.plate,
        current_mods: values.current_mods,
        is_primary: values.is_primary
      });
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onDone();
      }, 700);
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-edge relative border border-white/10 bg-carbon p-5"
      noValidate
    >
      <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
      <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

      <div className="flex items-center justify-between">
        <h3 className="text-display text-xs uppercase tracking-[0.3em] text-neon">
          New Vehicle
        </h3>
        <button
          type="button"
          onClick={onDone}
          aria-label="Close form"
          className="text-bone/40 transition-colors hover:text-neon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Brand" required error={errors.brand_slug?.message}>
          <select
            {...register("brand_slug", {
              onChange: () => setValue("model_slug", "")
            })}
            className={selectCls}
          >
            <option value="">Select brand…</option>
            {BRANDS.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Model" required error={errors.model_slug?.message}>
          <select
            {...register("model_slug")}
            disabled={!brandSlug}
            className={selectCls}
          >
            <option value="">
              {brandSlug ? "Select model…" : "Pick brand first"}
            </option>
            {models.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year" required error={errors.year?.message}>
          <select {...register("year")} className={selectCls}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Nickname"
          hint="e.g. Red Rocket"
          error={errors.nickname?.message}
        >
          <input type="text" {...register("nickname")} className={inputCls} />
        </Field>

        <Field
          label="Number plate"
          hint="Optional"
          error={errors.plate?.message}
        >
          <input
            type="text"
            placeholder="TS 09 XX 0000"
            {...register("plate")}
            className={cn(inputCls, "uppercase")}
          />
        </Field>

        <Field
          label="Current mods"
          hint="Comma separated"
          error={errors.current_mods?.message as string | undefined}
          colSpan={2}
        >
          <input
            type="text"
            placeholder="Akrapovic slip-on, K&N filter, ECU flash"
            {...register("current_mods")}
            className={inputCls}
          />
        </Field>
      </div>

      <label className="mt-4 flex items-center gap-2 text-xs text-bone/70">
        <input
          type="checkbox"
          {...register("is_primary")}
          className="h-3.5 w-3.5 accent-neon"
        />
        Make this my primary bike
      </label>

      {serverError && (
        <p className="mt-4 flex items-center gap-2 text-xs text-neon">
          <AlertCircle className="h-4 w-4" /> {serverError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          data-cursor="cta"
          className="inline-flex items-center gap-2 bg-neon px-5 py-3 text-display text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white hover:shadow-neon-lg disabled:opacity-40"
        >
          {pending ? (
            "Saving…"
          ) : done ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Add vehicle
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="border border-white/10 px-5 py-3 text-display text-[11px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-neon hover:text-neon"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

const inputCls =
  "w-full border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-bone outline-none transition-colors focus:border-neon";
const selectCls = cn(inputCls, "appearance-none");

function Field({
  label,
  hint,
  required,
  error,
  colSpan,
  children
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  colSpan?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", colSpan === 2 && "md:col-span-2")}>
      <span className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-bone/50">
        <span>
          {label}
          {required && <span className="ml-1 text-neon">*</span>}
        </span>
        {hint && (
          <span className="text-bone/30 normal-case tracking-normal">{hint}</span>
        )}
      </span>
      {children}
      {error && (
        <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-neon">
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      )}
    </label>
  );
}
