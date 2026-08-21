import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { FadeIn } from "@/components/site/primitives";

const LEAVE_REVIEW_URL = "https://g.page/r/CbQwl91s8_vqEBM/review";

const Stars = ({ rating, className = "" }) => {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

  return (
    <span
      className={`inline-flex gap-1 text-[#d6bd7a] ${className}`}
      aria-label={`${Number(rating || 0).toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true" className={index < rounded ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
};

export const GoogleReviews = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/google-reviews", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load Google reviews");
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const rating = data?.rating ? Number(data.rating).toFixed(1) : null;
  const reviewCount = Number(data?.reviewCount || 0);
  const reviews = Array.isArray(data?.reviews) ? data.reviews.filter((review) => review?.text) : [];
  const readReviewsUrl = data?.googleMapsUrl || LEAVE_REVIEW_URL;

  return (
    <section
      id="reviews"
      className="relative overflow-hidden border-y border-white/10 bg-[#080808] px-5 py-20 sm:px-8 md:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,189,122,0.10),transparent_42%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1180px]">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#d6bd7a] sm:text-[10px]">
            Google Reviews
          </p>
          <h2 className="mt-5 font-serif text-4xl leading-[0.95] text-white sm:text-5xl md:text-6xl">
            What Clients Are Saying.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Live ratings and genuine reviews pulled directly from the QuincyFadez Google Business Profile.
          </p>
        </FadeIn>

        <FadeIn
          delay={0.08}
          className="mx-auto mt-10 rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8 md:p-10"
        >
          {loading ? (
            <div className="py-8 text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                Loading Live Google Reviews…
              </p>
            </div>
          ) : failed || !data ? (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <p className="max-w-lg text-sm leading-7 text-zinc-400">
                Google reviews are temporarily unavailable here. You can still view the live QuincyFadez profile on Google.
              </p>
              <a
                href={readReviewsUrl}
                target="_blank"
                rel="noreferrer"
                className="qf-gold-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-mono text-[9px] uppercase tracking-[0.18em]"
              >
                View On Google
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-between gap-7 border-b border-white/10 pb-8 sm:flex-row">
                <div className="text-center sm:text-left">
                  <div className="flex items-end justify-center gap-3 sm:justify-start">
                    <span className="font-serif text-6xl leading-none text-white sm:text-7xl">{rating}</span>
                    <span className="pb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                      Out Of 5
                    </span>
                  </div>
                  <Stars rating={data.rating} className="mt-3 text-xl" />
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                    {reviewCount} Google {reviewCount === 1 ? "Review" : "Reviews"}
                  </p>
                </div>

                <div className="max-w-md text-center sm:text-right">
                  <p className="font-serif text-2xl leading-snug text-zinc-100 sm:text-3xl">
                    Rated By Real QuincyFadez Clients.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    These reviews come directly from Google and update automatically as new client feedback is published.
                  </p>
                </div>
              </div>

              {reviews.length > 0 && (
                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reviews.map((review) => (
                    <article
                      key={review.id || `${review.author?.name}-${review.publishedAt}`}
                      className="flex min-h-full flex-col rounded-[22px] border border-white/10 bg-black/25 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#d6bd7a]/35 hover:bg-white/[0.035] sm:p-6"
                    >
                      <div className="flex items-center gap-3">
                        {review.author?.photoUrl ? (
                          <img
                            src={review.author.photoUrl}
                            alt=""
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-full border border-white/10 object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 font-serif text-sm text-[#d6bd7a]"
                            aria-hidden="true"
                          >
                            {(review.author?.name || "G").charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {review.author?.profileUrl ? (
                            <a
                              href={review.author.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate text-sm font-medium text-white transition hover:text-[#ead79d]"
                            >
                              {review.author.name}
                            </a>
                          ) : (
                            <p className="truncate text-sm font-medium text-white">
                              {review.author?.name || "Google Reviewer"}
                            </p>
                          )}
                          <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">
                            Google · {review.relativeTime || "Verified Review"}
                          </p>
                        </div>
                      </div>

                      <Stars rating={review.rating} className="mt-5 text-sm" />

                      <p className="mt-4 flex-1 text-sm leading-6 text-zinc-300">
                        “{review.text}”
                      </p>

                      {review.sourceUrl && (
                        <a
                          href={review.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-5 inline-flex items-center gap-1.5 self-start font-mono text-[8px] uppercase tracking-[0.16em] text-[#d6bd7a] transition hover:text-[#f0dea8]"
                        >
                          View On Google
                          <ArrowUpRight size={12} aria-hidden="true" />
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-center md:justify-end">
                <a
                  href={readReviewsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d6bd7a]/45 px-6 font-mono text-[9px] uppercase tracking-[0.18em] text-[#f0dea8] transition hover:border-[#d6bd7a] hover:bg-[#d6bd7a]/10"
                >
                  Read All Google Reviews
                  <ArrowUpRight size={14} aria-hidden="true" />
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
            </>
          )}
        </FadeIn>
      </div>
    </section>
  );
};
