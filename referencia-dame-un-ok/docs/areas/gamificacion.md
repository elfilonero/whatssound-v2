# 🎮 Gamificación — Guía Técnica Completa

**Proyecto:** Dame un Ok  
**Área:** Gamificación y Psicología del Engagement  
**Responsable virtual:** Aurora Méndez  
**Fecha:** 1 febrero 2026  
**Versión:** 1.0

---

## 1. Filosofía: Engagement Ético para Seniors

### 1.1 El problema de la gamificación tradicional

La mayoría de sistemas de gamificación están diseñados para maximizar tiempo en pantalla: likes, scrolling infinito, notificaciones dopaminérgicas. Esto es **inaceptable** para personas mayores. Nuestro objetivo es el opuesto: que el usuario interactúe **una vez al día durante 10 segundos** y luego vuelva a su vida.

**Nuestro mantra:** "Engagement mínimo necesario, satisfacción emocional máxima."

El check-in diario debe ser:
- **Deseable** (quiero hacerlo) — no obligatorio
- **Fácil** (puedo hacerlo) — sin fricción
- **Significativo** (tiene sentido hacerlo) — genera emoción positiva

### 1.2 Framework Octalysis aplicado a Dame un Ok

El framework Octalysis de Yu-kai Chou identifica 8 "Core Drives" de motivación humana. Para seniors, usamos selectivamente los White Hat (motivación positiva) y evitamos los Black Hat (motivación por presión):

| # | Core Drive | Tipo | Aplicación en Dame un Ok | Intensidad |
|---|---|---|---|---|
| 1 | **Significado épico** | White Hat ✅ | "Cuidas a un ser que te necesita. Tu familia está tranquila." | Alta |
| 2 | **Desarrollo y logro** | White Hat ✅ | Rachas, evolución del avatar, hitos, celebraciones | Alta |
| 3 | **Empoderamiento creativo** | White Hat ✅ | Personalizar avatar (nombre, accesorios), elegir tipo | Media |
| 4 | **Propiedad y posesión** | White Hat ✅ | "TU avatar, TU racha, TUS logros" — efecto de dotación | Alta |
| 5 | **Influencia social** | Neutro | Dashboard familiar, regalos entre familia | Media-Baja |
| 6 | **Escasez e impaciencia** | Black Hat ❌ | **NO USAR.** Genera ansiedad | Prohibido |
| 7 | **Impredecibilidad** | Neutro | Sorpresas ocasionales (accesorio aleatorio, mensaje especial) | Baja |
| 8 | **Pérdida y evitación** | Black Hat ⚠️ | Mínimo: avatar triste si no come. NUNCA muere | Muy baja |

### 1.3 Modelo B=MAP (BJ Fogg)

Behavior = Motivation × Ability × Prompt

- **Motivation:** El avatar tiene hambre → cariño por la mascota virtual → quiero alimentarlo
- **Ability:** Un solo toque en cualquier dispositivo → dificultad mínima → puedo hacerlo
- **Prompt:** Push notification con cara de avatar hambriento → recordatorio emocional → ahora lo hago

Si cualquiera de los tres es cero, el comportamiento no ocurre. Por eso:
- No podemos depender solo de motivación (se agota)
- Hacemos la acción lo más fácil posible (un toque)
- El prompt debe ser emocional, no funcional

---

## 2. Sistema de Rachas (Streaks)

### 2.1 Mecánica básica

- **Racha = días consecutivos de check-in**
- Se cuenta desde la primera interacción del usuario
- Un día sin check-in rompe la racha
- El contador vuelve a 0, pero la evolución del avatar NO se pierde

### 2.2 Tabla de hitos y recompensas

| Días | Hito | Nombre | Recompensa | Celebración |
|---|---|---|---|---|
| 1 | Primer día | "¡Bienvenido!" | Tutorial completado | Confeti en pantalla |
| 3 | 3 días | "Primeros pasos 🐾" | Avatar aprende nueva expresión (parpadear) | Animación de alegría |
| 7 | 1 semana | "Una semana cuidando 🌟" | Primer accesorio desbloqueado (lacito/pañuelo) | Ticket impreso + estrella |
| 14 | 2 semanas | "Cuidador dedicado 💪" | Avatar evoluciona a Etapa 2 (Juvenil) | Animación de evolución |
| 21 | 3 semanas | "Hábito formado 🧠" | Segundo accesorio (gafas de sol / maceta decorada) | Mensaje de felicitación |
| 30 | 1 mes | "Un mes de amor ❤️" | Avatar evoluciona a Etapa 3 (Adulto) + accesorio premium | Gran celebración |
| 60 | 2 meses | "Inseparables 🤝" | Segundo avatar desbloqueado como compañero | Presentación del compañero |
| 100 | Centenario | "Centenario del cariño 🏅" | Badge especial dorado en dashboard familiar | Ticket especial impreso |
| 180 | 6 meses | "Medio año juntos 🎊" | Entorno especial para avatar (jardín, playa) | Video de celebración |
| 365 | 1 año | "Un año juntos 🎂" | Corona permanente para avatar + certificado | Tarta de celebración impresa |

### 2.3 Qué pasa cuando se rompe la racha

**Principio fundamental: NUNCA castigar. Siempre animar.**

```
DÍA SIN CHECK-IN:
  → Avatar se pone triste (estado visual)
  → Protocolo de alerta se activa (función de seguridad)
  → Contador de racha vuelve a 0
  
PERO:
  ✅ La evolución (Etapa 2, 3) se MANTIENE
  ✅ Los accesorios permanentes se MANTIENEN  
  ✅ Los logros alcanzados se MANTIENEN
  ❌ Se pierden accesorios temporales (los de racha activa)
  
DÍA SIGUIENTE (check-in recuperado):
  → Avatar sonríe de nuevo
  → Mensaje: "¡Michi se alegra de verte! Nueva racha: 1 día"
  → NO hay mensaje de reproche ni culpa
  → Tono positivo: "volver a empezar" no "has fallado"
```

### 2.4 Racha "compasiva"

Para evitar frustración por olvidos genuinos (no emergencias), implementamos una "racha compasiva":

- **1 "día libre" cada 30 días:** Si el usuario tiene una racha de 30+ días y falla un solo día, la racha no se rompe. Se muestra: "Michi te ha echado de menos, pero sabe que estás bien. ¡Tu racha sigue! 🛡️"
- **Esto NO anula la alerta de seguridad.** Los familiares siguen siendo notificados. Solo afecta al contador de gamificación.
- **El "día libre" se recarga cada 30 días de racha continua.**

---

## 3. Evolución del Avatar

### 3.1 Etapas de crecimiento

| Etapa | Días requeridos | Aspecto | Animaciones | Accesorios |
|---|---|---|---|---|
| **Bebé** (Etapa 1) | 0-13 | Pequeño, ojos grandes, torpe | Parpadear, mirar, dormirse | Ninguno (pañal/macetita) |
| **Juvenil** (Etapa 2) | 14-29 | Más grande, más expresivo | + Saltar, bailar, ronronear/ladrar | Lacito, gafas básicas |
| **Adulto** (Etapa 3) | 30+ | Tamaño completo, personalidad definida | + Correr, jugar, sentarse elegante | Todos los accesorios |

### 3.2 Animaciones por estado y etapa

```
AVATAR: GATO (Michi)

Etapa Bebé:
  - Idle: Parpadea lentamente, mueve cola cortita (2 frames)
  - Alimentar: Lame leche de cuenco, corazoncitos (4 frames)
  - Dormir: Ovillado, Zzz (2 frames)
  - Hambriento: Ojos grandes, maúlla silencioso (3 frames)
  - Triste: Sentadito, cola caída, ojos con lágrima (2 frames)

Etapa Juvenil (desbloquea):
  - + Jugar: Persigue ovillo de lana (6 frames)
  - + Ronronear: Vibración suave, ojos entrecerrados (3 frames)
  - + Saltar: Salta intentando alcanzar mariposa (4 frames)

Etapa Adulto (desbloquea):
  - + Acicalar: Se lame la pata elegantemente (4 frames)
  - + Sentarse: Postura elegante de gato egipcio (2 frames)
  - + Celebrar: Baila con confeti, cascabeles (6 frames)
```

### 3.3 Evolución en múltiples plataformas

| Plataforma | Resolución | Formato | Animación |
|---|---|---|---|
| App móvil | Vectorial (Rive/Lottie) | Color, suave, fluido | 24-30 FPS |
| Smart TV | Canvas/Lottie 1080p | Color, grande, detallado | 15-24 FPS |
| OLED 128×64 | 32×32 px, monocromo | XBM bitmap | 4-8 FPS |
| OLED 128×128 | 64×64 px, monocromo | XBM bitmap | 4-8 FPS |
| Impresora térmica | 128×128 px, 1-bit | Bitmap estático | N/A (estático) |
| SMS | Texto/emoji | 🐱😊🔥 | N/A |
| Feature phone | ASCII art | =^.^= | N/A |

---

## 4. Sistema de Accesorios

### 4.1 Categorías

| Categoría | Ejemplos | Cómo se obtiene | Permanencia |
|---|---|---|---|
| **De racha** | Gorrito de 7 días, bufanda de 14, capa de 30 | Alcanzar hito de racha | Permanente una vez desbloqueado |
| **De evolución** | Collar de Etapa 2, corona de Etapa 3 | Evolucionar a la etapa | Permanente |
| **Estacionales** | Gorro Papá Noel, huevo Pascua, calabaza Halloween | Automáticos por fecha | Temporales (1 mes) |
| **Regionales** | Paella, boina, abanico | Según ubicación del usuario | Permanentes |
| **Regalos familiares** | "Lazo de Lucía", "Pelota de Javier" | Familiar lo envía desde su app | Permanentes |
| **Sorpresa** | Aleatorio cada ~30 días | Aparece sin aviso | Permanentes |

### 4.2 Regalos familiares — Motor de engagement intergeneracional

Los regalos familiares son el mecanismo más poderoso del sistema:

```
FLUJO DE REGALO:
  1. Lucía (nieta, 12 años) abre la app → Dashboard de abuela → "Enviar regalo 🎁"
  2. Elige de un catálogo: "Lacito rosa" (gratis), "Coronita de flores" (gratis)
  3. Escribe nota: "¡Te quiero abuela! Este lacito es para Michi"
  4. Envía → Backend encola regalo

  5. En el dispositivo de la abuela:
     - App: Animación de caja de regalo abriéndose → accesorio aparece en avatar
     - OLED: Avatar con accesorio nuevo + corazón
     - Impresora: Ticket con avatar + accesorio + nota de Lucía
     - Buzzer: Melodía especial de regalo

  6. La abuela ve el lacito en Michi → siente conexión con Lucía
  7. La abuela NO quiere romper la racha porque "Michi perdería el lacito de Lucía"
```

**Este loop es el motor de retención más fuerte del producto.** No es gamificación por puntos vacíos — es vínculo emocional real.

---

## 5. Sistema de Puntos de Cariño (Moneda Interna)

### 5.1 Concepto

Los "Puntos de Cariño" ❤️ son la moneda interna del sistema. Se ganan por interacción y se gastan en accesorios. No se compran con dinero real (evitar monetización predatoria en seniors).

| Acción | Puntos |
|---|---|
| Check-in diario | +10 ❤️ |
| Racha de 7 días | +50 ❤️ bonus |
| Racha de 30 días | +200 ❤️ bonus |
| Acariciar al avatar | +2 ❤️ (máx 3/día) |
| Recibir regalo de familiar | +25 ❤️ |
| Primer check-in del día | +5 ❤️ extra (madrugador) |

### 5.2 Catálogo de accesorios por puntos

| Accesorio | Coste | Disponibilidad |
|---|---|---|
| Lacito básico | 50 ❤️ | Desde día 1 |
| Gafas de sol | 100 ❤️ | Desde Etapa 2 |
| Bufanda de lana | 150 ❤️ | Desde Etapa 2 |
| Gorrito de chef | 200 ❤️ | Desde Etapa 3 |
| Capa de superhéroe | 500 ❤️ | Racha 30+ |
| Corona dorada | 1000 ❤️ | Racha 100+ |

---

## 6. Psicología del Engagement sin Adicción

### 6.1 Anti-patterns a evitar

| Anti-pattern | Por qué es malo para seniors | Alternativa |
|---|---|---|
| **Notificaciones excesivas** | Genera ansiedad, confusión | Máximo 2 notificaciones/día |
| **Pérdida irreversible** | Devastador emocionalmente | El avatar NUNCA muere. Solo se pone triste |
| **Countdown timers** | Presión temporal → estrés | Ventana flexible (mañana completa) |
| **Leaderboards públicos** | Vergüenza si racha baja | Solo tabla familiar (opcional) |
| **FOMO (Fear of Missing Out)** | Ansiedad por ofertas limitadas | Accesorios siempre disponibles |
| **Dark patterns** | Manipulación → desconfianza | Transparencia total |
| **Monetización de accesorios** | Predatoria con vulnerable | Todo gratis o por puntos de cariño |

### 6.2 Modelo Hook adaptado para seniors

Nir Eyal define el ciclo: Trigger → Action → Variable Reward → Investment

**Nuestra adaptación:**

```
TRIGGER (Externo):
  Push notification: "🐱 ¡Michi tiene hambre!"
  → Emocional, no funcional
  → No dice "Haz tu check-in" sino "Tu gatito te necesita"

ACTION (Mínima fricción):
  Un solo toque en cualquier dispositivo
  → BJ Fogg: la acción debe ser tan fácil que no requiera motivación
  → Ability > Motivation

VARIABLE REWARD (Sorpresa positiva):
  → Día normal: Avatar come, sonríe, corazones
  → Hito de racha: ¡Celebración! Confeti, nuevo accesorio
  → Sorpresa aleatoria: "¡Michi ha encontrado una mariposa!" (cada ~15 días)
  → Mensaje de familiar: "Lucía dice: ¡Buen día abuela!"
  
  La variabilidad mantiene el interés sin ser adictiva.
  Es como abrir una galleta de la suerte — agradable, no compulsivo.

INVESTMENT (Efecto de dotación):
  → Cada día de racha aumenta el "valor" de lo construido
  → Los accesorios acumulados hacen que "mi avatar" sea único
  → Los regalos de familiares son irremplazables emocionalmente
  → El nombre personalizado genera apego
  
  Dan Ariely: el efecto de dotación hace que valoremos más lo que ya tenemos.
  Perder una racha de 45 días "duele" — lo justo para motivar, no para angustiar.
```

### 6.3 Frecuencia de estímulos

```
DIARIO:
  - Animación de alimentar (siempre satisfactoria)
  - Contador de racha actualizado
  - Mensajes de familiares (si los hay)

SEMANAL (cada 7 días de racha):
  - Celebración de hito
  - Posible accesorio nuevo

QUINCENAL:
  - Sorpresa aleatoria (animación especial, mini-evento)

MENSUAL:
  - Gran hito (evolución o accesorio premium)
  - Resumen mensual impreso en térmica

ESTACIONAL:
  - Accesorio temático (Navidad, primavera, etc.)
  - Cambio de entorno del avatar
```

---

## 7. Datos y Métricas

### 7.1 KPIs de engagement

| Métrica | Objetivo | Medición |
|---|---|---|
| **DAU/MAU** (Daily/Monthly Active Users) | >85% | Usuarios que hacen check-in / total registrados |
| **Racha media** | >14 días | Promedio de días consecutivos |
| **Retención D7** | >90% | Usuarios activos 7 días después del registro |
| **Retención D30** | >80% | Usuarios activos 30 días después |
| **Retención D90** | >70% | Usuarios activos 90 días después |
| **Tasa de olvido** (false positive) | <5% | Alertas activadas por olvido, no emergencia |
| **Tiempo en app** | <30s/día | No queremos más (no es social media) |
| **Interacciones opcionales** | >1/semana | Acariciar, vestir, ver accesorios |

### 7.2 Esquema de base de datos para gamificación

```sql
-- Estado del avatar (uno por usuario)
CREATE TABLE avatar_state (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    avatar_type VARCHAR(20) NOT NULL, -- 'cat', 'dog', 'bird', 'geranium'...
    avatar_name VARCHAR(50) NOT NULL, -- 'Michi'
    stage INTEGER DEFAULT 1, -- 1=bebé, 2=juvenil, 3=adulto
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_checkins INTEGER DEFAULT 0,
    compassion_days_remaining INTEGER DEFAULT 0,
    care_points INTEGER DEFAULT 0, -- puntos de cariño
    last_checkin_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accesorios del avatar
CREATE TABLE avatar_accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    accessory_id VARCHAR(50) NOT NULL, -- 'ribbon_pink', 'sunglasses', etc.
    source VARCHAR(30) NOT NULL, -- 'streak', 'evolution', 'gift', 'seasonal', 'surprise'
    gifted_by UUID REFERENCES users(id), -- si es regalo familiar
    gift_message TEXT,
    is_equipped BOOLEAN DEFAULT false,
    is_permanent BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ, -- para accesorios temporales
    unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hitos alcanzados
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    milestone_type VARCHAR(50) NOT NULL, -- 'streak_7', 'streak_30', 'evolution_2'
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    celebrated BOOLEAN DEFAULT false -- se ha mostrado la celebración
);

-- Sorpresas programadas
CREATE TABLE surprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(30) NOT NULL, -- 'animation', 'accessory', 'message'
    content JSONB NOT NULL,
    scheduled_for TIMESTAMPTZ,
    delivered BOOLEAN DEFAULT false
);
```

---

## 8. Integración con Dispositivos IoT

### 8.1 Avatar en OLED (ESP32)

La gamificación visual en OLED se limita a lo esencial:

```c
// Rendering de racha y estado en OLED 128x64
void render_gamification(U8G2 &display, int streak, int stage, bool has_new_gift) {
    // Racha
    char streak_text[20];
    snprintf(streak_text, sizeof(streak_text), "Racha: %d", streak);
    display.drawStr(40, 40, streak_text);
    
    // Icono de fuego si racha > 7
    if (streak >= 7) {
        display.drawXBM(40 + strlen(streak_text) * 6, 32, 8, 8, fire_icon);
    }
    
    // Estrellas de evolución
    for (int i = 0; i < stage; i++) {
        display.drawXBM(40 + i * 10, 50, 8, 8, star_icon);
    }
    
    // Indicador de regalo nuevo
    if (has_new_gift) {
        display.drawXBM(120, 0, 8, 8, gift_icon);
    }
}
```

### 8.2 Celebraciones en impresora térmica

```
TICKET DE HITO (racha de 30 días):
┌──────────────────────────────────┐
│                                  │
│    ★ ★ ★ FELICIDADES ★ ★ ★     │
│                                  │
│         /\_/\                    │
│        ( ^.^ )   ¡MICHI!        │
│         > ^ <                    │
│        /|♥♥♥|\                   │
│                                  │
│    ¡30 DÍAS CUIDANDO A MICHI!    │
│                                  │
│    María, eres una cuidadora     │
│    increíble. Michi te quiere    │
│    muchísimo. ❤️                 │
│                                  │
│    🔥 Racha: 30 días            │
│    ⭐ Etapa: Adulto              │
│    🎁 Nuevo: Capa de superhéroe  │
│                                  │
│    Sigue así. Tu familia está    │
│    orgullosa de ti.              │
│                                  │
│  ── ── ── ── ── ── ── ── ──    │
│  Dame un Ok · 1 feb 2026        │
└──────────────────────────────────┘
```

---

## 9. Diferenciadores vs Competencia

| Feature | Dame un Ok | Duolingo | Tamagotchi original | Apps de hábitos |
|---|---|---|---|---|
| Público objetivo | Seniors 65+ | Todos (jóvenes) | Niños/jóvenes | Jóvenes/adultos |
| Mecánica core | Cuidar avatar = seguridad pasiva | Lecciones = aprender | Cuidar mascota | Marcar tarea |
| Motivación | Cariño + seguridad familiar | Logro + social | Cariño + juego | Productividad |
| Consecuencia de fallo | Avatar triste + alerta a familia | Racha se rompe | Mascota muere | Racha se rompe |
| Hardware | Multi-dispositivo IoT | Solo app | Solo dispositivo | Solo app |
| Interacción familiar | Regalos, mensajes, dashboard | Ligas sociales | No | No |
| Accesibilidad | Diseñada para artritis, baja visión | Estándar | No accesible | Estándar |
| Ética | Sin adicción, sin monetización predatoria | Streaks agresivos | Muerte del pet | Varía |

---

## 10. Roadmap de Gamificación

| Fase | Features | Timeline |
|---|---|---|
| **MVP** | Rachas básicas, 3 etapas evolución, 3 avatares, alimentar = check-in | Semana 1-4 |
| **v1.1** | Accesorios desbloqueables, hitos con celebración, puntos de cariño | Semana 5-6 |
| **v1.2** | Regalos familiares, sorpresas aleatorias | Semana 7-8 |
| **v2.0** | 10 avatares, accesorios estacionales, tabla familiar, racha compasiva | Mes 3 |
| **v3.0** | Segundo compañero, entornos personalizables, mini-eventos | Mes 6 |

---

*Documento técnico preparado por Aurora Méndez (virtual). Basado en los frameworks de Nir Eyal (Hooked), Yu-kai Chou (Octalysis), BJ Fogg (Behavior Design), Jane McGonigal (SuperBetter) y Dan Ariely (Behavioral Economics). Adaptado para población senior con input de la Dra. Carmen Navarro (gerontología).*
