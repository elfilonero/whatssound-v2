"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePetState } from "../../lib/hooks/usePetState";
import { COLORS } from "../../lib/constants/theme";
import { PET_AVATARS, PET_FEELINGS, PET_BACKGROUNDS, PET_GRADIENTS } from "../../lib/constants/pets";
import type { PetMood, ActionState } from "../../lib/types/user";
import ActionButtons from "./ActionButtons";
import { PET_DISPLAY } from "../../lib/constants/theme";
import { DEFAULT_PET_NAME } from "../../lib/constants/pets";
import Confetti from "../ui/Confetti";
import { supabase } from "../../lib/services/supabase";
import { calculateStreak as calculateStreakService } from "../../lib/services/streak";
import { useAchievements } from "../../lib/hooks/useAchievements";
import type { UserStats } from "../../lib/hooks/useAchievements";
import AchievementPopup from "./AchievementPopup";
import FufyEvolution from "./FufyEvolution";
import { getFufyLevel, getUnlockedAccessories } from "../../lib/constants/fufy-evolution";

// 🎛️ FORCE_STATE: cambiar para capturas, dejar "" para lógica normal
const FORCE_STATE: string = "";

interface Props {
  userId?: string;
  userName?: string;
}

export default function UserScreen({ userId }: Props) {
  const forceMood = FORCE_STATE ? (FORCE_STATE as PetMood) : undefined;
  const [realStreak, setRealStreak] = useState(0);
  const { achievements, newAchievement, checkAndUnlock, dismissAchievement } = useAchievements(userId);
  const [, setTodayActions] = useState<ActionState>({ alimentar: false, mimar: false, jugar: false });
  const { mood, actions, streak, doAction, setInitialActions } = usePetState(forceMood, realStreak);
  const lastDateRef = useRef(new Date().toDateString());

  // FEATURE 4: Load today's check-ins on mount (daily reset)
  const loadTodayCheckins = useCallback(async () => {
    if (!userId) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("dok_check_ins")
      .select("actions")
      .eq("user_id", userId)
      .gte("created_at", today.toISOString());

    if (data && data.length > 0) {
      const doneActions: ActionState = { alimentar: false, mimar: false, jugar: false };
      for (const ci of data) {
        if (Array.isArray(ci.actions)) {
          for (const a of ci.actions) {
            if (a in doneActions) doneActions[a as keyof ActionState] = true;
          }
        }
      }
      setTodayActions(doneActions);
      setInitialActions(doneActions);
    } else {
      // No check-ins today - reset everything
      setTodayActions({ alimentar: false, mimar: false, jugar: false });
      setInitialActions({ alimentar: false, mimar: false, jugar: false });
    }
  }, [userId, setInitialActions]);

  useEffect(() => { loadTodayCheckins(); }, [loadTodayCheckins]);

  // Daily reset: check every 60s if the day changed
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastDateRef.current) {
        lastDateRef.current = currentDate;
        // Day changed - reload check-ins (will reset if empty)
        loadTodayCheckins();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [loadTodayCheckins]);

  const calculateStreak = useCallback(async () => {
    if (!userId) return;
    const count = await calculateStreakService(userId);
    setRealStreak(count);
  }, [userId]);

  useEffect(() => { calculateStreak(); }, [calculateStreak]);

  // Geolocation tracking (delayed to not compete with notification permission)
  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            supabase.from("dok_users").update({
              last_lat: pos.coords.latitude,
              last_lng: pos.coords.longitude,
              last_location_at: new Date().toISOString(),
            }).eq("id", userId).then(() => {});
          },
                    () => {}
        );
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [userId]);

  // Battery monitor
  useEffect(() => {
    if (!userId) return;
    if ("getBattery" in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number; addEventListener: (e: string, cb: () => void) => void }> }).getBattery().then((battery) => {
        const checkBattery = () => {
          if (battery.level <= 0.15) {
            supabase.from("dok_users").update({ battery_low: true }).eq("id", userId).then(() => {});
          } else {
            supabase.from("dok_users").update({ battery_low: false }).eq("id", userId).then(() => {});
          }
        };
        checkBattery();
        battery.addEventListener("levelchange", checkBattery);
      }).catch(() => {});
    }
  }, [userId]);

  // Poll for force_wake from admin — reset actions and show hungry state
  const lastForceWakeRef = useRef<string | null>(null);
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("dok_users")
        .select("force_wake_until")
        .eq("id", userId)
        .single();
      const fwu = data?.force_wake_until;
      if (fwu && new Date(fwu) > new Date() && fwu !== lastForceWakeRef.current) {
        lastForceWakeRef.current = fwu;
        // Reset all actions — Fufy is hungry again
        setInitialActions({ alimentar: false, mimar: false, jugar: false });
        confettiCountRef.current = 0;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [userId, setInitialActions]);

  const avatar = PET_AVATARS[mood] || PET_AVATARS.esperando;
  const feeling = PET_FEELINGS[mood] || PET_FEELINGS.esperando;
  const background = PET_BACKGROUNDS[mood] || PET_BACKGROUNDS.esperando;
  const gradient = PET_GRADIENTS[mood] || PET_GRADIENTS.esperando;
  const isDormido = mood === "dormido";

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiCountRef = useRef(0);

  // Trigger confetti on each action (max 3 times), then stop
  const triggerConfetti = useCallback(() => {
    if (confettiCountRef.current >= 3) return;
    confettiCountRef.current += 1;
    setShowConfetti(false); // reset first
    requestAnimationFrame(() => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    });
  }, []);

  const handleAction = async (action: "alimentar" | "mimar" | "jugar") => {
    if (navigator.vibrate) navigator.vibrate(30);
    doAction(action);
    triggerConfetti();
    if (userId) {
      await supabase.from("dok_check_ins").insert({
        user_id: userId,
        actions: [action],
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
      const newStreak = await calculateStreakService(userId);
      setRealStreak(newStreak);

      // Calculate stats for achievements
      const now = new Date();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { data: allCheckins } = await supabase
        .from("dok_check_ins")
        .select("actions, created_at")
        .eq("user_id", userId);

      const todayCheckins = (allCheckins || []).filter(c =>
        new Date(c.created_at) >= today
      );
      const allActions = (allCheckins || []).flatMap(c => Array.isArray(c.actions) ? c.actions : []);
      const todayActions = todayCheckins.flatMap(c => Array.isArray(c.actions) ? c.actions : []);

      const stats: UserStats = {
        totalFeeds: allActions.filter((a: string) => a === "alimentar").length,
        totalPlays: allActions.filter((a: string) => a === "jugar").length,
        totalPets: allActions.filter((a: string) => a === "mimar").length,
        streak: newStreak,
        earlyFeed: action === "alimentar" && now.getHours() < 8,
        nightFeed: now.getHours() >= 22,
        allThreeMeals: todayActions.includes("alimentar") && todayActions.includes("mimar") && todayActions.includes("jugar"),
      };
      checkAndUnlock(stats);
    }
  };

  return (
    <div style={{
      width: "100%",
      height: "100dvh",
      background: gradient,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 30, right: -50, width: 200, height: 200, borderRadius: "50%", background: COLORS.blob1 }} />
      <div style={{ position: "absolute", top: 280, left: -70, width: 240, height: 240, borderRadius: "50%", background: COLORS.blob2 }} />
      <div style={{ position: "absolute", bottom: 130, right: -30, width: 160, height: 160, borderRadius: "50%", background: COLORS.blob3 }} />

      <Confetti active={showConfetti} />
      {newAchievement && <AchievementPopup achievement={newAchievement} onDismiss={dismissAchievement} />}
      <FufyEvolution streak={streak} achievements={achievements} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 6px", zIndex: 10 }}>
        <div style={{ position: "relative" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div style={{ position: "absolute", top: 1, right: 1, width: 7, height: 7, borderRadius: "50%", background: "#e74c3c" }} />
        </div>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: COLORS.text }}>Dame un Ok</h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 6, zIndex: 10 }}>
        <div style={{
          background: COLORS.streakBg,
          borderRadius: 25,
          padding: "9px 24px",
          display: "flex",
          alignItems: "center",
          gap: 5,
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{streak}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#444" }}>días seguidos</span>
          <span style={{ fontSize: 22 }}>⭐</span>
        </div>
      </div>

      {/* Pet avatar */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: PET_DISPLAY.nameMarginBottom }}>
          <p style={{
            fontSize: PET_DISPLAY.nameSize,
            fontWeight: PET_DISPLAY.nameWeight,
            color: isDormido ? COLORS.textDormido : COLORS.text,
            margin: 0,
            letterSpacing: 1,
          }}>
            {DEFAULT_PET_NAME}
            {getUnlockedAccessories(streak).length > 0 && (
              <span style={{ marginLeft: 4 }}>
                {getUnlockedAccessories(streak).slice(-1)[0].emoji}
              </span>
            )}
          </p>
          <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>
            {getFufyLevel(streak).emoji} {getFufyLevel(streak).name}
          </p>
        </div>
        <div style={{ position: "relative", width: PET_DISPLAY.circleSize, height: PET_DISPLAY.circleSize }}>
          <div style={{
            width: PET_DISPLAY.circleSize,
            height: PET_DISPLAY.circleSize,
            borderRadius: "50%",
            border: `${PET_DISPLAY.circleBorder}px solid white`,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}>
            <img src={background} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <img
            src={avatar}
            alt={`Fufy - ${mood}`}
            style={{
              position: "absolute",
              width: PET_DISPLAY.catWidth,
              height: "auto",
              bottom: PET_DISPLAY.catBottom,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.18))",
            }}
          />
        </div>
        <p style={{
          fontSize: PET_DISPLAY.feelingSize,
          fontWeight: PET_DISPLAY.feelingWeight,
          color: isDormido ? COLORS.textDormidoFeeling : COLORS.textLight,
          margin: `${PET_DISPLAY.feelingMarginTop}px 0 0 0`,
          textAlign: "center",
        }}>
          {feeling}
        </p>
      </div>

      <ActionButtons actions={actions} onAction={handleAction} />

      {/* Premium photo verification — hidden from user, only visible to admin/familiar */}
    </div>
  );
}
