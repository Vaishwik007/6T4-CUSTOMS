"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Clock } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";

type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  price: number;
  cost_price: number;
  stock: number;
  low_stock_threshold: number;
  images: string[];
  compatibility: unknown;
  active: boolean;
};
type HistoryRow = {
  id: string;
  change: number;
  new_stock: number;
  reason: string;
  created_at: string;
};

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) {
          setNotFound(true);
          return;
        }
        setProduct(d.product);
        setHistory(d.history ?? []);
      });
  }, [params.id]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inventory"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/60 hover:text-neon"
      >
        <ChevronLeft className="h-3 w-3" /> Inventory
      </Link>
      {notFound && <div className="text-bone/60">Product not found.</div>}
      {product && (
        <>
          <header>
            <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">Edit</p>
            <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">
              SKU {product.sku}
            </p>
          </header>
          <ProductForm
            mode="edit"
            initial={{ ...product, description: product.description ?? "" }}
          />

          <div className="neon-edge relative border border-white/5 bg-carbon p-6">
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-neon" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-neon" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-neon" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-neon" />
            <h3 className="mb-4 inline-flex items-center gap-2 text-display text-xs uppercase tracking-[0.3em] text-neon">
              <Clock className="h-4 w-4" /> Stock History
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-bone/40">No stock changes recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.3em] text-bone/50">
                  <tr>
                    <th className="py-2">When</th>
                    <th className="py-2">Reason</th>
                    <th className="py-2 text-right">Change</th>
                    <th className="py-2 text-right">New stock</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t border-white/5">
                      <td className="py-2 text-[11px] text-bone/60">
                        {new Date(h.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 text-xs uppercase tracking-[0.2em]">{h.reason}</td>
                      <td
                        className={`py-2 text-right text-stencil ${
                          h.change > 0 ? "text-green-400" : "text-neon"
                        }`}
                      >
                        {h.change > 0 ? "+" : ""}
                        {h.change}
                      </td>
                      <td className="py-2 text-right text-stencil text-bone">{h.new_stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
