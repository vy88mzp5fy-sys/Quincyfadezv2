import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Instagram, MessageCircle, Twitter, Facebook } from "lucide-react";
import { Label } from "@/components/site/primitives";
import { LINKS } from "@/data/site";

const SHARE_TEXT = "QuincyFadez — premium barbering in Oxford. Skin fades, tapers, scissor cuts and beard work. Book your cut:";

export const ShareCard = () => {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined" ? window.location.origin + "/" : "";
  const enc = encodeURIComponent;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* clipboard unavailable */
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
        /* cancelled */
      }
    }
    copyLink();
  };

  const channels = [
    {
      key: "whatsapp",
      Icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(SHARE_TEXT + " " + url)}`,
    },
    {
      key: "twitter",
      Icon: Twitter,
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(SHARE_TEXT)}&url=${enc(url)}`,
    },
    {
      key: "facebook",
      Icon: Facebook,
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      key: "instagram",
      Icon: Instagram,
      label: "Instagram",
      href: LINKS.instagram,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      data-testid="share-card"
      className="qf-glass relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8 md:p-10"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[rgba(111,156,255,0.10)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-[rgba(166,124,255,0.08)] blur-3xl" />

      <div className="relative flex items-start justify-between gap-6">
        <div>
          <Label className="text-[var(--qf-gold)]">Share QuincyFadez</Label>
          <h3 className="mt-4 max-w-md font-serif text-2xl tracking-tight text-white md:text-3xl">
            Know someone who needs a fresh cut?
          </h3>
          <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-zinc-400">
            Send them the site in a tap — booking, prices and recent work are all here.
          </p>
        </div>
        <button
          type="button"
          onClick={nativeShare}
          data-testid="share-native-btn"
          className="qf-gold-button hidden shrink-0 items-center gap-2 rounded-full px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.2em] sm:inline-flex"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
          Share
        </button>
      </div>

      <div className="relative mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        {channels.map(({ key, Icon, label, href }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`share-${key}`}
            className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-white/10 bg-black/20 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(214,189,122,0.45)] hover:text-white sm:px-5"
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </a>
        ))}

        <button
          type="button"
          onClick={copyLink}
          data-testid="share-copy-btn"
          className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-white/10 bg-black/20 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(214,189,122,0.45)] hover:text-white sm:col-auto"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={1.5} />
          )}
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>
    </motion.div>
  );
};
