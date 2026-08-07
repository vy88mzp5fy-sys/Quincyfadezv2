import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { RevealText, BookButton } from "@/components/site/primitives";
import { GALLERY, LINKS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

export const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      <motion.div style={{ y: mediaY, scale: mediaScale }} className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={GALLERY[0].thumb}
          preload="metadata"
          aria-label="QuincyFadez Barbering Work"
          className="h-full w-full object-cover object-center"
        >
          <source src={GALLERY[0].video} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050505_105%)] opacity-80" />
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: fade }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-20 pt-32 md:px-10 md:pb-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="mb-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.35em] text-zinc-300/80 md:mb-8 md:text-[10px]"
        >
          <span className="h-px w-7 bg-white/60" />
          Premium Barbering In Oxford
        </motion.div>

        <h1 className="max-w-5xl font-serif text-[17vw] leading-[0.82] tracking-[-0.06em] text-white md:text-[10vw]">
          <RevealText
            lines={["Precision Cuts.", "Premium", "Experience."]}
            italicIdx={[2]}
            delay={0.25}
          />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 1.05 }}
          className="mt-9 flex flex-col gap-7 md:mt-10 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-sm font-light leading-relaxed text-zinc-300 md:text-[15px]">
            Skin Fades, Tapers, Scissor Cuts And Sharp Beard Work — Finished With
            Precision And Attention To Detail.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <BookButton testid="hero-book-btn">Book Your Appointment</BookButton>
            <a
              href="#work"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/20 px-7 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
            >
              View My Work
              <ArrowDownRight size={14} />
            </a>
          </div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#work"
        style={{ opacity: fade }}
        className="absolute bottom-7 left-5 z-10 hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400 md:flex"
      >
        Scroll To Explore
        <span className="h-px w-12 bg-white/30" />
      </motion.a>
    </section>
  );
};
