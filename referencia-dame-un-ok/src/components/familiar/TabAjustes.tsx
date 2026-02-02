"use client";
import { useState } from "react";
import Card from "../ui/Card";
import ShareButtons from "../ui/ShareButtons";
import GearIcon from "../ui/icons/GearIcon";
import UpgradePrompt from "../ui/UpgradePrompt";
import { useSubscription } from "../../lib/hooks/useSubscription";
import { supabase } from "../../lib/services/supabase";
import { BASE_URL } from "../../lib/constants";

interface Props {
  userId?: string;
  pushEnabled?: boolean;
  onEnablePush?: () => void;
  role?: "admin" | "viewer";
  familiarId?: string;
}

export default function TabAjustes({ pushEnabled, role = "admin", familiarId }: Props) {
  const { canUse } = useSubscription();
  const [viewerLink, setViewerLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateViewerLink = async () => {
    setGenerating(true);
    const code = "V-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const url = `${BASE_URL}/familiar?viewer=${code}`;
    // Save viewer code to DB
    await supabase.from("dok_viewer_invitations").insert({
      code,
      creator_familiar_id: familiarId || null,
    });
    setViewerLink(url);
    setGenerating(false);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 24, fontWeight: 800, color: "#2d3436", margin: 0 }}>Ajustes</p>
        <GearIcon active={false} />
      </div>

      {/* Share viewer access - only for admin */}
      {role === "admin" && !canUse("maxViewers") && (
        <div style={{ marginBottom: 12 }}>
          <UpgradePrompt feature="Acceso visor" description="Comparte acceso de solo lectura con otros familiares." />
        </div>
      )}
      {role === "admin" && canUse("maxViewers") && (
        <Card>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 6px" }}>
            👁️ Compartir acceso visor
          </p>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 12px" }}>
            Genera un enlace para que otros familiares puedan ver el estado de tus avatares sin poder hacer cambios.
          </p>
          {!viewerLink ? (
            <button
              onClick={generateViewerLink}
              disabled={generating}
              style={{
                width: "100%", padding: "12px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white",
                fontSize: 16, fontWeight: 800, cursor: "pointer",
              }}
            >
              {generating ? "Generando..." : "🔗 Generar enlace de visor"}
            </button>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#22c55e", fontWeight: 700, margin: "0 0 8px" }}>
                ✅ Enlace listo
              </p>
              <ShareButtons url={viewerLink} />
            </div>
          )}
        </Card>
      )}

      {/* Viewer badge */}
      {role === "viewer" && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>👁️</span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#2d3436", margin: 0 }}>Modo visor</p>
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Solo puedes ver la información. Contacta al administrador para hacer cambios.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Notificaciones */}
      <Card>
        <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 10px" }}>Notificaciones</p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
          <span style={{ fontSize: 15, color: "#555" }}>Alertas push</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: pushEnabled ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
              {pushEnabled ? "Activas" : "Inactivas"}
            </span>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: pushEnabled ? "#22c55e" : "#ccc", position: "relative" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: pushEnabled ? 22 : 2 }} />
            </div>
          </div>
        </div>

        {/* SMS alerts */}
        {canUse("smsAlerts") ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
            <span style={{ fontSize: 15, color: "#555" }}>Alertas por SMS</span>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: "#ccc", position: "relative" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: 2 }} />
            </div>
          </div>
        ) : (
          <div style={{ padding: "6px 0" }}>
            <UpgradePrompt feature="Alertas SMS" description="Recibe alertas por mensaje de texto." />
          </div>
        )}

        {/* Email alerts */}
        {canUse("emailAlerts") ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
            <span style={{ fontSize: 15, color: "#555" }}>Alertas por email</span>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: "#ccc", position: "relative" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: 2 }} />
            </div>
          </div>
        ) : (
          <div style={{ padding: "6px 0" }}>
            <UpgradePrompt feature="Alertas por email" description="Recibe alertas en tu correo electrónico." />
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
          <span style={{ fontSize: 15, color: "#555" }}>Sonido de alerta</span>
          <span style={{ fontSize: 15, color: "#555" }}>Urgente &gt;</span>
        </div>
      </Card>

      {/* Familiares - only editable for admin */}
      {role === "admin" && (
        <Card>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 10px" }}>Familiares</p>
          {["Gestionar familiares", "Contactos de emergencia"].map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ fontSize: 15, color: "#555" }}>{t}</span>
              <span style={{ color: "#ccc" }}>&gt;</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ fontSize: 15, color: "#555" }}>Horario de check-in</span>
            <span style={{ fontSize: 15, color: "#555" }}>08:00 - 22:00 &gt;</span>
          </div>
        </Card>
      )}

      {/* Cuenta */}
      <Card>
        <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 10px" }}>Cuenta</p>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <span style={{ fontSize: 15, color: "#555" }}>Idioma</span>
          <span style={{ fontSize: 15, color: "#555" }}>Español &gt;</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <span style={{ fontSize: 15, color: "#555" }}>Plan</span>
          <span style={{ fontSize: 13, background: "#22c55e", color: "white", borderRadius: 10, padding: "2px 10px", fontWeight: 700 }}>Premium</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <span style={{ fontSize: 15, color: "#555" }}>Rol</span>
          <span style={{ fontSize: 13, background: role === "admin" ? "#3b82f6" : "#f59e0b", color: "white", borderRadius: 10, padding: "2px 10px", fontWeight: 700 }}>
            {role === "admin" ? "Administrador" : "Visor"}
          </span>
        </div>
      </Card>

      <p style={{ textAlign: "center", fontSize: 13, color: "#bbb", marginTop: 12 }}>Dame un Ok v1.0.0</p>
    </div>
  );
}
