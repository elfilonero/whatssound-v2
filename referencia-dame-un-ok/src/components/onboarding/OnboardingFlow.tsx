"use client";
import { useState, useCallback } from "react";
import { supabase } from "../../lib/services/supabase";
import { COLORS, GRADIENTS, BASE_URL } from "../../lib/constants";

interface Props {
  userId: string;
  userName: string;
  onComplete: () => void;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function OnboardingFlow({ userId, userName, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [petName, setPetName] = useState("Fufy");
  const [petType, setPetType] = useState("cat");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const petTypes = [
    { type: "cat", emoji: "🐱", label: "Gato" },
    { type: "dog", emoji: "🐶", label: "Perro (próximamente)", disabled: true },
    { type: "bird", emoji: "🐦", label: "Pájaro (próximamente)", disabled: true },
  ];

  const handleNext = useCallback(async () => {
    if (step === 0) {
      // Save pet name and type
      setSaving(true);
      await supabase.from("dok_users").update({ pet_name: petName, pet_type: petType }).eq("id", userId);
      setSaving(false);
      setStep(1);
    } else if (step === 1) {
      // Save pet type and generate invite code
      setSaving(true);
      await supabase.from("dok_users").update({ pet_type: petType }).eq("id", userId);
      const code = generateCode();
      await supabase.from("dok_invitations").insert({
        user_id: userId,
        code,
        used: false,
      });
      setInviteCode(code);
      setSaving(false);
      setStep(2);
    } else {
      // Finish onboarding
      setSaving(true);
      await supabase.from("dok_users").update({ onboarded: true }).eq("id", userId);
      setSaving(false);
      onComplete();
    }
  }, [step, petName, petType, userId, onComplete]);

  const shareLink = `${BASE_URL}/registro-familiar?code=${inviteCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Dame un Ok - Invitación",
          text: `${userName} te invita a Dame un Ok. Usa el código: ${inviteCode}`,
          url: shareLink,
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      padding: 20,
    }}>
      <div style={{
        background: "rgba(255,255,255,0.9)",
        borderRadius: 24,
        padding: "32px 24px",
        width: "100%",
        maxWidth: 360,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>
        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i <= step ? COLORS.primary : "#ddd",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🐱</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>
              ¡Bienvenido, {userName}!
            </h2>
            <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "0 0 24px" }}>
              Vamos a crear tu mascota virtual
            </p>
            <input
              type="text"
              value={petName}
              onChange={e => setPetName(e.target.value)}
              placeholder="Nombre de tu mascota"
              style={{
                width: "100%", padding: "14px", borderRadius: 14,
                border: "2px solid #e0e0e0", fontSize: 18, fontWeight: 700,
                textAlign: "center", outline: "none", boxSizing: "border-box",
                marginBottom: 16,
              }}
            />
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>
              Elige tu mascota
            </h2>
            <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "0 0 20px" }}>
              {petName} será tu compañero diario
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {petTypes.map(p => (
                <button
                  key={p.type}
                  onClick={() => !p.disabled && setPetType(p.type)}
                  disabled={p.disabled}
                  style={{
                    padding: "16px", borderRadius: 16,
                    border: petType === p.type ? `3px solid ${COLORS.primary}` : "2px solid #e0e0e0",
                    background: p.disabled ? "#f5f5f5" : petType === p.type ? "#e8f5e9" : "white",
                    cursor: p.disabled ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    opacity: p.disabled ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: 36 }}>{p.emoji}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{p.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>
              ¡{petName} está listo!
            </h2>
            <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "0 0 20px" }}>
              Invita a tu familia para que cuiden de ti
            </p>
            <div style={{
              background: "#f0fdf4", borderRadius: 16, padding: "16px",
              border: "2px dashed #22c55e", marginBottom: 16,
            }}>
              <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "0 0 8px" }}>Código de invitación</p>
              <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: 6, color: COLORS.primary, margin: 0 }}>
                {inviteCode}
              </p>
            </div>
            <button
              onClick={handleShare}
              style={{
                width: "100%", padding: "12px", borderRadius: 12,
                background: "#e8f5e9", color: COLORS.primary,
                fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
                marginBottom: 12,
              }}
            >
              {copied ? "✅ ¡Copiado!" : "📋 Copiar enlace de invitación"}
            </button>
          </>
        )}

        <button
          onClick={handleNext}
          disabled={saving || (step === 0 && !petName.trim())}
          style={{
            width: "100%", padding: "14px", borderRadius: 14,
            background: saving ? "#aaa" : COLORS.primary, color: "white",
            fontSize: 17, fontWeight: 800, border: "none",
            cursor: saving ? "default" : "pointer",
          }}
        >
          {saving ? "Guardando..." : step === 2 ? "¡Empezar!" : "Siguiente →"}
        </button>

        {step === 2 && (
          <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "12px 0 0" }}>
            Puedes invitar más familiares después desde Ajustes
          </p>
        )}
      </div>
    </div>
  );
}
