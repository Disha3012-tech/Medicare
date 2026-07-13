import { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import { reviewsService } from "../services/reviews";

interface Props {
  appointmentId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ReviewModal({ appointmentId, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (rating === 0) return;
    setSaving(true);
    setError("");
    try {
      await reviewsService.submit({ appointment_id: appointmentId, rating, comment: comment.trim() || undefined });
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">Leave a review</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Your rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Comment <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this doctor…"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={rating === 0 || saving}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}