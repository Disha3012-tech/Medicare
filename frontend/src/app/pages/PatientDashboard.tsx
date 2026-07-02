import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Calendar, Clock, FileText, Plus, ChevronRight,
  CheckCircle2, X, Star, Video, Stethoscope,
} from "lucide-react";
import PatientShell from "../components/PatientShell";

const upcomingAppts = [
  { id: 1, doctor: "Dr. Amara Osei",  specialty: "Cardiology",   date: "Jul 3, 2026",  time: "10:30 AM", type: "In-person", avatar: "photo-1612349317150-e413f6a5b16d", status: "confirmed" },
  { id: 2, doctor: "Dr. Lena Kovač",  specialty: "Neurology",    date: "Jul 9, 2026",  time: "2:00 PM",  type: "Video",     avatar: "photo-1559839734-2b71ea197ec2", status: "confirmed" },
  { id: 3, doctor: "Dr. James Tran",  specialty: "Orthopedics",  date: "Jul 17, 2026", time: "9:00 AM",  type: "In-person", avatar: "photo-1537368910025-700350fe46c7", status: "pending" },
];

const metrics = [
  { label: "Blood Pressure", value: "118/76", unit: "mmHg", trend: "stable" },
  { label: "Heart Rate",     value: "72",     unit: "bpm",  trend: "stable" },
  { label: "Weight",         value: "68.4",   unit: "kg",   trend: "-0.8 kg" },
];

const specialties = ["Cardiology","Dermatology","General Practice","Neurology","Orthopedics","Pediatrics","Psychiatry"];
const availableSlots = ["9:00 AM","10:30 AM","11:15 AM","2:00 PM","3:30 PM","4:45 PM"];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "book">("overview");
  const [bookStep, setBookStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookSuccess, setBookSuccess] = useState(false);

  function handleBook() {
    if (!selectedSpecialty || !selectedSlot) return;
    setBookSuccess(true);
    setTimeout(() => {
      setBookSuccess(false);
      navigate("/patient/history");
    }, 2000);
  }

  const subtitle = activeTab === "overview"
    ? "Tuesday, July 1, 2026"
    : "Choose a specialist and time";

  return (
    <PatientShell title={activeTab === "overview" ? "Good morning, Alex" : "Book Appointment"} subtitle={subtitle}>
      {/* Tab bar */}
      <div className="flex border-b border-border mb-6 gap-1 -mt-2">
        {([["overview","Overview"],["book","Book Appointment"]] as const).map(([id, label]) => (
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
        <div className="space-y-6 max-w-3xl">
          {/* Next appointment hero */}
          <div className="bg-primary rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(10,147,150,0.3),transparent_60%)] pointer-events-none" />
            <p className="text-primary-foreground/60 text-sm mb-3">Next appointment</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary-foreground/10 flex-shrink-0">
                <img src={`https://images.unsplash.com/${upcomingAppts[0].avatar}?w=56&h=56&fit=crop&auto=format`} alt={upcomingAppts[0].doctor} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary-foreground">{upcomingAppts[0].doctor}</p>
                <p className="text-primary-foreground/70 text-sm">{upcomingAppts[0].specialty}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground font-medium">{upcomingAppts[0].date}</p>
                <p className="text-primary-foreground/70 text-sm">{upcomingAppts[0].time}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => navigate("/patient/history")} className="flex items-center gap-1.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground text-sm px-4 py-2 rounded-lg transition-colors">
                <Calendar className="w-3.5 h-3.5" /> View details
              </button>
              <button className="flex items-center gap-1.5 bg-accent text-accent-foreground text-sm px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">
                <X className="w-3.5 h-3.5" /> Reschedule
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <h2 className="font-medium text-foreground mb-3 flex items-center justify-between text-sm">
              Health metrics
              <button className="text-xs text-accent hover:underline font-normal">Full history</button>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {metrics.map(({ label, value, unit, trend }) => (
                <div key={label} className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{unit}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs text-accent">{trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming appointments */}
          <div>
            <h2 className="font-medium text-foreground mb-3 flex items-center justify-between text-sm">
              Upcoming appointments
              <button onClick={() => navigate("/patient/history")} className="text-xs text-accent hover:underline font-normal">View all</button>
            </h2>
            <div className="space-y-3">
              {upcomingAppts.map(appt => (
                <div key={appt.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <img src={`https://images.unsplash.com/${appt.avatar}?w=40&h=40&fit=crop&auto=format`} alt={appt.doctor} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{appt.doctor}</p>
                    <p className="text-xs text-muted-foreground">{appt.specialty}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-foreground">{appt.date}</p>
                    <p className="text-xs text-muted-foreground">{appt.time}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1 ${appt.status === "confirmed" ? "bg-accent/10 text-accent" : "bg-yellow-50 text-yellow-600"}`}>
                    {appt.type === "Video" && <Video className="w-3 h-3" />}
                    {appt.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate("/find-doctors")} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-4 text-sm text-muted-foreground hover:border-accent/40 hover:text-accent transition-all">
            <Plus className="w-4 h-4" /> Book a new appointment
          </button>
        </div>
      )}

      {/* ── Book Appointment ── */}
      {activeTab === "book" && (
        <div className="max-w-2xl">
          {bookSuccess ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground mb-2">Appointment booked!</h2>
              <p className="text-muted-foreground">Redirecting to your appointments…</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-8">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${bookStep >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
                    <span className={`text-sm ${bookStep >= s ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s === 1 ? "Choose specialty" : "Pick a slot"}</span>
                    {s < 2 && <div className="w-12 h-px bg-border" />}
                  </div>
                ))}
              </div>

              {bookStep === 1 && (
                <div>
                  <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground mb-6">What do you need help with?</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {specialties.map(s => (
                      <button key={s} onClick={() => { setSelectedSpecialty(s); setBookStep(2); }} className={`text-left px-4 py-4 rounded-xl border-2 text-sm font-medium transition-all hover:border-primary/40 hover:shadow-sm ${selectedSpecialty === s ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    Looking for a specific doctor? <button onClick={() => navigate("/find-doctors")} className="text-accent hover:underline">Browse all specialists</button>
                  </p>
                </div>
              )}

              {bookStep === 2 && (
                <div>
                  <button onClick={() => setBookStep(1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                  <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground mb-2">Available slots</h2>
                  <p className="text-muted-foreground text-sm mb-6">{selectedSpecialty} · Wednesday, July 8, 2026</p>
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {availableSlots.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${selectedSlot === slot ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40"}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                  {selectedSlot && (
                    <div className="bg-secondary rounded-xl p-4 mb-6">
                      <p className="text-sm font-medium text-foreground mb-1">Booking summary</p>
                      <p className="text-sm text-muted-foreground">{selectedSpecialty} · July 8, 2026 · {selectedSlot}</p>
                    </div>
                  )}
                  <button onClick={handleBook} disabled={!selectedSlot} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Confirm appointment
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </PatientShell>
  );
}
