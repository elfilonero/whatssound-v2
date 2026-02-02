# 🐱 Dame un Ok — Documento Maestro del Proyecto

> **Versión:** 2.0 | **Última actualización:** 2 de febrero de 2026  
> **URL:** [dame-un-ok.vercel.app](https://dame-un-ok.vercel.app)  
> **Repositorio:** [github.com/elfilonero/dame-un-ok](https://github.com/elfilonero/dame-un-ok)

---

## 1. ¿Qué es Dame un Ok?

**Dame un Ok** es una aplicación web progresiva (PWA) diseñada para el cuidado indirecto de personas mayores que viven solas. En lugar de sistemas de vigilancia intrusivos o dispositivos wearables que muchos mayores rechazan, Dame un Ok utiliza un enfoque revolucionario: **una mascota virtual llamada Fufy**.

### Misión

Proporcionar tranquilidad a las familias que tienen seres queridos mayores viviendo solos, sin que estos se sientan vigilados o controlados.

### Visión

Convertirnos en la referencia mundial en monitoreo no intrusivo de personas mayores, demostrando que la tecnología puede cuidar con dignidad y respeto.

### Propuesta de Valor

| Para el familiar (cuidador) | Para la persona mayor |
|---|---|
| Recibe confirmación diaria de que su ser querido está bien | No se siente vigilado ni controlado |
| Alertas escalonadas si no hay actividad | Solo ve una mascota virtual que cuidar |
| Panel de control con información en tiempo real | Experiencia sencilla: 3 toques al día |
| Configuración de horarios y umbrales personalizados | Sin registro, sin contraseñas, sin complicaciones |

**El secreto:** Para el mayor, es un juego — cuidar a Fufy. Para la familia, es un sistema de monitoreo que les da paz mental.

---

## 2. Público Objetivo

### Primario: Familias con mayores que viven solos
- Hijos/as de 35-55 años con padres/madres de 65+ viviendo solos
- Preocupados por la seguridad diaria pero respetuosos con la autonomía
- Familias geográficamente dispersas (el hijo en Madrid, la madre en el pueblo)

### Secundario: Profesionales del cuidado
- Residencias y centros de día
- Trabajadores sociales
- Cuidadores profesionales que gestionan múltiples mayores

### Terciario: Instituciones
- Ayuntamientos con programas de atención a mayores
- ONGs de tercera edad
- Aseguradoras con productos silver economy

---

## 3. Modelo de Negocio

### Freemium

| Característica | Plan Básico (Gratis) | Plan Premium (4,99€/mes) |
|---|---|---|
| Familiares monitoreados | 1 | Hasta 5 |
| Alertas push | ✅ | ✅ |
| Alertas SMS + Email | ❌ | ✅ |
| Mascota virtual Fufy | ✅ | ✅ |
| Configuración de horarios | ✅ | ✅ |
| Geolocalización | ❌ | ✅ |
| Foto del mayor | ❌ | ✅ |
| Soporte prioritario | ❌ | ✅ |
| **Precio** | **Gratis para siempre** | **4,99€/mes** |

### Métricas clave (KPIs)
- **MRR** (Monthly Recurring Revenue)
- **Tasa de conversión** free → premium
- **Retención** D1 / D7 / D30
- **DAU/MAU** (usuarios activos diarios/mensuales)
- **Racha media** de días consecutivos con check-in

---

## 4. Stack Tecnológico

| Componente | Tecnología | Versión |
|---|---|---|
| **Framework** | Next.js (App Router) | 14 |
| **Lenguaje** | TypeScript | 5.x |
| **Estilos** | Tailwind CSS | 3.x |
| **Animaciones** | Framer Motion | — |
| **Base de datos** | Supabase (PostgreSQL) | — |
| **Auth** | Supabase Auth (anónima) | — |
| **Realtime** | Supabase Realtime | — |
| **Gráficas** | Recharts | 2.x |
| **IA (Dashboard)** | Vercel AI SDK + Anthropic Claude | AI SDK 4.x |
| **Fuente** | Nunito (Google Fonts) | — |
| **Deploy** | Vercel | CLI manual |
| **Control de versiones** | Git + GitHub | — |
| **PWA** | Service Worker + Manifest | — |

---

## 5. Estructura de Carpetas

```
dame-un-ok/
├── docs/                           # 📚 Documentación del proyecto
│   ├── PROYECTO-DAME-UN-OK.md      # Este documento
│   ├── EQUIPO.md                   # Equipo y roles
│   ├── ARQUITECTURA.md             # Arquitectura técnica
│   ├── FLUJOS-USUARIO.md           # Flujos de usuario
│   ├── VERSIONES.md                # Historial de versiones
│   ├── DECISIONES.md               # Registro de decisiones
│   └── PLAN-DASHBOARD-COMPLETO.md  # Plan original del dashboard
│
├── src/                            # 🏗️ Código fuente
│   └── src/
│       ├── app/                    # App Router (Next.js 14)
│       │   ├── layout.tsx          # Layout raíz (wrapper 390px, AuthProvider)
│       │   ├── landing/page.tsx    # Landing page responsive
│       │   ├── familiar/page.tsx   # Panel familiar (wizard + dashboard)
│       │   ├── u/[code]/page.tsx   # App del mayor (mascota Fufy)
│       │   ├── dashboard/          # Dashboard profesional
│       │   │   ├── layout.tsx      # Layout con sidebar (portal React)
│       │   │   ├── page.tsx        # Overview
│       │   │   ├── users/          # Gestión de usuarios
│       │   │   ├── alerts/         # Panel de alertas
│       │   │   ├── engagement/     # Métricas de engagement
│       │   │   ├── revenue/        # Revenue y suscripciones
│       │   │   └── chat/           # Chat IA con Leo
│       │   ├── admin/              # Admin legacy
│       │   ├── api/                # API Routes
│       │   │   ├── dashboard/      # APIs del dashboard
│       │   │   ├── push/           # Push notifications
│       │   │   ├── force-wake/     # Despertar Fufy manualmente
│       │   │   ├── link-user/      # Vincular usuario
│       │   │   └── health/         # Health check
│       │   └── demo/               # Demo mode
│       │
│       ├── components/             # Componentes React
│       │   ├── familiar/           # Panel familiar
│       │   │   ├── FamiliarDashboard.tsx
│       │   │   ├── FamiliarOnboardingWizard.tsx
│       │   │   ├── TabInicio.tsx
│       │   │   ├── TabFamiliares.tsx
│       │   │   ├── TabAlertas.tsx
│       │   │   └── TabAjustes.tsx
│       │   ├── dashboard/          # Dashboard profesional
│       │   │   ├── AdminSidebar.tsx
│       │   │   ├── AdminHeader.tsx
│       │   │   ├── StatCard.tsx
│       │   │   └── ChartCard.tsx
│       │   ├── pet/                # App de la mascota
│       │   ├── auth/               # Autenticación
│       │   ├── ui/                 # Componentes UI reutilizables
│       │   └── pwa/                # Service Worker
│       │
│       └── lib/                    # Librerías y utilidades
│           ├── services/           # Supabase, alertas, push, streak
│           ├── constants/          # Theme, pets, alerts
│           ├── context/            # AuthContext
│           └── types/              # TypeScript types
│
├── public/                         # Assets estáticos
│   ├── avatars/                    # Imágenes de Fufy (estados)
│   ├── icons/                      # Iconos PWA
│   └── manifest.json               # PWA manifest
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 6. URLs Principales

| URL | Descripción |
|---|---|
| `/` | Redirección a landing |
| `/landing` | Landing page con planes y CTA |
| `/familiar` | Panel familiar (wizard si no onboarded) |
| `/familiar?admin=CODE` | Acceso admin con código de invitación |
| `/u/CODE` | App del mayor (mascota Fufy) |
| `/dashboard?admin=CODE` | Dashboard profesional |
| `/demo` | Modo demo |

---

*Documento creado el 2 de febrero de 2026 por Leo (IA Developer)*
