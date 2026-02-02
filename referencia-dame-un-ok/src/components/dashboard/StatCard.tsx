"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon?: string;
  trend?: { value: number; label: string };
  color?: "green" | "yellow" | "red" | "blue" | "purple";
}

const COLORS = {
  green: "bg-emerald-50 border-emerald-200 text-emerald-700",
  yellow: "bg-amber-50 border-amber-200 text-amber-700",
  red: "bg-red-50 border-red-200 text-red-700",
  blue: "bg-sky-50 border-sky-200 text-sky-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

export default function StatCard({ title, value, sub, icon, trend, color = "green" }: StatCardProps) {
  return (
    <div className={`rounded-2xl border-2 p-5 ${COLORS[color]} transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold opacity-70 uppercase tracking-wide">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-4xl font-black mt-2">{value}</p>
      <div className="flex items-center justify-between mt-2">
        {sub && <p className="text-xs opacity-60">{sub}</p>}
        {trend && (
          <p className={`text-xs font-bold ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
