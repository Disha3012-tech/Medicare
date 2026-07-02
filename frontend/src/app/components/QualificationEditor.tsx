import { useState } from "react";
import { Plus, Trash2, GraduationCap, Save } from "lucide-react";

interface Qualification { id: string; degree: string; institution: string; year: string; type: "Degree" | "Residency" | "Fellowship" | "Certification"; }

const DEFAULT: Qualification[] = [
  { id: "q1", type: "Degree", degree: "MD", institution: "Johns Hopkins University School of Medicine", year: "2006" },
  { id: "q2", type: "Residency", degree: "Residency in Internal Medicine", institution: "UCSF Medical Center", year: "2009" },
  { id: "q3", type: "Fellowship", degree: "Fellowship in Interventional Cardiology", institution: "Johns Hopkins Hospital", year: "2012" },
  { id: "q4", type: "Certification", degree: "Board Certification in Cardiovascular Disease", institution: "American Board of Internal Medicine", year: "2013" },
];

export default function QualificationEditor({ onSave }: { onSave?: () => void }) {
  const [qualifications, setQualifications] = useState<Qualification[]>(DEFAULT);
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState<Partial<Qualification>>({ type: "Degree" });

  function add() {
    if (!newQ.degree || !newQ.institution) return;
    setQualifications(q => [...q, { id: Date.now().toString(), degree: newQ.degree!, institution: newQ.institution!, year: newQ.year ?? "", type: newQ.type as any }]);
    setAdding(false); setNewQ({ type: "Degree" });
  }

  const TYPE_COLORS = { Degree: "bg-primary/10 text-primary", Residency: "bg-accent/10 text-accent", Fellowship: "bg-purple-100 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400", Certification: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400" };

  return (
    <div className="space-y-4 max-w-2xl">
      {qualifications.map(q => (
        <div key={q.id} className="bg-card rounded-xl border border-border p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm">{q.degree}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{q.institution}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[q.type]}`}>{q.type}</span>
              {q.year && <span className="font-['DM_Mono',monospace] text-xs text-muted-foreground">{q.year}</span>}
            </div>
          </div>
          <button onClick={() => setQualifications(qs => qs.filter(x => x.id !== q.id))} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="bg-card rounded-xl border-2 border-accent/20 p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Add qualification</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <select value={newQ.type} onChange={e => setNewQ(n => ({ ...n, type: e.target.value as any }))} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {["Degree","Residency","Fellowship","Certification"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Year</label>
              <input value={newQ.year ?? ""} onChange={e => setNewQ(n => ({ ...n, year: e.target.value }))} placeholder="e.g. 2018" className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Degree / Certification name *</label>
              <input value={newQ.degree ?? ""} onChange={e => setNewQ(n => ({ ...n, degree: e.target.value }))} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Institution *</label>
              <input value={newQ.institution ?? ""} onChange={e => setNewQ(n => ({ ...n, institution: e.target.value }))} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-lg hover:bg-primary/90 transition-all">Add</button>
            <button onClick={() => setAdding(false)} className="px-4 text-sm border border-border rounded-lg text-muted-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-accent/40 hover:text-accent transition-all">
          <Plus className="w-4 h-4" /> Add qualification
        </button>
      )}

      <button onClick={onSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
        <Save className="w-4 h-4" /> Save qualifications
      </button>
    </div>
  );
}
