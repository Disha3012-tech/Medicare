import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Calendar, Users, ClipboardList, Clock, Video,
  CheckCircle2, Pill, BarChart2,
} from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import { useAuth } from "../components/AuthProvider";
import { appointmentsService, type Appointment } from "../services/appointments";
import LoadingSkeleton from "../components/LoadingSkeleton";

const quickActions = [
  { label: "Write prescription",  icon: Pill,     path: "/doctor/prescriptions" },
  { label: "View all patients",   icon: Users,    path: "/doctor/patients" },
  { label: "Analytics",           icon: BarChart2,path: "/doctor/analytics" },
  { label: "Manage availability", icon: Calendar, path: "/doctor/availability" },
];

type Tab = "overview" | "schedule";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, doctorProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    appointmentsService.getMine()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const today = new Date();
  const todayStr = today.toDateString();

  const todayAppts = appointments.filter(a => new Date(a.scheduled_at).toDateString() === todayStr)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const upcomingAppts = appointments.filter(a =>
    ["PENDING","CONFIRMED"].includes(a.status) && new Date(a.scheduled_at) > today
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const completedToday = todayAppts.filter(a => a.status === "COMPLETED").length;

  const greeting = user
    ? `Good ${today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"}, Dr. ${user.last_name}`
    : "Welcome";

  const subtitle = doctorProfile
    ? `${doctorProfile.specialty}${doctorProfile.clinic_name ? ` · ${doctorProfile.clinic_name}` : ""}`
    : today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const overviewStats = [
    { label: "Today's appointments",  value: loading ? "…" : String(todayAppts.length),      sub: `${completedToday} completed`,        icon: Calendar,      color: "text-primary bg-primary/10" },
    { label: "Upcoming",              value: loading ? "…" : String(upcomingAppts.length),    sub: upcomingAppts[0] ? `Next: ${formatTime(upcomingAppts[0].scheduled_at)}` : "None scheduled", icon: Clock, color: "text-accent bg-accent/10" },
    { label: "Patients seen today",   value: loading ? "…" : String(completedToday),          sub: "Completed",                           icon: Users,         color: "text-primary bg-primary/10" },
    { label: "Total reviews",         value: loading ? "…" : String(doctorProfile?.total_reviews ?? 0), sub: `Avg ${doctorProfile?.average_rating ?? 0} stars`, icon: ClipboardList, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20" },
  ];

  return (
    <DoctorShell title={activeTab === "overview" ? greeting : "Today's Schedule"} subtitle={subtitle}>
      {/* Tab bar */}
      <div className="flex border-b border-border mb-6 gap-1 -mt-2">
        {([ ["overview","Overview"],["schedule","Schedule"] ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <div className="max-w-5xl space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {loading ? (
                  <LoadingSkeleton className="h-7 w-12 mb-1" />
                ) : (
                  <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">{value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="font-medium text-foreground text-sm mb-3">Quick actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <button key={label} onClick={() => navigate(path)} className="bg-card rounded-xl border border-border p-4 flex flex-col items-start gap-2 hover:border-primary/30 hover:shadow-sm transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming appointments */}
          <div>
            <h2 className="font-medium text-foreground text-sm mb-3 flex items-center justify-between">
              Upcoming appointments
              <button onClick={() => setActiveTab("schedule")} className="text-xs text-accent hover:underline font-normal">View schedule</button>
            </h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <LoadingSkeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : upcomingAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming appointments.</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.slice(0, 4).map(appt => (
                  <div key={appt.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Patient appointment</p>
                      <p className="text-xs text-muted-foreground">{appt.reason_for_visit || "General visit"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-foreground">{formatDate(appt.scheduled_at)}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(appt.scheduled_at)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1 ${appt.status === "CONFIRMED" ? "bg-accent/10 text-accent" : "bg-yellow-50 text-yellow-600"}`}>
                      {appt.type === "VIDEO" && <Video className="w-3 h-3" />}
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Schedule ── */}
      {activeTab === "schedule" && (
        <div className="max-w-3xl space-y-3">
          <h2 className="font-medium text-foreground text-sm mb-4">
            Today — {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : todayAppts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No appointments scheduled for today.</p>
          ) : (
            todayAppts.map(appt => (
              <div key={appt.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className="w-14 text-center flex-shrink-0">
                  <p className="text-sm font-medium text-foreground">{formatTime(appt.scheduled_at)}</p>
                  <p className="text-xs text-muted-foreground">{appt.duration_min}min</p>
                </div>
                <div className="w-px h-12 bg-border flex-shrink-0" />
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Patient appointment</p>
                  <p className="text-xs text-muted-foreground">{appt.reason_for_visit || "General visit"} · {appt.type.replace("_"," ")}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  appt.status === "COMPLETED" ? "bg-accent/10 text-accent" :
                  appt.status === "CONFIRMED" ? "bg-primary/10 text-primary" :
                  "bg-yellow-50 text-yellow-600"
                }`}>
                  {appt.type === "VIDEO" && <Video className="w-3 h-3 inline mr-1" />}
                  {appt.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </DoctorShell>
  );
}
