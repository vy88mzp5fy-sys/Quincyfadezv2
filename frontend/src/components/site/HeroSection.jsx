import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { RevealText, BookButton } from "@/components/site/primitives";
import { HERO_MEDIA } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

export const HeroSection = () => {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    const syncPlayback = () => {
      if (document.hidden) {
        video.pause();
        return;
      }

      video.play().catch(() => {
        // Autoplay can be blocked by browser policy; the poster remains visible.
      });
    };

    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();

    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [reduceMotion]);

  return (
    <section
      id="top"
      ref={ref}
      data-testid="hero-section"
      className="qf-ambient relative min-h-[100svh] w-full overflow-hidden"
    >
      <motion.div
        style={reduceMotion ? undefined : { y: mediaY, scale: mediaScale }}
        className="absolute inset-0"
      >
        <video
          ref={videoRef}
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          disablePictureInPicture
          poster={HERO_MEDIA.thumb}
          preload="metadata"
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        >
          <source src={HERO_MEDIA.video} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/38" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/24 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(82,122,255,0.22),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(160,96,255,0.16),transparent_22%),radial-gradient(ellipse_at_center,transparent_18%,#050505_105%)] opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] to-transparent" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1.4, delay: 0.35 }}
        className="pointer-events-none absolute left-[8%] top-[18%] z-[5] h-56 w-56 rounded-full bg-blue-500/10 blur-3xl md:h-80 md:w-80"
      />
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1.4, delay: 0.55 }}
        className="pointer-events-none absolute right-[4%] top-[22%] z-[5] h-48 w-48 rounded-full bg-violet-500/10 blur-3xl md:h-72 md:w-72"
      />

      <motion.div
        style={reduceMotion ? undefined : { y: textY, opacity: fade }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-32 md:px-10 md:pb-24"
      >
        <h1 className="max-w-6xl font-serif text-[clamp(4.15rem,16.5vw,7.75rem)] leading-[0.82] tracking-[-0.06em] text-white md:text-[clamp(5.5rem,9.4vw,9.5rem)]">
          <RevealText
            lines={["Precision In", "Every Detail."]}
            italicIdx={[1]}
            delay={reduceMotion ? 0 : 0.12}
          />
        </h1>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.95, ease: EASE, delay: 0.72 }}
          className="mt-8 flex flex-col gap-7 md:mt-10 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-xl">
            <p className="text-sm font-light leading-relaxed text-zinc-200 md:text-[15px]">
              Modern Cuts, Sharp Fades And Clean Beard Work — Crafted Around Your Style And Finished With Confidence.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-400">
              <span>Skin Fades</span>
              <span className="qf-gold">•</span>
              <span>Tapers</span>
              <span className="qf-gold">•</span>
              <span>Scissor Work</span>
              <span className="qf-gold">•</span>
              <span>Beards</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <BookButton className="qf-gold-button w-full sm:w-auto" testid="hero-book-btn">
              Book Your Appointment
            </BookButton>
            <a
              href="#work"
              className="qf-glass inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
            >
              View My Work
              <ArrowDownRight size={14} aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#work"
        aria-label="Scroll To Work Gallery"
        style={reduceMotion ? undefined : { opacity: fade }}
        className="absolute bottom-7 left-10 z-10 hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/75 focus-visible:ring-offset-4 focus-visible:ring-offset-black md:flex"
      >
        Scroll To Explore
        <span className="h-px w-12 bg-gradient-to-r from-[var(--qf-gold)] to-transparent" aria-hidden="true" />
      </motion.a>
    </section>
  );
};
