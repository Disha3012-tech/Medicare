import DiagnosisCard, { type Condition } from "./DiagnosisCard";
import { AlertTriangle } from "lucide-react";

interface Props { conditions: Condition[]; emergency: boolean; }

export default function SymptomSuggestions({ conditions, emergency }: Props) {
  return (
    <div className="space-y-3">
      {emergency && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive text-sm">Emergency symptoms detected</p>
            <p className="text-xs text-destructive/80 mt-1">Some of your reported symptoms — such as chest pain or severe shortness of breath — may require immediate medical attention. Please call emergency services (911) or go to the nearest emergency room.</p>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {conditions.map(c => <DiagnosisCard key={c.name} condition={c} />)}
      </div>
    </div>
  );
}
