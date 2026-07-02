import { useState } from "react";
import { CalendarX, Plane, Save, CheckCircle2 } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import AvailabilityEditor, { type WeekSchedule } from "../components/AvailabilityEditor";
import { ToastContainer, useToast } from "../components/ToastNotification";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_SCHEDULE: WeekSchedule = {
  Monday:    { enabled: true,  slots: ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM"] },
  Tuesday:   { enabled: true,  slots: ["9:00 AM","10:00 AM","2:00 PM","3:00 PM","4:00 PM"] },
  Wednesday: { enabled: true,  slots: ["9:00 AM","10:00 AM","11:00 AM"] },
  Thursday:  { enabled: true,  slots: ["9:00 AM","10:00 AM","2:00 PM","3:00 PM"] },
  Friday:    { enabled: true,  slots: ["9:00 AM","10:00 AM","11:00 AM","2:00 PM"] },
  Saturday:  { enabled: false, slots: [] },
  Sunday:    { enabled: false, slots: [] },
};

export default function DoctorAvailability() {
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [vacationMode, setVacationMode] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>(["2026-07-14", "2026-07-15", "2026-07-16"]);
  const [viewMonth, setViewMonth] = useState(new Date());
  const { toasts, add: addToast, dismiss } = useToast();

  const monthDays = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const leadBlanks = getDay(startOfMonth(viewMonth));

  function toggleBlockDate(dateStr: string) {
    setBlockedDates(ds => ds.includes(dateStr) ? ds.filter(d => d !== dateStr) : [...ds, dateStr]);
  }

  function save() {
    addToast({ type: "success", title: "Availability saved", body: "Your schedule has been updated successfully." });
  }

  return (
    <DoctorShell
      title="Availability Management"
      subtitle="Set your weekly schedule and block dates"
      actions={
        <button onClick={save} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-all">
          <Save className="w-4 h-4" /> Save
        </button>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Vacation mode */}
        <div className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${vacationMode ? "bg-accent/10" : "bg-muted"}`}>
              <Plane className={`w-4 h-4 ${vacationMode ? "text-accent" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Vacation mode</p>
              <p className="text-xs text-muted-foreground">{vacationMode ? "All appointments are blocked. Patients cannot book." : "You are available for appointments."}</p>
            </div>
          </div>
          <div
            onClick={() => setVacationMode(v => !v)}
            className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${vacationMode ? "bg-accent" : "bg-switch-background"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${vacationMode ? "left-5" : "left-1"}`} />
          </div>
        </div>

        {!vacationMode && (
          <>
            {/* Weekly schedule */}
            <div>
              <h2 className="font-medium text-foreground mb-3">Weekly Schedule</h2>
              <AvailabilityEditor schedule={schedule} onChange={setSchedule} />
            </div>

            {/* Block specific dates */}
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
                      <button key={dateStr} onClick={() => toggleBlockDate(dateStr)} className={`mx-auto w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all ${blocked ? "bg-destructive/10 text-destructive font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                        {day.getDate()}
                        {blocked && <span className="absolute mt-5 ml-5 w-1.5 h-1.5 rounded-full bg-destructive" />}
                      </button>
                    );
                  })}
                </div>
                {blockedDates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">{blockedDates.length} date{blockedDates.length !== 1 ? "s" : ""} blocked</p>
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
