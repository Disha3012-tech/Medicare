import { useState, useEffect } from "react";
import { Plus, Search, X, Pill } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import PrescriptionCard from "../components/PrescriptionCard";
import PrescriptionEditor from "../components/PrescriptionEditor";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { prescriptionsService, type Prescription } from "../services/prescriptions";

export default function DoctorPrescription() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const { toasts, add: addToast, dismiss } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  function loadPrescriptions() {
    setLoading(true);
    prescriptionsService.getMine()
      .then(setPrescriptions)
      .catch(err => addToast({ type: "error", title: "Failed to load prescriptions", body: err.message }))
      .finally(() => setLoading(false));
  }

  const filtered = prescriptions.filter(px => {
    if (!query) return true;
    const q = query.toLowerCase();
    return px.patient_name.toLowerCase().includes(q)
      || (px.diagnosis || "").toLowerCase().includes(q)
      || px.medicines.some(m => m.name.toLowerCase().includes(q));
  });

  function handleCreated() {
    addToast({ type: "success", title: "Prescription created", body: "The patient has been notified." });
    loadPrescriptions();
  }

  const thisMonthCount = prescriptions.filter(p => {
    const d = new Date(p.issued_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <DoctorShell
      title="Prescriptions"
      subtitle="Create and manage patient prescriptions"
      actions={
        <button onClick={() => setShowEditor(true)} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> New prescription
        </button>
      }
    >
      <div className="max-w-3xl space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total prescriptions", value: prescriptions.length },
            { label: "Unique patients", value: new Set(prescriptions.map(p => p.patient_id)).size },
            { label: "This month", value: thisMonthCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4 text-center">
              {loading ? <LoadingSkeleton className="h-7 w-10 mx-auto mb-1" /> : (
                <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">{value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by patient, diagnosis, or medicine…" className="w-full bg-input-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Pill className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No prescriptions found</p>
            <p className="text-sm text-muted-foreground">Prescriptions you write will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(px => (
              <PrescriptionCard key={px.id} prescription={px} showPatient />
            ))}
          </div>
        )}
      </div>

      {showEditor && (
        <PrescriptionEditor
          onCreated={handleCreated}
          onClose={() => setShowEditor(false)}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </DoctorShell>
  );
}