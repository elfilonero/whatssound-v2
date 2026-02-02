# 🔄 Flujos de Usuario — Dame un Ok

> Última actualización: 2 de febrero de 2026

---

## 1. Flujo Principal: Landing → Empezar Gratis → Panel Familiar

Este es el flujo estándar para un nuevo usuario que descubre Dame un Ok.

```
🌐 dame-un-ok.vercel.app/landing
        │
        ▼
   Landing Page
   ├── Hero: "Cuida a los tuyos sin que se sientan vigilados"
   ├── Cómo funciona (3 pasos)
   ├── El secreto de Fufy (estados de la mascota)
   ├── Alertas inteligentes (escalonadas)
   ├── Planes (Básico gratis / Premium 4,99€/mes)
   └── CTA: [Empezar gratis] / [Ya tengo cuenta]
        │
        ▼ Click "Empezar gratis"
   /familiar (sin código admin)
        │
        ▼
   🧙 Wizard de Onboarding (5 pasos)
   │
   ├── Paso 1: Tu perfil
   │   └── Nombre + País (auto-avance al completar)
   │
   ├── Paso 2: ¿A quién cuidas?
   │   └── Nombre del familiar + País + Avatar (Fufy 🐱)
   │
   ├── Paso 3: Horarios de Fufy
   │   └── Hora de despertar + Horas de comida (añadir múltiples)
   │
   ├── Paso 4: Tiempos de alerta
   │   └── Primera alerta (1h) + Segunda alerta (3h) + Emergencia (6h)
   │   └── Configurable con selector de tiempos
   │
   └── Paso 5: Enlace de invitación
       ├── Se genera código aleatorio (ej: "A3X7KP2M")
       ├── URL: dame-un-ok.vercel.app/u/A3X7KP2M
       ├── Botones de compartir (WhatsApp, copiar, nativo)
       ├── Post-share: "✅ ¡Enlace compartido!"
       └── [🚀 Ver el panel de mi familiar]
              │
              ▼
         /familiar → Panel Familiar
         ├── Lista de usuarios monitoreados
         ├── Estado de cada uno (✅ ok / ⚠️ alerta / 🚨 emergencia)
         ├── Click → Dashboard individual
         └── Tabs: Inicio | Familiares | Alertas | Ajustes
```

---

## 2. Flujo Admin: Acceso con Código

Para usuarios invitados directamente con un código de administrador.

```
🔗 dame-un-ok.vercel.app/familiar?admin=CODIGO123
        │
        ▼
   Validación del código
   ├── Consulta dok_admin_invitations WHERE code = CODIGO123
   ├── Si válido → Auth anónima de Supabase
   ├── Crea registro en dok_familiares (rol: admin)
   └── Guarda en localStorage: dok_admin_code
        │
        ▼
   🧙 Wizard de Onboarding (mismo flujo que arriba)
        │
        ▼
   Panel Familiar (con permisos admin)
   ├── Puede configurar horarios
   ├── Puede añadir familiares
   ├── Puede acceder al dashboard profesional
   └── Puede generar enlaces de visor
```

---

## 3. Flujo Usuario Mayor: App de la Mascota

Este es lo que ve la persona mayor. **No sabe que es un sistema de monitoreo.**

```
🔗 dame-un-ok.vercel.app/u/A3X7KP2M
        │
        ▼
   Registro automático
   ├── Se crea dok_user con el código de invitación
   ├── Se asigna mascota Fufy
   └── Auth anónima
        │
        ▼
   🐱 App de la Mascota — Fufy
   │
   ├── Estado de Fufy (depende de la hora del día):
   │   ├── 🌅 Despertar → Fufy tiene hambre → "¡Dale de comer!"
   │   ├── 🍽️ Hora de comida → Fufy quiere mimos → "¡Acarícialo!"
   │   └── 🎮 Juego → Fufy quiere jugar → "¡Juega con él!"
   │
   ├── Acciones (3 toques al día):
   │   ├── 🍖 Alimentar → Animación de comer
   │   ├── 💕 Mimar → Animación de cariño
   │   └── 🎾 Jugar → Animación de juego
   │
   ├── Estados visuales de Fufy:
   │   ├── 😊 Contento → Ha sido cuidado hoy
   │   ├── 😢 Triste → Lleva horas sin atención
   │   └── 🤒 Enfermo → Emergencia (muchas horas sin respuesta)
   │
   └── Cada acción → INSERT en dok_check_ins
       → Supabase Realtime notifica al familiar
       → Panel familiar actualiza estado a ✅
```

---

## 4. Flujo de Alertas

Sistema escalonado de alertas cuando el mayor no interactúa con Fufy.

```
⏰ Hora de despertar configurada (ej: 08:00)
        │
        ▼
   Estado: "esperando" — Fufy duerme
        │
   08:00 → Fufy se despierta → Estado: "hambre"
        │
        ├── El mayor interactúa → ✅ Todo bien → Notificación al familiar
        │
        └── El mayor NO interactúa...
            │
            ├── +1h (09:00) → ⚠️ PRIMERA ALERTA
            │   ├── INSERT en dok_alertas (nivel: alerta_1h)
            │   ├── Push notification al familiar
            │   └── Panel familiar muestra amarillo
            │
            ├── +3h (11:00) → 🔴 SEGUNDA ALERTA
            │   ├── INSERT en dok_alertas (nivel: alerta_3h)
            │   ├── Push notification escalada
            │   ├── Notificación a contactos adicionales
            │   └── Panel familiar muestra naranja
            │
            └── +6h (14:00) → 🚨 EMERGENCIA
                ├── INSERT en dok_alertas (nivel: emergencia_6h)
                ├── Push notification urgente
                ├── Protocolo de emergencia:
                │   ├── Llamar al mayor
                │   ├── Contactar 112
                │   └── Mostrar última ubicación conocida
                └── Panel familiar muestra rojo

   ⏱️ Los tiempos (1h, 3h, 6h) son configurables por el familiar
   📋 Opciones: 15min, 30min, 45min, 1h, 1.5h, 2h, 3h, 4h, 5h, 6h, 8h, 12h
```

### Deduplicación de Alertas

- Antes de crear una alerta, se verifica si ya existe una no resuelta del mismo nivel
- Esto evita spam de notificaciones al familiar

### Modo No Molestar (DND)

- El familiar puede activar DND para el mayor (ej: "está en el hospital")
- Mientras `dnd_until` sea futuro, no se escalan alertas
- Estado se mantiene en "esperando"

### Despertar Manual (Force Wake)

- El familiar puede "despertar" a Fufy manualmente desde el panel
- Útil si el mayor se despierta antes de la hora configurada
- Se setea `force_wake_until` en el usuario

---

## 5. Flujo Dashboard Profesional

Acceso al panel de métricas y gestión avanzada.

```
🔗 dame-un-ok.vercel.app/dashboard?admin=ANGEL2026
        │
        ▼
   Validación del código admin
   ├── Consulta dok_admin_invitations WHERE code = ANGEL2026
   ├── Si válido → Guarda en sessionStorage
   └── Si inválido → 🔒 "Acceso denegado"
        │
        ▼
   Dashboard Profesional (React Portal — pantalla completa)
   │
   ├── 📊 Sidebar (AdminSidebar.tsx)
   │   ├── Overview
   │   ├── Usuarios
   │   ├── Alertas
   │   ├── Engagement
   │   ├── Revenue
   │   └── Chat IA
   │
   ├── 📊 Overview
   │   ├── KPIs: Total usuarios, Activos hoy, Check-ins hoy, Alertas activas
   │   ├── Gráfica: Registros últimos 30 días
   │   ├── Gráfica: Actividad últimos 30 días
   │   └── Feed: Últimos check-ins y alertas
   │
   ├── 👤 Usuarios
   │   ├── Listado con búsqueda y filtros
   │   ├── Paginación
   │   └── Detalle: perfil + timeline + familiares
   │
   ├── 🚨 Alertas
   │   ├── KPIs: activas, por nivel, tiempo respuesta
   │   ├── Tabla histórica con filtros
   │   └── Gráfica temporal
   │
   ├── 📈 Engagement
   │   ├── Racha media, tasa completación
   │   ├── Retención D1/D7/D30
   │   └── Funnel de activación
   │
   ├── 💳 Revenue
   │   ├── MRR, free vs premium, conversión
   │   └── Placeholder para integración Stripe
   │
   └── 🤖 Chat IA
       ├── Conversación con Leo (Claude)
       ├── Streaming de respuestas (Vercel AI SDK)
       ├── Puede consultar métricas en lenguaje natural
       └── Sugerencias de preguntas predefinidas
```

---

## 6. Flujo Visor (Solo Lectura)

Para familiares adicionales que quieren ver el estado sin permisos de gestión.

```
🔗 dame-un-ok.vercel.app/familiar?viewer=CODE
        │
        ▼
   Validación del código visor
   ├── Consulta dok_viewer_invitations
   ├── Auth anónima → Familiar con rol "viewer"
   └── Marca invitación como usada
        │
        ▼
   Panel Familiar (modo visor)
   ├── Badge "👁️ Modo visor — solo lectura"
   ├── Puede ver estado de los usuarios
   ├── Puede ver alertas
   ├── NO puede configurar horarios
   └── NO puede gestionar familiares
```

---

*Documento creado el 2 de febrero de 2026 por Leo (IA Developer)*
