import { useState, useMemo } from "react";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import PatientShell from "../components/PatientShell";
import AppointmentCard from "../components/AppointmentCard";
import AppointmentFilter, { ApptFilterState, DEFAULT_APPT_FILTER } from "../components/AppointmentFilter";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { APPOINTMENT_HISTORY, type AppointmentRecord } from "../data/appointments";

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(APPOINTMENT_HISTORY);
  const [filter, setFilter] = useState<ApptFilterState>(DEFAULT_APPT_FILTER);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const { toasts, add: addToast, dismiss } = useToast();

  const counts = useMemo(() => ({
    all: appointments.length,
    upcoming: appointments.filter(a => a.status === "upcoming").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  }), [appointments]);

  const filtered = useMemo(() => {
    let list = appointments.filter(a => {
      if (filter.status !== "all" && a.status !== filter.status) return false;
      if (filter.query) {
        const q = filter.query.toLowerCase();
        if (!a.doctorName.toLowerCase().includes(q) && !a.specialty.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
      return filter.sort === "newest" ? db - da : da - db;
    });
    return list;
  }, [appointments, filter]);

  function handleCancel(id: string) {
    setAppointments(appts => appts.map(a => a.id === id ? { ...a, status: "cancelled" as const, notes: "Cancelled by patient." } : a));
    addToast({ type: "info", title: "Appointment cancelled", body: "Your appointment has been cancelled successfully." });
  }

  function handleReschedule(id: string) {
    setRescheduleId(id);
    addToast({ type: "success", title: "Reschedule requested", body: "We'll confirm your new appointment within 24 hours." });
    setRescheduleId(null);
  }

  const summaryStats = [
    { label: "Upcoming", count: counts.upcoming, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
    { label: "Completed", count: counts.completed, icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Cancelled", count: counts.cancelled, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
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
                <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground leading-none">{count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <AppointmentFilter filter={filter} onChange={setFilter} counts={counts} />

        {/* List */}
        {filtered.length === 0 ? (
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
