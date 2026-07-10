import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { month: string; revenue: number }[];
  total: number;
}

export default function RevenueChart({ data, total }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-medium text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Consultation fees, last 7 months</p>
        </div>
        <p className="font-['Fraunces',serif] text-2xl font-semibold text-foreground">₹{total.toLocaleString()}</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,79,114,0.08)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "10px", fontSize: "12px" }}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revGradient)" name="Revenue" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}