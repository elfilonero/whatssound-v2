"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/services/supabase";
import { ADMIN_SECRET, BASE_URL } from "../../../lib/constants";

const ADMIN_KEY = ADMIN_SECRET;

interface Invitation {
  id: string;
  code: string;
  label: string | null;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

export default function AdminInvitesPage() {
  const [authorized, setAuthorized] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("key") === ADMIN_KEY) {
      setAuthorized(true);
      loadInvitations();
    }
  }, []);

  async function loadInvitations() {
    const { data } = await supabase
      .from("dok_admin_invitations")
      .select("*")
      .order("created_at", { ascending: false });
    setInvitations(data || []);
  }

  function generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  async function createInvitation() {
    setLoading(true);
    const code = generateCode();
    await supabase.from("dok_admin_invitations").insert({
      code,
      label: label.trim() || null,
    });
    setLabel("");
    await loadInvitations();
    setLoading(false);
  }

  function getLink(code: string) {
    return `${BASE_URL}/familiar?admin=${code}`;
  }

  async function copyLink(code: string) {
    await navigator.clipboard.writeText(getLink(code));
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!authorized) {
    return (
      <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <p style={{ color: "#999", fontSize: 16 }}>🔒 Acceso no autorizado</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>🔗 Invitaciones Admin</h1>

      {/* Create form */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>
          Etiqueta (opcional)
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ej: Ángel, Test1..."
          style={{
            width: "100%", padding: "12px 16px", fontSize: 16, border: "2px solid #e0e0e0",
            borderRadius: 12, marginBottom: 12, boxSizing: "border-box",
          }}
        />
        <button
          onClick={createInvitation}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", fontSize: 16, fontWeight: 700,
            background: "#43a047", color: "white", border: "none", borderRadius: 12,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Generando..." : "➕ Generar enlace admin"}
        </button>
      </div>

      {/* Invitations list */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Invitaciones ({invitations.length})</h2>
      {invitations.map((inv) => (
        <div
          key={inv.id}
          style={{
            background: "white", borderRadius: 12, padding: 16, marginBottom: 10,
            border: `2px solid ${inv.used ? "#e0e0e0" : "#43a047"}`,
            opacity: inv.used ? 0.7 : 1,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{inv.code}</span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 8,
              background: inv.used ? "#fef3c7" : "#dcfce7",
              color: inv.used ? "#b45309" : "#166534",
            }}>
              {inv.used ? "✅ Usado" : "⏳ Pendiente"}
            </span>
          </div>
          {inv.label && <p style={{ fontSize: 13, color: "#888", margin: "0 0 8px" }}>📝 {inv.label}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => copyLink(inv.code)}
              style={{
                flex: 1, padding: "10px", fontSize: 13, fontWeight: 600,
                background: copied === inv.code ? "#dcfce7" : "#f5f5f5",
                color: copied === inv.code ? "#166534" : "#333",
                border: "none", borderRadius: 8, cursor: "pointer",
              }}
            >
              {copied === inv.code ? "✅ Copiado!" : "📋 Copiar enlace"}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#bbb", margin: "8px 0 0", wordBreak: "break-all" }}>
            {getLink(inv.code)}
          </p>
        </div>
      ))}
    </div>
  );
}
