"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/services/supabase";
import { GRADIENTS, COLORS } from "../../lib/constants/theme";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        if (!authData.user) throw new Error("No se pudo crear el usuario");

        // Create dok_user with default pet
        const { error: dokError } = await supabase.from("dok_users").insert({
          auth_id: authData.user.id,
          name,
          email,
          pet_name: "Fufy",
          pet_type: "cat",
          streak: 0,
        });
        if (dokError) throw dokError;

        router.push("/");
      } else {
        // Sign in
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        router.push("/");
      }
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
      {/* Logo area */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>🐱</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: 0 }}>Dame un Ok</h1>
        <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "4px 0 0" }}>
          Tu tranquilidad diaria, un toque a la vez
        </p>
      </div>

      {/* Form card */}
      <div style={{
        background: "rgba(255,255,255,0.85)",
        borderRadius: 20,
        padding: "28px 24px",
        width: "100%",
        maxWidth: 340,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}>
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #e0e0e0" }}>
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: mode === m ? COLORS.primary : "white",
                color: mode === m ? "white" : COLORS.textLight,
                transition: "all 0.2s",
              }}
            >
              {m === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />

          {error && (
            <p style={{ color: COLORS.danger, fontSize: 13, margin: "0 0 12px", textAlign: "center" }}>
              {error}
            </p>
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
              marginTop: 4,
            }}
          >
            {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a
            href="/registro-familiar"
            style={{ fontSize: 13, color: COLORS.primary, textDecoration: "none", fontWeight: 600 }}
          >
            ¿Eres familiar? Regístrate con código de invitación →
          </a>
        </div>
      </div>
    </div>
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
