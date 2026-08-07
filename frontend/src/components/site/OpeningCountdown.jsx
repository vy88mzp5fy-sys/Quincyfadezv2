import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HOURS } from "@/data/site";

const NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function computeStatus(now) {
  const byDay = {};
  HOURS.forEach((h) => (byDay[h.day] = h.time));

  for (let offset = 0; offset < 8; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    const t = byDay[NAMES[d.getDay()]];
    if (!t || t === "Closed") continue;

    const [openStr, closeStr] = t.split("–").map((x) => x.trim());
    const [oh, om] = openStr.split(":").map(Number);
    const [ch, cm] = closeStr.split(":").map(Number);
    const open = new Date(d);
    open.setHours(oh, om, 0, 0);
    const close = new Date(d);
    close.setHours(ch, cm, 0, 0);

    if (offset === 0 && now >= open && now < close) {
      return { open: true, target: close, closeStr };
    }
    if (open > now) {
      const dayLabel =
        offset === 0 ? "today" : offset === 1 ? "tomorrow" : NAMES[d.getDay()];
      return { open: false, target: open, dayLabel, openStr };
    }
  }
  return null;
}

function breakdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const Unit = ({ value, label }) => (
  <span className="flex items-baseline gap-1">
    <span className="font-mono text-xl tabular-nums text-white md:text-2xl">
      {String(value).padStart(2, "0")}
    </span>
    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
      {label}
    </span>
  </span>
);

export const OpeningCountdown = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = computeStatus(now);
  if (!status) return null;

  const { d, h, m, s } = breakdown(status.target - now);
  const units = [];
  if (d > 0) units.push({ value: d, label: "days" });
  units.push({ value: h, label: "hrs" });
  units.push({ value: m, label: "min" });
  units.push({ value: s, label: "sec" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      data-testid="opening-countdown"
      className="flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-black/40 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <span
          className={`relative flex h-2.5 w-2.5 ${
            status.open ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
        </span>
        <div className="leading-tight">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400">
            {status.open ? "Open now" : `Opens ${status.dayLabel}`}
          </p>
          <p className="font-serif text-lg text-white">
            {status.open
              ? `Closes at ${status.closeStr}`
              : `Doors at ${status.openStr}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4" data-testid="countdown-timer">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-4">
            <Unit value={u.value} label={u.label} />
            {i < units.length - 1 && (
              <span className="text-zinc-700">:</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
