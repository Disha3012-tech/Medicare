import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { AppointmentStatus } from "../data/appointments";

const CONFIG = {
  upcoming: { label: "Upcoming", icon: Clock, className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-accent/10 text-accent" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

export default function AppointmentStatusBadge({ status, size = "sm" }: { status: AppointmentStatus; size?: "sm" | "md" }) {
  const { label, icon: Icon, className } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${className} ${size === "md" ? "text-sm px-3 py-1.5" : "text-xs px-2.5 py-1"}`}>
      <Icon className={size === "md" ? "w-4 h-4" : "w-3 h-3"} />
      {label}
    </span>
  );
}
