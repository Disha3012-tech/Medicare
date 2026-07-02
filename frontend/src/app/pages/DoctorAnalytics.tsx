import { Calendar, DollarSign, Users, Star, TrendingDown, RefreshCw } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import AnalyticsCard from "../components/AnalyticsCard";
import RevenueChart from "../components/RevenueChart";
import AppointmentChart from "../components/AppointmentChart";
import PatientGrowthChart from "../components/PatientGrowthChart";

const TOP_CONDITIONS = [
  { label: "Hypertension", count: 18, pct: 40 },
  { label: "Heart failure", count: 12, pct: 27 },
  { label: "Arrhythmia",   count: 9,  pct: 20 },
  { label: "CAD",          count: 6,  pct: 13 },
];

const RECENT_FEEDBACK = [
  { patient: "M.W.", rating: 5, text: "Dr. Osei is exceptionally thorough. She listened to all my concerns." },
  { patient: "S.K.", rating: 5, text: "Best cardiologist in SF — clear explanations and quick results." },
  { patient: "T.R.", rating: 4, text: "Very professional. Follow-up was quick and informative." },
];

export default function DoctorAnalytics() {
  return (
    <DoctorShell title="Analytics" subtitle="Practice performance overview — July 2026">
      <div className="max-w-5xl space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard label="Today's appointments" value="5" sub="3 completed · 2 upcoming" icon={<Calendar className="w-4 h-4 text-primary" />} delta="+2 vs yesterday" deltaPositive />
          <AnalyticsCard label="Monthly revenue" value="$27,800" sub="Jun 2026" icon={<DollarSign className="w-4 h-4 text-accent" />} delta="+12% vs May" deltaPositive accent />
          <AnalyticsCard label="Active patients" value="47" sub="This month" icon={<Users className="w-4 h-4 text-primary" />} delta="+6 new" deltaPositive />
          <AnalyticsCard label="Average rating" value="4.9" sub="Based on 312 reviews" icon={<Star className="w-4 h-4 text-yellow-500" />} delta="+0.1 vs last month" deltaPositive />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard label="Cancellation rate" value="4.1%" sub="This month" icon={<TrendingDown className="w-4 h-4 text-muted-foreground" />} delta="+0.8%" deltaPositive={false} />
          <AnalyticsCard label="Repeat patients" value="68%" sub="Returning this month" icon={<RefreshCw className="w-4 h-4 text-accent" />} delta="+3% vs last" deltaPositive />
          <AnalyticsCard label="Avg consult time" value="18 min" sub="Per appointment" icon={<Calendar className="w-4 h-4 text-primary" />} delta="-3 min" deltaPositive />
          <AnalyticsCard label="No-show rate" value="2.1%" sub="This month" icon={<TrendingDown className="w-4 h-4 text-muted-foreground" />} delta="-0.5%" deltaPositive />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-5">
          <RevenueChart />
          <AppointmentChart />
        </div>
        <PatientGrowthChart />

        {/* Bottom row */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Top conditions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Top conditions treated</h3>
            <div className="space-y-3">
              {TOP_CONDITIONS.map(({ label, count, pct }) => (
                <div key={label} className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground w-28 flex-shrink-0">{label}</p>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="font-['DM_Mono',monospace] text-sm text-foreground w-6 text-right">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent feedback */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Recent patient feedback</h3>
            <div className="space-y-4">
              {RECENT_FEEDBACK.map((f, i) => (
                <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-foreground">{f.patient}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <svg key={j} className={`w-3 h-3 ${j < f.rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted"}`} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DoctorShell>
  );
}
