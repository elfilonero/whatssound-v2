"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/services/supabase";
import { ADMIN_SECRET } from "../../lib/constants";

const SECRET_KEY = ADMIN_SECRET;

interface Metrics {
  // Users
  totalUsers: number;
  activeToday: number;
  activeLast7Days: number;
  newUsersLastWeek: number;
  // Check-ins
  checkInsToday: number;
  avgCheckInsLast7Days: number;
  actionDistribution: Record<string, number>;
  // Alerts
  activeAlerts: number;
  alertsByLevel: Record<string, number>;
  resolvedToday: number;
  // Family
  totalFamiliares: number;
  pushActive: number;
  viewersActive: number;
  // Invitations
  totalInvitations: number;
  usedInvitations: number;
  pendingInvitations: number;
  conversionRate: number;
  // Subscriptions
  freeCount: number;
  premiumCount: number;
  mrr: number;
}

function Card({ title, value, sub, color = "green" }: { title: string; value: string | number; sub?: string; color?: "green" | "yellow" | "red" | "blue" }) {
  const colors = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    yellow: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
    blue: "bg-sky-50 border-sky-200 text-sky-700",
  };
  return (
    <div className={`rounded-2xl border-2 p-5 ${colors[color]}`}>
      <p className="text-sm font-semibold opacity-70 uppercase tracking-wide">{title}</p>
      <p className="text-4xl font-black mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-emerald-800 mb-3 border-b border-emerald-200 pb-1">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

async function fetchMetrics(): Promise<Metrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Parallel queries
  const [
    usersRes,
    activeTodayRes,
    active7dRes,
    newUsersRes,
    checkInsTodayRes,
    checkIns7dRes,
    alertsActiveRes,
    alertsLevelRes,
    alertsResolvedRes,
    familiaresRes,
    pushRes,
    viewersRes,
    invitationsRes,
    subscriptionsRes,
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
    supabase.from("dok_familiares").select("*", { count: "exact", head: true }).eq("role", "viewer"),
    supabase.from("dok_invitations").select("status"),
    supabase.from("dok_users").select("subscription_tier"),
  ]);

  // Active today (distinct)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeTodaySet = new Set((activeTodayRes.data || []).map((r: Record<string, any>) => r.user_id));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const active7dSet = new Set((active7dRes.data || []).map((r: Record<string, any>) => r.user_id));

  // Action distribution
  const actionDist: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (checkInsTodayRes.data || []).forEach((r: Record<string, any>) => {
    actionDist[r.action] = (actionDist[r.action] || 0) + 1;
  });

  // Avg check-ins/day last 7 days
  const checkIns7dCount = (checkIns7dRes.data || []).length;
  const avgCheckIns = Math.round((checkIns7dCount / 7) * 10) / 10;

  // Alerts by level
  const alertsByLevel: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (alertsLevelRes.data || []).forEach((r: Record<string, any>) => {
    alertsByLevel[r.alert_level] = (alertsByLevel[r.alert_level] || 0) + 1;
  });

  // Invitations
  const invitations = invitationsRes.data || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usedInv = invitations.filter((r: Record<string, any>) => r.status === "used" || r.status === "accepted").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingInv = invitations.filter((r: Record<string, any>) => r.status === "pending").length;

  // Subscriptions
  const subs = subscriptionsRes.data || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const premiumCount = subs.filter((r: Record<string, any>) => r.subscription_tier === "premium").length;
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
    viewersActive: viewersRes.count || 0,
    totalInvitations: invitations.length,
    usedInvitations: usedInv,
    pendingInvitations: pendingInv,
    conversionRate: invitations.length > 0 ? Math.round((usedInv / invitations.length) * 100) : 0,
    freeCount,
    premiumCount,
    mrr: premiumCount * 2.99, // Assuming €2.99/mo premium
  };
}

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async () => {
    try {
      const m = await fetchMetrics();
      setMetrics(m);
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (key !== SECRET_KEY) return;
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [key, load]);

  if (key !== SECRET_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-400 text-lg">🔒 Acceso denegado</p>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <p className="text-emerald-600 text-lg animate-pulse">Cargando métricas...</p>
      </div>
    );
  }

  const actionLabels: Record<string, string> = {
    alimentar: "🍽️ Alimentar",
    mimar: "💕 Mimar",
    jugar: "🎮 Jugar",
    alarm_dismiss: "⏰ Alarma",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-emerald-800">📊 Dame un OK — Admin</h1>
            <p className="text-sm text-emerald-600 mt-1">
              Última actualización: {lastRefresh.toLocaleTimeString("es-ES")} · Auto-refresh 60s
            </p>
          </div>
          <button onClick={load} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
            🔄 Refrescar
          </button>
        </div>

        <Section title="👤 Usuarios">
          <Card title="Total registrados" value={metrics.totalUsers} color="blue" />
          <Card title="Activos hoy" value={metrics.activeToday} color="green" />
          <Card title="Activos 7 días" value={metrics.activeLast7Days} color="green" />
          <Card title="Nuevos esta semana" value={metrics.newUsersLastWeek} color="blue" />
        </Section>

        <Section title="✅ Check-ins">
          <Card title="Hoy" value={metrics.checkInsToday} color="green" />
          <Card title="Media/día (7d)" value={metrics.avgCheckInsLast7Days} color="blue" />
          {Object.entries(metrics.actionDistribution).map(([action, count]) => (
            <Card key={action} title={actionLabels[action] || action} value={count} color="green" sub="hoy" />
          ))}
        </Section>

        <Section title="🚨 Alertas">
          <Card
            title="Activas ahora"
            value={metrics.activeAlerts}
            color={metrics.activeAlerts > 5 ? "red" : metrics.activeAlerts > 0 ? "yellow" : "green"}
          />
          {Object.entries(metrics.alertsByLevel).map(([level, count]) => (
            <Card
              key={level}
              title={level}
              value={count}
              color={level.includes("emergencia") ? "red" : level.includes("3h") ? "yellow" : "blue"}
            />
          ))}
          <Card title="Resueltas hoy" value={metrics.resolvedToday} color="green" />
        </Section>

        <Section title="👨‍👩‍👧 Familiares">
          <Card title="Total registrados" value={metrics.totalFamiliares} color="blue" />
          <Card title="Push activo" value={metrics.pushActive} color="green" />
          <Card title="Viewers" value={metrics.viewersActive} color="blue" />
        </Section>

        <Section title="✉️ Invitaciones">
          <Card title="Total generadas" value={metrics.totalInvitations} color="blue" />
          <Card title="Usadas" value={metrics.usedInvitations} color="green" />
          <Card title="Pendientes" value={metrics.pendingInvitations} color="yellow" />
          <Card title="Conversión" value={`${metrics.conversionRate}%`} color={metrics.conversionRate > 50 ? "green" : "yellow"} />
        </Section>

        <Section title="💳 Suscripciones">
          <Card title="Free" value={metrics.freeCount} color="blue" />
          <Card title="Premium" value={metrics.premiumCount} color="green" />
          <Card title="MRR" value={`€${metrics.mrr.toFixed(2)}`} color="green" sub="Monthly Recurring Revenue" />
        </Section>
      </div>
    </div>
  );
}
