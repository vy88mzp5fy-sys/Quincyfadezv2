import { MessageCircle } from "lucide-react";
import { LINKS } from "@/data/site";

export const WhatsAppFloat = () => (
  <a
    href={LINKS.whatsapp}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Message QuincyFadez On WhatsApp"
    className="fixed bottom-4 right-4 z-40 flex min-h-12 items-center gap-2.5 rounded-full border border-white/10 bg-black/75 px-4 py-3 text-white shadow-[0_16px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d6bd7a]/40 hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6bd7a]/70 md:bottom-7 md:right-7 md:px-5"
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d6bd7a] text-black shadow-[0_0_20px_rgba(214,189,122,0.25)]">
      <MessageCircle size={15} strokeWidth={1.9} />
    </span>
    <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] sm:inline">WhatsApp</span>
  </a>
);
