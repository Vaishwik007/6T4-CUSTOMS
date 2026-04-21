"use client";

import { create } from "zustand";

type UiState = {
  loaderShown: boolean;
  soundOn: boolean;
  setLoaderShown: (v: boolean) => void;
  toggleSound: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  loaderShown: false,
  soundOn: false,
  setLoaderShown: (loaderShown) => set({ loaderShown }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn }))
}));
