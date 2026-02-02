"use client";
import { useEffect, useState } from "react";
import type { AlertaInfo } from "../../lib/types/familiar";
import { ALERT_AVATARS } from "../../lib/constants/alerts";
import { supabase } from "../../lib/services/supabase";
import Card from "../ui/Card";

interface Props {
  userId?: string;
}

const LEVEL_COLORS: Record<string, string> = {
  ok: "#22c55e",
  esperando: "#eab308",
  alerta1h: "#eab308",
  alerta3h: "#ef4444",
  emergencia6h: "#991b1b",
  verificacion_manual: "#6366f1",
};

const FALLBACK_ALERTAS: AlertaInfo[] = [
  { fecha: "Hoy 09:20", color: "#22c55e", texto: "Mama ha completado todas las actividades. Fufy esta contento.", avatar: "/avatars/misi-contento.png" },
  { fecha: "Ayer 09:15", color: "#22c55e", texto: "Mama ha completado todas las actividades. Fufy esta contento.", avatar: "/avatars/misi-contento.png" },
];

export default function TabAlertas({ userId }: Props) {
  const [alertas, setAlertas] = useState<AlertaInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setAlertas(FALLBACK_ALERTAS);
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("dok_alertas")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setAlertas(data.map((a: { created_at: string; nivel: string; mensaje: string; resolved: boolean }) => ({
          fecha: new Date(a.created_at).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
          color: LEVEL_COLORS[a.nivel] || "#888",
          texto: a.nivel === "verificacion_manual"
            ? `👁️ Verificación manual solicitada${a.resolved ? " ✅ Resuelta" : ""}`
            : `${a.mensaje}${a.resolved ? " ✅ Resuelta" : ""}`,
          avatar: ALERT_AVATARS[a.nivel as keyof typeof ALERT_AVATARS] || "/avatars/misi-contento.png",
        })));
      } else {
        setAlertas([]);
      }
      setLoading(false);
    };

    load();
  }, [userId]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 24, fontWeight: 800, color: "#2d3436", margin: 0 }}>Alertas 🔔</p>
      </div>

      {loading && <p style={{ textAlign: "center", color: "#888" }}>Cargando...</p>}

      {!loading && alertas.length === 0 && (
        <Card>
          <p style={{ textAlign: "center", color: "#888", fontSize: 15, margin: 0 }}>
            🎉 No hay alertas. ¡Todo está bien!
          </p>
        </Card>
      )}

      {alertas.map((a, i) => (
        <Card key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.color }} />
              <p style={{ fontSize: 16, fontWeight: 800, color: "#2d3436", margin: 0 }}>{a.fecha}</p>
            </div>
            <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.4 }}>{a.texto}</p>
          </div>
          <div style={{ width: 50, height: 50, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid white" }}>
            <img src={a.avatar} alt="Fufy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
