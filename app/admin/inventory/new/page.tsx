import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/inventory"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/60 hover:text-neon"
      >
        <ChevronLeft className="h-3 w-3" /> Inventory
      </Link>
      <header>
        <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">New</p>
        <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">Add Product</h1>
      </header>
      <ProductForm mode="create" />
    </div>
  );
}
