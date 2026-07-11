import { useState } from "react";
import { Activity, Loader2, Info } from "lucide-react";
import PatientShell from "../components/PatientShell";
import SymptomInput from "../components/SymptomInput";
import SymptomSuggestions from "../components/SymptomSuggestions";
import RecommendedDoctors from "../components/RecommendedDoctors";
import { symptomCheckerService, type SymptomCheckResult } from "../services/symptomChecker";

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function check() {
    if (symptoms.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await symptomCheckerService.check(symptoms);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() { setSymptoms([]); setResult(null); setError(""); }

  return (
    <PatientShell title="Symptom Checker" subtitle="AI-assisted preliminary assessment">
      <div className="max-w-2xl space-y-6">
        <div className="flex items-start gap-3 bg-secondary rounded-xl border border-border p-4">
          <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Disclaimer: </span>
            This is an AI-generated preliminary assessment, not a medical diagnosis. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
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
            {error && <p className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">{error}</p>}
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
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Reported symptoms</p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map(s => <span key={s} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-xl">{s}</span>)}
              </div>
            </div>

            <div>
              <h2 className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-3">Possible conditions</h2>
              {result.conditions.length > 0 ? (
                <SymptomSuggestions conditions={result.conditions} emergency={result.emergency} />
              ) : (
                <p className="text-sm text-muted-foreground">No specific conditions identified. Please consult a doctor for an in-person assessment.</p>
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