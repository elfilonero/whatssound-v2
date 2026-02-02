"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../lib/services/supabase";
import { COLORS, GRADIENTS, BASE_URL } from "../../lib/constants";
import Card from "../ui/Card";
import ShareButtons from "../ui/ShareButtons";

interface Props {
  familiarId?: string | null;
  onComplete: () => void;
}

/* ── Country list with timezones ── */
const COUNTRIES = [
  { name: "España", code: "ES", tz: "Europe/Madrid" },
  { name: "México", code: "MX", tz: "America/Mexico_City" },
  { name: "Argentina", code: "AR", tz: "America/Argentina/Buenos_Aires" },
  { name: "Colombia", code: "CO", tz: "America/Bogota" },
  { name: "Chile", code: "CL", tz: "America/Santiago" },
  { name: "Perú", code: "PE", tz: "America/Lima" },
  { name: "Ecuador", code: "EC", tz: "America/Guayaquil" },
  { name: "Venezuela", code: "VE", tz: "America/Caracas" },
  { name: "Uruguay", code: "UY", tz: "America/Montevideo" },
  { name: "Paraguay", code: "PY", tz: "America/Asuncion" },
  { name: "Bolivia", code: "BO", tz: "America/La_Paz" },
  { name: "Costa Rica", code: "CR", tz: "America/Costa_Rica" },
  { name: "Panamá", code: "PA", tz: "America/Panama" },
  { name: "Guatemala", code: "GT", tz: "America/Guatemala" },
  { name: "Cuba", code: "CU", tz: "America/Havana" },
  { name: "Rep. Dominicana", code: "DO", tz: "America/Santo_Domingo" },
  { name: "Honduras", code: "HN", tz: "America/Tegucigalpa" },
  { name: "El Salvador", code: "SV", tz: "America/El_Salvador" },
  { name: "Nicaragua", code: "NI", tz: "America/Managua" },
  { name: "Estados Unidos", code: "US", tz: "America/New_York" },
  { name: "Portugal", code: "PT", tz: "Europe/Lisbon" },
  { name: "Francia", code: "FR", tz: "Europe/Paris" },
  { name: "Italia", code: "IT", tz: "Europe/Rome" },
  { name: "Alemania", code: "DE", tz: "Europe/Berlin" },
  { name: "Reino Unido", code: "GB", tz: "Europe/London" },
  { name: "China", code: "CN", tz: "Asia/Shanghai" },
  { name: "Japón", code: "JP", tz: "Asia/Tokyo" },
  { name: "Brasil", code: "BR", tz: "America/Sao_Paulo" },
];

/* ── Alert time options ── */
const ALERT_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1h", value: 60 },
  { label: "1.5h", value: 90 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
  { label: "4h", value: 240 },
  { label: "5h", value: 300 },
  { label: "6h", value: 360 },
  { label: "8h", value: 480 },
  { label: "12h", value: 720 },
];

/* ── Avatars (extensible) ── */
const AVATARS = [
  { id: "fufy", name: "Fufy", emoji: "🐱", type: "cat" },
  // Future: { id: "bono", name: "Bono", emoji: "🐶", type: "dog" },
  // Future: { id: "pepi", name: "Pepi", emoji: "🐦", type: "bird" },
];

const TOTAL_STEPS = 5;

export default function FamiliarOnboardingWizard({ familiarId, onComplete }: Props) {
  const [step, setStep] = useState(0);

  /* Step 1 - Profile */
  const [nombre, setNombre] = useState("");
  const [pais, setPais] = useState("");
  /* Step 2 - User (familiar person) */
  const [familiarName, setFamiliarName] = useState("");
  const [familiarPais, setFamiliarPais] = useState("");
  const [avatar, setAvatar] = useState("fufy");

  /* Step 3 - Schedules */
  const [despertar, setDespertar] = useState("08:00");
  const [comidas, setComidas] = useState<string[]>(["13:00"]);

  /* Step 4 - Alert times */
  const [alerta1, setAlerta1] = useState(60);
  const [alerta2, setAlerta2] = useState(180);
  const [emergencia, setEmergencia] = useState(360);

  /* Step 5 - Invite link */
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [linkShared, setLinkShared] = useState(false);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Auto-advance logic ── */
  const isStepComplete = useCallback((s: number): boolean => {
    switch (s) {
      case 0: return nombre.trim().length > 0 && pais.length > 0;
      case 1: return familiarName.trim().length > 0 && familiarPais.length > 0;
      case 2: return true; // always has defaults
      case 3: return true; // always has defaults
      case 4: return true;
      default: return false;
    }
  }, [nombre, pais, familiarName, familiarPais]);

  useEffect(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    if (step < 2 && isStepComplete(step)) {
      autoAdvanceTimer.current = setTimeout(() => {
        setStep(s => s + 1);
      }, 500);
    }
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); };
  }, [step, isStepComplete]);

  /* ── Generate invite link on step 5 ── */
  useEffect(() => {
    if (step === 4 && !inviteCode && !generating) {
      generateInvite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const generateInvite = async () => {
    setGenerating(true);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const schedules = [
      { type: "despertar", time: despertar },
      ...comidas.map(t => ({ type: "hambre", time: t })),
    ];
    const alertTimes = { alerta1h: alerta1, alerta3h: alerta2, emergencia6h: emergencia };

    const { error } = await supabase.from("dok_invitations").insert({
      familiar_id: familiarId || null, // link to admin familiar who created this invite
      code,
      familiar_name: familiarName.trim(),
      schedules,
      alert_times: alertTimes,
      pet_type: AVATARS.find(a => a.id === avatar)?.type || "cat",
    });

    if (!error) {
      setInviteCode(code);
    }
    setGenerating(false);
  };

  const handleFinish = async () => {
    const tz = COUNTRIES.find(c => c.code === pais)?.tz || "Europe/Madrid";
    if (familiarId) {
      // Update existing familiar profile
      await supabase.from("dok_familiares").update({
        familiar_name: nombre.trim(),
        country: pais,
        timezone: tz,
        onboarded: true,
      }).eq("id", familiarId);
    }
    // Store admin name in localStorage for session persistence
    localStorage.setItem("dok_admin_name", nombre.trim());
    localStorage.setItem("dok_admin_country", pais);
    localStorage.setItem("dok_onboarded", "true");
    onComplete();
  };

  const addComida = () => setComidas([...comidas, "18:00"]);
  const removeComida = (i: number) => {
    if (comidas.length <= 1) return;
    setComidas(comidas.filter((_, idx) => idx !== i));
  };
  const updateComida = (i: number, v: string) => {
    const c = [...comidas];
    c[i] = v;
    setComidas(c);
  };

  /* ── Styles ── */
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: "2px solid #dcfce7", fontSize: 16, outline: "none",
    background: "#f0fdf4", boxSizing: "border-box",
  };
  const selectStyle: React.CSSProperties = {
    ...inputStyle, cursor: "pointer", appearance: "auto",
  };
  const btnGreen: React.CSSProperties = {
    width: "100%", padding: "14px", borderRadius: 25,
    background: COLORS.primary, color: "white",
    fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer",
  };
  return (
    <div style={{
      width: "100%", minHeight: "100dvh", background: GRADIENTS.mint,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px 16px", boxSizing: "border-box",
    }}>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, marginTop: 12 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{
            width: i === step ? 28 : 10, height: 10, borderRadius: 5,
            background: i <= step ? COLORS.primary : "#ddd",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      <div style={{
        background: "rgba(255,255,255,0.9)", borderRadius: 24,
        padding: "28px 22px", width: "100%", maxWidth: 380,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>

        {/* ─── STEP 1: Tu perfil ─── */}
        {step === 0 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>👤</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "8px 0 4px" }}>
                Tu perfil
              </h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>
                ¿Cómo te llamas?
              </p>
            </div>

            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4, display: "block" }}>
              Tu nombre
            </label>
            <input
              type="text" value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Carlos, María..."
              style={{ ...inputStyle, marginBottom: 14 }}
              autoFocus
            />

            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4, display: "block" }}>
              Tu país
            </label>
            <select value={pais} onChange={e => setPais(e.target.value)} style={{ ...selectStyle, marginBottom: 14 }}>
              <option value="">Selecciona tu país</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>

            {isStepComplete(0) && (
              <p style={{ textAlign: "center", fontSize: 13, color: COLORS.primary, fontWeight: 600, margin: "8px 0 0" }}>
                ✓ Avanzando automáticamente...
              </p>
            )}
          </>
        )}

        {/* ─── STEP 2: Primer familiar ─── */}
        {step === 1 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>👨‍👩‍👧</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "8px 0 4px" }}>
                ¿A quién cuidas?
              </h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>
                Datos del familiar que usará la app
              </p>
            </div>

            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4, display: "block" }}>
              Nombre del familiar
            </label>
            <input
              type="text" value={familiarName} onChange={e => setFamiliarName(e.target.value)}
              placeholder="Ej: Mamá, Papá, Abuela..."
              style={{ ...inputStyle, marginBottom: 14 }}
              autoFocus
            />

            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4, display: "block" }}>
              País del familiar
            </label>
            <select value={familiarPais} onChange={e => setFamiliarPais(e.target.value)} style={{ ...selectStyle, marginBottom: 14 }}>
              <option value="">Selecciona país</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>

            <label style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4, display: "block" }}>
              Avatar de la mascota
            </label>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {AVATARS.map(a => (
                <div
                  key={a.id}
                  onClick={() => setAvatar(a.id)}
                  style={{
                    flex: 1, padding: "14px 10px", borderRadius: 16, textAlign: "center",
                    cursor: "pointer", transition: "all 0.2s",
                    background: avatar === a.id ? "#dcfce7" : "#f9fafb",
                    border: avatar === a.id ? `2px solid ${COLORS.primary}` : "2px solid #e5e7eb",
                  }}
                >
                  <span style={{ fontSize: 36 }}>{a.emoji}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, margin: "4px 0 0" }}>{a.name}</p>
                </div>
              ))}
              {/* Placeholder for future avatars */}
              <div style={{
                flex: 1, padding: "14px 10px", borderRadius: 16, textAlign: "center",
                background: "#f9fafb", border: "2px dashed #e5e7eb", opacity: 0.5,
              }}>
                <span style={{ fontSize: 36 }}>❓</span>
                <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0 0" }}>Próximamente</p>
              </div>
            </div>

            {isStepComplete(1) && (
              <p style={{ textAlign: "center", fontSize: 13, color: COLORS.primary, fontWeight: 600, margin: "8px 0 0" }}>
                ✓ Avanzando automáticamente...
              </p>
            )}
          </>
        )}

        {/* ─── STEP 3: Horarios ─── */}
        {step === 2 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>⏰</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "8px 0 4px" }}>
                Horarios de Fufy
              </h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>
                ¿Cuándo se despierta y come?
              </p>
            </div>

            <Card style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🌅</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>Despertar</span>
                </div>
                <input
                  type="time" value={despertar} onChange={e => setDespertar(e.target.value)}
                  style={{
                    fontSize: 16, fontWeight: 700, color: COLORS.text,
                    border: `2px solid ${COLORS.primary}`, borderRadius: 10,
                    padding: "4px 8px", background: "#f0fdf4", outline: "none",
                  }}
                />
              </div>
            </Card>

            {comidas.map((c, i) => (
              <Card key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🍽️</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>
                      Comida{comidas.length > 1 ? ` (${i + 1})` : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="time" value={c} onChange={e => updateComida(i, e.target.value)}
                      style={{
                        fontSize: 16, fontWeight: 700, color: COLORS.text,
                        border: `2px solid ${COLORS.primary}`, borderRadius: 10,
                        padding: "4px 8px", background: "#f0fdf4", outline: "none",
                      }}
                    />
                    {comidas.length > 1 && (
                      <button onClick={() => removeComida(i)} style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: "#fee2e2", color: "#ef4444", border: "none",
                        fontSize: 14, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>✕</button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            <button onClick={addComida} style={{
              width: "100%", padding: "10px", borderRadius: 12,
              background: "transparent", border: `2px dashed ${COLORS.primary}`,
              color: COLORS.primary, fontSize: 14, fontWeight: 700,
              cursor: "pointer", marginBottom: 16,
            }}>
              ＋ Añadir hora de comida
            </button>

            <button onClick={() => setStep(3)} style={btnGreen}>
              Siguiente →
            </button>
          </>
        )}

        {/* ─── STEP 4: Tiempos de alerta ─── */}
        {step === 3 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>🚨</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "8px 0 4px" }}>
                Tiempos de alerta
              </h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>
                ¿Cuándo te avisamos?
              </p>
            </div>

            {[
              { label: "Primera alerta", emoji: "⚠️", desc: "Aviso inicial", value: alerta1, set: setAlerta1 },
              { label: "Segunda alerta", emoji: "🔴", desc: "Escalamiento", value: alerta2, set: setAlerta2 },
              { label: "Emergencia", emoji: "🚨", desc: "Alerta máxima", value: emergencia, set: setEmergencia },
            ].map((a, i) => (
              <Card key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{a.emoji}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, margin: 0 }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{a.desc}</p>
                    </div>
                  </div>
                  <select value={a.value} onChange={e => a.set(Number(e.target.value))} style={{
                    fontSize: 16, fontWeight: 800, color: COLORS.primary,
                    background: "#f0fdf4", border: "2px solid #dcfce7",
                    borderRadius: 10, padding: "4px 8px", cursor: "pointer", outline: "none",
                  }}>
                    {ALERT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </Card>
            ))}

            <button onClick={() => setStep(4)} style={{ ...btnGreen, marginTop: 8 }}>
              Siguiente →
            </button>
          </>
        )}

        {/* ─── STEP 5: Enlace de invitación ─── */}
        {step === 4 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>🔗</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "8px 0 4px" }}>
                Enlace de invitación
              </h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>
                Envía este enlace a {familiarName || "tu familiar"} para que se registre
              </p>
            </div>

            {generating && (
              <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>Generando enlace...</p>
            )}

            {inviteCode && (
              <Card style={{ textAlign: "center", padding: "20px 16px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/avatars/misi-base-saludando.png"
                  alt="Fufy saludando"
                  style={{ width: 120, height: 120, objectFit: "contain", margin: "0 auto 8px" }}
                />
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: "0 0 4px" }}>
                  ¡Enlace listo para {familiarName}!
                </p>
                <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 16px" }}>
                  Compártelo para que conozca a Fufy 🐱
                </p>
                <ShareButtons url={`${BASE_URL}/u/${inviteCode}`} recipientName={familiarName} onShare={() => setLinkShared(true)} />
              </Card>
            )}

            {/* Post-share message */}
            {linkShared && (
              <div style={{
                marginTop: 16, padding: "16px", borderRadius: 16,
                background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                border: "2px solid #6ee7b7", textAlign: "center",
              }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#059669", margin: "0 0 4px" }}>
                  ✅ ¡Enlace compartido!
                </p>
                <p style={{ fontSize: 13, color: "#047857", margin: 0 }}>
                  Ya puedes entrar al panel de control para ver la actividad
                </p>
              </div>
            )}

            {/* Dashboard button */}
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 8px" }}>
                {linkShared ? "👇 Entra a tu panel de control" : "👇 Comparte el enlace y entra a gestionar"}
              </p>
              <button onClick={async () => {
                await handleFinish();
                // Always go to familiar panel (where you monitor the pet's activity)
                window.location.href = "/familiar";
              }} style={{
                ...btnGreen, marginTop: 0,
                background: linkShared ? "#7c3aed" : COLORS.primary,
                fontSize: 17, padding: "16px 32px",
                animation: linkShared ? "pulse-btn 2s infinite" : "none",
                boxShadow: linkShared ? "0 0 20px rgba(124, 58, 237, 0.4)" : "none",
              }}>
                🚀 {linkShared ? "Ver el panel de mi familiar" : "Ir al panel"}
              </button>
            </div>

            <style>{`
              @keyframes pulse-btn {
                0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(124, 58, 237, 0.4); }
                50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(124, 58, 237, 0.6); }
              }
            `}</style>

            <div style={{
              marginTop: 16, padding: "12px 14px", borderRadius: 12,
              background: "#f9fafb", border: "1px solid #e5e7eb", textAlign: "center",
            }}>
              <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
                👁️ Añadir visor (solo lectura) — <em>Próximamente</em>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Back button for steps 1-4 */}
      {step > 0 && step < 4 && (
        <button onClick={() => setStep(s => s - 1)} style={{
          marginTop: 16, background: "none", border: "none",
          color: COLORS.textMuted, fontSize: 14, cursor: "pointer",
        }}>
          ← Volver
        </button>
      )}
    </div>
  );
}
