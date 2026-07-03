import { Video, Building2, Sun, Sunset, Moon } from "lucide-react";
import { format } from "date-fns";
import type { AvailabilitySlot } from "../services/doctors";

interface Props {
  date: Date;
  slots: AvailabilitySlot[]; // doctor's weekly availability, from getAvailability()
  appointmentType: "in-person" | "video";
  onTypeChange: (type: "in-person" | "video") => void;
  selectedSlot: { time: string; slotMinutes: number } | null;
  onSelect: (slot: { time: string; slotMinutes: number }) => void;
}

function to12Hour(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${minute.toString().padStart(2, "0")} ${period}`;
}

/** Generates ["9:00 AM", "9:30 AM", ...] between start_time and end_time at slot_minutes steps */
function generateTimes(startTime: string, endTime: string, stepMin: number): string[] {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const times: string[] = [];
  let mins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  while (mins < endMins) {
    times.push(to12Hour(Math.floor(mins / 60), mins % 60));
    mins += stepMin;
  }
  return times;
}

function bucket(time: string): "morning" | "afternoon" | "evening" {
  const isPM = time.includes("PM");
  const hour = parseInt(time.split(":")[0], 10);
  const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
  if (hour24 < 12) return "morning";
  if (hour24 < 17) return "afternoon";
  return "evening";
}

export default function TimeSlotPicker({ date, slots, appointmentType, onTypeChange, selectedSlot, onSelect }: Props) {
  const dayOfWeek = date.getDay();
  const daySlots = slots.filter(s => s.day_of_week === dayOfWeek && s.is_active !== false);

  const allTimes: { time: string; slotMinutes: number }[] = daySlots.flatMap(s =>
    generateTimes(s.start_time, s.end_time, s.slot_minutes || 30).map(time => ({ time, slotMinutes: s.slot_minutes || 30 }))
  );

  const groups: Record<"morning" | "afternoon" | "evening", { time: string; slotMinutes: number }[]> = {
    morning: [], afternoon: [], evening: [],
  };
  allTimes.forEach(t => groups[bucket(t.time)].push(t));

  if (allTimes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        This doctor has no availability set for {format(date, "EEEE")}s. Please choose a different date.
      </p>
    );
  }

  return (
    <div className="font-['Inter',sans-serif] space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Available slots for <span className="text-accent">{format(date, "EEEE, MMMM d")}</span>
        </p>

        <div className="flex gap-2 mb-5">
          {([["in-person", "In-person", Building2], ["video", "Video call", Video]] as const).map(([val, label, Icon]) => (
            <button
              key={val}
              onClick={() => onTypeChange(val)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${appointmentType === val ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {([["morning", "Morning", <Sun key="s" className="w-3.5 h-3.5 text-yellow-500" />],
         ["afternoon", "Afternoon", <Sunset key="a" className="w-3.5 h-3.5 text-orange-400" />],
         ["evening", "Evening", <Moon key="m" className="w-3.5 h-3.5 text-primary" />]] as const
      ).map(([key, label, icon]) => {
        const items = groups[key];
        if (items.length === 0) return null;
        return (
          <div key={key}>
            <div className="flex items-center gap-1.5 mb-2">
              {icon}
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {items.map(slot => (
                <button
                  key={slot.time}
                  onClick={() => onSelect(slot)}
                  className={[
                    "py-2.5 rounded-lg text-xs font-medium border-2 transition-all",
                    selectedSlot?.time === slot.time
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/15"
                      : "border-border text-foreground hover:border-accent/50 hover:bg-accent/5",
                  ].join(" ")}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}