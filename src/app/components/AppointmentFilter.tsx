import { Search, X } from "lucide-react";
import type { AppointmentStatus } from "../data/appointments";

export interface ApptFilterState {
  query: string;
  status: AppointmentStatus | "all";
  sort: "newest" | "oldest";
}

export const DEFAULT_APPT_FILTER: ApptFilterState = { query: "", status: "all", sort: "newest" };

const STATUS_TABS: { value: ApptFilterState["status"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface Props {
  filter: ApptFilterState;
  onChange: (f: ApptFilterState) => void;
  counts: Record<string, number>;
}

export default function AppointmentFilter({ filter, onChange, counts }: Props) {
  const set = <K extends keyof ApptFilterState>(k: K, v: ApptFilterState[K]) => onChange({ ...filter, [k]: v });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={filter.query}
            onChange={e => set("query", e.target.value)}
            placeholder="Search by doctor or specialty…"
            className="w-full bg-input-background border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {filter.query && (
            <button onClick={() => set("query", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={filter.sort}
          onChange={e => set("sort", e.target.value as ApptFilterState["sort"])}
          className="text-sm bg-input-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => set("status", value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter.status === value ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
          >
            {label}
            {counts[value] !== undefined && (
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${filter.status === value ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {counts[value]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
