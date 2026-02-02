"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "../../components/dashboard/StatCard";
import { supabase } from "../../lib/services/supabase";

interface Metrics {
  totalUsers: number;
  activeToday: number;
  activeLast7Days: number;
  newUsersLastWeek: number;
  checkInsToday: number;
  avgCheckInsLast7Days: number;
  actionDistribution: Record<string, number>;
  activeAlerts: number;
  alertsByLevel: Record<string, number>;
  resolvedToday: number;
  totalFamiliares: number;
  pushActive: number;
  freeCount: number;
  premiumCount: number;
  mrr: number;
  totalInvitations: number;
  usedInvitations: number;
  conversionRate: number;
}

async function fetchMetrics(): Promise<Metrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersRes, activeTodayRes, active7dRes, newUsersRes,
    checkInsTodayRes, checkIns7dRes,
    alertsActiveRes, alertsLevelRes, alertsResolvedRes,
    familiaresRes, pushRes,
    invitationsRes, subscriptionsRes,
  ] = await Promise.all([
    supabase.from("dok_users").select("*", { count: "exact", head: true }),
    supabase.from("dok_check_ins").select("user_id", { count: "exact" }).gte("created_at", todayStart),
    supabase.from("dok_check_ins").select("user_id").gte("created_at", weekAgo),
    supabase.from("dok_users").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("dok_check_ins").select("action").gte("created_at", todayStart),
    supabase.from("dok_check_ins").select("created_at").gte("created_at", weekAgo),
    supabase.from("dok_alertas").select("*", { count: "exact", head: true }).eq("resolved", false),
    supabase.from("dok_alertas").select("alert_level").eq("resolved", false),
    supabase.from("dok_alertas").select("*", { count: "exact", head: true }).eq("resolved", true).gte("resolved_at", todayStart),
    supabase.from("dok_familiares").select("*", { count: "exact", head: true }),
    supabase.from("dok_push_subscriptions").select("*", { count: "exact", head: true }),
    supabase.from("dok_invitations").select("status"),
    supabase.from("dok_users").select("subscription_tier"),
  ]);

  const activeTodaySet = new Set((activeTodayRes.data || []).map((r: Record<string, unknown>) => r.user_id));
  const active7dSet = new Set((active7dRes.data || []).map((r: Record<string, unknown>) => r.user_id));

  const actionDist: Record<string, number> = {};
  (checkInsTodayRes.data || []).forEach((r: Record<string, unknown>) => {
    const action = r.action as string;
    actionDist[action] = (actionDist[action] || 0) + 1;
  });

  const checkIns7dCount = (checkIns7dRes.data || []).length;
  const avgCheckIns = Math.round((checkIns7dCount / 7) * 10) / 10;

  const alertsByLevel: Record<string, number> = {};
  (alertsLevelRes.data || []).forEach((r: Record<string, unknown>) => {
    const level = r.alert_level as string;
    alertsByLevel[level] = (alertsByLevel[level] || 0) + 1;
  });

  const invitations = invitationsRes.data || [];
  const usedInv = invitations.filter((r: Record<string, unknown>) => r.status === "used" || r.status === "accepted").length;

  const subs = subscriptionsRes.data || [];
  const premiumCount = subs.filter((r: Record<string, unknown>) => r.subscription_tier === "premium").length;
  const freeCount = subs.length - premiumCount;

  return {
    totalUsers: usersRes.count || 0,
    activeToday: activeTodaySet.size,
    activeLast7Days: active7dSet.size,
    newUsersLastWeek: newUsersRes.count || 0,
    checkInsToday: (checkInsTodayRes.data || []).length,
    avgCheckInsLast7Days: avgCheckIns,
    actionDistribution: actionDist,
    activeAlerts: alertsActiveRes.count || 0,
    alertsByLevel,
    resolvedToday: alertsResolvedRes.count || 0,
    totalFamiliares: familiaresRes.count || 0,
    pushActive: pushRes.count || 0,
    freeCount,
    premiumCount,
    mrr: premiumCount * 2.99,
    totalInvitations: invitations.length,
    usedInvitations: usedInv,
    conversionRate: invitations.length > 0 ? Math.round((usedInv / invitations.length) * 100) : 0,
  };
}

const ACTION_LABELS: Record<string, string> = {
  alimentar: "🍽️ Alimentar",
  mimar: "💕 Mimar",
  jugar: "🎮 Jugar",
  alarm_dismiss: "⏰ Alarma",
};

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const m = await fetchMetrics();
      setMetrics(m);
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-600 text-lg animate-pulse">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-emerald-800">📊 Overview</h2>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total usuarios" value={metrics.totalUsers} icon="👤" color="blue" />
        <StatCard title="Activos hoy" value={metrics.activeToday} icon="✅" color="green" />
        <StatCard title="Check-ins hoy" value={metrics.checkInsToday} icon="🐾" color="green" />
        <StatCard
          title="Alertas activas"
          value={metrics.activeAlerts}
          icon="🚨"
          color={metrics.activeAlerts > 5 ? "red" : metrics.activeAlerts > 0 ? "yellow" : "green"}
        />
      </div>

      {/* Usuarios */}
      <div>
        <h3 className="text-lg font-bold text-emerald-700 mb-3">👤 Usuarios</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Activos 7 días" value={metrics.activeLast7Days} color="green" />
          <StatCard title="Nuevos esta semana" value={metrics.newUsersLastWeek} color="blue" />
          <StatCard title="Familiares" value={metrics.totalFamiliares} color="blue" />
          <StatCard title="Push activo" value={metrics.pushActive} color="green" />
        </div>
      </div>

      {/* Check-ins */}
      <div>
        <h3 className="text-lg font-bold text-emerald-700 mb-3">✅ Check-ins</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Media/día (7d)" value={metrics.avgCheckInsLast7Days} color="blue" />
          {Object.entries(metrics.actionDistribution).map(([action, count]) => (
            <StatCard key={action} title={ACTION_LABELS[action] || action} value={count} sub="hoy" color="green" />
          ))}
        </div>
      </div>

      {/* Alertas */}
      <div>
        <h3 className="text-lg font-bold text-emerald-700 mb-3">🚨 Alertas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.alertsByLevel).map(([level, count]) => (
            <StatCard
              key={level}
              title={level}
              value={count}
              color={level.includes("emergencia") ? "red" : level.includes("3h") ? "yellow" : "blue"}
            />
          ))}
          <StatCard title="Resueltas hoy" value={metrics.resolvedToday} color="green" />
        </div>
      </div>

      {/* Invitaciones y Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-emerald-700 mb-3">✉️ Invitaciones</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total" value={metrics.totalInvitations} color="blue" />
            <StatCard title="Usadas" value={metrics.usedInvitations} color="green" />
            <StatCard title="Conversión" value={`${metrics.conversionRate}%`} color={metrics.conversionRate > 50 ? "green" : "yellow"} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-700 mb-3">💳 Suscripciones</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Free" value={metrics.freeCount} color="blue" />
            <StatCard title="Premium" value={metrics.premiumCount} color="green" />
            <StatCard title="MRR" value={`€${metrics.mrr.toFixed(2)}`} sub="Monthly Recurring Revenue" color="green" />
          </div>
        </div>
      </div>
    </div>
  );
}
