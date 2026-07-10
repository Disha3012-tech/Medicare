import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, Plus, X } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { authService } from "../services/auth";
import { doctorsService, type AvailabilitySlot } from "../services/doctors";

type Step = 1 | 2 | 3 | 4;

const SPECIALTIES = ["Cardiology","Dermatology","Endocrinology","General Practice","Neurology","Orthopedics","Pediatrics","Psychiatry","Radiology","Oncology"];
const DAYS         = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIME_SLOTS   = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
const COUNTRY_CODES = ["+91","+1","+44","+61","+971","+65"];

const DAY_TO_WEEKDAY: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

const STEP_LABELS: Record<Step, string> = {
  1: "Personal Info",
  2: "Qualifications",
  3: "Practice Details",
  4: "Availability",
};

interface FormState {
  fullName: string; countryCode: string; phone: string; gender: "Male" | "Female" | "";
  specialty: string; experience: string;
  qualifications: string[]; hospital: string;
  clinicAddress: string; city: string; state: string;
  consultationFee: string;
  availableDays: string[]; timeSlots: string[];
  bio: string;
}

const INITIAL: FormState = {
  fullName: "", countryCode: "+91", phone: "", gender: "",
  specialty: "", experience: "",
  qualifications: [], hospital: "",
  clinicAddress: "", city: "", state: "",
  consultationFee: "",
  availableDays: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
  timeSlots: ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM"],
  bio: "",
};

function to24Hour(time12: string): string {
  const match = time12.match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) return "00:00";
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

function addMinutes(time24: string, mins: number): string {
  const [h, m] = time24.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

export default function DoctorProfileSetup() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [qualInput, setQualInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill from any existing doctor profile (e.g. if they clicked "Skip for now" earlier and came back)
  useEffect(() => {
    doctorsService.getMe().then(d => {
      setForm(f => ({
        ...f,
        fullName: `${d.first_name} ${d.last_name}`.trim() || f.fullName,
        specialty: d.specialty || f.specialty,
        experience: d.years_experience ? String(d.years_experience) : f.experience,
        hospital: d.clinic_name || f.hospital,
        clinicAddress: d.clinic_address || f.clinicAddress,
        city: d.clinic_city || f.city,
        state: d.clinic_state || f.state,
        consultationFee: d.consultation_fee ? String(d.consultation_fee) : f.consultationFee,
        bio: d.bio || f.bio,
      }));
    }).catch(() => {
      // No doctor profile yet — fine, this is a fresh signup
    });
  }, []);

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  function toggleList(field: "availableDays" | "timeSlots", value: string) {
    const arr = form[field] as string[];
    set(field, arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  }

  function addQual() {
    if (!qualInput.trim()) return;
    set("qualifications", [...form.qualifications, qualInput.trim()]);
    setQualInput("");
  }

  function canProceed(): boolean {
    if (step === 1) return !!form.fullName && !!form.gender && !!form.phone;
    if (step === 2) return !!form.specialty && !!form.experience;
    if (step === 3) return !!form.hospital && !!form.consultationFee;
    return true;
  }

  function next() { if (step < 4) setStep((step + 1) as Step); }
  function back() { if (step > 1) setStep((step - 1) as Step); }

  async function finish() {
    setSaving(true);
    setError("");
    try {
      const [firstName = "", ...rest] = form.fullName.trim().split(/\s+/);
      const lastName = rest.join(" ") || "-";

      await authService.updateMe({
        first_name: firstName,
        last_name: lastName,
        phone: `${form.countryCode} ${form.phone}`,
      });

      await doctorsService.updateMe({
        specialty: form.specialty,
        years_experience: Number(form.experience) || 0,
        bio: form.bio || undefined,
        consultation_fee: Number(form.consultationFee) || 0,
        clinic_name: form.hospital,
        clinic_address: form.clinicAddress || undefined,
        clinic_city: form.city || undefined,
        clinic_state: form.state || undefined,
      });

      for (const q of form.qualifications) {
        await doctorsService.addQualification({ degree: q, institution: form.hospital || "Not specified", year: new Date().getFullYear() });
      }

      const slots: AvailabilitySlot[] = [];
      form.availableDays.forEach(day => {
        form.timeSlots.forEach(time => {
          const start = to24Hour(time);
          slots.push({
            day_of_week: DAY_TO_WEEKDAY[day],
            start_time: start,
            end_time: addMinutes(start, 30),
            slot_minutes: 30,
            is_active: true,
          });
        });
      });
      if (slots.length > 0) {
        await doctorsService.setMyAvailability(slots);
      }

      await refreshUser();
      navigate("/doctor");
    } catch (err: any) {
      setError(err.message || "Failed to save your profile. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-accent" />
          <span className="font-['Fraunces',serif] font-semibold text-primary">Medica</span>
        </div>
        <p className="text-xs text-muted-foreground">Step {step} of 4 — {STEP_LABELS[step]}</p>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex gap-1.5 mb-8">
          {([1,2,3,4] as Step[]).map(s => (
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
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full name *</label>
                <input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Dr. Jane Smith" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone number *</label>
                <div className="flex gap-2">
                  <select value={form.countryCode} onChange={e => set("countryCode", e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={form.phone} maxLength={10} onChange={e => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))} placeholder="9876543210" className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
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
                  <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="State" className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Consultation fee (₹) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <input type="number" value={form.consultationFee} onChange={e => set("consultationFee", e.target.value)} placeholder="1500" className="w-full bg-input-background border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Short professional bio <span className="font-normal text-muted-foreground">(optional)</span></label>
                <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} placeholder="Board-certified specialist with expertise in…" className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>
          )}

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
                <p className="text-xs text-muted-foreground mt-2">{form.timeSlots.length} slots selected across {form.availableDays.length} days · You can adjust this anytime in Availability settings.</p>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button onClick={back} className="flex items-center gap-1.5 border border-border rounded-xl px-5 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 4 ? (
              <button onClick={next} disabled={!canProceed()} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={!canProceed() || saving} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all">
                {saving ? <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />Setting up…</> : <><CheckCircle2 className="w-4 h-4" />Complete setup</>}
              </button>
            )}
          </div>
          {step < 4 && (
            <button onClick={() => navigate("/doctor")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">Skip for now</button>
          )}
        </div>
      </div>
    </div>
  );
}