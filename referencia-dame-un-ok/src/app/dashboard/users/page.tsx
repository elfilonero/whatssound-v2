"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/services/supabase";
import StatCard from "../../../components/dashboard/StatCard";

interface User {
  id: string;
  name: string;
  country: string;
  created_at: string;
  subscription_tier: string;
  pet_name: string;
  pet_type: string;
  streak_days: number;
  last_check_in?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userCheckIns, setUserCheckIns] = useState<Record<string, unknown>[]>([]);
  const [userAlerts, setUserAlerts] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("dok_users")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    async function loadDetails() {
      const [checkIns, alerts] = await Promise.all([
        supabase
          .from("dok_check_ins")
          .select("*")
          .eq("user_id", selectedUser!.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("dok_alertas")
          .select("*")
          .eq("user_id", selectedUser!.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setUserCheckIns(checkIns.data || []);
      setUserAlerts(alerts.data || []);
    }
    loadDetails();
  }, [selectedUser]);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.country?.toLowerCase().includes(search.toLowerCase()) ||
      u.pet_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-600 animate-pulse">Cargando usuarios...</p>
      </div>
    );
  }

  // Detail view
  if (selectedUser) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedUser(null)}
          className="text-emerald-600 font-semibold hover:underline"
        >
          ← Volver a la lista
        </button>

        <div className="bg-white rounded-2xl border border-emerald-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl">
              {selectedUser.pet_type === "gato" ? "🐱" : selectedUser.pet_type === "perro" ? "🐶" : "🐾"}
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-800">{selectedUser.name}</h2>
              <p className="text-sm text-gray-500">
                {selectedUser.country} · Desde {new Date(selectedUser.created_at).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Mascota" value={selectedUser.pet_name || "—"} color="green" />
            <StatCard title="Racha" value={`${selectedUser.streak_days || 0} días`} color="blue" />
            <StatCard title="Plan" value={selectedUser.subscription_tier || "free"} color={selectedUser.subscription_tier === "premium" ? "green" : "blue"} />
            <StatCard title="Check-ins" value={userCheckIns.length} sub="últimos 20" color="green" />
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6">
          <h3 className="text-lg font-bold text-emerald-700 mb-4">📋 Últimos check-ins</h3>
          {userCheckIns.length === 0 ? (
            <p className="text-gray-400">Sin check-ins</p>
          ) : (
            <div className="space-y-2">
              {userCheckIns.map((ci, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg">
                    {ci.action === "alimentar" ? "🍽️" : ci.action === "mimar" ? "💕" : ci.action === "jugar" ? "🎮" : "⏰"}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{ci.action as string}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(ci.created_at as string).toLocaleString("es-ES")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6">
          <h3 className="text-lg font-bold text-emerald-700 mb-4">🚨 Alertas</h3>
          {userAlerts.length === 0 ? (
            <p className="text-gray-400">Sin alertas</p>
          ) : (
            <div className="space-y-2">
              {userAlerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    (a.alert_level as string)?.includes("emergencia") ? "bg-red-100 text-red-700" :
                    (a.alert_level as string)?.includes("3h") ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {a.alert_level as string}
                  </span>
                  <span className={`text-xs font-semibold ${a.resolved ? "text-green-600" : "text-red-500"}`}>
                    {a.resolved ? "✅ Resuelta" : "⚠️ Activa"}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(a.created_at as string).toLocaleString("es-ES")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-emerald-800">👤 Usuarios</h2>
        <span className="text-sm text-gray-400">{filtered.length} usuarios</span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Buscar por nombre, país o mascota..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Nombre</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">País</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Mascota</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Racha</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Plan</th>
              <th className="text-left px-4 py-3 font-bold text-emerald-700">Registro</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="border-t border-gray-50 hover:bg-emerald-50 cursor-pointer transition"
              >
                <td className="px-4 py-3 font-semibold text-emerald-800">{user.name || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{user.country || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{user.pet_name || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${(user.streak_days || 0) > 7 ? "text-emerald-600" : "text-gray-500"}`}>
                    {user.streak_days || 0} días
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    user.subscription_tier === "premium" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {user.subscription_tier || "free"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(user.created_at).toLocaleDateString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
