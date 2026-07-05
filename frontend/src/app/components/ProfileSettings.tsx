import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { authService } from "../services/auth";
import { patientsService } from "../services/patients";

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const COUNTRY_CODES = ["+91","+1","+44","+61","+971","+65"];
const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

function splitPhone(full?: string | null): { code: string; number: string } {
  if (!full) return { code: "+91", number: "" };
  const match = full.match(/^(\+\d{1,3})\s?(.*)$/);
  return match ? { code: match[1], number: match[2] } : { code: "+91", number: full };
}

export default function ProfileSettings({ onSave }: { onSave?: () => void }) {
  const { user, patientProfile, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", dob: "",
    gender: "PREFER_NOT_TO_SAY", bloodGroup: "", countryCode: "+91", phone: "",
    email: "", address: "", city: "", state: "", zip: "",
  });

  useEffect(() => {
    if (!user) return;
    const { code, number } = splitPhone(user.phone);
    setForm({
      firstName: user.first_name,
      lastName: user.last_name,
      dob: patientProfile?.date_of_birth ? patientProfile.date_of_birth.slice(0, 10) : "",
      gender: patientProfile?.gender || "PREFER_NOT_TO_SAY",
      bloodGroup: patientProfile?.blood_group || "",
      countryCode: code,
      phone: number,
      email: user.email,
      address: patientProfile?.address || "",
      city: patientProfile?.city || "",
      state: patientProfile?.state || "",
      zip: patientProfile?.zip_code || "",
    });
    setLoading(false);
  }, [user, patientProfile]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await authService.updateMe({
        first_name: form.firstName,
        last_name: form.lastName,
        phone: `${form.countryCode} ${form.phone}`,
      });
      await patientsService.updateMe({
        date_of_birth: form.dob ? new Date(form.dob).toISOString() : undefined,
        gender: form.gender as any,
        blood_group: form.bloodGroup || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zip_code: form.zip || undefined,
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
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl font-semibold text-accent">
          {form.firstName[0]}{form.lastName[0]}
        </div>
        <div>
          <p className="font-medium text-foreground">{form.firstName} {form.lastName}</p>
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
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone number</label>
          <div className="flex gap-2">
            <select value={form.countryCode} onChange={e => set("countryCode", e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.phone} onChange={e => set("phone", e.target.value)} className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
          <input value={form.email} disabled className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Date of birth</label>
          <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Blood group</label>
          <select value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Not set</option>
            {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
          <select value={form.gender} onChange={e => set("gender", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Street address</label>
        <input value={form.address} onChange={e => set("address", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
          <input value={form.city} onChange={e => set("city", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">State</label>
          <input value={form.state} onChange={e => set("state", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">ZIP</label>
          <input value={form.zip} onChange={e => set("zip", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}