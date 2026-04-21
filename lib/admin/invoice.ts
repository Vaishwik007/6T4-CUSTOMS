"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DbOrder } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils/formatPrice";

type InvoiceLine = { name: string; qty: number; unit: number; total: number };

export function generateInvoicePdf({
  order,
  items
}: {
  order: DbOrder;
  items: InvoiceLine[];
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, w, 70, "F");
  doc.setFillColor(255, 0, 0);
  doc.rect(0, 70, w, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("6T4 / CUSTOMS", 40, 44);
  doc.setFontSize(9);
  doc.setTextColor(255, 0, 0);
  doc.text("BUILT DIFFERENT · TUNED BRUTAL", 40, 58);

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text("Invoice", w - 40, 30, { align: "right" });
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`INV-${order.booking_token}`, w - 40, 46, { align: "right" });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(new Date(order.created_at).toLocaleString(), w - 40, 60, { align: "right" });

  // Bill to
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 40, 110);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const addr = order.address as Record<string, string>;
  const toLines = [
    addr?.fullName ?? "—",
    addr?.email ?? "",
    addr?.phone ?? "",
    [addr?.address1, addr?.city, addr?.state, addr?.pin].filter(Boolean).join(", ")
  ].filter(Boolean);
  toLines.forEach((l, i) => doc.text(l, 40, 128 + i * 14));

  // Meta box
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("BOOKING TOKEN", w - 200, 110);
  doc.setFontSize(16);
  doc.setTextColor(255, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(order.booking_token, w - 200, 128);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Payment: ${order.payment_method.toUpperCase()}`, w - 200, 148);
  doc.text(`Delivery: ${order.delivery_mode.toUpperCase()}`, w - 200, 162);
  doc.text(`Status: ${order.status.toUpperCase()}`, w - 200, 176);

  // Items
  autoTable(doc, {
    startY: 210,
    head: [["Item", "Qty", "Unit", "Total"]],
    body: items.map((i) => [i.name, i.qty.toString(), formatPrice(i.unit), formatPrice(i.total)]),
    styles: { font: "helvetica", fontSize: 10, cellPadding: 8, textColor: [40, 40, 40] },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    theme: "plain",
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" }
    }
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 300;

  // Totals
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal", w - 200, finalY + 30);
  doc.setTextColor(0, 0, 0);
  doc.text(formatPrice(order.total), w - 40, finalY + 30, { align: "right" });

  doc.setDrawColor(255, 0, 0);
  doc.setLineWidth(1);
  doc.line(w - 200, finalY + 42, w - 40, finalY + 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("TOTAL", w - 200, finalY + 64);
  doc.setTextColor(255, 0, 0);
  doc.text(formatPrice(order.total), w - 40, finalY + 64, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Owner confirms on WhatsApp. Bring booking token for installation slot.", 40, 780);
  doc.text("6T4 Customs · Hyderabad, India", 40, 794);

  doc.save(`6T4-${order.booking_token}.pdf`);
}
