# 🔍 Auditoría de Código — Dame un Ok

**Fecha:** 2025-07-22  
**Auditor:** Claude (Senior Code Auditor)  
**Alcance:** `src/app/`, `src/components/`, `src/lib/`

---

## 📁 1. Estructura de Archivos

### `src/app/` — Páginas y API Routes

| Archivo | Descripción |
|---------|-------------|
| `layout.tsx` | Root layout: fuente Nunito, AuthProvider, AuthGuard, SW registrar, wrapper 390px |
| `page.tsx` | Home: determina pantalla (alarm/user/sleeping) según horarios y check-ins |
| `global-error.tsx` | Error boundary global con Sentry |
| `globals.css` | Estilos globales, animaciones, speech bubbles, Tailwind base |
| `login/page.tsx` | Login/registro con email+contraseña |
| `demo/page.tsx` | Demo interactiva paso a paso del flujo completo |
| `familiar/page.tsx` | Panel familiar: lista usuarios, viewer/admin mode, onboarding wizard |
| `landing/layout.tsx` | Layout wrapper para landing (clase `.landing-page`) |
| `landing/page.tsx` | Landing page con framer-motion, secciones hero/cómo funciona/planes |
| `pricing/page.tsx` | Página de precios con comparativa free vs premium |
| `registro-familiar/page.tsx` | Registro de familiar con código de invitación |
| `u/[code]/page.tsx` | Magic link: crea usuario anónimo, aplica schedules, muestra bienvenida |
| `admin/page.tsx` | Dashboard admin antiguo (métricas directas, key=dok-admin-2026) |
| `admin/invites/page.tsx` | Gestión de invitaciones admin |
| `dashboard/layout.tsx` | Layout del nuevo dashboard: sidebar, header, portal fuera del wrapper 390px |
| `dashboard/page.tsx` | Overview con métricas: usuarios, check-ins, alertas, revenue |
| `dashboard/alerts/page.tsx` | Tabla de alertas con filtros y KPIs |
| `dashboard/chat/page.tsx` | Chat IA "Leo" con queries predefinidas a Supabase |
| `dashboard/engagement/page.tsx` | Métricas de engagement: rachas, retención D1/D7/D30, actividad diaria |
| `dashboard/revenue/page.tsx` | Revenue: MRR, ARR, distribución planes, proyecciones |
| `dashboard/users/page.tsx` | Lista de usuarios con detalle, check-ins y alertas |
| `api/cron/check-alerts/route.ts` | Cron: monitoriza alertas, envía push a usuarios y familiares |
| `api/force-wake/route.ts` | Force-wake: admin fuerza despertar de Fufy, borra check-ins del día |
| `api/health/route.ts` | Health check endpoint |
| `api/link-user/route.ts` | Vincula usuario a familiar (bypass RLS con service key) |
| `api/push/check-alerts/route.ts` | Check alerts y envía push a familiares |
| `api/push/send/route.ts` | Envío genérico de push notifications |
| `api/push/snooze/route.ts` | Snooze/DND para un usuario |
| `api/push/subscribe/route.ts` | Suscripción a push notifications |
| `api/stripe/webhook/route.ts` | Webhook de Stripe (checkout, invoice, subscription) |

### `src/components/` — Componentes

| Archivo | Descripción |
|---------|-------------|
| `alarm/AlarmScreen.tsx` | Pantalla de alarma con configuración por nivel |
| `auth/AuthGuard.tsx` | Guard de autenticación, redirige a /landing si no autenticado |
| `dashboard/AdminHeader.tsx` | Header del dashboard admin |
| `dashboard/AdminSidebar.tsx` | Sidebar de navegación del dashboard |
| `dashboard/StatCard.tsx` | Tarjeta de estadística reutilizable |
| `familiar/AddFamiliarFlow.tsx` | Flujo para añadir familiar: config horarios + generar enlace |
| `familiar/FamiliarDashboard.tsx` | Dashboard del familiar: tabs, alertas en tiempo real, push |
| `familiar/FamiliarOnboardingWizard.tsx` | Wizard de onboarding para familiares (5 pasos) |
| `familiar/ScheduleEditor.tsx` | Editor de horarios con long-press para eliminar |
| `familiar/TabAjustes.tsx` | Tab de ajustes: notificaciones, visor, cuenta |
| `familiar/TabAlertas.tsx` | Tab de historial de alertas |
| `familiar/TabFamiliares.tsx` | Tab de lista de familiares vinculados |
| `familiar/TabInicio.tsx` | Tab inicio: estado actual, acciones hoy, botones emergencia |
| `onboarding/OnboardingFlow.tsx` | Onboarding del usuario: nombre mascota, tipo, código invitación |
| `pwa/ServiceWorkerRegistrar.tsx` | Registro del service worker |
| `ui/Avatar.tsx` | Componente avatar circular |
| `ui/Badge.tsx` | Badge con icono y texto |
| `ui/Card.tsx` | Card base reutilizable |
| `ui/Confetti.tsx` | Animación de confeti |
| `ui/ShareButtons.tsx` | Botones de compartir (copiar, WhatsApp, nativo) |
| `ui/TabBar.tsx` | Barra de navegación inferior |
| `ui/UpgradePrompt.tsx` | Prompt para upgrade a Premium |
| `ui/icons/*.tsx` | Iconos SVG: Bell, Check, Fish, Gear, Heart, Home, People, Yarn |
| `user/AchievementPopup.tsx` | Popup de logro desbloqueado con confeti |
| `user/ActionButtons.tsx` | Botones de acción (alimentar, mimar, jugar) |
| `user/FufyEvolution.tsx` | Panel de evolución y logros de Fufy |
| `user/PetDisplay.tsx` | Display del avatar de la mascota |
| `user/UserScreen.tsx` | Pantalla principal del usuario con mascota y acciones |

### `src/lib/` — Lógica compartida

| Archivo | Descripción |
|---------|-------------|
| `constants/achievements.ts` | Definición de logros |
| `constants/alerts.ts` | Configuración de alertas por nivel, tiempos de escalación |
| `constants/fufy-evolution.ts` | Niveles de evolución y accesorios de Fufy |
| `constants/index.ts` | Re-exports |
| `constants/pets.ts` | Avatares, sentimientos, fondos por estado |
| `constants/plans.ts` | Planes free/premium con features |
| `constants/theme.ts` | Tokens de diseño: colores, gradientes, botones, tamaños |
| `context/AuthContext.tsx` | Context de autenticación con Supabase |
| `devices/*.ts` | Adaptadores de dispositivos (smartphone, smart-tv, iot-button, iot-screen, voice-assistant, sms-ivr) |
| `hooks/useAchievements.ts` | Hook de logros con persistencia en Supabase |
| `hooks/usePetState.ts` | Hook de estado de mascota basado en acciones |
| `hooks/useSubscription.ts` | Hook de suscripción (free/premium) |
| `services/alerts.ts` | Cálculo de nivel de alerta, CRUD de alertas |
| `services/notifications.ts` | Envío de notificaciones por canales |
| `services/push.ts` | Suscripción/desuscripción de push (VAPID) |
| `services/streak.ts` | Cálculo de racha de días consecutivos |
| `services/supabase.ts` | Cliente Supabase (singleton) |
| `types/*.ts` | Tipos TypeScript para user, familiar, devices |

---

## 🔗 2. Dependencias entre Componentes

### Componentes más importados
- `supabase` (lib/services/supabase) → importado en **~25 archivos**
- `Card` (ui/Card) → importado en **~8 componentes**
- `COLORS/GRADIENTS` (lib/constants/theme) → importado en **~15 archivos**
- `useAuth` (lib/context/AuthContext) → importado en **5 archivos**

### Grafo principal de dependencias

```
layout.tsx
├── AuthContext (AuthProvider)
├── AuthGuard
└── ServiceWorkerRegistrar

page.tsx (Home)
├── AuthContext (useAuth)
├── AlarmScreen
├── UserScreen
├── OnboardingFlow
└── supabase

familiar/page.tsx
├── FamiliarDashboard
├── FamiliarOnboardingWizard
├── AuthContext (useAuth)
├── Card, PET_AVATARS
└── supabase

FamiliarDashboard
├── TabInicio, TabFamiliares, TabAlertas, TabAjustes
├── TabBar, GearIcon
├── alerts service, notifications service, streak service, push service
└── supabase (realtime subscriptions)

UserScreen
├── usePetState, useAchievements
├── ActionButtons, PetDisplay (NO USADO directamente), Confetti
├── AchievementPopup, FufyEvolution
├── fufy-evolution constants
└── supabase (check-ins, geolocation, battery)

dashboard/layout.tsx
├── AdminSidebar, AdminHeader
└── createPortal (escapa del wrapper 390px)
```

---

## ☠️ 3. Código Muerto

### Componentes no utilizados
| Componente | Motivo |
|------------|--------|
| `PetDisplay.tsx` | **NO se renderiza en ningún sitio.** `UserScreen.tsx` tiene su propio render inline del avatar, duplicando la lógica de PetDisplay |
| `Avatar.tsx` | Exportado en `ui/index.ts` pero **nunca importado** por ningún componente |

### Imports no usados
| Archivo | Import no usado |
|---------|----------------|
| `familiar/page.tsx` | `adminMode` — declarado con `useState` pero nunca leído (tiene `// eslint-disable-line @typescript-eslint/no-unused-vars`) |
| `user/UserScreen.tsx` | `userName` en Props — recibido pero **nunca usado** en el render |
| `admin/page.tsx` | Múltiples `// eslint-disable-next-line @typescript-eslint/no-explicit-any` para suprimir errores |

### Variables/funciones no usadas
| Archivo | Variable |
|---------|----------|
| `familiar/page.tsx` | `adminMode` — useState que nunca se lee |
| `user/UserScreen.tsx` | `setTodayActions` — setter de un estado que nunca se lee directamente (el estado se usa solo para setInitialActions) |
| `lib/hooks/index.ts` | No exporta `useAchievements` — se importa directamente |
| `lib/services/alerts.ts` | `getAlertHistory()` — función exportada pero **nunca llamada** |
| `lib/services/push.ts` | `unsubscribeFromPush()` — función exportada pero **nunca llamada** |
| `lib/services/index.ts` | Exporta `resolveAlerts` e `isSupabaseReady` que no se usan externamente |
| `constants/alerts.ts` | `ALERT_STREAKS` — exportado pero **nunca importado** |
| `constants/alerts.ts` | `PREMIUM_FEATURES` — exportado pero **nunca importado** |

### Dependencias npm no usadas (en código fuente)
| Paquete | Observación |
|---------|-------------|
| `recharts` | Instalado pero **no usado en ningún componente**. El dashboard usa barras CSS manuales |
| `zustand` | Instalado pero **no usado**. Todo el estado es useState/useContext |
| `jose` | Instalado pero **no usado** en código fuente |
| `bcryptjs` | Instalado pero **no usado** en código fuente |

---

## 🔄 4. Duplicación

### Duplicación significativa

#### 4.1 `fetchMetrics()` duplicada completamente
- `admin/page.tsx` tiene `fetchMetrics()` (~100 líneas)
- `dashboard/page.tsx` tiene `fetchMetrics()` casi idéntica (~90 líneas)
- **Ambas hacen las mismas 13 queries paralelas a Supabase**
- **Acción:** Extraer a `lib/services/metrics.ts`

#### 4.2 Estilos inline repetidos masivamente
Los siguientes patrones de estilo se repiten en **10+ archivos**:
```typescript
// Patrón 1: Centrado vertical fullscreen (se repite ~15 veces)
{ width: "100%", height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: GRADIENTS.mint }

// Patrón 2: Card/container blanco con borderRadius (se repite ~20 veces)
{ background: "rgba(255,255,255,0.85)", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }

// Patrón 3: Botón verde primario (se repite ~12 veces)
{ padding: "14px", borderRadius: 14, background: "#22c55e", color: "white", fontSize: 17, fontWeight: 800, border: "none", cursor: "pointer" }

// Patrón 4: Input style (se repite en 3 archivos)
{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 15, marginBottom: 12 }
```

#### 4.3 Lógica de estado de alerta duplicada
- `FamiliarDashboard.tsx` → calcula alertLevel con `calculateAlertLevel()`
- `TabFamiliares.tsx` → `getStatus()` calcula lo mismo pero con lógica inline diferente
- `familiar/page.tsx` → calcula `isOk/isAlert/isEmergency` con otra lógica inline
- `api/cron/check-alerts/route.ts` → `getAlertLevel()` implementación separada
- `api/push/check-alerts/route.ts` → otra `getAlertLevel()` 
- **5 implementaciones diferentes de la misma lógica**

#### 4.4 Auth check duplicado en API routes
Los siguientes endpoints repiten el mismo bloque de autenticación (~10 líneas idénticas):
- `api/push/check-alerts/route.ts`
- `api/push/send/route.ts`
- `api/push/snooze/route.ts`
- `api/push/subscribe/route.ts`
- **Acción:** Extraer middleware de auth

#### 4.5 `initWebPush()`/`getWebPush()` duplicado
- `api/cron/check-alerts/route.ts` → `initWebPush()`
- `api/push/check-alerts/route.ts` → `getWebPush()`
- `api/push/send/route.ts` → `getWebPush()`
- `api/force-wake/route.ts` → inline webpush setup
- **4 inicializaciones de web-push**

#### 4.6 Creación de cliente Supabase duplicada
- `lib/services/supabase.ts` → singleton con anon key
- `api/cron/check-alerts/route.ts` → `createClient()` con anon key
- `api/push/check-alerts/route.ts` → `createClient()` con anon key
- `api/push/send/route.ts` → `createClient()` con anon key
- `api/push/snooze/route.ts` → `createClient()` con anon key
- `api/push/subscribe/route.ts` → `createClient()` con anon key
- `api/force-wake/route.ts` → `createClient()` con service key (`getAdmin()`)
- `api/health/route.ts` → `createClient()` con service key
- `api/link-user/route.ts` → `createClient()` con service key (`getAdmin()`)
- `api/stripe/webhook/route.ts` → `createClient()` con service key
- **Acción:** Centralizar en `lib/services/supabase-server.ts` (anon) y `lib/services/supabase-admin.ts` (service)

---

## ⚠️ 5. Problemas de Calidad

### 5.1 `any` types y eslint-disable
| Archivo | Problema |
|---------|----------|
| `admin/page.tsx` | **7x** `// eslint-disable-next-line @typescript-eslint/no-explicit-any` con `Record<string, any>` |
| `familiar/page.tsx` | `// eslint-disable-line @typescript-eslint/no-unused-vars` para `adminMode` |
| `FamiliarOnboardingWizard.tsx` | `// eslint-disable-next-line react-hooks/exhaustive-deps` |
| `AddFamiliarFlow.tsx` | `// eslint-disable-next-line @next/next/no-img-element` |
| `user/UserScreen.tsx` | `navigator as unknown as { getBattery: ... }` — casting forzado |
| `dashboard/users/page.tsx` | `Record<string, unknown>[]` para check-ins y alertas — debería tipar |

### 5.2 Console.logs
| Archivo | Línea |
|---------|-------|
| `admin/page.tsx` | `console.error("Failed to fetch metrics", e)` |
| `dashboard/page.tsx` | `console.error("Failed to fetch metrics", e)` |
| `dashboard/layout.tsx` | `console.error("Auth error:", e)` |
| `context/AuthContext.tsx` | `console.error("loadProfile error:", err)` |

### 5.3 Hardcoded values que deberían ser constantes
| Valor | Dónde se repite | Debería ser |
|-------|-----------------|-------------|
| `"dok-admin-2026"` | `admin/page.tsx`, `admin/invites/page.tsx` | `const ADMIN_SECRET` en constants |
| `"https://dame-un-ok.vercel.app"` | `AddFamiliarFlow.tsx`, `FamiliarOnboardingWizard.tsx`, `TabAjustes.tsx`, `admin/invites/page.tsx` | `const BASE_URL` en constants |
| `"Europe/Madrid"` | `api/cron/check-alerts/route.ts`, `FamiliarOnboardingWizard.tsx` | `const DEFAULT_TIMEZONE` |
| `2.99` (precio premium) | `admin/page.tsx`, `dashboard/page.tsx`, `dashboard/revenue/page.tsx`, `dashboard/chat/page.tsx` | `PLANS.premium.price / 100` |
| `"vertexdeveloperchina@gmail.com"` | 3 API routes | Variable de entorno (ya existe VAPID_EMAIL) |
| `60000` (intervalo refresh) | ~6 archivos | `const REFRESH_INTERVAL_MS` |
| `390` (max-width wrapper) | `layout.tsx`, `familiar/page.tsx` | CSS variable o constante |

### 5.4 Falta de error handling
| Archivo | Problema |
|---------|----------|
| `page.tsx` (Home) | `determineScreen()` — múltiples queries sin manejo de errores |
| `u/[code]/page.tsx` | `enter()` — si falla `signInAnonymously` después de encontrar usuario existente, no hay fallback |
| `familiar/page.tsx` | Viewer/Admin validation — errores genéricos `catch {}` sin logging |
| `FamiliarDashboard.tsx` | `subscribeToPush()` se llama sin await en useEffect |
| `ScheduleEditor.tsx` | `saveAll()` no maneja errores de Supabase |
| `api/stripe/webhook/route.ts` | **TODO: Verify Stripe signature** — ¡no se verifica la firma del webhook! |
| Múltiples API routes | `catch {}` vacíos que silencian errores |

---

## 🔒 6. Seguridad

### 6.1 ⚠️ SUPABASE_SERVICE_ROLE_KEY
- **Ubicación:** Se usa en `api/force-wake`, `api/health`, `api/link-user`, `api/stripe/webhook` via `process.env.SUPABASE_SERVICE_ROLE_KEY`
- **Estado:** ✅ Correcto — solo en server-side API routes, no en `.env.local` visible
- **Riesgo:** Bajo. Las API routes son server-side.

### 6.2 🔴 ADMIN_SECRET hardcodeado
- `admin/page.tsx`: `const SECRET_KEY = "dok-admin-2026"`
- `admin/invites/page.tsx`: `const ADMIN_KEY = "dok-admin-2026"`
- **Problema:** La key está en el código fuente del cliente. Cualquiera puede ver el bundle JS y acceder al admin.
- **Severidad:** ALTA — expone métricas y gestión de invitaciones.

### 6.3 🔴 Webhook de Stripe sin verificación de firma
- `api/stripe/webhook/route.ts`: El `// TODO: Verify Stripe signature` está sin implementar
- El body se parsea como JSON sin verificar que viene de Stripe
- **Severidad:** ALTA — cualquiera puede enviar webhooks falsos

### 6.4 🟡 Dashboard auth via query param
- `dashboard/layout.tsx`: Auth se hace con `?admin=CODE` y se almacena en `sessionStorage/localStorage`
- No hay verificación server-side del rol admin
- El código admin se valida contra `dok_admin_invitations` (tabla) pero no hay expiración
- **Severidad:** MEDIA — funcional pero frágil

### 6.5 🟡 localStorage con datos sensibles
| Key | Dato | Riesgo |
|-----|------|--------|
| `dok_viewer_code` | Código de visor | Bajo |
| `dok_viewer_role` | Rol "viewer" | Bajo |
| `dok_admin_code` | Código de admin | **Medio** — permite acceso persistente |
| `dok_admin_name` | Nombre del admin | Bajo |
| `dok_onboarded` | Flag boolean | Bajo |
| `dok_code` | Código de invitación del usuario | Bajo |

### 6.6 🟡 API routes sin rate limiting
- Todos los endpoints API carecen de rate limiting
- `api/push/send` podría ser abusado para spam de notificaciones
- `api/force-wake` podría ser llamado repetidamente

### 6.7 ✅ Supabase anon key
- La anon key en `.env.local` es correcta (clave pública)
- RLS debería proteger las tablas — **pero no podemos verificar las policies desde el código**

### 6.8 🟡 VAPID_PRIVATE_KEY en .env.local
- `VAPID_PRIVATE_KEY=zJSnmhyRORJJ9SS9zWJ9IRpTcXiXSqR2HekujY7rw0A`
- Está en `.env.local` (no en el bundle), pero está en el repo. Si el repo es público, está expuesta.

---

## ⚡ 7. Rendimiento

### 7.1 Re-renders innecesarios
| Componente | Problema |
|------------|----------|
| `FamiliarDashboard.tsx` | `updateAlertLevel` se recrea en cada render porque depende de `prevAlertLevel` (estado). Esto causa que el `useEffect` con interval se re-ejecute constantemente |
| `page.tsx` (Home) | `determineScreen` depende de `dokUser?.id` pero hace **5-6 queries** a Supabase cada 60 segundos |
| `familiar/page.tsx` | `loadUsers()` en interval cada 30s + realtime subscription → doble actualización |
| `UserScreen.tsx` | Polling de `force_wake_until` cada 5 segundos — muy agresivo |

### 7.2 useEffect sin cleanup
| Archivo | Problema |
|---------|----------|
| `familiar/page.tsx` | useEffect de viewer/admin validation — async IIFE sin cleanup si componente se desmonta |
| `UserScreen.tsx` | `getBattery().then()` — no tiene cleanup del event listener `levelchange` |
| `UserScreen.tsx` | Geolocation `getCurrentPosition` — no es cancelable pero el timeout podría resolverse después del desmonte |

### 7.3 Fetches que podrían cachearse
| Fetch | Frecuencia | Sugerencia |
|-------|-----------|------------|
| `fetchMetrics()` en admin/dashboard | Cada 60s, 13 queries paralelas | Cache con SWR o React Query, invalidar con realtime |
| `calculateStreak()` | Cada acción + cada 60s | Guardar en estado local, invalidar solo en check-in |
| `loadUsers()` en familiar | Cada 30s | Usar realtime subscription en lugar de polling |
| User profile queries | En múltiples componentes | Centralizar en AuthContext |

### 7.4 Queries N+1
- `dashboard/alerts/page.tsx`: Obtiene alertas, luego obtiene usuarios por IDs → podría ser un JOIN en Supabase
- `dashboard/engagement/page.tsx`: Obtiene todos los users y todos los check-ins de 30 días → podría ser muy pesado con muchos usuarios

### 7.5 Bundle size
- `framer-motion` se usa **solo en la landing page** pero se carga en el bundle global
- `recharts` está instalado pero no se usa
- `web-push` se importa en API routes (server-side, OK)

---

## 📋 8. Recomendaciones Priorizadas

### P0 — Crítico (bugs/seguridad) 🔴

| # | Problema | Archivo | Acción |
|---|---------|---------|--------|
| P0-1 | **Admin secret hardcodeado en cliente** | `admin/page.tsx`, `admin/invites/page.tsx` | Mover autenticación admin a server-side (middleware o API route). Usar sesión segura |
| P0-2 | **Stripe webhook sin verificación de firma** | `api/stripe/webhook/route.ts` | Implementar `stripe.webhooks.constructEvent()` con el webhook secret |
| P0-3 | **Precio premium inconsistente** | `dashboard/*.tsx` usa €2.99, landing usa €4.99, plans.ts dice 499 cents | Unificar: usar `PLANS.premium.price / 100` en todos lados |
| P0-4 | **VAPID_PRIVATE_KEY en el repo** | `.env.local` | Añadir `.env.local` a `.gitignore` (verificar), rotar la key si repo público |

### P1 — Importante 🟡

| # | Problema | Acción |
|---|---------|--------|
| P1-1 | **`fetchMetrics()` duplicada** (admin + dashboard) | Extraer a `lib/services/metrics.ts` |
| P1-2 | **5 implementaciones de alertLevel** | Centralizar en `lib/services/alerts.ts`, reutilizar |
| P1-3 | **`PetDisplay.tsx` componente muerto** | Eliminar o usarlo en UserScreen (sustituyendo el render inline) |
| P1-4 | **`Avatar.tsx` componente muerto** | Eliminar o usar donde corresponda |
| P1-5 | **4 inicializaciones de webpush** | Crear `lib/services/webpush-server.ts` |
| P1-6 | **10 creaciones de Supabase client** en API routes | Crear `lib/services/supabase-admin.ts` |
| P1-7 | **Auth check duplicado** en 4 API routes push | Crear middleware helper `withAuth()` |
| P1-8 | **paquetes npm no usados:** recharts, zustand, jose, bcryptjs | `npm uninstall recharts zustand jose bcryptjs` |
| P1-9 | **`ALERT_STREAKS`, `PREMIUM_FEATURES`, `getAlertHistory`, `unsubscribeFromPush`** no usados | Eliminar o documentar como pendiente |

### P2 — Mejora 🔵

| # | Problema | Acción |
|---|---------|--------|
| P2-1 | **Estilos inline masivos** | Migrar patrones repetidos a clases Tailwind o CSS modules |
| P2-2 | **Hardcoded BASE_URL, ADMIN_SECRET, DEFAULT_TZ** | Extraer a constantes/env vars |
| P2-3 | **`any` types** en admin/page.tsx | Tipar las respuestas de Supabase con interfaces |
| P2-4 | **`eslint-disable` comments** | Resolver los problemas subyacentes en lugar de silenciarlos |
| P2-5 | **console.error en producción** | Reemplazar con Sentry.captureException o eliminar |
| P2-6 | **Device adapters** (smart-tv, iot-*, voice-assistant, sms-ivr) | Todo es `throw "Not implemented"`. Mover a carpeta `future/` o eliminar |
| P2-7 | **`OnboardingFlow.tsx` (user)** genera código de invitación antiguo | El flujo principal usa magic links (`/u/CODE`). Este genera códigos para `/registro-familiar`. ¿Es intencional? |
| P2-8 | **admin/page.tsx** (dashboard antiguo) vs **dashboard/page.tsx** (nuevo) | Eliminar el admin antiguo, redirigir |
| P2-9 | **`useSubscription` hook** | No exportado desde `hooks/index.ts` — inconsistencia (se importa directo) |
| P2-10 | **Falta `Suspense` boundary** en `admin/page.tsx` | Usa `useSearchParams()` sin Suspense wrapper |

### P3 — Nice to have ⚪

| # | Problema | Acción |
|---|---------|--------|
| P3-1 | **Polling force_wake cada 5s** | Cambiar a Supabase realtime subscription |
| P3-2 | **`page.tsx` (Home) hace 5-6 queries cada 60s** | Consolidar en 1-2 queries o usar realtime |
| P3-3 | **framer-motion solo en landing** | Dynamic import con `next/dynamic` para reducir bundle |
| P3-4 | **Battery API** sin cleanup del listener | Guardar referencia y remover en cleanup del useEffect |
| P3-5 | **Geolocation** se pide después de 3s delay | Considerar pedir solo cuando el familiar lo necesite (premium) |
| P3-6 | **Dashboard engagement** carga TODOS los check-ins de 30 días | Paginar o usar queries agregadas en Supabase (funciones RPC) |
| P3-7 | **`TabAjustes.tsx`** muestra "Plan: Premium" hardcoded | Debería leer del hook `useSubscription` |
| P3-8 | **Icons SVG inline** | Considerar sprite SVG o librería de iconos para mejor cacheo |
| P3-9 | **`familiar/page.tsx`** ~400 líneas | Extraer lógica de viewer/admin validation a hooks separados |
| P3-10 | **`transform: "translateX(-50)"` sin %** en `familiar/page.tsx` | Falta el `%`: debería ser `"translateX(-50%)"` (bug CSS) |

---

## 📊 9. Resumen Ejecutivo

| Categoría | Hallazgos |
|-----------|-----------|
| Archivos analizados | **75 archivos** (app + components + lib) |
| Componentes muertos | **2** (PetDisplay, Avatar) |
| Funciones/exports no usados | **6+** |
| Paquetes npm no usados | **4** (recharts, zustand, jose, bcryptjs) |
| Duplicaciones significativas | **6 patrones** de duplicación |
| Issues P0 (crítico) | **4** |
| Issues P1 (importante) | **9** |
| Issues P2 (mejora) | **10** |
| Issues P3 (nice to have) | **10** |

### Puntos fuertes ✅
- Buena separación en capas (components/lib/services/hooks/types)
- Sistema de tipos TypeScript bien definido en `lib/types/`
- Constantes de diseño centralizadas en `theme.ts`
- Real-time subscriptions de Supabase bien implementadas
- PWA con service worker y push notifications
- Sistema de logros gamificado
- Manejo de timezone para usuarios internacionales

### Deuda técnica principal 🔧
1. **Duplicación masiva** — especialmente fetchMetrics y alertLevel
2. **Estilos inline** — el proyecto usa Tailwind pero la mayoría es inline styles
3. **Código muerto y dependencias sin usar** — ~4 paquetes + componentes + funciones
4. **Seguridad del admin** — secret hardcoded en bundle del cliente