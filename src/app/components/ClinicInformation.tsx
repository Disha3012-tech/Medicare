import { useState } from "react";
import { Save, Building2 } from "lucide-react";

export default function ClinicInformation({ onSave }: { onSave?: () => void }) {
  const [form, setForm] = useState({
    hospital: "St. Luke's Medical Center", department: "Cardiology",
    address: "3555 Cesar Chavez St", city: "San Francisco", state: "CA", zip: "94110",
    officePhone: "+1 (415) 600-7200", officeEmail: "cardiology@stlukes.org",
    appointmentTypes: ["in-person", "video"],
    consultationFee: "220", followUpFee: "120", videoFee: "180",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function toggleType(t: string) {
    setForm(f => ({ ...f, appointmentTypes: f.appointmentTypes.includes(t) ? f.appointmentTypes.filter(x => x !== t) : [...f.appointmentTypes, t] }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl border border-border">
        <Building2 className="w-5 h-5 text-accent flex-shrink-0" />
        <p className="text-sm text-muted-foreground">This information is shown to patients when they search for you or view your profile.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[["hospital","Hospital / Clinic name"],["department","Department"],["officePhone","Office phone"],["officeEmail","Office email"]].map(([k, label]) => (
          <div key={k}>
            <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
            <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Clinic address</label>
        <input value={form.address} onChange={e => set("address", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-2" />
        <div className="grid grid-cols-3 gap-2">
          {[["city","City"],["state","State"],["zip","ZIP"]].map(([k, label]) => (
            <div key={k}>
              <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder={label} className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Appointment types offered</label>
        <div className="flex gap-2">
          {[["in-person","In-person"],["video","Video call"]].map(([val, label]) => (
            <button key={val} onClick={() => toggleType(val)} className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${form.appointmentTypes.includes(val) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{label}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Consultation fees ($)</label>
        <div className="grid grid-cols-3 gap-3">
          {[["consultationFee","New patient"],["followUpFee","Follow-up"],["videoFee","Video call"]].map(([k, label]) => (
            <div key={k}>
              <label className="block text-xs text-muted-foreground mb-1">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="w-full bg-input-background border border-border rounded-lg pl-7 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={onSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
        <Save className="w-4 h-4" /> Save clinic info
      </button>
    </div>
  );
}
