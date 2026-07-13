import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../components/AuthProvider";
import { reviewsService, type AnonymizedReview } from "../services/reviews";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DoctorReviews() {
  const { doctorProfile } = useAuth();
  const [reviews, setReviews] = useState<AnonymizedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsService.getMineAnonymized()
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgRating = doctorProfile?.average_rating ?? 0;
  const totalReviews = doctorProfile?.total_reviews ?? 0;
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
  }));

  return (
    <DoctorShell title="Patient Reviews" subtitle="Feedback is anonymized to protect patient privacy">
      <div className="max-w-3xl space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 flex gap-8 items-center">
          <div className="text-center flex-shrink-0">
            <p className="font-['Fraunces',serif] text-5xl font-semibold text-foreground">{avgRating.toFixed(1)}</p>
            <div className="flex items-center gap-0.5 justify-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {distribution.map(({ stars, count }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{stars}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Reviews from your patients will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                      P
                    </div>
                    <span className="text-sm font-medium text-foreground">Patient</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorShell>
  );
}