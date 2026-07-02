import { useState, useMemo } from "react";
import { Search, X, Upload, FileText, FlaskConical, Brain, ScanLine, Syringe, Pill } from "lucide-react";
import PatientShell from "../components/PatientShell";
import MedicalRecordCard from "../components/MedicalRecordCard";
import UploadReport from "../components/UploadReport";
import ReportViewer from "../components/ReportViewer";
import { MEDICAL_RECORDS, type MedicalRecord, type RecordType } from "../data/records";

const TYPES: { value: RecordType | "All"; label: string; icon: React.ReactNode }[] = [
  { value: "All", label: "All", icon: <FileText className="w-3.5 h-3.5" /> },
  { value: "Blood Test", label: "Blood Test", icon: <FlaskConical className="w-3.5 h-3.5" /> },
  { value: "MRI", label: "MRI", icon: <Brain className="w-3.5 h-3.5" /> },
  { value: "CT Scan", label: "CT Scan", icon: <ScanLine className="w-3.5 h-3.5" /> },
  { value: "Prescription", label: "Prescription", icon: <Pill className="w-3.5 h-3.5" /> },
  { value: "Vaccination", label: "Vaccination", icon: <Syringe className="w-3.5 h-3.5" /> },
  { value: "Other", label: "Other", icon: <FileText className="w-3.5 h-3.5" /> },
];

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>(MEDICAL_RECORDS);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecordType | "All">("All");
  const [showUpload, setShowUpload] = useState(false);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);

  const filtered = useMemo(() =>
    records.filter(r => {
      if (typeFilter !== "All" && r.type !== typeFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!r.title.toLowerCase().includes(q) && !r.doctor.toLowerCase().includes(q) && !r.tags.some(t => t.toLowerCase().includes(q))) return false;
      }
      return true;
    }), [records, query, typeFilter]);

  function handleUpload({ title, type }: { title: string; type: RecordType; file: File | null }) {
    const newRecord: MedicalRecord = {
      id: `r${Date.now()}`, title, type,
      doctor: "Self-uploaded", hospital: "Personal Records",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      size: "—", description: "Uploaded by patient.", tags: [],
    };
    setRecords(rs => [newRecord, ...rs]);
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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search records, doctors, keywords…" className="w-full bg-input-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ value, label, icon }) => (
            <button key={value} onClick={() => setTypeFilter(value)} className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${typeFilter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>

        {/* Records */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No records found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or upload a new document.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => <MedicalRecordCard key={r.id} record={r} onView={setViewRecord} />)}
          </div>
        )}
      </div>

      {showUpload && <UploadReport onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
      {viewRecord && <ReportViewer record={viewRecord} onClose={() => setViewRecord(null)} />}
    </PatientShell>
  );
}
