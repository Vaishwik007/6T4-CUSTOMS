import Link from "next/link";
import { Star, ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils/cn";
import { ReviewActions } from "./ReviewActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReviewStatus = "pending" | "published" | "rejected" | "flagged";

type ReviewRow = {
  id: string;
  product_id: string | null;
  service_id: string | null;
  order_id: string | null;
  author_name: string;
  bike: string | null;
  rating: number;
  title: string | null;
  content: string;
  images: string[];
  verified_purchase: boolean;
  status: ReviewStatus;
  helpful_count: number;
  created_at: string;
};

type Counts = Record<ReviewStatus, number>;

const TABS: { key: ReviewStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "flagged", label: "Flagged" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" }
];

function isReviewStatus(value: string | undefined): value is ReviewStatus {
  return value === "pending" || value === "published" || value === "rejected" || value === "flagged";
}

function isReviewsRelationMissing(err: { message?: string } | null | undefined): boolean {
  if (!err) return false;
  const msg = String(err.message ?? "");
  return msg.includes("relation") && msg.includes("reviews");
}

async function fetchReviewsData(status: ReviewStatus): Promise<{
  provisioning: boolean;
  reviews: ReviewRow[];
  counts: Counts;
}> {
  const empty: Counts = { pending: 0, flagged: 0, published: 0, rejected: 0 };
  const supa = createAdminSupabase();
  if (!supa) {
    return { provisioning: true, reviews: [], counts: empty };
  }

  const [pendingC, flaggedC, publishedC, rejectedC, list] = await Promise.all([
    supa.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supa.from("reviews").select("id", { count: "exact", head: true }).eq("status", "flagged"),
    supa.from("reviews").select("id", { count: "exact", head: true }).eq("status", "published"),
    supa.from("reviews").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supa
      .from("reviews")
      .select(
        "id, product_id, service_id, order_id, author_name, bike, rating, title, content, images, verified_purchase, status, helpful_count, created_at"
      )
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  if (
    isReviewsRelationMissing(pendingC.error) ||
    isReviewsRelationMissing(list.error)
  ) {
    return { provisioning: true, reviews: [], counts: empty };
  }

  const counts: Counts = {
    pending: pendingC.count ?? 0,
    flagged: flaggedC.count ?? 0,
    published: publishedC.count ?? 0,
    rejected: rejectedC.count ?? 0
  };

  return {
    provisioning: false,
    reviews: (list.data as ReviewRow[] | null) ?? [],
    counts
  };
}

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: { status?: string };
}) {
  const status: ReviewStatus = isReviewStatus(searchParams?.status)
    ? searchParams.status
    : "pending";

  const { provisioning, reviews, counts } = await fetchReviewsData(status);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-display text-[10px] uppercase tracking-[0.5em] text-neon">
            Reviews
          </p>
          <h1 className="mt-2 text-display text-3xl font-black uppercase md:text-5xl">
            Moderation Queue
          </h1>
        </div>
        <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-bone/60">
          <Clock className="h-3 w-3 text-neon" />
          {counts.pending} awaiting review
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2" aria-label="Review status">
        {TABS.map((t) => {
          const active = t.key === status;
          return (
            <Link
              key={t.key}
              href={`/admin/reviews?status=${t.key}`}
              className={cn(
                "inline-flex items-center gap-2 border px-3 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors",
                active
                  ? "border-neon bg-neon-900/20 text-neon shadow-neon"
                  : "border-white/10 text-bone/70 hover:border-neon/50 hover:text-bone"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "min-w-5 border px-1.5 text-center text-[10px]",
                  active ? "border-neon/60 text-neon" : "border-white/10 text-bone/50"
                )}
              >
                {counts[t.key]}
              </span>
            </Link>
          );
        })}
      </nav>

      {provisioning ? (
        <ProvisioningEmptyState />
      ) : reviews.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <div className="grid gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProvisioningEmptyState() {
  return (
    <div className="border border-yellow-500/40 bg-yellow-500/5 p-8">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 text-yellow-400" />
        <div>
          <p className="text-display text-xs uppercase tracking-[0.3em] text-yellow-400">
            Provisioning
          </p>
          <h2 className="mt-2 text-display text-xl font-bold uppercase text-bone">
            Review System Coming Online
          </h2>
          <p className="mt-3 max-w-prose text-sm text-bone/60">
            The reviews table is staged in migration 0004 but hasn&apos;t finished
            applying to the live database yet. Customer submissions are queued
            client-side and will surface here once provisioning completes.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ status }: { status: ReviewStatus }) {
  return (
    <div className="border border-white/10 bg-black/40 p-12 text-center">
      <p className="text-display text-[10px] uppercase tracking-[0.4em] text-bone/40">
        Nothing here
      </p>
      <p className="mt-3 text-sm text-bone/60">
        No {status} reviews right now.
      </p>
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewRow }) {
  return (
    <article className="border border-white/10 bg-black/40 p-5 transition-colors hover:border-neon/40 hover:shadow-neon-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center border border-neon/40 bg-neon-900/20 text-display text-sm font-bold text-neon"
            aria-hidden
          >
            {review.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-display text-sm font-bold uppercase text-bone">
              {review.author_name}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-bone/50">
              {review.bike && <span>{review.bike}</span>}
              {review.bike && <span aria-hidden>·</span>}
              <span>{new Date(review.created_at).toLocaleString()}</span>
              {review.verified_purchase && (
                <span className="inline-flex items-center gap-1 border border-green-500/40 px-1.5 py-0.5 text-green-400">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <StatusChip status={review.status} />
      </header>

      <div className="mt-4 flex items-center gap-1" aria-label={`Rating ${review.rating} of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < review.rating ? "fill-neon text-neon" : "text-bone/20"
            )}
          />
        ))}
      </div>

      {review.title && (
        <h3 className="mt-3 text-display text-base font-bold uppercase tracking-wide text-bone">
          {review.title}
        </h3>
      )}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-bone/80">
        {review.content}
      </p>

      <dl className="mt-4 grid gap-2 border-t border-white/5 pt-4 text-[10px] uppercase tracking-[0.25em] text-bone/50 md:grid-cols-3">
        {review.product_id && (
          <div>
            <dt className="text-bone/40">Product</dt>
            <dd className="mt-0.5 text-bone/80">{review.product_id}</dd>
          </div>
        )}
        {review.service_id && (
          <div>
            <dt className="text-bone/40">Service</dt>
            <dd className="mt-0.5 text-bone/80">{review.service_id}</dd>
          </div>
        )}
        {review.order_id && (
          <div>
            <dt className="text-bone/40">Order</dt>
            <dd className="mt-0.5 font-mono text-[10px] text-bone/80">
              {review.order_id.slice(0, 8)}…
            </dd>
          </div>
        )}
      </dl>

      <footer className="mt-5 border-t border-white/5 pt-4">
        <ReviewActions reviewId={review.id} currentStatus={review.status} />
      </footer>
    </article>
  );
}

function StatusChip({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={cn(
        "border px-2 py-1 text-[10px] uppercase tracking-[0.3em]",
        status === "pending" && "border-yellow-500/60 text-yellow-400",
        status === "flagged" && "border-red-700 text-red-400",
        status === "published" && "border-green-500/60 text-green-400",
        status === "rejected" && "border-white/20 text-bone/50"
      )}
    >
      {status}
    </span>
  );
}
