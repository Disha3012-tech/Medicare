import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, Plus, X } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { authService } from "../services/auth";
import { patientsService } from "../services/patients";

type Step = 1 | 2 | 3 | 4;

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const ALLERGIES_SUGGESTIONS = ["Penicillin","Aspirin","Ibuprofen","Sulfonamides","Latex","Peanuts","Shellfish","Eggs"];
const DISEASES_SUGGESTIONS  = ["Hypertension","Type 2 Diabetes","Asthma","Hypothyroidism","Anxiety Disorder","GERD","Arthritis","Migraine"];
const COUNTRY_CODES = ["+91","+1","+44","+61","+971","+65"];
const RELATIONSHIPS = ["Mother","Father","Spouse","Partner","Sibling","Friend","Other"];

const STEP_LABELS: Record<Step, string> = {
  1: "Personal Info",
  2: "Health Metrics",
  3: "Medical History",
  4: "Emergency Contact",
};

const GENDER_MAP: Record<string, string> = { Male: "MALE", Female: "FEMALE" };

interface FormState {
  fullName: string; countryCode: string; phone: string; dob: string; gender: "Male" | "Female" | "";
  height: string; weight: string; bloodGroup: string;
  allergies: string[]; diseases: string[];
  emergencyName: string; emergencyRelation: string; emergencyCountryCode: string; emergencyPhone: string;
  address: string; city: string; state: string; zip: string;
}

const INITIAL: FormState = {
  fullName: "", countryCode: "+91", phone: "", dob: "", gender: "",
  height: "", weight: "", bloodGroup: "O+",
  allergies: [], diseases: [],
  emergencyName: "", emergencyRelation: "", emergencyCountryCode: "+91", emergencyPhone: "",
  address: "", city: "", state: "", zip: "",
};

export default function PatientProfileSetup() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [allergyInput, setAllergyInput] = useState("");
  const [diseaseInput, setDiseaseInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    patientsService.getMe().then(p => {
      setForm(f => ({
        ...f,
        dob: p.date_of_birth ? p.date_of_birth.slice(0, 10) : f.dob,
        gender: p.gender === "MALE" ? "Male" : p.gender === "FEMALE" ? "Female" : f.gender,
        height: p.height != null ? String(p.height) : f.height,
        weight: p.weight != null ? String(p.weight) : f.weight,
        bloodGroup: p.blood_group || f.bloodGroup,
        allergies: p.allergies || f.allergies,
        diseases: p.chronic_conditions || f.diseases,
        address: p.address || f.address,
        city: p.city || f.city,
        state: p.state || f.state,
        zip: p.zip_code || f.zip,
      }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    authService.getMe().then(u => {
      setForm(f => ({ ...f, fullName: `${u.first_name} ${u.last_name}`.trim() || f.fullName }));
    }).catch(() => {});
  }, []);

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  function addTag(field: "allergies" | "diseases", value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!form[field].includes(trimmed)) set(field, [...form[field], trimmed]);
    if (field === "allergies") setAllergyInput("");
    else setDiseaseInput("");
  }

  function removeTag(field: "allergies" | "diseases", value: string) {
    set(field, form[field].filter(v => v !== value));
  }

  function canProceed(): boolean {
    if (step === 1) return !!form.fullName && !!form.dob && !!form.gender && !!form.phone;
    if (step === 2) return !!form.height && !!form.weight;
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

      await patientsService.updateMe({
        date_of_birth: form.dob ? new Date(form.dob).toISOString() : undefined,
        gender: (GENDER_MAP[form.gender] as any) || undefined,
        blood_group: form.bloodGroup || undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        allergies: form.allergies,
        chronic_conditions: form.diseases,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zip_code: form.zip || undefined,
      });

      if (form.emergencyName && form.emergencyPhone) {
        await patientsService.updateEmergencyContact({
          name: form.emergencyName,
          relationship: form.emergencyRelation || "Other",
          phone: `${form.emergencyCountryCode} ${form.emergencyPhone}`,
        });
      }

      await refreshUser();
      navigate("/patient");
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
              {step === 1 && "Tell us a little about yourself."}
              {step === 2 && "Your current health measurements."}
              {step === 3 && "Share your medical background so doctors can care for you better."}
              {step === 4 && "Who should we contact in case of an emergency?"}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full name *</label>
                <input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Alex Johnson" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
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
                <label className="block text-sm font-medium text-foreground mb-1.5">Date of birth *</label>
                <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Gender *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Male","Female"] as const).map(g => (
                    <button key={g} onClick={() => set("gender", g)} className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${form.gender === g ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Home address</p>
                <div className="space-y-3">
                  <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street address" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <div className="grid grid-cols-3 gap-2">
                    {[["city","City"],["state","State"],["zip","ZIP"]].map(([k, label]) => (
                      <input key={k} value={(form as any)[k]} onChange={e => set(k as keyof FormState, e.target.value)} placeholder={label} className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Height (cm) *</label>
                  <input type="number" value={form.height} onChange={e => set("height", e.target.value)} placeholder="170" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Weight (kg) *</label>
                  <input type="number" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="70" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Blood group</label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map(bg => (
                    <button key={bg} onClick={() => set("bloodGroup", bg)} className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${form.bloodGroup === bg ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/30"}`}>{bg}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Known allergies</label>
                {form.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.allergies.map(a => (
                      <span key={a} className="flex items-center gap-1 bg-destructive/10 text-destructive text-xs px-2.5 py-1 rounded-full">
                        {a}<button onClick={() => removeTag("allergies", a)} className="ml-0.5"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("allergies", allergyInput))} placeholder="Type and press Enter" className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => addTag("allergies", allergyInput)} className="px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ALLERGIES_SUGGESTIONS.filter(s => !form.allergies.includes(s)).slice(0, 6).map(s => (
                    <button key={s} onClick={() => addTag("allergies", s)} className="text-xs border border-border text-muted-foreground px-2.5 py-1 rounded-full hover:border-destructive/40 hover:text-destructive transition-all">{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Existing conditions</label>
                {form.diseases.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.diseases.map(d => (
                      <span key={d} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                        {d}<button onClick={() => removeTag("diseases", d)} className="ml-0.5"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={diseaseInput} onChange={e => setDiseaseInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag("diseases", diseaseInput))} placeholder="Type and press Enter" className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => addTag("diseases", diseaseInput)} className="px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {DISEASES_SUGGESTIONS.filter(s => !form.diseases.includes(s)).slice(0, 6).map(s => (
                    <button key={s} onClick={() => addTag("diseases", s)} className="text-xs border border-border text-muted-foreground px-2.5 py-1 rounded-full hover:border-primary/40 hover:text-primary transition-all">{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Emergency contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Contact name</label>
                    <input value={form.emergencyName} onChange={e => set("emergencyName", e.target.value)} placeholder="Jane Johnson" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Relationship</label>
                    <select value={form.emergencyRelation} onChange={e => set("emergencyRelation", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select…</option>
                      {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone number</label>
                    <div className="flex gap-2">
                      <select value={form.emergencyCountryCode} onChange={e => set("emergencyCountryCode", e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input value={form.emergencyPhone} maxLength={10} onChange={e => set("emergencyPhone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))} placeholder="9876543210" className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                </div>
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
                {saving ? <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Setting up…</> : <><CheckCircle2 className="w-4 h-4" /> Complete setup</>}
              </button>
            )}
          </div>

          {step < 4 && (
            <button onClick={() => navigate("/patient")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}