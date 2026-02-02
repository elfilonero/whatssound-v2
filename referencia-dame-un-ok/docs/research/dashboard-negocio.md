# Dashboard de Negocio (Ángel & Kike) — Investigación

## Referentes mundiales en SaaS Admin Dashboards

### 1. Stripe Dashboard & Billing
- **Empresa:** Stripe (Patrick & John Collison, 2010, San Francisco)
- **Qué hace:** Pagos, suscripciones, facturación recurrente
- **Dashboard incluye:** MRR, churn rate, pagos fallidos, métodos de pago, lifecycle de suscripciones
- **Modelo para nosotros:** Stripe Billing es el estándar para SaaS. Suscripciones con trials, upgrades, downgrades, cancelaciones.
- **API:** Webhooks para pagos exitosos/fallidos, cancelaciones, etc.
- **Docs:** https://docs.stripe.com/billing/subscriptions/overview

### 2. Baremetrics (baremetrics.com)
- **Fundador:** Josh Pigford (2013)
- **Qué hace:** Dashboard de métricas SaaS conectado a Stripe
- **Métricas:** MRR, ARR, LTV, Churn, ARPU, MRR Growth, Net Revenue, Refunds
- **Por qué es referente:** Es EL estándar de cómo visualizar métricas SaaS. Cualquier inversor o CEO de SaaS conoce Baremetrics.
- **Desde $108/mes** — Nosotros lo construimos custom y gratis.

### 3. ChartMogul (chartmogul.com)
- **Fundadores:** Nick Franklin (2014, Berlin)
- **Qué hace:** Analytics de suscripciones y revenue
- **Plan gratis:** Hasta $10K MRR
- **Métricas:** MRR movements (new, expansion, contraction, churn, reactivation), cohort analysis, geo breakdown
- **Por qué interesa:** Su modelo de cohort analysis es lo que queremos replicar

### 4. Mixpanel (mixpanel.com)
- **Fundador:** Suhail Doshi (2009, San Francisco)
- **Qué hace:** Product analytics — funnels, retention, user flows
- **Plan gratis:** 20M eventos/mes
- **Por qué es referente:** Inventó el concepto de "event-based analytics". Cada acción del usuario es un evento trackeable.

### 5. Amplitude (amplitude.com)
- **Fundadores:** Spenser Skates & Curtis Liu (2012, San Francisco)
- **Qué hace:** Product analytics + behavioral cohorts + predictions
- **Usado por:** Walmart, NBC, Atlassian, Twitter
- **Plan gratis:** 50K MTU (monthly tracked users)
- **Por qué interesa:** Su modelo de "behavioral cohorts" permite segmentar usuarios por comportamiento, no solo por demografía.

## Métricas clave para el Dashboard de Negocio

### Usuarios
- **Total registrados** (acumulado)
- **Activos hoy / esta semana / este mes** (DAU/WAU/MAU)
- **Nuevos registros** (por día/semana)
- **Tasa de activación** (% que completan onboarding)
- **Retención D1/D7/D30** (vuelven al día 1, 7, 30)

### Engagement (Mascotas)
- **Mascotas activas** (alimentadas hoy)
- **Racha media** (días seguidos promedio)
- **Acciones por usuario/día** (alimentar, mimar, jugar)
- **Tasa de completación** (% que hacen las 3 acciones)
- **Alarmas disparadas** (1h, 3h, 6h sin respuesta)
- **Tiempo medio de respuesta** (desde alarma hasta check-in)

### Revenue (cuando haya pagos)
- **MRR** (Monthly Recurring Revenue)
- **ARR** (Annual Recurring Revenue)
- **ARPU** (Average Revenue Per User)
- **Churn rate** (% cancelaciones/mes)
- **LTV** (Lifetime Value = ARPU / Churn rate)
- **Conversión free→paid** (% que upgrade)
- **Pagos fallidos** y tasa de recuperación
- **Métodos de pago** por usuario

### Por usuario individual
- Nombre, código, fecha registro
- Mascota(s) asociada(s)
- Plan (free/premium), método de pago
- Última actividad, racha actual
- Historial de check-ins
- Familiares vinculados
- Alertas recibidas

## Arquitectura del Dashboard

### Opción elegida: Custom en Next.js (ruta /admin)
- **Por qué:** Control total, sin costes, integrado con la IA (Leo)
- **Auth:** Credenciales de admin (Ángel + Kike) separadas de usuarios
- **Datos:** Directamente de Supabase (misma DB)
- **IA integrada:** Chat con Leo dentro del dashboard para análisis

### Páginas del dashboard:
1. **Overview** — KPIs principales, gráficas de crecimiento
2. **Usuarios** — Lista, búsqueda, filtros, detalle individual
3. **Mascotas** — Estado general, engagement metrics
4. **Revenue** — Stripe metrics, suscripciones, pagos
5. **Alertas** — Log de alertas disparadas, tiempos de respuesta
6. **Leo IA** — Chat para preguntar sobre los datos

## Integración con IA (Leo)
- Acceso completo a métricas en tiempo real
- Análisis de tendencias: "¿Por qué bajó la retención?"
- Alertas proactivas: "Los registros cayeron un 20% esta semana"
- Recomendaciones: "Los usuarios de España retienen 30% mejor, invertid en marketing allí"
- Reportes automáticos semanales por Telegram
