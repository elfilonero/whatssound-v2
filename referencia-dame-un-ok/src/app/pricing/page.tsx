"use client";
import { useRouter } from "next/navigation";
import { PLANS } from "../../lib/constants/plans";

const features = [
  { label: "Familiares", free: "1", premium: "Hasta 5" },
  { label: "Visores", free: "—", premium: "Hasta 3" },
  { label: "Alertas push", free: "✅", premium: "✅" },
  { label: "Alertas SMS", free: "—", premium: "✅" },
  { label: "Alertas email", free: "—", premium: "✅" },
  { label: "Geolocalización", free: "—", premium: "✅" },
  { label: "Verificación con foto", free: "—", premium: "✅" },
  { label: "Avatar personalizado", free: "—", premium: "✅" },
  { label: "Soporte prioritario", free: "—", premium: "✅" },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
      padding: "20px 16px",
    }}>
      <button
        onClick={() => router.push("/familiar")}
        style={{
          background: "none", border: "none", color: "#22c55e",
          fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 16,
        }}
      >
        ← Volver
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#2d3436", textAlign: "center", margin: "0 0 6px" }}>
        Elige tu plan
      </h1>
      <p style={{ fontSize: 14, color: "#888", textAlign: "center", margin: "0 0 20px" }}>
        Cuida de los tuyos con todas las herramientas
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {/* Free */}
        <div style={{
          flex: 1, background: "white", borderRadius: 16, padding: "16px 14px",
          border: "2px solid #e5e7eb", textAlign: "center",
        }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 4px" }}>
            {PLANS.free.name}
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#22c55e", margin: "0 0 4px" }}>
            Gratis
          </p>
          <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 12px" }}>Para siempre</p>
          <div style={{
            padding: "10px", borderRadius: 12, background: "#f3f4f6",
            color: "#888", fontSize: 14, fontWeight: 700,
          }}>
            Plan actual
          </div>
        </div>

        {/* Premium */}
        <div style={{
          flex: 1, background: "white", borderRadius: 16, padding: "16px 14px",
          border: "2px solid #22c55e", textAlign: "center", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
            background: "#22c55e", color: "white", fontSize: 11, fontWeight: 800,
            padding: "2px 12px", borderRadius: 10,
          }}>
            RECOMENDADO
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#2d3436", margin: "0 0 4px" }}>
            {PLANS.premium.name}
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#22c55e", margin: "0 0 4px" }}>
            €4.99
          </p>
          <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 12px" }}>/mes</p>
          <button
            disabled
            style={{
              width: "100%", padding: "10px", borderRadius: 12,
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white", fontSize: 14, fontWeight: 700,
              border: "none", opacity: 0.7, cursor: "default",
            }}
          >
            Próximamente
          </button>
        </div>
      </div>

      {/* Feature comparison */}
      <div style={{
        background: "white", borderRadius: 16, padding: "16px",
        border: "1px solid #e5e7eb",
      }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#2d3436", margin: "0 0 12px" }}>
          Comparación de funciones
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "8px 12px", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa" }}>Función</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textAlign: "center" }}>Básico</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textAlign: "center" }}>Premium</span>
          {features.map((f, i) => (
            <div key={i} style={{ display: "contents" }}>
              <span style={{ fontSize: 13, color: "#555" }}>{f.label}</span>
              <span style={{ fontSize: 13, color: "#888", textAlign: "center" }}>{f.free}</span>
              <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700, textAlign: "center" }}>{f.premium}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
