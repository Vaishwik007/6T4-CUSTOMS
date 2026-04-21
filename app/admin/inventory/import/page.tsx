"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, Upload, CheckCircle2, AlertCircle, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";

const TEMPLATE = `sku,name,brand,category,price,costPrice,stock,lowStockThreshold,description,compatibility
AKRA-SO-UNIV,Akrapovic Slip-On Carbon,Akrapovic,Exhaust,89000,52000,10,3,Titanium slip-on,universal
SC-CRT-V2,SC-Project CR-T,SC-Project,Exhaust,72000,42000,5,2,MotoGP-derived carbon,universal
KN-FILTER,K&N High-Flow Filter,K&N,Air Filter,4800,2400,40,5,Lifetime warranty,universal
`;

export default function ImportPage() {
  const [csv, setCsv] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: { row: number; msg: string }[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const text = await file.text();
    setCsv(text);
  };

  const submit = async () => {
    setErr(null);
    setBusy(true);
    setResult(null);
    const res = await fetch("/api/admin/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv })
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) {
      setErr(data.error ?? "Import failed");
      return;
    }
    setResult({ inserted: data.inserted, skipped: data.skipped, errors: data.errors ?? [] });
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "6t4-products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inventory"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/60 hover:text-neon"
      >
        <ChevronLeft className="h-3 w-3" /> Inventory
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Bulk Import</p>
          <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">CSV Upload</h1>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 text-display text-[11px] uppercase tracking-[0.2em] text-bone/80 hover:border-neon hover:text-neon"
        >
          <Download className="h-4 w-4" /> Template
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div
            className="neon-edge relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 bg-carbon/50 p-10 text-center transition-colors hover:border-neon"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
          >
            <FileText className="mb-3 h-8 w-8 text-neon" />
            <p className="text-sm text-bone/70">Drag & drop CSV here</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 border border-neon/40 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-neon hover:bg-neon-900/20"
            >
              <Upload className="h-4 w-4" /> Choose file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          <textarea
            className="w-full min-h-[260px] border border-white/10 bg-black/40 p-3 font-mono text-xs text-bone outline-none focus:border-neon"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder="Paste CSV content here…"
          />

          <div className="flex gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={!csv.trim() || busy}
              className="inline-flex items-center gap-2 bg-neon px-6 py-3 text-display text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-white hover:shadow-neon-lg disabled:opacity-40"
            >
              {busy ? "Importing…" : "Run Import"}
            </motion.button>
            <button
              type="button"
              onClick={() => {
                setCsv("");
                setResult(null);
              }}
              className="border border-white/10 px-6 py-3 text-display text-xs uppercase tracking-[0.2em] text-bone/70 hover:border-neon hover:text-neon"
            >
              Clear
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="neon-edge relative border border-white/5 bg-carbon p-5">
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
            <p className="text-display text-[10px] uppercase tracking-[0.3em] text-neon">Headers</p>
            <ul className="mt-3 space-y-1 text-xs text-bone/70">
              {"sku,name,brand,category,price,costPrice,stock,lowStockThreshold,description,compatibility".split(",").map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-neon" /> {h}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-bone/40">
              `compatibility` is "universal" or a JSON array.
            </p>
          </div>

          {result && (
            <div className="neon-edge relative border border-white/5 bg-carbon p-5">
              <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
              <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
              <p className="inline-flex items-center gap-2 text-display text-xs uppercase tracking-[0.3em] text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Done
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <div>Inserted: <span className="text-stencil text-lg text-green-400">{result.inserted}</span></div>
                <div>Skipped: <span className="text-stencil text-lg text-yellow-400">{result.skipped}</span></div>
              </div>
              {result.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-[10px] uppercase tracking-[0.3em] text-neon">
                    Errors ({result.errors.length})
                  </summary>
                  <ul className="mt-2 max-h-40 overflow-auto text-[11px] text-bone/60">
                    {result.errors.map((e, i) => (
                      <li key={i}>Row {e.row}: {e.msg}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {err && (
            <div className="flex items-center gap-2 border border-neon/40 bg-neon-900/10 p-3 text-[11px] text-neon">
              <AlertCircle className="h-4 w-4" /> {err}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
