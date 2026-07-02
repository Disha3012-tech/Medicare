import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  sub?: string;
  icon: React.ReactNode;
  accent?: boolean;
}

export default function AnalyticsCard({ label, value, delta, deltaPositive, sub, icon, accent }: Props) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 ${accent ? "bg-primary border-primary/20 text-primary-foreground" : "bg-card border-border"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? "bg-primary-foreground/10" : "bg-muted"}`}>
          {icon}
        </div>
        {delta && (
          <div className={`flex items-center gap-1 text-xs font-medium ${deltaPositive ? (accent ? "text-primary-foreground/80" : "text-accent") : (accent ? "text-primary-foreground/60" : "text-destructive")}`}>
            {deltaPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
      <div>
        <p className={`font-['Fraunces',serif] text-3xl font-semibold ${accent ? "text-primary-foreground" : "text-foreground"}`}>{value}</p>
        <p className={`text-xs mt-0.5 ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{label}</p>
        {sub && <p className={`text-xs mt-0.5 ${accent ? "text-primary-foreground/40" : "text-muted-foreground/60"}`}>{sub}</p>}
      </div>
    </div>
  );
}
