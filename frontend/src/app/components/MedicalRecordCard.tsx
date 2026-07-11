import { useState } from "react";
import { Download, Eye, FileText, FlaskConical, Brain, Pill, Syringe, ClipboardList, Trash2, Loader2 } from "lucide-react";
import type { MedicalRecord } from "../services/records";

const TYPE_CONFIG: Record<MedicalRecord["type"], { icon: React.ReactNode; color: string; label: string }> = {
  LAB_REPORT:        { icon: <FlaskConical className="w-4 h-4" />, color: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400", label: "Lab Report" },
  IMAGING:           { icon: <Brain className="w-4 h-4" />, color: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400", label: "Imaging" },
  PRESCRIPTION:      { icon: <Pill className="w-4 h-4" />, color: "bg-accent/10 text-accent", label: "Prescription" },
  DISCHARGE_SUMMARY: { icon: <ClipboardList className="w-4 h-4" />, color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400", label: "Discharge Summary" },
  VACCINATION:       { icon: <Syringe className="w-4 h-4" />, color: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400", label: "Vaccination" },
  OTHER:             { icon: <FileText className="w-4 h-4" />, color: "bg-muted text-muted-foreground", label: "Other" },
};

const API_URL = import.meta.env.VITE_API_URL || "";

interface Props {
  record: MedicalRecord;
  onView: (r: MedicalRecord) => void;
  onDelete: (id: string) => Promise<void> | void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatSize(kb?: number) {
  if (!kb) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function MedicalRecordCard({ record, onView, onDelete }: Props) {
  const { icon, color, label } = TYPE_CONFIG[record.type];
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await onDelete(record.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-sm transition-all group relative">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{record.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(record.uploaded_at)} · {record.file_name}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
        </div>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60 transition-all flex items-center gap-1"
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {deleting ? "Deleting…" : "Confirm delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(record)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all" title="View">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <a href={`${API_URL}${record.file_url}`} download={record.file_name} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all" title="Download">
            <Download className="w-3.5 h-3.5" />
          </a>
          <button onClick={() => setConfirming(true)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex-shrink-0 text-right self-start">
        <p className="font-['DM_Mono',monospace] text-xs text-muted-foreground">{formatSize(record.file_size_kb)}</p>
      </div>
    </div>
  );
}