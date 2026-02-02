"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/services/supabase";
import StatCard from "../../../components/dashboard/StatCard";

export default function RevenuePage() {
  const [stats, setStats] = useState({ free: 0, premium: 0, total: 0, mrr: 0, conversionRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("dok_users").select("subscription_tier");
      const users = data || [];
      const premium = users.filter((u) => u.subscription_tier === "premium").length;
      const free = users.length - premium;
      setStats({
        free,
        premium,
        total: users.length,
        mrr: premium * 2.99,
        conversionRate: users.length > 0 ? Math.round((premium / users.length) * 100) : 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-600 animate-pulse">Cargando revenue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-emerald-800">💳 Revenue</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="MRR" value={`€${stats.mrr.toFixed(2)}`} sub="Monthly Recurring Revenue" color="green" icon="💰" />
        <StatCard title="ARR" value={`€${(stats.mrr * 12).toFixed(2)}`} sub="Annual Recurring Revenue" color="green" icon="📅" />
        <StatCard title="Premium" value={stats.premium} sub={`${stats.conversionRate}% conversión`} color="purple" icon="⭐" />
        <StatCard title="Free" value={stats.free} color="blue" icon="👤" />
      </div>

      {/* Distribution */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6">
        <h3 className="text-lg font-bold text-emerald-700 mb-4">📊 Distribución de planes</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full flex items-center justify-center text-white text-xs font-bold transition-all"
              style={{ width: `${Math.max(stats.conversionRate, 5)}%` }}
            >
              {stats.conversionRate > 10 ? `${stats.conversionRate}%` : ""}
            </div>
          </div>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {stats.premium} premium / {stats.total} total
          </div>
        </div>
      </div>

      {/* Stripe placeholder */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center">
        <p className="text-4xl mb-4">🔗</p>
        <h3 className="text-lg font-bold text-emerald-700 mb-2">Integración Stripe</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Cuando se active Stripe, aquí verás pagos en tiempo real, facturas, suscripciones activas,
          pagos fallidos, y métricas de churn detalladas.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Referentes: Patrick Collison (Stripe) · Josh Pigford (Baremetrics) · Nick Franklin (ChartMogul)
        </p>
      </div>

      {/* Projections */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6">
        <h3 className="text-lg font-bold text-emerald-700 mb-4">🔮 Proyecciones</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-emerald-700">€{(stats.mrr * 3).toFixed(0)}</p>
            <p className="text-xs text-gray-500">MRR en 3 meses (al ritmo actual)</p>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">€{(stats.total * 0.1 * 2.99).toFixed(0)}</p>
            <p className="text-xs text-gray-500">MRR si 10% convierte</p>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">€{(stats.total * 0.25 * 2.99).toFixed(0)}</p>
            <p className="text-xs text-gray-500">MRR si 25% convierte</p>
          </div>
        </div>
      </div>
    </div>
  );
}
