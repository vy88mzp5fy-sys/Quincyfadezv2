import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Label, RevealText } from "@/components/site/primitives";
import { SERVICES, LINKS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

export const ServicesMenu = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      data-testid="services-section"
      aria-labelledby="services-heading"
      className="relative mx-auto max-w-[1400px] overflow-hidden px-5 py-24 sm:py-28 md:px-10 md:py-40"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[#6f9cff]/[0.05] blur-[110px]" />

      <div className="mb-12 max-w-3xl md:mb-20">
        <Label className="text-[#d6bd7a]/80">Services</Label>
        <h2
          id="services-heading"
          className="mt-6 font-serif text-[clamp(2.8rem,13vw,4.5rem)] leading-[0.9] tracking-[-0.04em] text-white md:text-7xl"
        >
          <RevealText lines={["Simple. Sharp. Clear."]} italicIdx={[0]} />
        </h2>
        <p className="mt-5 max-w-xl text-sm font-light leading-7 text-zinc-400 md:text-[15px]">
          Choose Your Service, Pick A Time That Works, And Book In Seconds.
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-white/[0.025]" role="list" aria-label="Available Services">
        {SERVICES.map((service, index) => (
          <motion.a
            key={service.name}
            href={LINKS.booking}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            aria-label={`Book ${service.name}, ${service.price}, ${service.duration}. Opens Booking In A New Tab.`}
            data-testid={`service-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: reduceMotion ? 0 : 0.65, ease: EASE, delay: reduceMotion ? 0 : index * 0.06 }}
            className="group relative grid min-h-[9rem] gap-5 border-b border-white/[0.07] p-5 transition-colors duration-500 last:border-b-0 hover:bg-white/[0.04] active:bg-white/[0.05] focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/70 focus-visible:ring-inset sm:p-6 md:min-h-0 md:grid-cols-[1fr_auto] md:items-center md:p-8"
          >
            <span className="absolute inset-y-0 left-0 w-[2px] origin-bottom scale-y-0 bg-gradient-to-b from-[#6f9cff] via-[#d6bd7a] to-[#a67cff] transition-transform duration-500 group-hover:scale-y-100 group-focus-visible:scale-y-100" />

            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600">
                  0{index + 1}
                </span>
                <h3 className="font-serif text-2xl tracking-tight text-white transition-transform duration-500 md:text-3xl md:group-hover:translate-x-1 md:group-focus-visible:translate-x-1">
                  {service.name}
                </h3>
                <span className="rounded-full border border-white/[0.08] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                  {service.duration}
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm font-light leading-6 text-zinc-400 md:text-zinc-500">
                {service.desc}
              </p>
            </div>

            <div className="flex items-center justify-between gap-5 md:justify-end">
              <span className="font-serif text-3xl tracking-tight text-white md:text-4xl">
                {service.price}
              </span>
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition-all duration-300 group-hover:border-[#d6bd7a]/40 group-hover:bg-[#d6bd7a] group-hover:text-black group-focus-visible:border-[#d6bd7a]/40 group-focus-visible:bg-[#d6bd7a] group-focus-visible:text-black"
              >
                <ArrowUpRight size={16} />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};
