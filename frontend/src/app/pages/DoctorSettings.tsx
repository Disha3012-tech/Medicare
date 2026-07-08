import { useState } from "react";
import { useNavigate } from "react-router";
import { User, GraduationCap, Building2, Lock, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import ProfileEditor from "../components/ProfileEditor";
import QualificationEditor from "../components/QualificationEditor";
import ClinicInformation from "../components/ClinicInformation";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { authService } from "../services/auth";

type Tab = "profile" | "qualifications" | "clinic" | "password" | "danger";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",        label: "Profile",        icon: <User className="w-4 h-4" /> },
  { id: "qualifications", label: "Qualifications", icon: <GraduationCap className="w-4 h-4" /> },
  { id: "clinic",         label: "Clinic Info",    icon: <Building2 className="w-4 h-4" /> },
  { id: "password",       label: "Password",       icon: <Lock className="w-4 h-4" /> },
  { id: "danger",         label: "Delete Account", icon: <Trash2 className="w-4 h-4" /> },
];

export default function DoctorSettings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { toasts, add: addToast, dismiss } = useToast();

  function handleSave() { addToast({ type: "success", title: "Changes saved", body: "Your settings have been updated." }); }

  async function handleChangePassword() {
    setPwSaving(true);
    setPwError("");
    try {
      await authService.changePassword({ current_password: pwForm.current, new_password: pwForm.next });
      addToast({ type: "success", title: "Password updated", body: "Your password has been changed successfully." });
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      setPwError(err.message || "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      await authService.deleteAccount();
      navigate("/");
    } catch (err: any) {
      addToast({ type: "error", title: "Failed to delete account", body: err.message || "Please try again." });
      setDeleting(false);
    }
  }

  return (
    <DoctorShell title="Settings" subtitle="Manage your profile and practice information">
      <div className="max-w-4xl">
        <div className="grid md:grid-cols-[200px_1fr] gap-6">
          <nav className="bg-card rounded-xl border border-border p-2 h-fit">
            {TABS.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id ? (id === "danger" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground") : id === "danger" ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
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
                {pwError && <p className="text-xs text-destructive">{pwError}</p>}
                {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={!pwForm.current || pwForm.next.length < 8 || pwForm.next !== pwForm.confirm || pwSaving}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {pwSaving ? "Updating…" : "Update password"}
                </button>
              </div>
            )}

            {tab === "danger" && (
              <div className="space-y-5 max-w-md">
                <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-['Fraunces',serif] text-lg font-semibold text-destructive mb-1">Delete account</h2>
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete your account, practice profile, qualifications, availability, and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Type <span className="font-['DM_Mono',monospace] font-semibold">DELETE</span> to confirm
                  </label>
                  <input
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    className="w-full bg-input-background border border-destructive/30 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40"
                  />
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? "Deleting…" : "Permanently delete my account"}
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