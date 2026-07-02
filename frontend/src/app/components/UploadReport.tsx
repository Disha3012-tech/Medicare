import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import type { RecordType } from "../data/records";

const TYPES: RecordType[] = ["Blood Test", "MRI", "CT Scan", "Prescription", "Vaccination", "Other"];

interface Props { onClose: () => void; onUpload: (data: { title: string; type: RecordType; file: File | null }) => void; }

export default function UploadReport({ onClose, onUpload }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<RecordType>("Other");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }
  }

  function submit() {
    if (!title || !file) return;
    setUploading(true);
    setTimeout(() => { setUploading(false); setDone(true); setTimeout(() => { onUpload({ title, type, file }); onClose(); }, 1000); }, 1200);
  }

  return (
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
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"}`}
              >
                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.dcm" className="hidden" onChange={handleFile} />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    <p className="text-sm font-medium text-foreground truncate max-w-xs">{file.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Drag & drop or <span className="text-accent font-medium">browse</span></p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 50 MB</p>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Report title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Blood Panel Q2 2026" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Report type</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setType(t)} className={`text-xs py-2 px-3 rounded-lg border-2 transition-all ${type === t ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <button onClick={submit} disabled={!title || !file || uploading} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                {uploading ? <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Upload report</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
