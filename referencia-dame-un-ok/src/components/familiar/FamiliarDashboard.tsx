"use client";
import { useState, useEffect, useCallback } from "react";
import type { AlertLevel, FamiliarTab } from "../../lib/types/familiar";
import { GRADIENTS, COLORS } from "../../lib/constants/theme";
import { TEST_MODE } from "../../lib/constants/alerts";
import { calculateAlertLevel, createAlert } from "../../lib/services/alerts";
import { supabase } from "../../lib/services/supabase";
import TabBar from "../ui/TabBar";
import GearIcon from "../ui/icons/GearIcon";
import TabInicio from "./TabInicio";
import TabFamiliares from "./TabFamiliares";
import TabAlertas from "./TabAlertas";
import TabAjustes from "./TabAjustes";
import { subscribeToPush } from "../../lib/services/push";
import { notifyFamiliar, notifyCheckIn } from "../../lib/services/notifications";
import { calculateStreak as calculateStreakService } from "../../lib/services/streak";

/* 🎛️ FORCE para capturas — dejar "" para normal */
const FORCE_TAB: string = "";
const FORCE_ESTADO: string = "";

interface Props {
  userId?: string;
  role?: "admin" | "viewer";
  familiarId?: string;
}

export default function FamiliarDashboard({ userId, role = "admin", familiarId }: Props) {
  const [tab, setTab] = useState<FamiliarTab>("inicio");
  const [estado, setEstado] = useState<AlertLevel>("esperando");
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [prevAlertLevel, setPrevAlertLevel] = useState<AlertLevel>("esperando");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [userFullName, setUserFullName] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [dndUntil, setDndUntil] = useState<string | null>(null);
  const [batteryLow, setBatteryLow] = useState(false);
  const [lastLat, setLastLat] = useState<number | null>(null);
  const [lastLng, setLastLng] = useState<number | null>(null);
  const [todayActions, setTodayActions] = useState<{ action: string; time: string }[]>([]);

  // Auto-subscribe to push notifications on mount
  useEffect(() => {
    if (!userId) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    if (Notification.permission === "granted") {
      // Already granted — ensure subscription exists
      subscribeToPush(userId).then(ok => setPushEnabled(ok));
    } else if (Notification.permission !== "denied") {
      // Ask for permission automatically on first visit
      subscribeToPush(userId).then(ok => setPushEnabled(ok));
    }
  }, [userId]);

  const activeTab = FORCE_TAB || tab;
  const activeEstado = FORCE_ESTADO || estado;

  // Load user profile info
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("dok_users")
      .select("name, email, pet_name, phone, dnd_until, battery_low, last_lat, last_lng")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setUserName(data.name || "Usuario");
          setUserFullName(data.email || "");
          setUserPhone(data.phone || "");
          setDndUntil(data.dnd_until || null);
          setBatteryLow(data.battery_low || false);
          setLastLat(data.last_lat || null);
          setLastLng(data.last_lng || null);
        }
      });
  }, [userId]);

  // Calculate streak from consecutive days with check-ins
  const calculateStreak = useCallback(async () => {
    if (!userId) return;
    const count = await calculateStreakService(userId);
    setStreak(count);
  }, [userId]);

  // Calculate alert level from last check-in AND today's actions
  const updateAlertLevel = useCallback(async () => {
    if (!userId) return;

    // Re-fetch dnd_until and battery_low
    const { data: userData } = await supabase
      .from("dok_users")
      .select("dnd_until, battery_low, last_lat, last_lng, force_wake_until")
      .eq("id", userId)
      .single();

    if (userData) {
      setDndUntil(userData.dnd_until || null);
      setBatteryLow(userData.battery_low || false);
      setLastLat(userData.last_lat || null);
      setLastLng(userData.last_lng || null);
    }

    // Check DND
    if (userData?.dnd_until && new Date(userData.dnd_until) > new Date()) {
      // User is in DND mode — don't escalate
      setEstado("esperando");
      return;
    }

    // Check if admin force-waked Fufy
    if (userData?.force_wake_until && new Date(userData.force_wake_until) > new Date()) {
      setEstado("hambre"); // admin forced wake
      return;
    }

    // Check today's check-ins including alarm_dismiss
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayCheckins } = await supabase
      .from("dok_check_ins")
      .select("actions, created_at")
      .eq("user_id", userId)
      .gte("created_at", today.toISOString());

    if (todayCheckins && todayCheckins.length > 0) {
      const uniqueActions = new Set<string>();
      const actionsList: { action: string; time: string }[] = [];
      for (const ci of todayCheckins) {
        if (Array.isArray(ci.actions)) {
          ci.actions.forEach((a: string) => {
            uniqueActions.add(a);
            actionsList.push({ action: a, time: ci.created_at });
          });
        }
      }
      setTodayActions(actionsList);

      // alarm_dismiss counts as "ok" (basic confirmation)
      // All 3 actions (alimentar + mimar + jugar) = "eufórico" bonus
      const hasAllThree = uniqueActions.has("alimentar") && uniqueActions.has("mimar") && uniqueActions.has("jugar");
      const hasAlarmDismiss = uniqueActions.has("alarm_dismiss");

      if (hasAllThree || hasAlarmDismiss) {
        setEstado("ok");
        setLastCheckIn(todayCheckins[todayCheckins.length - 1]?.created_at || null);
        if (prevAlertLevel !== "ok") {
          notifyCheckIn(userId).catch(() => {});
        }
        setPrevAlertLevel("ok");
        calculateStreak();
        return;
      }
    }

    const { data } = await supabase
      .from("dok_check_ins")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setLastCheckIn(data.created_at);
      const minutes = (Date.now() - new Date(data.created_at).getTime()) / 60000;
      const level = calculateAlertLevel(minutes);
      setEstado(level);

      if (level !== prevAlertLevel) {
        if (level === "ok" || level === "esperando") {
          if (prevAlertLevel !== "ok" && prevAlertLevel !== "esperando") {
            notifyCheckIn(userId).catch(() => {});
          }
        } else {
          const msgs: Record<string, string> = {
            alerta1h: "Sin respuesta durante 1 hora",
            alerta3h: "Sin respuesta durante 3 horas - Contactos notificados",
            emergencia6h: "EMERGENCIA - Sin respuesta durante 6+ horas",
          };
          if (msgs[level]) {
            // Deduplicate: check if unresolved alert of same level already exists
            const { data: existingAlert } = await supabase
              .from("dok_alertas")
              .select("id")
              .eq("user_id", userId)
              .eq("nivel", level)
              .eq("resolved", false)
              .limit(1);

            if (!existingAlert || existingAlert.length === 0) {
              await createAlert(userId, level, msgs[level]);
              notifyFamiliar(userId, level).catch(() => {});
            }
          }
        }
      }
      setPrevAlertLevel(level);
      calculateStreak();
    } else {
      setEstado("esperando");
      setLastCheckIn(null);
    }
  }, [userId, prevAlertLevel, calculateStreak]);

  // Initial load + interval (TEST_MODE: 1s, normal: 60s)
  useEffect(() => {
    updateAlertLevel();
    const interval = setInterval(updateAlertLevel, TEST_MODE ? 1000 : 60000);
    return () => clearInterval(interval);
  }, [updateAlertLevel]);

  // Real-time subscription for check-ins AND user profile changes
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("familiar_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dok_check_ins", filter: `user_id=eq.${userId}` },
        () => { updateAlertLevel(); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "dok_users", filter: `id=eq.${userId}` },
        (payload) => {
          const d = payload.new as Record<string, unknown>;
          if (d.name) setUserName(d.name as string);
          if (d.email) setUserFullName(d.email as string);
          if (d.phone) setUserPhone(d.phone as string);
          setDndUntil((d.dnd_until as string) || null);
          setBatteryLow((d.battery_low as boolean) || false);
          setLastLat((d.last_lat as number) || null);
          setLastLng((d.last_lng as number) || null);
          updateAlertLevel();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, updateAlertLevel]);

  return (
    <div style={{
      width: "100%",
      height: "100dvh",
      background: GRADIENTS.mint,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Blobs */}
      <div style={{ position: "absolute", top: 30, right: -50, width: 200, height: 200, borderRadius: "50%", background: COLORS.blob1 }} />
      <div style={{ position: "absolute", top: 280, left: -70, width: 240, height: 240, borderRadius: "50%", background: COLORS.blob2 }} />

      {/* Auth Header removed — familiar view should not show Salir/Invitar */}

      {/* Header */}
      <div style={{ padding: "14px 18px 0", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 22, color: COLORS.text, cursor: "pointer" }}>←</span>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: COLORS.text }}>Dame un Ok</h1>
          <GearIcon active={false} />
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: COLORS.textMuted, margin: "0 0 10px" }}>
          Tu tranquilidad diaria, un toque a la vez
        </p>
      </div>

      {/* Viewer badge */}
      {role === "viewer" && (
        <div style={{ textAlign: "center", zIndex: 10, margin: "0 16px 8px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", background: "#fef3c7", padding: "4px 12px", borderRadius: 12 }}>
            👁️ Modo visor
          </span>
        </div>
      )}

      {/* Tab content */}
      {activeTab === "inicio" && (
        <TabInicio
          estado={activeEstado}
          lastCheckIn={lastCheckIn}
          streak={streak}
          userName={userName}
          userFullName={userFullName}
          userId={userId}
          userPhone={userPhone}
          dndUntil={dndUntil}
          batteryLow={batteryLow}
          lastLat={lastLat}
          lastLng={lastLng}
          todayActions={todayActions}
        />
      )}
      {activeTab === "familiares" && <TabFamiliares userId={userId} />}
      {activeTab === "alertas" && <TabAlertas userId={userId} />}
      {activeTab === "ajustes" && <TabAjustes userId={userId} pushEnabled={pushEnabled} onEnablePush={async () => { if(userId) { const ok = await subscribeToPush(userId); setPushEnabled(ok); }}} role={role} familiarId={familiarId} />}

      <TabBar activeTab={activeTab} onTabChange={setTab} />
    </div>
  );
}
