import { useState, useMemo, useEffect } from "react";
import { Search, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import DoctorCard from "../components/DoctorCard";
import DoctorFilters, { FilterState, DEFAULT_FILTERS } from "../components/DoctorFilters";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PatientShell from "../components/PatientShell";
import { doctorsService, type Doctor } from "../services/doctors";

type Layout = "grid" | "list";

const SORT_OPTIONS = [
  { value: "rating", label: "Top rated" },
  { value: "fee-asc", label: "Lowest fee" },
  { value: "fee-desc", label: "Highest fee" },
  { value: "experience", label: "Most experienced" },
];

export default function FindDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [layout, setLayout] = useState<Layout>("list");
  const [sort, setSort] = useState("rating");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    doctorsService.list({
      specialty: filters.specialty !== "All Specialties" ? filters.specialty : undefined,
      min_rating: filters.minRating > 0 ? filters.minRating : undefined,
      search: query || undefined,
    })
      .then(setDoctors)
      .catch(err => setError(err.message || "Failed to load doctors"))
      .finally(() => setLoading(false));
  }, [filters.specialty, filters.minRating, query]);

  const filtered = useMemo(() => {
    let docs = doctors.filter(d => filters.maxFee >= 500 || d.consultation_fee <= filters.maxFee);

    docs = [...docs].sort((a, b) => {
      if (sort === "rating") return b.average_rating - a.average_rating || b.total_reviews - a.total_reviews;
      if (sort === "fee-asc") return a.consultation_fee - b.consultation_fee;
      if (sort === "fee-desc") return b.consultation_fee - a.consultation_fee;
      if (sort === "experience") return b.years_experience - a.years_experience;
      return 0;
    });

    return docs;
  }, [doctors, filters.maxFee, sort]);

  return (
    <PatientShell title="Find Doctors" subtitle="Search and book appointments with specialists">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <div className="relative">
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
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <DoctorFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />
            </aside>

            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5 gap-3">
                <div>
                  <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">
                    {filters.specialty !== "All Specialties" ? filters.specialty : "All Doctors"}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "specialist" : "specialists"} available`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-xl px-3 py-2.5 hover:border-primary/30 transition-all flex-shrink-0"
                  >
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </button>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="text-sm bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
                    <button onClick={() => setLayout("list")} className={`p-2 transition-colors ${layout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                      <List className="w-4 h-4" />
                    </button>
                    <button onClick={() => setLayout("grid")} className={`p-2 transition-colors ${layout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

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
                  <button onClick={() => { setFilters(DEFAULT_FILTERS); setQuery(""); }} className="text-sm text-accent hover:underline">Clear all filters</button>
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
            </main>
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl overflow-y-auto p-5">
            <DoctorFilters filters={filters} onChange={setFilters} onClose={() => setMobileFiltersOpen(false)} resultCount={filtered.length} />
          </div>
        </div>
      )}
    </PatientShell>
  );
}