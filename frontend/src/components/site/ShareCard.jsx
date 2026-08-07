import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Instagram, MessageCircle, Twitter, Facebook } from "lucide-react";
import { Label } from "@/components/site/primitives";
import { LINKS } from "@/data/site";

const SHARE_TEXT = "QuincyFadez — the best barber in Oxford. Skin fades, tapers & sharp beard work. Book your cut:";

export const ShareCard = () => {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined" ? window.location.origin + "/" : "";
  const enc = encodeURIComponent;

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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* ignore */
    }
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
      className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/70 to-black p-8 md:p-10"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <Label>Spread the word</Label>
          <h3 className="mt-4 max-w-sm font-serif text-2xl tracking-tight text-white md:text-3xl">
            Know someone who needs a fresh cut?
          </h3>
          <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-zinc-400">
            Share the chair. Send QuincyFadez to a mate in a tap.
          </p>
        </div>
        <button
          type="button"
          onClick={nativeShare}
          data-testid="share-native-btn"
          className="hidden shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-black transition-transform duration-300 hover:scale-[1.03] sm:inline-flex"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
          Share
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {channels.map(({ key, Icon, label, href }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`share-${key}`}
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300 transition-colors duration-300 hover:border-white hover:text-white"
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </a>
        ))}

        <button
          type="button"
          onClick={copyLink}
          data-testid="share-copy-btn"
          className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300 transition-colors duration-300 hover:border-white hover:text-white"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={1.5} />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </motion.div>
  );
};
