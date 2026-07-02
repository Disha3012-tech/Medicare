import { useState } from "react";
import { CheckCheck, Bell } from "lucide-react";
import PatientShell from "../components/PatientShell";
import NotificationItem from "../components/NotificationItem";
import { NOTIFICATIONS, type Notification, type NotificationType } from "../data/notifications";
import { useNavigate } from "react-router";

const TYPE_LABELS: Record<NotificationType | "all", string> = {
  all: "All",
  appointment_booked: "Booked",
  appointment_approved: "Confirmed",
  appointment_cancelled: "Cancelled",
  prescription_uploaded: "Prescriptions",
  doctor_message: "Messages",
  reminder: "Reminders",
};

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");

  const unread = items.filter(n => !n.read).length;

  const filtered = items.filter(n => typeFilter === "all" || n.type === typeFilter);

  function markAll() { setItems(ns => ns.map(n => ({ ...n, read: true }))); }
  function markOne(id: string) { setItems(ns => ns.map(n => n.id === id ? { ...n, read: true } : n)); }

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
          {(Object.keys(TYPE_LABELS) as (NotificationType | "all")[]).map(type => {
            const count = type === "all" ? items.filter(n => !n.read).length : items.filter(n => n.type === type && !n.read).length;
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${typeFilter === type ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}
              >
                {TYPE_LABELS[type]}
                {count > 0 && <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${typeFilter === type ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground"}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        {filtered.length === 0 ? (
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
                onClick={() => { markOne(n.id); if (n.link) navigate(n.link); }}
              />
            ))}
          </div>
        )}
      </div>
    </PatientShell>
  );
}
