import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2, Camera, Loader2 } from "lucide-react";
import { recordsService, type MedicalRecord } from "../services/records";
import CameraScanner from "./CameraScanner";

const TYPES: { value: MedicalRecord["type"]; label: string }[] = [
  { value: "LAB_REPORT", label: "Lab Report" },
  { value: "IMAGING", label: "Imaging" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "DISCHARGE_SUMMARY", label: "Discharge Summary" },
  { value: "VACCINATION", label: "Vaccination" },
  { value: "OTHER", label: "Other" },
];

interface Props { onClose: () => void; onUploaded: (record: MedicalRecord) => void; }

export default function UploadReport({ onClose, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MedicalRecord["type"]>("OTHER");
  const [uploading, setUploading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function setSelectedFile(f: File) {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setSelectedFile(f);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) setSelectedFile(f);
  }

  function handleScanCaptured(f: File) {
    setSelectedFile(f);
    if (!title) setTitle(`Scan ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
    setShowScanner(false);
  }

  async function submit() {
    if (!title || !file) return;
    setUploading(true);
    setError("");
    try {
      const record = await recordsService.upload({ title, type, file });
      setDone(true);
      setTimeout(() => { onUploaded(record); onClose(); }, 900);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">Upload Report</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            {done ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3" />
                <p className="font-medium text-foreground">Upload complete!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"}`}
                  >
                    <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFile} />
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">Drag & drop or <span className="text-accent font-medium">browse</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-accent/50 hover:bg-muted/30 transition-all flex flex-col items-center justify-center"
                  >
                    <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">Scan with camera</p>
                  </button>
                </div>

                {file && (
                  <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-3 py-2">
                    {previewUrl ? (
                      <img src={previewUrl} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Report title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Blood Panel Q2 2026" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Report type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map(t => (
                      <button key={t.value} onClick={() => setType(t.value)} className={`text-xs py-2 px-3 rounded-lg border-2 transition-all ${type === t.value ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}>{t.label}</button>
                    ))}
                  </div>
                </div>
                {error && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>}
                <button onClick={submit} disabled={!title || !file || uploading} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Upload report</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showScanner && (
        <CameraScanner onCapture={handleScanCaptured} onClose={() => setShowScanner(false)} />
      )}
    </>
  );
}