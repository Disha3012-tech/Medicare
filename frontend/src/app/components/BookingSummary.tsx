import { MapPin, Video, Building2, Calendar, Clock, Shield, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import type { Doctor } from "../services/doctors";
import { doctorFullName, doctorLocation } from "../services/doctors";

interface Props {
  doctor: Doctor;
  date: Date;
  time: string;
  appointmentType: "in-person" | "video";
  reason: string;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  errorMessage?: string;
}

const AVATAR_FALLBACK = "https://api.dicebear.com/7.x/initials/svg?seed=";

export default function BookingSummary({
  doctor, date, time, appointmentType, reason, onReasonChange, onConfirm, onBack, loading, errorMessage,
}: Props) {
  const name = doctorFullName(doctor);
  const location = doctorLocation(doctor);
  const avatarSrc = doctor.avatar_url || `${AVATAR_FALLBACK}${encodeURIComponent(name)}`;

  return (
    <div className="space-y-5 font-['Inter',sans-serif]">
      <div className="bg-secondary rounded-xl p-4 flex gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-accent">{doctor.specialty}</p>
          {doctor.clinic_name && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3" /> {doctor.clinic_name}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-['Fraunces',serif] text-xl font-semibold text-foreground">₹{doctor.consultation_fee}</p>
          <p className="text-xs text-muted-foreground">consultation</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-medium text-foreground">{format(date, "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Clock className="w-4 h-4 text-accent flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-medium text-foreground">{time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          {appointmentType === "video" ? <Video className="w-4 h-4 text-accent flex-shrink-0" /> : <MapPin className="w-4 h-4 text-accent flex-shrink-0" />}
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-medium text-foreground">
              {appointmentType === "video" ? "Video consultation" : `In-person · ${location}`}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Reason for visit <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          value={reason}
          onChange={e => onReasonChange(e.target.value)}
          placeholder="Briefly describe your symptoms or the purpose of your visit…"
          rows={3}
          className="w-full bg-input-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
        />
      </div>

      <div className="flex items-start gap-2.5 bg-secondary rounded-xl p-4">
        <Shield className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Free cancellation up to 24 hours before your appointment. Your information is encrypted and shared only with your care provider.
        </p>
      </div>

      {errorMessage && (
        <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-2.5">{errorMessage}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground border border-border rounded-xl px-5 py-3 hover:border-primary/30 hover:text-foreground transition-all">
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-medium text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Confirming…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Confirm appointment
            </>
          )}
        </button>
      </div>
    </div>
  );
}