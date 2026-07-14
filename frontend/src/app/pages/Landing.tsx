import { useState } from "react";
import { useNavigate } from "react-router";
import * as Accordion from "@radix-ui/react-accordion";
import {
  HeartPulse, ArrowRight, CheckCircle2, Shield, Calendar,
  Video, FileText, Activity, Clock, ChevronRight,
  ChevronDown, Search, Zap, Lock, Mail, Phone, Menu, X,
} from "lucide-react";

const STEPS = [
  { n: "01", icon: Search, title: "Find a Doctor", points: ["Search by specialty or name", "Filter by location & insurance", "View verified ratings & reviews"], color: "bg-primary/5 border-primary/20" },
  { n: "02", icon: Calendar, title: "Book Appointment", points: ["Select an available date", "Pick a convenient time slot", "Get instant confirmation"], color: "bg-accent/5 border-accent/20" },
  { n: "03", icon: Video, title: "Consult & Recover", points: ["Visit the clinic in person", "Or join a video consultation", "Receive digital prescription"], color: "bg-primary/5 border-primary/20" },
];

const FEATURES = [
  { icon: CheckCircle2, title: "Verified Specialists",   desc: "600+ board-certified doctors, vetted and credentialed before listing." },
  { icon: Zap,          title: "Instant Booking",        desc: "Book in under 60 seconds. No calls, no waiting rooms, no hassle." },
  { icon: Lock,         title: "Secure Medical Records", desc: "Your health data is encrypted and stored privately — always accessible to you." },
  { icon: Video,        title: "Video Consultations",    desc: "Consult top doctors from anywhere, anytime, on any device." },
  { icon: Clock,        title: "Smart Scheduling",       desc: "Real-time slot availability across all specialists and hospitals." },
  { icon: Activity,     title: "AI Symptom Checker",     desc: "Describe your symptoms and get guidance on which specialist to see." },
];

const FAQ_ITEMS = [
  { q: "How do I book an appointment?",           a: "Create a free account, search for a doctor by specialty or name, choose an available slot, and confirm — the entire process takes under 60 seconds." },
  { q: "Can I cancel or reschedule?",             a: "Yes. You can cancel or reschedule any upcoming appointment free of charge up to 24 hours before the scheduled time from your Patient Dashboard." },
  { q: "Are video consultations available?",      a: "Many doctors on Medica offer video consultations. Filter by 'Video' appointment type when browsing. The video call is built into the platform." },
  { q: "How do prescriptions work?",             a: "After your consultation, your doctor uploads the prescription directly to your account. You can view, download, or share it with any pharmacy." },
  { q: "Is my medical data private and secure?",  a: "Absolutely. All data is encrypted in transit and at rest. We follow HIPAA guidelines and your information is never shared without your consent." },
  { q: "What insurance plans are accepted?",      a: "Accepted insurance varies by doctor. Each profile lists accepted plans including Aetna, Blue Cross Blue Shield, Cigna, Kaiser Permanente, and Medicare." },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function scrollTo(id: string) {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 flex-shrink-0">
            <HeartPulse className="text-accent w-5 h-5" />
            <span className="font-['Fraunces',serif] font-semibold text-lg text-primary tracking-tight">Medicare</span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollTo("how")}      className="hover:text-foreground transition-colors">How It Works</button>
            <button onClick={() => scrollTo("faq")}      className="hover:text-foreground transition-colors">FAQ</button>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => navigate("/auth?mode=login")}  className="text-sm text-primary font-medium px-3 py-2 hover:underline">Sign in</button>
            <button onClick={() => navigate("/auth?mode=signup")} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Get started</button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setMobileMenuOpen(o => !o)} className="text-muted-foreground hover:text-foreground p-1">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-5 py-4 flex flex-col gap-3">
            <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground hover:text-foreground text-left py-1 transition-colors">Features</button>
            <button onClick={() => scrollTo("how")}      className="text-sm text-muted-foreground hover:text-foreground text-left py-1 transition-colors">How It Works</button>
            <button onClick={() => scrollTo("faq")}      className="text-sm text-muted-foreground hover:text-foreground text-left py-1 transition-colors">FAQ</button>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => navigate("/auth?mode=login")}  className="flex-1 text-sm border border-border rounded-lg py-2 text-foreground hover:border-primary/40 transition-colors">Sign in</button>
              <button onClick={() => navigate("/auth?mode=signup")} className="flex-1 text-sm bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors">Get started</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-accent/4 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 pt-10 pb-10 lg:pt-14 lg:pb-14 grid md:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Trusted by 50,000+ patients
            </div>
            <h1 className="font-['Fraunces',serif] text-4xl lg:text-5xl font-semibold leading-[1.1] text-foreground mb-4">
              Healthcare that<br />fits <em className="not-italic text-accent">your life</em>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-md">
              Book appointments with top specialists, manage your health records, and stay connected with your care team — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-5">
              <button
                onClick={() => navigate("/auth?mode=signup&role=patient")}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 text-sm"
              >
                Find a doctor <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/auth?mode=signup&role=doctor")}
                className="flex items-center gap-2 border border-border bg-card text-foreground px-5 py-3 rounded-lg font-medium hover:border-primary/40 transition-all text-sm"
              >
                Join as a doctor
              </button>
            </div>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent" />Free to sign up</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent" />No credit card needed</span>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 bg-muted" style={{ aspectRatio: "4/3" }}>
              <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=660&h=495&fit=crop&auto=format" alt="Doctor consulting patient" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 -left-4 bg-card rounded-xl shadow-lg border border-border p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-accent" /></div>
              <div><p className="text-xs text-muted-foreground">Next available</p><p className="text-sm font-medium text-foreground">Today, 3:30 PM</p></div>
            </div>
            <div className="absolute -top-3 -right-3 bg-card rounded-xl shadow-lg border border-border px-3.5 py-2.5">
              <p className="text-xs font-medium text-foreground">+2,400 booked this week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-primary">
        <div className="max-w-6xl mx-auto px-5 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["600+","Specialists"],["50k+","Patients served"],["98%","Satisfaction rate"],["24/7","Support"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="font-['Fraunces',serif] text-2xl font-semibold text-primary-foreground">{v}</p>
              <p className="text-primary-foreground/60 text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section id="how" className="py-16 lg:py-20 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-accent text-xs font-medium tracking-widest uppercase mb-3">Simple process</p>
            <h2 className="font-['Fraunces',serif] text-3xl lg:text-4xl font-semibold text-foreground">Healthcare in Three Simple Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6 relative">
            {STEPS.map(({ n, icon: Icon, title, points, color }, i) => (
              <div key={n} className="relative flex flex-col">
                <div className={`bg-card rounded-2xl border-2 ${color} p-7 flex-1 hover:shadow-md transition-all group`}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-['DM_Mono',monospace] text-4xl font-medium text-primary/15 leading-none">{n}</span>
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-3">{title}</h3>
                  <ul className="space-y-2">
                    {points.map(p => (
                      <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-card border border-border rounded-full items-center justify-center shadow-sm">
                    <ChevronRight className="w-4 h-4 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-accent text-xs font-medium tracking-widest uppercase mb-3">Why Medicare</p>
            <h2 className="font-['Fraunces',serif] text-3xl lg:text-4xl font-semibold text-foreground">Built for your wellbeing</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">Everything you need to manage your healthcare — in one secure, intuitive platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-2xl border border-border p-6 hover:border-accent/30 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-medium text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 lg:py-20 bg-secondary/40">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-10">
            <p className="text-accent text-xs font-medium tracking-widest uppercase mb-3">Got questions?</p>
            <h2 className="font-['Fraunces',serif] text-3xl lg:text-4xl font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>
          <Accordion.Root type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }) => (
              <Accordion.Item key={q} value={q} className="bg-card rounded-xl border border-border overflow-hidden">
                <Accordion.Trigger className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors group data-[state=open]:border-b data-[state=open]:border-border gap-3">
                  <span>{q}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="overflow-hidden">
                  <p className="px-5 py-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="bg-primary rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(10,147,150,0.3),transparent_60%)] pointer-events-none" />
            <h2 className="font-['Fraunces',serif] text-3xl lg:text-4xl font-semibold text-primary-foreground mb-3 relative">Ready to take charge of your health?</h2>
            <p className="text-primary-foreground/70 mb-7 max-w-lg mx-auto text-sm relative">Join 50,000+ patients who book smarter, get seen faster, and stay healthier with Medicare.</p>
            <button onClick={() => navigate("/auth?mode=signup")} className="relative inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-xl font-medium text-sm hover:bg-accent/90 transition-all">
              Create your free account <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HeartPulse className="text-accent w-5 h-5" />
                <span className="font-['Fraunces',serif] font-semibold text-primary">Medicare</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">Connecting patients with verified specialists. Smarter healthcare, built for everyone.</p>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Company</p>
                <ul className="space-y-2">
                  <li><button className="hover:text-foreground transition-colors">About us</button></li>
                  <li><button className="hover:text-foreground transition-colors">Careers</button></li>
                  <li><button className="hover:text-foreground transition-colors">Blog</button></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Contact</p>
                <ul className="space-y-2">
                  <li>
                    <a href="mailto:hello@medica.health" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <Mail className="w-3.5 h-3.5" /> hello@medicare.health
                    </a>
                  </li>
                  <li>
                    <a href="tel:+18005550100" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <Phone className="w-3.5 h-3.5" /> +1 (800) 555-0100
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 Medicare Health Inc. All rights reserved.</p>
            <p>HIPAA Compliant · SOC 2 Type II · ISO 27001</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
