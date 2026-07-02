import { useState } from "react";
import { Activity, Loader2, AlertTriangle, Info } from "lucide-react";
import PatientShell from "../components/PatientShell";
import SymptomInput from "../components/SymptomInput";
import SymptomSuggestions from "../components/SymptomSuggestions";
import RecommendedDoctors from "../components/RecommendedDoctors";
import type { Condition } from "../components/DiagnosisCard";

interface SymptomResult { conditions: Condition[]; specialists: string[]; emergency: boolean; }

const SYMPTOM_DB: Record<string, SymptomResult> = {
  "Chest pain": { conditions: [{ name: "Acute Coronary Syndrome", probability: "High", description: "Reduced blood flow to the heart muscle. Requires urgent evaluation especially if accompanied by sweating or arm pain.", urgency: "urgent" }, { name: "Costochondritis", probability: "Moderate", description: "Inflammation of rib cartilage causing sharp, localized chest wall pain that worsens with movement.", urgency: "soon" }, { name: "GERD / Acid Reflux", probability: "Moderate", description: "Stomach acid flowing back into the esophagus, often felt as a burning sensation behind the sternum.", urgency: "routine" }], specialists: ["Cardiology"], emergency: true },
  "Shortness of breath": { conditions: [{ name: "Asthma", probability: "Moderate", description: "Chronic airway inflammation causing wheezing, coughing, and difficulty breathing.", urgency: "soon" }, { name: "Heart Failure", probability: "Moderate", description: "The heart cannot pump blood efficiently, leading to fluid accumulation and breathlessness.", urgency: "urgent" }, { name: "Anxiety Attack", probability: "Moderate", description: "Hyperventilation during acute anxiety can mimic respiratory distress.", urgency: "routine" }], specialists: ["Cardiology", "General Practice"], emergency: true },
  "Headache": { conditions: [{ name: "Tension Headache", probability: "High", description: "The most common headache type, often described as a tight band around the head. Usually stress-related.", urgency: "routine" }, { name: "Migraine", probability: "Moderate", description: "Recurrent, throbbing headaches often accompanied by nausea, light sensitivity, and visual disturbances.", urgency: "soon" }, { name: "Hypertension Headache", probability: "Low", description: "Severe headache accompanying very high blood pressure. Usually felt at the back of the head.", urgency: "soon" }], specialists: ["Neurology", "General Practice"], emergency: false },
  "Fever": { conditions: [{ name: "Viral Upper Respiratory Infection", probability: "High", description: "Common cold or flu caused by various viruses. Typically self-limiting within 7–10 days.", urgency: "routine" }, { name: "Bacterial Infection", probability: "Moderate", description: "May require antibiotic treatment depending on the source (UTI, pneumonia, cellulitis).", urgency: "soon" }, { name: "COVID-19", probability: "Moderate", description: "SARS-CoV-2 infection presenting with fever, fatigue, and respiratory symptoms.", urgency: "soon" }], specialists: ["General Practice"], emergency: false },
  "Cough": { conditions: [{ name: "Acute Bronchitis", probability: "High", description: "Inflammation of the bronchial tubes, often following a respiratory infection. Usually resolves in 2–3 weeks.", urgency: "routine" }, { name: "Allergic Rhinitis", probability: "Moderate", description: "Post-nasal drip from allergies causing a persistent cough, especially at night.", urgency: "routine" }, { name: "Asthma", probability: "Low", description: "Chronic airway inflammation that can present with cough as the predominant symptom.", urgency: "soon" }], specialists: ["General Practice"], emergency: false },
  "Body pain": { conditions: [{ name: "Fibromyalgia", probability: "Moderate", description: "Widespread musculoskeletal pain with tenderness, fatigue, and sleep disturbances.", urgency: "soon" }, { name: "Viral Myalgia", probability: "High", description: "Muscle aches commonly associated with influenza or other viral infections.", urgency: "routine" }, { name: "Polymyalgia Rheumatica", probability: "Low", description: "Inflammatory disorder causing muscle pain in older adults, primarily in the shoulders and hips.", urgency: "soon" }], specialists: ["General Practice", "Orthopedics"], emergency: false },
  "Dizziness": { conditions: [{ name: "Benign Paroxysmal Positional Vertigo", probability: "High", description: "Brief episodes of vertigo triggered by specific head movements due to displaced inner ear crystals.", urgency: "routine" }, { name: "Orthostatic Hypotension", probability: "Moderate", description: "Blood pressure drop when standing, causing dizziness or lightheadedness.", urgency: "soon" }, { name: "Labyrinthitis", probability: "Moderate", description: "Inner ear infection causing vertigo and balance problems.", urgency: "soon" }], specialists: ["Neurology", "General Practice"], emergency: false },
  "Nausea": { conditions: [{ name: "Gastroenteritis", probability: "High", description: "Inflammation of the stomach and intestinal lining, often caused by viral or bacterial infection.", urgency: "routine" }, { name: "GERD", probability: "Moderate", description: "Gastroesophageal reflux disease with nausea as a prominent symptom.", urgency: "routine" }, { name: "Medication Side Effect", probability: "Moderate", description: "Many medications list nausea as a common adverse effect.", urgency: "routine" }], specialists: ["General Practice"], emergency: false },
};

function analyzeSymptoms(symptoms: string[]): SymptomResult {
  const allConditions: Record<string, Condition & { count: number }> = {};
  const allSpecialties = new Set<string>();
  let emergency = false;

  for (const symptom of symptoms) {
    const result = SYMPTOM_DB[symptom];
    if (!result) continue;
    if (result.emergency) emergency = true;
    result.specialists.forEach(s => allSpecialties.add(s));
    result.conditions.forEach(c => {
      if (allConditions[c.name]) { allConditions[c.name].count++; }
      else { allConditions[c.name] = { ...c, count: 1 }; }
    });
  }

  const conditions = Object.values(allConditions).sort((a, b) => b.count - a.count || (a.probability === "High" ? -1 : 1)).slice(0, 5).map(({ count, ...c }) => c);
  return { conditions, specialists: Array.from(allSpecialties), emergency };
}

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [loading, setLoading] = useState(false);

  function check() {
    if (symptoms.length === 0) return;
    setLoading(true);
    setTimeout(() => { setResult(analyzeSymptoms(symptoms)); setLoading(false); }, 1400);
  }

  function reset() { setSymptoms([]); setResult(null); }

  return (
    <PatientShell title="Symptom Checker" subtitle="AI-assisted preliminary assessment">
      <div className="max-w-2xl space-y-6">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-secondary rounded-xl border border-border p-4">
          <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Disclaimer: </span>
            This is only a preliminary assessment and not a medical diagnosis. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
          </p>
        </div>

        {!result ? (
          <>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div>
                <h2 className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">What are you experiencing?</h2>
                <p className="text-sm text-muted-foreground">Add one or more symptoms below.</p>
              </div>
              <SymptomInput selected={symptoms} onChange={setSymptoms} />
            </div>
            <button
              onClick={check}
              disabled={symptoms.length === 0 || loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-medium text-base hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing symptoms…</> : <><Activity className="w-5 h-5" /> Check symptoms</>}
            </button>
          </>
        ) : (
          <div className="space-y-6">
            {/* Checked symptoms */}
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Reported symptoms</p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map(s => <span key={s} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-xl">{s}</span>)}
              </div>
            </div>

            {/* Results */}
            <div>
              <h2 className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-3">Possible conditions</h2>
              {result.conditions.length > 0 ? (
                <SymptomSuggestions conditions={result.conditions} emergency={result.emergency} />
              ) : (
                <p className="text-sm text-muted-foreground">No matching conditions found in our database. Please consult a doctor for an assessment.</p>
              )}
            </div>

            {result.specialists.length > 0 && (
              <div>
                <h2 className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">Suggested specialists</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.specialists.map(s => <span key={s} className="text-sm bg-secondary text-secondary-foreground border border-border px-3 py-1.5 rounded-full">{s}</span>)}
                </div>
                <RecommendedDoctors specialties={result.specialists} />
              </div>
            )}

            <button onClick={reset} className="w-full border border-border rounded-xl py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              Check different symptoms
            </button>
          </div>
        )}
      </div>
    </PatientShell>
  );
}
