import { describe, it, expect } from 'vitest'
import {
  getFufyLevel,
  getUnlockedAccessories,
  getNextLevel,
  getLevelProgress,
  FUFY_ACCESSORIES,
} from '../../lib/constants/fufy-evolution'

describe('getFufyLevel', () => {
  it('devuelve nivel 1 (bebé) para streak 0', () => {
    const level = getFufyLevel(0)
    expect(level.level).toBe(1)
    expect(level.name).toBe('Fufy bebé')
  })

  it('devuelve nivel 1 para streak 6', () => {
    expect(getFufyLevel(6).level).toBe(1)
  })

  it('devuelve nivel 2 (joven) para streak 7', () => {
    expect(getFufyLevel(7).level).toBe(2)
    expect(getFufyLevel(7).name).toBe('Fufy joven')
  })

  it('devuelve nivel 3 (adulto) para streak 30', () => {
    expect(getFufyLevel(30).level).toBe(3)
  })

  it('devuelve nivel 4 (legendario) para streak 100+', () => {
    expect(getFufyLevel(100).level).toBe(4)
    expect(getFufyLevel(500).level).toBe(4)
  })

  it('maneja streak negativo como nivel 1', () => {
    expect(getFufyLevel(-1).level).toBe(1)
  })
})

describe('getUnlockedAccessories', () => {
  it('no desbloquea nada con streak 0', () => {
    expect(getUnlockedAccessories(0)).toHaveLength(0)
  })

  it('desbloquea lacito con streak 7', () => {
    const acc = getUnlockedAccessories(7)
    expect(acc).toHaveLength(1)
    expect(acc[0].name).toBe('Lacito')
  })

  it('desbloquea todos con streak 100', () => {
    expect(getUnlockedAccessories(100)).toHaveLength(FUFY_ACCESSORIES.length)
  })
})

describe('getNextLevel', () => {
  it('devuelve nivel 2 cuando estás en nivel 1', () => {
    const next = getNextLevel(0)
    expect(next).not.toBeNull()
    expect(next!.level).toBe(2)
  })

  it('devuelve null en nivel máximo', () => {
    expect(getNextLevel(100)).toBeNull()
  })
})

describe('getLevelProgress', () => {
  it('devuelve 0 al inicio del nivel', () => {
    expect(getLevelProgress(0)).toBe(0)
  })

  it('devuelve 1 en nivel máximo', () => {
    expect(getLevelProgress(100)).toBe(1)
  })

  it('devuelve progreso intermedio correcto', () => {
    // Nivel 1: 0-6 (7 days range to next at 7)
    const progress = getLevelProgress(3)
    expect(progress).toBeCloseTo(3 / 7, 2)
  })
})
