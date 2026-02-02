"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { COLORS } from "../../lib/constants/theme";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.15, duration: 0.4, ease: "easeOut" as const },
  }),
};

function Section({ children, bg, id, className }: { children: React.ReactNode; bg?: string; id?: string; className?: string }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`px-6 py-16 ${className || ""}`}
      style={{ background: bg || "transparent" }}
    >
      <div className="max-w-5xl mx-auto">{children}</div>
    </motion.section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      variants={fadeUp}
      custom={0}
      style={{
        fontSize: "clamp(24px, 5vw, 32px)",
        fontWeight: 900,
        color: COLORS.text,
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 1.2,
      }}
    >
      {children}
    </motion.h2>
  );
}

function CTAButton({ onClick, children, secondary }: { onClick: () => void; children: React.ReactNode; secondary?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        padding: "16px 40px",
        borderRadius: 16,
        background: secondary ? "rgba(255,255,255,0.9)" : COLORS.primary,
        color: secondary ? COLORS.primary : "#fff",
        fontSize: 18,
        fontWeight: 800,
        border: secondary ? `2px solid ${COLORS.primary}` : "none",
        cursor: "pointer",
        boxShadow: secondary ? "none" : "0 4px 20px rgba(34,197,94,0.4)",
        display: "inline-block",
      }}
    >
      {children}
    </motion.button>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const goFamiliar = () => router.push("/familiar");
  const goLogin = () => router.push("/login");

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "linear-gradient(180deg, #c0dece 0%, #e8f5e9 40%, #d4edda 100%)" }}>
      {/* ===== HERO ===== */}
      <Section>
        <div className="flex flex-col lg:flex-row items-center lg:gap-16">
          <motion.div variants={scaleIn} custom={0} className="lg:order-2 lg:flex-1 flex justify-center">
            <img
              src="/avatars/misi-base-saludando.png"
              alt="Fufy saludando"
              className="w-44 h-44 lg:w-64 lg:h-64 object-contain"
            />
          </motion.div>

          <div className="text-center lg:text-left lg:flex-1 mt-6 lg:mt-0">
            <motion.h1
              variants={fadeUp}
              custom={1}
              style={{
                fontSize: "clamp(36px, 8vw, 56px)",
                fontWeight: 900,
                color: COLORS.text,
                margin: "0 0 12px",
                lineHeight: 1.1,
              }}
            >
              Dame un OK
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              style={{
                fontSize: "clamp(18px, 4vw, 24px)",
                fontWeight: 700,
                color: COLORS.primary,
                margin: "0 0 12px",
                lineHeight: 1.3,
              }}
            >
              Cuida a los tuyos sin que se sientan vigilados
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={3}
              style={{
                fontSize: "clamp(15px, 3.5vw, 18px)",
                fontWeight: 500,
                color: COLORS.textLight,
                margin: "0 0 36px",
                lineHeight: 1.5,
                maxWidth: 500,
              }}
              className="mx-auto lg:mx-0"
            >
              Tu familiar cuida una mascota virtual. Tú recibes la tranquilidad de saber que está bien.
            </motion.p>

            <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row items-center lg:justify-start gap-3">
              <CTAButton onClick={goFamiliar}>Empezar gratis</CTAButton>
              <CTAButton onClick={goLogin} secondary>Ya tengo cuenta</CTAButton>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <Section bg="rgba(255,255,255,0.5)">
        <SectionTitle>¿Cómo funciona?</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {[
            { num: "1", emoji: "⚙️", title: "Configura", desc: "Añade a tu familiar, elige horarios y alertas" },
            { num: "2", emoji: "🔗", title: "Comparte el enlace", desc: "Tu familiar recibe a Fufy, su mascota virtual" },
            { num: "3", emoji: "😌", title: "Relájate", desc: "Recibe alertas solo si algo va mal" },
          ].map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i + 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: "#fff",
                borderRadius: 20,
                padding: "20px 24px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              }}
              className="lg:flex-col lg:text-center"
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {step.num}
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, margin: "0 0 4px" }}>
                  {step.emoji} {step.title}
                </p>
                <p style={{ fontSize: 15, color: COLORS.textLight, margin: 0, lineHeight: 1.4 }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ===== EL SECRETO DE FUFY ===== */}
      <Section>
        <SectionTitle>El secreto de Fufy 🤫</SectionTitle>

        <motion.div
          variants={fadeUp}
          custom={1}
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            marginBottom: 32,
          }}
          className="lg:max-w-2xl lg:mx-auto"
        >
          <p style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>
            Tu familiar no sabe que le cuidas
          </p>
          <p style={{ fontSize: 16, color: COLORS.textLight, margin: "0 0 4px", lineHeight: 1.5 }}>
            Para ellos, solo es una mascota virtual que alimentar cada día
          </p>
          <p style={{ fontSize: 16, color: COLORS.primary, fontWeight: 700, margin: 0 }}>
            Para ti, es la tranquilidad de saber que están bien
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { img: "/avatars/misi-contento.png", label: "Fufy contento", desc: "Tu familiar ha dado su OK hoy ✅", bg: "#e8f5e9" },
            { img: "/avatars/misi-triste.png", label: "Fufy triste", desc: "Llevan horas sin responder ⚠️", bg: "#fff8e1" },
            { img: "/avatars/misi-enfermo.png", label: "Fufy enfermo", desc: "Emergencia — es hora de actuar 🚨", bg: "#fce4ec" },
          ].map((state, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              custom={i + 1}
              style={{
                background: state.bg,
                borderRadius: 20,
                padding: "24px 16px",
                textAlign: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <img
                src={state.img}
                alt={state.label}
                style={{ width: 100, height: 100, objectFit: "contain", margin: "0 auto 12px", display: "block" }}
              />
              <p style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, margin: "0 0 6px" }}>{state.label}</p>
              <p style={{ fontSize: 14, color: COLORS.textLight, margin: 0, lineHeight: 1.4 }}>{state.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ===== ALERTAS INTELIGENTES ===== */}
      <Section bg="rgba(255,255,255,0.5)">
        <SectionTitle>Alertas inteligentes</SectionTitle>

        <div className="max-w-2xl mx-auto">
          {[
            { icon: "⚠️", time: "1h sin respuesta", action: "Primera alerta", color: "#f59e0b", bg: "#fffbeb" },
            { icon: "🔴", time: "3h sin respuesta", action: "Escalamiento a más familiares", color: "#ef4444", bg: "#fef2f2" },
            { icon: "🚨", time: "6h sin respuesta", action: "Emergencia — llamar, 112, ubicación", color: "#dc2626", bg: "#fce4ec" },
          ].map((alert, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i + 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: alert.bg,
                borderRadius: 20,
                padding: "18px 20px",
                marginBottom: 16,
                borderLeft: `4px solid ${alert.color}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}
            >
              <span style={{ fontSize: 32, flexShrink: 0 }}>{alert.icon}</span>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, margin: "0 0 2px" }}>{alert.time}</p>
                <p style={{ fontSize: 14, color: COLORS.textLight, margin: 0 }}>{alert.action}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={fadeUp}
          custom={4}
          style={{ textAlign: "center", fontSize: 15, color: COLORS.textMuted, fontWeight: 600, marginTop: 24 }}
        >
          ⏱ Configura los tiempos como quieras
        </motion.p>
      </Section>

      {/* ===== PLANES ===== */}
      <Section>
        <SectionTitle>Planes</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Básico */}
          <motion.div
            variants={scaleIn}
            custom={1}
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "32px 24px",
              textAlign: "center",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              border: `2px solid ${COLORS.primaryLight}`,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 800, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>
              Básico
            </p>
            <p style={{ fontSize: 40, fontWeight: 900, color: COLORS.text, margin: "0 0 4px" }}>Gratis</p>
            <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "0 0 24px" }}>Para siempre</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", textAlign: "left" }}>
              {["1 familiar", "Alertas push", "Mascota virtual Fufy", "Configuración de horarios"].map((f, i) => (
                <li key={i} style={{ fontSize: 15, color: COLORS.textLight, padding: "6px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: COLORS.primary, fontWeight: 800 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <CTAButton onClick={goFamiliar}>Empezar gratis</CTAButton>
          </motion.div>

          {/* Premium */}
          <motion.div
            variants={scaleIn}
            custom={2}
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              borderRadius: 24,
              padding: "32px 24px",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(34,197,94,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute",
              top: 12,
              right: -28,
              background: "#fbbf24",
              color: "#78350f",
              fontSize: 11,
              fontWeight: 800,
              padding: "4px 32px",
              transform: "rotate(45deg)",
            }}>
              POPULAR
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>
              Premium
            </p>
            <p style={{ fontSize: 40, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>
              €4.99<span style={{ fontSize: 16, fontWeight: 600 }}>/mes</span>
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 0 24px" }}>Cancela cuando quieras</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", textAlign: "left" }}>
              {["Hasta 5 familiares", "Alertas SMS + Email", "Geolocalización", "Foto del mayor", "Soporte prioritario"].map((f, i) => (
                <li key={i} style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", padding: "6px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 800 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={goFamiliar}
              style={{
                padding: "16px 40px",
                borderRadius: 16,
                background: "#fff",
                color: COLORS.primary,
                fontSize: 18,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
              }}
            >
              Probar Premium
            </motion.button>
          </motion.div>
        </div>
      </Section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: "40px 24px",
        textAlign: "center",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.3)",
      }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: "0 0 16px" }}>
          Dame un OK © 2026
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "Privacidad", href: "#" },
            { label: "Términos", href: "#" },
            { label: "Contacto", href: "#" },
          ].map((link, i) => (
            <a
              key={i}
              href={link.href}
              style={{ fontSize: 14, color: COLORS.textMuted, textDecoration: "none", fontWeight: 600 }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>
          Cuidando a quienes más quieres 💚
        </p>
      </footer>
    </div>
  );
}
