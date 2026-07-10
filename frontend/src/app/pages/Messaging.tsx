import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Send, ArrowLeft, Check, CheckCheck, X } from "lucide-react";
import PatientShell from "../components/PatientShell";
import DoctorShell from "../components/DoctorShell";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../components/AuthProvider";
import { chatService, type Conversation, type Message } from "../services/chat";
import { appointmentsService } from "../services/appointments";
import { doctorsService, doctorFullName } from "../services/doctors";
import { patientsService, type PatientSummary } from "../services/patients";

interface Contact { id: string; name: string; subtitle?: string; }

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Messaging() {
  const { user } = useAuth();
  const Shell = user?.role === "DOCTOR" ? DoctorShell : PatientShell;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState<string>("");
  const [thread, setThread] = useState<Message[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Load conversation list
  useEffect(() => {
    chatService.getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoadingConvos(false));
  }, []);

  // Load thread when a conversation is opened
  useEffect(() => {
    if (!activeId) return;
    setLoadingThread(true);
    chatService.getThread(activeId)
      .then(setThread)
      .catch(console.error)
      .finally(() => setLoadingThread(false));
  }, [activeId]);

  // Live WebSocket connection for incoming messages
  useEffect(() => {
    const ws = chatService.connectChat((data) => {
      if (data.event !== "message:new") return;
      // If it belongs to the open thread, append it live
      if (activeId && (data.sender_id === activeId || data.receiver_id === activeId)) {
        setThread(t => [...t, {
          id: data.id,
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
          content: data.content,
          is_read: data.sender_id === activeId ? true : false,
          created_at: data.created_at,
        }]);
      }
      // Refresh the conversation list to update last message / unread counts
      chatService.getConversations().then(setConversations).catch(console.error);
    });
    wsRef.current = ws;
    return () => ws?.close();
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  function openConversation(partnerId: string, partnerName: string) {
    setActiveId(partnerId);
    setActiveName(partnerName);
    setConversations(cs => cs.map(c => c.partner_id === partnerId ? { ...c, unread_count: 0 } : c));
  }

  async function sendMessage() {
    if (!draft.trim() || !activeId) return;
    const content = draft.trim();
    setDraft("");
    try {
      const sent = await chatService.sendMessage({ receiver_id: activeId, content });
      setThread(t => [...t, sent]);
      setConversations(cs => {
        const exists = cs.some(c => c.partner_id === activeId);
        if (exists) {
          return cs.map(c => c.partner_id === activeId
            ? { ...c, last_message: content, last_message_at: sent.created_at }
            : c);
        }
        return [{ partner_id: activeId, partner_name: activeName, last_message: content, last_message_at: sent.created_at, unread_count: 0 }, ...cs];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setDraft(content); // restore on failure
    }
  }

  // Load contacts for "New conversation" — doctors for patients, patients for doctors
  function openNewChat() {
    setShowNewChat(true);
    if (contacts.length > 0) return;
    setLoadingContacts(true);
    if (user?.role === "PATIENT") {
      appointmentsService.getMine()
        .then(async (appts) => {
          const doctorIds = Array.from(new Set(appts.map(a => a.doctor_id)));
          const doctors = await Promise.all(doctorIds.map(id => doctorsService.getById(id).catch(() => null)));
          setContacts(
            doctors.filter((d): d is NonNullable<typeof d> => !!d)
              .map(d => ({ id: d.user_id, name: doctorFullName(d), subtitle: d.specialty }))
          );
        })
        .catch(console.error)
        .finally(() => setLoadingContacts(false));
    } else if (user?.role === "DOCTOR") {
      patientsService.getMyPatients()
        .then((patients: PatientSummary[]) => {
          setContacts(patients.map(p => ({ id: p.user_id, name: p.name, subtitle: p.chronic_conditions[0] })));
        })
        .catch(console.error)
        .finally(() => setLoadingContacts(false));
    }
  }

  function startConversation(contact: Contact) {
    setShowNewChat(false);
    openConversation(contact.id, contact.name);
  }

  const filteredConversations = useMemo(() =>
    conversations.filter(c => c.partner_name.toLowerCase().includes(search.toLowerCase())),
    [conversations, search]
  );

  const body = (
    <div className="flex h-[calc(100vh-9rem)] -m-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className={`flex flex-col w-full md:w-72 flex-shrink-0 border-r border-border ${activeId ? "hidden md:flex" : "flex"}`}>
        <div className="p-3 border-b border-border flex-shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…" className="w-full bg-input-background rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button onClick={openNewChat} className="px-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all flex-shrink-0">
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="p-3 space-y-2">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : filteredConversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10 px-4">No conversations yet. Tap "New" to start one.</p>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.partner_id}
                onClick={() => openConversation(conv.partner_id, conv.partner_name)}
                className={`w-full flex gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors text-left border-b border-border/50 ${activeId === conv.partner_id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                  {conv.partner_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${conv.unread_count > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{conv.partner_name}</p>
                    {conv.last_message_at && <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatTime(conv.last_message_at)}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{conv.last_message || "No messages yet"}</p>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center flex-shrink-0 ml-2">{conv.unread_count}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {activeId ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-3 border-b border-border flex items-center gap-3 flex-shrink-0 bg-card">
            <button onClick={() => setActiveId(null)} className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
              {activeName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activeName}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-background/50">
            {loadingThread ? (
              <div className="space-y-3">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-12 rounded-xl" />)}</div>
            ) : thread.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Say hello — no messages yet.</p>
            ) : (
              thread.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-foreground border border-border rounded-bl-sm"}`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</p>
                        {isMe && (msg.is_read
                          ? <CheckCheck className="w-3 h-3 text-accent" />
                          : <Check className="w-3 h-3 text-muted-foreground" />)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-border flex-shrink-0 bg-card">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder={`Message ${activeName}…`}
                className="flex-1 bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-background/50">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-primary" />
            </div>
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">Select a conversation</p>
            <p className="text-sm text-muted-foreground">Or tap "New" to message someone.</p>
          </div>
        </div>
      )}

      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">New conversation</h2>
              <button onClick={() => setShowNewChat(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingContacts ? (
                <div className="space-y-2">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-14 rounded-xl" />)}</div>
              ) : contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {user?.role === "DOCTOR" ? "No patients yet — patients appear here once they've booked with you." : "No doctors yet — book an appointment first to start messaging."}
                </p>
              ) : (
                contacts.map(c => (
                  <button key={c.id} onClick={() => startConversation(c)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors text-left">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                      {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      {c.subtitle && <p className="text-xs text-muted-foreground truncate">{c.subtitle}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Shell title="Messages" subtitle="Your conversations">
      {body}
    </Shell>
  );
}