import { useState } from "react";
import { Plus, Search, X, Pill } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import PrescriptionCard from "../components/PrescriptionCard";
import PrescriptionEditor from "../components/PrescriptionEditor";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { DOCTOR_PRESCRIPTIONS, type Prescription } from "../data/prescriptions";

export default function DoctorPrescription() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(DOCTOR_PRESCRIPTIONS);
  const [query, setQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Prescription | null>(null);
  const { toasts, add: addToast, dismiss } = useToast();

  const filtered = prescriptions.filter(px => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (px.patientName?.toLowerCase().includes(q) ?? false) || px.diagnosis.toLowerCase().includes(q) || px.medicines.some(m => m.name.toLowerCase().includes(q));
  });

  function handleSave(data: Omit<Prescription, "id" | "doctorId" | "doctorName" | "specialty" | "avatar">) {
    if (editing) {
      setPrescriptions(ps => ps.map(p => p.id === editing.id ? { ...p, ...data } : p));
      addToast({ type: "success", title: "Prescription updated", body: `Updated for ${data.patientName}.` });
    } else {
      const newPx: Prescription = { id: `dpx${Date.now()}`, doctorId: "d1", doctorName: "Dr. Amara Osei", specialty: "Cardiology", avatar: "photo-1612349317150-e413f6a5b16d", ...data };
      setPrescriptions(ps => [newPx, ...ps]);
      addToast({ type: "success", title: "Prescription created", body: `${data.patientName} has been notified.` });
    }
    setEditing(null);
  }

  function handleDelete(id: string) {
    setPrescriptions(ps => ps.filter(p => p.id !== id));
    addToast({ type: "info", title: "Prescription deleted", body: "The prescription has been removed." });
  }

  return (
    <DoctorShell
      title="Prescriptions"
      subtitle="Create and manage patient prescriptions"
      actions={
        <button onClick={() => { setEditing(null); setShowEditor(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> New prescription
        </button>
      }
    >
      <div className="max-w-3xl space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total prescriptions", value: prescriptions.length },
            { label: "Unique patients", value: new Set(prescriptions.map(p => p.patientName)).size },
            { label: "This month", value: prescriptions.filter(p => p.date.includes("Jun") || p.date.includes("Jul")).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by patient, diagnosis, or medicine…" className="w-full bg-input-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Pill className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No prescriptions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(px => (
              <PrescriptionCard
                key={px.id}
                prescription={px}
                showPatient
                onEdit={id => { setEditing(prescriptions.find(p => p.id === id) ?? null); setShowEditor(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showEditor && (
        <PrescriptionEditor
          initial={editing ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditing(null); }}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </DoctorShell>
  );
}
