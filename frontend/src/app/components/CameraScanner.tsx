import { useState, useRef, useEffect, useCallback } from "react";
import { X, Camera, RotateCcw, Check, Loader2, SwitchCamera } from "lucide-react";

declare global {
  interface Window {
    cv: any;
    jscanify: any;
  }
}

interface Props {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type Phase = "loading" | "live" | "preview" | "error";

export default function CameraScanner({ onCapture, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [cvReady, setCvReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<any>(null);

  // Wait for opencv.js + jscanify to finish loading (both loaded via <script> tags in index.html)
  useEffect(() => {
    let cancelled = false;
    function check() {
      if (cancelled) return;
      if (window.cv && window.cv.Mat && window.jscanify) {
        if (!scannerRef.current) scannerRef.current = new window.jscanify();
        setCvReady(true);
      } else {
        setTimeout(check, 200);
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  const startCamera = useCallback(async (mode: "environment" | "user") => {
    setPhase("loading");
    setError("");
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase("live");
    } catch (err: any) {
      setError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Please allow camera permission and try again."
          : "Couldn't access the camera. You can still upload a file instead."
      );
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [facingMode, startCamera]);

  function switchCamera() {
    setFacingMode(m => (m === "environment" ? "user" : "environment"));
  }

  function capture() {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let outputCanvas = canvas;

    // If OpenCV/jscanify finished loading, auto-detect the document edges,
    // deskew, and crop to just the paper. Otherwise fall back to the raw frame.
    if (cvReady && scannerRef.current) {
      try {
        const resultCanvas = scannerRef.current.extractPaper(canvas, canvas.width, canvas.height);
        if (resultCanvas) outputCanvas = resultCanvas;
      } catch {
        // Detection failed (e.g. no clear document edges found) — use the raw photo instead
      }
    }

    // Grayscale + contrast boost pass for a cleaner "scanned" look
    const ctx2 = outputCanvas.getContext("2d");
    if (ctx2) {
      const imgData = ctx2.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const data = imgData.data;
      const contrast = 40;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const adjusted = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
        data[i] = data[i + 1] = data[i + 2] = adjusted;
      }
      ctx2.putImageData(imgData, 0, 0);
    }

    outputCanvas.toBlob(blob => {
      if (!blob) return;
      setPreviewBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setPhase("preview");
      streamRef.current?.getTracks().forEach(t => t.stop());
    }, "image/jpeg", 0.92);
  }

  function retake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    startCamera(facingMode);
  }

  function confirm() {
    if (!previewBlob) return;
    const file = new File([previewBlob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
  }

  function handleClose() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
          <X className="w-4 h-4" />
        </button>
        <p className="text-white text-sm font-medium">
          {phase === "preview" ? "Review scan" : "Scan document"}
        </p>
        {phase === "live" ? (
          <button onClick={switchCamera} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <SwitchCamera className="w-4 h-4" />
          </button>
        ) : <div className="w-9 h-9" />}
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {phase === "loading" && (
          <div className="text-center text-white/70">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">Starting camera…</p>
          </div>
        )}

        {phase === "error" && (
          <div className="text-center text-white/80 px-8">
            <p className="text-sm mb-4">{error}</p>
            <button onClick={() => startCamera(facingMode)} className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all">
              Try again
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-contain ${phase === "live" ? "block" : "hidden"}`}
        />

        {phase === "preview" && previewUrl && (
          <img src={previewUrl} alt="Captured document" className="w-full h-full object-contain" />
        )}

        {phase === "live" && (
          <div className="absolute inset-6 border-2 border-white/40 rounded-2xl pointer-events-none" />
        )}

        <canvas ref={captureCanvasRef} className="hidden" />
      </div>

      <div className="px-6 py-6 flex-shrink-0 flex items-center justify-center gap-6">
        {phase === "live" && (
          <>
            {!cvReady && <p className="absolute bottom-24 text-white/50 text-xs">Loading edge-detection…</p>}
            <button
              onClick={capture}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              aria-label="Capture"
            >
              <div className="w-14 h-14 rounded-full border-4 border-black/10" />
            </button>
          </>
        )}
        {phase === "preview" && (
          <>
            <button onClick={retake} className="flex items-center gap-2 text-white bg-white/10 px-5 py-3 rounded-xl hover:bg-white/20 transition-all">
              <RotateCcw className="w-4 h-4" /> Retake
            </button>
            <button onClick={confirm} className="flex items-center gap-2 text-white bg-accent px-5 py-3 rounded-xl hover:bg-accent/90 transition-all font-medium">
              <Check className="w-4 h-4" /> Use this scan
            </button>
          </>
        )}
      </div>
    </div>
  );
}
