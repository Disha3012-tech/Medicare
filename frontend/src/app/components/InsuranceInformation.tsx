import { useState } from "react";
import { Save, Shield, Plus, Trash2 } from "lucide-react";

interface Insurance { id: string; provider: string; memberId: string; groupNo: string; type: "Primary" | "Secondary"; }

const PROVIDERS = ["Aetna","Blue Cross Blue Shield","Cigna","Kaiser Permanente","Medi-Cal","Medicare","UnitedHealth","Self-pay"];

export default function InsuranceInformation({ onSave }: { onSave?: () => void }) {
  const [insurances, setInsurances] = useState<Insurance[]>([
    { id: "ins1", provider: "Aetna", memberId: "AET-990234521", groupNo: "GRP-4421", type: "Primary" },
  ]);
  const [adding, setAdding] = useState(false);
  const [newIns, setNewIns] = useState<Partial<Insurance>>({ type: "Secondary" });

  function addInsurance() {
    if (!newIns.provider || !newIns.memberId) return;
    setInsurances(i => [...i, { id: Date.now().toString(), provider: newIns.provider!, memberId: newIns.memberId!, groupNo: newIns.groupNo ?? "", type: newIns.type as "Primary" | "Secondary" }]);
    setAdding(false); setNewIns({ type: "Secondary" });
  }

  function remove(id: string) { setInsurances(i => i.filter(ins => ins.id !== id)); }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl border border-border">
        <Shield className="w-5 h-5 text-accent flex-shrink-0" />
        <p className="text-sm text-muted-foreground">Your insurance information is used to verify coverage when booking appointments.</p>
      </div>

      {insurances.map(ins => (
        <div key={ins.id} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-medium text-foreground">{ins.provider}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${ins.type === "Primary" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{ins.type}</span>
            </div>
            <button onClick={() => remove(ins.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Member ID</p><p className="font-['DM_Mono',monospace] text-foreground">{ins.memberId}</p></div>
            <div><p className="text-xs text-muted-foreground">Group No.</p><p className="font-['DM_Mono',monospace] text-foreground">{ins.groupNo || "—"}</p></div>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="bg-card rounded-xl border-2 border-accent/20 p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Add insurance</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Provider</label>
              <select value={newIns.provider ?? ""} onChange={e => setNewIns(n => ({ ...n, provider: e.target.value }))} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select…</option>
                {PROVIDERS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <select value={newIns.type} onChange={e => setNewIns(n => ({ ...n, type: e.target.value as any }))} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Primary</option><option>Secondary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Member ID *</label>
              <input value={newIns.memberId ?? ""} onChange={e => setNewIns(n => ({ ...n, memberId: e.target.value }))} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Group No.</label>
              <input value={newIns.groupNo ?? ""} onChange={e => setNewIns(n => ({ ...n, groupNo: e.target.value }))} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addInsurance} className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-lg hover:bg-primary/90 transition-all">Add</button>
            <button onClick={() => setAdding(false)} className="px-4 text-sm border border-border rounded-lg text-muted-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-accent/40 hover:text-accent transition-all">
          <Plus className="w-4 h-4" /> Add insurance
        </button>
      )}

      <button onClick={onSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
        <Save className="w-4 h-4" /> Save insurance info
      </button>
    </div>
  );
}
