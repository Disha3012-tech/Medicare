import { useState, useRef, useEffect } from "react";
import { Search, Send, ArrowLeft, Circle, Check, CheckCheck, MoreVertical, Phone, Video, Paperclip } from "lucide-react";
import PatientShell from "../components/PatientShell";
import { CONVERSATIONS, type Conversation, type ChatMessage } from "../data/messages";

export default function Messaging() {
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const active = conversations.find(c => c.id === activeId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages]);

  function openConversation(id: string) {
    setActiveId(id);
    setConversations(cs => cs.map(c => c.id === id ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c));
  }

  function sendMessage() {
    if (!draft.trim() || !activeId) return;
    const msg: ChatMessage = { id: Date.now().toString(), senderId: "me", content: draft.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), read: false, type: "text" };
    setConversations(cs => cs.map(c => c.id === activeId ? { ...c, messages: [...c.messages, msg], lastMessage: msg.content, lastTime: msg.timestamp } : c));
    setDraft("");

    // Simulate typing indicator and auto-reply
    const conv = conversations.find(c => c.id === activeId);
    if (!conv) return;
    setTyping(true);
    setTimeout(() => {
      const replies = [
        "Thank you for letting me know. I'll review this and get back to you shortly.",
        "Understood. Please don't hesitate to reach out if your symptoms change.",
        "I appreciate you keeping me updated. This is helpful for your care plan.",
        "Noted. I'll add this to your records. Let's discuss further at your next appointment.",
        "That's good to hear. Please continue monitoring and contact me if anything changes.",
      ];
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeId,
        content: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true,
        type: "text",
      };
      setTyping(false);
      setConversations(cs => cs.map(c => c.id === activeId ? { ...c, messages: [...c.messages, reply], lastMessage: reply.content, lastTime: reply.timestamp } : c));
    }, 2000);
  }

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PatientShell title="Messages" subtitle="Your care team conversations">
      <div className="flex h-[calc(100vh-9rem)] -m-6 overflow-hidden rounded-xl border border-border bg-card">
        {/* Conversation list */}
        <div className={`flex flex-col w-full md:w-72 flex-shrink-0 border-r border-border ${active ? "hidden md:flex" : "flex"}`}>
          <div className="p-3 border-b border-border flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…" className="w-full bg-input-background rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv.id)}
                className={`w-full flex gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors text-left border-b border-border/50 ${activeId === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <img src={`https://images.unsplash.com/${conv.avatar}?w=40&h=40&fit=crop&auto=format`} alt={conv.name} className="w-full h-full object-cover" />
                  </div>
                  {conv.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${conv.unread > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{conv.name}</p>
                    <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{conv.lastTime}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.specialty}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${conv.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center flex-shrink-0 ml-2">{conv.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {active ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 flex-shrink-0 bg-card">
              <button onClick={() => setActiveId(null)} className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-muted">
                  <img src={`https://images.unsplash.com/${active.avatar}?w=36&h=36&fit=crop&auto=format`} alt={active.name} className="w-full h-full object-cover" />
                </div>
                {active.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-card" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{active.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {active.online ? (
                    <><Circle className="w-2 h-2 fill-accent text-accent" /> Online</>
                  ) : "Offline"} · {active.specialty}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><Phone className="w-4 h-4" /></button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><Video className="w-4 h-4" /></button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-background/50">
              {active.messages.map((msg, i) => {
                const isMe = msg.senderId === "me";
                const showAvatar = !isMe && (i === 0 || active.messages[i - 1].senderId !== msg.senderId);
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 items-end`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex-shrink-0 mb-0.5">
                        {showAvatar ? (
                          <img src={`https://images.unsplash.com/${active.avatar}?w=28&h=28&fit=crop&auto=format`} alt="" className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full" />}
                      </div>
                    )}
                    <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-foreground border border-border rounded-bl-sm"}`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-muted-foreground">{msg.timestamp}</p>
                        {isMe && (
                          msg.read
                            ? <CheckCheck className="w-3 h-3 text-accent" />
                            : <Check className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex-shrink-0 mb-0.5">
                    <img src={`https://images.unsplash.com/${active.avatar}?w=28&h=28&fit=crop&auto=format`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex-shrink-0 bg-card">
              <div className="flex items-center gap-2">
                <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"><Paperclip className="w-4 h-4" /></button>
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder={`Message ${active.name}…`}
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
              <p className="text-sm text-muted-foreground">Choose a doctor to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </PatientShell>
  );
}
