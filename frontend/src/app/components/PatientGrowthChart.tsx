import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { month: string; new: number; returning: number; total: number }[];
}

export default function PatientGrowthChart({ data }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="font-medium text-foreground">Patient Growth</h3>
        <p className="text-sm text-muted-foreground mt-0.5">New vs. returning patients, last 7 months</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,79,114,0.08)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "10px", fontSize: "12px" }} />
          <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} name="Total" />
          <Line type="monotone" dataKey="new" stroke="var(--color-accent)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="New" />
          <Line type="monotone" dataKey="returning" stroke="#94A3B8" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Returning" />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded" /> Total</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent rounded" /> New</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-muted-foreground/50 rounded" /> Returning</span>
      </div>
    </div>
  );
}