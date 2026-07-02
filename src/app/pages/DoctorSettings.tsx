import { useState } from "react";
import { User, GraduationCap, Building2, Lock, CheckCircle2 } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import ProfileEditor from "../components/ProfileEditor";
import QualificationEditor from "../components/QualificationEditor";
import ClinicInformation from "../components/ClinicInformation";
import { ToastContainer, useToast } from "../components/ToastNotification";

type Tab = "profile" | "qualifications" | "clinic" | "password";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",        label: "Profile",         icon: <User className="w-4 h-4" /> },
  { id: "qualifications", label: "Qualifications",  icon: <GraduationCap className="w-4 h-4" /> },
  { id: "clinic",         label: "Clinic Info",     icon: <Building2 className="w-4 h-4" /> },
  { id: "password",       label: "Password",        icon: <Lock className="w-4 h-4" /> },
];

export default function DoctorSettings() {
  const [tab, setTab] = useState<Tab>("profile");
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const { toasts, add: addToast, dismiss } = useToast();

  function handleSave() { addToast({ type: "success", title: "Changes saved", body: "Your settings have been updated." }); }

  return (
    <DoctorShell title="Settings" subtitle="Manage your profile and practice information">
      <div className="max-w-4xl">
        <div className="grid md:grid-cols-[200px_1fr] gap-6">
          <nav className="bg-card rounded-xl border border-border p-2 h-fit">
            {TABS.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {icon}{label}
              </button>
            ))}
          </nav>
          <div className="bg-card rounded-xl border border-border p-6">
            {tab === "profile"        && <ProfileEditor onSave={handleSave} />}
            {tab === "qualifications" && <QualificationEditor onSave={handleSave} />}
            {tab === "clinic"         && <ClinicInformation onSave={handleSave} />}
            {tab === "password" && (
              <div className="space-y-5 max-w-md">
                <div>
                  <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground mb-1">Change password</h2>
                  <p className="text-sm text-muted-foreground">Minimum 8 characters.</p>
                </div>
                {[["current","Current password"],["next","New password"],["confirm","Confirm new password"]].map(([k, label]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                    <input type="password" value={(pwForm as any)[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ))}
                {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
                <button onClick={handleSave} disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <CheckCircle2 className="w-4 h-4" /> Update password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </DoctorShell>
  );
}
