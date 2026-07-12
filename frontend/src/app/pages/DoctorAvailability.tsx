import { useState, useEffect } from "react";
import { CalendarX, Plane, Save, Loader2 } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import AvailabilityEditor, { type WeekSchedule } from "../components/AvailabilityEditor";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { doctorsService, type AvailabilitySlot } from "../services/doctors";

const EMPTY_SCHEDULE: WeekSchedule = {
  Monday:    { enabled: false, slots: [] },
  Tuesday:   { enabled: false, slots: [] },
  Wednesday: { enabled: false, slots: [] },
  Thursday:  { enabled: false, slots: [] },
  Friday:    { enabled: false, slots: [] },
  Saturday:  { enabled: false, slots: [] },
  Sunday:    { enabled: false, slots: [] },
};

const DAY_TO_WEEKDAY: Record<keyof WeekSchedule, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};
const WEEKDAY_TO_DAY: Record<number, keyof WeekSchedule> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday",
};

function to24Hour(time12: string): string {
  const match = time12.match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) return "00:00";
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

function to12Hour(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const hour = parseInt(hStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${mStr} ${period}`;
}

function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime24(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function scheduleToSlots(schedule: WeekSchedule): AvailabilitySlot[] {
  const result: AvailabilitySlot[] = [];

  (Object.keys(schedule) as (keyof WeekSchedule)[]).forEach(day => {
    const { enabled, slots } = schedule[day];
    if (!enabled || slots.length === 0) return;

    const minutesSorted = slots.map(to24Hour).map(timeToMinutes).sort((a, b) => a - b);

    let runStart = minutesSorted[0];
    let prev = minutesSorted[0];

    for (let i = 1; i <= minutesSorted.length; i++) {
      const current = minutesSorted[i];
      if (current === undefined || current - prev > 30) {
        result.push({
          day_of_week: DAY_TO_WEEKDAY[day],
          start_time: minutesToTime24(runStart),
          end_time: minutesToTime24(prev + 30),
          slot_minutes: 30,
          is_active: true,
        });
        if (current !== undefined) runStart = current;
      }
      prev = current;
    }
  });

  return result;
}

function slotsToSchedule(slots: AvailabilitySlot[]): WeekSchedule {
  const schedule: WeekSchedule = JSON.parse(JSON.stringify(EMPTY_SCHEDULE));

  slots.forEach(slot => {
    const day = WEEKDAY_TO_DAY[slot.day_of_week];
    if (!day) return;
    const step = slot.slot_minutes || 30;
    let mins = timeToMinutes(slot.start_time);
    const endMins = timeToMinutes(slot.end_time);
    const chips: string[] = [];
    while (mins < endMins) {
      chips.push(to12Hour(minutesToTime24(mins)));
      mins += step;
    }
    schedule[day].enabled = true;
    schedule[day].slots = Array.from(new Set([...schedule[day].slots, ...chips]));
  });

  return schedule;
}

export default function DoctorAvailability() {
  const { doctorProfile, refreshUser } = useAuth();
  const [schedule, setSchedule] = useState<WeekSchedule>(EMPTY_SCHEDULE);
  const [vacationMode, setVacationMode] = useState(false);
  const [slotCapacity, setSlotCapacity] = useState(1);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, add: addToast, dismiss } = useToast();

  useEffect(() => {
    if (!doctorProfile) return;
    Promise.all([
      doctorsService.getAvailability(doctorProfile.id),
      doctorsService.getBlockedDates(doctorProfile.id),
    ])
      .then(([slots, blocked]) => {
        setSchedule(slotsToSchedule(slots));
        setBlockedDates(blocked.map(b => b.date.slice(0, 10)));
        setVacationMode(doctorProfile.is_on_vacation ?? false);
        setSlotCapacity(doctorProfile.slot_capacity ?? 2);
      })
      .catch(err => addToast({ type: "error", title: "Failed to load availability", body: err.message }))
      .finally(() => setLoading(false));
  }, [doctorProfile]);

  const monthDays = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const leadBlanks = getDay(startOfMonth(viewMonth));

  function toggleBlockDate(dateStr: string) {
    setBlockedDates(ds => ds.includes(dateStr) ? ds.filter(d => d !== dateStr) : [...ds, dateStr]);
  }

  async function save() {
    setSaving(true);
    try {
      const slots = vacationMode ? [] : scheduleToSlots(schedule);
      await Promise.all([
        doctorsService.setMyAvailability(slots),
        doctorsService.setMyBlockedDates(blockedDates.map(date => ({ date }))),
        doctorsService.setVacationMode(vacationMode),
        doctorsService.updateMe({ slot_capacity: slotCapacity }),
      ]);
      await refreshUser();
      addToast({ type: "success", title: "Availability saved", body: "Your schedule has been updated successfully." });
    } catch (err: any) {
      addToast({ type: "error", title: "Failed to save availability", body: err.message || "Please try again." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DoctorShell title="Availability Management" subtitle="Set your weekly schedule and block dates">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DoctorShell>
    );
  }

  return (
    <DoctorShell
      title="Availability Management"
      subtitle="Set your weekly schedule and block dates"
      actions={
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save"}
        </button>
      }
    >
      <div className="max-w-4xl space-y-6">
        <div className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${vacationMode ? "bg-accent/10" : "bg-muted"}`}>
              <Plane className={`w-4 h-4 ${vacationMode ? "text-accent" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Vacation mode</p>
              <p className="text-xs text-muted-foreground">{vacationMode ? "All appointments are blocked. Patients cannot book. Save to apply." : "You are available for appointments."}</p>
            </div>
          </div>
          <div
            onClick={() => setVacationMode(v => !v)}
            className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${vacationMode ? "bg-accent" : "bg-switch-background"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${vacationMode ? "left-5" : "left-1"}`} />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground text-sm">Patients per time slot</p>
            <p className="text-xs text-muted-foreground">How many patients can book the same time slot (e.g. for group or overlapping consultations)</p>
          </div>
          <select
            value={slotCapacity}
            onChange={e => setSlotCapacity(Number(e.target.value))}
            className="bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {!vacationMode && (
          <>
            <div>
              <h2 className="font-medium text-foreground mb-3">Weekly Schedule</h2>
              <AvailabilityEditor schedule={schedule} onChange={setSchedule} />
            </div>

            <div>
              <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-muted-foreground" /> Block specific dates
              </h2>
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setViewMonth(m => subMonths(m, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><ChevronLeft className="w-4 h-4" /></button>
                  <p className="text-sm font-medium text-foreground">{format(viewMonth, "MMMM yyyy")}</p>
                  <button onClick={() => setViewMonth(m => addMonths(m, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: leadBlanks }).map((_, i) => <div key={i} />)}
                  {monthDays.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const blocked = blockedDates.includes(dateStr);
                    return (
                      <button key={dateStr} onClick={() => toggleBlockDate(dateStr)} className={`relative mx-auto w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all ${blocked ? "bg-destructive/10 text-destructive font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                        {day.getDate()}
                        {blocked && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-destructive" />}
                      </button>
                    );
                  })}
                </div>
                {blockedDates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">{blockedDates.length} date{blockedDates.length !== 1 ? "s" : ""} blocked — click Save to apply</p>
                    <div className="flex flex-wrap gap-1.5">
                      {blockedDates.slice(0, 6).map(d => (
                        <span key={d} className="text-xs bg-destructive/10 text-destructive px-2.5 py-1 rounded-full font-['DM_Mono',monospace]">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </DoctorShell>
  );
}