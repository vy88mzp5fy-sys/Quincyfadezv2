import { MapPin } from "lucide-react";
import { Label, RevealText, FadeIn } from "@/components/site/primitives";
import { OpeningCountdown } from "@/components/site/OpeningCountdown";
import { HOURS, LINKS, MAP_IMG } from "@/data/site";

const isOpenToday = (day) =>
  new Date().toLocaleDateString("en-GB", { weekday: "long" }) === day;

export const HoursAndLocation = () => (
  <section
    id="visit"
    data-testid="visit-section"
    className="relative overflow-hidden border-t border-white/10 bg-[#080808] py-28 md:py-40"
  >
    <div className="pointer-events-none absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/5 blur-[110px]" />
    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <Label>Opening Hours</Label>
          <h2 className="mt-6 font-serif text-4xl leading-[0.95] tracking-tight text-white md:text-6xl">
            <RevealText lines={["Plan Your", "Next Visit."]} italicIdx={[1]} />
          </h2>

          <div className="mt-8 qf-glass rounded-2xl p-5 md:p-6">
            <OpeningCountdown />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            {HOURS.map((h, i) => {
              const open = isOpenToday(h.day);
              return (
                <FadeIn
                  key={h.day}
                  delay={i * 0.04}
                  className={`flex items-center justify-between px-5 py-5 md:px-6 ${
                    i !== 0 ? "border-t border-white/10" : ""
                  } ${open ? "bg-white/[0.035]" : ""}`}
                  data-testid={`hours-${h.day.toLowerCase()}`}
                >
                  <span
                    className={`font-serif text-xl md:text-2xl ${
                      open ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {h.day}
                    {open && (
                      <span className="ml-3 inline-flex items-center gap-1.5 align-middle font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--qf-gold)]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--qf-gold)]" />
                        Today
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-mono text-xs uppercase tracking-[0.15em] ${
                      h.time === "Closed" ? "text-zinc-600" : "text-zinc-300"
                    }`}
                  >
                    {h.time}
                  </span>
                </FadeIn>
              );
            })}
          </div>
        </div>

        <div>
          <Label>Find QuincyFadez</Label>
          <h2 className="mt-6 font-serif text-4xl leading-[0.95] tracking-tight text-white md:text-6xl">
            <RevealText lines={["Easy To", "Find."]} italicIdx={[1]} />
          </h2>

          <FadeIn delay={0.15} className="mt-12">
            <a
              href={LINKS.directions}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="map-link"
              className="group qf-glass relative block overflow-hidden rounded-3xl"
            >
              <img
                src={MAP_IMG}
                alt="Map to 8 Gillians Way, Oxford"
                className="h-80 w-full object-cover opacity-75 saturate-[0.85] transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:saturate-100 md:h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-[var(--qf-gold)] backdrop-blur-md">
                <MapPin size={18} />
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-serif text-xl text-white md:text-2xl">{LINKS.address}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400">
                    Oxford · QuincyFadez
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-black/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all duration-300 group-hover:border-[var(--qf-gold)]/50 group-hover:text-[var(--qf-gold-soft)]">
                  Get Directions ↗
                </span>
              </div>
            </a>
          </FadeIn>
        </div>
      </div>
    </div>
  </section>
);
