import { CheckCircle2, Clock, ChevronRight } from "lucide-react";
import type { PatientSummary } from "../services/patients";

interface Props { patient: PatientSummary; onClick: () => void; }

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PatientCard({ patient: p, onClick }: Props) {
  const initials = p.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const lastVisit = formatDate(p.last_visit);
  const nextVisit = formatDate(p.next_visit);
  const primaryCondition = p.chronic_conditions[0];

  return (
    <div onClick={onClick} className="bg-card rounded-xl border border-border p-4 flex gap-3 hover:shadow-sm hover:border-accent/20 cursor-pointer transition-all group">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {[p.age ? `${p.age} yrs` : null, p.gender, p.blood_group].filter(Boolean).join(" · ") || "No demographic info"}
        </p>
        {primaryCondition && <p className="text-xs text-muted-foreground mt-1 truncate">{primaryCondition}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {lastVisit && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last: {lastVisit}</span>}
          {nextVisit && <span className="flex items-center gap-1 text-accent"><CheckCircle2 className="w-3 h-3" /> Next: {nextVisit}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
    </div>
  );
}