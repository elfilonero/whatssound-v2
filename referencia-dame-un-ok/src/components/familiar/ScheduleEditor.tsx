"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../lib/services/supabase";
import Card from "../ui/Card";

interface Props {
  userId?: string;
}

interface Schedule {
  id?: string;
  type: "despertar" | "hambre";
  time: string;
}

export default function ScheduleEditor({ userId }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [longPressIdx, setLongPressIdx] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("dok_schedules")
        .select("id, type, time")
        .eq("user_id", userId)
        .order("type", { ascending: true })
        .order("time", { ascending: true });

      if (data && data.length > 0) {
        setSchedules(data);
      } else {
        const defaults: Schedule[] = [
          { type: "despertar", time: "08:00" },
          { type: "hambre", time: "13:00" },
        ];
        setSchedules(defaults);
        // Save defaults
        await supabase.from("dok_schedules").insert(
          defaults.map(s => ({ user_id: userId, type: s.type, time: s.time }))
        );
      }
      setLoading(false);
    })();
  }, [userId]);

  // Auto-save whenever schedules change
  const saveAll = useCallback(async (items: Schedule[]) => {
    if (!userId) return;
    await supabase.from("dok_schedules").delete().eq("user_id", userId);
    if (items.length > 0) {
      await supabase.from("dok_schedules").insert(
        items.map(s => ({ user_id: userId, type: s.type, time: s.time }))
      );
    }
  }, [userId]);

  const updateTime = (index: number, time: string) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], time };
    setSchedules(updated);
    setEditingId(null);
    saveAll(updated);
  };

  const addHambre = () => {
    const updated = [...schedules, { type: "hambre" as const, time: "18:00" }];
    setSchedules(updated);
    saveAll(updated);
  };

  const removeSchedule = (index: number) => {
    const item = schedules[index];
    if (item.type === "despertar") return;
    const hambreCount = schedules.filter(s => s.type === "hambre").length;
    if (hambreCount <= 1) return;
    const updated = schedules.filter((_, i) => i !== index);
    setSchedules(updated);
    setLongPressIdx(null);
    saveAll(updated);
  };

  // Long press handlers
  const startLongPress = (index: number) => {
    const item = schedules[index];
    if (item.type === "despertar") return;
    const hambreCount = schedules.filter(s => s.type === "hambre").length;
    if (hambreCount <= 1) return;

    longPressTimer.current = setTimeout(() => {
      setLongPressIdx(index);
    }, 600);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const despertar = schedules.findIndex(s => s.type === "despertar");
  const hambreItems = schedules.map((s, i) => ({ ...s, index: i })).filter(s => s.type === "hambre");

  if (loading) return null;

  return (
    <div style={{ padding: "0 0 12px" }}>
      <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 12px" }}>
        ⏰ Horarios de Fufy
      </p>

      {/* Scrollable schedule list */}
      <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 10 }}>
        {/* Despertar */}
        {despertar >= 0 && (
          <Card style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🌅</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#2d3436", margin: 0 }}>Despertar</p>
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Fufy se despierta</p>
                </div>
              </div>
              {editingId === "despertar" ? (
                <input
                  type="time"
                  value={schedules[despertar].time}
                  onChange={(e) => updateTime(despertar, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  autoFocus
                  style={{
                    fontSize: 18, fontWeight: 700, color: "#2d3436",
                    border: "2px solid #22c55e", borderRadius: 10, padding: "6px 10px",
                    background: "#f0fdf4", outline: "none",
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditingId("despertar")}
                  style={{
                    fontSize: 20, fontWeight: 800, color: "#22c55e",
                    background: "#f0fdf4", border: "2px solid #dcfce7",
                    borderRadius: 12, padding: "6px 16px", cursor: "pointer",
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
          <Card
            key={idx}
            style={{
              marginBottom: 10,
              background: longPressIdx === item.index ? "#fee2e2" : undefined,
              transition: "background 0.2s",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              onTouchStart={() => startLongPress(item.index)}
              onTouchEnd={cancelLongPress}
              onTouchCancel={cancelLongPress}
              onMouseDown={() => startLongPress(item.index)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🍽️</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#2d3436", margin: 0 }}>
                    Tiene hambre {hambreItems.length > 1 ? `(${idx + 1})` : ""}
                  </p>
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Fufy necesita comer</p>
                </div>
              </div>

              {longPressIdx === item.index ? (
                <button
                  onClick={() => removeSchedule(item.index)}
                  style={{
                    padding: "6px 14px", borderRadius: 12,
                    background: "#ef4444", color: "white", fontSize: 13, fontWeight: 700,
                    border: "none", cursor: "pointer",
                  }}
                >
                  🗑️ Eliminar
                </button>
              ) : editingId === `hambre-${idx}` ? (
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateTime(item.index, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  autoFocus
                  style={{
                    fontSize: 18, fontWeight: 700, color: "#2d3436",
                    border: "2px solid #22c55e", borderRadius: 10, padding: "6px 10px",
                    background: "#f0fdf4", outline: "none",
                  }}
                />
              ) : (
                <button
                  onClick={() => { setLongPressIdx(null); setEditingId(`hambre-${idx}`); }}
                  style={{
                    fontSize: 20, fontWeight: 800, color: "#22c55e",
                    background: "#f0fdf4", border: "2px solid #dcfce7",
                    borderRadius: 12, padding: "6px 16px", cursor: "pointer",
                  }}
                >
                  {item.time}
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add more */}
      <button
        onClick={addHambre}
        style={{
          width: "100%", padding: "12px", borderRadius: 14,
          background: "transparent", border: "2px dashed #22c55e",
          color: "#22c55e", fontSize: 15, fontWeight: 700,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>＋</span> Añadir hora de comida
      </button>

      {/* Dismiss long-press overlay */}
      {longPressIdx !== null && (
        <button
          onClick={() => setLongPressIdx(null)}
          style={{
            width: "100%", padding: "8px", marginTop: 8,
            background: "transparent", color: "#888", fontSize: 13,
            border: "none", cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
