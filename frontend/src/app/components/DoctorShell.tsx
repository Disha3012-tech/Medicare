import { useNavigate, useLocation } from "react-router";
import { HeartPulse, Calendar, Users, BarChart2, Clock, Pill, Settings, LogOut, Bell, MessageCircle } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import FloatingAIAssistant from "./FloatingAIAssistant";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

const NAV = [
  { path: "/doctor", label: "Schedule", icon: Calendar, exact: true },
  { path: "/doctor/patients", label: "Patients", icon: Users },
  { path: "/messages", label: "Messages", icon: MessageCircle },
  { path: "/doctor/prescriptions", label: "Prescriptions", icon: Pill },
  { path: "/doctor/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/doctor/availability", label: "Availability", icon: Clock },
];

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function DoctorShell({ title, subtitle, children, actions }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { user, doctorProfile, logout } = useAuth();

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname.startsWith(path);

  const displayName = user ? `Dr. ${user.first_name} ${user.last_name}` : "Doctor";
  const specialty = doctorProfile?.specialty || "";

  async function handleLogout() {
    await logout();
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-background flex font-['Inter',sans-serif]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <button onClick={() => navigate("/doctor")} className="p-6 border-b border-border flex items-center gap-2 hover:bg-muted/30 transition-colors w-full text-left">
          <HeartPulse className="w-6 h-6 text-accent" />
          <span className="font-['Fraunces',serif] font-semibold text-lg text-primary">Medica</span>
        </button>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={displayName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : "DR"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">{specialty}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ path, label, icon: Icon, exact }) => (
            <button
              key={path}
              onClick={() => { navigate(path); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(path, exact) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-0.5">
          <button onClick={() => { navigate("/doctor/notifications"); setOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive("/doctor/notifications") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button onClick={() => { navigate("/doctor/settings"); setOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive("/doctor/settings") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button className="lg:hidden text-muted-foreground hover:text-foreground flex-shrink-0" onClick={() => setOpen(true)}>
              <div className="space-y-1"><span className="block w-5 h-0.5 bg-current" /><span className="block w-5 h-0.5 bg-current" /><span className="block w-5 h-0.5 bg-current" /></div>
            </button>
            <div className="min-w-0">
              <h1 className="font-['Fraunces',serif] text-xl font-semibold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
      <FloatingAIAssistant />
    </div>
  );
}