"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/context/AuthContext";
import AlarmScreen from "../components/alarm/AlarmScreen";
import UserScreen from "../components/user/UserScreen";
import OnboardingFlow from "../components/onboarding/OnboardingFlow";
import { supabase } from "../lib/services/supabase";

type ScreenMode = "alarm" | "user" | "sleeping";
type AlertLevel = "normal" | "alerta1h" | "alerta3h" | "emergencia6h";

export default function Home() {
  const { role, dokUser, dokFamiliar } = useAuth();
  const [screen, setScreen] = useState<ScreenMode>("user");
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("normal");
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [wakeTime, setWakeTime] = useState<string | null>(null);
  const router = useRouter();

  // Determine screen based on schedules and check-ins
  const determineScreen = useCallback(async () => {
    if (!dokUser?.id) return;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check if there's already a check-in today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const { data: todayCheckins } = await supabase
      .from("dok_check_ins")
      .select("id, created_at")
      .eq("user_id", dokUser.id)
      .gte("created_at", todayStart.toISOString());

    const hasCheckinToday = todayCheckins && todayCheckins.length > 0;

    // Get schedules
    const { data: schedules } = await supabase
      .from("dok_schedules")
      .select("type, time")
      .eq("user_id", dokUser.id);

    if (!schedules || schedules.length === 0) {
      // No schedules: show alarm if no check-in today, otherwise user screen
      setScreen(hasCheckinToday ? "user" : "alarm");
      return;
    }

    // Parse schedule times to minutes
    const parsedSchedules = schedules.map(s => {
      const [h, m] = (s.time || "09:00").split(":").map(Number);
      return { type: s.type as string, minutes: h * 60 + m, time: s.time as string };
    });

    // Find wake time (despertar schedule)
    const wakeSchedule = parsedSchedules.find(s => s.type === "despertar");
    const wakeMinutes = wakeSchedule ? wakeSchedule.minutes : parsedSchedules[0]?.minutes || 540; // default 9:00
    
    if (wakeSchedule) {
      setWakeTime(wakeSchedule.time);
    }

    // Check if admin forced a wake-up
    const { data: userData } = await supabase
      .from("dok_users")
      .select("force_wake_until")
      .eq("id", dokUser.id)
      .single();
    const forceWake = userData?.force_wake_until && new Date(userData.force_wake_until) > now;

    // Before wake time - 30min: sleeping (unless it's meal time or force-waked)
    if (currentMinutes < wakeMinutes - 30 && !forceWake) {
      // Check if current time is within ±30min of any scheduled meal
      const mealSchedules = parsedSchedules.filter(s => s.type === "comida" || s.type === "cena" || s.type === "hambre");
      const isNearMealTime = mealSchedules.some(s =>
        Math.abs(currentMinutes - s.minutes) <= 30
      );
      if (!isNearMealTime) {
        setScreen("sleeping");
        return;
      }
      // It's meal time — fall through to show alarm/user screen
    }

    // If force-waked by admin, always show alarm (hungry)
    if (forceWake) {
      setScreen("alarm");
      return;
    }

    // If already checked in today, show user screen
    if (hasCheckinToday) {
      setScreen("user");
      return;
    }

    // Check if we're within ±30min of any schedule
    const WINDOW = 30;
    const inScheduleWindow = parsedSchedules.some(s => 
      Math.abs(currentMinutes - s.minutes) <= WINDOW
    );

    // Check for pending alerts
    const { data: pendingAlerts } = await supabase
      .from("dok_alertas")
      .select("id")
      .eq("user_id", dokUser.id)
      .eq("resolved", false)
      .gte("created_at", todayStr + "T00:00:00");

    const hasPendingAlert = pendingAlerts && pendingAlerts.length > 0;

    if (inScheduleWindow || hasPendingAlert) {
      // Determine alert level based on pending alerts
      if (hasPendingAlert && pendingAlerts) {
        const { data: alertLevels } = await supabase
          .from("dok_alertas")
          .select("nivel")
          .eq("user_id", dokUser.id)
          .eq("resolved", false)
          .gte("created_at", todayStr + "T00:00:00")
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (alertLevels && alertLevels.length > 0) {
          const nivel = alertLevels[0].nivel;
          if (nivel === "emergencia6h" || nivel === "alerta3h" || nivel === "alerta1h") {
            setAlertLevel(nivel as AlertLevel);
          } else {
            setAlertLevel("normal");
          }
        } else {
          setAlertLevel("normal");
        }
      } else {
        setAlertLevel("normal");
      }
      setScreen("alarm");
    } else {
      setScreen("user");
    }
  }, [dokUser?.id]);

  useEffect(() => {
    determineScreen();
    // Re-check every 60 seconds
    const interval = setInterval(determineScreen, 60000);
    return () => clearInterval(interval);
  }, [determineScreen]);

  // Familiar flow → redirect to /familiar
  useEffect(() => {
    if (role === "familiar" && dokFamiliar) {
      router.replace("/familiar");
    }
  }, [role, dokFamiliar, router]);

  if (role === "familiar" && dokFamiliar) {
    return null;
  }

  // "Estoy aquí" = primer check-in para el familiar
  const handleAlarmDismiss = async () => {
    const userId = dokUser?.id;
    if (userId) {
      await supabase.from("dok_check_ins").insert({
        user_id: userId,
        actions: ["alimentar"],
        device_type: "smartphone",
      });
      await supabase
        .from("dok_users")
        .update({ last_check_in: new Date().toISOString(), force_wake_until: null })
        .eq("id", userId);
      await supabase
        .from("dok_alertas")
        .update({ resolved: true })
        .eq("user_id", userId)
        .eq("resolved", false);
    }
    setScreen("user");
  };

  // User flow - check onboarding
  if (role === "user" && dokUser) {
    const isOnboarded = dokUser.onboarded === true;
    if (!isOnboarded && onboarded !== true) {
      return (
        <OnboardingFlow
          userId={dokUser.id}
          userName={dokUser.name}
          onComplete={() => setOnboarded(true)}
        />
      );
    }

    if (screen === "sleeping") {
      return (
        <div style={{
          width: "100%",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #1a237e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 100%)",
          padding: 24,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Ambient blobs */}
          <div style={{ position: "absolute", top: 60, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(63,81,181,0.15)" }} />
          <div style={{ position: "absolute", bottom: 120, left: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(48,63,159,0.12)" }} />

          <p style={{ fontSize: 40, fontWeight: 800, color: "#e0e0e0", textAlign: "center", margin: "0 0 20px 0", letterSpacing: 1, zIndex: 1 }}>
            Fufy
          </p>
          <div style={{ position: "relative", width: 200, height: 200, marginBottom: 24, zIndex: 1 }}>
            <div style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "5px solid rgba(255,255,255,0.25)",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <img src="/avatars/fondo-suelo-noche.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <img
              src="/avatars/misi-dormido.png"
              alt="Fufy dormido"
              style={{
                position: "absolute",
                width: "105%",
                height: "auto",
                bottom: "-32%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 5,
                filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.3))",
              }}
            />
          </div>
          <p style={{ fontSize: 38, fontWeight: 700, color: "#8899aa", textAlign: "center", margin: "48px 0 8px 0", zIndex: 1 }}>
            Zzz...
          </p>
          <p style={{ fontSize: 18, color: "#6678aa", textAlign: "center", margin: 0, zIndex: 1 }}>
            Vuelve a las {wakeTime || "09:00"}
          </p>
        </div>
      );
    }

    if (screen === "alarm") {
      return <AlarmScreen onCheckIn={handleAlarmDismiss} alertLevel={alertLevel} />;
    }

    return <UserScreen userId={dokUser.id} userName={dokUser.name} />;
  }

  // Default
  if (screen === "alarm") {
    return <AlarmScreen onCheckIn={handleAlarmDismiss} alertLevel={alertLevel} />;
  }

  return <UserScreen userId={dokUser?.id} userName={dokUser?.name} />;
}
