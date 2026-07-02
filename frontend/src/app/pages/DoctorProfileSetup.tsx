import { useState } from "react";
import { useNavigate } from "react-router";
import { HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, Plus, X } from "lucide-react";
import AvatarSelector, { type AvatarId, getAvatarById } from "../components/AvatarSelector";

type Step = 1 | 2 | 3 | 4 | 5;

const SPECIALTIES = ["Cardiology","Dermatology","Endocrinology","General Practice","Neurology","Orthopedics","Pediatrics","Psychiatry","Radiology","Oncology"];
const LANGUAGES    = ["English","Spanish","French","German","Hindi","Arabic","Mandarin","Japanese","Portuguese"];
const DAYS         = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIME_SLOTS   = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

const STEP_LABELS: Record<Step, string> = {
  1: "Personal Info",
  2: "Qualifications",
  3: "Practice Details",
  4: "Availability",
  5: "Choose Avatar",
};

interface FormState {
  fullName: string; gender: "Male" | "Female" | "";
  specialty: string; experience: string;
  qualifications: string[]; hospital: string;
  clinicAddress: string; city: string; state: string;
  consultationFee: string; languages: string[];
  availableDays: string[]; timeSlots: string[];
  bio: string; avatarId: AvatarId | null;
}

const INITIAL: FormState = {
  fullName: "", gender: "",
  specialty: "", experience: "",
  qualifications: [], hospital: "",
  clinicAddress: "", city: "", state: "",
  consultationFee: "", languages: ["English"],
  availableDays: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
  timeSlots: ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM"],
  bio: "", avatarId: null,
};

export default function DoctorProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [qualInput, setQualInput] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  function toggleList(field: "availableDays" | "timeSlots" | "languages", value: string) {
    const arr = form[field] as string[];
    set(field, arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  }

  function addQual() {
    if (!qualInput.trim()) return;
    set("qualifications", [...form.qualifications, qualInput.trim()]);
    setQualInput("");
  }

  function canProceed(): boolean {
    if (step === 1) return !!form.fullName && !!form.gender;
    if (step === 2) return !!form.specialty && !!form.experience;
    if (step === 3) return !!form.hospital && !!form.consultationFee;
    if (step === 5) return !!form.avatarId;
    return true;
  }

  function next() { if (step < 5) setStep((step + 1) as Step); }
  function back() { if (step > 1) setStep((step - 1) as Step); }

  function finish() {
    setSaving(true);
    setTimeout(() => navigate("/doctor"), 1200);
  }

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-accent" />
          <span className="font-['Fraunces',serif] font-semibold text-primary">Medica</span>
        </div>
        <p className="text-xs text-muted-foreground">Step {step} of 5 — {STEP_LABELS[step]}</p>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex gap-1.5 mb-8">
          {([1,2,3,4,5] as Step[]).map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <div className="mb-2">
            <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">{STEP_LABELS[step]}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step === 1 && "Basic information about you."}
              {step === 2 && "Your medical qualifications and specialty."}
              {step === 3 && "Where you practice and consultation fees."}
              {step === 4 && "When patients can book appointments with you."}
              {step === 5 && "Pick an avatar that best represents you."}
            </p>
          </div>

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full name *</label>
                <input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Dr. Jane Smith" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Gender *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Male","Female"] as const).map(g => (
                    <button key={g} onClick={() => set("gender", g)} className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${form.gender === g ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Qualifications */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Medical specialty *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALTIES.map(s => (
                    <button key={s} onClick={() => set("specialty", s)} className={`text-sm px-3 py-2.5 rounded-xl border-2 transition-all text-left ${form.specialty === s ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Years of experience *</label>
                <input type="number" value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="e.g. 8" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Qualifications</label>
                {form.qualifications.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5">
                    <span className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 text-foreground truncate">{q}</span>
                    <button onClick={() => set("qualifications", form.qualifications.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={qualInput} onChange={e => setQualInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addQual())} placeholder="MD, MBBS, Fellowship…" className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={addQual} className="px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Practice */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Hospital / Clinic name *</label>
                <input value={form.hospital} onChange={e => set("hospital", e.target.value)} placeholder="St. Luke's Medical Center" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Clinic address</label>
                <input value={form.clinicAddress} onChange={e => set("clinicAddress", e.target.value)} placeholder="Street address" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="State / ZIP" className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Consultation fee ($) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input type="number" value={form.consultationFee} onChange={e => set("consultationFee", e.target.value)} placeholder="200" className="w-full bg-input-background border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Languages spoken</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l} onClick={() => toggleList("languages", l)} className={`text-sm px-3 py-1.5 rounded-xl border-2 transition-all ${form.languages.includes(l) ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Short professional bio <span className="font-normal text-muted-foreground">(optional)</span></label>
                <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} placeholder="Board-certified specialist with expertise in…" className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>
          )}

          {/* Step 4: Availability */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Available days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(d => (
                    <button key={d} onClick={() => toggleList("availableDays", d)} className={`text-sm px-3 py-2 rounded-xl border-2 transition-all ${form.availableDays.includes(d) ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}>{d.slice(0, 3)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Available time slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button key={t} onClick={() => toggleList("timeSlots", t)} className={`text-sm py-2.5 rounded-xl border-2 transition-all ${form.timeSlots.includes(t) ? "border-primary bg-primary text-primary-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}>{t}</button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{form.timeSlots.length} slots selected · You can adjust this anytime in Availability settings.</p>
              </div>
            </div>
          )}

          {/* Step 5: Avatar */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose an avatar for your public doctor profile.</p>
              <AvatarSelector
                gender={(form.gender as "male" | "female")?.toLowerCase() as "male" | "female" || "male"}
                selected={form.avatarId}
                onSelect={id => set("avatarId", id)}
              />
              {form.avatarId && (
                <div className="flex items-center gap-3 bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                    {getAvatarById(form.avatarId)?.svg}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Selected: {getAvatarById(form.avatarId)?.label}</p>
                    <p className="text-xs text-muted-foreground">Visible to all patients on your profile.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nav */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button onClick={back} className="flex items-center gap-1.5 border border-border rounded-xl px-5 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 5 ? (
              <button onClick={next} disabled={!canProceed()} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={!canProceed() || saving} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all">
                {saving ? <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />Setting up…</> : <><CheckCircle2 className="w-4 h-4" />Complete setup</>}
              </button>
            )}
          </div>
          {step < 5 && (
            <button onClick={() => navigate("/doctor")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">Skip for now</button>
          )}
        </div>
      </div>
    </div>
  );
}
