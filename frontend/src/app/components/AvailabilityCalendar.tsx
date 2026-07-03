import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay, addMonths, subMonths } from "date-fns";

interface Props {
  /** Days of week (0=Sunday ... 6=Saturday) the doctor has any availability slot on */
  availableWeekdays: number[];
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function AvailabilityCalendar({ availableWeekdays, selectedDate, onSelect }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = getDay(monthStart);

  const isAvailable = (date: Date) => {
    if (isBefore(date, today)) return false;
    return availableWeekdays.includes(getDay(date));
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 font-['Inter',sans-serif]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewMonth(m => subMonths(m, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-medium text-foreground">{format(viewMonth, "MMMM yyyy")}</p>
        <button onClick={() => setViewMonth(m => addMonths(m, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
          const available = isAvailable(day);
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          const past = isBefore(day, today);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              disabled={!available}
              onClick={() => onSelect(day)}
              className={[
                "relative mx-auto w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all",
                selected
                  ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                  : available
                  ? "hover:bg-accent/10 text-foreground font-medium hover:text-accent"
                  : past
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-muted-foreground/40 cursor-not-allowed",
              ].join(" ")}
            >
              {day.getDate()}
              {available && !selected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />}
              {isToday && !selected && <span className="absolute inset-0 rounded-lg ring-1 ring-accent/40" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted" /> Unavailable</span>
      </div>
    </div>
  );
}