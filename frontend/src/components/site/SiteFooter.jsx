import { motion, useReducedMotion } from "framer-motion";
import { Instagram, MessageCircle, ArrowUpRight } from "lucide-react";
import { BookButton, Label } from "@/components/site/primitives";
import { ShareCard } from "@/components/site/ShareCard";
import { LINKS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

export const SiteFooter = () => {
  const reduceMotion = useReducedMotion();

  const reveal = (y, delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: reduceMotion ? undefined : { duration: 0.8, ease: EASE, delay },
  });

  return (
    <footer
      data-testid="site-footer"
      className="relative overflow-hidden border-t border-white/10 bg-black"
    >
      <div className="pointer-events-none absolute left-[8%] top-16 h-72 w-72 rounded-full bg-blue-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 right-[5%] h-72 w-72 rounded-full bg-violet-500/10 blur-[110px]" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-6 md:px-10 md:py-40">
        <Label>Ready When You Are</Label>

        <motion.h2
          {...reveal(30)}
          className="mt-8 max-w-6xl font-serif text-[clamp(3.2rem,15vw,7rem)] leading-[0.86] tracking-[-0.055em] text-white md:text-[9vw]"
        >
          Ready For Your <span className="italic text-[var(--qf-gold-soft)]">Next Cut?</span>
        </motion.h2>

        <motion.p
          {...reveal(18, 0.12)}
          className="mt-7 max-w-xl text-sm font-light leading-7 text-zinc-400 md:mt-8 md:text-base"
        >
          Book Your Appointment, Message On WhatsApp Or Take A Look At The Latest Work On Instagram.
        </motion.p>

        <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap sm:items-center md:mt-10">
          <BookButton className="w-full sm:w-auto" testid="footer-book-btn" />
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message QuincyFadez on WhatsApp (opens in a new tab)"
            data-testid="footer-whatsapp-btn"
            className="qf-glass inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            WhatsApp
          </a>
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View QuincyFadez on Instagram (opens in a new tab)"
            data-testid="footer-instagram-btn"
            className="qf-glass inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
          >
            <Instagram className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Instagram
          </a>
        </div>

        <div className="mt-14 md:mt-16">
          <ShareCard />
        </div>

        <div className="mt-14 grid gap-8 border-t border-white/10 pt-10 md:mt-16 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <a
              href="#top"
              aria-label="Back to top"
              className="brand-logo-link inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/80 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              <span className="brand-metal font-['Anton'] text-4xl uppercase tracking-tight md:text-6xl">
                QuincyFadez
              </span>
              <span className="brand-dot ml-2.5 h-2 w-2 rounded-full bg-[var(--qf-gold)]" />
            </a>
            <p className="mt-4 max-w-sm text-sm font-light leading-7 text-zinc-500">
              Precision Barbering In Oxford. Built Around Detail, Consistency And Confidence.
            </p>
          </div>

          <a
            href={LINKS.directions}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get directions to ${LINKS.address} (opens in a new tab)`}
            className="group inline-flex w-fit items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/80 focus-visible:ring-offset-4 focus-visible:ring-offset-black md:text-right"
          >
            <div>
              <p className="text-sm text-white">{LINKS.address}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                Oxford · Get Directions
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-all duration-300 group-hover:border-[var(--qf-gold)]/40 group-hover:text-[var(--qf-gold-soft)]">
              <ArrowUpRight size={15} aria-hidden="true" />
            </span>
          </a>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 text-[10px] text-zinc-600 sm:flex-row sm:items-center md:mt-16 md:text-[11px]">
          <span className="font-mono uppercase tracking-[0.24em] md:tracking-[0.3em]">
            QuincyFadez © {new Date().getFullYear()}
          </span>
          <span className="font-light">Self-Taught · Cutting Since 2022</span>
        </div>
      </div>
    </footer>
  );
};
