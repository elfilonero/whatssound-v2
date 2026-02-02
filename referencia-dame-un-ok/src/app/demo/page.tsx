"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { COLORS, GRADIENTS, BUTTONS } from "../../lib/constants/theme";

type DemoStep = "alarm" | "action1" | "action2" | "action3" | "euforico" | "familiar_ok" | "familiar_alert" | "familiar_resolved" | "cta";

const STEPS: { key: DemoStep; title: string }[] = [
  { key: "alarm", title: "Alarma matutina" },
  { key: "action1", title: "Alimentar" },
  { key: "action2", title: "Mimar" },
  { key: "action3", title: "Jugar" },
  { key: "euforico", title: "¡Fufy eufórico!" },
  { key: "familiar_ok", title: "Vista familiar: Todo OK" },
  { key: "familiar_alert", title: "Vista familiar: Alerta" },
  { key: "familiar_resolved", title: "Alerta resuelta" },
  { key: "cta", title: "¡Regístrate!" },
];

export default function DemoPage() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const step = STEPS[stepIdx].key;

  const next = () => {
    if (stepIdx < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => { setStepIdx(s => s + 1); setAnimating(false); }, 300);
    }
  };
  const prev = () => {
    if (stepIdx > 0) {
      setAnimating(true);
      setTimeout(() => { setStepIdx(s => s - 1); setAnimating(false); }, 300);
    }
  };

  // Vibration on action steps
  useEffect(() => {
    if (["action1", "action2", "action3", "euforico"].includes(step) && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [step]);

  const actions = {
    alimentar: stepIdx >= 1,
    mimar: stepIdx >= 2,
    jugar: stepIdx >= 3,
  };

  return (
    <div style={{
      width: "100%", minHeight: "100dvh",
      background: step === "familiar_alert" ? "#fff3cd" : GRADIENTS.mint,
      display: "flex", flexDirection: "column", position: "relative",
      transition: "background 0.5s ease",
    }}>
      {/* Progress bar */}
      <div style={{ padding: "12px 16px 0", zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <button onClick={() => router.push("/landing")} style={{ background: "none", border: "none", fontSize: 16, fontWeight: 700, color: COLORS.textLight, cursor: "pointer" }}>
            ← Salir
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>
            Demo {stepIdx + 1}/{STEPS.length}
          </span>
        </div>
        <div style={{ width: "100%", height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2 }}>
          <div style={{
            width: `${((stepIdx + 1) / STEPS.length) * 100}%`, height: "100%",
            background: COLORS.primary, borderRadius: 2, transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Content area */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "20px 24px",
        opacity: animating ? 0 : 1, transition: "opacity 0.3s ease",
      }}>
        {/* ALARM */}
        {step === "alarm" && (
          <>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🐱</div>
            <div className="speech-bubble" style={{ marginBottom: 16, fontSize: 18 }}>
              ¡Buenos días! ¿Cómo estás hoy?
            </div>
            <p style={{ fontSize: 14, color: COLORS.textMuted, textAlign: "center", marginBottom: 24 }}>
              Cada mañana, Fufy saluda a tu familiar con una alarma cariñosa
            </p>
            <button onClick={next} style={primaryBtn}>
              Estoy aquí → Empezar
            </button>
          </>
        )}

        {/* ACTIONS */}
        {(step === "action1" || step === "action2" || step === "action3") && (
          <>
            <div style={{ fontSize: 64, marginBottom: 12 }}>
              {stepIdx >= 3 ? "😻" : stepIdx >= 2 ? "😸" : "🐱"}
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>Fufy</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.textLight, marginBottom: 24 }}>
              {step === "action1" ? "¿Jugamos?" : step === "action2" ? "¡Qué rico!" : "¡Qué gustito!"}
            </p>

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 340, marginBottom: 24 }}>
              {(["alimentar", "mimar", "jugar"] as const).map((key) => {
                const done = actions[key];
                const isNext = (step === "action1" && key === "alimentar") ||
                               (step === "action2" && key === "mimar") ||
                               (step === "action3" && key === "jugar");
                return (
                  <button
                    key={key}
                    onClick={isNext ? next : undefined}
                    style={{
                      background: done ? BUTTONS.completed.bg : BUTTONS[key].bg,
                      border: done ? BUTTONS.completed.border : isNext ? "3px solid #fff" : "none",
                      borderRadius: 18, padding: "18px 8px 14px",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      cursor: isNext ? "pointer" : "default",
                      boxShadow: done ? BUTTONS.completed.shadow : BUTTONS[key].shadow,
                      transform: isNext ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.3s ease",
                      opacity: !done && !isNext ? 0.5 : 1,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{done ? "✅" : key === "alimentar" ? "🐟" : key === "mimar" ? "❤️" : "🧶"}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#111", textTransform: "capitalize" }}>{key}</span>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center" }}>
              Toca el botón resaltado para continuar
            </p>
          </>
        )}

        {/* EUFORICO */}
        {step === "euforico" && (
          <>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 100, animation: "float 2s ease-in-out infinite" }}>😻</div>
              {/* Confetti */}
              <div style={{ position: "absolute", top: -20, left: -30, fontSize: 24, animation: "float 1.5s ease-in-out infinite" }}>🎉</div>
              <div style={{ position: "absolute", top: -10, right: -30, fontSize: 24, animation: "float 1.8s ease-in-out infinite reverse" }}>✨</div>
              <div style={{ position: "absolute", bottom: 0, left: -40, fontSize: 20, animation: "float 2s ease-in-out infinite 0.5s" }}>⭐</div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: COLORS.primary, marginTop: 16 }}>¡Te quiero!</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.textLight, marginTop: 8, textAlign: "center" }}>
              Fufy está eufórico. Las 3 acciones completadas.
            </p>
            <div style={{
              background: "rgba(34,197,94,0.15)", borderRadius: 16, padding: "12px 20px",
              marginTop: 16, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>5 días seguidos</span>
            </div>
            <button onClick={next} style={{ ...primaryBtn, marginTop: 24 }}>
              Ver vista del familiar →
            </button>
          </>
        )}

        {/* FAMILIAR OK */}
        {step === "familiar_ok" && (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, marginBottom: 8, letterSpacing: 1 }}>
              👨‍👩‍👧 VISTA FAMILIAR
            </p>
            <div style={{
              background: "#fff", borderRadius: 20, padding: "24px 20px", width: "100%", maxWidth: 340,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: COLORS.primary }}>Todo bien</p>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "8px 0" }}>Mamá ha completado su check-in hoy</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>5</p>
                  <p style={{ fontSize: 12, color: COLORS.textMuted }}>días seguidos</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>09:15</p>
                  <p style={{ fontSize: 12, color: COLORS.textMuted }}>último ok</p>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: COLORS.textMuted, textAlign: "center", marginTop: 16 }}>
              Los familiares ven el estado en tiempo real
            </p>
            <button onClick={next} style={{ ...primaryBtn, marginTop: 20 }}>
              ¿Y si no responde? →
            </button>
          </>
        )}

        {/* FAMILIAR ALERT */}
        {step === "familiar_alert" && (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 8, letterSpacing: 1 }}>
              ⚠️ ALERTA ACTIVADA
            </p>
            <div style={{
              background: "#fff", borderRadius: 20, padding: "24px 20px", width: "100%", maxWidth: 340,
              boxShadow: "0 4px 20px rgba(220,38,38,0.15)", textAlign: "center",
              border: "2px solid #fca5a5",
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔴</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}>Sin respuesta - 3h</p>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "8px 0" }}>
                Mamá no ha respondido a la alarma de hoy
              </p>
              <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                Notificación push enviada a todos los familiares
              </p>
            </div>
            <p style={{ fontSize: 14, color: COLORS.textMuted, textAlign: "center", marginTop: 16 }}>
              Sistema de alertas escalonado: 1h → 3h → 6h (emergencia)
            </p>
            <button onClick={next} style={{ ...primaryBtn, marginTop: 20 }}>
              Mamá responde →
            </button>
          </>
        )}

        {/* FAMILIAR RESOLVED */}
        {step === "familiar_resolved" && (
          <>
            <div style={{ fontSize: 80, marginBottom: 12 }}>😮‍💨</div>
            <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary }}>¡Falsa alarma!</p>
            <p style={{ fontSize: 15, color: COLORS.textLight, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
              Mamá acaba de completar su check-in.<br />
              La alerta se resuelve automáticamente.
            </p>
            <div style={{
              background: "rgba(34,197,94,0.1)", borderRadius: 16, padding: "16px 20px",
              marginTop: 20, textAlign: "center",
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>
                ✅ Notificación: &ldquo;Mamá ha dado su Ok&rdquo;
              </p>
            </div>
            <button onClick={next} style={{ ...primaryBtn, marginTop: 24 }}>
              Continuar →
            </button>
          </>
        )}

        {/* CTA */}
        {step === "cta" && (
          <>
            <div style={{ fontSize: 80, marginBottom: 12 }}>🐱</div>
            <p style={{ fontSize: 24, fontWeight: 900, color: COLORS.text, textAlign: "center" }}>
              ¿Te gusta?
            </p>
            <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.textLight, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
              Regístrate gratis y configura Dame un Ok<br />para tu familiar en menos de 2 minutos.
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{ ...primaryBtn, marginTop: 24, fontSize: 18 }}
            >
              Regístrate gratis
            </button>
            <button
              onClick={() => router.push("/landing")}
              style={{
                marginTop: 12, background: "transparent", border: "none",
                fontSize: 14, fontWeight: 600, color: COLORS.textMuted, cursor: "pointer",
              }}
            >
              ← Volver a la landing
            </button>
          </>
        )}
      </div>

      {/* Navigation dots */}
      <div style={{ padding: "16px 24px 32px", display: "flex", justifyContent: "center", gap: 6, zIndex: 20 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === stepIdx ? 24 : 8, height: 8, borderRadius: 4,
            background: i === stepIdx ? COLORS.primary : "rgba(0,0,0,0.15)",
            transition: "all 0.3s ease", cursor: "pointer",
          }} onClick={() => { setAnimating(true); setTimeout(() => { setStepIdx(i); setAnimating(false); }, 200); }} />
        ))}
      </div>

      {/* Prev/Next arrows */}
      {stepIdx > 0 && step !== "cta" && (
        <button onClick={prev} style={{
          position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%",
          width: 40, height: 40, fontSize: 18, cursor: "pointer", zIndex: 20,
        }}>←</button>
      )}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: "14px 32px", borderRadius: 16,
  background: "#22c55e", color: "#fff", fontSize: 16, fontWeight: 800,
  border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
};
