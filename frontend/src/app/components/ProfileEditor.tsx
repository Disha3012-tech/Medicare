import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { authService } from "../services/auth";
import { doctorsService } from "../services/doctors";
import { SPECIALTIES, OTHERS_VALUE, resolveSpecialtySelection, resolveSpecialtyForSubmit } from "../services/specialties";

const COUNTRY_CODES = ["+91","+1","+44","+61","+971","+65"];

function splitPhone(full?: string | null): { code: string; number: string } {
  if (!full) return { code: "+91", number: "" };
  const match = full.match(/^(\+\d{1,3})\s?(.*)$/);
  return match ? { code: match[1], number: match[2] } : { code: "+91", number: full };
}

export default function ProfileEditor({ onSave }: { onSave?: () => void }) {
  const { user, doctorProfile, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", countryCode: "+91", phone: "", email: "",
    specialty: "", customSpecialty: "", experience: "", bio: "", consultationFee: "",
  });

  useEffect(() => {
    if (!user) return;
    const { code, number } = splitPhone(user.phone);
    const { selected, customText } = resolveSpecialtySelection(doctorProfile?.specialty);
    setForm({
      firstName: user.first_name,
      lastName: user.last_name,
      countryCode: code,
      phone: number,
      email: user.email,
      specialty: selected,
      customSpecialty: customText,
      experience: doctorProfile ? String(doctorProfile.years_experience) : "",
      bio: doctorProfile?.bio || "",
      consultationFee: doctorProfile ? String(doctorProfile.consultation_fee) : "",
    });
    setLoading(false);
  }, [user, doctorProfile]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (form.specialty === OTHERS_VALUE && !form.customSpecialty.trim()) {
      setError("Please enter your specialty.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await authService.updateMe({
        first_name: form.firstName,
        last_name: form.lastName,
        phone: `${form.countryCode} ${form.phone}`,
      });
      const finalSpecialty = resolveSpecialtyForSubmit(form.specialty, form.customSpecialty);
      await doctorsService.updateMe({
        specialty: finalSpecialty || undefined,
        years_experience: form.experience ? Number(form.experience) : undefined,
        bio: form.bio || undefined,
        consultation_fee: form.consultationFee ? Number(form.consultationFee) : undefined,
      });
      await refreshUser();
      onSave?.();
    } catch (err: any) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl font-semibold text-accent">
          {form.firstName[0]}{form.lastName[0]}
        </div>
        <div>
          <p className="font-medium text-foreground">Dr. {form.firstName} {form.lastName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{form.email}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">First name</label>
          <input value={form.firstName} onChange={e => set("firstName", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Last name</label>
          <input value={form.lastName} onChange={e => set("lastName", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
          <div className="flex gap-2">
            <select value={form.countryCode} onChange={e => set("countryCode", e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.phone} onChange={e => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))} maxLength={10} className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input value={form.email} disabled className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Specialty</label>
          <select value={form.specialty} onChange={e => set("specialty", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select…</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            <option value={OTHERS_VALUE}>Others</option>
          </select>
          {form.specialty === OTHERS_VALUE && (
            <input
              type="text"
              placeholder="Enter your specialty"
              value={form.customSpecialty}
              onChange={e => set("customSpecialty", e.target.value)}
              className="w-full mt-2 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Years of experience</label>
          <input type="number" value={form.experience} onChange={e => set("experience", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Consultation fee (₹)</label>
          <input type="number" value={form.consultationFee} onChange={e => set("consultationFee", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Professional bio</label>
        <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={4} className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>
      {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}