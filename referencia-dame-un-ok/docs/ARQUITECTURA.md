# 🏗️ Arquitectura Técnica — Dame un Ok

> Última actualización: 2 de febrero de 2026

---

## 1. Visión General

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│         Next.js 14 (App Router) + React              │
│     Tailwind CSS + Framer Motion + Recharts          │
│              PWA (Service Worker)                     │
├─────────────────────────────────────────────────────┤
│                    BACKEND                           │
│              Supabase (BaaS)                         │
│   PostgreSQL │ Auth Anónima │ Realtime │ RLS         │
├─────────────────────────────────────────────────────┤
│                    DEPLOY                            │
│              Vercel (CLI manual)                      │
│        vercel --prod --yes desde terminal            │
└─────────────────────────────────────────────────────┘
```

---

## 2. Frontend

### Framework: Next.js 14 App Router

- **Renderizado:** Client-side (`"use client"`) para interactividad, API routes server-side
- **Layout raíz:** Wrapper de 390px centrado (diseño mobile-first)
  - El dashboard profesional **escapa** de este wrapper usando `createPortal` a `document.body`
- **Fuente:** Nunito (Google Fonts) — pesos 400, 600, 700, 800, 900
- **PWA:** Service Worker registrado en el layout, `manifest.json` para instalación

### Componentes React

- **Tailwind CSS:** Utilidades para layout responsive
- **Framer Motion:** Animaciones de entrada (fadeUp, scaleIn), transiciones, whileHover/whileTap
- **Recharts:** Gráficas de líneas, barras y áreas en el dashboard
- **CSS `:has()` selector:** Usado en la landing para estilos condicionales responsive

### Rutas de la Aplicación

| Ruta | Tipo | Descripción |
|---|---|---|
| `/landing` | Client | Landing page responsive |
| `/familiar` | Client | Panel familiar (wizard + dashboard) |
| `/u/[code]` | Client | App del mayor (mascota Fufy) |
| `/dashboard` | Client | Dashboard profesional (portal) |
| `/dashboard/users` | Client | Gestión de usuarios |
| `/dashboard/alerts` | Client | Panel de alertas |
| `/dashboard/engagement` | Client | Métricas de engagement |
| `/dashboard/revenue` | Client | Revenue y suscripciones |
| `/dashboard/chat` | Client | Chat IA con Leo |
| `/api/dashboard/*` | Server | APIs del dashboard |
| `/api/push/*` | Server | Push notifications |
| `/api/force-wake` | Server | Despertar Fufy manualmente |
| `/api/link-user` | Server | Vincular usuario a familiar |

---

## 3. Backend: Supabase

### Base de Datos (PostgreSQL)

#### Tablas principales

| Tabla | Descripción | Campos clave |
|---|---|---|
| `dok_users` | Usuarios mayores (los que cuidan a Fufy) | `id`, `name`, `email`, `pet_name`, `streak`, `last_check_in`, `invite_code`, `phone`, `dnd_until`, `battery_low`, `last_lat`, `last_lng`, `force_wake_until` |
| `dok_familiares` | Familiares/cuidadores | `id`, `auth_id`, `user_id`, `linked_user_id`, `familiar_name`, `familiar_email`, `relacion`, `rol` (admin/viewer), `onboarded`, `country`, `timezone` |
| `dok_invitations` | Invitaciones de familiar a usuario mayor | `id`, `familiar_id`, `code`, `familiar_name`, `schedules`, `alert_times`, `pet_type` |
| `dok_admin_invitations` | Códigos de acceso admin | `id`, `code`, `label`, `used`, `used_by`, `used_at` |
| `dok_check_ins` | Registros de actividad (alimentar, mimar, jugar) | `id`, `user_id`, `actions[]`, `created_at` |
| `dok_alertas` | Alertas generadas por inactividad | `id`, `user_id`, `nivel`, `message`, `resolved`, `created_at` |
| `dok_subscriptions` | Suscripciones premium | `id`, `user_id`, `plan`, `status`, `created_at` |
| `dok_viewer_invitations` | Invitaciones de solo lectura | `id`, `code`, `creator_familiar_id`, `used`, `used_by_auth_id` |

#### Relaciones

```
dok_admin_invitations ──→ dok_familiares (acceso admin)
dok_familiares ──→ dok_users (linked_user_id)
dok_invitations ──→ dok_users (genera el usuario al registrarse)
dok_check_ins ──→ dok_users (user_id)
dok_alertas ──→ dok_users (user_id)
dok_subscriptions ──→ dok_users (user_id)
```

### Autenticación

- **Auth anónima de Supabase:** Los usuarios no necesitan email ni contraseña
- **Flujo de auth:**
  1. El familiar accede con un código admin (`/familiar?admin=CODE`)
  2. Se valida el código contra `dok_admin_invitations`
  3. Se crea una sesión anónima con `supabase.auth.signInAnonymously()`
  4. Se crea un registro en `dok_familiares` vinculado al `auth_id`
  5. Se persiste en `localStorage` para sesiones posteriores
- **Persistencia:** `localStorage` guarda `dok_admin_code`, `dok_admin_name`, `dok_onboarded`
- **Dashboard:** Valida código admin en `sessionStorage`/`localStorage`, sin JWT (MVP)

### Row Level Security (RLS)

- Las policies de RLS filtran datos por `auth_id` del usuario autenticado
- Los familiares solo ven los usuarios vinculados a su cuenta
- Las API routes del dashboard consultan con permisos elevados (service role)

### Realtime

- **Suscripción en tiempo real** a `dok_check_ins` y `dok_users`
- El panel familiar recibe actualizaciones instantáneas cuando el mayor interactúa con Fufy
- Canal: `familiar_realtime` con filtro por `user_id`

---

## 4. Deploy

### Vercel

- **Método:** CLI manual desde terminal
- **Comando:** `vercel --prod --yes`
- **Deploy automático:** Desconectado (decisión consciente para control total)
- **URL producción:** [dame-un-ok.vercel.app](https://dame-un-ok.vercel.app)

### GitHub

- **Repositorio:** [github.com/elfilonero/dame-un-ok](https://github.com/elfilonero/dame-un-ok)
- **Rama principal:** `main`
- **Tags de versión:**
  - `v1.0-estable` → commit `bb83dff`
  - `v2.0-dashboard-completo` → commit `b685b83`

---

## 5. Flujos de Datos

### Check-in → Alerta → Notificación

```
Usuario mayor interactúa con Fufy
        │
        ▼
INSERT en dok_check_ins (actions: ["alimentar", "mimar", "jugar"])
        │
        ▼
Supabase Realtime notifica al panel familiar
        │
        ▼
FamiliarDashboard.tsx recalcula el estado:
  - ¿Tiene check-in hoy? → Estado "ok" ✅
  - ¿Cuánto tiempo sin actividad?
        │
        ├── < 1h  → ok (verde)
        ├── 1-3h  → alerta_1h (amarillo) → INSERT dok_alertas → Push notification
        ├── 3-6h  → alerta_3h (naranja) → INSERT dok_alertas → Push notification
        └── > 6h  → emergencia_6h (rojo) → INSERT dok_alertas → Push notification
```

### Cálculo de racha (streak)

```
Consulta dok_check_ins agrupado por día
        │
        ▼
Cuenta días consecutivos hacia atrás desde hoy
        │
        ▼
Actualiza streak en dok_users y en la UI
```

---

## 6. Arquitectura del Dashboard Profesional

### Problema: Wrapper de 390px

El layout raíz de la app limita todo el contenido a 390px (diseño mobile-first para la app del mayor). El dashboard necesita pantalla completa.

### Solución: React Portal

```tsx
// dashboard/layout.tsx
import { createPortal } from "react-dom";

// Renderiza FUERA del wrapper de 390px, directamente en document.body
return createPortal(
  <DashboardContent>{children}</DashboardContent>,
  document.body
);
```

El portal se renderiza con `position: fixed`, `width: 100vw`, `height: 100vh`, `zIndex: 99999`, escapando completamente del contenedor de la app.

### Secciones del Dashboard

| Sección | Datos | Visualización |
|---|---|---|
| **Overview** | KPIs generales, registros 30d, actividad | StatCards + gráficas Recharts |
| **Usuarios** | Listado, búsqueda, detalle | Tabla + perfil individual |
| **Alertas** | Alertas activas, historial, por nivel | KPIs + tabla + gráfica temporal |
| **Engagement** | Rachas, retención, funnels | Cohort analysis + funnels |
| **Revenue** | MRR, conversión, distribución | KPIs + placeholder Stripe |
| **Chat IA** | Conversación con Leo | Vercel AI SDK + streaming |

---

## 7. Variables de Entorno

| Variable | Uso | Dónde |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Vercel + local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Vercel + local |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (APIs server) | Vercel |
| `ANTHROPIC_API_KEY` | Chat IA del dashboard | Vercel |
| `VAPID_PUBLIC_KEY` | Push notifications (VAPID) | Vercel + local |
| `VAPID_PRIVATE_KEY` | Push notifications (VAPID) | Vercel |

---

*Documento creado el 2 de febrero de 2026 por Leo (IA Developer)*
