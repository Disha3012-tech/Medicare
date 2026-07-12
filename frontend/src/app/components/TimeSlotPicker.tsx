import { Video, Building2, Sun, Sunset, Moon } from "lucide-react";
import { format, isToday } from "date-fns";
import type { AvailabilitySlot } from "../services/doctors";

interface Props {
  date: Date;
  slots: AvailabilitySlot[];
  bookedCounts: Record<string, number>; // "HH:MM" (24h) -> count
  capacity: number;
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

function to24Key(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function generateTimes(startTime: string, endTime: string, stepMin: number): { label: string; key24: string; hour: number; minute: number }[] {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const times: { label: string; key24: string; hour: number; minute: number }[] = [];
  let mins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  while (mins < endMins) {
    const h = Math.floor(mins / 60), m = mins % 60;
    times.push({ label: to12Hour(h, m), key24: to24Key(h, m), hour: h, minute: m });
    mins += stepMin;
  }
  return times;
}

function bucket(hour: number): "morning" | "afternoon" | "evening" {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default function TimeSlotPicker({ date, slots, bookedCounts, capacity, appointmentType, onTypeChange, selectedSlot, onSelect }: Props) {
  const dayOfWeek = date.getDay();
  const daySlots = slots.filter(s => s.day_of_week === dayOfWeek && s.is_active !== false);
  const now = new Date();
  const todaySelected = isToday(date);

  const allTimes = daySlots.flatMap(s =>
    generateTimes(s.start_time, s.end_time, s.slot_minutes || 30).map(t => ({ ...t, slotMinutes: s.slot_minutes || 30 }))
  ).filter(t => {
    // Drop times that have already passed if the selected date is today
    if (!todaySelected) return true;
    const slotDateTime = new Date(date);
    slotDateTime.setHours(t.hour, t.minute, 0, 0);
    return slotDateTime > now;
  });

  const groups: Record<"morning" | "afternoon" | "evening", typeof allTimes> = { morning: [], afternoon: [], evening: [] };
  allTimes.forEach(t => groups[bucket(t.hour)].push(t));

  if (allTimes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {todaySelected
          ? "No more slots available today. Please choose a different date."
          : `This doctor has no availability set for ${format(date, "EEEE")}s. Please choose a different date.`}
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
              {items.map(t => {
                const bookedCount = bookedCounts[t.key24] || 0;
                const spotsLeft = capacity - bookedCount;
                const full = spotsLeft <= 0;
                const isSelected = selectedSlot?.time === t.label;
                return (
                  <button
                    key={t.key24}
                    disabled={full}
                    onClick={() => !full && onSelect({ time: t.label, slotMinutes: t.slotMinutes })}
                    className={[
                      "py-2.5 rounded-lg text-xs font-medium border-2 transition-all relative",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/15"
                        : full
                        ? "border-border/50 text-muted-foreground/40 cursor-not-allowed bg-muted/30"
                        : "border-border text-foreground hover:border-accent/50 hover:bg-accent/5",
                    ].join(" ")}
                  >
                    {t.label}
                    {!full && capacity > 2 && (
                      <span className="block text-[10px] opacity-70 mt-0.5">{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</span>
                    )}
                    {full && <span className="block text-[10px] mt-0.5">Full</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}