"use client";
import { useState } from "react";
import { getFufyLevel, getUnlockedAccessories, getNextLevel, getLevelProgress } from "../../lib/constants/fufy-evolution";
import type { Achievement } from "../../lib/constants/achievements";

interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
}

interface Props {
  streak: number;
  achievements: AchievementWithStatus[];
}

export default function FufyEvolution({ streak, achievements }: Props) {
  const [showPanel, setShowPanel] = useState(false);
  const level = getFufyLevel(streak);
  const nextLevel = getNextLevel(streak);
  const progress = getLevelProgress(streak);
  const accessories = getUnlockedAccessories(streak);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          zIndex: 20,
          background: "rgba(255,255,255,0.9)",
          border: "none",
          borderRadius: 16,
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>🏆</span>
        <span>{unlockedCount}/{achievements.length}</span>
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
    }}>
      <div style={{
        background: "white",
        borderRadius: "24px 24px 0 0",
        width: "100%",
        maxWidth: 420,
        maxHeight: "80vh",
        overflowY: "auto",
        padding: "24px 20px 40px",
        animation: "slideUp 0.3s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>🏆 Logros de Fufy</h2>
          <button onClick={() => setShowPanel(false)} style={{
            background: "#f0f0f0", border: "none", borderRadius: 12,
            width: 36, height: 36, fontSize: 18, cursor: "pointer",
          }}>✕</button>
        </div>

        {/* Level info */}
        <div style={{
          background: "linear-gradient(135deg, #fff8e1, #fff3cd)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 36 }}>{level.emoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>
                Nivel {level.level}: {level.name}
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                {streak} días de racha
              </div>
            </div>
          </div>

          {nextLevel && (
            <>
              <div style={{
                background: "#e0e0e0",
                borderRadius: 8,
                height: 10,
                overflow: "hidden",
                marginBottom: 6,
              }}>
                <div style={{
                  background: "linear-gradient(90deg, #FFB800, #FF8C00)",
                  height: "100%",
                  width: `${progress * 100}%`,
                  borderRadius: 8,
                  transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ fontSize: 12, color: "#888", textAlign: "right" }}>
                {nextLevel.minDays - streak} días para {nextLevel.name} {nextLevel.emoji}
              </div>
            </>
          )}
        </div>

        {/* Accessories */}
        {accessories.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#666", marginBottom: 8 }}>
              Accesorios desbloqueados
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {accessories.map(a => (
                <div key={a.name} style={{
                  background: "#f8f8f8",
                  borderRadius: 12,
                  padding: "6px 12px",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  <span>{a.emoji}</span>
                  <span style={{ fontWeight: 600 }}>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements grid */}
        <div style={{ fontSize: 14, fontWeight: 700, color: "#666", marginBottom: 10 }}>
          Logros ({unlockedCount}/{achievements.length})
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {achievements.map(a => (
            <div key={a.id} style={{
              background: a.unlocked ? "#f0fdf4" : "#f5f5f5",
              border: a.unlocked ? "2px solid #86efac" : "2px solid #e5e5e5",
              borderRadius: 14,
              padding: 12,
              opacity: a.unlocked ? 1 : 0.5,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 4, filter: a.unlocked ? "none" : "grayscale(1)" }}>
                {a.emoji}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
                {a.name}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                {a.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}
