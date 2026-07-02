import { useState } from "react";
import { User, UserCheck, Shield, Bell, Lock, CheckCircle2 } from "lucide-react";
import PatientShell from "../components/PatientShell";
import ProfileSettings from "../components/ProfileSettings";
import EmergencyContact from "../components/EmergencyContact";
import InsuranceInformation from "../components/InsuranceInformation";
import { ToastContainer, useToast } from "../components/ToastNotification";

type Tab = "profile" | "emergency" | "insurance" | "notifications" | "password";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",        icon: <User className="w-4 h-4" /> },
  { id: "emergency",     label: "Emergency",      icon: <UserCheck className="w-4 h-4" /> },
  { id: "insurance",     label: "Insurance",      icon: <Shield className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications",  icon: <Bell className="w-4 h-4" /> },
  { id: "password",      label: "Password",       icon: <Lock className="w-4 h-4" /> },
];

const NOTIF_PREFS = [
  { key: "apptReminders", label: "Appointment reminders", sub: "24h before your appointment" },
  { key: "apptUpdates",   label: "Appointment updates",   sub: "Confirmations, cancellations, reschedules" },
  { key: "prescriptions", label: "New prescriptions",     sub: "When a doctor uploads a prescription" },
  { key: "messages",      label: "Doctor messages",       sub: "Direct messages from your care team" },
  { key: "healthTips",    label: "Health tips",           sub: "Weekly wellness content" },
  { key: "marketing",     label: "Promotions",            sub: "Offers and updates from Medica" },
];

export default function PatientSettings() {
  const [tab, setTab] = useState<Tab>("profile");
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({ apptReminders: true, apptUpdates: true, prescriptions: true, messages: true, healthTips: false, marketing: false });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const { toasts, add: addToast, dismiss } = useToast();

  function handleSave() { addToast({ type: "success", title: "Changes saved", body: "Your settings have been updated." }); }

  return (
    <PatientShell title="Settings" subtitle="Manage your account and preferences">
      <div className="max-w-4xl">
        <div className="grid md:grid-cols-[200px_1fr] gap-6">
          {/* Tab sidebar */}
          <nav className="bg-card rounded-xl border border-border p-2 h-fit">
            {TABS.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {icon}{label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="bg-card rounded-xl border border-border p-6">
            {tab === "profile" && <ProfileSettings onSave={handleSave} />}
            {tab === "emergency" && <EmergencyContact onSave={handleSave} />}
            {tab === "insurance" && <InsuranceInformation onSave={handleSave} />}

            {tab === "notifications" && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground mb-1">Notification preferences</h2>
                  <p className="text-sm text-muted-foreground">Choose what you'd like to be notified about.</p>
                </div>
                {NOTIF_PREFS.map(({ key, label, sub }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                    <div
                      onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                      className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${notifPrefs[key] ? "bg-accent" : "bg-switch-background"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${notifPrefs[key] ? "left-5" : "left-1"}`} />
                    </div>
                  </div>
                ))}
                <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all mt-4">
                  <CheckCircle2 className="w-4 h-4" /> Save preferences
                </button>
              </div>
            )}

            {tab === "password" && (
              <div className="space-y-5 max-w-md">
                <div>
                  <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground mb-1">Change password</h2>
                  <p className="text-sm text-muted-foreground">Use a strong password of at least 8 characters.</p>
                </div>
                {[["current","Current password"],["next","New password"],["confirm","Confirm new password"]].map(([k, label]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                    <input type="password" value={(pwForm as any)[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Lock className="w-4 h-4" /> Update password
                </button>
                {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PatientShell>
  );
}
