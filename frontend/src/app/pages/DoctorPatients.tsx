import { useState, useMemo } from "react";
import { Search, X, Users, AlertCircle, TrendingUp } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import PatientCard from "../components/PatientCard";
import PatientProfilePreview from "../components/PatientProfilePreview";
import { DOCTOR_PATIENTS, type PatientSummary } from "../data/patients";

export default function DoctorPatients() {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [selected, setSelected] = useState<PatientSummary | null>(null);

  const filtered = useMemo(() => DOCTOR_PATIENTS.filter(p => {
    if (riskFilter !== "all" && p.risk !== riskFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.condition.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [query, riskFilter]);

  const stats = [
    { label: "Total patients", value: DOCTOR_PATIENTS.length, icon: Users, color: "text-primary bg-primary/10" },
    { label: "High risk", value: DOCTOR_PATIENTS.filter(p => p.risk === "high").length, icon: AlertCircle, color: "text-destructive bg-destructive/10" },
    { label: "Avg visits", value: Math.round(DOCTOR_PATIENTS.reduce((s, p) => s + p.visitCount, 0) / DOCTOR_PATIENTS.length), icon: TrendingUp, color: "text-accent bg-accent/10" },
  ];

  return (
    <DoctorShell title="Patient List" subtitle="Your registered patient roster">
      <div className="max-w-4xl space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color.split(" ")[1]}`}>
                <Icon className={`w-4 h-4 ${color.split(" ")[0]}`} />
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or condition…" className="w-full bg-input-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="flex gap-2">
            {(["all","low","medium","high"] as const).map(r => (
              <button key={r} onClick={() => setRiskFilter(r)} className={`text-xs px-3 py-2 rounded-xl border transition-all capitalize ${riskFilter === r ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/30"}`}>{r === "all" ? "All" : `${r} risk`}</button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} patient{filtered.length !== 1 ? "s" : ""}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(p => <PatientCard key={p.id} patient={p} onClick={() => setSelected(p)} />)}
        </div>
      </div>

      {selected && <PatientProfilePreview patient={selected} onClose={() => setSelected(null)} />}
    </DoctorShell>
  );
}
