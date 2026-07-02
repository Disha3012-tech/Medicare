import { useState } from "react";
import { X, FileText } from "lucide-react";
import type { Prescription, Medicine } from "../data/prescriptions";
import { DOCTOR_PATIENTS } from "../data/patients";
import MedicineSelector from "./MedicineSelector";

interface Props {
  initial?: Partial<Prescription>;
  onSave: (px: Omit<Prescription, "id" | "doctorId" | "doctorName" | "specialty" | "avatar">) => void;
  onClose: () => void;
}

export default function PrescriptionEditor({ initial, onSave, onClose }: Props) {
  const [patientId, setPatientId] = useState(initial?.patientName ? DOCTOR_PATIENTS.find(p => p.name === initial.patientName)?.id ?? "" : "");
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [medicines, setMedicines] = useState<Medicine[]>(initial?.medicines ?? []);

  const patient = DOCTOR_PATIENTS.find(p => p.id === patientId);

  function submit() {
    if (!patientId || !diagnosis || medicines.length === 0) return;
    onSave({
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      diagnosis,
      notes,
      medicines,
      patientName: patient?.name,
      patientAge: patient?.age,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">{initial ? "Edit" : "New"} Prescription</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Patient *</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select patient…</option>
              {DOCTOR_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} · {p.age} yrs</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Diagnosis *</label>
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
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all">Cancel</button>
          <button onClick={submit} disabled={!patientId || !diagnosis || medicines.length === 0} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {initial ? "Save changes" : "Create prescription"}
          </button>
        </div>
      </div>
    </div>
  );
}
