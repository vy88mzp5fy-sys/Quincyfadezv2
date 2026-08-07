import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { Label, RevealText, FadeIn } from "@/components/site/primitives";
import { SERVICES, MEMBERSHIP, LINKS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

export const ServicesMenu = () => (
  <section
    id="services"
    data-testid="services-section"
    className="relative mx-auto max-w-[1400px] overflow-hidden px-5 py-28 md:px-10 md:py-40"
  >
    <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[#6f9cff]/[0.05] blur-[110px]" />

    <div className="mb-14 max-w-3xl md:mb-20">
      <Label className="text-[#d6bd7a]/80">Services</Label>
      <h2 className="mt-6 font-serif text-5xl leading-[0.9] tracking-[-0.04em] text-white md:text-7xl">
        <RevealText lines={["Simple. Sharp. Clear."]} italicIdx={[0]} />
      </h2>
      <p className="mt-5 max-w-xl text-sm font-light leading-7 text-zinc-400 md:text-[15px]">
        Choose Your Service, Pick A Time That Works, And Book In Seconds.
      </p>
    </div>

    <div className="grid gap-10 lg:grid-cols-[1.45fr_0.85fr] lg:gap-12">
      <div className="overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-white/[0.025]">
        {SERVICES.map((service, index) => (
          <motion.a
            key={service.name}
            href={LINKS.booking}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`service-${index}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.65, ease: EASE, delay: index * 0.06 }}
            className="group relative grid gap-5 border-b border-white/[0.07] p-6 transition-colors duration-500 last:border-b-0 hover:bg-white/[0.04] md:grid-cols-[1fr_auto] md:items-center md:p-8"
          >
            <span className="absolute inset-y-0 left-0 w-[2px] origin-bottom scale-y-0 bg-gradient-to-b from-[#6f9cff] via-[#d6bd7a] to-[#a67cff] transition-transform duration-500 group-hover:scale-y-100" />

            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600">
                  0{index + 1}
                </span>
                <h3 className="font-serif text-2xl tracking-tight text-white transition-transform duration-500 group-hover:translate-x-1 md:text-3xl">
                  {service.name}
                </h3>
                <span className="rounded-full border border-white/[0.08] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                  {service.duration}
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm font-light leading-6 text-zinc-500">
                {service.desc}
              </p>
            </div>

            <div className="flex items-center justify-between gap-5 md:justify-end">
              <span className="font-serif text-3xl tracking-tight text-white md:text-4xl">
                {service.price}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition-all duration-300 group-hover:border-[#d6bd7a]/40 group-hover:bg-[#d6bd7a] group-hover:text-black">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      <FadeIn className="lg:sticky lg:top-28 lg:self-start" delay={0.08}>
        <Label className="text-[#d6bd7a]/80">Membership</Label>
        <div
          data-testid="membership-card"
          className="qf-glass relative mt-6 overflow-hidden rounded-[1.6rem] p-7 md:p-9"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#6f9cff]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[#a67cff]/10 blur-3xl" />

          <div className="relative">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#d6bd7a]">
              Monthly Plan
            </span>
            <h3 className="mt-4 max-w-sm font-serif text-3xl italic leading-tight tracking-tight text-white md:text-4xl">
              {MEMBERSHIP.name}
            </h3>

            <div className="mt-8 flex items-end gap-2 border-b border-white/[0.08] pb-8">
              <span className="font-serif text-6xl tracking-[-0.05em] text-white md:text-7xl">
                {MEMBERSHIP.price}
              </span>
              <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {MEMBERSHIP.cadence}
              </span>
            </div>

            <ul className="mt-7 space-y-4">
              {MEMBERSHIP.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm font-light leading-6 text-zinc-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d6bd7a]/30 bg-[#d6bd7a]/10 text-[#f1dda2]">
                    <Check size={11} strokeWidth={2.2} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            <a
              href={LINKS.booking}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="membership-join-btn"
              className="qf-gold-button mt-9 flex w-full items-center justify-center rounded-full py-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
            >
              View Membership
            </a>

            <p className="mt-4 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">
              Membership Details Available Through Booking
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  </section>
);
