import { Label, RevealText, FadeIn, BookButton } from "@/components/site/primitives";
import { CHAPTERS } from "@/data/site";

export const AboutManifesto = () => (
  <section
    id="about"
    data-testid="about-section"
    aria-labelledby="about-heading"
    className="qf-ambient relative mx-auto max-w-[1400px] overflow-hidden px-5 py-24 sm:px-6 md:px-10 md:py-40"
  >
    <div className="grid gap-14 md:grid-cols-[0.9fr_1.4fr] md:gap-24">
      <div className="md:sticky md:top-32 md:self-start">
        <Label data-testid="about-label">About QuincyFadez</Label>
        <h2
          id="about-heading"
          className="mt-7 max-w-md font-serif text-[clamp(2.75rem,13vw,4rem)] leading-[0.92] tracking-[-0.035em] text-white md:mt-8 md:text-6xl"
        >
          <RevealText lines={["Built Around", "The Details."]} italicIdx={[1]} />
        </h2>
        <FadeIn delay={0.2}>
          <p className="mt-7 max-w-md text-[15px] font-light leading-7 text-zinc-400 md:mt-8 md:max-w-sm">
            Every Appointment Is Focused On Precision, Consistency And Making Sure You Leave Feeling Sharp.
          </p>
          <div className="mt-7 md:mt-8">
            <BookButton
              className="qf-gold-button w-full sm:w-auto"
              testid="about-book-btn"
            >
              Book Your Appointment
            </BookButton>
          </div>
        </FadeIn>
      </div>

      <div className="flex flex-col">
        {CHAPTERS.map((c, i) => (
          <FadeIn
            key={c.no}
            delay={i * 0.08}
            data-testid={`chapter-${c.no}`}
            className={`group grid grid-cols-[2.25rem_1fr] gap-4 py-8 sm:grid-cols-[auto_1fr] sm:gap-6 md:gap-10 md:py-10 ${
              i !== 0 ? "border-t border-white/10" : ""
            }`}
          >
            <span className="pt-1 font-mono text-[10px] tracking-[0.2em] text-[var(--qf-gold)]/70 md:text-xs">
              {c.no}
            </span>
            <div>
              <h3 className="font-serif text-2xl leading-tight tracking-[-0.02em] text-white transition-transform duration-500 motion-safe:md:group-hover:translate-x-1 md:text-3xl">
                {c.title}
              </h3>
              <p className="mt-3 max-w-xl text-[15px] font-light leading-7 text-zinc-400 md:mt-4 md:text-base md:leading-relaxed">
                {c.body}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);
