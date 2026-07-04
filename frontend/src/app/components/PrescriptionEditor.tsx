import { useState, useEffect } from "react";
import { X, FileText, Loader2 } from "lucide-react";
import type { Medicine } from "../services/prescriptions";
import { prescriptionsService } from "../services/prescriptions";
import { patientsService, type PatientSummary } from "../services/patients";
import MedicineSelector from "./MedicineSelector";

interface Props {
  onCreated: () => void;
  onClose: () => void;
}

export default function PrescriptionEditor({ onCreated, onClose }: Props) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    patientsService.getMyPatients()
      .then(setPatients)
      .catch(err => setError(err.message || "Failed to load patients"))
      .finally(() => setLoadingPatients(false));
  }, []);

  async function submit() {
    if (!patientId || medicines.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await prescriptionsService.create({
        patient_id: patientId,
        diagnosis: diagnosis || undefined,
        notes: notes || undefined,
        medicines,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create prescription.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">New Prescription</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Patient *</label>
            {loadingPatients ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2.5">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading your patients…
              </div>
            ) : patients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2.5">
                No patients yet — patients appear here once they've booked an appointment with you.
              </p>
            ) : (
              <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select patient…</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}{p.age ? ` · ${p.age} yrs` : ""}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Diagnosis <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Hypertension Stage 1" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Medicines * <span className="text-muted-foreground font-normal">({medicines.length} added)</span></label>
            <MedicineSelector selected={medicines} onChange={setMedicines} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Doctor's notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Instructions for patient, follow-up timeline…" className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all">Cancel</button>
          <button
            onClick={submit}
            disabled={!patientId || medicines.length === 0 || saving}
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Creating…" : "Create prescription"}
          </button>
        </div>
      </div>
    </div>
  );
}