import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BookButton } from "@/components/site/primitives";
import { HERO_MEDIA } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

const SPECIALTIES = [
  "Skin Fades",
  "Tapers",
  "Scissor Cuts",
  "Beard Work",
  "Shape Ups",
  "Line Ups",
];

export const HeroSection = () => {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "7%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.01, 1.07]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
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
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#050505]"
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

        <div className="absolute inset-0 bg-black/24" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/34 via-black/8 to-[#050505]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.26),transparent_42%,rgba(5,5,5,0.08))]" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#050505] via-[#050505]/82 to-transparent" />
      </motion.div>

      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: fade }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col justify-end px-5 pb-16 pt-28 sm:px-7 md:px-10 md:pb-24 lg:px-12"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE, delay: 0.12 }}
          className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="max-w-xl text-[13px] font-light leading-6 text-zinc-100 sm:text-sm md:text-[15px] md:leading-7">
              Modern Cuts, Sharp Fades And Clean Beard Work — Crafted Around Your Style And Finished With Confidence.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-300 sm:gap-x-4 sm:text-[9px]">
              {SPECIALTIES.map((item, index) => (
                <span key={item} className="inline-flex items-center gap-3 sm:gap-4">
                  <span>{item}</span>
                  {index < SPECIALTIES.length - 1 && (
                    <span className="text-[var(--qf-gold)]" aria-hidden="true">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <BookButton
                className="qf-gold-button min-h-12 w-full px-8 sm:w-auto"
                testid="hero-book-btn"
              >
                Book Your Appointment
              </BookButton>
              <a
                href="#work"
                className="qf-glass inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-7 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
              >
                View My Work
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--qf-gold)] sm:text-[10px]">
              Bookings Only · No Walk-Ins
            </p>
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
