import { motion, useReducedMotion } from "framer-motion";
import { LINKS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1];

export const Label = ({ children, className = "", ...rest }) => (
  <span
    className={`font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 ${className}`}
    {...rest}
  >
    — {children}
  </span>
);

export const RevealText = ({ lines, className = "", delay = 0, italicIdx = [] }) => {
  const reduceMotion = useReducedMotion();

  return (
    <span className={`block ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={reduceMotion ? false : { y: "115%", opacity: 0.15 }}
            whileInView={reduceMotion ? undefined : { y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 1.02, ease: EASE, delay: delay + i * 0.1 }
            }
            style={reduceMotion ? undefined : { willChange: "transform, opacity" }}
          >
            {italicIdx.includes(i) ? (
              <span className="italic font-light">{line}</span>
            ) : (
              line
            )}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export const FadeIn = ({ children, delay = 0, y = 24, className = "", ...rest }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={reduceMotion ? undefined : { duration: 0.82, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const BookButton = ({
  children = "Book Your Appointment",
  className = "",
  testid,
  dark = false,
}) => (
  <a
    href={LINKS.booking}
    target="_blank"
    rel="noopener noreferrer"
    data-testid={testid}
    aria-label={`${children} — Opens Booking In A New Tab`}
    className={`group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full px-7 py-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6bd7a]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
      dark
        ? "border border-white/20 bg-white/[0.03] text-white backdrop-blur-md hover:-translate-y-0.5 hover:border-[#d6bd7a]/60 hover:bg-white/[0.07]"
        : "qf-gold-button"
    } ${className}`}
  >
    <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
      {children}
    </span>
  </a>
);
