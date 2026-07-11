import { useState, useMemo, useEffect, useRef } from "react";
import { Search, LayoutGrid, List, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import DoctorCard from "../components/DoctorCard";
import DoctorFilters, { FilterState, DEFAULT_FILTERS } from "../components/DoctorFilters";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PatientShell from "../components/PatientShell";
import { doctorsService, type Doctor } from "../services/doctors";

type Layout = "grid" | "list";

const SORT_OPTIONS = [
  { value: "rating",     label: "Top rated" },
  { value: "fee-asc",   label: "Lowest fee" },
  { value: "fee-desc",  label: "Highest fee" },
  { value: "experience",label: "Most experienced" },
];

export default function FindDoctors() {
  const [doctors,      setDoctors]      = useState<Doctor[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [query,        setQuery]        = useState("");
  const [filters,      setFilters]      = useState<FilterState>(DEFAULT_FILTERS);
  const [layout,       setLayout]       = useState<Layout>("list");
  const [sort,         setSort]         = useState("rating");
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Count active filters for badge
  const activeFilterCount =
    (filters.specialty !== DEFAULT_FILTERS.specialty ? 1 : 0) +
    (filters.minRating  > 0                          ? 1 : 0) +
    (filters.maxFee     < 500                        ? 1 : 0);

  useEffect(() => {
    setLoading(true);
    doctorsService.list({
      specialty:  filters.specialty !== "All Specialties" ? filters.specialty : undefined,
      min_rating: filters.minRating > 0 ? filters.minRating : undefined,
      search:     query || undefined,
    })
      .then(setDoctors)
      .catch(err => setError(err.message || "Failed to load doctors"))
      .finally(() => setLoading(false));
  }, [filters.specialty, filters.minRating, query]);

  const filtered = useMemo(() => {
    let docs = doctors.filter(d => filters.maxFee >= 500 || d.consultation_fee <= filters.maxFee);
    docs = [...docs].sort((a, b) => {
      if (sort === "rating")     return b.average_rating - a.average_rating || b.total_reviews - a.total_reviews;
      if (sort === "fee-asc")    return a.consultation_fee - b.consultation_fee;
      if (sort === "fee-desc")   return b.consultation_fee - a.consultation_fee;
      if (sort === "experience") return b.years_experience - a.years_experience;
      return 0;
    });
    return docs;
  }, [doctors, filters.maxFee, sort]);

  return (
    <PatientShell title="Find Doctors" subtitle="Search and book appointments with specialists">
      <div className="flex flex-col gap-4">

        {/* ── Search + toolbar row ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or specialty…"
              className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toolbar: Filters button + Sort + Layout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* ── Filters toggle button ── */}
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className={`relative flex items-center gap-1.5 text-sm px-3.5 py-2.5 rounded-xl border transition-all font-medium ${
                filtersOpen || activeFilterCount > 0
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm bg-input-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Layout toggle */}
            <div className="hidden sm:flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setLayout("list")} className={`p-2.5 transition-colors ${layout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setLayout("grid")} className={`p-2.5 transition-colors ${layout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Collapsible filter panel ── */}
        <div
          ref={panelRef}
          style={{
            display: "grid",
            gridTemplateRows: filtersOpen ? "1fr" : "0fr",
            transition: "grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div className="bg-card border border-border rounded-2xl p-5 mb-1">
              <DoctorFilters
                filters={filters}
                onChange={setFilters}
                onClose={() => setFiltersOpen(false)}
                resultCount={filtered.length}
              />
            </div>
          </div>
        </div>

        {/* ── Results header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">
              {filters.specialty !== "All Specialties" ? filters.specialty : "All Doctors"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "specialist" : "specialists"} available`}
            </p>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); }}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Doctor results ── */}
        {loading ? (
          <div className="flex flex-col gap-3">{[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-2">No doctors found</p>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search term.</p>
            <button onClick={() => { setFilters(DEFAULT_FILTERS); setQuery(""); }} className="text-sm text-accent hover:underline">
              Clear all filters
            </button>
          </div>
        ) : layout === "grid" ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {filtered.map(d => <DoctorCard key={d.id} doctor={d} layout="grid" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(d => <DoctorCard key={d.id} doctor={d} layout="list" />)}
          </div>
        )}
      </div>
    </PatientShell>
  );
}