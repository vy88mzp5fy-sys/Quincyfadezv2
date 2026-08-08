const WORDS = [
  "Skin Fades",
  "Tapers",
  "Scissor Cuts",
  "Beard Work",
  "Shape Ups",
  "Line Ups",
];

export const EditorialMarquee = () => (
  <section
    data-testid="marquee"
    className="relative overflow-hidden border-y border-white/10 bg-[#080808] py-6 sm:py-7 md:py-9"
    aria-hidden="true"
  >
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(111,156,255,0.06),transparent_30%,transparent_70%,rgba(166,124,255,0.06))]" />
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#080808] to-transparent sm:w-16 md:w-24" />
    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#080808] to-transparent sm:w-16 md:w-24" />

    <div className="marquee relative">
      <div className="marquee__track will-change-transform">
        {[...WORDS, ...WORDS, ...WORDS].map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="marquee__item font-serif italic tracking-[-0.03em]"
          >
            {w}
            <span className="mx-6 not-italic text-[var(--qf-gold)] opacity-65 sm:mx-8 md:mx-12">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  </section>
);
