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
    className="relative overflow-hidden border-y border-white/10 bg-[#080808] py-7 md:py-9"
    aria-hidden="true"
  >
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(111,156,255,0.05),transparent_28%,transparent_72%,rgba(166,124,255,0.05))]" />
    <div className="marquee relative">
      <div className="marquee__track">
        {[...WORDS, ...WORDS, ...WORDS].map((w, i) => (
          <span key={i} className="marquee__item font-serif italic tracking-[-0.03em]">
            {w}
            <span className="mx-8 not-italic text-[var(--qf-gold)] opacity-70 md:mx-12">✦</span>
          </span>
        ))}
      </div>
    </div>
  </section>
);
