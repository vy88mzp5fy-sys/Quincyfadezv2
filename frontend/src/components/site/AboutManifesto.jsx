import { Label, RevealText, FadeIn } from "@/components/site/primitives";
import { CHAPTERS } from "@/data/site";

export const AboutManifesto = () => (
  <section
    id="about"
    data-testid="about-section"
    className="relative mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40"
  >
    <div className="grid gap-16 md:grid-cols-[0.9fr_1.4fr] md:gap-24">
      <div className="md:sticky md:top-32 md:self-start">
        <Label data-testid="about-label">About QuincyFadez</Label>
        <h2 className="mt-8 font-serif text-4xl leading-[0.95] tracking-tight text-white md:text-6xl">
          <RevealText lines={["The", "barber."]} italicIdx={[1]} />
        </h2>
        <FadeIn delay={0.2}>
          <p className="mt-8 max-w-xs text-sm font-light leading-relaxed text-zinc-500">
            One Barber. One Obsession. Built One Fade At A Time.
          </p>
        </FadeIn>
      </div>

      <div className="flex flex-col">
        {CHAPTERS.map((c, i) => (
          <FadeIn
            key={c.no}
            delay={i * 0.08}
            data-testid={`chapter-${c.no}`}
            className={`grid grid-cols-[auto_1fr] gap-6 py-10 md:gap-10 ${
              i !== 0 ? "border-t border-zinc-900" : ""
            }`}
          >
            <span className="font-mono text-xs text-zinc-600">{c.no}</span>
            <div>
              <h3 className="font-serif text-2xl tracking-tight text-white md:text-3xl">
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
