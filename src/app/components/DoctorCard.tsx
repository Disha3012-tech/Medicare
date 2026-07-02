import { Star, MapPin, Clock, Video, Building2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import type { Doctor } from "../data/doctors";

interface Props {
  doctor: Doctor;
  layout?: "grid" | "list";
}

export default function DoctorCard({ doctor, layout = "grid" }: Props) {
  const navigate = useNavigate();

  if (layout === "list") {
    return (
      <div
        className="bg-card rounded-xl border border-border p-5 flex gap-5 hover:shadow-md hover:border-accent/20 transition-all cursor-pointer group"
        onClick={() => navigate(`/doctor/${doctor.id}`)}
      >
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          <img
            src={`https://images.unsplash.com/${doctor.avatar}?w=80&h=80&fit=crop&auto=format`}
            alt={doctor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{doctor.name}</h3>
              <p className="text-sm text-accent mt-0.5">{doctor.specialty}</p>
              <p className="text-xs text-muted-foreground">{doctor.subspecialty}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-['Fraunces',serif] text-lg font-semibold text-foreground">${doctor.consultationFee}</p>
              <p className="text-xs text-muted-foreground">per visit</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{doctor.rating}</span>
              <span>({doctor.reviewCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />{doctor.hospital}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{doctor.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent font-medium">{doctor.nextAvailable}</span>
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {doctor.appointmentTypes.map(t => (
                <span key={t} className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  {t === "video" && <Video className="w-3 h-3" />}
                  {t === "in-person" ? "In-person" : "Video"}
                </span>
              ))}
              {doctor.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
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
        <img
          src={`https://images.unsplash.com/${doctor.avatar}?w=400&h=300&fit=crop&auto=format`}
          alt={doctor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex gap-1.5">
          {doctor.appointmentTypes.map(t => (
            <span key={t} className="inline-flex items-center gap-1 text-xs bg-card/90 backdrop-blur text-foreground px-2 py-1 rounded-full shadow-sm">
              {t === "video" ? <Video className="w-3 h-3 text-accent" /> : <Building2 className="w-3 h-3" />}
              {t === "in-person" ? "In-person" : "Video"}
            </span>
          ))}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{doctor.name}</h3>
            <p className="text-sm text-accent mt-0.5">{doctor.specialty}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-foreground">{doctor.rating}</span>
            <span className="text-xs text-muted-foreground">({doctor.reviewCount})</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{doctor.hospital}</p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 flex-shrink-0" />{doctor.location}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {doctor.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Next available</p>
            <p className="text-xs font-medium text-accent mt-0.5">{doctor.nextAvailable}</p>
          </div>
          <div className="text-right">
            <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground">${doctor.consultationFee}</p>
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
