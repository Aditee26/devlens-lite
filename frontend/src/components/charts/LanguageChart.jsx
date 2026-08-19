import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const PALETTE = ["#3a3733", "#4a5fa0", "#8c887f", "#b7b4ad", "#647cba", "#d8d6d1", "#233a49", "#6b675e"];

export default function LanguageChart({ data = [] }) {
  if (!data.length) return <p className="text-xs text-ink-400 text-center py-8">No language data</p>;

  const chartData = data.slice(0, 8).map((d, i) => ({
    name: d.language,
    value: d.percentage,
    color: d.color || PALETTE[i % PALETTE.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={0} outerRadius={85}
          paddingAngle={1} dataKey="value">
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="var(--tw-bg-opacity,1)" strokeWidth={1} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [`${v}%`]}
          contentStyle={{ background: "#ffffff", border: "1px solid #e5e3de", borderRadius: 4, fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-xs text-ink-500 dark:text-ink-400">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
