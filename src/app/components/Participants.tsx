import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: "doctor" | "patient";
  avatar?: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isConnected: boolean;
}

interface Props {
  participants: Participant[];
}

export default function Participants({ participants }: Props) {
  return (
    <div className="p-4 space-y-2">
      <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
        Participants ({participants.length})
      </p>
      {participants.map(p => (
        <div key={p.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="relative flex-shrink-0">
            {p.avatar ? (
              <img
                src={`https://images.unsplash.com/${p.avatar}?w=32&h=32&fit=crop&auto=format`}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-semibold text-white">
                {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${p.isConnected ? "bg-accent" : "bg-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{p.name}</p>
            <p className="text-xs text-white/40 capitalize">{p.role}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {p.isMuted
              ? <MicOff className="w-3.5 h-3.5 text-red-400" />
              : <Mic className="w-3.5 h-3.5 text-white/40" />}
            {p.isCameraOff
              ? <VideoOff className="w-3.5 h-3.5 text-red-400" />
              : <Video className="w-3.5 h-3.5 text-white/40" />}
          </div>
        </div>
      ))}
    </div>
  );
}
