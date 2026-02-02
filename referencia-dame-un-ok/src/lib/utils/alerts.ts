import type { AlertLevel } from '../types/familiar'

/**
 * Pure function to calculate alert level from minutes since last check-in.
 * Extracted from services/alerts.ts for testability (no supabase dependency).
 */

// Alert thresholds in minutes
export const ALERT_THRESHOLDS = {
  warning: 60,
  alert: 180,
  emergency: 360,
} as const

export function calculateAlertLevel(minutesSinceCheckIn: number): AlertLevel {
  if (minutesSinceCheckIn >= ALERT_THRESHOLDS.emergency) return 'emergencia6h'
  if (minutesSinceCheckIn >= ALERT_THRESHOLDS.alert) return 'alerta3h'
  if (minutesSinceCheckIn >= ALERT_THRESHOLDS.warning) return 'alerta1h'
  if (minutesSinceCheckIn > 0) return 'esperando'
  return 'ok'
}
