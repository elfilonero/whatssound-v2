"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/services/supabase";
import { GRADIENTS, COLORS } from "../../lib/constants/theme";
import { Suspense } from "react";

function RegistroFamiliarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [relacion, setRelacion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // FEATURE 1: Pre-fill code from URL
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) setCode(urlCode.toUpperCase());
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate invitation code
      const { data: invitation, error: invErr } = await supabase
        .from("dok_invitations")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .eq("used", false)
        .single();

      if (invErr || !invitation) {
        throw new Error("Código de invitación inválido o ya utilizado");
      }

      // Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // Create familiar record
      const { error: famError } = await supabase.from("dok_familiares").insert({
        auth_id: authData.user.id,
        user_id: invitation.user_id,
        familiar_name: name,
        familiar_email: email,
        relacion: relacion || "Familiar",
        onboarded: false,
      });
      if (famError) throw famError;

      // Mark invitation as used
      await supabase
        .from("dok_invitations")
        .update({ used: true, used_by: authData.user.id })
        .eq("id", invitation.id);

      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      minHeight: "100dvh",
      background: GRADIENTS.mint,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>👨‍👩‍👧‍👦</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0 }}>Registro Familiar</h1>
        <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "4px 0 0" }}>
          Regístrate para cuidar de tu ser querido
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.85)",
        borderRadius: 20,
        padding: "28px 24px",
        width: "100%",
        maxWidth: 340,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Código de invitación"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            style={{ ...inputStyle, textAlign: "center", fontSize: 20, fontWeight: 800, letterSpacing: 4 }}
          />
          <input type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
          <input type="text" placeholder="Relación (ej: Hijo, Hija, Nieto...)" value={relacion} onChange={(e) => setRelacion(e.target.value)} style={inputStyle} />

          {error && (
            <p style={{ color: COLORS.danger, fontSize: 13, margin: "0 0 12px", textAlign: "center" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              background: loading ? "#aaa" : COLORS.primary,
              color: "white",
              fontSize: 17,
              fontWeight: 800,
              border: "none",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Registrando..." : "Registrarme como familiar"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a href="/login" style={{ fontSize: 13, color: COLORS.primary, textDecoration: "none", fontWeight: 600 }}>
            ← Volver al login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RegistroFamiliarPage() {
  return (
    <Suspense fallback={<div style={{ width: "100%", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>Cargando...</div>}>
      <RegistroFamiliarForm />
    </Suspense>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e0e0e0",
  fontSize: 15,
  marginBottom: 12,
  outline: "none",
  boxSizing: "border-box",
};
