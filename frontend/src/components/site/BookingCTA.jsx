import { ArrowUpRight, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { LINKS } from "@/data/site";
import { Label } from "@/components/site/primitives";

const EASE = [0.16, 1, 0.3, 1];

export const BookingCTA = () => (
  <section className="qf-ambient relative overflow-hidden border-y border-white/10 bg-[#080808]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_46%,rgba(111,156,255,0.13),transparent_30%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_90%,rgba(214,189,122,0.08),transparent_30%)]" />

    <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 py-24 sm:px-6 md:grid-cols-[1.2fr_0.8fr] md:items-end md:px-10 md:py-36">
      <div className="max-w-3xl">
        <Label>Book Your Way</Label>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-7 font-serif text-[14vw] leading-[0.86] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Your Next Cut
          <br />
          <span className="italic text-[#e6cf91]">Starts Here.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
          className="mt-6 max-w-xl text-sm font-light leading-relaxed text-zinc-400 md:text-[15px]"
        >
          Book Online In Seconds, Or Open QuincyFadez In The Barbr App For An Easy Way To Book Again Whenever You Need Your Next Trim.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.18 }}
        className="grid w-full gap-3"
      >
        <a
          href={LINKS.booking}
          target="_blank"
          rel="noopener noreferrer"
          className="qf-gold-button group inline-flex min-h-14 items-center justify-between gap-4 rounded-2xl px-6 py-5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6bd7a]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span className="flex flex-col items-start gap-1 text-left">
            <span>Book Online</span>
            <span className="font-sans text-[11px] font-normal normal-case tracking-normal opacity-70">
              Continue Straight To QuincyFadez Booking
            </span>
          </span>
          <ArrowUpRight size={16} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <a
          href={LINKS.booking}
          target="_blank"
          rel="noopener noreferrer"
          className="qf-glass group inline-flex min-h-14 items-center justify-between gap-4 rounded-2xl px-6 py-5 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d6bd7a]/35 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6bd7a]/70"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d6bd7a]/25 bg-[#d6bd7a]/10 text-[#e6cf91]">
              <Smartphone size={18} />
            </span>
            <span className="flex flex-col items-start gap-1 text-left">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Download App To Book</span>
              <span className="font-sans text-[11px] font-normal text-zinc-400">
                Open QuincyFadez In Barbr
              </span>
            </span>
          </span>
          <ArrowUpRight size={16} className="shrink-0 text-[#e6cf91] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <p className="px-1 pt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-500">
          Both Options Take You To The Official QuincyFadez Barbr Page
        </p>
      </motion.div>
    </div>
  </section>
);
