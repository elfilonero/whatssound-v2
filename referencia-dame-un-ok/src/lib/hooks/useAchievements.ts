"use client";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "../services/supabase";
import { ACHIEVEMENTS, type Achievement } from "../constants/achievements";

export interface UserStats {
  totalFeeds: number;
  totalPlays: number;
  totalPets: number;
  streak: number;
  earlyFeed: boolean;  // fed before 8AM today
  nightFeed: boolean;  // fed after 22h today
  allThreeMeals: boolean; // all 3 actions done today
}

export function useAchievements(userId: string | undefined) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Load from DB
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("dok_achievements")
      .select("achievement_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setUnlockedIds(new Set(data.map(r => r.achievement_id)));
      });
  }, [userId]);

  const checkAndUnlock = useCallback(async (stats: UserStats) => {
    if (!userId) return;

    const checks: Record<string, boolean> = {
      first_feed: stats.totalFeeds >= 1,
      streak_3: stats.streak >= 3,
      streak_7: stats.streak >= 7,
      streak_30: stats.streak >= 30,
      streak_100: stats.streak >= 100,
      early_bird: stats.earlyFeed,
      night_owl: stats.nightFeed,
      all_three: stats.allThreeMeals,
      play_10: stats.totalPlays >= 10,
      pet_10: stats.totalPets >= 10,
    };

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;
      if (!checks[achievement.id]) continue;

      // Unlock it
      const { error } = await supabase
        .from("dok_achievements")
        .insert({ user_id: userId, achievement_id: achievement.id });

      if (!error) {
        setUnlockedIds(prev => new Set([...prev, achievement.id]));
        setNewAchievement(achievement);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        break; // Show one at a time
      }
    }
  }, [userId, unlockedIds]);

  const dismissAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  return {
    achievements: ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
    })),
    newAchievement,
    checkAndUnlock,
    dismissAchievement,
  };
}
