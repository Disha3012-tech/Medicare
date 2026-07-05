import { useState, useEffect } from "react";
import { Save, Building2, Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { doctorsService } from "../services/doctors";

export default function ClinicInformation({ onSave }: { onSave?: () => void }) {
  const { doctorProfile, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    hospital: "", address: "", city: "", state: "", consultationFee: "",
  });

  useEffect(() => {
    if (!doctorProfile) return;
    setForm({
      hospital: doctorProfile.clinic_name || "",
      address: doctorProfile.clinic_address || "",
      city: doctorProfile.clinic_city || "",
      state: doctorProfile.clinic_state || "",
      consultationFee: String(doctorProfile.consultation_fee ?? ""),
    });
    setLoading(false);
  }, [doctorProfile]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await doctorsService.updateMe({
        clinic_name: form.hospital || undefined,
        clinic_address: form.address || undefined,
        clinic_city: form.city || undefined,
        clinic_state: form.state || undefined,
        consultation_fee: form.consultationFee ? Number(form.consultationFee) : undefined,
      });
      await refreshUser();
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
        <Building2 className="w-5 h-5 text-accent flex-shrink-0" />
        <p className="text-sm text-muted-foreground">This information is shown to patients when they search for you or view your profile.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Hospital / Clinic name</label>
        <input value={form.hospital} onChange={e => set("hospital", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Clinic address</label>
        <input value={form.address} onChange={e => set("address", e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="State" className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Consultation fee (₹)</label>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
          <input type="number" value={form.consultationFee} onChange={e => set("consultationFee", e.target.value)} className="w-full bg-input-background border border-border rounded-lg pl-7 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : "Save clinic info"}
      </button>
    </div>
  );
}