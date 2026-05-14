"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X, CornerDownLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/formatPrice";
import { track } from "@/lib/analytics/events";

type PartHit = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  inStock: boolean;
};

type ServiceHit = {
  slug: string;
  name: string;
  category: string;
  basePrice: number;
  priceLabel?: string;
};

type PostHit = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
};

type SearchResults = {
  parts: PartHit[];
  services: ServiceHit[];
  posts: PostHit[];
};

type FlatResult =
  | { kind: "part"; href: string; hit: PartHit }
  | { kind: "service"; href: string; hit: ServiceHit }
  | { kind: "post"; href: string; hit: PostHit };

const EMPTY_RESULTS: SearchResults = { parts: [], services: [], posts: [] };
const DEBOUNCE_MS = 150;

function flatten(results: SearchResults): FlatResult[] {
  const flat: FlatResult[] = [];
  for (const hit of results.parts) {
    flat.push({ kind: "part", href: `/parts/${hit.slug}`, hit });
  }
  for (const hit of results.services) {
    flat.push({ kind: "service", href: `/services/${hit.slug}`, hit });
  }
  for (const hit of results.posts) {
    flat.push({ kind: "post", href: `/journal/${hit.slug}`, hit });
  }
  return flat;
}

interface SearchOverlayProps {
  onClose: () => void;
}

/**
 * Full-screen Cmd+K search dialog.
 *
 * Behavior:
 * - Debounced GET /api/search?q=... at 150ms.
 * - Groups results into Parts / Services / Journal with up to 5–10 per group.
 * - Arrow keys move focus through flattened result list, Enter navigates,
 *   Escape closes.
 * - Fires `search` analytics event whenever a non-empty query resolves.
 * - Renders via portal to escape any transformed ancestor stacking contexts.
 */
export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Autofocus the input on mount.
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 16);
    return () => window.clearTimeout(id);
  }, []);

  // Debounce the query.
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  // Fetch when debounced query changes.
  useEffect(() => {
    if (debounced.length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, {
      signal: controller.signal,
      cache: "no-store"
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = (await res.json()) as SearchResults & { error?: string };
        if (json.error) throw new Error(json.error);
        setResults({
          parts: json.parts ?? [],
          services: json.services ?? [],
          posts: json.posts ?? []
        });
        track({
          name: "search",
          query: debounced,
          results_count:
            (json.parts?.length ?? 0) +
            (json.services?.length ?? 0) +
            (json.posts?.length ?? 0)
        });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        setResults(EMPTY_RESULTS);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [debounced]);

  const flat = useMemo(() => flatten(results), [results]);

  useEffect(() => {
    setActiveIndex(0);
  }, [flat.length]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (flat.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((idx) => (idx + 1) % flat.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((idx) => (idx - 1 + flat.length) % flat.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const target = flat[activeIndex];
        if (target) navigate(target.href);
      }
    },
    [activeIndex, close, flat, navigate]
  );

  if (!mounted) return null;

  const showEmpty = debounced.length >= 2 && !loading && flat.length === 0;
  const showHint = debounced.length < 2;

  // Compute flat indices per group so keyboard nav lines up with rendering.
  const partsStart = 0;
  const servicesStart = results.parts.length;
  const postsStart = servicesStart + results.services.length;

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search 6T4 Customs"
      className="fixed inset-0 z-[9999] flex items-start justify-center px-4 py-12 sm:py-20"
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={close}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="neon-edge relative z-10 w-full max-w-2xl border border-white/10 bg-carbon shadow-neon-lg">
        <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
        <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />

        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Search className="h-4 w-4 shrink-0 text-bone/50" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts, services, journal…"
            className="w-full bg-transparent text-bone outline-none placeholder:text-bone/30"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search query"
          />
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-bone/40" aria-hidden />
          ) : (
            <kbd className="hidden shrink-0 border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-bone/40 sm:inline-block">
              Esc
            </kbd>
          )}
          <button
            type="button"
            onClick={close}
            className="grid h-9 w-9 shrink-0 place-items-center border border-white/10 text-bone/60 hover:border-neon hover:text-neon sm:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={listRef} className="max-h-[70vh] overflow-y-auto">
          {showHint && (
            <p className="px-4 py-10 text-center text-xs uppercase tracking-[0.3em] text-bone/40">
              Type at least 2 characters
            </p>
          )}

          {showEmpty && (
            <p className="px-4 py-10 text-center text-xs uppercase tracking-[0.3em] text-bone/40">
              No matches for &ldquo;{debounced}&rdquo;
            </p>
          )}

          {results.parts.length > 0 && (
            <ResultGroup label="Parts">
              {results.parts.map((hit, i) => {
                const idx = partsStart + i;
                return (
                  <PartResultRow
                    key={hit.id}
                    hit={hit}
                    active={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onSelect={() => navigate(`/parts/${hit.slug}`)}
                  />
                );
              })}
            </ResultGroup>
          )}

          {results.services.length > 0 && (
            <ResultGroup label="Services">
              {results.services.map((hit, i) => {
                const idx = servicesStart + i;
                return (
                  <ServiceResultRow
                    key={hit.slug}
                    hit={hit}
                    active={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onSelect={() => navigate(`/services/${hit.slug}`)}
                  />
                );
              })}
            </ResultGroup>
          )}

          {results.posts.length > 0 && (
            <ResultGroup label="Journal">
              {results.posts.map((hit, i) => {
                const idx = postsStart + i;
                return (
                  <PostResultRow
                    key={hit.slug}
                    hit={hit}
                    active={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onSelect={() => navigate(`/journal/${hit.slug}`)}
                  />
                );
              })}
            </ResultGroup>
          )}
        </div>

        <div className="hidden items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-bone/40 sm:flex">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="border border-white/10 px-1.5">↑</kbd>
              <kbd className="border border-white/10 px-1.5">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border border-white/10 px-1.5">
                <CornerDownLeft className="h-3 w-3" aria-hidden />
              </kbd>
              Open
            </span>
          </div>
          <span>6T4 · Search</span>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

interface ResultGroupProps {
  label: string;
  children: React.ReactNode;
}

function ResultGroup({ label, children }: ResultGroupProps) {
  return (
    <section className="py-2">
      <h3 className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.4em] text-neon">
        {label}
      </h3>
      <ul role="listbox" aria-label={label}>
        {children}
      </ul>
    </section>
  );
}

interface PartRowProps {
  hit: PartHit;
  active: boolean;
  onMouseEnter: () => void;
  onSelect: () => void;
}

function PartResultRow({ hit, active, onMouseEnter, onSelect }: PartRowProps) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onMouseEnter={onMouseEnter}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
          active ? "bg-neon-900/40 text-bone" : "text-bone/80 hover:bg-white/5"
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-display text-sm uppercase">{hit.name}</span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
              {hit.id}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-bone/40">
            {hit.brand} · {hit.category}
            {!hit.inStock && <span className="ml-2 text-red-400">Out of stock</span>}
          </p>
        </div>
        <span className="shrink-0 text-stencil text-base text-neon">{formatPrice(hit.price)}</span>
      </button>
    </li>
  );
}

interface ServiceRowProps {
  hit: ServiceHit;
  active: boolean;
  onMouseEnter: () => void;
  onSelect: () => void;
}

function ServiceResultRow({ hit, active, onMouseEnter, onSelect }: ServiceRowProps) {
  const price = hit.priceLabel ?? (hit.basePrice > 0 ? formatPrice(hit.basePrice) : "Quote");
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onMouseEnter={onMouseEnter}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
          active ? "bg-neon-900/40 text-bone" : "text-bone/80 hover:bg-white/5"
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-display text-sm uppercase">{hit.name}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-bone/40">
            {hit.category}
          </p>
        </div>
        <span className="shrink-0 text-stencil text-base text-neon">{price}</span>
      </button>
    </li>
  );
}

interface PostRowProps {
  hit: PostHit;
  active: boolean;
  onMouseEnter: () => void;
  onSelect: () => void;
}

function PostResultRow({ hit, active, onMouseEnter, onSelect }: PostRowProps) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onMouseEnter={onMouseEnter}
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
          active ? "bg-neon-900/40 text-bone" : "text-bone/80 hover:bg-white/5"
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-display text-sm uppercase">{hit.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-bone/50">{hit.excerpt}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-neon/70">
            {hit.category}
          </p>
        </div>
      </button>
    </li>
  );
}
