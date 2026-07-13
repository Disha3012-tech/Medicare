import { useState, useEffect, useMemo } from "react";
import { Calendar, IndianRupee, Users, Star, TrendingDown, RefreshCw, Clock } from "lucide-react";
import DoctorShell from "../components/DoctorShell";
import AnalyticsCard from "../components/AnalyticsCard";
import RevenueChart from "../components/RevenueChart";
import AppointmentChart from "../components/AppointmentChart";
import PatientGrowthChart from "../components/PatientGrowthChart";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useAuth } from "../components/AuthProvider";
import { appointmentsService, type Appointment } from "../services/appointments";
import { patientsService, type PatientSummary } from "../services/patients";
import { reviewsService, type AnonymizedReview } from "../services/reviews";
import { prescriptionsService, type Prescription } from "../services/prescriptions";

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function monthKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}`; }
function monthLabel(d: Date) { return d.toLocaleDateString("en-US", { month: "short" }); }
function weekKey(d: Date) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export default function DoctorAnalytics() {
  const { doctorProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [reviews, setReviews] = useState<AnonymizedReview[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorProfile) return;
    Promise.all([
      appointmentsService.getMine(),
      patientsService.getMyPatients(),
      reviewsService.getMineAnonymized(),
      prescriptionsService.getMine(),
    ]).then(([appts, pts, revs, rxs]) => {
      setAppointments(appts);
      setPatients(pts);
      setReviews(revs);
      setPrescriptions(rxs);
    }).catch(console.error).finally(() => setLoading(false));
  }, [doctorProfile]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const lastMonthEnd = thisMonthStart;

    const thisMonthAppts = appointments.filter(a => new Date(a.scheduled_at) >= thisMonthStart && new Date(a.scheduled_at) < new Date(now.getFullYear(), now.getMonth() + 1, 1));
    const lastMonthAppts = appointments.filter(a => new Date(a.scheduled_at) >= lastMonthStart && new Date(a.scheduled_at) < lastMonthEnd);

    const todayAppts = appointments.filter(a => new Date(a.scheduled_at).toDateString() === today);
    const todayCompleted = todayAppts.filter(a => a.status === "COMPLETED").length;
    const todayUpcoming = todayAppts.filter(a => ["PENDING", "CONFIRMED"].includes(a.status)).length;

    const fee = doctorProfile?.consultation_fee || 0;
    const thisMonthRevenue = thisMonthAppts.filter(a => a.status === "COMPLETED").length * fee;
    const lastMonthRevenue = lastMonthAppts.filter(a => a.status === "COMPLETED").length * fee;
    const revenueDelta = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : null;

    const newThisMonth = patients.filter(p => p.last_visit && new Date(p.last_visit) >= thisMonthStart).length;

    const thisMonthCancelled = thisMonthAppts.filter(a => a.status === "CANCELLED").length;
    const cancellationRate = thisMonthAppts.length > 0 ? (thisMonthCancelled / thisMonthAppts.length) * 100 : 0;
    const lastMonthCancelled = lastMonthAppts.filter(a => a.status === "CANCELLED").length;
    const lastCancellationRate = lastMonthAppts.length > 0 ? (lastMonthCancelled / lastMonthAppts.length) * 100 : 0;

    const repeatPatients = patients.filter(p => p.visit_count > 1).length;
    const repeatRate = patients.length > 0 ? Math.round((repeatPatients / patients.length) * 100) : 0;

    const avgDuration = appointments.length > 0
      ? Math.round(appointments.reduce((s, a) => s + a.duration_min, 0) / appointments.length)
      : 0;

    const thisMonthNoShow = thisMonthAppts.filter(a => a.status === "NO_SHOW").length;
    const noShowRate = thisMonthAppts.length > 0 ? (thisMonthNoShow / thisMonthAppts.length) * 100 : 0;
    const lastMonthNoShow = lastMonthAppts.filter(a => a.status === "NO_SHOW").length;
    const lastNoShowRate = lastMonthAppts.length > 0 ? (lastMonthNoShow / lastMonthAppts.length) * 100 : 0;

    return {
      todayTotal: todayAppts.length, todayCompleted, todayUpcoming,
      thisMonthRevenue, revenueDelta,
      activePatients: patients.length, newThisMonth,
      cancellationRate, cancellationDelta: cancellationRate - lastCancellationRate,
      repeatRate,
      avgDuration,
      noShowRate, noShowDelta: noShowRate - lastNoShowRate,
    };
  }, [appointments, patients, doctorProfile]);

  // Appointment volume by week, last 6 weeks
  const appointmentChartData = useMemo(() => {
    const now = new Date();
    const weeks: { key: string; label: string; completed: number; cancelled: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      weeks.push({ key: weekKey(d), label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), completed: 0, cancelled: 0 });
    }
    appointments.forEach(a => {
      const wk = weekKey(new Date(a.scheduled_at));
      const bucket = weeks.find(w => w.key === wk);
      if (!bucket) return;
      if (a.status === "COMPLETED") bucket.completed++;
      if (a.status === "CANCELLED") bucket.cancelled++;
    });
    return weeks.map(w => ({ week: w.label, completed: w.completed, cancelled: w.cancelled }));
  }, [appointments]);

  // Revenue by month, last 7 months
  const revenueChartData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: monthKey(d), label: monthLabel(d), revenue: 0 });
    }
    const fee = doctorProfile?.consultation_fee || 0;
    appointments.filter(a => a.status === "COMPLETED").forEach(a => {
      const mk = monthKey(new Date(a.scheduled_at));
      const bucket = months.find(m => m.key === mk);
      if (bucket) bucket.revenue += fee;
    });
    return months.map(m => ({ month: m.label, revenue: m.revenue }));
  }, [appointments, doctorProfile]);

  // Patient growth: new vs returning per month, based on each patient's first-ever appointment with this doctor
  const patientGrowthData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; new: number; returning: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: monthKey(d), label: monthLabel(d), new: 0, returning: 0 });
    }
    const firstApptByPatient = new Map<string, Date>();
    [...appointments].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).forEach(a => {
      if (!firstApptByPatient.has(a.patient_id)) firstApptByPatient.set(a.patient_id, new Date(a.scheduled_at));
    });
    appointments.forEach(a => {
      const mk = monthKey(new Date(a.scheduled_at));
      const bucket = months.find(m => m.key === mk);
      if (!bucket) return;
      const isFirst = firstApptByPatient.get(a.patient_id)?.getTime() === new Date(a.scheduled_at).getTime();
      if (isFirst) bucket.new++; else bucket.returning++;
    });
    return months.map(m => ({ month: m.label, new: m.new, returning: m.returning, total: m.new + m.returning }));
  }, [appointments]);

  // Top diagnoses from prescriptions
  const topConditions = useMemo(() => {
    const counts = new Map<string, number>();
    prescriptions.forEach(p => {
      if (!p.diagnosis) return;
      counts.set(p.diagnosis, (counts.get(p.diagnosis) || 0) + 1);
    });
    const total = prescriptions.filter(p => p.diagnosis).length || 1;
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
  }, [prescriptions]);

  const recentReviews = useMemo(() =>
    [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3),
    [reviews]
  );

  if (loading) {
    return (
      <DoctorShell title="Analytics" subtitle="Practice performance overview">
        <div className="max-w-5xl space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-28 rounded-xl" />)}</div>
          <LoadingSkeleton className="h-64 rounded-xl" />
        </div>
      </DoctorShell>
    );
  }

  return (
    <DoctorShell title="Analytics" subtitle={`Practice performance overview — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}>
      <div className="max-w-5xl space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard label="Today's appointments" value={String(stats.todayTotal)} sub={`${stats.todayCompleted} completed · ${stats.todayUpcoming} upcoming`} icon={<Calendar className="w-4 h-4 text-primary" />} />
          <AnalyticsCard
            label="Monthly revenue" value={`₹${stats.thisMonthRevenue.toLocaleString()}`} sub="This month"
            icon={<IndianRupee className="w-4 h-4 text-accent" />} accent
            delta={stats.revenueDelta !== null ? `${stats.revenueDelta >= 0 ? "+" : ""}${stats.revenueDelta}% vs last month` : undefined}
            deltaPositive={stats.revenueDelta !== null ? stats.revenueDelta >= 0 : undefined}
          />
          <AnalyticsCard label="Active patients" value={String(stats.activePatients)} sub="Total under your care" icon={<Users className="w-4 h-4 text-primary" />} delta={stats.newThisMonth > 0 ? `+${stats.newThisMonth} new this month` : undefined} deltaPositive />
          <AnalyticsCard label="Average rating" value={doctorProfile ? doctorProfile.average_rating.toFixed(1) : "—"} sub={`Based on ${doctorProfile?.total_reviews ?? 0} reviews`} icon={<Star className="w-4 h-4 text-yellow-500" />} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard label="Cancellation rate" value={`${stats.cancellationRate.toFixed(1)}%`} sub="This month" icon={<TrendingDown className="w-4 h-4 text-muted-foreground" />} delta={`${stats.cancellationDelta >= 0 ? "+" : ""}${stats.cancellationDelta.toFixed(1)}%`} deltaPositive={stats.cancellationDelta <= 0} />
          <AnalyticsCard label="Repeat patients" value={`${stats.repeatRate}%`} sub="Have visited more than once" icon={<RefreshCw className="w-4 h-4 text-accent" />} />
          <AnalyticsCard label="Avg scheduled duration" value={`${stats.avgDuration} min`} sub="Per appointment" icon={<Clock className="w-4 h-4 text-primary" />} />
          <AnalyticsCard label="No-show rate" value={`${stats.noShowRate.toFixed(1)}%`} sub="This month" icon={<TrendingDown className="w-4 h-4 text-muted-foreground" />} delta={`${stats.noShowDelta >= 0 ? "+" : ""}${stats.noShowDelta.toFixed(1)}%`} deltaPositive={stats.noShowDelta <= 0} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <RevenueChart data={revenueChartData} total={stats.thisMonthRevenue} />
          <AppointmentChart data={appointmentChartData} />
        </div>
        <PatientGrowthChart data={patientGrowthData} />

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Top conditions treated</h3>
            {topConditions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No diagnosis data yet — this fills in as you write prescriptions.</p>
            ) : (
              <div className="space-y-3">
                {topConditions.map(({ label, count, pct }) => (
                  <div key={label} className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground w-28 flex-shrink-0 truncate" title={label}>{label}</p>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="font-['DM_Mono',monospace] text-sm text-foreground w-6 text-right">{count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Recent patient feedback</h3>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {recentReviews.map(r => (
                  <div key={r.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-foreground">Patient</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <svg key={j} className={`w-3 h-3 ${j < r.rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted"}`} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorShell>
  );
}