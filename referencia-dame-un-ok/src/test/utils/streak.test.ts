import { describe, it, expect } from 'vitest'
import { calculateStreakFromDates } from '../../lib/utils/streak'

describe('calculateStreakFromDates', () => {
  const today = new Date(2025, 6, 10) // July 10, 2025

  it('devuelve 0 para array vacío', () => {
    expect(calculateStreakFromDates([], today)).toBe(0)
  })

  it('devuelve 0 para null/undefined-like input', () => {
    expect(calculateStreakFromDates([], today)).toBe(0)
  })

  it('devuelve 1 para check-in hoy', () => {
    expect(calculateStreakFromDates(['2025-07-10T12:00:00Z'], today)).toBe(1)
  })

  it('devuelve 1 para check-in ayer (sin hoy)', () => {
    expect(calculateStreakFromDates(['2025-07-09T12:00:00Z'], today)).toBe(1)
  })

  it('devuelve 2 para check-in hoy y ayer', () => {
    const dates = ['2025-07-10T10:00:00Z', '2025-07-09T10:00:00Z']
    expect(calculateStreakFromDates(dates, today)).toBe(2)
  })

  it('devuelve 7 para 7 días consecutivos', () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2025, 6, 10 - i)
      return d.toISOString()
    })
    expect(calculateStreakFromDates(dates, today)).toBe(7)
  })

  it('racha se reinicia si hay un día perdido', () => {
    // hoy, ayer, anteayer, FALTA día 4, día 5
    const dates = [
      '2025-07-10T10:00:00Z',
      '2025-07-09T10:00:00Z',
      '2025-07-08T10:00:00Z',
      // skip July 7
      '2025-07-06T10:00:00Z',
      '2025-07-05T10:00:00Z',
    ]
    expect(calculateStreakFromDates(dates, today)).toBe(3)
  })

  it('deduplica múltiples check-ins en el mismo día', () => {
    const dates = [
      new Date(2025, 6, 10, 8, 0).toISOString(),
      new Date(2025, 6, 10, 12, 0).toISOString(),
      new Date(2025, 6, 10, 18, 0).toISOString(),
      new Date(2025, 6, 9, 10, 0).toISOString(),
    ]
    expect(calculateStreakFromDates(dates, today)).toBe(2)
  })

  it('devuelve 0 si el último check-in fue hace 2+ días', () => {
    const dates = ['2025-07-07T10:00:00Z'] // 3 days ago
    expect(calculateStreakFromDates(dates, today)).toBe(0)
  })

  it('maneja fechas desordenadas', () => {
    const dates = [
      '2025-07-08T10:00:00Z',
      '2025-07-10T10:00:00Z',
      '2025-07-09T10:00:00Z',
    ]
    expect(calculateStreakFromDates(dates, today)).toBe(3)
  })
})
