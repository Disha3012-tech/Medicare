import { useState, useMemo, useEffect } from "react";
import { Calendar, CheckCircle2, XCircle, Clock, CalendarX } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import AppointmentCard from "../components/AppointmentCard";
import AppointmentFilter, { ApptFilterState, DEFAULT_APPT_FILTER } from "../components/AppointmentFilter";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { appointmentsService, type Appointment } from "../services/appointments";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../components/AuthProvider";

export default function DoctorAppointmentHistory() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<ApptFilterState>(DEFAULT_APPT_FILTER);
  const { toasts, add: addToast, dismiss } = useToast();

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  function load() {
    setLoading(true);
    setError("");
    appointmentsService.getMine()
      .then(setAppointments)
      .catch(err => setError(err.message || "Failed to load appointments"))
      .finally(() => setLoading(false));
  }

  const counts = useMemo(() => ({
    all: appointments.length,
    upcoming: appointments.filter(a => ["PENDING","CONFIRMED"].includes(a.status) && new Date(a.scheduled_at) > new Date()).length,
    completed: appointments.filter(a => a.status === "COMPLETED").length,
    cancelled: appointments.filter(a => a.status === "CANCELLED").length,
    no_show: appointments.filter(a => a.status === "NO_SHOW").length,
  }), [appointments]);

  const filtered = useMemo(() => {
    let list = appointments.filter(a => {
      const isUpcoming = ["PENDING","CONFIRMED"].includes(a.status) && new Date(a.scheduled_at) > new Date();
      const isCompleted = a.status === "COMPLETED";
      const isCancelled = a.status === "CANCELLED";
      const isNoShow = a.status === "NO_SHOW";
      if (filter.status === "upcoming" && !isUpcoming) return false;
      if (filter.status === "completed" && !isCompleted) return false;
      if (filter.status === "cancelled" && !isCancelled) return false;
      if ((filter.status as string) === "no_show" && !isNoShow) return false;
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

  const summaryStats = [
    { label: "Upcoming",  count: counts.upcoming,  icon: Clock,        color: "text-primary",     bg: "bg-primary/10" },
    { label: "Completed", count: counts.completed, icon: CheckCircle2, color: "text-accent",      bg: "bg-accent/10" },
    { label: "Cancelled", count: counts.cancelled, icon: XCircle,      color: "text-destructive", bg: "bg-destructive/10" },
    { label: "No-show",   count: counts.no_show,   icon: CalendarX,    color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/20" },
  ];

  return (
    <DoctorShell title="Appointment History" subtitle="All your appointments, past and upcoming">
      <div className="max-w-3xl space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        <AppointmentFilter filter={filter} onChange={setFilter} counts={counts} />

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <button onClick={load} className="text-sm text-accent hover:underline">Try again</button>
          </div>
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
              showReviewButton={false}
              showAppointmentActions={false}
              />
            ))}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </DoctorShell>
  );
}