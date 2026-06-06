"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { addressSchema, type AddressInput } from "./schema";
import { createAddress, updateAddress, type ActionResult } from "@/app/account/addresses/actions";
import { cn } from "@/lib/utils/cn";

export type AddressFormInitial = {
  id?: string;
  label?: string | null;
  full_name?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pin?: string;
  is_default?: boolean;
};

export function AddressForm({
  initial,
  mode,
  onDone
}: {
  initial?: AddressFormInitial;
  mode: "create" | "edit";
  onDone: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initial?.label ?? "",
      full_name: initial?.full_name ?? "",
      phone: initial?.phone ?? "",
      line1: initial?.line1 ?? "",
      line2: initial?.line2 ?? "",
      city: initial?.city ?? "",
      state: initial?.state ?? "",
      pin: initial?.pin ?? "",
      is_default: initial?.is_default ?? false
    }
  });

  const onSubmit = (values: AddressInput) => {
    setServerError(null);
    startTransition(async () => {
      const result: ActionResult =
        mode === "create"
          ? await createAddress(values)
          : await updateAddress(initial?.id ?? "", values);
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
          {mode === "create" ? "New Address" : "Edit Address"}
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
        <Field label="Label" hint="e.g. Home / Garage" error={errors.label?.message}>
          <input
            type="text"
            placeholder="Home"
            {...register("label")}
            className={inputCls}
          />
        </Field>
        <Field label="Full name" required error={errors.full_name?.message}>
          <input type="text" autoComplete="name" {...register("full_name")} className={inputCls} />
        </Field>
        <Field label="Phone" required error={errors.phone?.message}>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98xxx xxxxx"
            {...register("phone")}
            className={inputCls}
          />
        </Field>
        <Field label="PIN" required error={errors.pin?.message}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            {...register("pin")}
            className={inputCls}
          />
        </Field>
        <Field label="Address line 1" required error={errors.line1?.message} colSpan={2}>
          <input
            type="text"
            autoComplete="address-line1"
            {...register("line1")}
            className={inputCls}
          />
        </Field>
        <Field label="Address line 2" error={errors.line2?.message} colSpan={2}>
          <input
            type="text"
            autoComplete="address-line2"
            {...register("line2")}
            className={inputCls}
          />
        </Field>
        <Field label="City" required error={errors.city?.message}>
          <input
            type="text"
            autoComplete="address-level2"
            {...register("city")}
            className={inputCls}
          />
        </Field>
        <Field label="State" required error={errors.state?.message}>
          <input
            type="text"
            autoComplete="address-level1"
            {...register("state")}
            className={inputCls}
          />
        </Field>
      </div>

      <label className="mt-4 flex items-center gap-2 text-xs text-bone/70">
        <input
          type="checkbox"
          {...register("is_default")}
          className="h-3.5 w-3.5 accent-neon"
        />
        Make this my default shipping address
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
          className={cn(
            "inline-flex items-center gap-2 bg-neon px-5 py-3 text-display text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white hover:shadow-neon-lg disabled:opacity-40"
          )}
        >
          {pending ? (
            "Saving…"
          ) : done ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> {mode === "create" ? "Save address" : "Update"}
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
        {hint && <span className="text-bone/30 normal-case tracking-normal">{hint}</span>}
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
