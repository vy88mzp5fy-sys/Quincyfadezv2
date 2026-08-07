import { FadeIn } from "@/components/site/primitives";

const ITEMS = [
  ["Precision Fades", "Clean, Sharp Finishes"],
  ["Premium Service", "Personal Attention"],
  ["Oxford Barber", "8 Gillians Way"],
  ["Easy Booking", "Book In A Few Taps"],
];

export const TrustStrip = () => (
  <section className="border-y border-white/10 bg-[#080808]" aria-label="QuincyFadez Highlights">
    <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4">
      {ITEMS.map(([title, detail], i) => (
        <FadeIn
          key={title}
          delay={i * 0.05}
          className={`px-5 py-7 md:px-8 md:py-9 ${i > 1 ? "border-t border-white/10 md:border-t-0" : "border-t border-transparent" } ${i % 2 === 1 ? "border-l border-white/10" : ""} md:border-l md:border-white/10 ${i === 0 ? "md:border-l-0" : ""}`}
        >
          <p className="font-serif text-lg text-white md:text-xl">{title}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">{detail}</p>
        </FadeIn>
      ))}
    </div>
  </section>
);
