import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { COMMON_MEDICINES } from "../data/prescriptions";
import type { Medicine } from "../data/prescriptions";

interface Props { selected: Medicine[]; onChange: (meds: Medicine[]) => void; }

const FREQUENCIES = ["Once daily","Twice daily","Three times daily","Four times daily","Every 8 hours","Every 6 hours","Once nightly","As needed (PRN)"];
const DURATIONS   = ["3 days","5 days","7 days","10 days","14 days","30 days","60 days","90 days","Ongoing"];

export default function MedicineSelector({ selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<Partial<Medicine> | null>(null);

  const suggestions = COMMON_MEDICINES.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) && !selected.some(s => s.name === m.name)
  ).slice(0, 6);

  function startAdd(name: string, defaultDosage: string) {
    setAdding({ name, generic: name, dosage: defaultDosage, frequency: "Once daily", duration: "30 days", instructions: "" });
    setQuery("");
  }

  function confirmAdd() {
    if (!adding?.name || !adding.dosage) return;
    onChange([...selected, adding as Medicine]);
    setAdding(null);
  }

  function remove(name: string) { onChange(selected.filter(m => m.name !== name)); }

  function setField<K extends keyof Medicine>(k: K, v: Medicine[K]) {
    setAdding(a => a ? { ...a, [k]: v } : a);
  }

  return (
    <div className="space-y-4">
      {/* Selected medicines */}
      {selected.map((med, i) => (
        <div key={i} className="bg-muted/40 rounded-xl p-4 flex items-start gap-3 border border-border/60">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm">{med.name} <span className="text-muted-foreground font-normal">· {med.dosage}</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">{med.frequency} · {med.duration}</p>
          </div>
          <button onClick={() => remove(med.name)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add medicine */}
      {adding ? (
        <div className="bg-card rounded-xl border-2 border-accent/20 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Add: {adding.name}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Dosage</label>
              <input value={adding.dosage ?? ""} onChange={e => setField("dosage", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 25mg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Frequency</label>
              <select value={adding.frequency ?? ""} onChange={e => setField("frequency", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Duration</label>
              <select value={adding.duration ?? ""} onChange={e => setField("duration", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Instructions</label>
              <input value={adding.instructions ?? ""} onChange={e => setField("instructions", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Take with food…" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={confirmAdd} className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-lg hover:bg-primary/90 transition-all">Add medicine</button>
            <button onClick={() => setAdding(null)} className="px-4 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search medicines…" className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {query && suggestions.length > 0 && (
            <div className="mt-2 bg-card border border-border rounded-xl overflow-hidden shadow-md">
              {suggestions.map(m => (
                <button key={m.name} onClick={() => startAdd(m.name, m.defaultDosage)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.category} · {m.defaultDosage}</p>
                  </div>
                  <Plus className="w-4 h-4 text-accent" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
