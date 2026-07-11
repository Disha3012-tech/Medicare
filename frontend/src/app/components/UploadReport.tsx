import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2, Camera, Loader2 } from "lucide-react";
import { recordsService, type MedicalRecord } from "../services/records";

const TYPES: { value: MedicalRecord["type"]; label: string }[] = [
  { value: "LAB_REPORT", label: "Lab Report" },
  { value: "IMAGING", label: "Imaging" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "DISCHARGE_SUMMARY", label: "Discharge Summary" },
  { value: "VACCINATION", label: "Vaccination" },
  { value: "OTHER", label: "Other" },
];

interface Props { onClose: () => void; onUploaded: (record: MedicalRecord) => void; }

/** Loads an image file, applies a grayscale + contrast boost to approximate
 *  a "scanned" look, and returns a new File with the processed image. */
function enhanceScanImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const contrast = 45; // -255..255
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const adjusted = factor * (gray - 128) + 128;
        const clamped = Math.max(0, Math.min(255, adjusted));
        data[i] = data[i + 1] = data[i + 2] = clamped;
      }
      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) { reject(new Error("Failed to process image")); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + "-scan.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.9);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function UploadReport({ onClose, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MedicalRecord["type"]>("OTHER");
  const [uploading, setUploading] = useState(false);
  const [processingScan, setProcessingScan] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }
  }

  async function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setProcessingScan(true);
    setError("");
    try {
      const enhanced = await enhanceScanImage(f);
      setFile(enhanced);
      if (!title) setTitle(`Scan ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
    } catch {
      setFile(f); // fall back to the raw photo if enhancement fails
    } finally {
      setProcessingScan(false);
    }
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
                  onClick={() => cameraRef.current?.click()}
                  disabled={processingScan}
                  className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-accent/50 hover:bg-muted/30 transition-all flex flex-col items-center justify-center disabled:opacity-60"
                >
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />
                  {processingScan ? (
                    <>
                      <Loader2 className="w-6 h-6 text-accent mx-auto mb-1.5 animate-spin" />
                      <p className="text-xs text-muted-foreground">Enhancing scan…</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground">Scan with camera</p>
                    </>
                  )}
                </button>
              </div>

              {file && (
                <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                  <FileText className="w-4 h-4 text-accent flex-shrink-0" />
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
  );
}