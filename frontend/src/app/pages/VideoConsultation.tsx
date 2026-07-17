import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Send, X, Users, MessageSquare, HeartPulse, CalendarCheck2, AlertTriangle, Loader2 } from "lucide-react";
import { appointmentsService, type CallInfo } from "../services/appointments";
import { chatService } from "../services/chat";
import { useAuth } from "../components/AuthProvider";
import ConsultationInfo from "../components/ConsultationInfo";
import VideoControls from "../components/VideoControls";
import Participants from "../components/Participants";

type CallStatus = "loading" | "media-error" | "not-video" | "waiting-peer" | "connected" | "ended" | "error";
type SidebarTab = "chat" | "participants";

interface ChatMsg {
  id: string;
  from: "you" | "them";
  senderName: string;
  text: string;
  time: string;
}

const AVATAR_FALLBACK = "https://api.dicebear.com/7.x/initials/svg?seed=";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export default function VideoConsultation() {
  const { id } = useParams<{ id: string }>(); // appointment id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [status, setStatus] = useState<CallStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [remoteCameraOff, setRemoteCameraOff] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("chat");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasOfferedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOfferer = callInfo?.other_participant_role === "doctor"; // patient always offers

  // 1. Fetch call info (room id, other participant, access check)
  useEffect(() => {
    if (!id) { setStatus("error"); setErrorMessage("No appointment specified."); return; }
    appointmentsService.getCallInfo(id)
      .then(setCallInfo)
      .catch(err => {
        setStatus(err.status === 400 ? "not-video" : "error");
        setErrorMessage(err.message || "Couldn't load this consultation.");
      });
  }, [id]);

  // 2. Once we have call info, get camera/mic and open signaling
  useEffect(() => {
    if (!callInfo) return;
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        setupPeerConnection(stream);
        connectSignaling();
        setStatus("waiting-peer");
      } catch {
        setStatus("media-error");
      }
    }
    start();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callInfo]);

  // 3. Keep the video stream correctly attached to the single always-mounted element across status changes
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && (status === "waiting-peer" || status === "connected")) {
      // Re-evaluate stream mapping when status toggles to ensure visual synchronization
      if (isScreenSharing && screenStreamRef.current) {
        localVideoRef.current.srcObject = screenStreamRef.current;
      } else {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  }, [status, isScreenSharing]);

  // Call timer
  useEffect(() => {
    if (status === "connected") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  useEffect(() => {
    if (sidebarOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sidebarOpen]);

  function setupPeerConnection(stream: MediaStream) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setStatus("connected");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) sendSignal({ type: "ice", candidate: event.candidate.toJSON() });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        setStatus(s => (s === "ended" ? s : "error"));
        setErrorMessage("The call connection was lost.");
      }
    };

    pcRef.current = pc;
  }

  function connectSignaling() {
    if (!callInfo) return;
    const ws = chatService.connectVideo(callInfo.room_id, handleSignal);
    if (!ws) { setStatus("error"); setErrorMessage("Couldn't connect to the call server."); return; }
    ws.onopen = () => sendSignal({ type: "join" });
    wsRef.current = ws;
  }

  function sendSignal(data: any) {
    wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify(data));
  }

  async function maybeCreateOffer() {
    if (!isOfferer || hasOfferedRef.current || !pcRef.current) return;
    hasOfferedRef.current = true;
    const pc = pcRef.current;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({ type: "offer", sdp: pc.localDescription });
  }

  async function handleSignal(data: any) {
    const pc = pcRef.current;
    if (!pc) return;

    switch (data.type) {
      case "join":
        sendSignal({ type: "join-ack" });
        maybeCreateOffer();
        break;
      case "join-ack":
        maybeCreateOffer();
        break;
      case "offer": {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        await flushPendingCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: "answer", sdp: pc.localDescription });
        break;
      }
      case "answer":
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        await flushPendingCandidates();
        break;
      case "ice":
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
        } else {
          pendingCandidatesRef.current.push(data.candidate);
        }
        break;
      case "chat":
        setMessages(m => [...m, {
          id: Date.now().toString() + Math.random(),
          from: "them",
          senderName: data.senderName || callInfo?.other_participant_name || "Them",
          text: data.text,
          time: data.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
        break;
      case "media-state":
        setRemoteMuted(!!data.isMuted);
        setRemoteCameraOff(!!data.isCameraOff);
        break;
      case "hangup":
        setStatus("ended");
        break;
    }
  }

  async function flushPendingCandidates() {
    const pc = pcRef.current;
    if (!pc) return;
    for (const c of pendingCandidatesRef.current) {
      await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
    }
    pendingCandidatesRef.current = [];
  }

  function toggleMute() {
    const next = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach(t => (t.enabled = !next));
    setIsMuted(next);
    sendSignal({ type: "media-state", isMuted: next, isCameraOff });
  }

  function toggleCamera() {
    const next = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach(t => (t.enabled = !next));
    setIsCameraOff(next);
    sendSignal({ type: "media-state", isMuted, isCameraOff: next });
  }

  async function toggleScreenShare() {
    const pc = pcRef.current;
    if (!pc) return;

    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      const sender = pc.getSenders().find(s => s.track?.kind === "video");
      if (sender && camTrack) await sender.replaceTrack(camTrack);
      if (localVideoRef.current && localStreamRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      setIsScreenSharing(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = pc.getSenders().find(s => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);
      screenStreamRef.current = screenStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      screenTrack.onended = () => toggleScreenShare();
      setIsScreenSharing(true);
    } catch {
      // user cancelled the screen-share picker — no-op
    }
  }

  function sendMessage() {
    if (!draft.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const myName = user ? `${user.first_name} ${user.last_name}` : "You";
    setMessages(m => [...m, { id: Date.now().toString(), from: "you", senderName: myName, text: draft.trim(), time }]);
    sendSignal({ type: "chat", text: draft.trim(), senderName: myName, time });
    setDraft("");
  }

  function cleanup() {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    wsRef.current?.close();
    wsRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function endCall() {
    sendSignal({ type: "hangup" });
    cleanup();
    setStatus("ended");
  }

  // ── Loading / error states ──
  if (status === "loading") {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center font-['Inter',sans-serif]">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (status === "error" || status === "not-video") {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center font-['Inter',sans-serif]">
        <div className="text-center max-w-sm px-6">
          <HeartPulse className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <p className="font-['Fraunces',serif] text-xl font-semibold text-white mb-2">
            {status === "not-video" ? "Not a video appointment" : "Consultation not found"}
          </p>
          <p className="text-white/50 text-sm mb-6">{errorMessage}</p>
          <button onClick={() => navigate(user?.role === "DOCTOR" ? "/doctor" : "/patient")} className="text-sm text-accent hover:underline">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === "media-error") {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center font-['Inter',sans-serif]">
        <div className="text-center max-w-sm px-6">
          <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
          <p className="font-['Fraunces',serif] text-xl font-semibold text-white mb-2">Camera & microphone needed</p>
          <p className="text-white/50 text-sm mb-6">Please allow camera and microphone access in your browser to join this call, then try again.</p>
          <button onClick={() => window.location.reload()} className="text-sm bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!callInfo) return null;

  const otherName = callInfo.other_participant_name;
  const otherAvatar = callInfo.other_participant_avatar || `${AVATAR_FALLBACK}${encodeURIComponent(otherName)}`;
  const myName = user ? `${user.first_name} ${user.last_name}` : "You";

  const participants = [
    { id: "them", name: otherName, role: callInfo.other_participant_role, avatar: otherAvatar, isMuted: remoteMuted, isCameraOff: remoteCameraOff, isConnected: status === "connected" },
    { id: "me", name: myName, role: (user?.role === "DOCTOR" ? "doctor" : "patient") as "doctor" | "patient", isMuted, isCameraOff, isConnected: true },
  ];

  if (status === "ended") {
    const isDoctor = user?.role === "DOCTOR";
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-['Inter',sans-serif]">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CalendarCheck2 className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-foreground mb-2">Call ended</h1>
          <p className="text-muted-foreground mb-2">
            Your consultation with <span className="font-medium text-foreground">{otherName}</span> has ended.
          </p>
          <p className="font-['DM_Mono',monospace] text-sm text-muted-foreground mb-8">
            Duration: {Math.floor(elapsed / 60)}m {elapsed % 60}s
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(isDoctor ? "/doctor/history" : "/patient/history")}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
            >
              {isDoctor ? "Back to appointments" : "View my appointments"}
            </button>
            {!isDoctor && (
              <button onClick={() => navigate(`/book/${callInfo.other_participant_role === "doctor" ? "" : ""}`)} className="hidden" />
            )}
            <button onClick={() => navigate(isDoctor ? "/doctor" : "/patient")} className="w-full border border-border rounded-xl py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden font-['Inter',sans-serif]">
      <ConsultationInfo
        doctorName={otherName}
        specialty={callInfo.specialty || (callInfo.other_participant_role === "patient" ? "Patient" : "")}
        elapsedSeconds={elapsed}
        status={status === "connected" ? "connected" : "waiting"}
      />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative min-w-0">
          {status === "waiting-peer" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mx-auto mb-6 w-28 h-28">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/10">
                    <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-yellow-400 border-2 border-zinc-950 animate-pulse" />
                </div>
                <p className="font-['Fraunces',serif] text-2xl font-semibold text-white mb-1">{otherName}</p>
                {callInfo.specialty && <p className="text-white/50 text-sm mb-6">{callInfo.specialty}</p>}
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                  Waiting for {otherName} to join
                </div>
              </div>
            </div>
          )}

          {status === "connected" && (
            <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
              {!remoteCameraOff ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center text-3xl font-semibold text-white/60">
                  {otherName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
              )}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                {remoteMuted && <span className="text-red-400 textxs">●</span>}
                <span className="text-white text-sm">{otherName}</span>
              </div>
            </div>
          )}

          {/* Always-mounted Local Picture-in-Picture View Container */}
          <div className={`absolute z-20 rounded-xl overflow-hidden bg-zinc-800 ring-2 ring-white/10 shadow-xl transition-all ${status === "waiting-peer" ? "bottom-6 right-6 w-48 aspect-video" : "top-4 right-4 w-36 aspect-video"}`}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${isCameraOff ? "hidden" : "block"}`}
            />
            {isCameraOff && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white/60 text-sm font-semibold">You</div>
              </div>
            )}
            {isMuted && (
              <div className="absolute bottom-1 left-1 bg-black/50 rounded-md p-0.5">
                <span className="text-red-400 text-[10px] px-1">Muted</span>
              </div>
            )}
            <p className="absolute bottom-1 right-1 text-white/70 text-[10px] bg-black/40 px-1 rounded">You</p>
          </div>
        </div>

        {sidebarOpen && (
          <div className="w-72 flex-shrink-0 bg-zinc-900/95 border-l border-white/10 flex flex-col">
            <div className="flex border-b border-white/10">
              {(["chat", "participants"] as SidebarTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors capitalize ${sidebarTab === tab ? "text-white border-b-2 border-accent" : "text-white/40 hover:text-white/70"}`}
                >
                  {tab === "chat" ? <MessageSquare className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {tab}
                </button>
              ))}
              <button onClick={() => setSidebarOpen(false)} className="px-3 text-white/30 hover:text-white/70 transition-colors" aria-label="Close sidebar">
                <X className="w-4 h-4" />
              </button>
            </div>

            {sidebarTab === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {messages.length === 0 ? (
                    <p className="text-white/30 text-xs text-center py-8">No messages yet</p>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`flex flex-col gap-1 ${msg.from === "you" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.from === "you" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-white/10 text-white rounded-bl-sm"}`}>
                          {msg.text}
                        </div>
                        <p className="text-white/30 text-[10px]">{msg.time}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder="Type a message…"
                      aria-label="Chat message"
                      className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!draft.trim()}
                      aria-label="Send message"
                      className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {sidebarTab === "participants" && (
              <div className="flex-1 overflow-y-auto">
                <Participants participants={participants} />
              </div>
            )}
          </div>
        )}
      </div>

      <VideoControls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isScreenSharing={isScreenSharing}
        isChatOpen={sidebarOpen}
        participantCount={participants.length}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={() => setSidebarOpen(o => !o)}
        onEndCall={endCall}
      />
    </div>
  );
}