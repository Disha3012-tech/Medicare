import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Star, MapPin, Building2, Shield, CheckCircle2, HeartPulse, Calendar, Briefcase
} from "lucide-react";
import { doctorsService, doctorFullName, doctorLocation, type Doctor, type AvailabilitySlot } from "../services/doctors";
import { reviewsService, type Review } from "../services/reviews";
import ReviewCard from "../components/ReviewCard";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import LoadingSkeleton from "../components/LoadingSkeleton";

const TABS = ["About", "Reviews", "Availability"] as const;
type Tab = typeof TABS[number];

const AVATAR_FALLBACK = "https://api.dicebear.com/7.x/initials/svg?seed=";

export default function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("About");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    Promise.all([
      doctorsService.getById(id),
      doctorsService.getAvailability(id),
      reviewsService.getByDoctorId(id),
    ])
      .then(([doc, avail, revs]) => {
        setDoctor(doc);
        setAvailability(avail);
        setReviews(revs);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-['Inter',sans-serif] max-w-5xl mx-auto px-6 py-8">
        <LoadingSkeleton className="h-40 rounded-2xl mb-6" />
        <LoadingSkeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-['Inter',sans-serif]">
        <div className="text-center">
          <HeartPulse className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground mb-2">Doctor not found</p>
          <button onClick={() => navigate("/find-doctors")} className="text-sm text-accent hover:underline">Back to search</button>
        </div>
      </div>
    );
  }

  const name = doctorFullName(doctor);
  const location = doctorLocation(doctor);
  const avatarSrc = doctor.avatar_url || `${AVATAR_FALLBACK}${encodeURIComponent(name)}`;
  const availableWeekdays = Array.from(new Set(availability.map(s => s.day_of_week)));
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : doctor.average_rating.toFixed(1);

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 sm:px-6 h-16 flex items-center gap-4">
        <button onClick={() => navigate("/find-doctors")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:block">Back to search</span>
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <HeartPulse className="w-5 h-5 text-accent" />
          <span className="font-['Fraunces',serif] font-semibold text-primary hidden sm:block">Medicare</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
              <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/10">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-card shadow-lg bg-muted">
                    <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="pt-14 px-6 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">{name}</h1>
                    <p className="text-accent font-medium mt-0.5">{doctor.specialty}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">{avgRating}</span>
                      <span className="text-sm text-muted-foreground">({doctor.total_reviews})</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{doctor.years_experience} yrs experience</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  {doctor.clinic_name && (
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{doctor.clinic_name}</span>
                  )}
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{location}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />License #{doctor.license_number}</span>
                </div>
              </div>
            </div>

            <div className="flex border-b border-border mb-6 gap-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {tab}
                  {tab === "Reviews" && reviews.length > 0 && (
                    <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">{reviews.length}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "About" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-medium text-foreground mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {doctor.bio || `${name} is a licensed ${doctor.specialty} provider with ${doctor.years_experience} years of experience.`}
                  </p>
                </div>
                <div>
                  <h2 className="font-medium text-foreground mb-3">Practice details</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> Specialty: {doctor.specialty}
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> {doctor.years_experience} years of clinical experience
                    </li>
                    {doctor.clinic_name && (
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> Practices at {doctor.clinic_name}
                      </li>
                    )}
                    {doctor.clinic_address && (
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> {doctor.clinic_address}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  <>
                    <div className="bg-card rounded-xl border border-border p-5 flex gap-6">
                      <div className="text-center">
                        <p className="font-['Fraunces',serif] text-5xl font-semibold text-foreground">{avgRating}</p>
                        <div className="flex items-center gap-0.5 justify-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          return (
                            <div key={stars} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-3">{stars}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 bg-muted rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-4">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="w-8 h-8 mx-auto mb-3 text-muted" />
                    <p className="text-sm">No reviews yet. Be the first to leave one after your visit.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Availability" && (
              <div className="space-y-4">
                <AvailabilityCalendar
                  availableWeekdays={availableWeekdays}
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />
                {selectedDate && (
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-accent" />
                      <p className="text-sm font-medium text-foreground">
                        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/book/${doctor.id}?date=${selectedDate.toISOString()}`)}
                      className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Continue booking
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 space-y-5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Consultation fee</p>
                <p className="font-['Fraunces',serif] text-3xl font-semibold text-foreground">₹{doctor.consultation_fee}</p>
                <p className="text-xs text-muted-foreground">per visit</p>
              </div>

              <button
                onClick={() => navigate(`/book/${doctor.id}`)}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                Book appointment
              </button>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Free cancellation up to 24h before</div>
                <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-accent" /> Encrypted and private</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Instant confirmation</div>
              </div>
            </div>
          </aside>
        </div>

        <div className="fixed bottom-0 inset-x-0 p-4 bg-card border-t border-border lg:hidden z-20">
          <button
            onClick={() => navigate(`/book/${doctor.id}`)}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all"
          >
            Book appointment · ₹{doctor.consultation_fee}
          </button>
        </div>
        <div className="h-20 lg:hidden" />
      </div>
    </div>
  );
}