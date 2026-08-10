import { useEffect, useState } from "react";
import { FadeIn } from "@/components/site/primitives";

const LEAVE_REVIEW_URL = "https://g.page/r/CbQwl91s8_vqEBM/review";

export const GoogleReviews = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("/api/google-reviews", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (active && payload) setData(payload);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const rating = Number(data?.rating || 5).toFixed(1);
  const reviewCount = data?.reviewCount || 24;
  const readReviewsUrl = data?.googleMapsUrl || LEAVE_REVIEW_URL;

  return (
    <section id="reviews" className="relative overflow-hidden border-y border-white/10 bg-[#080808] px-5 py-20 sm:px-8 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,189,122,0.10),transparent_42%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1180px]">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#d6bd7a] sm:text-[10px]">
            Google Reviews
          </p>
          <h2 className="mt-5 font-serif text-4xl leading-[0.95] text-white sm:text-5xl md:text-6xl">
            Trusted By Clients In Oxford.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Real feedback from clients who have booked with QuincyFadez. See the latest rating on Google before booking your next cut.
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8 md:p-10">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <div className="flex items-end justify-center gap-3 md:justify-start">
                <span className="font-serif text-6xl leading-none text-white sm:text-7xl">{rating}</span>
                <span className="pb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Out Of 5</span>
              </div>
              <div className="mt-3 text-xl tracking-[0.22em] text-[#d6bd7a]" aria-label={`${rating} out of 5 stars`}>
                ★★★★★
              </div>
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                {reviewCount} Google Reviews
              </p>
            </div>

            <div className="max-w-md text-center md:text-right">
              <p className="font-serif text-2xl leading-snug text-zinc-100 sm:text-3xl">
                Clean Cuts. Sharp Detail. Genuine Client Feedback.
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Written reviews will appear here automatically once the full Google Business Profile reviews connection is available.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-center md:justify-end">
            <a
              href={readReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d6bd7a]/45 px-6 font-mono text-[9px] uppercase tracking-[0.18em] text-[#f0dea8] transition hover:border-[#d6bd7a] hover:bg-[#d6bd7a]/10"
            >
              Read Google Reviews
            </a>
            <a
              href={LEAVE_REVIEW_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d6bd7a] px-6 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#ead79d]"
            >
              Leave A Review
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
