import { X, Phone, Mail, AlertTriangle, Pill, BookOpen, Calendar, Clock } from "lucide-react";
import type { PatientSummary } from "../data/patients";

const RISK_COLORS = { low: "bg-accent/10 text-accent", medium: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400", high: "bg-destructive/10 text-destructive" };

interface Props { patient: PatientSummary; onClose: () => void; }

export default function PatientProfilePreview({ patient: p, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border flex flex-col h-full shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">Patient Profile</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-xl font-semibold text-primary flex-shrink-0">
              {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h3 className="font-medium text-foreground text-lg">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.age} yrs · {p.gender} · {p.bloodGroup}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium mt-1 inline-block capitalize ${RISK_COLORS[p.risk]}`}>{p.risk} risk</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Contact</p>
            <div className="space-y-1.5">
              <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-3.5 h-3.5 text-accent" />{p.phone}
              </a>
              <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-3.5 h-3.5 text-accent" />{p.email}
              </a>
            </div>
          </div>

          {/* Visit stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">{p.visitCount}</p>
              <p className="text-xs text-muted-foreground">Total visits</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="font-['DM_Mono',monospace] text-sm font-medium text-foreground mt-1">{p.lastVisit}</p>
              <p className="text-xs text-muted-foreground">Last visit</p>
            </div>
          </div>
          {p.nextVisit && (
            <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
              <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Next appointment</p>
                <p className="text-sm font-medium text-foreground">{p.nextVisit}</p>
              </div>
            </div>
          )}

          {/* Medical history */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Medical history</p>
            <ul className="space-y-1.5">
              {p.medicalHistory.map(h => (
                <li key={h} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />{h}
                </li>
              ))}
            </ul>
          </div>

          {/* Current medications */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" /> Current medications</p>
            <div className="flex flex-wrap gap-2">
              {p.currentMedications.length > 0 ? p.currentMedications.map(m => (
                <span key={m} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">{m}</span>
              )) : <p className="text-xs text-muted-foreground">None recorded</p>}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Allergies</p>
            {p.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {p.allergies.map(a => (
                  <span key={a} className="text-xs bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900 px-2.5 py-1 rounded-full">{a}</span>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">NKDA (No known drug allergies)</p>}
          </div>
        </div>

        <div className="p-6 pt-0">
          <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
            Write prescription
          </button>
        </div>
      </div>
    </div>
  );
}
