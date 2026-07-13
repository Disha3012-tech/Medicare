import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { HeartPulse, Eye, EyeOff, User, Stethoscope, ArrowLeft, CheckCircle2, Shield, Lock } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { SPECIALTIES, OTHERS_VALUE, resolveSpecialtyForSubmit } from "../services/specialties";

type Role = "patient" | "doctor";
type Mode = "login" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) || "login");
  const [role, setRole] = useState<Role>((params.get("role") as Role) || "patient");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", specialty: "", customSpecialty: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const pwLen = form.password.length;
  const pwValid = pwLen >= 8;
  const pwColor = pwLen === 0 ? "#6b7280" : pwLen < 5 ? "#ef4444" : pwLen < 8 ? "#f59e0b" : "#10b981";
  const { login: performLogin, register: performRegister } = useAuth();

  useEffect(() => {
    const m = params.get("mode") as Mode;
    const r = params.get("role") as Role;
    if (m) setMode(m);
    if (r) setRole(r);
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (mode === "signup" && !form.name) { setError("Please enter your name."); return; }
    if (mode === "signup" && !pwValid) { setError("Password must be at least 8 characters."); return; }
    if (mode === "signup" && !agreedToTerms) { setError("Please agree to the Terms & Conditions to continue."); return; }
    if (mode === "signup" && role === "doctor" && form.specialty === OTHERS_VALUE && !form.customSpecialty.trim()) {
      setError("Please enter your specialty.");
      return;
    }
    setLoading(true);

    try {
      if (mode === "signup") {
        const [first_name = "", ...lastNameParts] = form.name.trim().split(/\s+/);
        const last_name = lastNameParts.join(" ") || "-";

        await performRegister({
          email: form.email,
          password: form.password,
          first_name,
          last_name,
          role: role.toUpperCase(),
        });

        const finalSpecialty = resolveSpecialtyForSubmit(form.specialty, form.customSpecialty);
        if (role === "doctor" && finalSpecialty) {
          const { doctorsService } = await import("../services/doctors");
          try {
            await doctorsService.updateMe({ specialty: finalSpecialty });
          } catch (err) {
            console.error("Failed to update specialty after signup:", err);
          }
        }

        navigate(role === "doctor" ? "/doctor/setup" : "/patient/setup");
      } else {
        await performLogin({
          email: form.email,
          password: form.password,
        });
        navigate(role === "doctor" ? "/doctor" : "/patient");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
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
                  onChange={e => setForm(f => ({ ...f, specialty: e.target.value, customSpecialty: e.target.value === OTHERS_VALUE ? f.customSpecialty : "" }))}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                >
                  <option value="">Select your specialty</option>
                  {SPECIALTIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value={OTHERS_VALUE}>Others</option>
                </select>
                {form.specialty === OTHERS_VALUE && (
                  <input
                    type="text"
                    placeholder="Enter your specialty"
                    value={form.customSpecialty}
                    onChange={e => setForm(f => ({ ...f, customSpecialty: e.target.value }))}
                    className="w-full mt-2 bg-input-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                )}
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
              {/* Password character counter — shown on both login & signup */}
              {form.password.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: pwValid
                        ? "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.10))"
                        : pwLen < 5
                        ? "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(220,38,38,0.08))"
                        : "linear-gradient(135deg,rgba(245,158,11,0.14),rgba(217,119,6,0.09))",
                      border: `1.5px solid ${pwValid ? "rgba(16,185,129,0.45)" : pwLen < 5 ? "rgba(239,68,68,0.40)" : "rgba(245,158,11,0.40)"}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Lock
                      style={{
                        width: "14px",
                        height: "14px",
                        color: pwColor,
                        flexShrink: 0,
                        transition: "color 0.3s",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: pwColor,
                        fontWeight: 600,
                        transition: "color 0.3s",
                        flex: 1,
                      }}
                    >
                      {pwValid
                        ? "✓ Password length is good!"
                        : `Must be at least 8 characters — ${pwLen}/8`}
                    </span>
                    {/* Mini progress bar */}
                    <div
                      style={{
                        width: "52px",
                        height: "5px",
                        borderRadius: "99px",
                        background: "rgba(128,128,128,0.25)",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "99px",
                          background: pwColor,
                          width: `${Math.min((pwLen / 8) * 100, 100)}%`,
                          transition: "width 0.25s ease, background 0.3s",
                        }}
                      />
                    </div>
                    {/* Character count badge */}
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: pwColor,
                        background: pwValid ? "rgba(16,185,129,0.15)" : "rgba(128,128,128,0.15)",
                        borderRadius: "6px",
                        padding: "2px 6px",
                        flexShrink: 0,
                        transition: "all 0.3s",
                      }}
                    >
                      {pwLen}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Terms checkbox — signup only */}
            {mode === "signup" && (
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  cursor: "pointer",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: `1.5px solid ${agreedToTerms ? "rgba(99,102,241,0.4)" : "rgba(107,114,128,0.3)"}`,
                  background: agreedToTerms ? "rgba(99,102,241,0.06)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Custom checkbox */}
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    border: `2px solid ${agreedToTerms ? "#6366f1" : "#9ca3af"}`,
                    background: agreedToTerms ? "#6366f1" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setAgreedToTerms(v => !v)}
                >
                  {agreedToTerms && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: "12px", color: "var(--color-foreground)", lineHeight: "1.5", opacity: 0.75 }}>
                  I agree to the{" "}
                  <span style={{ color: "#818cf8", fontWeight: 600, cursor: "pointer" }}>Terms &amp; Conditions</span>
                  {" "}and{" "}
                  <span style={{ color: "#818cf8", fontWeight: 600, cursor: "pointer" }}>Privacy Policy</span>
                  . I understand my health data is stored securely.
                </span>
              </label>
            )}

            {error && (
              <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || (mode === "signup" && (!pwValid || !agreedToTerms))}
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