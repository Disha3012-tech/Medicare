import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HeartPulse, LogOut, CheckCircle2, Stethoscope, Mail, Award, Briefcase, Building2 } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { adminService, type AdminDoctor } from "../services/admin";
import { ToastContainer, useToast } from "../components/ToastNotification";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const { toasts, add: addToast, dismiss } = useToast();

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    setError("");
    adminService.getPendingDoctors()
      .then(setDoctors)
      .catch(err => setError(err.message || "Failed to load pending doctors"))
      .finally(() => setLoading(false));
  }

  async function handleVerify(doctorId: string) {
    setVerifyingId(doctorId);
    try {
      await adminService.verifyDoctor(doctorId);
      setDoctors(ds => ds.filter(d => d.id !== doctorId));
      addToast({ type: "success", title: "Doctor verified", body: "The doctor is now visible to patients." });
    } catch (err: any) {
      addToast({ type: "error", title: "Failed to verify doctor", body: err.message || "Please try again." });
    } finally {
      setVerifyingId(null);
      setConfirmingId(null);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-accent" />
          <span className="font-['Fraunces',serif] font-semibold text-primary">Medica</span>
          <span className="text-xs text-muted-foreground ml-2 bg-muted px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user ? `${user.first_name} ${user.last_name}` : "Admin"}
          </span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Doctor Verification</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h2 className="font-medium text-foreground mb-1">Pending Doctors</h2>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} awaiting verification`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <button onClick={load} className="text-sm text-accent hover:underline">Try again</button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-10 h-10 text-accent/40 mx-auto mb-3" />
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-1">All caught up</p>
            <p className="text-sm text-muted-foreground">No doctors are currently awaiting verification.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">Dr. {doc.first_name} {doc.last_name}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" />{doc.specialty}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{doc.email}</span>
                      <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />License #{doc.license_number}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{doc.years_experience} yrs experience</span>
                      {doc.clinic_name && (
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{doc.clinic_name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {confirmingId === doc.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confirm verification?</span>
                        <button
                          onClick={() => handleVerify(doc.id)}
                          disabled={verifyingId === doc.id}
                          className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-lg hover:bg-accent/90 disabled:opacity-60 transition-all"
                        >
                          {verifyingId === doc.id ? "Verifying…" : "Yes, verify"}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          disabled={verifyingId === doc.id}
                          className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(doc.id)}
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}