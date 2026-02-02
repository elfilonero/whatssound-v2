"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { PLANS, canUseFeature, type PlanType } from "../constants/plans";
import { useAuth } from "../context/AuthContext";

interface SubscriptionState {
  plan: PlanType;
  loading: boolean;
  canUse: (feature: keyof typeof PLANS.premium) => boolean;
}

export function useSubscription(): SubscriptionState {
  const { dokUser, dokFamiliar } = useAuth();
  const [plan, setPlan] = useState<PlanType>("free");
  const [loading, setLoading] = useState(true);

  const userId = dokUser?.id ?? dokFamiliar?.user_id ?? null;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("dok_subscriptions")
        .select("plan, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data && (data.plan === "free" || data.plan === "premium")) {
        setPlan(data.plan as PlanType);
      } else {
        setPlan("free");
      }
      setLoading(false);
    };

    load();
  }, [userId]);

  const canUse = useCallback(
    (feature: keyof typeof PLANS.premium) => canUseFeature(plan, feature),
    [plan]
  );

  return { plan, loading, canUse };
}
