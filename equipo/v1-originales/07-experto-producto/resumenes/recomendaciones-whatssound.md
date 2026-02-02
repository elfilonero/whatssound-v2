# 🎯 Recomendaciones WhatsSound — SUPEREXPERTO #7: CraftMaster

## Visión de Producto

> **WhatsSound = "WhatsApp de la música en vivo"**
> Escuchar artistas locales, descubrirlos, apoyarlos con propinas. Simple como enviar un mensaje.

---

## 1. Onboarding — De descarga a primera canción en 60s

### Flujo óptimo (máximo 4 pantallas):

```
1. [Splash] → Logo + "Descubre música cerca de ti"
2. [Auth]   → "Continuar con Google" / "Continuar con Apple" (un tap)
3. [Gustos] → Selecciona 3+ géneros (chips seleccionables, no formulario)
4. [Feed]   → La primera canción ya está sonando automáticamente
```

**Reglas de onboarding (Vohra):**
- ❌ NO pedir nombre de usuario en onboarding (después)
- ❌ NO tutorial walkthrough (descubrimiento por uso)
- ❌ NO permisos innecesarios upfront (pedir en contexto)
- ✅ SÍ autoplay de la primera canción recomendada
- ✅ SÍ mostrar valor inmediato (música sonando)
- ✅ SÍ social proof ("12,345 personas escuchando ahora")

### Métricas de onboarding:
- **Time to first song:** < 60 segundos
- **Completion rate:** > 80% de usuarios que instalan escuchan una canción
- **Day 1 retention:** > 40%

---

## 2. Engagement Loops

### Loop Principal del Oyente:
```
Abrir app → Feed personalizado → Escuchar → Descubrir artista
    ↑                                              ↓
    ← Notificación "nueva canción" ← Seguir ← Like/Propina
```

### Loop del Artista (Creator Flywheel):
```
Subir canción → Recibe plays → Recibe propinas → Motivación
      ↑                                              ↓
      ←←←←←←←←←← Sube más contenido ←←←←←←←←←←←←←←
```

### Triggers de re-engagement:
| Trigger | Timing | Mensaje |
|---|---|---|
| Artista seguido publica | Inmediato | "🎵 [Artista] acaba de subir '[Canción]'" |
| Propina recibida (artista) | Inmediato | "💰 Recibiste una propina de [User]!" |
| Digest semanal | Lunes 10:00 | "Tu semana en música: 23 canciones, 5 artistas nuevos" |
| Inactividad 3 días | Día 3, 18:00 | "🎧 Artistas que sigues tienen 4 nuevas canciones" |
| Milestone social | En contexto | "¡100 personas escucharon tu canción!" |

---

## 3. UX del Player (inspirado en Spotify + simplicidad WhatsApp)

### Mini Player (siempre visible en bottom):
```
┌──────────────────────────────────────────┐
│ [Cover] Título - Artista      ▶️  ❤️  💰 │
│ ━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────┘
```

### Full Player (swipe up):
```
┌──────────────────────────────┐
│          ← [Cover Art] →     │  ← swipe para siguiente
│                              │
│     Título de la Canción     │
│     Nombre del Artista →     │  ← tap para ver perfil
│                              │
│  1:23 ━━━━━━━━━━░░░░ 3:45   │
│                              │
│     ⏮️   ▶️   ⏭️            │
│                              │
│  🔀    ❤️    💰    📤    •••  │
│         └── propina  └── compartir
└──────────────────────────────┘
```

**Decisiones clave:**
- **Botón de propina visible en el player** — La propina es tan fácil como dar like
- **Swipe horizontal** para siguiente canción (como TikTok stories)
- **Cover art grande** — El arte visual importa en música
- **Tap en nombre de artista** → va a su perfil inmediatamente

---

## 4. Monetización — Propinas como Mecánica Social

### Modelo de propinas (inspirado en Twitch bits + Bandcamp):

```
Paquetes de "Aplausos" 👏:
  10 aplausos  = $0.99
  50 aplausos  = $3.99  (20% bonus)
  100 aplausos = $6.99  (30% bonus)
  500 aplausos = $29.99 (40% bonus)

Enviar propina:
  Tap en 💰 → Seleccionar cantidad (1, 5, 10, 25, 50, 100)
  + Mensaje opcional (max 100 chars)
  
Revenue split:
  Artista: 80%
  WhatsSound: 20%
```

### ¿Por qué propinas y no suscripción?

| Modelo | Pros | Contras |
|---|---|---|
| **Propinas** ✅ | Baja fricción, social proof, gamificación | Ingresos variables |
| Suscripción | Ingresos predecibles | Alta fricción, "otro subscription" |
| Ads | Sin fricción | Destruye UX musical |

**Principio WhatsApp:** Sin ads. Nunca. La experiencia es sagrada.

### Premium (Fase 2):
```
WhatsSound Premium ($4.99/mes):
- Audio alta calidad (320kbps → lossless)
- Descarga offline
- Sin límite de skips
- Badge premium 💎
- Estadísticas avanzadas (artistas)
```

---

## 5. Product-Market Fit Engine (Framework Vohra)

### Encuesta PMF (enviar a usuarios semana 2):

> **"¿Cómo te sentirías si ya no pudieras usar WhatsSound?"**
> - Muy decepcionado/a
> - Algo decepcionado/a  
> - No me importaría
> - Ya no la uso

**Target: 40%+ "Muy decepcionado/a"**

Si < 40%: preguntar al segmento "algo decepcionado" qué mejorarían.

### Segmentación para PMF:
- **Oyentes casuales:** Quieren descubrir música nueva fácilmente
- **Fans dedicados:** Quieren apoyar a sus artistas favoritos
- **Artistas emergentes:** Quieren audiencia + ingresos directos
- **Curadores:** Quieren crear playlists y compartir descubrimientos

---

## 6. Información Architecture — 5 Tabs

| Tab | Icono | Propósito |
|---|---|---|
| **Home** | 🏠 | Feed personalizado de canciones |
| **Explorar** | 🔍 | Buscar + géneros + trending |
| **Crear** | ➕ | Subir canción (solo artistas) |
| **Actividad** | 🔔 | Notificaciones, propinas recibidas |
| **Perfil** | 👤 | Mi perfil, playlists, settings |

**Regla de oro:** Máximo 5 tabs. Si necesitas más, algo sobra.

---

## 7. Design Principles WhatsSound

1. **🎵 Sound First** — La música siempre tiene prioridad visual y funcional
2. **👆 One Thumb** — Todo alcanzable con el pulgar de una mano
3. **⚡ Instant** — Nada tarda más de 300ms en responder
4. **❤️ Human** — Propinas tienen nombre y cara, no son anónimas
5. **🧹 Clean** — Espacios blancos generosos, tipografía clara, sin clutter

---

## 8. Métricas North Star

| Métrica | Qué Mide | Target Mes 1 | Target Mes 6 |
|---|---|---|---|
| **Canciones escuchadas/día** | Engagement core | 500 | 50,000 |
| **Propinas enviadas/semana** | Monetización | 50 | 5,000 |
| **Artistas activos** | Supply side | 20 | 500 |
| **D1 Retention** | Onboarding quality | 40% | 50% |
| **D7 Retention** | Product value | 20% | 30% |
| **D30 Retention** | Habit formation | 10% | 20% |
| **PMF Score** | Product-market fit | 30% | 40%+ |

---

## Prioridades de Implementación

1. **Semana 1:** Definir flujo de onboarding + wireframes 5 tabs
2. **Semana 2:** Player UX (mini + full) + flujo de propinas
3. **Semana 3:** Notificaciones strategy + engagement triggers
4. **Semana 4:** PMF survey setup + analytics events definition