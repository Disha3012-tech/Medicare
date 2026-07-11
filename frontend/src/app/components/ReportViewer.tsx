import { X, Download } from "lucide-react";
import type { MedicalRecord } from "../services/records";
import { downloadFile } from "../utils/download";

const API_URL = import.meta.env.VITE_API_URL || "";

interface Props { record: MedicalRecord; onClose: () => void; }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isImage(fileName: string) {
  return /\.(png|jpe?g|webp)$/i.test(fileName);
}

export default function ReportViewer({ record, onClose }: Props) {
  const fullUrl = `${API_URL}${record.file_url}`;
  const isImg = isImage(record.file_name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-3xl shadow-2xl flex flex-col h-full max-h-[90vh] sm:max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-border flex-shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="font-['Fraunces',serif] text-base sm:text-lg font-semibold text-foreground truncate">{record.title}</h2>
            <p className="text-xs text-muted-foreground truncate">{formatDate(record.uploaded_at)} · {record.file_name}</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button onClick={() => downloadFile(`${API_URL}/api/records/${record.id}/download`, record.file_name)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all" title="Download">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20 flex items-center justify-center">
          {isImg ? (
            <img src={fullUrl} alt={record.title} className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-xl shadow-md" />
          ) : (
            <iframe src={fullUrl} title={record.title} className="w-full h-full min-h-[50vh] sm:min-h-[60vh] rounded-xl border border-border bg-white" />
          )}
        </div>
      </div>
    </div>
  );
}