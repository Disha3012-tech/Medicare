import { Download, Eye, FileText, FlaskConical, Brain, ScanLine, Syringe, Pill, MoreHorizontal } from "lucide-react";
import type { MedicalRecord, RecordType } from "../data/records";

const TYPE_CONFIG: Record<RecordType, { icon: React.ReactNode; color: string }> = {
  "Blood Test": { icon: <FlaskConical className="w-4 h-4" />, color: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400" },
  "MRI":        { icon: <Brain className="w-4 h-4" />, color: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400" },
  "CT Scan":    { icon: <ScanLine className="w-4 h-4" />, color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" },
  "Prescription": { icon: <Pill className="w-4 h-4" />, color: "bg-accent/10 text-accent" },
  "Vaccination": { icon: <Syringe className="w-4 h-4" />, color: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400" },
  "Other":      { icon: <FileText className="w-4 h-4" />, color: "bg-muted text-muted-foreground" },
};

interface Props {
  record: MedicalRecord;
  onView: (r: MedicalRecord) => void;
}

export default function MedicalRecordCard({ record, onView }: Props) {
  const { icon, color } = TYPE_CONFIG[record.type];

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-sm transition-all group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{record.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{record.doctor} · {record.date}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{record.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{record.type}</span>
          {record.tags.slice(0, 2).map(t => (
            <span key={t} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onView(record)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all" title="View">
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all" title="Download">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="font-['DM_Mono',monospace] text-xs text-muted-foreground">{record.size}</p>
      </div>
    </div>
  );
}
