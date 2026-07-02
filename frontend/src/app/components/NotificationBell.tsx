import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { NOTIFICATIONS, type Notification } from "../data/notifications";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS.slice(0, 5));
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter(n => !n.read).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function markAllRead() {
    setItems(i => i.map(n => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setItems(i => i.map(n => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all relative"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent border border-card" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">Notifications</p>
              {unread > 0 && <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">{unread}</span>}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
            ) : (
              items.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  compact
                  onRead={() => markRead(n.id)}
                  onClick={() => { markRead(n.id); setOpen(false); if (n.link) navigate(n.link); }}
                />
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-border">
            <button onClick={() => { setOpen(false); navigate("/patient/notifications"); }} className="text-xs text-accent hover:underline w-full text-center">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
