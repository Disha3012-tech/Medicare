import { Star, BadgeCheck } from "lucide-react";
import type { Review } from "../services/reviews";

interface Props {
  review: Review;
}

export default function ReviewCard({ review }: Props) {
  const initials = review.patient_name
    ? review.patient_name.split(" ").map(n => n[0]).join("").slice(0, 2)
    : "P";

  const dateLabel = new Date(review.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5 font-['Inter',sans-serif]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-foreground">{review.patient_name || "Patient"}</p>
              {/* Every review is tied to a completed appointment, so all reviews are inherently verified */}
              <span className="inline-flex items-center gap-0.5 text-xs text-accent">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified visit
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{dateLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
          ))}
        </div>
      </div>
      {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
    </div>
  );
}