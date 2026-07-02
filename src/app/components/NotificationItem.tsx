import { Calendar, CheckCircle2, XCircle, Pill, MessageCircle, Bell } from "lucide-react";
import type { Notification, NotificationType } from "../data/notifications";

const ICONS: Record<NotificationType, React.ReactNode> = {
  appointment_booked: <Calendar className="w-4 h-4 text-accent" />,
  appointment_approved: <CheckCircle2 className="w-4 h-4 text-accent" />,
  appointment_cancelled: <XCircle className="w-4 h-4 text-destructive" />,
  prescription_uploaded: <Pill className="w-4 h-4 text-primary" />,
  doctor_message: <MessageCircle className="w-4 h-4 text-accent" />,
  reminder: <Bell className="w-4 h-4 text-muted-foreground" />,
};

const BG: Record<NotificationType, string> = {
  appointment_booked: "bg-accent/10",
  appointment_approved: "bg-accent/10",
  appointment_cancelled: "bg-destructive/10",
  prescription_uploaded: "bg-primary/10",
  doctor_message: "bg-accent/10",
  reminder: "bg-muted",
};

interface Props {
  notification: Notification;
  compact?: boolean;
  onRead?: () => void;
  onClick?: () => void;
}

export default function NotificationItem({ notification: n, compact, onRead, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`flex gap-3 cursor-pointer transition-colors ${compact ? "px-4 py-3 hover:bg-muted/50" : "p-5 hover:bg-muted/30 rounded-xl border border-border bg-card"} ${!n.read ? "bg-accent/[0.03]" : ""}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${BG[n.type]}`}>
        {n.avatar ? (
          <img src={`https://images.unsplash.com/${n.avatar}?w=36&h=36&fit=crop&auto=format`} className="w-9 h-9 rounded-lg object-cover" alt="" />
        ) : ICONS[n.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.title}</p>
          {!n.read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
      </div>
    </div>
  );
}
