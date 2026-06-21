import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function MetricsRadarChart({ metrics }) {
  const data = [
    { subject: "Complexity", value: metrics?.complexityScore ?? 0 },
    { subject: "Debt",       value: metrics?.technicalDebt   ?? 0 },
    { subject: "Files",      value: Math.min(100, ((metrics?.totalFiles ?? 0) / 5)) },
    { subject: "LOC",        value: Math.min(100, ((metrics?.totalLines ?? 0) / 1000)) },
    { subject: "Languages",  value: Math.min(100, (metrics?.languageStats?.length ?? 0) * 15) },
    { subject: "Deps",       value: Math.min(100, (metrics?.largestFiles?.length ?? 0) * 10) },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Radar name="Score" dataKey="value" stroke="#6d4cf5" fill="#6d4cf5" fillOpacity={0.3} />
        <Tooltip
          contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
          formatter={(v) => [`${Math.round(v)}`]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
