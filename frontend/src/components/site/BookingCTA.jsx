import { ArrowUpRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { LINKS } from "@/data/site";
import { Label } from "@/components/site/primitives";

const EASE = [0.16, 1, 0.3, 1];

export const BookingCTA = () => (
  <section className="qf-ambient relative overflow-hidden border-y border-white/10 bg-[#080808]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_46%,rgba(111,156,255,0.13),transparent_30%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_90%,rgba(214,189,122,0.08),transparent_30%)]" />

    <div className="relative mx-auto flex max-w-[1400px] flex-col gap-10 px-5 py-24 sm:px-6 md:flex-row md:items-end md:justify-between md:px-10 md:py-36">
      <div className="max-w-3xl">
        <Label>Ready When You Are</Label>
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
          className="mt-6 max-w-lg text-sm font-light leading-relaxed text-zinc-400 md:text-[15px]"
        >
          Choose Your Service, Pick A Time That Works For You, And Secure Your Appointment In Just A Few Taps.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.18 }}
        className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:justify-end"
      >
        <a
          href={LINKS.booking}
          target="_blank"
          rel="noopener noreferrer"
          className="qf-gold-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6bd7a]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Book Your Appointment
          <ArrowUpRight size={14} />
        </a>
        <a
          href={LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="qf-glass inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <MessageCircle size={14} />
          WhatsApp Me
        </a>
      </motion.div>
    </div>
  </section>
);
