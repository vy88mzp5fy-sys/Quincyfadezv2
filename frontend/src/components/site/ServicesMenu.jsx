import { motion } from "framer-motion";
import { Label, RevealText, FadeIn } from "@/components/site/primitives";
import { SERVICES, MEMBERSHIP, LINKS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

export const ServicesMenu = () => (
  <section
    id="services"
    data-testid="services-section"
    className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40"
  >
    <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
      {/* Menu */}
      <div>
        <Label>The Menu</Label>
        <h2 className="mt-6 font-serif text-4xl leading-[0.95] tracking-tight text-white md:text-6xl">
          <RevealText lines={["Services."]} italicIdx={[0]} />
        </h2>

        <div className="mt-14">
          {SERVICES.map((s, i) => (
            <motion.a
              key={s.name}
              href={LINKS.booking}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`service-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
              className="group grid grid-cols-[1fr_auto] items-baseline gap-4 border-t border-zinc-900 py-8"
            >
              <div>
                <div className="flex items-center gap-4">
                  <h3 className="font-serif text-2xl tracking-tight text-white transition-transform duration-500 group-hover:translate-x-2 md:text-3xl">
                    {s.name}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                    {s.duration}
                  </span>
                </div>
                <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-zinc-500">
                  {s.desc}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-serif text-2xl text-white md:text-3xl">
                  {s.price}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Book →
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Membership card */}
      <FadeIn className="lg:sticky lg:top-32 lg:self-start" delay={0.1}>
        <Label>Membership</Label>
        <div
          data-testid="membership-card"
          className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-black p-8 md:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif text-3xl italic tracking-tight text-white">
              {MEMBERSHIP.name}
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Club
            </span>
          </div>

          <div className="mt-8 flex items-end gap-1">
            <span className="font-serif text-6xl tracking-tighter text-white">
              {MEMBERSHIP.price}
            </span>
            <span className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              {MEMBERSHIP.cadence}
            </span>
          </div>

          <ul className="mt-8 space-y-4 border-t border-white/10 pt-8">
            {MEMBERSHIP.benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-sm font-light text-zinc-300"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white" />
                {b}
              </li>
            ))}
          </ul>

          <a
            href={LINKS.booking}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="membership-join-btn"
            className="mt-10 flex w-full items-center justify-center rounded-full bg-white py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-black transition-transform duration-300 hover:scale-[1.02]"
          >
            Join The Club
          </a>
        </div>
      </FadeIn>
    </div>
  </section>
);
