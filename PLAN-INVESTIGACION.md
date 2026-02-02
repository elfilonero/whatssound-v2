# 🔬 Plan de Investigación — WhatsSound v2
## Creación del Equipo Ampliado de Superexpertos

> **Fecha:** 3 febrero 2026
> **Objetivo:** Ampliar el equipo de 7 superexpertos de v1 con nuevos expertos especializados en las funcionalidades que comparten WhatsSound y Dame un OK, más expertos específicos del dominio musical.

---

## 📋 Índice de Trabajo

### Fase 1: Copiar expertos v1 ✅
- [x] Copiar 7 superexpertos originales a `equipo/v1-originales/`
- [x] Preservar toda la documentación y descargas existentes

### Fase 2: Identificar nuevos campos de expertise
Cruzando funcionalidades de Dame un OK + WhatsSound + nuevas necesidades:

| # | Nuevo Experto | Razón | Fuente |
|---|--------------|-------|--------|
| 08 | **Dashboard Profesional & Analytics** | Dame un OK tiene dashboard completo; WhatsSound necesita uno para DJs y venue owners | Dame un OK |
| 09 | **IA Conversacional & Asistentes** | Dame un OK integra Leo vía Vercel AI SDK; WhatsSound necesita IA para recomendaciones musicales | Dame un OK |
| 10 | **Audio Streaming & Música Digital** | Core de WhatsSound: reproducción, streaming, licencias, APIs musicales | Nuevo |
| 11 | **Comunidades Musicales & Social** | WhatsSound es red social musical: perfiles DJ, seguidores, descubrimiento | Nuevo |
| 12 | **Monetización & Pagos en Apps** | Propinas, suscripciones, revenue share — presente en ambas apps | Dame un OK (Stripe) |
| 13 | **Push Notifications & Engagement** | Dame un OK tiene sistema de alertas escalonado; WhatsSound necesita notificaciones de sesiones | Dame un OK |
| 14 | **PWA & Experiencia Offline** | Dame un OK es PWA con Service Worker; WhatsSound debe ser instalable | Dame un OK |
| 15 | **Testing & Quality Assurance** | Dame un OK tiene plan de 39h de testing; replicar para WhatsSound | Dame un OK |
| 16 | **Gamificación & Retención** | Dame un OK usa Tamagotchi/streaks; WhatsSound puede usar logros, rankings DJ | Dame un OK |
| 17 | **Seguridad, RGPD & Legal** | Ambas apps manejan datos personales, necesitan compliance | Dame un OK |

### Fase 3: Búsqueda intensiva por experto
Para cada nuevo experto:
1. Buscar los 10 mejores referentes mundiales del campo
2. Descargar artículos, papers, conferencias, docs técnicos
3. Redactar informes de síntesis
4. Crear archivo `FUENTES.md` con nombres reales y qué aportan
5. Crear `RECOMENDACIONES-WHATSSOUND.md` con aplicación directa

### Fase 4: Documentación final
- Archivo `EQUIPO-MAESTRO-V2.md` con los 17 expertos completos
- Índice general de descargas y documentos generados

---

## 📁 Estructura de Carpetas

```
docs/v2-desarrollo/
├── PLAN-INVESTIGACION.md          ← Este archivo
├── EQUIPO-MAESTRO-V2.md           ← Resumen final del equipo completo
├── equipo/
│   ├── v1-originales/             ← 7 expertos de la v1 (referencia)
│   │   ├── 01-arquitecto-frontend/
│   │   ├── 02-arquitecto-backend/
│   │   ├── 03-experto-realtime/
│   │   ├── 04-experto-datos/
│   │   ├── 05-experto-mobile/
│   │   ├── 06-experto-devops/
│   │   └── 07-experto-producto/
│   ├── 08-dashboard-analytics/
│   ├── 09-ia-conversacional/
│   ├── 10-audio-streaming/
│   ├── 11-comunidades-musicales/
│   ├── 12-monetizacion-pagos/
│   ├── 13-notificaciones-engagement/
│   ├── 14-pwa-offline/
│   ├── 15-testing-qa/
│   ├── 16-gamificacion-retencion/
│   └── 17-seguridad-legal/
```

---

## 🔍 Estado de la Investigación

| Experto | Búsqueda | Descargas | Informe | FUENTES.md | Recomendaciones |
|---------|----------|-----------|---------|------------|-----------------|
| 08 Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| 09 IA | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10 Audio | ✅ | ✅ | ✅ | ✅ | ✅ |
| 11 Social | ✅ | ✅ | ✅ | ✅ | ✅ |
| 12 Pagos | ✅ | ✅ | ✅ | ✅ | ✅ |
| 13 Notif. | ✅ | ✅ | ✅ | ✅ | ✅ |
| 14 PWA | ✅ | ✅ | ✅ | ✅ | ✅ |
| 15 Testing | ✅ | ✅ | ✅ | ✅ | ✅ |
| 16 Gamif. | ✅ | ✅ | ✅ | ✅ | ✅ |
| 17 Legal | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Completado:** 3 febrero 2026, 03:15 CST
> **Total:** 30 archivos de documentación, 100+ referentes reales estudiados
