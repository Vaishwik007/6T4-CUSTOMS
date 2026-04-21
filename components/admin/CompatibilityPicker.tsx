"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search } from "lucide-react";
import { BRANDS } from "@/lib/data/brands";
import { getModelsByBrand, getYearsForModel, getModel } from "@/lib/data/models";
import type { CompatibilityRule } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

type Mode = "universal" | "specific";

type Props = {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  rules: CompatibilityRule[];
  onRulesChange: (r: CompatibilityRule[]) => void;
};

export function CompatibilityPicker({ mode, onModeChange, rules, onRulesChange }: Props) {
  const [pickerBrand, setPickerBrand] = useState<string>("");
  const [pickerModel, setPickerModel] = useState<string>("");
  const [pickerYearStart, setPickerYearStart] = useState<number | "">("");
  const [pickerYearEnd, setPickerYearEnd] = useState<number | "null">("null");
  const [modelSearch, setModelSearch] = useState("");

  const availableModels = useMemo(() => {
    if (!pickerBrand) return [];
    const all = getModelsByBrand(pickerBrand);
    if (!modelSearch) return all;
    return all.filter((m) =>
      `${m.name} ${m.category}`.toLowerCase().includes(modelSearch.toLowerCase())
    );
  }, [pickerBrand, modelSearch]);

  const availableYears = useMemo(() => {
    if (!pickerBrand || !pickerModel) return [];
    return getYearsForModel(pickerBrand, pickerModel);
  }, [pickerBrand, pickerModel]);

  const canAdd = pickerBrand && pickerModel && pickerYearStart !== "";

  const addRule = () => {
    if (!canAdd) return;
    const rule: CompatibilityRule = {
      brand: pickerBrand,
      model: pickerModel,
      yearStart: Number(pickerYearStart),
      yearEnd: pickerYearEnd === "null" ? null : Number(pickerYearEnd)
    };
    // Prevent exact duplicates
    const exists = rules.some(
      (r) =>
        r.brand === rule.brand &&
        r.model === rule.model &&
        r.yearStart === rule.yearStart &&
        r.yearEnd === rule.yearEnd
    );
    if (!exists) onRulesChange([...rules, rule]);
    // Reset sub-fields, keep brand for rapid multi-add on same make
    setPickerModel("");
    setPickerYearStart("");
    setPickerYearEnd("null");
    setModelSearch("");
  };

  const removeRule = (i: number) => {
    onRulesChange(rules.filter((_, idx) => idx !== i));
  };

  const addAllYearsOfModel = () => {
    if (!pickerBrand || !pickerModel) return;
    const mo = getModel(pickerBrand, pickerModel);
    if (!mo) return;
    const rule: CompatibilityRule = {
      brand: pickerBrand,
      model: pickerModel,
      yearStart: mo.yearStart,
      yearEnd: mo.yearEnd
    };
    const exists = rules.some(
      (r) =>
        r.brand === rule.brand &&
        r.model === rule.model &&
        r.yearStart === rule.yearStart &&
        r.yearEnd === rule.yearEnd
    );
    if (!exists) onRulesChange([...rules, rule]);
    setPickerModel("");
    setModelSearch("");
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex flex-wrap gap-2">
        {(["universal", "specific"] as Mode[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onModeChange(k)}
            data-cursor="cta"
            className={cn(
              "border px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors",
              mode === k
                ? "border-neon bg-neon-900/20 text-neon"
                : "border-white/10 text-bone/70 hover:border-neon"
            )}
          >
            {k === "universal" ? "Fits all bikes" : "Specific bikes only"}
          </button>
        ))}
      </div>

      {mode === "universal" && (
        <p className="rounded-none border border-white/5 bg-black/40 p-4 text-xs text-bone/60">
          This part is listed as compatible with every bike in the catalog. Customers will see it in
          every configurator's parts panel.
        </p>
      )}

      {mode === "specific" && (
        <>
          {/* Row builder */}
          <div className="border border-white/5 bg-carbon/40 p-4">
            <p className="mb-3 text-display text-[10px] uppercase tracking-[0.3em] text-neon">
              Add a bike this part fits
            </p>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto]">
              {/* Brand (Make) */}
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
                  Make / Brand
                </span>
                <select
                  value={pickerBrand}
                  onChange={(e) => {
                    setPickerBrand(e.target.value);
                    setPickerModel("");
                    setPickerYearStart("");
                    setModelSearch("");
                  }}
                  className="input"
                >
                  <option value="" className="bg-black">— Select —</option>
                  {BRANDS.map((b) => (
                    <option key={b.slug} value={b.slug} className="bg-black">
                      {b.name} ({b.region})
                    </option>
                  ))}
                </select>
              </label>

              {/* Model */}
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
                  Model
                </span>
                <div className="relative">
                  {pickerBrand && getModelsByBrand(pickerBrand).length > 6 && (
                    <Search className="pointer-events-none absolute right-2 top-2 z-10 h-3 w-3 text-bone/30" />
                  )}
                  <select
                    value={pickerModel}
                    onChange={(e) => {
                      setPickerModel(e.target.value);
                      setPickerYearStart("");
                    }}
                    disabled={!pickerBrand}
                    className="input disabled:opacity-40"
                  >
                    <option value="" className="bg-black">
                      {pickerBrand ? "— Select model —" : "— Pick brand first —"}
                    </option>
                    {availableModels.map((m) => (
                      <option key={m.slug} value={m.slug} className="bg-black">
                        {m.name} · {m.engineCc}cc · {m.category}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              {/* Year start */}
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
                  From
                </span>
                <select
                  value={pickerYearStart}
                  onChange={(e) => setPickerYearStart(e.target.value ? Number(e.target.value) : "")}
                  disabled={!pickerModel}
                  className="input w-[110px] disabled:opacity-40"
                >
                  <option value="" className="bg-black">—</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y} className="bg-black">{y}</option>
                  ))}
                </select>
              </label>

              {/* Year end */}
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.3em] text-bone/50">
                  Through
                </span>
                <select
                  value={pickerYearEnd}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPickerYearEnd(v === "null" ? "null" : (Number(v) as number));
                  }}
                  disabled={!pickerModel}
                  className="input w-[120px] disabled:opacity-40"
                >
                  <option value="null" className="bg-black">Present</option>
                  {availableYears
                    .filter((y) => pickerYearStart === "" || y >= Number(pickerYearStart))
                    .map((y) => (
                      <option key={y} value={y} className="bg-black">{y}</option>
                    ))}
                </select>
              </label>

              {/* Add */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addRule}
                  disabled={!canAdd}
                  data-cursor="cta"
                  className={cn(
                    "inline-flex h-[42px] items-center gap-1 border px-4 text-display text-[11px] uppercase tracking-[0.2em] transition-all",
                    canAdd
                      ? "border-neon bg-neon text-black hover:bg-white"
                      : "border-white/10 text-bone/40"
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Shortcut: full year range */}
            {pickerModel && (
              <button
                type="button"
                onClick={addAllYearsOfModel}
                className="mt-3 text-[10px] uppercase tracking-[0.3em] text-neon hover:text-white"
              >
                + Add all production years of this model
              </button>
            )}
          </div>

          {/* Rules list */}
          <div>
            <p className="mb-2 text-display text-[10px] uppercase tracking-[0.3em] text-bone/50">
              Rules ({rules.length})
            </p>
            {rules.length === 0 ? (
              <p className="border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-bone/40">
                No bikes added yet. Pick a brand + model + years above and click{" "}
                <span className="text-neon">Add</span>.
              </p>
            ) : (
              <ul className="space-y-1">
                <AnimatePresence>
                  {rules.map((r, i) => {
                    const brandMeta = BRANDS.find((b) => b.slug === r.brand);
                    const modelMeta = getModel(r.brand, r.model);
                    return (
                      <motion.li
                        key={`${r.brand}-${r.model}-${r.yearStart}-${r.yearEnd ?? "now"}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        layout
                        className="flex items-center justify-between border border-white/5 bg-black/40 px-4 py-2.5 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center bg-neon px-1.5 text-[10px] font-bold text-black">
                            {i + 1}
                          </span>
                          <div>
                            <div className="text-bone">
                              {brandMeta?.name ?? r.brand}{" "}
                              <span className="text-neon">· {modelMeta?.name ?? r.model}</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-bone/40">
                              {r.yearStart}–{r.yearEnd ?? "Present"}
                              {modelMeta && (
                                <>
                                  {" · "}
                                  {modelMeta.engineCc}cc · {modelMeta.category}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRule(i)}
                          aria-label="Remove"
                          className="grid h-8 w-8 place-items-center border border-white/10 text-bone/60 transition-colors hover:border-neon hover:text-neon"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
