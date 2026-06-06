"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const SearchOverlay = dynamic(
  () => import("./SearchOverlay").then((m) => m.SearchOverlay),
  { ssr: false }
);

type SearchContextValue = {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Hosts the global Cmd+K / Ctrl+K search modal.
 *
 * Wraps children with a context so the Navbar (or anything else) can call
 * `useSearch().openSearch()` to surface the overlay. Binds Cmd/Ctrl+K at the
 * window level so the modal opens from any route. The actual overlay UI is
 * lazy-loaded so the search bundle doesn't ship on first paint.
 */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);
  const toggleSearch = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isK = event.key === "k" || event.key === "K";
      if (!isK) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      // Don't fight native browser shortcuts when focus is in another text-editor
      // surface that uses cmd+K (rare, but be polite).
      event.preventDefault();
      setOpen((o) => !o);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<SearchContextValue>(
    () => ({ open, openSearch, closeSearch, toggleSearch }),
    [open, openSearch, closeSearch, toggleSearch]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
      {open ? <SearchOverlay onClose={closeSearch} /> : null}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used inside <SearchProvider>");
  }
  return ctx;
}
