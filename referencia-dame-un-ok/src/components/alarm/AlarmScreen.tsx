"use client";

interface Props {
  onCheckIn: () => void;
  alertLevel?: "normal" | "alerta1h" | "alerta3h" | "emergencia6h";
}

const ALARM_CONFIG = {
  normal: {
    avatar: "/avatars/misi-esperando.png",
    message: "¡Fufy se ha despertado y tiene hambre! 🍽️",
    button: "Alimentar a Fufy",
    bgColor: "linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)",
    textColor: "#2e7d32",
  },
  alerta1h: {
    avatar: "/avatars/misi-triste.png",
    message: "Fufy está triste... ¿le das de comer? 😿",
    button: "Dar de comer",
    bgColor: "linear-gradient(180deg, #fff8e1 0%, #ffecb3 100%)",
    textColor: "#f57f17",
  },
  alerta3h: {
    avatar: "/avatars/misi-enfermo.png",
    message: "Fufy no se encuentra bien 😿 Necesita que le cuides",
    button: "Cuidar a Fufy",
    bgColor: "linear-gradient(180deg, #fce4ec 0%, #f8bbd0 100%)",
    textColor: "#c62828",
  },
  emergencia6h: {
    avatar: "/avatars/misi-enfermo.png",
    message: "¡Fufy te necesita urgentemente! 🚨",
    button: "¡Ayudar a Fufy!",
    bgColor: "linear-gradient(180deg, #d32f2f 0%, #b71c1c 100%)",
    textColor: "#ffffff",
  },
};

export default function AlarmScreen({ onCheckIn, alertLevel = "normal" }: Props) {
  const config = ALARM_CONFIG[alertLevel] || ALARM_CONFIG.normal;

  return (
    <div
      onClick={onCheckIn}
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: config.bgColor,
        cursor: "pointer",
        padding: 24,
      }}
    >
      <img
        src={config.avatar}
        alt="Fufy"
        style={{
          width: 200,
          height: 200,
          objectFit: "contain",
          marginBottom: 24,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
        }}
      />
      <p style={{
        fontSize: 26,
        fontWeight: 800,
        color: config.textColor,
        textAlign: "center",
        margin: "0 0 32px 0",
        lineHeight: 1.4,
      }}>
        {config.message}
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); onCheckIn(); }}
        style={{
          padding: "18px 48px",
          fontSize: 24,
          fontWeight: 800,
          background: alertLevel === "emergencia6h" ? "#ffffff" : "#43a047",
          color: alertLevel === "emergencia6h" ? "#d32f2f" : "#ffffff",
          border: "none",
          borderRadius: 20,
          cursor: "pointer",
          minHeight: 64,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}
      >
        {config.button}
      </button>
    </div>
  );
}
