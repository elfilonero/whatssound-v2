"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/services/supabase";
import StatCard from "../../../components/dashboard/StatCard";

interface Alert {
  id: string;
  user_id: string;
  alert_level: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  user_name?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [stats, setStats] = useState({ active: 0, resolved: 0, avgResponse: "—" });

  useEffect(() => {
    async function load() {
      // Get alerts with user info
      const { data: alertsData } = await supabase
        .from("dok_alertas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const allAlerts = alertsData || [];

      // Get user names
      const userIds = [...new Set(allAlerts.map((a) => a.user_id))];
      const { data: usersData } = await supabase
        .from("dok_users")
        .select("id, name")
        .in("id", userIds);

      const userMap = new Map((usersData || []).map((u) => [u.id, u.name]));

      const enriched = allAlerts.map((a) => ({
        ...a,
        user_name: userMap.get(a.user_id) || "Desconocido",
      }));

      // Stats
      const active = enriched.filter((a) => !a.resolved).length;
      const resolved = enriched.filter((a) => a.resolved).length;

      // Avg response time for resolved alerts
      const responseTimes = enriched
        .filter((a) => a.resolved && a.resolved_at)
        .map((a) => {
          const created = new Date(a.created_at).getTime();
          const resolvedAt = new Date(a.resolved_at!).getTime();
          return (resolvedAt - created) / 60000; // minutes
        })
        .filter((t) => t > 0 && t < 1440); // less than 24h

      const avgMin = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

      setAlerts(enriched);
      setStats({
        active,
        resolved,
        avgResponse: avgMin > 0 ? `${avgMin} min` : "—",
      });
      setLoading(false);
    }
    load();
  }, []);

  const filtered = alerts.filter((a) => {
    if (filter === "active") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-600 animate-pulse">Cargando alertas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-emerald-800">🚨 Alertas</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Activas" value={stats.active} color={stats.active > 0 ? "red" : "green"} icon="⚠️" />
        <StatCard title="Resueltas" value={stats.resolved} color="green" icon="✅" />
        <StatCard title="Tiempo medio" value={stats.avgResponse} sub="resolución" color="blue" icon="⏱️" />
        <StatCard title="Total" value={alerts.length} sub="últimas 100" color="blue" icon="📊" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === f
                ? "bg-emerald-600 text-white"
                : "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {f === "all" ? "Todas" : f === "active" ? "⚠️ Activas" : "✅ Resueltas"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Estado</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Nivel</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Usuario</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Creada</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Resuelta</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert) => (
              <tr key={alert.id} className="border-t border-gray-50 hover:bg-emerald-50 transition">
                <td className="px-4 py-3">
                  <span className={`text-lg ${alert.resolved ? "opacity-50" : "animate-pulse"}`}>
                    {alert.resolved ? "✅" : "🔴"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    alert.alert_level?.includes("emergencia") ? "bg-red-100 text-red-700" :
                    alert.alert_level?.includes("3h") ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {alert.alert_level}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-800">{alert.user_name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(alert.created_at).toLocaleString("es-ES")}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {alert.resolved_at ? new Date(alert.resolved_at).toLocaleString("es-ES") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400">No hay alertas {filter !== "all" ? `${filter === "active" ? "activas" : "resueltas"}` : ""}</div>
        )}
      </div>
    </div>
  );
}
