import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Send, X, Users, MessageSquare, HeartPulse, CalendarCheck2, Mic, MicOff } from "lucide-react";
import { doctorsService, doctorFullName, type Doctor } from "../services/doctors";
import ConsultationInfo from "../components/ConsultationInfo";
import VideoControls from "../components/VideoControls";
import Participants from "../components/Participants";

type CallStatus = "waiting" | "connected" | "ended";
type SidebarTab = "chat" | "participants";

interface ChatMsg {
  id: string;
  sender: "you" | "doctor";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMsg[] = [
  { id: "m1", sender: "doctor", text: "Good morning! I can see you've connected. Give me just a moment.", time: "10:28 AM" },
  { id: "m2", sender: "you", text: "Of course, no rush.", time: "10:29 AM" },
];

const AVATAR_FALLBACK = "https://api.dicebear.com/7.x/initials/svg?seed=";

export default function VideoConsultation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [status, setStatus] = useState<CallStatus>("waiting");
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("chat");
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch the real doctor for this appointment/room
  useEffect(() => {
    if (!id) { setNotFound(true); setLoadingDoctor(false); return; }
    doctorsService.getById(id)
      .then(setDoctor)
      .catch(() => setNotFound(true))
      .finally(() => setLoadingDoctor(false));
  }, [id]);

  // Simulate doctor joining after 3s
  useEffect(() => {
    if (!doctor) return;
    const t = setTimeout(() => setStatus("connected"), 3000);
    return () => clearTimeout(t);
  }, [doctor]);

  // Timer
  useEffect(() => {
    if (status !== "connected") return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!draft.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMsg = { id: Date.now().toString(), sender: "you", text: draft.trim(), time: now };
    setMessages(m => [...m, userMsg]);
    setDraft("");
    setTimeout(() => {
      const replies = [
        "Thank you for sharing that. Can you tell me when it started?",
        "I see. That's helpful context.",
        "Let me note that down. Please continue.",
        "How would you rate the severity on a scale of 1 to 10?",
        "I'll take a look at your previous results as well.",
      ];
      const reply: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "doctor",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(m => [...m, reply]);
    }, 1800);
  }

  function endCall() {
    setStatus("ended");
  }

  if (loadingDoctor) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center font-['Inter',sans-serif]">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center font-['Inter',sans-serif]">
        <div className="text-center">
          <HeartPulse className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <p className="font-['Fraunces',serif] text-xl font-semibold text-white mb-2">Consultation not found</p>
          <button onClick={() => navigate("/patient")} className="text-sm text-accent hover:underline">Back to dashboard</button>
        </div>
      </div>
    );
  }

  const doctorName = doctorFullName(doctor);
  const doctorAvatar = doctor.avatar_url || `${AVATAR_FALLBACK}${encodeURIComponent(doctorName)}`;

  const participants = [
    { id: "p1", name: doctorName, role: "doctor" as const, avatar: doctorAvatar, isMuted: false, isCameraOff: false, isConnected: status === "connected" },
    { id: "p2", name: "You", role: "patient" as const, isMuted, isCameraOff, isConnected: true },
  ];

  if (status === "ended") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-['Inter',sans-serif]">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CalendarCheck2 className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-foreground mb-2">Call ended</h1>
          <p className="text-muted-foreground mb-2">
            Your consultation with <span className="font-medium text-foreground">{doctorName}</span> has ended.
          </p>
          <p className="font-['DM_Mono',monospace] text-sm text-muted-foreground mb-8">
            Duration: {Math.floor(elapsed / 60)}m {elapsed % 60}s
          </p>
          <div className="bg-card rounded-2xl border border-border p-5 text-left mb-6 space-y-3">
            <p className="text-sm font-medium text-foreground">What's next?</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />Your doctor's notes will be available in Health Records within 24 hours.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />Any prescriptions written will appear in your Prescriptions tab.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />If follow-up is needed, book your next appointment below.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/patient/history")} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all">
              View my appointments
            </button>
            <button onClick={() => navigate(`/book/${doctor.id}`)} className="w-full border border-border rounded-xl py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              Book a follow-up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden font-['Inter',sans-serif]">
      <ConsultationInfo
        doctorName={doctorName}
        specialty={doctor.specialty}
        elapsedSeconds={elapsed}
        status={status}
      />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative min-w-0">
          {status === "waiting" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mx-auto mb-6 w-28 h-28">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/10">
                    <img src={doctorAvatar} alt={doctorName} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-yellow-400 border-2 border-zinc-950 animate-pulse" />
                </div>
                <p className="font-['Fraunces',serif] text-2xl font-semibold text-white mb-1">{doctorName}</p>
                <p className="text-white/50 text-sm mb-6">{doctor.specialty}</p>
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                  Waiting for the doctor to join
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center overflow-hidden">
                {!participants[0].isCameraOff ? (
                  <div className="w-full h-full opacity-60 blur-none">
                    <img src={doctorAvatar} alt="" className="w-full h-full object-cover" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center text-3xl font-semibold text-white/60">
                    {doctorName.split(" ").map(n => n[0]).join("")}
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  {participants[0].isMuted && <MicOff className="w-3.5 h-3.5 text-red-400" />}
                  <span className="text-white text-sm">{doctorName}</span>
                </div>
              </div>

              {isScreenSharing && (
                <div className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <HeartPulse className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-white font-medium mb-1">You are sharing your screen</p>
                    <p className="text-white/50 text-sm">Others can see your entire screen.</p>
                  </div>
                </div>
              )}

              <div className="absolute top-4 right-4 z-20 w-36 aspect-video rounded-xl overflow-hidden bg-zinc-800 ring-2 ring-white/10 shadow-xl">
                {isCameraOff ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white/60 text-sm font-semibold">You</div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center text-white font-semibold text-sm">You</div>
                  </div>
                )}
                {isMuted && (
                  <div className="absolute bottom-1 left-1 bg-black/50 rounded-md p-0.5">
                    <MicOff className="w-3 h-3 text-red-400" />
                  </div>
                )}
                <p className="absolute bottom-1 right-1 text-white/70 text-[10px] bg-black/40 px-1 rounded">You</p>
              </div>
            </>
          )}
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
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col gap-1 ${msg.sender === "you" ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.sender === "you" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-white/10 text-white rounded-bl-sm"}`}>
                        {msg.text}
                      </div>
                      <p className="text-white/30 text-[10px]">{msg.time}</p>
                    </div>
                  ))}
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
        onToggleMute={() => setIsMuted(m => !m)}
        onToggleCamera={() => setIsCameraOff(c => !c)}
        onToggleScreenShare={() => setIsScreenSharing(s => !s)}
        onToggleChat={() => setSidebarOpen(o => !o)}
        onEndCall={endCall}
      />
    </div>
  );
}