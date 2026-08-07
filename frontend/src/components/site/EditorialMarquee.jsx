const WORDS = [
  "Skin fades",
  "Tapers",
  "Scissor cuts",
  "Beard trims",
  "Shape ups",
  "Line ups",
];

export const EditorialMarquee = () => (
  <section
    data-testid="marquee"
    className="border-y border-zinc-900 bg-black py-8 md:py-10"
    aria-hidden="true"
  >
    <div className="marquee">
      <div className="marquee__track">
        {[...WORDS, ...WORDS, ...WORDS].map((w, i) => (
          <span key={i} className="marquee__item font-serif italic">
            {w}
            <span className="mx-8 not-italic text-zinc-700 md:mx-12">✦</span>
          </span>
        ))}
      </div>
    </div>
  </section>
);
