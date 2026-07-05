import { useState, useEffect } from "react";
import { Plus, Trash2, GraduationCap, Loader2 } from "lucide-react";
import { doctorsService, type Qualification } from "../services/doctors";

export default function QualificationEditor({ onSave }: { onSave?: () => void }) {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newQ, setNewQ] = useState({ degree: "", institution: "", year: "" });

  function load() {
    setLoading(true);
    doctorsService.getMyQualifications()
      .then(setQualifications)
      .catch(err => setError(err.message || "Failed to load qualifications"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!newQ.degree || !newQ.institution) return;
    setSaving(true);
    setError("");
    try {
      await doctorsService.addQualification({
        degree: newQ.degree,
        institution: newQ.institution,
        year: Number(newQ.year) || new Date().getFullYear(),
      });
      setAdding(false);
      setNewQ({ degree: "", institution: "", year: "" });
      load();
      onSave?.();
    } catch (err: any) {
      setError(err.message || "Failed to add qualification.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await doctorsService.deleteQualification(id);
      setQualifications(qs => qs.filter(q => q.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete qualification.");
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {qualifications.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground py-4 text-center">No qualifications added yet.</p>
      )}

      {qualifications.map(q => (
        <div key={q.id} className="bg-card rounded-xl border border-border p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm">{q.degree}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{q.institution}</p>
            <span className="font-['DM_Mono',monospace] text-xs text-muted-foreground">{q.year}</span>
          </div>
          <button onClick={() => q.id && remove(q.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="bg-card rounded-xl border-2 border-accent/20 p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Add qualification</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Degree / Certification name *</label>
              <input value={newQ.degree} onChange={e => setNewQ(n => ({ ...n, degree: e.target.value }))} placeholder="e.g. MD, Fellowship in Cardiology" className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Institution *</label>
              <input value={newQ.institution} onChange={e => setNewQ(n => ({ ...n, institution: e.target.value }))} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Year</label>
              <input value={newQ.year} onChange={e => setNewQ(n => ({ ...n, year: e.target.value }))} placeholder="e.g. 2018" className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button onClick={add} disabled={saving} className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-all">{saving ? "Adding…" : "Add"}</button>
            <button onClick={() => setAdding(false)} className="px-4 text-sm border border-border rounded-lg text-muted-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-accent/40 hover:text-accent transition-all">
          <Plus className="w-4 h-4" /> Add qualification
        </button>
      )}
      {error && !adding && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}