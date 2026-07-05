import { useState, useEffect } from "react";
import { Save, UserCheck, Loader2 } from "lucide-react";
import { patientsService } from "../services/patients";

const COUNTRY_CODES = ["+91","+1","+44","+61","+971","+65"];
const RELATIONSHIPS = ["Mother","Father","Spouse","Partner","Sibling","Child","Friend","Other"];

function splitPhone(full?: string): { code: string; number: string } {
  if (!full) return { code: "+91", number: "" };
  const match = full.match(/^(\+\d{1,3})\s?(.*)$/);
  return match ? { code: match[1], number: match[2] } : { code: "+91", number: full };
}

export default function EmergencyContact({ onSave }: { onSave?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", relationship: "Mother", countryCode: "+91", phone: "", email: "" });

  useEffect(() => {
    patientsService.getEmergencyContact()
      .then(contact => {
        if (contact) {
          const { code, number } = splitPhone(contact.phone);
          setForm({ name: contact.name, relationship: contact.relationship, countryCode: code, phone: number, email: contact.email || "" });
        }
      })
      .catch(err => setError(err.message || "Failed to load emergency contact"))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await patientsService.updateEmergencyContact({
        name: form.name,
        relationship: form.relationship,
        phone: `${form.countryCode} ${form.phone}`,
        email: form.email || undefined,
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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl border border-border">
        <UserCheck className="w-5 h-5 text-accent flex-shrink-0" />
        <p className="text-sm text-muted-foreground">Your emergency contact will be notified in case of a medical emergency. Keep this information up to date.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Relationship</label>
          <select value={form.relationship} onChange={e => set("relationship", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone number</label>
          <div className="flex gap-2">
            <select value={form.countryCode} onChange={e => set("countryCode", e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.phone} onChange={e => set("phone", e.target.value.replace(/[^\d]/g, ""))} placeholder="98765 43210" className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Email address <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={form.email} onChange={e => set("email", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : "Save contact"}
      </button>
    </div>
  );
}