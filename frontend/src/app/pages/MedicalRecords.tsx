import { useState, useMemo, useEffect } from "react";
import { Search, X, Upload, FileText, FlaskConical, Brain, Pill, Syringe, ClipboardList } from "lucide-react";
import PatientShell from "../components/PatientShell";
import MedicalRecordCard from "../components/MedicalRecordCard";
import UploadReport from "../components/UploadReport";
import ReportViewer from "../components/ReportViewer";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { recordsService, type MedicalRecord } from "../services/records";

type FilterType = MedicalRecord["type"] | "All";

const TYPES: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: "All", label: "All", icon: <FileText className="w-3.5 h-3.5" /> },
  { value: "LAB_REPORT", label: "Lab Report", icon: <FlaskConical className="w-3.5 h-3.5" /> },
  { value: "IMAGING", label: "Imaging", icon: <Brain className="w-3.5 h-3.5" /> },
  { value: "PRESCRIPTION", label: "Prescription", icon: <Pill className="w-3.5 h-3.5" /> },
  { value: "DISCHARGE_SUMMARY", label: "Discharge Summary", icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { value: "VACCINATION", label: "Vaccination", icon: <Syringe className="w-3.5 h-3.5" /> },
  { value: "OTHER", label: "Other", icon: <FileText className="w-3.5 h-3.5" /> },
];

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [showUpload, setShowUpload] = useState(false);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const { toasts, add: addToast, dismiss } = useToast();

  useEffect(() => {
    recordsService.getMine()
      .then(setRecords)
      .catch(err => addToast({ type: "error", title: "Failed to load records", body: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    records.filter(r => {
      if (typeFilter !== "All" && r.type !== typeFilter) return false;
      if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    }), [records, query, typeFilter]);

  function handleUploaded(record: MedicalRecord) {
    setRecords(rs => [record, ...rs]);
    addToast({ type: "success", title: "Report uploaded", body: record.title });
  }

  async function handleDelete(id: string) {
    try {
      await recordsService.delete(id);
      setRecords(rs => rs.filter(r => r.id !== id));
      addToast({ type: "info", title: "Record deleted", body: "" });
    } catch (err: any) {
      addToast({ type: "error", title: "Failed to delete", body: err.message });
    }
  }

  return (
    <PatientShell
      title="Health Records"
      subtitle="Your complete medical document library"
      actions={
        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-all">
          <Upload className="w-4 h-4" /> Upload
        </button>
      }
    >
      <div className="max-w-3xl space-y-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search records by title…" className="w-full bg-input-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ value, label, icon }) => (
            <button key={value} onClick={() => setTypeFilter(value)} className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${typeFilter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No records found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or upload a new document.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(r => <MedicalRecordCard key={r.id} record={r} onView={setViewRecord} onDelete={handleDelete} />)}
              </div>
            )}
          </>
        )}
      </div>

      {showUpload && <UploadReport onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}
      {viewRecord && <ReportViewer record={viewRecord} onClose={() => setViewRecord(null)} />}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PatientShell>
  );
}