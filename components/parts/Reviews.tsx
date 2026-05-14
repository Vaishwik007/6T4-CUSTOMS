import Link from "next/link";
import { Star, ShieldCheck, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type PublishedReview = {
  id: string;
  author_name: string;
  bike: string | null;
  rating: number;
  title: string | null;
  content: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
};

type Props = {
  reviews: PublishedReview[];
  average: number;
  count: number;
  productName: string;
};

/**
 * Inline PDP reviews block. Server-rendered — receives pre-fetched published
 * reviews and pre-computed aggregate. When no reviews exist, renders a
 * "be the first" CTA pointing customers to their orders so they can leave one.
 */
export function Reviews({ reviews, average, count, productName }: Props) {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="mt-20 border-t border-white/10 pt-10"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.4em] text-neon">
            Owner Reviews
          </p>
          <h2
            id="reviews-heading"
            className="mt-2 text-display text-2xl font-bold uppercase text-bone md:text-3xl"
          >
            What the bay says
          </h2>
          {count > 0 ? (
            <div className="mt-3 flex items-center gap-3">
              <Stars value={average} ariaLabel={`Average rating ${average.toFixed(1)} of 5`} />
              <span className="text-stencil text-xl text-neon">{average.toFixed(1)}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-bone/50">
                {count} review{count === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="mt-3 max-w-prose text-sm text-bone/60">
              No verified reviews yet for {productName}. Be the first rider to
              break it in and report back.
            </p>
          )}
        </div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 border border-neon px-4 py-2 text-display text-[11px] uppercase tracking-[0.25em] text-neon transition-colors hover:bg-neon hover:text-black"
        >
          Write a review
        </Link>
      </header>

      {reviews.length > 0 && (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-bone/40">
        Reviews are moderated by 6T4 staff. Verified buyers carry a green badge.
      </p>
    </section>
  );
}

function ReviewItem({ review }: { review: PublishedReview }) {
  const initial = review.author_name.trim().charAt(0).toUpperCase() || "?";
  return (
    <li className="flex h-full flex-col border border-white/10 bg-carbon/60 p-5">
      <header className="flex items-start gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center border border-neon/40 bg-neon-900/20 text-display text-sm font-bold text-neon"
          aria-hidden
        >
          {initial}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-display text-sm font-bold uppercase text-bone">
              {review.author_name}
            </span>
            {review.verified_purchase && (
              <span className="inline-flex items-center gap-1 border border-green-500/40 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-green-400">
                <ShieldCheck className="h-3 w-3" /> Verified buyer
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/40">
            {review.bike && <span>{review.bike}</span>}
            {review.bike && <span aria-hidden>·</span>}
            <span>{new Date(review.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <div className="mt-3">
        <Stars
          value={review.rating}
          ariaLabel={`${review.rating} of 5 stars`}
        />
      </div>

      {review.title && (
        <h3 className="mt-3 text-display text-base font-bold uppercase tracking-wide text-bone">
          {review.title}
        </h3>
      )}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-bone/80">
        {review.content}
      </p>

      {review.helpful_count > 0 && (
        <footer className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 text-[10px] uppercase tracking-[0.3em] text-bone/50">
          <ThumbsUp className="h-3 w-3 text-neon" />
          {review.helpful_count} found this helpful
        </footer>
      )}
    </li>
  );
}

function Stars({ value, ariaLabel }: { value: number; ariaLabel: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={ariaLabel}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.round(value) ? "fill-neon text-neon" : "text-bone/20"
          )}
        />
      ))}
    </div>
  );
}
