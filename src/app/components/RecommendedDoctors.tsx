import { useNavigate } from "react-router";
import { Star, ArrowRight } from "lucide-react";
import { DOCTORS } from "../data/doctors";

interface Props { specialties: string[]; }

export default function RecommendedDoctors({ specialties }: Props) {
  const navigate = useNavigate();
  const doctors = DOCTORS.filter(d => specialties.includes(d.specialty)).slice(0, 3);

  if (doctors.length === 0) return null;

  return (
    <div className="space-y-3">
      {doctors.map(d => (
        <div key={d.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm hover:border-accent/20 transition-all cursor-pointer group" onClick={() => navigate(`/doctor/${d.id}`)}>
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <img src={`https://images.unsplash.com/${d.avatar}?w=48&h=48&fit=crop&auto=format`} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{d.name}</p>
            <p className="text-xs text-accent">{d.specialty}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-foreground">{d.rating}</span>
              <span className="text-xs text-muted-foreground">· {d.nextAvailable}</span>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/book/${d.id}`); }}
            className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            Book <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
