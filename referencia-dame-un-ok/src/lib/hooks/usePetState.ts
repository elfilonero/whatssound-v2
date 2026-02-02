"use client";
import { useState, useCallback, useMemo } from "react";
import type { ActionKey, ActionState, PetMood } from "../types";

const INITIAL_ACTIONS: ActionState = { alimentar: false, mimar: false, jugar: false };

/**
 * Hook that manages pet state based on completed actions.
 * Returns current mood, actions state, and action handler.
 */
export function usePetState(forceState?: PetMood, initialStreak = 0) {
  const [actions, setActions] = useState<ActionState>(INITIAL_ACTIONS);
  const [streak] = useState(initialStreak);

  const doneCount = useMemo(
    () => Object.values(actions).filter(Boolean).length,
    [actions]
  );

  const autoMood: PetMood = useMemo(() => {
    if (doneCount === 3) return "euforico";
    if (actions.jugar) return "jugado";
    if (actions.mimar) return "mimado";
    if (actions.alimentar) return "alimentado";
    return "esperando";
  }, [doneCount, actions]);

  const mood: PetMood = forceState || autoMood;

  const doAction = useCallback((action: ActionKey) => {
    setActions((prev) => {
      if (prev[action]) return prev;
      return { ...prev, [action]: true };
    });
  }, []);

  // FEATURE 4: Set initial actions from today's check-ins
  const setInitialActions = useCallback((initialActions: ActionState) => {
    setActions(initialActions);
  }, []);

  return { mood, actions, streak, doneCount, doAction, setInitialActions };
}
