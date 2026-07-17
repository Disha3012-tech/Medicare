import {
  Calendar,
  Clock,
 MapPin,
  Video,
  ChevronDown,
  ChevronUp,
  FileText,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Video as VideoIcon } from "lucide-react"; // if Video icon name collides, alias like this
import type { Appointment } from "../services/appointments";
import AppointmentStatusBadge, {
  type DisplayStatus,
} from "./AppointmentStatusBadge";

interface Props {
  appt: Appointment;
  reviewed?: boolean;
 showReviewButton?: boolean;
  showAppointmentActions?: boolean; // NEW
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onLeaveReview?: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_MAP: Record<Appointment["status"], DisplayStatus> = {
  PENDING: "upcoming",
  CONFIRMED: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

export default function AppointmentCard({
  appt,
  reviewed,
  showReviewButton = true,
  showAppointmentActions = true,
  onReschedule,
  onCancel,
  onViewDetails,
  onLeaveReview,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const isUpcoming =
    ["PENDING", "CONFIRMED"].includes(appt.status) &&
    new Date(appt.scheduled_at) > new Date();

  const isCompleted = appt.status === "COMPLETED";

  return (
    <div className="bg-card rounded-xl border border-border hover:shadow-sm transition-all">
      <div className="p-5 flex gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-medium text-foreground">
                {appt.type === "VIDEO"
                  ? "Video Consultation"
                  : "In-Person Visit"}
              </p>

              <p className="text-sm text-accent capitalize">
                {appt.reason_for_visit || "General visit"}
              </p>
            </div>

            <AppointmentStatusBadge status={STATUS_MAP[appt.status]} />
          </div>

          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(appt.scheduled_at)}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(appt.scheduled_at)}
            </span>

            <span className="flex items-center gap-1">
              {appt.type === "VIDEO" ? (
                <Video className="w-3.5 h-3.5" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}

              {appt.type === "VIDEO" ? "Video" : "In-person"}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Details
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showAppointmentActions && isUpcoming && appt.type === "VIDEO" && (
              <>
                <button
                  onClick={() => onReschedule?.(appt.id)}
                  className="text-xs text-accent border border-accent/30 rounded-lg px-3 py-1.5 hover:bg-accent/5 transition-colors"
                >
                  Reschedule
                </button>

                <button
                  onClick={() => onCancel?.(appt.id)}
                  className="text-xs text-destructive border border-destructive/20 rounded-lg px-3 py-1.5 hover:bg-destructive/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate(`/consultation/${appt.id}`)}
                  className="text-xs text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors flex items-center gap-1"
                >
                  <VideoIcon className="w-3.5 h-3.5" /> Join call
                </button>
            
              </>
            )}

            {showReviewButton && isCompleted && (
              reviewed ? (
                <span className="flex items-center gap-1 text-xs text-accent">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Review submitted
                </span>
              ) : (
                <button
                  onClick={() => onLeaveReview?.(appt.id)}
                  className="flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
                >
                  <Star className="w-3.5 h-3.5" />
                  Leave a review
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Reason for visit
            </p>

            <p className="text-sm text-foreground">
              {appt.reason_for_visit || "Not specified"}
            </p>
          </div>

          {appt.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Notes
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {appt.notes}
              </p>
            </div>
          )}

          {appt.cancel_reason && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Cancellation reason
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {appt.cancel_reason}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Duration:{" "}
            <span className="font-medium text-foreground">
              {appt.duration_min} min
            </span>
          </div>
        </div>
      )}
    </div>
  );
}