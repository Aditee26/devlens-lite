import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ActivityChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6d4cf5" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6d4cf5" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="_id" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: "#d1d5db" }}
        />
        <Area type="monotone" dataKey="count" stroke="#6d4cf5" strokeWidth={2} fill="url(#colorActivity)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
