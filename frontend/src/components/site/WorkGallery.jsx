import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import { Label, RevealText } from "@/components/site/primitives";
import { GALLERY, LINKS } from "@/data/site";

const ParallaxTile = ({ item, index, className }) => {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const dir = index % 2 === 0 ? 1 : -1;
  const y = useTransform(scrollYProgress, [0, 1], [`${24 * dir}px`, `${-24 * dir}px`]);

  const onEnter = () => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const onLeave = () => {
    const v = videoRef.current;
    if (v) v.pause();
  };

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      data-testid={`gallery-tile-${index}`}
      className={`group relative cursor-pointer overflow-hidden ${className}`}
    >
      <motion.div style={{ y, scale: 1.12 }} className="h-full w-full">
        <video
          ref={videoRef}
          poster={item.thumb}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`QuincyFadez cut ${index + 1}`}
          className="h-full w-full object-cover grayscale transition-[filter] duration-700 ease-out group-hover:grayscale-0"
        >
          <source src={item.video} type="video/mp4" />
        </video>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-black/20 transition-opacity duration-700 group-hover:opacity-0" />

      <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/30 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-0">
        <Play className="h-3.5 w-3.5 fill-white text-white" />
      </span>

      <span className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        Fig. 0{index + 1}
      </span>
    </div>
  );
};

export const WorkGallery = () => (
  <section
    id="work"
    data-testid="work-section"
    className="border-t border-zinc-900 bg-[#0A0A0A] py-28 md:py-40"
  >
    <div className="mx-auto max-w-[1400px] px-6 md:px-10">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Label>The Work</Label>
          <h2 className="mt-6 font-serif text-4xl leading-[0.95] tracking-tight text-white md:text-6xl">
            <RevealText lines={["Fresh Fades."]} italicIdx={[0]} />
          </h2>
          <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-zinc-500">
            Hover Any Cut To Watch It In Motion.
          </p>
        </div>
        <a
          href={LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="gallery-instagram-link"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:text-white"
        >
          See More On Instagram
          <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {GALLERY.map((item, i) => (
          <ParallaxTile key={i} item={item} index={i} className="aspect-square" />
        ))}
      </div>
    </div>
  </section>
);
