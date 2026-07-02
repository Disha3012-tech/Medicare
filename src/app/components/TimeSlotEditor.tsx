import { useState } from "react";
import { Plus, X } from "lucide-react";

const MORNING = ["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM"];
const AFTERNOON = ["12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM"];
const EVENING = ["4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM"];

interface Props { selected: string[]; onChange: (slots: string[]) => void; }

export default function TimeSlotEditor({ selected, onChange }: Props) {
  function toggle(slot: string) {
    onChange(selected.includes(slot) ? selected.filter(s => s !== slot) : [...selected, slot].sort());
  }

  function addSession(slots: string[]) {
    const toAdd = slots.filter(s => !selected.includes(s));
    onChange([...selected, ...toAdd].sort());
  }

  function removeSession(slots: string[]) {
    onChange(selected.filter(s => !slots.includes(s)));
  }

  const sections = [
    { label: "Morning", slots: MORNING },
    { label: "Afternoon", slots: AFTERNOON },
    { label: "Evening", slots: EVENING },
  ];

  return (
    <div className="space-y-5">
      {sections.map(({ label, slots }) => {
        const allActive = slots.every(s => selected.includes(s));
        return (
          <div key={label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <button
                onClick={() => allActive ? removeSession(slots) : addSession(slots)}
                className="text-xs text-accent hover:underline"
              >
                {allActive ? "Remove all" : "Add all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => {
                const active = selected.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggle(slot)}
                    className={`text-xs px-3 py-2 rounded-xl border-2 transition-all ${active ? "border-accent bg-accent/10 text-accent font-medium" : "border-border text-muted-foreground hover:border-accent/40"}`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">{selected.length} slot{selected.length !== 1 ? "s" : ""} selected across the day</p>
      </div>
    </div>
  );
}
