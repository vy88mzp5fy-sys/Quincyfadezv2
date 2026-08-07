import { FadeIn } from "@/components/site/primitives";

const ITEMS = [
  ["Precision Fades", "Clean, Sharp Finishes"],
  ["Premium Service", "Personal Attention"],
  ["Oxford Barber", "8 Gillians Way"],
  ["Easy Booking", "Book In A Few Taps"],
];

export const TrustStrip = () => (
  <section
    className="border-y border-white/10 bg-[linear-gradient(180deg,#080808_0%,#0b0b0b_100%)]"
    aria-label="QuincyFadez Highlights"
  >
    <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4">
      {ITEMS.map(([title, detail], i) => (
        <FadeIn
          key={title}
          delay={i * 0.05}
          className={`group relative px-5 py-7 sm:px-6 md:px-8 md:py-9 ${
            i > 1 ? "border-t border-white/10 md:border-t-0" : "border-t border-transparent"
          } ${i % 2 === 1 ? "border-l border-white/10" : ""} md:border-l md:border-white/10 ${
            i === 0 ? "md:border-l-0" : ""
          }`}
        >
          <span className="absolute left-5 top-0 h-px w-0 bg-gradient-to-r from-[#d6bd7a] to-[#6f9cff] transition-all duration-500 group-hover:w-14 sm:left-6 md:left-8" />
          <p className="font-serif text-base leading-tight text-white transition-colors duration-300 group-hover:text-[#f0dea8] sm:text-lg md:text-xl">
            {title}
          </p>
          <p className="mt-2 max-w-[11rem] font-mono text-[8px] uppercase leading-relaxed tracking-[0.16em] text-zinc-600 transition-colors duration-300 group-hover:text-zinc-400 sm:text-[9px] sm:tracking-[0.18em]">
            {detail}
          </p>
        </FadeIn>
      ))}
    </div>
  </section>
);
