import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export const Label = ({ children, className = "", ...rest }) => (
  <span
    className={`font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 ${className}`}
    {...rest}
  >
    — {children}
  </span>
);

export const RevealText = ({ lines, className = "", delay = 0, italicIdx = [] }) => (
  <span className={`block ${className}`}>
    {lines.map((line, i) => (
      <span key={i} className="block overflow-hidden">
        <motion.span
          className="block"
          initial={{ y: "115%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.05, ease: EASE, delay: delay + i * 0.12 }}
          style={{ willChange: "transform" }}
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

export const FadeIn = ({ children, delay = 0, y = 26, className = "", ...rest }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-12%" }}
    transition={{ duration: 0.9, ease: EASE, delay }}
    {...rest}
  >
    {children}
  </motion.div>
);

export const BookButton = ({
  children = "Book Your Appointment",
  className = "",
  testid,
  dark = false,
}) => (
  <a
    href="https://www.barbr.me/quincyfadez"
    target="_blank"
    rel="noopener noreferrer"
    data-testid={testid}
    className={`inline-flex items-center justify-center rounded-full px-7 py-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
      dark
        ? "border border-white/25 bg-transparent text-white hover:border-white hover:bg-white hover:text-black"
        : "bg-white text-black hover:-translate-y-0.5 hover:bg-zinc-200"
    } ${className}`}
  >
    {children}
  </a>
);
