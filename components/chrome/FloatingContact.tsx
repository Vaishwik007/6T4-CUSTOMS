"use client";
import { useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getWhatsAppLink, SITE_INFO } from "@/lib/data/site-info";

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const waLink = getWhatsAppLink("Hi 6T4 Customs — I'd like to enquire about your services.");

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {/* Expanded actions */}
      {open && (
        <div className="flex flex-col items-end gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 border border-neon bg-black px-4 py-3 text-display text-[10px] uppercase tracking-[0.2em] text-neon shadow-neon transition-all hover:bg-neon hover:text-black"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href={`tel:${SITE_INFO.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-3 border border-white/20 bg-black px-4 py-3 text-display text-[10px] uppercase tracking-[0.2em] text-bone shadow-lg transition-all hover:border-neon hover:text-neon"
            aria-label="Call the garage"
          >
            <Phone className="h-4 w-4" /> Call Now
          </a>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Open contact options"}
        className={cn(
          "grid h-14 w-14 place-items-center border border-neon shadow-neon transition-all duration-200 hover:shadow-neon-lg",
          open ? "bg-black text-neon" : "bg-neon text-black"
        )}
      >
        {open ? (
          <X className="h-5 w-5 text-neon" />
        ) : (
          <MessageCircle className="h-5 w-5 text-black" />
        )}
      </button>
    </div>
  );
}
