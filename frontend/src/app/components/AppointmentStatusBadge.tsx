import { CheckCircle2, Clock, XCircle, CalendarX } from "lucide-react";

export type DisplayStatus = "upcoming" | "completed" | "cancelled" | "no_show";

const CONFIG: Record<DisplayStatus, { label: string; icon: typeof Clock; className: string }> = {
  upcoming:  { label: "Upcoming",  icon: Clock,        className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-accent/10 text-accent" },
  cancelled: { label: "Cancelled", icon: XCircle,      className: "bg-destructive/10 text-destructive" },
  no_show:   { label: "No-show",   icon: CalendarX,    className: "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400" },
};

export default function AppointmentStatusBadge({ status, size = "sm" }: { status: DisplayStatus; size?: "sm" | "md" }) {
  const { label, icon: Icon, className } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${className} ${size === "md" ? "text-sm px-3 py-1.5" : "text-xs px-2.5 py-1"}`}>
      <Icon className={size === "md" ? "w-4 h-4" : "w-3 h-3"} />
      {label}
    </span>
  );
}