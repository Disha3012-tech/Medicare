import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";

interface Message { id: string; role: "user" | "assistant"; text: string; }

const PATIENT_RESPONSES: [RegExp, string, string?][] = [
  [/\b(hi|hello|hey)\b/i, "Hello! I'm Medi, your Medicare AI assistant. I can help you navigate the platform, find doctors, or answer general health questions. What can I do for you?"],
  [/\b(book|appointment|schedule)\b/i, "To book an appointment, go to **Find Doctors** → pick a specialist → choose a date and time. You'll receive instant confirmation. Would you like me to take you there?", "/find-doctors"],
  [/\b(doctor|specialist|find)\b/i, "You can browse and filter verified specialists on the **Find Doctors** page — by specialty, rating, or consultation fee.", "/find-doctors"],
  [/\b(symptom|pain|fever|headache|cough|cold)\b/i, "For a preliminary symptom assessment, try the **Symptom Checker**. It will suggest possible conditions and relevant specialists. Note: it's not a medical diagnosis.", "/symptom-checker"],
  [/\b(prescription|medicine|medication)\b/i, "Your prescriptions — including medicines, dosages, and doctor notes — are in the **Prescriptions** section of your dashboard.", "/patient/prescriptions"],
  [/\b(record|report|mri|blood|test)\b/i, "All your medical documents (lab reports, imaging, vaccinations) live in **Health Records**. You can view, download, or upload reports there.", "/patient/records"],
  [/\b(history|past|previous)\b/i, "Your full appointment history — upcoming, completed, and cancelled — is in **Appointments**.", "/patient/history"],
  [/\b(notification|alert|reminder)\b/i, "Check your **Notifications** page for appointment reminders, prescription updates, and messages from your care team.", "/patient/notifications"],
  [/\b(setting|profile|account|password)\b/i, "You can edit your profile, emergency contact, insurance, and health parameters in **Settings**.", "/patient/settings"],
  [/\b(message|chat|contact.*doctor)\b/i, "You can message your care team directly in **Messages**.", "/messages"],
  [/\b(video|call|consult|consultation)\b/i, "For a video consultation, book an appointment with a doctor who offers video visits. Once confirmed, you'll find a 'Join call' option when the appointment starts."],
  [/\b(payment|pay|bill|fee|cost)\b/i, "Consultation fees vary by doctor and are shown before you confirm a booking."],
  [/\b(emergency|urgent|serious)\b/i, "⚠️ If you're experiencing a medical emergency, please call emergency services or go to the nearest emergency room immediately. Medicare is for scheduled care only."],
  [/\b(thank|thanks|great|perfect|helpful)\b/i, "You're welcome! Is there anything else I can help you with?"],
];

const DOCTOR_RESPONSES: [RegExp, string, string?][] = [
  [/\b(hi|hello|hey)\b/i, "Hello Dr.! I'm Medi, your Medicare assistant. I can help you navigate your schedule, patients, prescriptions, and practice tools. What do you need?"],
  [/\b(patient|patients)\b/i, "You can view everyone under your care — including their chronic conditions, allergies, and visit history — on the **Patients** page.", "/doctor/patients"],
  [/\b(prescription|medicine|medication|write)\b/i, "Head to **Prescriptions** to view what you've written or create a new one for any of your patients.", "/doctor/prescriptions"],
  [/\b(schedule|appointment|today)\b/i, "Your **Schedule** shows today's appointments, and lets you mark each one as visited or no-show once the time has passed.", "/doctor"],
  [/\b(availability|slot|vacation|block)\b/i, "Manage your weekly hours, vacation mode, and blocked dates in **Availability**.", "/doctor/availability"],
  [/\b(analytic|revenue|report|stat)\b/i, "Your practice performance — revenue, patient growth, cancellation and no-show rates — is on the **Analytics** page.", "/doctor/analytics"],
  [/\b(notification|alert|reminder)\b/i, "New appointment requests and updates appear in **Notifications**.", "/doctor/notifications"],
  [/\b(message|chat|contact.*patient)\b/i, "You can message any of your patients directly in **Messages**.", "/messages"],
  [/\b(setting|profile|clinic|qualification|password)\b/i, "Update your profile, qualifications, and clinic info in **Settings**.", "/doctor/settings"],
  [/\b(no.?show|missed|didn.?t (show|come|visit))\b/i, "Once an appointment's time has passed, you'll see 'Visited' / 'No-show' buttons on it in your Schedule or Overview — use those to mark the outcome.", "/doctor"],
  [/\b(thank|thanks|great|perfect|helpful)\b/i, "You're welcome! Let me know if there's anything else."],
];

const PATIENT_DEFAULT = "I can help you navigate Medicare, book appointments, or answer healthcare questions. Try asking about finding doctors, your appointments, prescriptions, or messages.";
const DOCTOR_DEFAULT = "I can help you navigate your practice tools — try asking about your schedule, patients, prescriptions, availability, or analytics.";

const PATIENT_SUGGESTIONS = ["How do I book an appointment?", "Find a cardiologist", "Check my symptoms", "View my prescriptions", "Message my doctor"];
const DOCTOR_SUGGESTIONS = ["Show me today's schedule", "How do I write a prescription?", "Mark a no-show", "Update my availability", "View my analytics"];

function getResponse(text: string, role: "PATIENT" | "DOCTOR" | "ADMIN" | undefined): { response: string; link?: string } {
  const table = role === "DOCTOR" ? DOCTOR_RESPONSES : PATIENT_RESPONSES;
  for (const [pattern, response, link] of table) {
    if (pattern.test(text)) return { response, link };
  }
  return { response: role === "DOCTOR" ? DOCTOR_DEFAULT : PATIENT_DEFAULT };
}

export default function FloatingAIAssistant() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "assistant", text: "Hi! I'm Medi 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = user?.role === "DOCTOR" ? DOCTOR_SUGGESTIONS : PATIENT_SUGGESTIONS;

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function send(text = input.trim()) {
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const { response, link } = getResponse(text, user?.role);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: response };
      setMessages(m => [...m, assistantMsg]);
      setTyping(false);
      if (link) {
        setTimeout(() => {
          const navMsg: Message = { id: (Date.now() + 2).toString(), role: "assistant", text: `Navigating you there now…` };
          setMessages(m => [...m, navMsg]);
          setTimeout(() => navigate(link), 800);
        }, 800);
      }
    }, 900);
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Open AI assistant"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col transition-all duration-200 ${minimized ? "h-14" : "h-[480px]"}`}>
          <div className="flex items-center gap-3 px-4 py-3 bg-primary flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-foreground">Medi</p>
              <p className="text-xs text-primary-foreground/60">{user?.role === "DOCTOR" ? "Practice Assistant" : "AI Health Assistant"}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(m => !m)} className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all">
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-1.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <div className="bg-muted rounded-xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                {messages.length <= 2 && !typing && (
                  <div className="space-y-1.5 pt-1">
                    {suggestions.map(s => (
                      <button key={s} onClick={() => send(s)} className="w-full text-left text-xs border border-border rounded-xl px-3 py-2 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="p-3 border-t border-border flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                    placeholder="Ask me anything…"
                    className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || typing}
                    className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5">AI responses are for guidance only, not medical advice.</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}