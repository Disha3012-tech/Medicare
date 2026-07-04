import { Pill, Clock, Calendar, Info } from "lucide-react";
import type { Medicine } from "../services/prescriptions";

export default function MedicineCard({ med, index }: { med: Medicine; index: number }) {
  return (
    <div className="bg-muted/40 rounded-xl p-4 border border-border/60">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 font-['DM_Mono',monospace] text-xs font-medium text-primary">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{med.name}</p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Pill className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span><span className="text-foreground font-medium">Dose:</span> {med.dosage}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span><span className="text-foreground font-medium">Freq:</span> {med.frequency}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
              <Calendar className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span><span className="text-foreground font-medium">Duration:</span> {med.duration}</span>
            </span>
          </div>
          {med.instructions && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground bg-card rounded-lg px-3 py-2 border border-border/60">
              <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{med.instructions}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}