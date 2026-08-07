import { Label, RevealText, FadeIn } from "@/components/site/primitives";
import { OpeningCountdown } from "@/components/site/OpeningCountdown";
import { HOURS, LINKS, MAP_IMG } from "@/data/site";

const isOpenToday = (day) =>
  new Date().toLocaleDateString("en-GB", { weekday: "long" }) === day;

export const HoursAndLocation = () => (
  <section
    id="visit"
    data-testid="visit-section"
    className="border-t border-zinc-900 bg-[#0A0A0A] py-28 md:py-40"
  >
    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Hours */}
        <div>
          <Label>Opening Hours</Label>
          <h2 className="mt-6 font-serif text-4xl leading-[0.95] tracking-tight text-white md:text-6xl">
            <RevealText lines={["Opening Hours."]} italicIdx={[0]} />
          </h2>

          <div className="mt-8">
            <OpeningCountdown />
          </div>

          <div className="mt-12">
            {HOURS.map((h, i) => {
              const open = isOpenToday(h.day);
              return (
                <FadeIn
                  key={h.day}
                  delay={i * 0.04}
                  className="flex items-center justify-between border-t border-zinc-900 py-5"
                  data-testid={`hours-${h.day.toLowerCase()}`}
                >
                  <span
                    className={`font-serif text-xl md:text-2xl ${
                      open ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {h.day}
                    {open && (
                      <span className="ml-3 inline-flex items-center gap-1.5 align-middle font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
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

        {/* Location */}
        <div>
          <Label>Find QuincyFadez</Label>
          <h2 className="mt-6 font-serif text-4xl leading-[0.95] tracking-tight text-white md:text-6xl">
            <RevealText lines={["The Location."]} italicIdx={[0]} />
          </h2>

          <FadeIn delay={0.15} className="mt-12">
            <a
              href={LINKS.directions}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="map-link"
              className="group relative block overflow-hidden rounded-2xl border border-zinc-800"
            >
              <img
                src={MAP_IMG}
                alt="Map to 8 Gillians Way, Oxford"
                className="h-72 w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100 md:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <p className="font-serif text-lg text-white md:text-xl">
                  {LINKS.address}
                </p>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
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
