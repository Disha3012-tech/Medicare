import { useState, useEffect } from "react";
import { Save, Loader2, HeartPulse, X, Plus } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { patientsService } from "../services/patients";

const ALLERGY_SUGGESTIONS = ["Penicillin","Aspirin","Ibuprofen","Sulfonamides","Latex","Peanuts","Shellfish","Eggs"];
const CONDITION_SUGGESTIONS = ["Hypertension","Type 2 Diabetes","Asthma","Hypothyroidism","Anxiety Disorder","GERD","Arthritis","Migraine"];

export default function HealthParameters({ onSave }: { onSave?: () => void }) {
  const { patientProfile, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");

  useEffect(() => {
    if (!patientProfile) return;
    setHeight(patientProfile.height != null ? String(patientProfile.height) : "");
    setWeight(patientProfile.weight != null ? String(patientProfile.weight) : "");
    setAllergies(patientProfile.allergies || []);
    setConditions(patientProfile.chronic_conditions || []);
    setLoading(false);
  }, [patientProfile]);

  function addTag(list: string[], setList: (v: string[]) => void, value: string, clearInput: () => void) {
    const trimmed = value.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
    clearInput();
  }

  function removeTag(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.filter(v => v !== value));
  }

  const bmi = height && weight
    ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1)
    : null;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await patientsService.updateMe({
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        allergies,
        chronic_conditions: conditions,
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
        <HeartPulse className="w-5 h-5 text-accent flex-shrink-0" />
        <p className="text-sm text-muted-foreground">Keep your health information current so your care team has accurate data.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      {bmi && (
        <div className="bg-muted rounded-xl p-3 text-sm text-muted-foreground">
          Estimated BMI: <span className="font-medium text-foreground">{bmi}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Known allergies</label>
        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {allergies.map(a => (
              <span key={a} className="flex items-center gap-1 bg-destructive/10 text-destructive text-xs px-2.5 py-1 rounded-full">
                {a}<button onClick={() => removeTag(allergies, setAllergies, a)} className="ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(allergies, setAllergies, allergyInput, () => setAllergyInput("")))} placeholder="Type and press Enter" className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={() => addTag(allergies, setAllergies, allergyInput, () => setAllergyInput(""))} className="px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {ALLERGY_SUGGESTIONS.filter(s => !allergies.includes(s)).slice(0, 6).map(s => (
            <button key={s} onClick={() => addTag(allergies, setAllergies, s, () => {})} className="text-xs border border-border text-muted-foreground px-2.5 py-1 rounded-full hover:border-destructive/40 hover:text-destructive transition-all">{s}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Existing conditions</label>
        {conditions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {conditions.map(c => (
              <span key={c} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                {c}<button onClick={() => removeTag(conditions, setConditions, c)} className="ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input value={conditionInput} onChange={e => setConditionInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(conditions, setConditions, conditionInput, () => setConditionInput("")))} placeholder="Type and press Enter" className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={() => addTag(conditions, setConditions, conditionInput, () => setConditionInput(""))} className="px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {CONDITION_SUGGESTIONS.filter(s => !conditions.includes(s)).slice(0, 6).map(s => (
            <button key={s} onClick={() => addTag(conditions, setConditions, s, () => {})} className="text-xs border border-border text-muted-foreground px-2.5 py-1 rounded-full hover:border-primary/40 hover:text-primary transition-all">{s}</button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : "Save health parameters"}
      </button>
    </div>
  );
}