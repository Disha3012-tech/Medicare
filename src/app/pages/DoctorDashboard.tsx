import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Calendar, Users, ClipboardList, Clock, Video,
  MapPin, CheckCircle2, TrendingUp, Pill, BarChart2,
  ArrowRight, FileText, MessageSquare,
} from "lucide-react";
import DoctorShell from "../components/DoctorShell";

const todaySchedule = [
  { id: 1, patient: "Marcus Webb",   age: 52, time: "9:00 AM",  type: "In-person", reason: "Post-op follow-up",       status: "completed",   avatar: "photo-1500648767791-00dcc994a43e" },
  { id: 2, patient: "Priya Sharma",  age: 34, time: "10:30 AM", type: "Video",     reason: "Chest pain evaluation",   status: "in-progress", avatar: "photo-1494790108377-be9c29b29330" },
  { id: 3, patient: "Noel Okafor",   age: 45, time: "11:15 AM", type: "In-person", reason: "Hypertension review",     status: "upcoming",    avatar: "photo-1507003211169-0a1dd7228f2d" },
  { id: 4, patient: "Elena Petrov",  age: 61, time: "2:00 PM",  type: "In-person", reason: "Annual cardiac screening", status: "upcoming",   avatar: "photo-1580489944761-15a19d654956" },
  { id: 5, patient: "David Chen",    age: 48, time: "3:30 PM",  type: "Video",     reason: "Medication adjustment",   status: "upcoming",    avatar: "photo-1472099645785-5658abf4ff4e" },
];

const overviewStats = [
  { label: "Today's appointments",  value: "5",  sub: "2 completed",   icon: Calendar,     color: "text-primary bg-primary/10" },
  { label: "Upcoming",             value: "3",  sub: "Next: 11:15 AM", icon: Clock,        color: "text-accent bg-accent/10" },
  { label: "Patients seen today",  value: "2",  sub: "On schedule",    icon: Users,        color: "text-primary bg-primary/10" },
  { label: "Pending notes",        value: "3",  sub: "To complete",    icon: ClipboardList,color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20" },
];

const quickActions = [
  { label: "Write prescription",  icon: Pill,          onClick: (nav: ReturnType<typeof useNavigate>) => nav("/doctor/prescriptions") },
  { label: "View all patients",   icon: Users,         onClick: (nav: ReturnType<typeof useNavigate>) => nav("/doctor/patients") },
  { label: "Analytics",           icon: BarChart2,     onClick: (nav: ReturnType<typeof useNavigate>) => nav("/doctor/analytics") },
  { label: "Manage availability", icon: Calendar,      onClick: (nav: ReturnType<typeof useNavigate>) => nav("/doctor/availability") },
];

type Tab = "overview" | "schedule";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <DoctorShell
      title={activeTab === "overview" ? "Good morning, Dr. Osei" : "Today's Schedule"}
      subtitle="Tuesday, July 1, 2026 · Cardiology, St. Luke's Hospital"
    >
      {/* Tab bar */}
      <div className="flex border-b border-border mb-6 gap-1 -mt-2">
        {([["overview","Overview"],["schedule","Schedule"]] as const).map(([id, label]) => (
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
            {overviewStats.map(({ label, value, sub, icon: Icon, color }) => {
              const [textColor, bgColor] = color.split(" ");
              return (
                <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                    <Icon className={`w-4 h-4 ${textColor}`} />
                  </div>
                  <div>
                    <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground leading-none">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    <p className="text-xs text-muted-foreground/60">{sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            {/* Today's abbreviated schedule */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium text-foreground text-sm">Today's appointments</h2>
                <button onClick={() => setActiveTab("schedule")} className="text-xs text-accent hover:underline flex items-center gap-1">Full schedule <ArrowRight className="w-3 h-3" /></button>
              </div>
              <div className="space-y-2">
                {todaySchedule.map(appt => (
                  <div key={appt.id} className={`bg-card rounded-xl border p-4 flex gap-3 items-center ${appt.status === "in-progress" ? "border-accent/40 ring-1 ring-accent/20" : "border-border"}`}>
                    <p className="font-['DM_Mono',monospace] text-xs text-muted-foreground w-14 flex-shrink-0 text-center">
                      {appt.time.split(" ")[0]}<br />
                      <span className="text-muted-foreground/60">{appt.time.split(" ")[1]}</span>
                    </p>
                    <div className="w-px h-8 bg-border flex-shrink-0" />
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <img src={`https://images.unsplash.com/${appt.avatar}?w=32&h=32&fit=crop&auto=format`} alt={appt.patient} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{appt.patient}</p>
                      <p className="text-xs text-muted-foreground truncate">{appt.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${appt.status === "completed" ? "bg-muted text-muted-foreground" : appt.status === "in-progress" ? "bg-accent/10 text-accent" : "bg-secondary text-secondary-foreground"}`}>
                        {appt.status === "in-progress" ? "Now" : appt.status === "completed" ? "Done" : "Soon"}
                      </span>
                      {appt.type === "Video" && <Video className="w-3.5 h-3.5 text-accent" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions + notifications */}
            <div className="space-y-4">
              <div>
                <h2 className="font-medium text-foreground text-sm mb-3">Quick actions</h2>
                <div className="space-y-2">
                  {quickActions.map(({ label, icon: Icon, onClick }) => (
                    <button key={label} onClick={() => onClick(navigate)} className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:shadow-sm transition-all">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {label}
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-medium text-foreground text-sm mb-3">Upcoming this week</h2>
                <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                  {[
                    { day: "Wed Jul 2", count: 6 },
                    { day: "Thu Jul 3", count: 7 },
                    { day: "Fri Jul 4", count: 4 },
                  ].map(({ day, count }) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{day}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(count, 7) }).map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-sm bg-primary/20" />
                          ))}
                        </div>
                        <span className="font-['DM_Mono',monospace] text-xs text-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Schedule ── */}
      {activeTab === "schedule" && (
        <div className="max-w-3xl space-y-3">
          {todaySchedule.map(appt => (
            <div key={appt.id} className={`bg-card rounded-xl border p-5 flex gap-4 ${appt.status === "in-progress" ? "border-accent ring-1 ring-accent/20" : "border-border"}`}>
              <div className="flex-shrink-0 text-center w-14">
                <p className="font-['DM_Mono',monospace] text-sm font-medium text-foreground">{appt.time.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground">{appt.time.split(" ")[1]}</p>
                <div className="mt-2">
                  {appt.status === "completed"   && <CheckCircle2 className="w-5 h-5 text-accent mx-auto" />}
                  {appt.status === "in-progress" && <div className="w-3 h-3 rounded-full bg-accent mx-auto animate-pulse" />}
                  {appt.status === "upcoming"    && <div className="w-3 h-3 rounded-full bg-muted border-2 border-border mx-auto" />}
                </div>
              </div>
              <div className="w-px bg-border flex-shrink-0" />
              <div className="flex-1 flex gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img src={`https://images.unsplash.com/${appt.avatar}?w=40&h=40&fit=crop&auto=format`} alt={appt.patient} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground text-sm">{appt.patient}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${appt.status === "completed" ? "bg-muted text-muted-foreground" : appt.status === "in-progress" ? "bg-accent/10 text-accent" : "bg-secondary text-secondary-foreground"}`}>
                      {appt.status === "in-progress" ? "In progress" : appt.status === "completed" ? "Done" : "Upcoming"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Age {appt.age} · {appt.reason}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {appt.type === "Video" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />} {appt.type}
                    </span>
                    {appt.status !== "completed" && (
                      <button className="text-xs text-primary font-medium hover:underline">Open chart</button>
                    )}
                    {appt.status === "in-progress" && appt.type === "Video" && (
                      <button onClick={() => navigate(`/consultation/${appt.id}`)} className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-lg hover:bg-accent/90 transition-colors">
                        Join call
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DoctorShell>
  );
}
