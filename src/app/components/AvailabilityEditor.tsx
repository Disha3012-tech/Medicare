import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";

export interface DaySchedule { enabled: boolean; slots: string[]; }
export type WeekSchedule = Record<string, DaySchedule>;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

interface Props { schedule: WeekSchedule; onChange: (s: WeekSchedule) => void; }

export default function AvailabilityEditor({ schedule, onChange }: Props) {
  const [activeDay, setActiveDay] = useState("Monday");

  function toggleDay(day: string) {
    onChange({ ...schedule, [day]: { ...schedule[day], enabled: !schedule[day].enabled } });
  }

  function addSlot(day: string, slot: string) {
    const existing = schedule[day].slots;
    if (!existing.includes(slot)) onChange({ ...schedule, [day]: { ...schedule[day], slots: [...existing, slot].sort() } });
  }

  function removeSlot(day: string, slot: string) {
    onChange({ ...schedule, [day]: { ...schedule[day], slots: schedule[day].slots.filter(s => s !== slot) } });
  }

  const day = schedule[activeDay];

  return (
    <div className="grid md:grid-cols-[200px_1fr] gap-4">
      {/* Day selector */}
      <div className="bg-card rounded-xl border border-border p-2 space-y-0.5">
        {DAYS.map(d => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${activeDay === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <span className="font-medium">{d}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${schedule[d].enabled ? "bg-accent/20 text-accent" : "bg-muted/50 text-muted-foreground"} ${activeDay === d ? "bg-primary-foreground/20 text-primary-foreground" : ""}`}>
              {schedule[d].enabled ? `${schedule[d].slots.length} slots` : "Off"}
            </span>
          </button>
        ))}
      </div>

      {/* Slot editor */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">{activeDay}</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-muted-foreground">{day.enabled ? "Available" : "Day off"}</span>
            <div
              onClick={() => toggleDay(activeDay)}
              className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${day.enabled ? "bg-accent" : "bg-switch-background"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${day.enabled ? "left-5" : "left-1"}`} />
            </div>
          </label>
        </div>

        {day.enabled ? (
          <>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Active slots</p>
              {day.slots.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No slots added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {day.slots.map(slot => (
                    <div key={slot} className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-xl">
                      {slot}
                      <button onClick={() => removeSlot(activeDay, slot)} className="text-primary/60 hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Add slots</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_SLOTS.filter(s => !day.slots.includes(s)).map(slot => (
                  <button key={slot} onClick={() => addSlot(activeDay, slot)} className="flex items-center gap-1 text-sm border border-dashed border-border text-muted-foreground px-3 py-1.5 rounded-xl hover:border-accent hover:text-accent transition-all">
                    <Plus className="w-3 h-3" />{slot}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">This day is set as unavailable.</p>
            <button onClick={() => toggleDay(activeDay)} className="text-xs text-accent hover:underline mt-2">Mark as available</button>
          </div>
        )}
      </div>
    </div>
  );
}
