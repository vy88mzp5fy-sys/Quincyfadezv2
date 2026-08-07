import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HOURS } from "@/data/site";

const TIME_ZONE = "Europe/London";
const NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const londonFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function londonParts(date) {
  const parts = {};
  londonFormatter.formatToParts(date).forEach(({ type, value }) => {
    if (type !== "literal") parts[type] = value;
  });
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function londonLocalToInstant(year, month, day, hour, minute) {
  const desiredWallTime = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let instant = desiredWallTime;

  // Convert a Europe/London wall-clock time to the matching real instant.
  // Iterating handles both GMT and BST without hard-coding daylight-saving dates.
  for (let i = 0; i < 3; i += 1) {
    const p = londonParts(new Date(instant));
    const representedWallTime = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      0,
      0,
    );
    instant += desiredWallTime - representedWallTime;
  }

  return new Date(instant);
}

function computeStatus(now) {
  const byDay = Object.fromEntries(HOURS.map((h) => [h.day, h.time]));
  const current = londonParts(now);
  const currentDate = new Date(Date.UTC(current.year, current.month - 1, current.day));

  for (let offset = 0; offset < 8; offset += 1) {
    const calendarDate = new Date(currentDate);
    calendarDate.setUTCDate(currentDate.getUTCDate() + offset);

    const year = calendarDate.getUTCFullYear();
    const month = calendarDate.getUTCMonth() + 1;
    const day = calendarDate.getUTCDate();
    const dayName = NAMES[calendarDate.getUTCDay()];
    const hours = byDay[dayName];

    if (!hours || hours === "Closed") continue;

    const [openStr, closeStr] = hours.split("–").map((x) => x.trim());
    const [openHour, openMinute] = openStr.split(":").map(Number);
    const [closeHour, closeMinute] = closeStr.split(":").map(Number);
    const open = londonLocalToInstant(year, month, day, openHour, openMinute);
    const close = londonLocalToInstant(year, month, day, closeHour, closeMinute);

    if (offset === 0 && now >= open && now < close) {
      return { open: true, target: close, closeStr };
    }

    if (open > now) {
      const dayLabel = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : dayName;
      return { open: false, target: open, dayLabel, openStr };
    }
  }

  return null;
}

function breakdown(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  return {
    d: Math.floor(totalMinutes / 1440),
    h: Math.floor((totalMinutes % 1440) / 60),
    m: totalMinutes % 60,
  };
}

const Unit = ({ value, label }) => (
  <span className="flex items-baseline gap-1">
    <span className="font-mono text-xl tabular-nums text-white md:text-2xl">
      {String(value).padStart(2, "0")}
    </span>
    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
      {label}
    </span>
  </span>
);

export const OpeningCountdown = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const status = computeStatus(now);
  if (!status) return null;

  const { d, h, m } = breakdown(status.target - now);
  const units = [];
  if (d > 0) units.push({ value: d, label: "Days" });
  units.push({ value: h, label: "Hrs" });
  units.push({ value: m, label: "Min" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      data-testid="opening-countdown"
      className="qf-glass flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span
          className={`relative flex h-2.5 w-2.5 ${
            status.open ? "text-emerald-400" : "text-amber-300"
          }`}
          aria-hidden="true"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
        </span>
        <div className="leading-tight">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
            {status.open ? "Open Now" : `Opens ${status.dayLabel}`}
          </p>
          <p className="mt-1 font-serif text-lg text-white">
            {status.open ? `Until ${status.closeStr}` : `From ${status.openStr}`}
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-3 sm:gap-4"
        data-testid="countdown-timer"
        aria-label={`Time until ${status.open ? "closing" : "opening"}`}
      >
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-3 sm:gap-4">
            <Unit value={u.value} label={u.label} />
            {i < units.length - 1 && <span className="text-zinc-700" aria-hidden="true">:</span>}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
