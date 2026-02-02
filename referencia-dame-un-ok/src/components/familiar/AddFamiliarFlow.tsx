"use client";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../lib/services/supabase";
import Card from "../ui/Card";
import ShareButtons from "../ui/ShareButtons";
import UpgradePrompt from "../ui/UpgradePrompt";
import { useSubscription } from "../../lib/hooks/useSubscription";
import { PLANS, BASE_URL } from "../../lib/constants";

interface Props {
  userId?: string; // The familiar's user_id (who is adding)
  onComplete: () => void; // Refresh the list
  onCancel: () => void;
}

interface ScheduleItem {
  type: "despertar" | "hambre";
  time: string;
}

export default function AddFamiliarFlow({ userId, onComplete, onCancel }: Props) {
  const [step, setStep] = useState<"config" | "link">("config");
  const [nombre, setNombre] = useState("");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { type: "despertar", time: "08:00" },
    { type: "hambre", time: "13:00" },
  ]);
  const { plan } = useSubscription();
  const [familiarCount, setFamiliarCount] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [alertTimes, setAlertTimes] = useState({ alerta1h: 60, alerta3h: 180, emergencia6h: 360 });
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Count existing familiares
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("dok_invitations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .then(({ count }) => setFamiliarCount(count ?? 0));
  }, [userId]);

  const maxFamiliares = PLANS[plan].maxFamiliares;
  const atLimit = familiarCount >= maxFamiliares;

  const addHambre = () => {
    setSchedules([...schedules, { type: "hambre", time: "18:00" }]);
  };

  const updateTime = (index: number, time: string) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], time };
    setSchedules(updated);
    setEditingIdx(null);
  };

  const removeHambre = (index: number) => {
    const item = schedules[index];
    if (item.type === "despertar") return;
    if (schedules.filter(s => s.type === "hambre").length <= 1) return;
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const generateLink = useCallback(async () => {
    if (!userId || !nombre.trim()) return;
    setGenerating(true);

    // Generate unique code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Store invitation with schedules config
    const { error } = await supabase.from("dok_invitations").insert({
      user_id: userId,
      code,
      familiar_name: nombre.trim(),
      schedules: schedules,
      alert_times: alertTimes,
      pet_type: "cat", // Prepared for future pets
    });

    if (!error) {
      setInviteUrl(`${BASE_URL}/u/${code}`);
      setStep("link");
    }
    setGenerating(false);
  }, [userId, nombre, schedules]);

  const despertar = schedules.findIndex(s => s.type === "despertar");
  const hambreItems = schedules.map((s, i) => ({ ...s, index: i })).filter(s => s.type === "hambre");

  // Step 1: Configure
  if (step === "config") {
    if (atLimit) {
      return (
        <div style={{ padding: "0 0 12px" }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#2d3436", margin: "0 0 16px" }}>
            👤 Nuevo familiar
          </p>
          <UpgradePrompt
            feature={`Límite de ${maxFamiliares} familiar${maxFamiliares === 1 ? "" : "es"} alcanzado`}
            description={`Con Premium puedes añadir hasta ${PLANS.premium.maxFamiliares} familiares.`}
          />
          <button
            onClick={onCancel}
            style={{
              width: "100%", padding: "10px", marginTop: 12,
              background: "transparent", color: "#888", fontSize: 14,
              border: "none", cursor: "pointer",
            }}
          >
            Volver
          </button>
        </div>
      );
    }

    return (
      <div style={{ padding: "0 0 12px" }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#2d3436", margin: "0 0 16px" }}>
          👤 Nuevo familiar
        </p>

        {/* Name input */}
        <Card style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#555", margin: "0 0 8px" }}>
            Nombre del familiar
          </p>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Mamá, Papá, Abuela..."
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 12,
              border: "2px solid #dcfce7", fontSize: 16, outline: "none",
              background: "#f0fdf4", boxSizing: "border-box",
            }}
          />
        </Card>

        {/* Schedule config */}
        <p style={{ fontSize: 16, fontWeight: 800, color: "#2d3436", margin: "0 0 10px" }}>
          ⏰ Horarios
        </p>

        <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 10 }}>
          {/* Despertar */}
          {despertar >= 0 && (
            <Card style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🌅</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#2d3436" }}>Despertar</span>
                </div>
                {editingIdx === despertar ? (
                  <input
                    type="time"
                    value={schedules[despertar].time}
                    onChange={(e) => updateTime(despertar, e.target.value)}
                    onBlur={() => setEditingIdx(null)}
                    autoFocus
                    style={{
                      fontSize: 16, fontWeight: 700, color: "#2d3436",
                      border: "2px solid #22c55e", borderRadius: 10, padding: "4px 8px",
                      background: "#f0fdf4", outline: "none",
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setEditingIdx(despertar)}
                    style={{
                      fontSize: 18, fontWeight: 800, color: "#22c55e",
                      background: "#f0fdf4", border: "2px solid #dcfce7",
                      borderRadius: 10, padding: "4px 14px", cursor: "pointer",
                    }}
                  >
                    {schedules[despertar].time}
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Hambre items */}
          {hambreItems.map((item, idx) => (
            <Card key={idx} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🍽️</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#2d3436" }}>
                    Comida {hambreItems.length > 1 ? `(${idx + 1})` : ""}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {editingIdx === item.index ? (
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) => updateTime(item.index, e.target.value)}
                      onBlur={() => setEditingIdx(null)}
                      autoFocus
                      style={{
                        fontSize: 16, fontWeight: 700, color: "#2d3436",
                        border: "2px solid #22c55e", borderRadius: 10, padding: "4px 8px",
                        background: "#f0fdf4", outline: "none",
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingIdx(item.index)}
                      style={{
                        fontSize: 18, fontWeight: 800, color: "#22c55e",
                        background: "#f0fdf4", border: "2px solid #dcfce7",
                        borderRadius: 10, padding: "4px 14px", cursor: "pointer",
                      }}
                    >
                      {item.time}
                    </button>
                  )}
                  {hambreItems.length > 1 && (
                    <button
                      onClick={() => removeHambre(item.index)}
                      style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: "#fee2e2", color: "#ef4444", border: "none",
                        fontSize: 14, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >✕</button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add comida */}
        <button
          onClick={addHambre}
          style={{
            width: "100%", padding: "10px", borderRadius: 12,
            background: "transparent", border: "2px dashed #22c55e",
            color: "#22c55e", fontSize: 14, fontWeight: 700,
            cursor: "pointer", marginBottom: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          ＋ Añadir hora de comida
        </button>

        {/* Alert times config */}
        <p style={{ fontSize: 16, fontWeight: 800, color: "#2d3436", margin: "16px 0 10px" }}>
          🚨 Tiempos de alerta
        </p>

        {[
          { key: "alerta1h" as const, label: "Primera alerta", emoji: "⚠️", desc: "Sin respuesta" },
          { key: "alerta3h" as const, label: "Segunda alerta", emoji: "🔴", desc: "Sin respuesta" },
          { key: "emergencia6h" as const, label: "Emergencia", emoji: "🚨", desc: "Sin respuesta" },
        ].map((alert) => (
          <Card key={alert.key} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{alert.emoji}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#2d3436", margin: 0 }}>{alert.label}</p>
                  <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{alert.desc}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select
                  value={alertTimes[alert.key]}
                  onChange={(e) => setAlertTimes({ ...alertTimes, [alert.key]: Number(e.target.value) })}
                  style={{
                    fontSize: 16, fontWeight: 800, color: "#22c55e",
                    background: "#f0fdf4", border: "2px solid #dcfce7",
                    borderRadius: 10, padding: "4px 8px", cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {[15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 480, 720].map(min => (
                    <option key={min} value={min}>
                      {min < 60 ? `${min} min` : `${min / 60}h`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        ))}

        {/* Generate link */}
        <button
          onClick={generateLink}
          disabled={generating || !nombre.trim()}
          style={{
            width: "100%", padding: "14px", borderRadius: 25,
            background: nombre.trim() ? "#22c55e" : "#ccc",
            color: "white", fontSize: 16, fontWeight: 800,
            border: "none", cursor: nombre.trim() ? "pointer" : "default",
            marginBottom: 8,
          }}
        >
          {generating ? "Generando..." : "🔗 Generar enlace de invitación"}
        </button>

        <button
          onClick={onCancel}
          style={{
            width: "100%", padding: "10px",
            background: "transparent", color: "#888", fontSize: 14,
            border: "none", cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  // Step 2: Link ready
  return (
    <div style={{ padding: "0 0 12px" }}>
      <Card>
        <div style={{ textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatars/misi-base-saludando.png"
            alt="Fufy saludando"
            style={{ width: 120, height: 120, objectFit: "contain", margin: "0 auto 8px" }}
          />
          <p style={{ fontSize: 17, fontWeight: 800, color: "#2d3436", margin: "0 0 4px" }}>
            ¡Enlace listo para {nombre}!
          </p>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px" }}>
            Compártelo para que conozca a Fufy 🐱
          </p>
          {inviteUrl && <ShareButtons url={inviteUrl} recipientName={nombre} />}
        </div>
      </Card>

      <button
        onClick={() => { onComplete(); }}
        style={{
          width: "100%", padding: "10px", marginTop: 10,
          background: "transparent", color: "#22c55e", fontSize: 15, fontWeight: 700,
          border: "none", cursor: "pointer",
        }}
      >
        Listo
      </button>
    </div>
  );
}
