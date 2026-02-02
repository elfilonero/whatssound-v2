# 🏭 Diseño Industrial — Guía Técnica Completa

**Proyecto:** Dame un Ok  
**Área:** Diseño Industrial / Producto Físico  
**Responsables virtuales:** Roberto Fuentes (Diseño Industrial), Marcos Delgado (IoT), Elena Soto (Embebidos)  
**Fecha:** 1 febrero 2026  
**Versión:** 1.0

---

## 1. Filosofía de Diseño

### 1.1 Principio OXO: Diseñar para la dificultad máxima

Sam Farber creó OXO Good Grips para que su esposa, con artritis severa, pudiera pelar verduras. El resultado fue un pelador que es mejor para TODOS — no solo para personas con artritis. Este principio guía todo nuestro diseño:

> **"Si una persona de 85 años con artritis, presbicia y temblor esencial puede usar el dispositivo sin instrucciones, cualquier persona del planeta puede."**

### 1.2 Principios de diseño (basados en Dieter Rams + IDEO + Fukasawa)

1. **Obvio** — Debe entenderse sin manual. Naoto Fukasawa: "Sin pensamiento"
2. **Robótico** — Debe funcionar 5 años sin mantenimiento (excepto papel térmico)
3. **Cálido** — No debe parecer un dispositivo médico. Materiales y colores hogareños
4. **Accesible** — Manos artríticas, baja visión, sin destreza fina
5. **Seguro** — Sin bordes cortantes, sin piezas pequeñas que se desprendan, sin riesgo eléctrico
6. **Fabricable** — Diseñado para CNC (prototipo) e inyección (serie). Vertex tiene ambos

---

## 2. La Estación Dame un Ok — Producto Estrella

### 2.1 Descripción del producto

La Estación es el dispositivo principal del ecosistema: integra pantalla OLED, botón de check-in e impresora térmica en un solo aparato de sobremesa.

### 2.2 Dimensiones y forma

```
VISTA FRONTAL:
┌───────────────────────────────────┐
│                                   │  ← Carcasa superior (OLED visible)
│   ┌───────────────────────────┐   │     
│   │    PANTALLA OLED 1.3"     │   │     Dimensiones totales:
│   │    (128×128 px)           │   │     Ancho: 120mm
│   └───────────────────────────┘   │     Alto: 150mm
│                                   │     Profundidad: 90mm
│         ┌─────────────┐          │     Peso: 280-350g
│         │             │          │
│         │   BOTÓN     │          │     Material: ABS + TPE
│         │   60mm ⊙    │          │     Color: Blanco cálido / Gris perla
│         │             │          │
│         └─────────────┘          │
│                                   │
│   ╔═══════════════════════════╗   │  ← Salida de papel (ranura horizontal)
│   ║  Salida de papel 58mm    ║   │
│   ╚═══════════════════════════╝   │
│                                   │
└───────────────────────────────────┘

VISTA LATERAL:
┌───────────────┐
│  OLED         │ ← Inclinación 15° hacia usuario
│    \          │
│     \  Botón  │
│      │        │
│      │ Impres.│
│      │        │ ← Parte trasera: USB-C, speaker, ventilación
└──────┘────────┘
  Base antideslizante
```

### 2.3 Especificaciones del botón

| Parámetro | Valor | Justificación |
|---|---|---|
| **Diámetro** | 60mm | Como una galleta María. Local