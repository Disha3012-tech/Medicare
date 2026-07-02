import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, LayoutGrid, List, SlidersHorizontal, X, HeartPulse } from "lucide-react";
import DoctorCard from "../components/DoctorCard";
import DoctorFilters, { FilterState, DEFAULT_FILTERS } from "../components/DoctorFilters";
import { DOCTORS } from "../data/doctors";

type Layout = "grid" | "list";

const SORT_OPTIONS = [
  { value: "rating", label: "Top rated" },
  { value: "fee-asc", label: "Lowest fee" },
  { value: "fee-desc", label: "Highest fee" },
  { value: "experience", label: "Most experienced" },
];

export default function FindDoctors() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [layout, setLayout] = useState<Layout>("list");
  const [sort, setSort] = useState("rating");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let docs = DOCTORS.filter(d => {
      if (query) {
        const q = query.toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.specialty.toLowerCase().includes(q) && !d.tags.some(t => t.toLowerCase().includes(q))) return false;
      }
      if (filters.specialty !== "All Specialties" && d.specialty !== filters.specialty) return false;
      if (filters.minRating > 0 && d.rating < filters.minRating) return false;
      if (filters.appointmentType !== "any" && !d.appointmentTypes.includes(filters.appointmentType as "in-person" | "video")) return false;
      if (filters.insurance && !d.insurances.includes(filters.insurance)) return false;
      if (filters.maxFee < 500 && d.consultationFee > filters.maxFee) return false;
      if (filters.availability === "today" && !d.nextAvailable.toLowerCase().includes("today")) return false;
      if (filters.availability === "this-week" && !["today", "tomorrow", "jul 1", "jul 2", "jul 3", "jul 4", "jul 5", "jul 6", "jul 7"].some(s => d.nextAvailable.toLowerCase().includes(s))) return false;
      return true;
    });

    docs = [...docs].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sort === "fee-asc") return a.consultationFee - b.consultationFee;
      if (sort === "fee-desc") return b.consultationFee - a.consultationFee;
      if (sort === "experience") return b.yearsExperience - a.yearsExperience;
      return 0;
    });

    return docs;
  }, [query, filters, sort]);

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 flex-shrink-0">
            <HeartPulse className="w-5 h-5 text-accent" />
            <span className="font-['Fraunces',serif] font-semibold text-primary hidden sm:block">Medica</span>
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, specialty, or condition…"
              className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-xl px-3 py-2.5 hover:border-primary/30 transition-all flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-8">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24 self-start">
          <DoctorFilters
            filters={filters}
            onChange={setFilters}
            resultCount={filtered.length}
          />
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 gap-3">
            <div>
              <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">
                {filters.specialty !== "All Specialties" ? filters.specialty : "All Doctors"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filtered.length} {filtered.length === 1 ? "specialist" : "specialists"} available
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setLayout("list")}
                  className={`p-2 transition-colors ${layout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayout("grid")}
                  className={`p-2 transition-colors ${layout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-2">No doctors found</p>
              <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search term.</p>
              <button onClick={() => { setFilters(DEFAULT_FILTERS); setQuery(""); }} className="text-sm text-accent hover:underline">Clear all filters</button>
            </div>
          ) : layout === "grid" ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(d => <DoctorCard key={d.id} doctor={d} layout="grid" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(d => <DoctorCard key={d.id} doctor={d} layout="list" />)}
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl overflow-y-auto p-5">
            <DoctorFilters
              filters={filters}
              onChange={setFilters}
              onClose={() => setMobileFiltersOpen(false)}
              resultCount={filtered.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}
