"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/services/supabase";
import StatCard from "../../../components/dashboard/StatCard";

interface EngagementMetrics {
  avgStreak: number;
  maxStreak: number;
  completionRate: number;
  activeRate: number;
  actionBreakdown: Record<string, number>;
  dailyActivity: { date: string; count: number }[];
  retentionD1: number;
  retentionD7: number;
  retentionD30: number;
}

export default function EngagementPage() {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const [usersRes, checkInsRes, todayCheckIns] = await Promise.all([
        supabase.from("dok_users").select("id, streak_days, created_at"),
        supabase.from("dok_check_ins").select("user_id, action, created_at").gte("created_at", thirtyDaysAgo),
        supabase.from("dok_check_ins").select("user_id, action").gte("created_at", todayStart),
      ]);

      const users = usersRes.data || [];
      const checkIns = checkInsRes.data || [];
      const todayCI = todayCheckIns.data || [];

      // Streaks
      const streaks = users.map((u) => u.streak_days || 0);
      const avgStreak = streaks.length > 0 ? Math.round((streaks.reduce((a, b) => a + b, 0) / streaks.length) * 10) / 10 : 0;
      const maxStreak = Math.max(0, ...streaks);

      // Completion rate (users who did all 3 actions today)
      const userActions: Record<string, Set<string>> = {};
      todayCI.forEach((ci) => {
        if (!userActions[ci.user_id]) userActions[ci.user_id] = new Set();
        userActions[ci.user_id].add(ci.action);
      });
      const usersWithAllActions = Object.values(userActions).filter((actions) => actions.size >= 3).length;
      const activeUsersToday = Object.keys(userActions).length;
      const completionRate = activeUsersToday > 0 ? Math.round((usersWithAllActions / activeUsersToday) * 100) : 0;
      const activeRate = users.length > 0 ? Math.round((activeUsersToday / users.length) * 100) : 0;

      // Action breakdown (30 days)
      const actionBreakdown: Record<string, number> = {};
      checkIns.forEach((ci) => {
        actionBreakdown[ci.action] = (actionBreakdown[ci.action] || 0) + 1;
      });

      // Daily activity (30 days)
      const dailyMap: Record<string, number> = {};
      checkIns.forEach((ci) => {
        const date = ci.created_at.split("T")[0];
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });
      const dailyActivity = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));

      // Retention (simplified)
      const d1Users = users.filter((u) => {
        const created = new Date(u.created_at);
        const dayAfter = new Date(created.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        return checkIns.some((ci) => ci.user_id === u.id && ci.created_at.startsWith(dayAfter));
      });
      const d7Users = users.filter((u) => {
        const created = new Date(u.created_at);
        const weekAfter = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        return checkIns.some((ci) => ci.user_id === u.id && ci.created_at.startsWith(weekAfter));
      });
      const d30Users = users.filter((u) => {
        const created = new Date(u.created_at);
        const monthAfter = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        return checkIns.some((ci) => ci.user_id === u.id && ci.created_at.startsWith(monthAfter));
      });

      const eligibleD1 = users.filter((u) => new Date(u.created_at).getTime() < now.getTime() - 24 * 60 * 60 * 1000).length;
      const eligibleD7 = users.filter((u) => new Date(u.created_at).getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000).length;
      const eligibleD30 = users.filter((u) => new Date(u.created_at).getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000).length;

      setMetrics({
        avgStreak,
        maxStreak,
        completionRate,
        activeRate,
        actionBreakdown,
        dailyActivity,
        retentionD1: eligibleD1 > 0 ? Math.round((d1Users.length / eligibleD1) * 100) : 0,
        retentionD7: eligibleD7 > 0 ? Math.round((d7Users.length / eligibleD7) * 100) : 0,
        retentionD30: eligibleD30 > 0 ? Math.round((d30Users.length / eligibleD30) * 100) : 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-600 animate-pulse">Analizando engagement...</p>
      </div>
    );
  }

  const ACTION_LABELS: Record<string, string> = {
    alimentar: "🍽️ Alimentar",
    mimar: "💕 Mimar",
    jugar: "🎮 Jugar",
    alarm_dismiss: "⏰ Alarma",
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-emerald-800">📈 Engagement</h2>

      {/* Rachas */}
      <div>
        <h3 className="text-lg font-bold text-emerald-700 mb-3">🔥 Rachas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Racha media" value={`${metrics.avgStreak} días`} color="green" icon="🔥" />
          <StatCard title="Racha máxima" value={`${metrics.maxStreak} días`} color="purple" icon="🏆" />
          <StatCard title="Tasa completación" value={`${metrics.completionRate}%`} sub="3 acciones hoy" color={metrics.completionRate > 50 ? "green" : "yellow"} />
          <StatCard title="Tasa actividad" value={`${metrics.activeRate}%`} sub="activos hoy / total" color={metrics.activeRate > 30 ? "green" : "yellow"} />
        </div>
      </div>

      {/* Acciones 30d */}
      <div>
        <h3 className="text-lg font-bold text-emerald-700 mb-3">🎯 Acciones (30 días)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.actionBreakdown).map(([action, count]) => (
            <StatCard key={action} title={ACTION_LABELS[action] || action} value={count} color="green" />
          ))}
        </div>
      </div>

      {/* Retención */}
      <div>
        <h3 className="text-lg font-bold text-emerald-700 mb-3">📊 Retención</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            title="D1"
            value={`${metrics.retentionD1}%`}
            sub="Vuelven al día siguiente"
            color={metrics.retentionD1 > 40 ? "green" : "yellow"}
            icon="1️⃣"
          />
          <StatCard
            title="D7"
            value={`${metrics.retentionD7}%`}
            sub="Vuelven a la semana"
            color={metrics.retentionD7 > 20 ? "green" : "yellow"}
            icon="7️⃣"
          />
          <StatCard
            title="D30"
            value={`${metrics.retentionD30}%`}
            sub="Vuelven al mes"
            color={metrics.retentionD30 > 10 ? "green" : "red"}
            icon="3️⃣"
          />
        </div>
      </div>

      {/* Actividad diaria */}
      <div>
        <h3 className="text-lg font-bold text-emerald-700 mb-3">📅 Actividad diaria (30 días)</h3>
        <div className="bg-white rounded-2xl border border-emerald-100 p-6">
          <div className="flex items-end gap-1 h-40">
            {metrics.dailyActivity.map((day) => {
              const maxCount = Math.max(...metrics.dailyActivity.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400">{day.count}</span>
                  <div
                    className="w-full bg-emerald-400 rounded-t-sm min-h-[2px] transition-all"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-400">
              {metrics.dailyActivity[0]?.date.slice(5) || ""}
            </span>
            <span className="text-[10px] text-gray-400">
              {metrics.dailyActivity[metrics.dailyActivity.length - 1]?.date.slice(5) || ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
