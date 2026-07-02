import { Wifi, WifiOff, Clock } from "lucide-react";

interface Props {
  doctorName: string;
  specialty: string;
  elapsedSeconds: number;
  status: "waiting" | "connected" | "ended";
}

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

const STATUS_CONFIG = {
  waiting:   { label: "Connecting…",   dot: "bg-yellow-400 animate-pulse", icon: WifiOff },
  connected: { label: "Connected",     dot: "bg-accent animate-pulse",     icon: Wifi },
  ended:     { label: "Call ended",    dot: "bg-muted-foreground",         icon: WifiOff },
};

export default function ConsultationInfo({ doctorName, specialty, elapsedSeconds, status }: Props) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <div>
          <p className="font-medium text-white text-sm leading-none">{doctorName}</p>
          <p className="text-white/50 text-xs mt-0.5">{specialty}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {status === "connected" && (
          <div className="flex items-center gap-1.5 font-['DM_Mono',monospace] text-sm text-white/80">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(elapsedSeconds)}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-white/60">
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
      </div>
    </div>
  );
}
