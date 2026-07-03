import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Star, ArrowRight } from "lucide-react";
import { doctorsService, doctorFullName, type Doctor } from "../services/doctors";

interface Props { specialties: string[]; }

const AVATAR_FALLBACK = "https://api.dicebear.com/7.x/initials/svg?seed=";

export default function RecommendedDoctors({ specialties }: Props) {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (specialties.length === 0) { setLoading(false); return; }
    doctorsService.list()
      .then(all => {
        const matched = all
          .filter(d => specialties.includes(d.specialty))
          .sort((a, b) => b.average_rating - a.average_rating)
          .slice(0, 3);
        setDoctors(matched);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialties.join(",")]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (doctors.length === 0) return null;

  return (
    <div className="space-y-3">
      {doctors.map(d => {
        const name = doctorFullName(d);
        const avatarSrc = d.avatar_url || `${AVATAR_FALLBACK}${encodeURIComponent(name)}`;
        return (
          <div
            key={d.id}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm hover:border-accent/20 transition-all cursor-pointer group"
            onClick={() => navigate(`/doctor/${d.id}`)}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              <img src={avatarSrc} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{name}</p>
              <p className="text-xs text-accent">{d.specialty}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-foreground">{d.average_rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">· {d.years_experience} yrs exp</span>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); navigate(`/book/${d.id}`); }}
              className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              Book <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}