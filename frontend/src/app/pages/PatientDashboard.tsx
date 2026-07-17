import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Calendar,
  Plus,
  CheckCircle2,
  Video,
} from "lucide-react";

import PatientShell from "../components/PatientShell";
import { useAuth } from "../components/AuthProvider";
import {
  appointmentsService,
  type Appointment,
} from "../services/appointments";

import { Skeleton } from "../components/LoadingSkeleton";
import UpcomingVideoCallBanner from "../components/UpcomingVideoCallBanner";

const specialties = [
  "Cardiology",
  "Dermatology",
  "General Practice",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "book">("overview");
  const [bookStep, setBookStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [bookSuccess, setBookSuccess] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    appointmentsService
      .getMine()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const upcoming = appointments
    .filter(
      (a) =>
        ["PENDING", "CONFIRMED"].includes(a.status) &&
        new Date(a.scheduled_at) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() -
        new Date(b.scheduled_at).getTime()
    );

  const nextAppt = upcoming[0];

  function handleBook() {
    if (!selectedSpecialty) return;

    setBookSuccess(true);
    setTimeout(() => {
      setBookSuccess(false);
      navigate("/find-doctors");
    }, 2000);
  }

  const greeting = user
    ? `Good ${
        new Date().getHours() < 12
          ? "morning"
          : new Date().getHours() < 17
          ? "afternoon"
          : "evening"
      }, ${user.first_name}`
    : "Welcome";

  const subtitle =
    activeTab === "overview"
      ? new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Choose a specialist";

  return (
    <PatientShell
      title={activeTab === "overview" ? greeting : "Book Appointment"}
      subtitle={subtitle}
    >
      {/* Tabs */}
      <div className="flex border-b border-border mb-6 gap-1 -mt-2">
        {(
          [
            ["overview", "Overview"],
            ["book", "Book Appointment"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ================= OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 max-w-3xl">
          {/* Next appointment */}
          {loading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : nextAppt ? (
            <div className="bg-primary rounded-2xl p-6 relative overflow-hidden">
              <p className="text-primary-foreground/60 text-sm mb-3">
                Next appointment
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-primary-foreground/10">
                  <Calendar className="w-6 h-6 text-primary-foreground/60" />
                </div>

                <div className="flex-1">
                  <p className="font-medium text-primary-foreground">
                    Appointment #{nextAppt.id.slice(0, 8)}
                  </p>
                  <p className="text-primary-foreground/70 text-sm capitalize">
                    {nextAppt.type.replace("_", " ")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-primary-foreground font-medium">
                    {formatDate(nextAppt.scheduled_at)}
                  </p>
                  <p className="text-primary-foreground/70 text-sm">
                    {formatTime(nextAppt.scheduled_at)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-primary rounded-2xl p-6 text-center">
              <p className="text-primary-foreground/60 text-sm mb-2">
                No upcoming appointments
              </p>
              <button
                onClick={() => navigate("/find-doctors")}
                className="text-primary-foreground underline text-sm"
              >
                Book your first appointment →
              </button>
            </div>
          )}

          <UpcomingVideoCallBanner appointments={appointments} />
            
          {/* Upcoming list */}
          <div>
            <h2 className="font-medium text-sm mb-3">
              Upcoming appointments
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming appointments
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-card border border-border rounded-xl p-4 flex justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">Appointment</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {appt.type.replace("_", " ")}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      <p>{formatDate(appt.scheduled_at)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(appt.scheduled_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/find-doctors")}
            className="w-full border border-dashed rounded-xl py-4 text-sm"
          >
            <Plus className="inline w-4 h-4 mr-2" />
            Book new appointment
          </button>
        </div>
      )}

      {/* ================= BOOK ================= */}
      {activeTab === "book" && (
        <div className="max-w-2xl">
          {bookSuccess ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-10 h-10 mx-auto text-accent mb-3" />
              <h2 className="text-xl font-semibold">
                Redirecting...
              </h2>
            </div>
          ) : (
            <>
              {bookStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Choose specialty
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {specialties.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSelectedSpecialty(s);
                          setBookStep(2);
                        }}
                        className="border rounded-xl p-3 text-sm hover:border-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {bookStep === 2 && (
                <div>
                  <button
                    onClick={() => setBookStep(1)}
                    className="text-sm mb-4"
                  >
                    ← Back
                  </button>

                  <h2 className="text-xl font-semibold mb-2">
                    {selectedSpecialty}
                  </h2>

                  <button
                    onClick={() =>
                      navigate(
                        `/find-doctors?specialty=${encodeURIComponent(
                          selectedSpecialty
                        )}`
                      )
                    }
                    className="w-full bg-primary text-white py-3 rounded-xl"
                  >
                    Find doctors
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