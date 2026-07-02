import { useState } from "react";
import { Save, Camera } from "lucide-react";

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const LANGUAGES    = ["English","Spanish","French","Mandarin","Hindi","Arabic","Portuguese","Japanese"];

export default function ProfileSettings({ onSave }: { onSave?: () => void }) {
  const [form, setForm] = useState({
    firstName: "Alex", lastName: "Johnson", dob: "1990-06-14",
    gender: "Male", bloodGroup: "O+", phone: "+1 (415) 555-0100",
    email: "alex.johnson@email.com", address: "742 Evergreen Terrace",
    city: "San Francisco", state: "CA", zip: "94102", language: "English",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl font-semibold text-accent">AJ</div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="font-medium text-foreground">Alex Johnson</p>
          <p className="text-xs text-muted-foreground mt-0.5">JPG or PNG, max 5 MB</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[["firstName","First name"],["lastName","Last name"],["phone","Phone number"],["email","Email address"]].map(([k, label]) => (
          <div key={k}>
            <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
            <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Date of birth</label>
          <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Blood group</label>
          <select value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
          <select value={form.gender} onChange={e => set("gender", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {["Male","Female","Non-binary","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Language</label>
          <select value={form.language} onChange={e => set("language", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Street address</label>
        <input value={form.address} onChange={e => set("address", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[["city","City"],["state","State"],["zip","ZIP"]].map(([k, label]) => (
          <div key={k}>
            <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
            <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        ))}
      </div>
      <button onClick={onSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
        <Save className="w-4 h-4" /> Save changes
      </button>
    </div>
  );
}
