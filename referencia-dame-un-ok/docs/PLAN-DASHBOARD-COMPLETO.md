# 📊 Plan Maestro: Dashboard de Dame un Ok

> Plan completo de implementación del dashboard admin con IA conversacional integrada.  
> Cada tarea indica qué experto virtual supervisa y qué referente real inspira.

---

## 1. Inventario de Expertos

### 1.1 Expertos Virtuales del Equipo (15 existentes)

| # | Nombre | Especialidad | Referentes reales que inspiran |
|---|--------|-------------|-------------------------------|
| 1 | Dra. Carmen Navarro | Gerontóloga Social | Investigación en envejecimiento activo OMS |
| 2 | Alejandro Ruiz | Abogado RGPD | Regulación UE, MDR 2017/745 |
| 3 | Marina Chen | Ingeniera Mobile Flutter | Google Flutter team |
| 4 | Pablo Herrera | Diseñador UX Accesible | WCAG AAA, CaixaBank rediseño |
| 5 | Iñaki Goicoechea | Arquitecto Cloud | Ex-Telefónica, Firebase/GCP |
| 6 | Lucía Ramírez | Marketing Silver Economy | Growth hacking B2C |
| 7 | Dr. Fernando Vega | Seguridad y Criptografía | CISSP, CISM, auditorías UE |
| 8 | Marcos Delgado | Ingeniero IoT/Hardware | Fabricación CNC, certificación CE |
| 9 | Elena Soto | Electrónica Embebida | ESP32, firmware, impresoras térmicas |
| 10 | Ricardo Montoya | Telecomunicaciones Legacy | Ex-Movistar, SMS/USSD |
| 11 | Carlos Media | Smart TV / Connected TV | Netflix rendering, Samsung Tizen |
| 12 | Aurora Méndez | Gamificación | Nir Eyal, Yu-kai Chou, BJ Fogg |
| 13 | Roberto Fuentes | Diseño Industrial | OXO, Dieter Rams, IDEO |
| 14 | Pilar Santos | Impresión Térmica | Epson ESC/POS, Star Micronics |
| 15 | Diego Navarro | Notificación Multicanal | FCM, APNs, Twilio |

### 1.2 Expertos IA del Dashboard (nuevos, investigados)

| # | Nombre Real | Empresa | Rol en nuestro dashboard |
|---|------------|---------|-------------------------|
| 1 | Dario Amodei | Anthropic (CEO) | IA honesta, guardrails, Constitutional AI |
| 2 | Daniela Amodei | Anthropic (Presidenta) | Trust & Safety, políticas de acceso |
| 3 | Guillermo Rauch | Vercel (CEO) | AI SDK, Next.js, streaming |
| 4 | Harrison Chase | LangChain (CEO) | Tool calling, cadenas de consultas |
| 5 | Sam Altman | OpenAI (CEO) | System prompts, roles, function calling |
| 6 | Josh Pigford | Baremetrics (Fundador) | Visualización de métricas SaaS |
| 7 | Nick Franklin | ChartMogul (CEO) | Cohort analysis, MRR movements |
| 8 | Suhail Doshi | Mixpanel (Fundador) | Event-based analytics, funnels, retención |

### 1.3 Referentes de Negocio (plataformas)

| Plataforma | Fundador/Empresa | Qué tomamos |
|-----------|-----------------|-------------|
| Stripe Dashboard | Patrick & John Collison | MRR, suscripciones, webhooks |
| Baremetrics | Josh Pigford | Layout de KPIs, definiciones de métricas |
| ChartMogul | Nick Franklin | Cohort analysis, MRR movements |
| Mixpanel | Suhail Doshi | Event tracking, funnels, retención |
| Amplitude | Spenser Skates & Curtis Liu | Behavioral cohorts, predicciones |
| Sentry | David Cramer | Monitorización de errores |
| PostHog | James Hawkins & Tim Glaser | Product analytics open source |
| Better Stack | — | Uptime monitoring, status page |
| Grafana | Torkel Ödegaard | Dashboards unificados |

---

## 2. Arquitectura Técnica

### 2.1 Stack

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js | 14 |
| Estilos | Tailwind CSS | 3.x |
| Base de datos | Supabase (PostgreSQL) | — |
| IA | Vercel AI SDK + Anthropic Claude | AI SDK 4.x |
| Gráficas | Recharts | 2.x |
| Auth admin | JWT (jose) + bcrypt | — |
| Deploy | Vercel | — |

### 2.2 Rutas Nuevas (NO tocan código existente)

```
src/app/admin/
├── layout.tsx              ← Layout con sidebar (NUEVO)
├── login/page.tsx          ← Login admin (NUEVO)
├── page.tsx                ← Overview (YA EXISTE - ampliar)
├── users/
│   ├── page.tsx            ← Listado usuarios (NUEVO)
│   └── [id]/page.tsx       ← Detalle usuario (NUEVO)
├── alerts/page.tsx         ← Panel alertas (NUEVO)
├── engagement/page.tsx     ← Métricas engagement (NUEVO)
├── revenue/page.tsx        ← Revenue & suscripciones (NUEVO)
└── chat/page.tsx           ← Chat IA con Leo (NUEVO)

src/app/api/admin/
├── login/route.ts          ← API auth (NUEVO)
├── metrics/route.ts        ← API métricas generales (NUEVO)
├── users/
│   ├── route.ts            ← API listado (NUEVO)
│   └── [id]/route.ts       ← API detalle (NUEVO)
├── alerts/route.ts         ← API alertas (NUEVO)
├── engagement/route.ts     ← API engagement (NUEVO)
├── revenue/route.ts        ← API revenue (NUEVO)
└── chat/route.ts           ← API chat IA (NUEVO)

src/components/admin/
├── AdminSidebar.tsx        ← Navegación lateral (NUEVO)
├── AdminHeader.tsx         ← Barra superior (NUEVO)
├── StatCard.tsx            ← Tarjeta KPI (NUEVO)
├── ChartCard.tsx           ← Tarjeta con gráfica (NUEVO)
├── UserTable.tsx           ← Tabla de usuarios (NUEVO)
├── AlertsTable.tsx         ← Tabla de alertas (NUEVO)
└── ChatInterface.tsx       ← UI del chat IA (NUEVO)
```

### 2.3 Seguridad

- **Acceso:** Solo con código admin (`?key=dok-admin-2026` actualmente → migrar a JWT)
- **API routes:** Todas verifican cookie JWT httpOnly
- **IA:** Solo READ en base de datos, nunca WRITE
- **Experto supervisor:** Dr. Fernando Vega + Daniela Amodei (trust & safety)

---

## 3. Plan de Implementación Paso a Paso

### FASE 0: Preparación (1 día)
> No se toca código existente. Solo documentación y dependencias.

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 0.1 Instalar dependencias | Marina Chen | Guillermo Rauch | `npm install recharts @ai-sdk/anthropic ai jose bcryptjs` |
| 0.2 Variables de entorno | Iñaki Goicoechea | — | ADMIN_JWT_SECRET, ANTHROPIC_API_KEY |
| 0.3 Revisar schema DB | Iñaki Goicoechea | — | Confirmar tablas dok_* disponibles |

### FASE 1: Autenticación Admin (1 día)

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 1.1 API login | Dr. Fernando Vega | Daniela Amodei | POST /api/admin/login → JWT cookie |
| 1.2 Middleware protección | Dr. Fernando Vega | Daniela Amodei | Verificar JWT en rutas /admin/* |
| 1.3 Página login | Pablo Herrera | — | UI simple: email + password |
| 1.4 Crear admins en DB | Iñaki Goicoechea | — | Ángel y Kike como superadmin |

### FASE 2: Layout y Navegación (1 día)

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 2.1 Admin layout | Pablo Herrera | Josh Pigford | Sidebar + header + content area |
| 2.2 Sidebar navegación | Pablo Herrera | Josh Pigford | Overview, Usuarios, Alertas, Engagement, Revenue, Chat IA |
| 2.3 StatCard component | Pablo Herrera | Josh Pigford | Número grande + tendencia + color |
| 2.4 ChartCard component | Pablo Herrera | Nick Franklin | Wrapper para gráficas Recharts |

### FASE 3: Overview Dashboard (2 días)

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 3.1 API métricas generales | Iñaki Goicoechea | Suhail Doshi | GET /api/admin/metrics → KPIs calculados server-side |
| 3.2 Migrar Overview existente | Marina Chen | Josh Pigford | Partir del admin/page.tsx actual, mejorar con layout y gráficas |
| 3.3 Gráficas de tendencia | Marina Chen | Nick Franklin | Registros 30d (línea), actividad 30d (barras) |
| 3.4 Auto-refresh 60s | Marina Chen | — | useEffect + setInterval + indicador visual |

### FASE 4: Gestión de Usuarios (2 días)

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 4.1 API listado usuarios | Iñaki Goicoechea | — | GET /api/admin/users?page=&search=&status= |
| 4.2 API detalle usuario | Iñaki Goicoechea | Suhail Doshi | GET /api/admin/users/[id] con timeline completa |
| 4.3 Página listado | Pablo Herrera | Suhail Doshi | Tabla con búsqueda, filtros, paginación |
| 4.4 Página detalle | Pablo Herrera | Suhail Doshi | Perfil + timeline + familiares + alertas |

### FASE 5: Panel de Alertas (1 día)

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 5.1 API alertas | Iñaki Goicoechea | — | GET /api/admin/alerts con filtros |
| 5.2 Página alertas | Diego Navarro | — | KPIs + tabla + gráfica temporal |
| 5.3 Filtros por nivel | Pablo Herrera | — | alerta_1h / alerta_3h / emergencia_6h |

### FASE 6: Engagement (2 días)

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 6.1 API engagement | Iñaki Goicoechea | Suhail Doshi | Racha media, tasa completación, distribución |
| 6.2 Página engagement | Aurora Méndez | Suhail Doshi | Gráficas de acciones, rachas, retención |
| 6.3 Retención D1/D7/D30 | Marina Chen | Nick Franklin | Cohort analysis básico |
| 6.4 Funnel de activación | Marina Chen | Suhail Doshi | Registro → D1 → D7 → D30 |

### FASE 7: Revenue (1 día)

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 7.1 API revenue | Iñaki Goicoechea | Josh Pigford | MRR, free/premium, conversión |
| 7.2 Página revenue | Lucía Ramírez | Josh Pigford | KPIs + distribución + placeholder Stripe |
| 7.3 Preparar Stripe webhooks | Iñaki Goicoechea | Nick Franklin | Estructura para cuando se integre Stripe |

### FASE 8: Chat IA (3 días) ⭐

| Tarea | Experto Virtual | Referente Real | Detalle |
|-------|----------------|---------------|---------|
| 8.1 System prompt | — (Leo mismo) | Dario Amodei + Sam Altman | Definir rol completo (ver ROL-IA-DASHBOARD.md) |
| 8.2 Tools/Functions | Marina Chen | Harrison Chase | Definir herramientas: consultar_usuarios, consultar_alertas, etc. |
| 8.3 API chat | Marina Chen | Guillermo Rauch | POST /api/admin/chat con Vercel AI SDK + streaming |
| 8.4 UI chat | Pablo Herrera | Guillermo Rauch | useChat() hook, input + mensajes + sugerencias |
| 8.5 Tool execution | Iñaki Goicoechea | Harrison Chase | Server-side: ejecutar queries contra Supabase según tool calls |
| 8.6 Alertas proactivas | Diego Navarro | Suhail Doshi | Cron diario que analiza métricas y notifica por Telegram |

---

## 4. Secciones del Dashboard

### 📊 Overview
- KPIs: Total usuarios, Activos hoy, Check-ins hoy, Alertas activas
- Gráficas: Registros 30d, Actividad 30d
- Feed: Últimos 5 check-ins y 5 alertas en tiempo real
- **Supervisores:** Pablo Herrera (UX) + Iñaki Goicoechea (datos)
- **Inspiración:** Baremetrics (Josh Pigford) para layout de KPIs

### 👤 Usuarios
- Listado con búsqueda, filtros, paginación
- Detalle: perfil + mascota + timeline + familiares + plan
- **Supervisores:** Pablo Herrera (UX) + Dra. Carmen Navarro (perspectiva senior)
- **Inspiración:** Mixpanel (Suhail Doshi) para user profiles y event timeline

### 🚨 Alertas
- KPIs: activas, por nivel, tiempo respuesta medio
- Tabla histórica con filtros
- Gráfica temporal de alertas
- **Supervisores:** Diego Navarro (notificaciones) + Dr. Fernando Vega (seguridad)
- **Inspiración:** Sentry para estructura de alertas

### 📈 Engagement
- Racha media, tasa completación, distribución de acciones
- Retención D1/D7/D30 con cohort analysis
- Funnel de activación
- **Supervisores:** Aurora Méndez (gamificación) + Marina Chen (datos)
- **Inspiración:** Mixpanel (funnels) + ChartMogul (cohorts)

### 💳 Revenue
- MRR, free vs premium, tasa conversión
- Placeholder para Stripe
- Proyección de revenue
- **Supervisores:** Lucía Ramírez (growth) + Alejandro Ruiz (legal)
- **Inspiración:** Baremetrics + ChartMogul

### 🤖 Chat IA
- Chat conversacional con Leo
- Streaming de respuestas
- Herramientas para consultar cualquier métrica
- Sugerencias de preguntas
- **Supervisores:** Marina Chen (implementación) + todos los expertos IA
- **Inspiración:** Dario Amodei (honestidad) + Harrison Chase (tools) + Guillermo Rauch (SDK)

---

## 5. Cronograma Estimado

| Fase | Duración | Acumulado |
|------|----------|-----------|
| 0. Preparación | 1 día | 1 día |
| 1. Autenticación | 1 día | 2 días |
| 2. Layout | 1 día | 3 días |
| 3. Overview | 2 días | 5 días |
| 4. Usuarios | 2 días | 7 días |
| 5. Alertas | 1 día | 8 días |
| 6. Engagement | 2 días | 10 días |
| 7. Revenue | 1 día | 11 días |
| 8. Chat IA | 3 días | **14 días** |

**Total estimado: 14 días de desarrollo (2-3 semanas reales)**

---

## 6. Principios de Diseño

1. **No tocar código existente** — Todo son archivos nuevos. El admin/page.tsx actual funciona y es el punto de partida.
2. **Server-side first** — Queries en API routes, no en el cliente. Seguridad y rendimiento.
3. **IA honesta** (Dario Amodei) — La IA nunca inventa datos. Si no sabe, lo dice.
4. **Métricas claras** (Josh Pigford) — Cada número tiene definición y fuente.
5. **Eventos, no páginas** (Suhail Doshi) — Trackeamos acciones de usuario, no visitas.
6. **Streaming** (Guillermo Rauch) — Las respuestas de IA se muestran token por token.
7. **Seguridad primero** (Fernando Vega + Daniela Amodei) — JWT, read-only IA, acceso restringido.

---

## 7. Dependencias npm

```bash
# Nuevas dependencias (NO modifican las existentes)
npm install recharts @ai-sdk/anthropic ai jose bcryptjs
npm install -D @types/bcryptjs
```

## 8. Variables de Entorno Nuevas

```env
ADMIN_JWT_SECRET=xxx        # openssl rand -hex 32
ANTHROPIC_API_KEY=xxx       # Para Claude en el chat IA
```

---

*Plan creado el 01/02/2026 por Leo (IA Developer de Dame un Ok)*  
*Basado en investigación de 8 referentes mundiales en IA y SaaS analytics*
