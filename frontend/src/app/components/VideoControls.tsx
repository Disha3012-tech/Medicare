import {
  Mic, MicOff, Video, VideoOff, MonitorUp, MonitorX,
  MessageSquare, Phone, Users, MoreHorizontal
} from "lucide-react";

interface Props {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  participantCount: number;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onEndCall: () => void;
}

interface ControlBtnProps {
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}

function ControlBtn({ label, active, danger, onClick, children, badge }: ControlBtnProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-white",
        danger
          ? "bg-red-600 hover:bg-red-500 text-white"
          : active
          ? "bg-white/20 text-white hover:bg-white/30"
          : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white",
      ].join(" ")}
    >
      {children}
      <span className="text-xs hidden sm:block opacity-70">{label}</span>
      {badge != null && badge > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function VideoControls({
  isMuted, isCameraOff, isScreenSharing, isChatOpen, participantCount,
  onToggleMute, onToggleCamera, onToggleScreenShare, onToggleChat, onEndCall,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-4 bg-black/70 backdrop-blur-md border-t border-white/10">
      <ControlBtn label={isMuted ? "Unmute" : "Mute"} active={!isMuted} onClick={onToggleMute}>
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </ControlBtn>

      <ControlBtn label={isCameraOff ? "Start video" : "Stop video"} active={!isCameraOff} onClick={onToggleCamera}>
        {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </ControlBtn>

      <ControlBtn label={isScreenSharing ? "Stop sharing" : "Share screen"} active={isScreenSharing} onClick={onToggleScreenShare}>
        {isScreenSharing ? <MonitorX className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
      </ControlBtn>

      <ControlBtn label="Chat" active={isChatOpen} onClick={onToggleChat}>
        <MessageSquare className="w-5 h-5" />
      </ControlBtn>

      <ControlBtn label="Participants" active={false} onClick={() => {}} badge={participantCount}>
        <Users className="w-5 h-5" />
      </ControlBtn>

      <div className="flex-1 sm:hidden" />

      <ControlBtn label="End call" danger onClick={onEndCall}>
        <Phone className="w-5 h-5 rotate-[135deg]" />
      </ControlBtn>
    </div>
  );
}
