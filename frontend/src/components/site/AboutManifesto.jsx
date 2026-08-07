import { Label, RevealText, FadeIn, BookButton } from "@/components/site/primitives";
import { CHAPTERS } from "@/data/site";

export const AboutManifesto = () => (
  <section
    id="about"
    data-testid="about-section"
    className="qf-ambient relative mx-auto max-w-[1400px] overflow-hidden px-6 py-28 md:px-10 md:py-40"
  >
    <div className="grid gap-16 md:grid-cols-[0.9fr_1.4fr] md:gap-24">
      <div className="md:sticky md:top-32 md:self-start">
        <Label data-testid="about-label">About QuincyFadez</Label>
        <h2 className="mt-8 max-w-md font-serif text-4xl leading-[0.92] tracking-tight text-white md:text-6xl">
          <RevealText lines={["Built Around", "The Details."]} italicIdx={[1]} />
        </h2>
        <FadeIn delay={0.2}>
          <p className="mt-8 max-w-sm text-sm font-light leading-relaxed text-zinc-400 md:text-[15px]">
            Every Appointment Is Focused On Precision, Consistency And Making Sure You Leave Feeling Sharp.
          </p>
          <div className="mt-8">
            <BookButton className="qf-gold-button" testid="about-book-btn">
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
            className={`group grid grid-cols-[auto_1fr] gap-6 py-10 md:gap-10 ${
              i !== 0 ? "border-t border-white/10" : ""
            }`}
          >
            <span className="font-mono text-xs text-[var(--qf-gold)]/70">{c.no}</span>
            <div>
              <h3 className="font-serif text-2xl tracking-tight text-white transition-transform duration-500 group-hover:translate-x-1 md:text-3xl">
                {c.title}
              </h3>
              <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-zinc-400">
                {c.body}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);
