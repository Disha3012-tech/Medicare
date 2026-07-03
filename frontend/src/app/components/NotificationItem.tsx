import { Calendar, CheckCircle2, XCircle, Pill, MessageCircle, Bell } from "lucide-react";
import type { Notification } from "../services/notifications";

type NotificationType = "APPOINTMENT" | "MESSAGE" | "PRESCRIPTION" | "SYSTEM" | "REMINDER";

const ICONS: Record<NotificationType, React.ReactNode> = {
  APPOINTMENT: <Calendar className="w-4 h-4 text-accent" />,
  MESSAGE: <MessageCircle className="w-4 h-4 text-accent" />,
  PRESCRIPTION: <Pill className="w-4 h-4 text-primary" />,
  SYSTEM: <CheckCircle2 className="w-4 h-4 text-accent" />,
  REMINDER: <Bell className="w-4 h-4 text-muted-foreground" />,
};

const BG: Record<NotificationType, string> = {
  APPOINTMENT: "bg-accent/10",
  MESSAGE: "bg-accent/10",
  PRESCRIPTION: "bg-primary/10",
  SYSTEM: "bg-accent/10",
  REMINDER: "bg-muted",
};

interface Props {
  notification: Notification;
  compact?: boolean;
  onRead?: () => void;
  onClick?: () => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NotificationItem({ notification: n, compact, onRead, onClick }: Props) {
  const iconKey = n.type as NotificationType;
  return (
    <div
      onClick={onClick}
      className={`flex gap-3 cursor-pointer transition-colors ${compact ? "px-4 py-3 hover:bg-muted/50" : "p-5 hover:bg-muted/30 rounded-xl border border-border bg-card"} ${!n.is_read ? "bg-accent/[0.03]" : ""}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${BG[iconKey] || "bg-muted"}`}>
        {ICONS[iconKey] || <Bell className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${n.is_read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.title}</p>
          {!n.is_read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
      </div>
    </div>
  );
}
