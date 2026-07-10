import { Star, MapPin, Building2, ChevronRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router";
import type { Doctor } from "../services/doctors";
import { doctorFullName, doctorLocation } from "../services/doctors";

interface Props {
  doctor: Doctor;
  layout?: "grid" | "list";
}

const AVATAR_FALLBACK = "https://api.dicebear.com/7.x/initials/svg?seed=";

export default function DoctorCard({ doctor, layout = "grid" }: Props) {
  const navigate = useNavigate();
  const name = doctorFullName(doctor);
  const location = doctorLocation(doctor);
  const avatarSrc = doctor.avatar_url || `${AVATAR_FALLBACK}${encodeURIComponent(name)}`;

  if (layout === "list") {
    return (
      <div
        className="bg-card rounded-xl border border-border p-5 flex gap-5 hover:shadow-md hover:border-accent/20 transition-all cursor-pointer group"
        onClick={() => navigate(`/doctor/${doctor.id}`)}
      >
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          <img src={avatarSrc} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-sm text-accent mt-0.5">{doctor.specialty}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-['Fraunces',serif] text-lg font-semibold text-foreground">${doctor.consultation_fee}</p>
              <p className="text-xs text-muted-foreground">per visit</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{doctor.average_rating.toFixed(1)}</span>
              <span>({doctor.total_reviews})</span>
            </span>
            {doctor.clinic_name && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />{doctor.clinic_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />{doctor.years_experience} yrs experience
            </span>
          </div>
          <div className="mt-3 flex items-center justify-end">
            <button
              className="flex-shrink-0 flex items-center gap-1 text-xs text-primary font-medium hover:underline"
              onClick={e => { e.stopPropagation(); navigate(`/book/${doctor.id}`); }}
            >
              Book <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-accent/20 transition-all cursor-pointer group flex flex-col"
      onClick={() => navigate(`/doctor/${doctor.id}`)}
    >
      <div className="aspect-[4/3] bg-muted overflow-hidden relative">
        <img src={avatarSrc} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{name}</h3>
            <p className="text-sm text-accent mt-0.5">{doctor.specialty}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-foreground">{doctor.average_rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({doctor.total_reviews})</span>
          </div>
        </div>
        {doctor.clinic_name && <p className="text-xs text-muted-foreground">{doctor.clinic_name}</p>}
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 flex-shrink-0" />{location}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Experience</p>
            <p className="text-xs font-medium text-accent mt-0.5">{doctor.years_experience} years</p>
          </div>
          <div className="text-right">
            <p className="font-['Fraunces',serif] text-lg font-semibold text-foreground">₹{doctor.consultation_fee}</p>
            <p className="text-xs text-muted-foreground">per visit</p>
          </div>
        </div>
        <button
          className="mt-3 w-full bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-all"
          onClick={e => { e.stopPropagation(); navigate(`/book/${doctor.id}`); }}
        >
          Book appointment
        </button>
      </div>
    </div>
  );
}