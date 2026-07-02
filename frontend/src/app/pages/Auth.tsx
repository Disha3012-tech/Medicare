import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { HeartPulse, Eye, EyeOff, User, Stethoscope, ArrowLeft, CheckCircle2, Shield } from "lucide-react";

type Role = "patient" | "doctor";
type Mode = "login" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) || "login");
  const [role, setRole] = useState<Role>((params.get("role") as Role) || "patient");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", specialty: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const m = params.get("mode") as Mode;
    const r = params.get("role") as Role;
    if (m) setMode(m);
    if (r) setRole(r);
  }, [params]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (mode === "signup" && !form.name) { setError("Please enter your name."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "signup") {
        navigate(role === "doctor" ? "/doctor/setup" : "/patient/setup");
      } else {
        navigate(role === "doctor" ? "/doctor" : "/patient");
      }
    }, 900);
  }

  const leftPanelContent = {
    login: {
      heading: "Welcome back.",
      sub: "Sign in to access your appointments, health records, and care team.",
    },
    signup: {
      heading: "Your health journey starts here.",
      sub: "Create your account to book appointments with top specialists and manage your care.",
    },
  };

  return (
    <div className="min-h-screen bg-background flex font-['Inter',sans-serif]">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-primary p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(10,147,150,0.4),transparent_65%)] pointer-events-none" />
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors w-fit relative">
          <HeartPulse className="w-6 h-6" />
          <span className="font-['Fraunces',serif] font-semibold text-lg">Medica</span>
        </button>
        <div className="relative">
          <p className="font-['Fraunces',serif] text-4xl font-semibold text-primary-foreground leading-snug mb-4">
            {leftPanelContent[mode].heading}
          </p>
          <p className="text-primary-foreground/60 text-sm leading-relaxed mb-8">
            {leftPanelContent[mode].sub}
          </p>
          <div className="space-y-3">
            {["Instant appointment booking", "Secure encrypted records", "24/7 care team access"].map(t => (
              <div key={t} className="flex items-center gap-3 text-primary-foreground/70 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />{t}
              </div>
            ))}
          </div>
        </div>
        <p className="text-primary-foreground/30 text-xs relative">© 2026 Medica Health Inc.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back button — mobile only */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm lg:hidden">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>

          {/* Title */}
          <div className="mb-6">
            <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-foreground mb-1">
              {mode === "login" ? "Sign in" : "Create account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                className="text-accent font-medium hover:underline"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* ── Role selector — shown on BOTH login and signup ── */}
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-2">
              {mode === "login" ? "Sign in as" : "I am a"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {([["patient", "Patient", User, "Access your appointments, records & prescriptions"], ["doctor", "Doctor / Specialist", Stethoscope, "Manage your schedule, patients & prescriptions"]] as const).map(([r, label, Icon, desc]) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${role === r ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium leading-tight ${role === r ? "text-primary" : "text-foreground"}`}>{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</p>
                  </div>
                  {role === r && (
                    <CheckCircle2 className="w-4 h-4 text-primary absolute top-3 right-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder={role === "doctor" ? "Dr. Jane Smith" : "Alex Johnson"}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
            )}

            {mode === "signup" && role === "doctor" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Specialty</label>
                <select
                  value={form.specialty}
                  onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                >
                  <option value="">Select your specialty</option>
                  {["Cardiology","Dermatology","Endocrinology","General Practice","Neurology","Orthopedics","Pediatrics","Psychiatry"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-accent hover:underline">Forgot password?</button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 pr-11 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? `Sign in as ${role === "doctor" ? "Doctor" : "Patient"}`
                  : "Create account"
              }
            </button>
          </form>

          {/* Trust signal */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Your data is encrypted and never shared</span>
          </div>

        </div>
      </div>
    </div>
  );
}
