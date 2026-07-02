import { Video, Building2, Sun, Sunset, Moon } from "lucide-react";
import { format } from "date-fns";

interface Props {
  date: Date;
  appointmentType: "in-person" | "video";
  onTypeChange: (type: "in-person" | "video") => void;
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  availableTypes: ("in-person" | "video")[];
}

const MORNING_SLOTS = ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
const AFTERNOON_SLOTS = ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"];
const EVENING_SLOTS = ["4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"];

// Deterministically mark some slots as taken so the UI looks realistic
const TAKEN_MODULO = [0, 2, 5, 7, 9, 12];

function isSlotAvailable(slot: string, date: Date): boolean {
  const hash = slot.charCodeAt(0) + date.getDate() * 3;
  return !TAKEN_MODULO.includes(hash % 14);
}

interface SlotGroupProps {
  label: string;
  icon: React.ReactNode;
  slots: string[];
  date: Date;
  selected: string | null;
  onSelect: (s: string) => void;
}

function SlotGroup({ label, icon, slots, date, selected, onSelect }: SlotGroupProps) {
  const available = slots.filter(s => isSlotAvailable(s, date));
  if (available.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {slots.map(slot => {
          const avail = isSlotAvailable(slot, date);
          return (
            <button
              key={slot}
              disabled={!avail}
              onClick={() => avail && onSelect(slot)}
              className={[
                "py-2.5 rounded-lg text-xs font-medium border-2 transition-all",
                selected === slot
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/15"
                  : avail
                  ? "border-border text-foreground hover:border-accent/50 hover:bg-accent/5"
                  : "border-border/50 text-muted-foreground/40 cursor-not-allowed bg-muted/30",
              ].join(" ")}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TimeSlotPicker({ date, appointmentType, onTypeChange, selectedSlot, onSelect, availableTypes }: Props) {
  return (
    <div className="font-['Inter',sans-serif] space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Available slots for <span className="text-accent">{format(date, "EEEE, MMMM d")}</span>
        </p>

        {/* Appointment type toggle */}
        {availableTypes.length > 1 && (
          <div className="flex gap-2 mb-5">
            {([["in-person", "In-person", Building2], ["video", "Video call", Video]] as const).map(([val, label, Icon]) => {
              if (!availableTypes.includes(val)) return null;
              return (
                <button
                  key={val}
                  onClick={() => onTypeChange(val)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${appointmentType === val ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <SlotGroup
        label="Morning"
        icon={<Sun className="w-3.5 h-3.5 text-yellow-500" />}
        slots={MORNING_SLOTS}
        date={date}
        selected={selectedSlot}
        onSelect={onSelect}
      />
      <SlotGroup
        label="Afternoon"
        icon={<Sunset className="w-3.5 h-3.5 text-orange-400" />}
        slots={AFTERNOON_SLOTS}
        date={date}
        selected={selectedSlot}
        onSelect={onSelect}
      />
      <SlotGroup
        label="Evening"
        icon={<Moon className="w-3.5 h-3.5 text-primary" />}
        slots={EVENING_SLOTS}
        date={date}
        selected={selectedSlot}
        onSelect={onSelect}
      />
    </div>
  );
}
