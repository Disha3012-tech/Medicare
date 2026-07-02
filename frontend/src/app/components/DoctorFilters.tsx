import { X, SlidersHorizontal } from "lucide-react";
import { SPECIALTIES, INSURANCES } from "../data/doctors";

export interface FilterState {
  specialty: string;
  availability: string;
  minRating: number;
  appointmentType: string;
  insurance: string;
  maxFee: number;
}

export const DEFAULT_FILTERS: FilterState = {
  specialty: "All Specialties",
  availability: "any",
  minRating: 0,
  appointmentType: "any",
  insurance: "",
  maxFee: 500,
};

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose?: () => void;
  resultCount: number;
}

export default function DoctorFilters({ filters, onChange, onClose, resultCount }: Props) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  const isDirty =
    filters.specialty !== DEFAULT_FILTERS.specialty ||
    filters.availability !== "any" ||
    filters.minRating > 0 ||
    filters.appointmentType !== "any" ||
    filters.insurance !== "" ||
    filters.maxFee < 500;

  return (
    <aside className="w-full flex flex-col gap-6 font-['Inter',sans-serif]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          {isDirty && (
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">Active</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors lg:hidden">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground -mt-4">
        <span className="font-medium text-foreground">{resultCount}</span> doctors found
      </p>

      {/* Specialty */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Specialty</label>
        <div className="flex flex-col gap-1">
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => set("specialty", s)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition-all ${filters.specialty === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Availability</label>
        <div className="flex flex-col gap-1.5">
          {[["any", "Any time"], ["today", "Available today"], ["this-week", "This week"]].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${filters.availability === val ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"}`}>
                {filters.availability === val && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors" onClick={() => set("availability", val)}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Appointment type */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Appointment type</label>
        <div className="flex gap-2">
          {[["any", "Any"], ["in-person", "In-person"], ["video", "Video"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => set("appointmentType", val)}
              className={`flex-1 text-xs py-2 rounded-lg border transition-all ${filters.appointmentType === val ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Minimum rating</label>
          <span className="text-xs font-medium text-foreground">{filters.minRating > 0 ? `${filters.minRating}+` : "Any"}</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 4, 4.5, 4.8].map(r => (
            <button
              key={r}
              onClick={() => set("minRating", r)}
              className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${filters.minRating === r ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"}`}
            >
              {r === 0 ? "Any" : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Max fee */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Max consultation fee</label>
          <span className="font-['DM_Mono',monospace] text-xs font-medium text-foreground">
            {filters.maxFee >= 500 ? "Any" : `$${filters.maxFee}`}
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={500}
          step={25}
          value={filters.maxFee}
          onChange={e => set("maxFee", Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$100</span><span>$500+</span>
        </div>
      </div>

      {/* Insurance */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Insurance</label>
        <select
          value={filters.insurance}
          onChange={e => set("insurance", e.target.value)}
          className="w-full text-sm bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All insurances</option>
          {INSURANCES.map(ins => <option key={ins} value={ins}>{ins}</option>)}
        </select>
      </div>
    </aside>
  );
}
