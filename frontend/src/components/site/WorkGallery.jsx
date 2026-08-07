import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Instagram, Pause, Play } from "lucide-react";
import { Label, RevealText } from "@/components/site/primitives";
import { GALLERY, LINKS } from "@/data/site";

const STYLE_LABELS = [
  "Featured Cut",
  "Precision Fade",
  "Fresh Finish",
  "Clean Blend",
  "Sharp Detail",
  "QuincyFadez Finish",
];

const ParallaxTile = ({ item, index, className = "", featured = false }) => {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const dir = index % 2 === 0 ? 1 : -1;
  const y = useTransform(scrollYProgress, [0, 1], [`${18 * dir}px`, `${-18 * dir}px`]);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => setPlaying(true)).catch(() => {});
  };

  const pause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setPlaying(false);
  };

  const toggle = () => {
    if (playing) pause();
    else play();
  };

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.8, delay: Math.min(index * 0.05, 0.2) }}
      onMouseEnter={play}
      onMouseLeave={pause}
      onClick={toggle}
      data-testid={`gallery-tile-${index}`}
      className={`group relative cursor-pointer overflow-hidden rounded-[1.4rem] border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.28)] ${className}`}
    >
      <motion.div style={{ y, scale: featured ? 1.06 : 1.08 }} className="h-full w-full">
        <video
          ref={videoRef}
          poster={item.thumb}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`QuincyFadez Cut ${index + 1}`}
          className="h-full w-full object-cover saturate-[0.86] contrast-[1.04] transition-[filter,transform] duration-700 ease-out group-hover:saturate-110"
        >
          <source src={item.video} type="video/mp4" />
        </video>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/15" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-[radial-gradient(circle_at_80%_15%,rgba(111,156,255,0.18),transparent_28%),radial-gradient(circle_at_20%_85%,rgba(214,189,122,0.15),transparent_34%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 md:p-5">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/50">
            Work 0{index + 1}
          </span>
          <p className={`mt-1 font-serif text-white ${featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}>
            {STYLE_LABELS[index] || "QuincyFadez Cut"}
          </p>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition-all duration-300 group-hover:border-[#d6bd7a]/60 group-hover:bg-[#d6bd7a] group-hover:text-black">
          {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5 fill-current" />}
        </span>
      </div>
    </motion.article>
  );
};

export const WorkGallery = () => (
  <section
    id="work"
    data-testid="work-section"
    className="qf-ambient relative overflow-hidden border-t border-white/[0.06] bg-[#080808] py-28 md:py-40"
  >
    <div className="mx-auto max-w-[1400px] px-5 md:px-10">
      <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Label className="text-[#d6bd7a]/80">The Work</Label>
          <h2 className="mt-6 max-w-3xl font-serif text-5xl leading-[0.9] tracking-[-0.04em] text-white md:text-7xl">
            <RevealText lines={["See The Standard."]} italicIdx={[0]} />
          </h2>
          <p className="mt-5 max-w-lg text-sm font-light leading-7 text-zinc-400 md:text-[15px]">
            Real Cuts. Real Detail. Tap A Video Or Hover On Desktop To See The Finish In Motion.
          </p>
        </div>

        <a
          href={LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="gallery-instagram-link"
          className="qf-glass group inline-flex w-fit items-center gap-3 rounded-full px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d6bd7a]/40 hover:text-white"
        >
          <Instagram size={14} />
          View Instagram
          <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-5">
        {GALLERY.map((item, index) => {
          if (index === 0) {
            return (
              <ParallaxTile
                key={index}
                item={item}
                index={index}
                featured
                className="col-span-2 aspect-[4/5] md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[720px]"
              />
            );
          }

          return (
            <ParallaxTile
              key={index}
              item={item}
              index={index}
              className={`aspect-[4/5] md:col-span-5 ${index > 2 ? "md:col-span-4 md:aspect-square" : "md:min-h-[350px]"}`}
            />
          );
        })}
      </div>
    </div>
  </section>
);
