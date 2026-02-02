import { describe, it, expect } from 'vitest'
import { calculateAlertLevel } from '../../lib/utils/alerts'

describe('calculateAlertLevel', () => {
  it('devuelve "ok" para 0 minutos', () => {
    expect(calculateAlertLevel(0)).toBe('ok')
  })

  it('devuelve "esperando" para pocos minutos (< 60)', () => {
    expect(calculateAlertLevel(5)).toBe('esperando')
    expect(calculateAlertLevel(30)).toBe('esperando')
    expect(calculateAlertLevel(59)).toBe('esperando')
  })

  it('devuelve "alerta1h" a los 60 minutos', () => {
    expect(calculateAlertLevel(60)).toBe('alerta1h')
  })

  it('devuelve "alerta1h" entre 60 y 179 minutos', () => {
    expect(calculateAlertLevel(90)).toBe('alerta1h')
    expect(calculateAlertLevel(120)).toBe('alerta1h')
    expect(calculateAlertLevel(179)).toBe('alerta1h')
  })

  it('devuelve "alerta3h" a los 180 minutos', () => {
    expect(calculateAlertLevel(180)).toBe('alerta3h')
  })

  it('devuelve "alerta3h" entre 180 y 359 minutos', () => {
    expect(calculateAlertLevel(200)).toBe('alerta3h')
    expect(calculateAlertLevel(300)).toBe('alerta3h')
    expect(calculateAlertLevel(359)).toBe('alerta3h')
  })

  it('devuelve "emergencia6h" a los 360 minutos', () => {
    expect(calculateAlertLevel(360)).toBe('emergencia6h')
  })

  it('devuelve "emergencia6h" para valores muy altos', () => {
    expect(calculateAlertLevel(1000)).toBe('emergencia6h')
    expect(calculateAlertLevel(10000)).toBe('emergencia6h')
  })

  // Edge cases
  it('maneja números negativos como "ok"', () => {
    expect(calculateAlertLevel(-1)).toBe('ok')
    expect(calculateAlertLevel(-100)).toBe('ok')
  })

  it('maneja valores decimales correctamente', () => {
    expect(calculateAlertLevel(59.9)).toBe('esperando')
    expect(calculateAlertLevel(60.1)).toBe('alerta1h')
    expect(calculateAlertLevel(179.9)).toBe('alerta1h')
    expect(calculateAlertLevel(180.1)).toBe('alerta3h')
  })
})
