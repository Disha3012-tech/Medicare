import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { appointmentsService } from "../services/appointments";

interface Props {
  onClose: () => void;
  onCancelled: (count: number) => void;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function EmergencyCancelModal({ onClose, onCancelled }: Props) {
  const [date, setDate] = useState(todayStr());
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason.trim() || confirmText !== "CANCEL") return;
    setSaving(true);
    setError("");
    try {
      const result = await appointmentsService.emergencyCancelDay(date, reason.trim());
      onCancelled(result.cancelled_count);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to cancel appointments. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">Emergency day cancellation</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will cancel <span className="font-medium text-foreground">every pending and confirmed appointment</span> on the selected date. All affected patients will be notified immediately and can rebook a new time. This cannot be undone.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Date to cancel</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Reason (shown to patients)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Personal medical emergency"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Type <span className="font-['DM_Mono',monospace] font-semibold">CANCEL</span> to confirm
            </label>
            <input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              className="w-full bg-input-background border border-destructive/30 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40"
            />
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!reason.trim() || confirmText !== "CANCEL" || saving}
              className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-xl font-medium text-sm hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Cancelling…" : "Cancel all appointments for this day"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}