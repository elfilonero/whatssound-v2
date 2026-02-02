"use client";
import { useState } from "react";
import { ALERT_CONFIG } from "../../lib/constants/alerts";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { PET_AVATARS } from "../../lib/constants/pets";
import ScheduleEditor from "./ScheduleEditor";

interface Props {
  estado: string;
  lastCheckIn?: string | null;
  streak?: number;
  userName?: string;
  userFullName?: string;
  userId?: string;
  userPhone?: string;
  dndUntil?: string | null; // kept in interface for compatibility
  batteryLow?: boolean;
  lastLat?: number | null;
  lastLng?: number | null;
  todayActions?: { action: string; time: string }[];
}

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Sin actividad";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

const ACTION_LABELS: Record<string, { emoji: string; label: string }> = {
  alimentar: { emoji: "🍽️", label: "Alimentar" },
  mimar: { emoji: "❤️", label: "Mimar" },
  jugar: { emoji: "🎮", label: "Jugar" },
  alarm_dismiss: { emoji: "✅", label: "OK diario" },
  force_wake: { emoji: "🍽️", label: "Pedido de comida" },
};

export default function TabInicio({ estado, lastCheckIn, streak: streakProp, userName, userFullName, userId, userPhone, batteryLow, lastLat, lastLng, todayActions }: Props) {
  const config = ALERT_CONFIG[estado as keyof typeof ALERT_CONFIG] || ALERT_CONFIG.ok;
  const streak = streakProp ?? 0;
  const displayName = userName || "Usuario";
  const displayFullName = userFullName || "";
  const isOk = estado === "ok";
  const isEmergency = estado === "alerta3h" || estado === "emergencia6h";
  const [verificando, setVerificando] = useState(false);

  // isDnd removed — not shown to familiar

  const [wakeConfirm, setWakeConfirm] = useState("");
  const handleVerificarAhora = async () => {
    if (!userId || verificando) return;
    setVerificando(true);
    setWakeConfirm("");
    try {
      const res = await fetch("/api/force-wake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, durationMinutes: 30 }),
      });
      const data = await res.json();
      if (data.ok) {
        setWakeConfirm(data.pushSent ? "🔔 Has pedido a " + (displayName || "el usuario") + " que alimente a Fufy" : "🔔 Has pedido a " + (displayName || "el usuario") + " que alimente a Fufy");
      } else {
        setWakeConfirm("❌ Error: " + (data.error || "desconocido"));
      }
    } catch (e) {
      void e;
      setWakeConfirm("❌ Error de conexión");
    }
    setVerificando(false);
    setTimeout(() => setWakeConfirm(""), 5000);
  };

  const handleCall = () => {
    if (userPhone) {
      window.open("tel:" + userPhone);
    } else {
      alert("Sin teléfono configurado");
    }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
      {/* DND badge removed — familiar should not see this */}

      {/* Battery low warning */}
      {batteryLow && (
        <div style={{
          background: "#fef3c7", borderRadius: 14, padding: "12px 16px", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#92400e", margin: 0 }}>
            Batería baja en el dispositivo del usuario
          </p>
        </div>
      )}

      {/* Familiar card */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#999"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a8 8 0 0 0-16 0v2"/></svg>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#2d3436", margin: 0 }}>{displayName}</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#888", margin: 0 }}>{displayFullName}</p>
          </div>
        </div>
        <Badge icon={config.icon} text={config.badge} bgColor={config.badgeBg} />
      </Card>

      {/* Avatar card */}
      <Card padding="20px 16px" style={{ textAlign: "center" }}>
        <div style={{ margin: "0 auto 10px", width: 120, height: 120, position: "relative" }}>
          <img
            src={
              estado === "ok" ? PET_AVATARS.euforico
              : estado === "alerta1h" ? PET_AVATARS.esperando
              : estado === "alerta3h" ? PET_AVATARS.triste
              : estado === "emergencia6h" ? PET_AVATARS.enfermo
              : PET_AVATARS.esperando
            }
            alt="Fufy"
            style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.15))" }}
          />
        </div>
        <p style={{ fontSize: 22, fontWeight: 800, color: "#2d3436", margin: "0 0 2px" }}>Fufy</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#888", margin: 0 }}>{streak} días seguidos ⭐</p>
      </Card>

      {/* Verificar ahora button + Ultima actividad */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 4px" }}>Ultima actividad</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: isOk ? "#22c55e" : "#ef4444", margin: 0 }}>
              {formatTime(lastCheckIn)}
            </p>
          </div>
        </div>
        {todayActions && todayActions.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#666", margin: "0 0 6px" }}>Acciones de hoy:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {todayActions.map((a, i) => {
                const cfg = ACTION_LABELS[a.action] || { emoji: "•", label: a.action };
                const t = new Date(a.time);
                const hh = t.getHours().toString().padStart(2, "0");
                const mm = t.getMinutes().toString().padStart(2, "0");
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <span>{cfg.emoji}</span>
                    <span style={{ fontWeight: 600, color: "#333" }}>{cfg.label}</span>
                    <span style={{ color: "#999", marginLeft: "auto" }}>{hh}:{mm}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <button
        onClick={handleVerificarAhora}
        disabled={verificando}
        style={{
          width: "100%", padding: "14px", borderRadius: 14,
          background: verificando ? "#86efac" : "#22c55e", color: "white", fontSize: 17, fontWeight: 800,
          border: "none", cursor: verificando ? "default" : "pointer", marginBottom: 12,
        }}
      >
          {verificando ? "Enviando..." : "🍽️ Pedir que alimente a Fufy"}
        </button>
        {wakeConfirm && (
          <div style={{
            background: wakeConfirm.startsWith("🔔") ? "#fef9c3" : "#ffe4e6",
            borderRadius: 12, padding: "10px 14px", marginTop: 8,
            display: "flex", gap: 8, alignItems: "center",
          }}>
            <span style={{ fontSize: 20 }}>{wakeConfirm.startsWith("🔔") ? "🔔" : "❌"}</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: 0 }}>{wakeConfirm.replace(/^[🔔❌]\s*/, "")}</p>
          </div>
        )}
      </Card>

      {/* Alerta banner */}
      {config.text && (
        <div style={{
          background: isEmergency ? "#ffe4e6" : "#fef9c3",
          borderRadius: 16, padding: "14px 16px", marginBottom: 12,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 24 }}>{estado === "emergencia6h" ? "🚨" : "🔔"}</span>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: 0, lineHeight: 1.4 }}>{config.text}</p>
        </div>
      )}

      {/* Botones de emergencia */}
      {estado === "alerta3h" && (
        <button
          onClick={handleCall}
          style={{
            width: "100%", padding: "14px", borderRadius: 14,
            background: "#22c55e", color: "white", fontSize: 17, fontWeight: 800,
            border: "none", cursor: "pointer",
          }}
        >📞 Llamar a {displayName}</button>
      )}
      {estado === "emergencia6h" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button
              onClick={handleCall}
              style={{
                flex: 1, padding: "14px", borderRadius: 14,
                background: "#22c55e", color: "white", fontSize: 15, fontWeight: 800,
                border: "none", cursor: "pointer",
              }}
            >📞 Llamar a {displayName}</button>
            <button
              onClick={() => window.open("tel:112")}
              style={{
                flex: 1, padding: "14px", borderRadius: 14,
                background: "#ef4444", color: "white", fontSize: 15, fontWeight: 800,
                border: "none", cursor: "pointer",
              }}
            >🚨 Emergencias (112)</button>
          </div>
          {/* Location button */}
          {lastLat && lastLng && (
            <button
              onClick={() => window.open(`https://www.google.com/maps?q=${lastLat},${lastLng}`)}
              style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: "#3b82f6", color: "white", fontSize: 15, fontWeight: 800,
                border: "none", cursor: "pointer", marginBottom: 10,
              }}
            >📍 Ver ubicación</button>
          )}
        </>
      )}

      {/* Schedule Editor */}
      {userId && <ScheduleEditor userId={userId} />}
    </div>
  );
}
