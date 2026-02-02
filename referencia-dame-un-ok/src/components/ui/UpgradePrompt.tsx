"use client";
import { useRouter } from "next/navigation";

interface Props {
  feature: string;
  description?: string;
}

export default function UpgradePrompt({ feature, description }: Props) {
  const router = useRouter();

  return (
    <div style={{
      background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
      border: "2px solid #bbf7d0",
      borderRadius: 16,
      padding: "16px 18px",
      textAlign: "center",
    }}>
      <p style={{ fontSize: 15, fontWeight: 800, color: "#2d3436", margin: "0 0 4px" }}>
        🔒 {feature}
      </p>
      {description && (
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 10px" }}>
          {description}
        </p>
      )}
      <button
        onClick={() => router.push("/pricing")}
        style={{
          width: "100%",
          padding: "11px",
          borderRadius: 14,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "white",
          fontSize: 14,
          fontWeight: 800,
          border: "none",
          cursor: "pointer",
        }}
      >
        ✨ Desbloquear con Premium — €4.99/mes
      </button>
    </div>
  );
}
