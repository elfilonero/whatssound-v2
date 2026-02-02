"use client";

import { useState } from "react";
import { supabase } from "../../../lib/services/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Queries that the IA can execute
async function executeQuery(query: string): Promise<string> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const q = query.toLowerCase();

  if (q.includes("usuario") || q.includes("users") || q.includes("cuántos")) {
    const { count } = await supabase.from("dok_users").select("*", { count: "exact", head: true });
    const { data: active } = await supabase.from("dok_check_ins").select("user_id").gte("created_at", todayStart);
    const activeSet = new Set((active || []).map((r) => r.user_id));
    return `📊 Usuarios totales: ${count || 0}\n✅ Activos hoy: ${activeSet.size}`;
  }

  if (q.includes("alerta") || q.includes("alert")) {
    const { count: active } = await supabase.from("dok_alertas").select("*", { count: "exact", head: true }).eq("resolved", false);
    const { count: resolved } = await supabase.from("dok_alertas").select("*", { count: "exact", head: true }).eq("resolved", true);
    return `🚨 Alertas activas: ${active || 0}\n✅ Resueltas: ${resolved || 0}`;
  }

  if (q.includes("check-in") || q.includes("checkin") || q.includes("actividad")) {
    const { data } = await supabase.from("dok_check_ins").select("action").gte("created_at", todayStart);
    const actions: Record<string, number> = {};
    (data || []).forEach((r) => { actions[r.action] = (actions[r.action] || 0) + 1; });
    const lines = Object.entries(actions).map(([a, c]) => `  ${a}: ${c}`).join("\n");
    return `✅ Check-ins hoy: ${(data || []).length}\n${lines || "  Sin actividad"}`;
  }

  if (q.includes("racha") || q.includes("streak") || q.includes("engagement")) {
    const { data } = await supabase.from("dok_users").select("streak_days");
    const streaks = (data || []).map((u) => u.streak_days || 0);
    const avg = streaks.length > 0 ? (streaks.reduce((a, b) => a + b, 0) / streaks.length).toFixed(1) : "0";
    const max = Math.max(0, ...streaks);
    return `🔥 Racha media: ${avg} días\n🏆 Racha máxima: ${max} días`;
  }

  if (q.includes("revenue") || q.includes("premium") || q.includes("ingreso") || q.includes("dinero")) {
    const { data } = await supabase.from("dok_users").select("subscription_tier");
    const premium = (data || []).filter((u) => u.subscription_tier === "premium").length;
    const mrr = premium * 2.99;
    return `💳 Premium: ${premium}\n💰 MRR: €${mrr.toFixed(2)}\n📅 ARR: €${(mrr * 12).toFixed(2)}`;
  }

  if (q.includes("familia") || q.includes("familiar")) {
    const { count } = await supabase.from("dok_familiares").select("*", { count: "exact", head: true });
    return `👨‍👩‍👧 Familiares registrados: ${count || 0}`;
  }

  if (q.includes("semana") || q.includes("week")) {
    const { data } = await supabase.from("dok_users").select("*", { count: "exact", head: true }).gte("created_at", weekAgo);
    const { data: ci } = await supabase.from("dok_check_ins").select("user_id").gte("created_at", weekAgo);
    const activeWeek = new Set((ci || []).map((r) => r.user_id));
    return `📊 Nuevos esta semana: ${data?.length || 0}\n✅ Activos esta semana: ${activeWeek.size}`;
  }

  return "Puedo ayudarte con información sobre: usuarios, alertas, check-ins, rachas, revenue, familiares, o resumen semanal. ¿Qué quieres saber?";
}

const SUGGESTIONS = [
  "¿Cuántos usuarios tenemos?",
  "¿Cómo van las alertas?",
  "¿Cuál es la racha media?",
  "¿Cuánto revenue tenemos?",
  "¿Actividad de hoy?",
  "Resumen semanal",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hola, soy Leo, el analista IA de Dame un OK. Tengo acceso a todas las métricas en tiempo real. Pregúntame lo que quieras sobre usuarios, alertas, engagement, o revenue.\n\n_Referentes: Dario Amodei (honestidad) · Harrison Chase (consultas) · Guillermo Rauch (streaming)_",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(text?: string) {
    const msg = text || input;
    if (!msg.trim()) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await executeQuery(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Error al consultar los datos. Inténtalo de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h2 className="text-2xl font-black text-emerald-800 mb-4">🤖 Chat IA — Leo</h2>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-2xl border border-emerald-100 p-4 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
              msg.role === "user"
                ? "bg-emerald-600 text-white rounded-br-md"
                : "bg-emerald-50 text-emerald-800 rounded-bl-md"
            }`}>
              {msg.role === "assistant" && <span className="text-lg mr-2">🦁</span>}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl rounded-bl-md text-sm animate-pulse">
              🦁 Consultando datos...
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-700 hover:bg-emerald-100 transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pregúntale algo a Leo..."
          className="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
