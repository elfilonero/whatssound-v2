# Dashboard de Ingeniería — Investigación

## Referentes mundiales

### 1. Sentry (sentry.io)
- **Fundadores:** David Cramer & Chris Jennings (2012, San Francisco)
- **Qué hace:** Monitorización de errores y rendimiento en tiempo real
- **Usado por:** Vercel, GitHub, Disney+, Cloudflare, Atlassian
- **Plan gratis:** 5,000 errores/mes, 10,000 transacciones performance
- **Integración Next.js:** `npx @sentry/wizard@latest -i nextjs` (1 comando)
- **Lo que captura:** Errores JS client/server/edge, stack traces, breadcrumbs, session replay, performance traces
- **Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Por qué es el mejor para nosotros:** Tiene integración nativa con Next.js y Vercel. Lee Robinson (VP Product de Vercel) lo recomienda públicamente.

### 2. Vercel Analytics (vercel.com/analytics)
- **Qué hace:** Web Analytics integrado en Vercel (ya lo tenemos)
- **Plan gratis:** Incluido en Vercel Hobby
- **Lo que captura:** Visitantes únicos, page views, bounce rate, países, OS, browsers, referrers
- **Privacidad:** No usa cookies, cumple GDPR por defecto
- **Speed Insights:** Mide Core Web Vitals (LCP, FID, CLS) reales de usuarios

### 3. PostHog (posthog.com)
- **Fundadores:** James Hawkins & Tim Glaser (2020, London/YC)
- **Qué hace:** Product analytics + session replay + feature flags + A/B testing + surveys
- **Usado por:** Airbus, Hasura, YCombinator startups
- **Plan gratis:** 1M eventos/mes, 5K session replays/mes, 1M feature flag requests/mes
- **Open source:** MIT License, 24K+ GitHub stars
- **Por qué interesa:** Reemplaza Mixpanel + Amplitude + Hotjar + LaunchDarkly en un solo tool
- **Docs:** https://posthog.com/docs

### 4. Better Stack (betterstack.com)
- **Qué hace:** Uptime monitoring + incident management + status page + logs
- **Plan gratis:** 10 monitores, checks cada 3 min, status page incluida
- **Lo que captura:** Uptime/downtime, screenshots de errores, SSL expiry, cron monitoring
- **Alertas:** Email, SMS, Slack, Telegram, webhooks
- **Por qué interesa:** Si la app se cae a las 3 AM, nos enteramos en 3 minutos

### 5. Grafana (grafana.com)
- **Fundador:** Torkel Ödegaard (2014, Suecia)
- **Qué hace:** Dashboards de visualización conectados a cualquier fuente de datos
- **Open source:** AGPLv3, 65K+ GitHub stars
- **Grafana Cloud gratis:** 10K métricas, 50GB logs, 50GB traces
- **Por qué interesa:** Para un dashboard unificado de todo: errores, performance, uptime, custom metrics

## Stack recomendado para Dame un Ok

| Necesidad | Herramienta | Coste | Prioridad |
|-----------|------------|-------|-----------|
| Errores en tiempo real | Sentry | Gratis (5K/mes) | P0 - HOY |
| Uptime monitoring | Better Stack | Gratis (10 monitores) | P0 - HOY |
| Web Analytics | Vercel Analytics | Gratis (ya incluido) | P1 |
| Product Analytics | PostHog | Gratis (1M eventos) | P1 |
| Dashboard custom | Grafana Cloud | Gratis | P2 |

## Integración con IA (Leo)
- Sentry webhooks → Telegram alertas → Leo analiza el error
- PostHog events → Leo analiza patrones de retención
- Custom metrics en Supabase → Leo consulta y reporta
