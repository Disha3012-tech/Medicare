import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DATA = [
  { week: "Jun 2", total: 28, completed: 25, cancelled: 3 },
  { week: "Jun 9", total: 32, completed: 29, cancelled: 3 },
  { week: "Jun 16", total: 30, completed: 27, cancelled: 3 },
  { week: "Jun 23", total: 35, completed: 31, cancelled: 4 },
  { week: "Jun 30", total: 38, completed: 35, cancelled: 3 },
  { week: "Jul 7", total: 42, completed: 38, cancelled: 4 },
];

export default function AppointmentChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="font-medium text-foreground">Appointment Volume</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Weekly breakdown, last 6 weeks</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={DATA} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,79,114,0.08)" vertical={false} />
          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5E7A96", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "10px", fontSize: "12px" }} />
          <Bar dataKey="completed" stackId="a" fill="var(--color-accent)" radius={[0, 0, 0, 0]} name="Completed" />
          <Bar dataKey="cancelled" stackId="a" fill="var(--color-destructive)" radius={[6, 6, 0, 0]} name="Cancelled" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent inline-block" /> Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-destructive inline-block" /> Cancelled</span>
      </div>
    </div>
  );
}
