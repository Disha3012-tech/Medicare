import { AlertTriangle, Info } from "lucide-react";

export interface Condition {
  name: string;
  probability: "High" | "Moderate" | "Low";
  description: string;
  urgency: "routine" | "soon" | "urgent";
}

const PROB_COLORS = {
  High:     "bg-destructive/10 text-destructive",
  Moderate: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400",
  Low:      "bg-muted text-muted-foreground",
};

const URGENCY_CONFIG = {
  routine: { label: "Routine follow-up", color: "text-muted-foreground" },
  soon:    { label: "See a doctor soon", color: "text-yellow-600 dark:text-yellow-400" },
  urgent:  { label: "Seek care promptly", color: "text-destructive" },
};

export default function DiagnosisCard({ condition }: { condition: Condition }) {
  const { label: urgLabel, color: urgColor } = URGENCY_CONFIG[condition.urgency];
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex gap-3">
      <div className="w-2 flex-shrink-0 mt-1">
        <div className={`w-2 h-2 rounded-full ${condition.probability === "High" ? "bg-destructive" : condition.probability === "Moderate" ? "bg-yellow-400" : "bg-muted-foreground/40"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="font-medium text-foreground text-sm">{condition.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${PROB_COLORS[condition.probability]}`}>{condition.probability} likelihood</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{condition.description}</p>
        <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${urgColor}`}>
          {condition.urgency === "urgent" ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
          {urgLabel}
        </p>
      </div>
    </div>
  );
}
