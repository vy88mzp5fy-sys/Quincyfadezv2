import { motion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";
import { BookButton, Label } from "@/components/site/primitives";
import { ShareCard } from "@/components/site/ShareCard";
import { LINKS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

export const SiteFooter = () => (
  <footer
    data-testid="site-footer"
    className="relative overflow-hidden border-t border-zinc-900 bg-black"
  >
    <div className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
      <Label>Ready When You Are</Label>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
        className="mt-8 font-serif text-[13vw] leading-[0.85] tracking-tighter text-white md:text-[10vw]"
      >
        Sit in the <span className="italic">chair.</span>
      </motion.h2>

      <div className="mt-16">
        <ShareCard />
      </div>

      <div className="mt-16 flex flex-col gap-10 border-t border-zinc-900 pt-12 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <BookButton testid="footer-book-btn" />
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="footer-instagram-btn"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
          >
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
            Instagram
          </a>
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="footer-whatsapp-btn"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            WhatsApp
          </a>
        </div>

        <div className="text-sm font-light text-zinc-500">
          <p className="text-white">{LINKS.address}</p>
          <p className="mt-1">Barbershop · Oxford</p>
        </div>
      </div>

      <div className="mt-20 flex flex-col items-start justify-between gap-4 text-[11px] text-zinc-600 md:flex-row md:items-center">
        <span className="font-mono uppercase tracking-[0.3em]">
          QuincyFadez © {new Date().getFullYear()}
        </span>
        <span className="font-light">Self-taught · Cutting since 2022</span>
      </div>
    </div>
  </footer>
);
