import { useState, useEffect } from "react";
import { CheckCheck, Bell } from "lucide-react";
import PatientShell from "../components/PatientShell";
import NotificationItem from "../components/NotificationItem";
import { notificationsService, type Notification } from "../services/notifications";
import { useAuth } from "../components/AuthProvider";
import LoadingSkeleton from "../components/LoadingSkeleton";  

type FilterType = "all" | "APPOINTMENT" | "MESSAGE" | "PRESCRIPTION" | "SYSTEM" | "REMINDER";

const TYPE_LABELS: Record<FilterType, string> = {
  all: "All",
  APPOINTMENT: "Appointments",
  MESSAGE: "Messages",
  PRESCRIPTION: "Prescriptions",
  SYSTEM: "System",
  REMINDER: "Reminders",
};

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!user) return;
    notificationsService.getMine()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const unread = items.filter(n => !n.is_read).length;
  const filtered = items.filter(n => typeFilter === "all" || n.type === typeFilter);

  async function markAll() {
    await notificationsService.markAllRead().catch(console.error);
    setItems(ns => ns.map(n => ({ ...n, is_read: true })));
  }

  async function markOne(id: string) {
    await notificationsService.markRead(id).catch(console.error);
    setItems(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  return (
    <PatientShell
      title="Notifications"
      subtitle={unread > 0 ? `${unread} unread` : "All caught up"}
      actions={
        unread > 0 ? (
          <button onClick={markAll} className="flex items-center gap-1.5 text-sm text-accent hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        ) : undefined
      }
    >
      <div className="max-w-2xl space-y-5">
        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_LABELS) as FilterType[]).map(type => {
            const count = type === "all"
              ? items.filter(n => !n.is_read).length
              : items.filter(n => n.type === type && !n.is_read).length;
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${typeFilter === type ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}
              >
                {TYPE_LABELS[type]}
                {count > 0 && (
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${typeFilter === type ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No notifications</p>
            <p className="text-sm text-muted-foreground">You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={() => markOne(n.id)}
                onClick={() => markOne(n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PatientShell>
  );
}
