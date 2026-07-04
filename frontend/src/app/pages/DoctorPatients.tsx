import { useState, useMemo, useEffect } from "react";
import { Search, X, Users, Pill, TrendingUp } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import PatientCard from "../components/PatientCard";
import PatientProfilePreview from "../components/PatientProfilePreview";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { patientsService, type PatientSummary } from "../services/patients";

export default function DoctorPatients() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PatientSummary | null>(null);

  useEffect(() => {
    patientsService.getMyPatients()
      .then(setPatients)
      .catch(err => setError(err.message || "Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => patients.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.chronic_conditions.some(c => c.toLowerCase().includes(q));
  }), [patients, query]);

  const stats = [
    { label: "Total patients", value: patients.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "On medication", value: patients.filter(p => p.current_medications.length > 0).length, icon: Pill, color: "text-accent", bg: "bg-accent/10" },
    { label: "Avg visits", value: patients.length ? Math.round(patients.reduce((s, p) => s + p.visit_count, 0) / patients.length) : 0, icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
  ];

  return (
    <DoctorShell title="Patient List" subtitle="Patients who have booked appointments with you">
      <div className="max-w-4xl space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                {loading ? <LoadingSkeleton className="h-6 w-8 mb-0.5" /> : (
                  <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground leading-none">{value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or condition…"
            className="w-full bg-input-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3">{[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-8">{error}</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{filtered.length} patient{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No patients yet</p>
                <p className="text-sm text-muted-foreground">Patients will appear here once they book an appointment with you.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {filtered.map(p => <PatientCard key={p.id} patient={p} onClick={() => setSelected(p)} />)}
              </div>
            )}
          </>
        )}
      </div>

      {selected && <PatientProfilePreview patient={selected} onClose={() => setSelected(null)} />}
    </DoctorShell>
  );
}