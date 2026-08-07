import { ArrowUpRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { LINKS } from "@/data/site";
import { Label } from "@/components/site/primitives";

export const BookingCTA = () => (
  <section className="relative overflow-hidden border-y border-white/10 bg-[#0A0A0A]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(255,255,255,0.08),transparent_35%)]" />
    <div className="relative mx-auto flex max-w-[1400px] flex-col gap-10 px-5 py-24 md:flex-row md:items-end md:justify-between md:px-10 md:py-32">
      <div>
        <Label>Ready When You Are</Label>
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-7 max-w-3xl font-serif text-5xl leading-[0.9] tracking-tight text-white md:text-7xl"
        >
          Ready For Your
          <br />
          <span className="italic">Next Cut?</span>
        </motion.h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={LINKS.booking}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-200"
        >
          Book Your Appointment
          <ArrowUpRight size={14} />
        </a>
        <a
          href={LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
        >
          <MessageCircle size={14} />
          WhatsApp Me
        </a>
      </div>
    </div>
  </section>
);
