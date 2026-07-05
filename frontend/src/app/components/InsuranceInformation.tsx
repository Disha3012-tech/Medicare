import { useState, useEffect } from "react";
import { Save, Shield, Loader2 } from "lucide-react";
import { patientsService } from "../services/patients";

const PROVIDERS = ["Aetna","Blue Cross Blue Shield","Cigna","Kaiser Permanente","Medi-Cal","Medicare","UnitedHealth","Star Health","HDFC Ergo","ICICI Lombard","Self-pay"];

export default function InsuranceInformation({ onSave }: { onSave?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ provider: "", policyNumber: "", groupNumber: "", validUntil: "" });

  useEffect(() => {
    patientsService.getInsurance()
      .then(ins => {
        if (ins) {
          setForm({
            provider: ins.provider,
            policyNumber: ins.policy_number,
            groupNumber: ins.group_number || "",
            validUntil: ins.valid_until ? ins.valid_until.slice(0, 10) : "",
          });
        }
      })
      .catch(err => setError(err.message || "Failed to load insurance info"))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.provider || !form.policyNumber) return;
    setSaving(true);
    setError("");
    try {
      await patientsService.updateInsurance({
        provider: form.provider,
        policy_number: form.policyNumber,
        group_number: form.groupNumber || undefined,
        valid_until: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      });
      onSave?.();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl border border-border">
        <Shield className="w-5 h-5 text-accent flex-shrink-0" />
        <p className="text-sm text-muted-foreground">Your insurance information is used to verify coverage when booking appointments.</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Provider *</label>
            <select value={form.provider} onChange={e => set("provider", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select…</option>
              {PROVIDERS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Valid until <span className="font-normal">(optional)</span></label>
            <input type="date" value={form.validUntil} onChange={e => set("validUntil", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Policy number *</label>
            <input value={form.policyNumber} onChange={e => set("policyNumber", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Group number <span className="font-normal">(optional)</span></label>
            <input value={form.groupNumber} onChange={e => set("groupNumber", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
      <button onClick={handleSave} disabled={saving || !form.provider || !form.policyNumber} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : "Save insurance info"}
      </button>
    </div>
  );
}