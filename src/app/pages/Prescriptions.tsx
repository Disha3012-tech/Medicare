import { useState } from "react";
import { Search, X, Pill } from "lucide-react";
import PatientShell from "../components/PatientShell";
import PrescriptionCard from "../components/PrescriptionCard";
import { PRESCRIPTIONS } from "../data/prescriptions";

export default function Prescriptions() {
  const [query, setQuery] = useState("");

  const filtered = PRESCRIPTIONS.filter(px => {
    if (!query) return true;
    const q = query.toLowerCase();
    return px.doctorName.toLowerCase().includes(q) || px.diagnosis.toLowerCase().includes(q) || px.medicines.some(m => m.name.toLowerCase().includes(q));
  });

  return (
    <PatientShell title="Prescriptions" subtitle="Your medication history and active prescriptions">
      <div className="max-w-3xl space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total prescriptions", value: PRESCRIPTIONS.length },
            { label: "Active medicines", value: PRESCRIPTIONS.reduce((s, px) => s + px.medicines.length, 0) },
            { label: "Doctors", value: new Set(PRESCRIPTIONS.map(px => px.doctorId)).size },
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
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by doctor, diagnosis, or medicine…" className="w-full bg-input-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Pill className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No prescriptions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(px => <PrescriptionCard key={px.id} prescription={px} />)}
          </div>
        )}
      </div>
    </PatientShell>
  );
}
