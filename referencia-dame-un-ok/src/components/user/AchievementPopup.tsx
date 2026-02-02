"use client";
import { useEffect } from "react";
import type { Achievement } from "../../lib/constants/achievements";

interface Props {
  achievement: Achievement;
  onDismiss: () => void;
}

export default function AchievementPopup({ achievement, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.4)",
      animation: "achieveFadeIn 0.3s ease",
    }}>
      {/* Confetti particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF69B4'][i % 6],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            left: `${10 + Math.random() * 80}%`,
            top: "-10%",
            animation: `achieveConfetti ${1.5 + Math.random() * 2}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }} />
        ))}
      </div>

      <div onClick={onDismiss} style={{
        background: "white",
        borderRadius: 24,
        padding: "32px 28px",
        textAlign: "center",
        maxWidth: 300,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "achievePopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor: "pointer",
      }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{achievement.emoji}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#FFB800", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          ¡Logro desbloqueado!
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>
          {achievement.name}
        </div>
        <div style={{ fontSize: 15, color: "#666", lineHeight: 1.4 }}>
          {achievement.description}
        </div>
      </div>

      <style>{`
        @keyframes achieveFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes achievePopIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes achieveConfetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
