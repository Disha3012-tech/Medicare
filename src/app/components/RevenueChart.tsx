import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DATA = [
  { month: "Jan", revenue: 18400, target: 16000 },
  { month: "Feb", revenue: 21200, target: 18000 },
  { month: "Mar", revenue: 19800, target: 18000 },
  { month: "Apr", revenue: 24600, target: 20000 },
  { month: "May", revenue: 22100, target: 20000 },
  { month: "Jun", revenue: 27800, target: 24000 },
  { month: "Jul", revenue: 26300, target: 24000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-medium text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Consultation fees, Jan–Jul 2026</p>
        </div>
        <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">$27,800</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,79,114,0.08)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "10px", fontSize: "12px" }}
          />
          <Area type="monotone" dataKey="target" stroke="var(--color-accent)" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#targetGradient)" name="Target" />
          <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revGradient)" name="Revenue" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded" /> Revenue</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent rounded" style={{ borderStyle: "dashed" }} /> Target</span>
      </div>
    </div>
  );
}
