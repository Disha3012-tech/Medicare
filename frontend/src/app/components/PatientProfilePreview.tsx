import { useState, useEffect } from "react";
import { X, Phone, Mail, AlertTriangle, Pill, BookOpen, Calendar, FileText, Loader2 } from "lucide-react";
import type { PatientSummary } from "../services/patients";
import { prescriptionsService, type Prescription } from "../services/prescriptions";

interface Props { patient: PatientSummary; onClose: () => void; onWritePrescription: (patientId: string) => void; }

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PatientProfilePreview({ patient: p, onClose, onWritePrescription }: Props) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingRx, setLoadingRx] = useState(true);

  useEffect(() => {
    prescriptionsService.getMine()
      .then(all => setPrescriptions(all.filter(px => px.patient_id === p.id)))
      .catch(console.error)
      .finally(() => setLoadingRx(false));
  }, [p.id]);

  const initials = p.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const lastVisit = formatDate(p.last_visit);
  const nextVisit = formatDate(p.next_visit);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border flex flex-col h-full shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">Patient Profile</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-xl font-semibold text-primary flex-shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="font-medium text-foreground text-lg">{p.name}</h3>
              <p className="text-sm text-muted-foreground">
                {[p.age ? `${p.age} yrs` : null, p.gender, p.blood_group].filter(Boolean).join(" · ") || "No demographic info recorded"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Contact</p>
            <div className="space-y-1.5">
              {p.phone && (
                <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-3.5 h-3.5 text-accent" />{p.phone}
                </a>
              )}
              <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-3.5 h-3.5 text-accent" />{p.email}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">{p.visit_count}</p>
              <p className="text-xs text-muted-foreground">Total appointments</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="font-['DM_Mono',monospace] text-sm font-medium text-foreground mt-1">{lastVisit || "—"}</p>
              <p className="text-xs text-muted-foreground">Last visit</p>
            </div>
          </div>
          {nextVisit && (
            <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
              <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Next appointment</p>
                <p className="text-sm font-medium text-foreground">{nextVisit}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Chronic conditions</p>
            {p.chronic_conditions.length > 0 ? (
              <ul className="space-y-1.5">
                {p.chronic_conditions.map(h => (
                  <li key={h} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />{h}
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-muted-foreground">None recorded</p>}
          </div>

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

          {/* Full prescription history — every diagnosis + medicines you've prescribed this patient */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Prescription history
            </p>
            {loadingRx ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading history…
              </div>
            ) : prescriptions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No prescriptions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {prescriptions
                  .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())
                  .map(px => (
                    <div key={px.id} className="bg-muted/40 rounded-xl p-3 border border-border/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-foreground">{px.diagnosis || "No diagnosis recorded"}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(px.issued_at)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {px.medicines.map(m => (
                          <span key={m.id || m.name} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {m.name} · {m.dosage}
                          </span>
                        ))}
                      </div>
                      {px.notes && <p className="text-xs text-muted-foreground mt-1.5">{px.notes}</p>}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={() => onWritePrescription(p.id)}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all"
          >
            Write prescription
          </button>
        </div>
      </div>
    </div>
  );
}