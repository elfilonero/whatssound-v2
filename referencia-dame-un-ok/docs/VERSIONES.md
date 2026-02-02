# 📦 Historial de Versiones — Dame un Ok

> Última actualización: 2 de febrero de 2026

---

## v1.0-estable

- **Tag:** `bb83dff`
- **Fecha:** 31 de enero de 2026
- **Descripción:** Primera versión funcional completa

### Funcionalidades incluidas

- ✅ **App de mascota virtual (Fufy)** — El mayor cuida a Fufy con 3 acciones: alimentar, mimar, jugar
- ✅ **Panel familiar** — El cuidador ve el estado del mayor en tiempo real
- ✅ **Sistema de alertas escalonado** — 1h, 3h, 6h sin respuesta → alertas crecientes
- ✅ **Avatares de Fufy** — Estados visuales: contento, triste, enfermo, esperando, eufórico
- ✅ **Auth anónima** — Sin registro con email, acceso por código de invitación
- ✅ **Push notifications** — Alertas push al familiar cuando hay inactividad
- ✅ **Cálculo de racha (streak)** — Días consecutivos con check-in
- ✅ **Supabase Realtime** — Actualizaciones instantáneas en el panel familiar
- ✅ **PWA** — Instalable como app nativa en móvil
- ✅ **Modo visor** — Acceso de solo lectura para familiares adicionales

### Limitaciones
- Sin landing page
- Sin dashboard profesional
- Sin métricas de negocio
- Diseño solo para mobile (390px fijo)

---

## v2.0-dashboard-completo

- **Tag:** `b685b83`
- **Fecha:** 2 de febrero de 2026
- **Descripción:** Dashboard profesional completo y landing responsive

### Nuevas funcionalidades

#### 🌐 Landing Page Responsive
- Hero con imagen de Fufy saludando
- Sección "Cómo funciona" (3 pasos)
- Sección "El secreto de Fufy" (estados visuales)
- Sección "Alertas inteligentes" (escalonadas)
- Sección "Planes" (Básico gratis / Premium 4,99€/mes)
- Footer con enlaces
- **Responsive:** Adapta layout con CSS `:has()` selector y clases Tailwind `lg:`
- CTAs: "Empezar gratis" y "Ya tengo cuenta"

#### 📊 Dashboard Profesional
- **Overview:** KPIs generales (usuarios, activos, check-ins, alertas), gráficas 30d
- **Usuarios:** Listado con búsqueda, filtros, paginación, detalle individual
- **Alertas:** KPIs por nivel, tabla histórica, gráfica temporal
- **Engagement:** Racha media, retención D1/D7/D30, funnel de activación
- **Revenue:** MRR, conversión free→premium, distribución (placeholder Stripe)
- **Chat IA:** Conversación con Leo (Claude) vía Vercel AI SDK con streaming
- **Layout:** Sidebar + Header, React portal para escapar del wrapper 390px
- **Acceso:** Código admin en URL (`/dashboard?admin=ANGEL2026`)

#### 🧙 Flujo "Empezar Gratis"
- Wizard de onboarding de 5 pasos (perfil, familiar, horarios, alertas, enlace)
- Auto-avance en los primeros pasos al completar campos
- Generación de enlace de invitación con código aleatorio
- Botones de compartir (WhatsApp, copiar, nativo)
- Mensaje post-share de confirmación

#### ✨ Mejoras UX
- Botón de compartir mejorado con `ShareButtons` component
- Mensaje post-share: "✅ ¡Enlace compartido! Ya puedes entrar al panel de control"
- Animación pulse en el botón de acceso al panel después de compartir
- Estados de validación de códigos admin/viewer con loading y error

### Mejoras técnicas
- API routes para dashboard (`/api/dashboard/*`)
- Componentes dashboard reutilizables (StatCard, ChartCard, AdminSidebar, AdminHeader)
- Separación clara entre panel familiar (mobile) y dashboard (desktop)
- Portal React para renderizado full-screen del dashboard

---

## Próxima fase (Roadmap)

### v2.1 — Limpieza y Estabilidad
- [ ] Limpieza de código (eliminar TODO/FIXME, consolidar estilos)
- [ ] Tests automáticos (Jest + React Testing Library)
- [ ] Optimización de consultas Supabase (índices, caching)
- [ ] Migración de auth a JWT para el dashboard

### v2.2 — Contenido y Volumen
- [ ] Más avatares de mascotas (perro, pájaro, etc.)
- [ ] Más estados de Fufy (dormido, jugando, comiendo)
- [ ] Internacionalización (i18n) — inglés, portugués
- [ ] Integración con Stripe para pagos premium

### v3.0 — Expansión
- [ ] App nativa (React Native o Flutter)
- [ ] Integración SMS (Twilio) para alertas premium
- [ ] Geolocalización del mayor
- [ ] Integración con dispositivos IoT (botón físico)
- [ ] API pública para integraciones de terceros

---

*Documento creado el 2 de febrero de 2026 por Leo (IA Developer)*
