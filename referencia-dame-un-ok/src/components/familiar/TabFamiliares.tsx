"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/services/supabase";
import Card from "../ui/Card";
import { PET_AVATARS } from "../../lib/constants/pets";
import AddFamiliarFlow from "./AddFamiliarFlow";

interface Props {
  userId?: string;
}

interface FamiliarRow {
  id: string;
  familiar_name: string;
  relacion: string;
  rol?: string;
  user_name?: string;
  pet_name?: string;
  streak?: number;
  last_check_in?: string | null;
}

export default function TabFamiliares({ userId }: Props) {
  const [familiares, setFamiliares] = useState<FamiliarRow[]>([]);
  const [showAddFlow, setShowAddFlow] = useState(false);

  const loadFamiliares = useCallback(async () => {
    if (!userId) return;
    const { data: fams } = await supabase
      .from("dok_familiares")
      .select("id, familiar_name, relacion, rol, user_id")
      .eq("user_id", userId);
    if (!fams) return;

    const { data: user } = await supabase
      .from("dok_users")
      .select("name, pet_name, streak, last_check_in")
      .eq("id", userId)
      .single();

    const enriched = fams.map(f => ({
      ...f,
      user_name: user?.name || "Usuario",
      pet_name: user?.pet_name || "Fufy",
      streak: user?.streak || 0,
      last_check_in: user?.last_check_in || null,
    }));
    setFamiliares(enriched);
  }, [userId]);

  useEffect(() => { loadFamiliares(); }, [loadFamiliares]);

  const getStatus = (lastCheckIn: string | null) => {
    if (!lastCheckIn) return { text: "Esperando", color: "#eab308" };
    const minutes = (Date.now() - new Date(lastCheckIn).getTime()) / 60000;
    if (minutes < 60) return { text: "Esta bien", color: "#22c55e" };
    if (minutes < 360) return { text: "Sin respuesta", color: "#eab308" };
    return { text: "Emergencia", color: "#ef4444" };
  };

  const getAvatar = (lastCheckIn: string | null) => {
    if (!lastCheckIn) return PET_AVATARS.esperando;
    const minutes = (Date.now() - new Date(lastCheckIn).getTime()) / 60000;
    if (minutes < 60) return PET_AVATARS.euforico;
    if (minutes < 360) return PET_AVATARS.triste;
    return PET_AVATARS.enfermo;
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
      <p style={{ fontSize: 24, fontWeight: 800, color: "#2d3436", margin: "0 0 14px" }}>Mis familiares</p>

      {/* Add familiar flow */}
      {showAddFlow ? (
        <AddFamiliarFlow
          userId={userId}
          onComplete={() => { setShowAddFlow(false); loadFamiliares(); }}
          onCancel={() => setShowAddFlow(false)}
        />
      ) : (
        <>
          {familiares.length === 0 && (
            <Card>
              <p style={{ textAlign: "center", color: "#888", fontSize: 15, margin: 0 }}>
                Aún no tienes familiares vinculados
              </p>
            </Card>
          )}

          {familiares.map((f) => {
            const status = getStatus(f.last_check_in || null);
            const petAvatar = getAvatar(f.last_check_in || null);
            const petName = f.pet_name || "Fufy";
            const streak = f.streak || 0;

            return (
              <Card key={f.id} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 16, color: "#2d3436", margin: "0 0 10px" }}>
                  <span style={{ fontWeight: 800 }}>{f.relacion || f.familiar_name}</span>
                  {f.user_name ? ` - ${f.user_name}` : ""}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", background: "#ddd",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#999">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M20 21v-2a8 8 0 0 0-16 0v2" />
                    </svg>
                  </div>

                  <div style={{ width: 36, height: 36, marginLeft: -12, flexShrink: 0 }}>
                    <img
                      src={petAvatar}
                      alt={petName}
                      style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.12))" }}
                    />
                  </div>

                  <span style={{ fontSize: 15, fontWeight: 700, color: "#2d3436" }}>{petName}</span>

                  <span style={{
                    marginLeft: "auto",
                    fontSize: 12, fontWeight: 700, color: "white",
                    background: status.color, borderRadius: 15,
                    padding: "5px 14px",
                  }}>
                    {status.text}
                  </span>
                </div>

                {streak > 0 && (
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                    {streak} días seguidos ⭐
                  </p>
                )}
              </Card>
            );
          })}

          {/* Always visible CTA */}
          <button
            onClick={() => setShowAddFlow(true)}
            style={{
              width: "100%", padding: "14px", borderRadius: 25,
              background: "#22c55e", color: "white", fontSize: 17, fontWeight: 800,
              border: "none", cursor: "pointer", marginTop: 8,
            }}
          >
            + Añadir familiar
          </button>
        </>
      )}
    </div>
  );
}
