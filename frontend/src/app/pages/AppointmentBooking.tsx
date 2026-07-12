import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, HeartPulse, CheckCircle2, CalendarCheck2 } from "lucide-react";
import { doctorsService, doctorFullName, type Doctor, type AvailabilitySlot } from "../services/doctors";
import { appointmentsService } from "../services/appointments";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import TimeSlotPicker from "../components/TimeSlotPicker";
import BookingSummary from "../components/BookingSummary";
import LoadingSkeleton from "../components/LoadingSkeleton";

type Step = 1 | 2 | 3;
type SelectedSlot = { time: string; slotMinutes: number };

const STEP_LABELS: Record<Step, string> = {
  1: "Choose date",
  2: "Choose time",
  3: "Confirm booking",
};

const AVATAR_FALLBACK = "https://api.dicebear.com/7.x/initials/svg?seed=";

/** Combines a Date (day only) with a "9:30 AM" string into a real Date */
function combineDateAndTime(date: Date, time: string): Date {
  const match = time.match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) return date;
  let [, hStr, mStr, period] = match;
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
  const combined = new Date(date);
  combined.setHours(hour, minute, 0, 0);
  return combined;
}

export default function AppointmentBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const d = searchParams.get("date");
    return d ? new Date(d) : null;
  });
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [appointmentType, setAppointmentType] = useState<"in-person" | "video">("in-person");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookedCounts, setBookedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!id) return;
    setLoadingDoctor(true);
    Promise.all([doctorsService.getById(id), doctorsService.getAvailability(id)])
      .then(([doc, slots]) => {
        setDoctor(doc);
        setAvailability(slots);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingDoctor(false));
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
    setStep(2);
    // Fetch booked counts for this date
    if (id) {
      doctorsService.getSlotBookings(id, selectedDate.toISOString().split("T")[0])
        .then(setBookedCounts)
        .catch(() => setBookedCounts({}));
    }
  }
  }, [selectedDate, id]);
useEffect(() => {
  if (!selectedDate || !doctor) return;
  const dateStr = selectedDate.toISOString().slice(0, 10);
  doctorsService.getSlotBookings(doctor.id, dateStr)
    .then(setBookedCounts)
    .catch(() => setBookedCounts({}));
}, [selectedDate, doctor]);
  if (loadingDoctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-['Inter',sans-serif]">
        <LoadingSkeleton className="h-32 w-80 rounded-xl" />
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-['Inter',sans-serif]">
        <div className="text-center">
          <HeartPulse className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-2">Doctor not found</p>
          <button onClick={() => navigate("/find-doctors")} className="text-sm text-accent hover:underline">Back to search</button>
        </div>
      </div>
    );
  }

  const availableWeekdays = Array.from(new Set(availability.map(s => s.day_of_week)));
  const name = doctorFullName(doctor);
  const avatarSrc = doctor.avatar_url || `${AVATAR_FALLBACK}${encodeURIComponent(name)}`;

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(2);
  }

  async function handleConfirm() {
    if (!selectedDate || !selectedSlot || !doctor) return;
    setLoading(true);
    setBookingError("");
    try {
      await appointmentsService.book({
        doctor_id: doctor.id,
        scheduled_at: combineDateAndTime(selectedDate, selectedSlot.time).toISOString(),
        duration_min: selectedSlot.slotMinutes,
        type: appointmentType === "video" ? "VIDEO" : "IN_PERSON",
        reason_for_visit: reason || undefined,
      });
      setConfirmed(true);
    } catch (err: any) {
      setBookingError(
        err.status === 409
          ? "This slot was just booked by someone else. Please pick a different time."
          : (err.message || "Failed to book appointment. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  if (confirmed && selectedDate && selectedSlot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 font-['Inter',sans-serif]">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-75 duration-300">
            <CalendarCheck2 className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-foreground mb-2">You're confirmed!</h1>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-sm mx-auto">
            Your appointment with <span className="text-foreground font-medium">{name}</span> on{" "}
            <span className="text-foreground font-medium">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>{" "}
            at <span className="text-foreground font-medium">{selectedSlot.time}</span> has been requested.
          </p>

          <div className="bg-card rounded-2xl border border-border p-5 text-left mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-foreground">{name}</p>
                <p className="text-sm text-accent">{doctor.specialty}</p>
              </div>
            </div>
            <div className="border-t border-border pt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">{selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium text-foreground">{selectedSlot.time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium text-foreground capitalize">{appointmentType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fee</p>
                <p className="font-medium text-foreground">₹{doctor.consultation_fee}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/patient")} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all">
              Go to my appointments
            </button>
            <button onClick={() => navigate("/find-doctors")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Book another appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 sm:px-6 h-16 flex items-center gap-4">
        <button
          onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate(`/doctor/${doctor.id}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:block">Back</span>
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <HeartPulse className="w-5 h-5 text-accent" />
          <span className="font-['Fraunces',serif] font-semibold text-primary">Medica</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-8">
          {([1, 2, 3] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${s <= step ? "cursor-pointer" : ""}`} onClick={() => s < step && setStep(s)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step > s ? "bg-accent text-accent-foreground" : step === s ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className={`text-sm hidden sm:block transition-colors ${step === s ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < 2 && <div className={`flex-1 h-px w-8 sm:w-12 transition-colors ${step > s ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6 p-4 bg-card rounded-xl border border-border">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-medium text-foreground">{name}</p>
            <p className="text-sm text-accent">{doctor.specialty} · ₹{doctor.consultation_fee}</p>
          </div>
          <button onClick={() => navigate(`/doctor/${doctor.id}`)} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">Change</button>
        </div>

        <div className="bg-transparent">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground mb-1">Choose a date</h2>
                <p className="text-sm text-muted-foreground">
                  {availableWeekdays.length === 0
                    ? "This doctor hasn't set their availability yet."
                    : "Dates with availability are marked with a teal dot."}
                </p>
              </div>
              <AvailabilityCalendar
                availableWeekdays={availableWeekdays}
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
              />
            </div>
          )}

          {step === 2 && selectedDate && (
            <div className="space-y-4">
              <div>
                <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground mb-1">Choose a time</h2>
                <p className="text-sm text-muted-foreground">All times shown in your local time.</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <TimeSlotPicker
                  date={selectedDate}
                  slots={availability}
                  bookedCounts={bookedCounts}
                  capacity={doctor.slot_capacity}
                  appointmentType={appointmentType}
                  onTypeChange={setAppointmentType}
                  selectedSlot={selectedSlot}
                  onSelect={setSelectedSlot}
                />
                
              </div>
              {selectedSlot && (
                <button
                  onClick={() => setStep(3)}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  Continue to confirmation
                </button>
              )}
            </div>
          )}

          {step === 3 && selectedDate && selectedSlot && (
            <div className="space-y-4">
              <div>
                <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground mb-1">Confirm your booking</h2>
                <p className="text-sm text-muted-foreground">Review the details and confirm your appointment.</p>
              </div>
              <BookingSummary
                doctor={doctor}
                date={selectedDate}
                time={selectedSlot.time}
                appointmentType={appointmentType}
                reason={reason}
                onReasonChange={setReason}
                onConfirm={handleConfirm}
                onBack={() => setStep(2)}
                loading={loading}
                errorMessage={bookingError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}