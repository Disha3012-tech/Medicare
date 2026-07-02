import { useState } from "react";
import { Save, UserCheck } from "lucide-react";

export default function EmergencyContact({ onSave }: { onSave?: () => void }) {
  const [form, setForm] = useState({ name: "Linda Johnson", relationship: "Mother", phone: "+1 (415) 555-0177", email: "linda.johnson@email.com", altPhone: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

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
            {["Mother","Father","Spouse","Partner","Sibling","Child","Friend","Other"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Primary phone</label>
          <input value={form.phone} onChange={e => set("phone", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Secondary phone <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={form.altPhone} onChange={e => set("altPhone", e.target.value)} placeholder="+1 (---) ---" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Email address <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={form.email} onChange={e => set("email", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <button onClick={onSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
        <Save className="w-4 h-4" /> Save contact
      </button>
    </div>
  );
}
