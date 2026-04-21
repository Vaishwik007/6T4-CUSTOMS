"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConfigStep = 1 | 2 | 3 | 4;

type BuildState = {
  step: ConfigStep;
  brand: string | null;
  model: string | null;
  year: number | null;
  selectedParts: string[];
  setStep: (s: ConfigStep) => void;
  setBrand: (b: string) => void;
  setModel: (m: string) => void;
  setYear: (y: number) => void;
  togglePart: (id: string) => void;
  reset: () => void;
};

export const useBuildStore = create<BuildState>()(
  persist(
    (set) => ({
      step: 1,
      brand: null,
      model: null,
      year: null,
      selectedParts: [],
      setStep: (step) => set({ step }),
      setBrand: (brand) => set({ brand, model: null, year: null, selectedParts: [], step: 2 }),
      setModel: (model) => set({ model, year: null, selectedParts: [], step: 3 }),
      setYear: (year) => set({ year, step: 4 }),
      togglePart: (id) =>
        set((state) => ({
          selectedParts: state.selectedParts.includes(id)
            ? state.selectedParts.filter((p) => p !== id)
            : [...state.selectedParts, id]
        })),
      reset: () => set({ step: 1, brand: null, model: null, year: null, selectedParts: [] })
    }),
    { name: "6t4-build-v1" }
  )
);
