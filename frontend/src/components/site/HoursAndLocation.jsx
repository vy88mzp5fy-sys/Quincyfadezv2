import { MapPin } from "lucide-react";
import { Label, RevealText, FadeIn } from "@/components/site/primitives";
import { OpeningCountdown } from "@/components/site/OpeningCountdown";
import { HOURS, LINKS } from "@/data/site";

const isOpenToday = (day) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: "Europe/London",
  }).format(new Date()) === day;

const MAP_EMBED =
  "https://www.google.com/maps?output=embed&ll=51.7402247,-1.2202434&z=16";

export const HoursAndLocation = () => (
  <section
    id="visit"
    data-testid="visit-section"
    aria-labelledby="visit-heading"
    className="relative overflow-hidden border-t border-white/10 bg-[#080808] py-24 sm:py-28 md:py-40"
  >
    <div className="pointer-events-none absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/5 blur-[110px]" />
    <div className="mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
        <div>
          <Label>Opening Hours</Label>
          <h2
            id="visit-heading"
            className="mt-6 font-serif text-[clamp(2.75rem,12vw,4rem)] leading-[0.92] tracking-tight text-white md:text-6xl"
          >
            <RevealText lines={["Plan Your", "Next Visit."]} italicIdx={[1]} />
          </h2>

          <div className="qf-glass mt-8 rounded-2xl p-5 md:p-6">
            <OpeningCountdown />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]" role="list" aria-label="Weekly Opening Hours">
            {HOURS.map((h, i) => {
              const open = isOpenToday(h.day);
              return (
                <FadeIn
                  key={h.day}
                  delay={i * 0.04}
                  role="listitem"
                  className={`flex items-center justify-between gap-4 px-5 py-5 md:px-6 ${
                    i !== 0 ? "border-t border-white/10" : ""
                  } ${open ? "bg-white/[0.035]" : ""}`}
                  data-testid={`hours-${h.day.toLowerCase()}`}
                >
                  <span
                    className={`min-w-0 font-serif text-lg sm:text-xl md:text-2xl ${
                      open ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {h.day}
                    {open && (
                      <span className="ml-2 inline-flex items-center gap-1.5 align-middle font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--qf-gold)] sm:ml-3 sm:text-[10px] sm:tracking-[0.2em]">
                        <span
                          className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--qf-gold)] motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                        Today
                      </span>
                    )}
                  </span>
                  <span
                    className={`shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.15em] ${
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
          <h2 className="mt-6 font-serif text-[clamp(2.75rem,12vw,4rem)] leading-[0.92] tracking-tight text-white md:text-6xl">
            <RevealText lines={["Easy To", "Find."]} italicIdx={[1]} />
          </h2>

          <FadeIn delay={0.15} className="mt-10 md:mt-12">
            <div className="group qf-glass relative overflow-hidden rounded-3xl" data-testid="map-card">
              <iframe
                title="Map To QuincyFadez At 8 Gillians Way, Oxford"
                src={MAP_EMBED}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0 opacity-75 grayscale transition-[opacity,filter] duration-700 motion-reduce:transition-none sm:h-80 md:h-[420px] lg:group-hover:opacity-90 lg:group-hover:grayscale-[35%]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="pointer-events-none absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-[var(--qf-gold)] backdrop-blur-md sm:left-5 sm:top-5">
                <MapPin size={18} aria-hidden="true" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-4 sm:bottom-5 sm:left-5 sm:right-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="pointer-events-none max-w-[18rem]">
                  <p className="font-serif text-lg leading-tight text-white sm:text-xl md:text-2xl">{LINKS.address}</p>
                  <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-400 sm:text-[9px] sm:tracking-[0.25em]">
                    Oxford · QuincyFadez
                  </p>
                </div>
                <a
                  href={LINKS.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Directions To QuincyFadez In Google Maps, Opens In A New Tab"
                  data-testid="map-link"
                  className="inline-flex min-h-11 w-fit items-center rounded-full border border-white/15 bg-black/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-md transition-all duration-300 hover:border-[var(--qf-gold)]/50 hover:text-[var(--qf-gold-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none"
                >
                  Get Directions ↗
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  </section>
);
