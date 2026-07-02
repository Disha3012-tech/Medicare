import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DATA = [
  { month: "Jan", new: 8, returning: 18, total: 26 },
  { month: "Feb", new: 11, returning: 21, total: 32 },
  { month: "Mar", new: 9, returning: 20, total: 29 },
  { month: "Apr", new: 14, returning: 24, total: 38 },
  { month: "May", new: 12, returning: 22, total: 34 },
  { month: "Jun", new: 17, returning: 28, total: 45 },
  { month: "Jul", new: 15, returning: 27, total: 42 },
];

export default function PatientGrowthChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="font-medium text-foreground">Patient Growth</h3>
        <p className="text-sm text-muted-foreground mt-0.5">New vs. returning patients</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,79,114,0.08)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} />
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
