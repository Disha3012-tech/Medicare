import { useState, useEffect } from "react";
import { X, Calendar, Loader2 } from "lucide-react";
import type { Appointment } from "../services/appointments";
import { appointmentsService } from "../services/appointments";
import { doctorsService, doctorFullName, type Doctor, type AvailabilitySlot } from "../services/doctors";
import AvailabilityCalendar from "./AvailabilityCalendar";
import TimeSlotPicker from "./TimeSlotPicker";

interface Props {
  appointment: Appointment;
  onClose: () => void;
  onRescheduled: (updated: Appointment) => void;
}

type SelectedSlot = { time: string; slotMinutes: number };

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

export default function RescheduleModal({ appointment, onClose, onRescheduled }: Props) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookedCounts, setBookedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [appointmentType, setAppointmentType] = useState<"in-person" | "video">(
    appointment.type === "VIDEO" ? "video" : "in-person"
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    Promise.all([
      doctorsService.getById(appointment.doctor_id),
      doctorsService.getAvailability(appointment.doctor_id),
    ])
      .then(([doc, avail]) => {
        setDoctor(doc);
        setAvailability(avail);
      })
      .catch(() => setLoadError("Couldn't load the doctor's availability. Please try again."))
      .finally(() => setLoading(false));
  }, [appointment.doctor_id]);

  useEffect(() => {
    if (!selectedDate || !doctor) return;
    const dateStr = selectedDate.toISOString().slice(0, 10);
    doctorsService.getSlotBookings(doctor.id, dateStr)
      .then(setBookedCounts)
      .catch(() => setBookedCounts({}));
  }, [selectedDate, doctor]);

  const availableWeekdays = Array.from(new Set(availability.map(s => s.day_of_week)));

  async function confirmReschedule() {
    if (!selectedDate || !selectedSlot) return;
    setSaving(true);
    setSaveError("");
    try {
      const newScheduledAt = combineDateAndTime(selectedDate, selectedSlot.time).toISOString();
      const updated = await appointmentsService.reschedule(appointment.id, newScheduledAt);
      onRescheduled(updated);
      onClose();
    } catch (err: any) {
      setSaveError(
        err.status === 409
          ? "That slot was just taken. Please pick a different time."
          : (err.message || "Failed to reschedule. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <h2 className="font-['Fraunces',serif] text-lg font-semibold text-foreground">Reschedule appointment</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : loadError || !doctor ? (
            <p className="text-sm text-destructive text-center py-8">{loadError || "Doctor not found."}</p>
          ) : (
            <>
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-sm font-medium text-foreground">{doctorFullName(doctor)}</p>
                <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Choose a new date</h3>
                {availableWeekdays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">This doctor hasn't set their availability yet.</p>
                ) : (
                  <AvailabilityCalendar
                    availableWeekdays={availableWeekdays}
                    selectedDate={selectedDate}
                    onSelect={date => { setSelectedDate(date); setSelectedSlot(null); }}
                  />
                )}
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Choose a new time</h3>
                  <div className="bg-card rounded-xl border border-border p-4">
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
                </div>
              )}

              {saveError && <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{saveError}</p>}
            </>
          )}
        </div>

        {!loading && doctor && (
          <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
            <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all">
              Cancel
            </button>
            <button
              onClick={confirmReschedule}
              disabled={!selectedDate || !selectedSlot || saving}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Rescheduling…" : "Confirm new time"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}