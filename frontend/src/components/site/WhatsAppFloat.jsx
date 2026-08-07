import { MessageCircle } from "lucide-react";
import { LINKS } from "@/data/site";

export const WhatsAppFloat = () => (
  <a
    href={LINKS.whatsapp}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Message QuincyFadez On WhatsApp"
    className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border border-white/15 bg-[#0b0b0b]/90 px-4 py-3 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/30 md:bottom-7 md:right-7"
  >
    <MessageCircle size={17} />
    <span className="font-mono text-[9px] uppercase tracking-[0.2em]">WhatsApp</span>
  </a>
);
