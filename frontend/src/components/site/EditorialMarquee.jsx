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
    className="relative border-y border-white/10 bg-[#080808] px-5 py-5 sm:px-8 sm:py-6 md:px-10"
    aria-label="Barbering Specialties"
  >
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(111,156,255,0.035),transparent_28%,transparent_72%,rgba(166,124,255,0.035))]" />

    <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-x-7 md:justify-between md:gap-x-8">
      {WORDS.map((word, index) => (
        <div key={word} className="flex items-center gap-5 sm:gap-7 md:gap-8">
          <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400 sm:text-[10px]">
            {word}
          </span>
          {index < WORDS.length - 1 && (
            <span
              className="hidden h-1 w-1 rounded-full bg-[var(--qf-gold)] opacity-70 md:block"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  </section>
);
