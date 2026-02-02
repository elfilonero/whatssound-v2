# 🔧 Plan: Dashboard de Ingeniería
> Checklist de implementación — cada tarea incluye instrucciones completas

---

## FASE 1: Monitorización de errores (Sentry) — PRIORIDAD P0

### [ ] 1.1 Crear cuenta Sentry y proyecto
- Ir a https://sentry.io/signup/ → crear org "dame-un-ok"
- Crear proyecto: Platform = Next.js
- Copiar el DSN (formato: `https://xxx@xxx.ingest.sentry.io/xxx`)
- Guardar DSN como variable de entorno en Vercel:
  ```
  NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
  SENTRY_AUTH_TOKEN=sntrys_xxx (se genera en Settings > Auth Tokens)
  SENTRY_ORG=dame-un-ok
  SENTRY_PROJECT=dame-un-ok
  ```

### [ ] 1.2 Instalar Sentry SDK en el proyecto
- Comando (ejecutar en /projects/dame-un-ok/src):
  ```bash
  npx @sentry/wizard@latest -i nextjs
  ```
- Esto crea automáticamente:
  - `sentry.client.config.ts` — config client-side
  - `sentry.server.config.ts` — config server-side  
  - `sentry.edge.config.ts` — config edge runtime
  - `instrumentation.ts` — inicialización
  - Modifica `next.config.js` para añadir el plugin de Sentry
- Verificar que se añadió `@sentry/nextjs` a package.json

### [ ] 1.3 Configurar Sentry con opciones óptimas
- En `sentry.client.config.ts`:
  ```typescript
  import * as Sentry from "@sentry/nextjs";
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% de transacciones (ahorra cuota)
    replaysSessionSampleRate: 0.01, // 1% session replay
    replaysOnErrorSampleRate: 1.0, // 100% replay si hay error
    environment: process.env.NODE_ENV,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.browserTracingIntegration(),
    ],
  });
  ```
- En `sentry.server.config.ts`:
  ```typescript
  import * as Sentry from "@sentry/nextjs";
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
  ```

### [ ] 1.4 Añadir error boundary global
- Crear `src/app/global-error.tsx`:
  ```typescript
  "use client";
  import * as Sentry from "@sentry/nextjs";
  import { useEffect } from "react";
  
  export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => { Sentry.captureException(error); }, [error]);
    return (
      <html><body>
        <div style={{padding:40,textAlign:"center"}}>
          <h2>Algo salió mal 😿</h2>
          <button onClick={reset}>Reintentar</button>
        </div>
      </body></html>
    );
  }
  ```

### [ ] 1.5 Capturar errores en API routes
- En cada API route importante, envolver con try/catch:
  ```typescript
  import * as Sentry from "@sentry/nextjs";
  try {
    // ... lógica
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
  ```
- API routes prioritarias: `/api/force-wake`, `/api/cron/check-alerts`, `/api/push/send`

### [ ] 1.6 Test: provocar error y verificar en Sentry
- Crear ruta temporal `/api/test-sentry`:
  ```typescript
  export async function GET() { throw new Error("Test Sentry integration"); }
  ```
- Desplegar, visitar la URL, verificar que aparece en Sentry dashboard
- Eliminar ruta de test

### [ ] 1.7 Configurar alertas de Sentry → Telegram
- En Sentry: Settings > Integrations > Webhooks
- URL del webhook: crear un bot de Telegram o usar el existente
- Alternativa: Sentry > Alerts > Create Alert Rule:
  - When: "A new issue is created"
  - Then: "Send notification via webhook"
  - Frecuencia: Immediately

---

## FASE 2: Uptime Monitoring (Better Stack) — PRIORIDAD P0

### [ ] 2.1 Crear cuenta Better Stack
- Ir a https://betterstack.com/uptime → Sign up (gratis)
- Plan Free: 10 monitores, checks cada 3 min

### [ ] 2.2 Configurar monitores
- Monitor 1: **Web App**
  - URL: `https://dame-un-ok.vercel.app`
  - Tipo: HTTP(S)
  - Check interval: 3 min
  - Expected status: 200
- Monitor 2: **API Health**
  - URL: `https://dame-un-ok.vercel.app/api/force-wake` (GET → debería dar 405 o custom health)
  - Mejor: crear `/api/health` que retorne `{ok:true}`
- Monitor 3: **Cron de alertas**
  - Tipo: Heartbeat
  - El cron envía ping a Better Stack al terminar

### [ ] 2.3 Crear endpoint /api/health
- Archivo `src/app/api/health/route.ts`:
  ```typescript
  import { createClient } from "@supabase/supabase-js";
  import { NextResponse } from "next/server";
  
  export async function GET() {
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { count } = await sb.from("dok_users").select("*", { count: "exact", head: true });
      return NextResponse.json({ ok: true, users: count, ts: new Date().toISOString() });
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
  }
  ```

### [ ] 2.4 Configurar alertas → Telegram
- Better Stack > Integrations > Telegram
- O usar webhook genérico hacia el bot de Telegram

### [ ] 2.5 Crear status page (opcional)
- Better Stack > Status Pages > Create
- URL: `status.dameunok.app` (cuando tengamos dominio)
- Añadir los monitores creados

---

## FASE 3: Vercel Analytics + Speed Insights — PRIORIDAD P1

### [ ] 3.1 Activar Vercel Analytics
- En Vercel Dashboard > Project > Analytics > Enable
- Instalar paquete:
  ```bash
  npm install @vercel/analytics
  ```
- Añadir en `src/app/layout.tsx`:
  ```typescript
  import { Analytics } from "@vercel/analytics/react";
  // ... dentro del return:
  <Analytics />
  ```

### [ ] 3.2 Activar Speed Insights
- ```bash
  npm install @vercel/speed-insights
  ```
- Añadir en `src/app/layout.tsx`:
  ```typescript
  import { SpeedInsights } from "@vercel/speed-insights/next";
  // ... dentro del return:
  <SpeedInsights />
  ```

### [ ] 3.3 Configurar custom events (opcional)
- Trackear eventos clave:
  ```typescript
  import { track } from "@vercel/analytics";
  track("alimentar", { userId: "xxx" });
  track("force_wake", { adminId: "xxx" });
  ```

---

## FASE 4: PostHog Product Analytics — PRIORIDAD P1

### [ ] 4.1 Crear cuenta PostHog
- Ir a https://app.posthog.com/signup (gratis hasta 1M eventos/mes)
- Copiar `NEXT_PUBLIC_POSTHOG_KEY` y `NEXT_PUBLIC_POSTHOG_HOST`

### [ ] 4.2 Instalar PostHog
- ```bash
  npm install posthog-js
  ```
- Crear `src/lib/services/posthog.ts`:
  ```typescript
  import posthog from "posthog-js";
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }
  export default posthog;
  ```

### [ ] 4.3 Trackear eventos clave
- Eventos a capturar:
  - `user_onboarded` — nuevo usuario completa setup
  - `pet_fed` — alimentar
  - `pet_cuddled` — mimar
  - `pet_played` — jugar
  - `alarm_triggered` — alarma se dispara
  - `alarm_dismissed` — usuario responde a alarma
  - `force_wake_sent` — admin pide alimentar
  - `admin_logged_in` — admin entra al dashboard

### [ ] 4.4 Crear dashboards en PostHog
- Dashboard "Engagement": DAU, acciones/día, tasa completación
- Dashboard "Retención": D1/D7/D30 retention curves
- Dashboard "Alarmas": frecuencia, tiempos de respuesta

---

## FASE 5: Logging estructurado — PRIORIDAD P2

### [ ] 5.1 Crear logger service
- Archivo `src/lib/services/logger.ts`:
  ```typescript
  import * as Sentry from "@sentry/nextjs";
  
  export const logger = {
    info: (msg: string, data?: Record<string, unknown>) => {
      console.log(`[INFO] ${msg}`, data || "");
      Sentry.addBreadcrumb({ message: msg, data, level: "info" });
    },
    warn: (msg: string, data?: Record<string, unknown>) => {
      console.warn(`[WARN] ${msg}`, data || "");
      Sentry.addBreadcrumb({ message: msg, data, level: "warning" });
    },
    error: (msg: string, error?: Error, data?: Record<string, unknown>) => {
      console.error(`[ERROR] ${msg}`, error, data || "");
      if (error) Sentry.captureException(error, { extra: data });
    },
  };
  ```

### [ ] 5.2 Reemplazar console.log en API routes
- Usar `logger.info/warn/error` en lugar de console.log
- Prioridad: cron/check-alerts, force-wake, push/send

---

## Resumen de progreso

| Fase | Tareas | Completadas | Estado |
|------|--------|-------------|--------|
| 1. Sentry | 7 | 0 | ⬜ Pendiente |
| 2. Uptime | 5 | 0 | ⬜ Pendiente |
| 3. Vercel Analytics | 3 | 0 | ⬜ Pendiente |
| 4. PostHog | 4 | 0 | ⬜ Pendiente |
| 5. Logging | 2 | 0 | ⬜ Pendiente |
| **TOTAL** | **21** | **0** | **⬜ 0%** |
