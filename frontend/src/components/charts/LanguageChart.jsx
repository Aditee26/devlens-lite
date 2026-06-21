import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const FALLBACK_COLORS = ["#6d4cf5","#10b981","#f59e0b","#3b82f6","#ec4899","#14b8a6","#f97316","#8b5cf6"];

export default function LanguageChart({ data = [] }) {
  if (!data.length) return <p className="text-xs text-gray-400 text-center py-8">No language data</p>;

  const chartData = data.slice(0, 8).map((d, i) => ({
    name: d.language,
    value: d.percentage,
    color: d.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
          paddingAngle={2} dataKey="value">
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [`${v}%`]}
          contentStyle={{ background: "var(--tw-bg)", border: "1px solid #333", borderRadius: 12, fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
