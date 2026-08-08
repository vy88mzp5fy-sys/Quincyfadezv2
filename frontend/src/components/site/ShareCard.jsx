import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Share2, Copy, Check, Instagram, MessageCircle, Twitter, Facebook } from "lucide-react";
import { Label } from "@/components/site/primitives";
import { LINKS } from "@/data/site";

const SHARE_TEXT =
  "QuincyFadez — premium barbering in Oxford. Skin fades, tapers, scissor cuts and beard work. Book your cut:";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qf-gold)]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export const ShareCard = () => {
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/` : "";
  const enc = encodeURIComponent;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QuincyFadez — Barber · Oxford",
          text: SHARE_TEXT,
          url,
        });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    copyLink();
  };

  const channels = [
    {
      key: "whatsapp",
      Icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${SHARE_TEXT} ${url}`)}`,
      aria: "Share QuincyFadez on WhatsApp",
    },
    {
      key: "twitter",
      Icon: Twitter,
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(SHARE_TEXT)}&url=${enc(url)}`,
      aria: "Share QuincyFadez on X",
    },
    {
      key: "facebook",
      Icon: Facebook,
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      aria: "Share QuincyFadez on Facebook",
    },
    {
      key: "instagram",
      Icon: Instagram,
      label: "Instagram",
      href: LINKS.instagram,
      aria: "Open QuincyFadez on Instagram",
    },
  ];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      data-testid="share-card"
      className="qf-glass relative overflow-hidden rounded-[1.5rem] p-5 sm:rounded-[1.75rem] sm:p-8 md:p-10"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[rgba(111,156,255,0.10)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-[rgba(166,124,255,0.08)] blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Label className="text-[var(--qf-gold)]">Share QuincyFadez</Label>
          <h3 className="mt-4 max-w-md font-serif text-[clamp(1.65rem,7vw,2.25rem)] leading-tight tracking-tight text-white">
            Know Someone Who Needs A Fresh Cut?
          </h3>
          <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-zinc-400">
            Send Them The Site In A Tap — Booking, Prices And Recent Work Are All Here.
          </p>
        </div>

        <button
          type="button"
          onClick={nativeShare}
          data-testid="share-native-btn"
          aria-label="Share QuincyFadez"
          className={`qf-gold-button inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.2em] sm:w-auto ${focusRing}`}
        >
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
          Share
        </button>
      </div>

      <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        {channels.map(({ key, Icon, label, href, aria }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${aria} (opens in a new tab)`}
            data-testid={`share-${key}`}
            className={`group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-white/10 bg-black/20 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:border-[rgba(214,189,122,0.45)] hover:text-white motion-safe:hover:-translate-y-0.5 sm:px-5 ${focusRing}`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </a>
        ))}

        <button
          type="button"
          onClick={copyLink}
          data-testid="share-copy-btn"
          aria-label={copied ? "QuincyFadez link copied" : "Copy QuincyFadez website link"}
          className={`col-span-2 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-white/10 bg-black/20 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:border-[rgba(214,189,122,0.45)] hover:text-white motion-safe:hover:-translate-y-0.5 sm:col-auto ${focusRing}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={1.5} />
          )}
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>

      <span className="sr-only" aria-live="polite">
        {copied ? "QuincyFadez website link copied to clipboard." : ""}
      </span>
    </motion.div>
  );
};
