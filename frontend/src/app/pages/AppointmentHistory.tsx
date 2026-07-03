import { useState, useMemo, useEffect } from "react";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import PatientShell from "../components/PatientShell";
import AppointmentCard from "../components/AppointmentCard";
import AppointmentFilter, { ApptFilterState, DEFAULT_APPT_FILTER } from "../components/AppointmentFilter";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { appointmentsService, type Appointment } from "../services/appointments";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../components/AuthProvider";

export default function AppointmentHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApptFilterState>(DEFAULT_APPT_FILTER);
  const { toasts, add: addToast, dismiss } = useToast();

  useEffect(() => {
    if (!user) return;
    appointmentsService.getMine()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const counts = useMemo(() => ({
    all: appointments.length,
    upcoming: appointments.filter(a => ["PENDING","CONFIRMED"].includes(a.status) && new Date(a.scheduled_at) > new Date()).length,
    completed: appointments.filter(a => a.status === "COMPLETED").length,
    cancelled: appointments.filter(a => a.status === "CANCELLED").length,
  }), [appointments]);

  const filtered = useMemo(() => {
    let list = appointments.filter(a => {
      const isUpcoming = ["PENDING","CONFIRMED"].includes(a.status) && new Date(a.scheduled_at) > new Date();
      const isCompleted = a.status === "COMPLETED";
      const isCancelled = a.status === "CANCELLED" || a.status === "NO_SHOW";
      if (filter.status === "upcoming" && !isUpcoming) return false;
      if (filter.status === "completed" && !isCompleted) return false;
      if (filter.status === "cancelled" && !isCancelled) return false;
      if (filter.query) {
        const q = filter.query.toLowerCase();
        if (!(a.reason_for_visit || "").toLowerCase().includes(q) && !a.type.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      const da = new Date(a.scheduled_at).getTime(), db = new Date(b.scheduled_at).getTime();
      return filter.sort === "newest" ? db - da : da - db;
    });
    return list;
  }, [appointments, filter]);

  async function handleCancel(id: string) {
    try {
      await appointmentsService.cancel(id, "Cancelled by patient.");
      setAppointments(appts => appts.map(a => a.id === id ? { ...a, status: "CANCELLED" as const } : a));
      addToast({ type: "info", title: "Appointment cancelled", body: "Your appointment has been cancelled." });
    } catch (err: any) {
      addToast({ type: "error", title: "Failed to cancel", body: err.message });
    }
  }

  async function handleReschedule(id: string) {
    addToast({ type: "info", title: "Reschedule", body: "Contact the clinic to reschedule this appointment." });
  }

  const summaryStats = [
    { label: "Upcoming",  count: counts.upcoming,  icon: Clock,        color: "text-primary",     bg: "bg-primary/10" },
    { label: "Completed", count: counts.completed, icon: CheckCircle2, color: "text-accent",      bg: "bg-accent/10" },
    { label: "Cancelled", count: counts.cancelled, icon: XCircle,      color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <PatientShell title="Appointment History" subtitle="Manage and track all your medical visits">
      <div className="max-w-3xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {summaryStats.map(({ label, count, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                {loading ? <LoadingSkeleton className="h-6 w-8 mb-0.5" /> : (
                  <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground leading-none">{count}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <AppointmentFilter filter={filter} onChange={setFilter} counts={counts} />

        {/* List */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">No appointments found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(appt => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                onReschedule={handleReschedule}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PatientShell>
  );
}
