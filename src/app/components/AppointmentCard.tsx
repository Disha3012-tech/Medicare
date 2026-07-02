import { Calendar, Clock, MapPin, Video, Building2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useState } from "react";
import type { AppointmentRecord } from "../data/appointments";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

interface Props {
  appt: AppointmentRecord;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function AppointmentCard({ appt, onReschedule, onCancel, onViewDetails }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border hover:shadow-sm transition-all">
      <div className="p-5 flex gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          <img
            src={`https://images.unsplash.com/${appt.avatar}?w=48&h=48&fit=crop&auto=format`}
            alt={appt.doctorName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-medium text-foreground">{appt.doctorName}</p>
              <p className="text-sm text-accent">{appt.specialty}</p>
            </div>
            <AppointmentStatusBadge status={appt.status} />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{appt.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{appt.time}</span>
            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{appt.hospital}</span>
            <span className="flex items-center gap-1">
              {appt.type === "video" ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              {appt.type === "video" ? "Video" : "In-person"}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Details
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {appt.status === "upcoming" && (
              <>
                <button onClick={() => onReschedule?.(appt.id)} className="text-xs text-accent border border-accent/30 rounded-lg px-3 py-1.5 hover:bg-accent/5 transition-colors">
                  Reschedule
                </button>
                <button onClick={() => onCancel?.(appt.id)} className="text-xs text-destructive border border-destructive/20 rounded-lg px-3 py-1.5 hover:bg-destructive/5 transition-colors">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Reason for visit</p>
            <p className="text-sm text-foreground">{appt.reason}</p>
          </div>
          {appt.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Doctor's notes</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{appt.notes}</p>
            </div>
          )}
          <div className="flex gap-6 text-xs text-muted-foreground">
            <span>Fee: <span className="font-['DM_Mono',monospace] font-medium text-foreground">${appt.fee}</span></span>
            {appt.insurance && <span>Insurance: <span className="text-foreground">{appt.insurance}</span></span>}
          </div>
        </div>
      )}
    </div>
  );
}
