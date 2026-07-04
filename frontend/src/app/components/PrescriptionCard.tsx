import { useState } from "react";
import { Download, ChevronDown, ChevronUp, Stethoscope } from "lucide-react";
import type { Prescription } from "../services/prescriptions";
import MedicineCard from "./MedicineCard";

interface Props {
  prescription: Prescription;
  showPatient?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const AVATAR_FALLBACK = "https://api.dicebear.com/7.x/initials/svg?seed=";

export default function PrescriptionCard({ prescription: px, showPatient, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const dateLabel = new Date(px.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const avatarSrc = px.doctor_avatar_url || `${AVATAR_FALLBACK}${encodeURIComponent(px.doctor_name)}`;

  return (
    <div className="bg-card rounded-xl border border-border hover:shadow-sm transition-all">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <img src={avatarSrc} alt={px.doctor_name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium text-foreground">{px.doctor_name}</p>
                <p className="text-sm text-accent">{px.specialty}</p>
                {showPatient && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Patient: {px.patient_name}{px.patient_age ? `, ${px.patient_age} yrs` : ""}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-['DM_Mono',monospace] text-xs text-muted-foreground">{dateLabel}</p>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full mt-1 inline-block">
                  {px.medicines.length} medicine{px.medicines.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            {px.diagnosis && (
              <div className="mt-2 p-3 bg-muted/40 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Diagnosis</p>
                <p className="text-sm text-foreground">{px.diagnosis}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Stethoscope className="w-3.5 h-3.5" />
            {expanded ? "Hide medicines" : "View medicines"}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button className="flex items-center gap-1.5 text-sm text-accent hover:underline ml-auto">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          {/* Note: edit/delete have no backend support yet (no PATCH/DELETE on /prescriptions).
              These buttons are kept for layout compatibility but will need real endpoints before use. */}
          {onEdit && <button onClick={() => onEdit(px.id)} className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all">Edit</button>}
          {onDelete && <button onClick={() => onDelete(px.id)} className="text-xs border border-destructive/20 rounded-lg px-3 py-1.5 text-destructive hover:bg-destructive/5 transition-all">Delete</button>}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
          {px.medicines.map((med, i) => <MedicineCard key={med.id || i} med={med} index={i} />)}
          {px.notes && (
            <div className="bg-secondary rounded-xl p-4 mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Doctor's notes</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{px.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}