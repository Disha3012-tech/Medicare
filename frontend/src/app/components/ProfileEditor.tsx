import { useState } from "react";
import { Camera, Save } from "lucide-react";

const LANGUAGES = ["English","French","Spanish","German","Hindi","Arabic","Japanese","Mandarin"];
const SPECIALTIES = ["Cardiology","Dermatology","Endocrinology","General Practice","Neurology","Orthopedics","Pediatrics","Psychiatry"];

export default function ProfileEditor({ onSave }: { onSave?: () => void }) {
  const [form, setForm] = useState({
    firstName: "Amara", lastName: "Osei", specialty: "Cardiology",
    experience: "14", bio: "Board-certified interventional cardiologist with over 14 years of experience treating complex coronary artery disease, heart failure, and structural heart conditions.",
    phone: "+1 (415) 555-0301", email: "amara.osei@stlukes.org",
    languages: ["English", "French"],
    consultationFee: "220",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function toggleLanguage(lang: string) {
    setForm(f => ({ ...f, languages: f.languages.includes(lang) ? f.languages.filter(l => l !== lang) : [...f.languages, lang] }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Photo */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted">
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format" alt="" className="w-full h-full object-cover" />
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="font-medium text-foreground">Dr. Amara Osei</p>
          <p className="text-xs text-muted-foreground mt-0.5">Professional headshot recommended</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[["firstName","First name"],["lastName","Last name"],["phone","Phone"],["email","Email"]].map(([k, label]) => (
          <div key={k}>
            <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
            <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Specialty</label>
          <select value={form.specialty} onChange={e => set("specialty", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Years of experience</label>
          <input type="number" value={form.experience} onChange={e => set("experience", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Consultation fee ($)</label>
          <input type="number" value={form.consultationFee} onChange={e => set("consultationFee", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Professional bio</label>
        <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={4} className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Languages spoken</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button key={lang} onClick={() => toggleLanguage(lang)} className={`text-sm px-3 py-1.5 rounded-xl border-2 transition-all ${form.languages.includes(lang) ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}>
              {lang}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
        <Save className="w-4 h-4" /> Save profile
      </button>
    </div>
  );
}
