# 📊 Plan: Dashboard de Negocio (Ángel & Kike)
> Checklist de implementación — cada tarea incluye instrucciones completas

---

## FASE 1: Estructura base del Admin Dashboard — PRIORIDAD P0

### [ ] 1.1 Crear sistema de autenticación admin
- Tabla `dok_admins` en Supabase:
  ```sql
  CREATE TABLE dok_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin', -- 'admin' | 'superadmin'
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- Crear dos registros: Ángel (superadmin) y Kike (superadmin)
- Contraseñas hasheadas con bcrypt

### [ ] 1.2 Crear API de login admin
- Archivo `src/app/api/admin/login/route.ts`:
  ```typescript
  // POST { email, password } → { token, admin }
  // Usa JWT firmado con secret del servidor
  // Token válido 24h, guardado en httpOnly cookie
  ```
- Paquetes necesarios: `bcryptjs`, `jose` (para JWT)
  ```bash
  npm install bcryptjs jose
  npm install -D @types/bcryptjs
  ```

### [ ] 1.3 Crear middleware de protección
- Archivo `src/middleware.ts` (o ampliar existente):
  ```typescript
  // Si ruta empieza por /admin y no tiene cookie válida → redirect a /admin/login
  ```

### [ ] 1.4 Crear layout del admin dashboard
- Archivo `src/app/admin/layout.tsx`:
  - Sidebar izquierdo: Overview, Usuarios, Mascotas, Revenue, Alertas, Leo IA
  - Header: nombre del admin, botón logout
  - Colores: oscuro (diferenciado de la app principal)
- Componentes UI:
  - `AdminSidebar.tsx` — navegación lateral
  - `AdminHeader.tsx` — barra superior
  - `StatCard.tsx` — tarjeta de KPI (número grande + tendencia)
  - `ChartCard.tsx` — tarjeta con gráfica

### [ ] 1.5 Crear página de login
- Archivo `src/app/admin/login/page.tsx`:
  - Input email + password + botón "Entrar"
  - Logo Dame un Ok
  - Redirección a /admin tras login exitoso

---

## FASE 2: Overview Dashboard — PRIORIDAD P0

### [ ] 2.1 Crear API de métricas generales
- Archivo `src/app/api/admin/metrics/route.ts`:
  ```typescript
  // GET → retorna todas las métricas calculadas server-side
  // Requiere cookie de admin válida
  
  // Queries a ejecutar:
  // 1. Total usuarios: SELECT count(*) FROM dok_users
  // 2. Activos hoy: SELECT count(DISTINCT user_id) FROM dok_check_ins WHERE created_at >= today
  // 3. Activos esta semana: ... WHERE created_at >= 7 days ago
  // 4. Nuevos registros hoy: SELECT count(*) FROM dok_users WHERE created_at >= today
  // 5. Registros últimos 30 días (por día): GROUP BY date
  // 6. Mascotas alimentadas hoy: check_ins con action 'alimentar'
  // 7. Racha media: AVG de streaks
  // 8. Alertas hoy: count de dok_alertas
  // 9. Tiempo medio respuesta: AVG entre alerta y siguiente check-in
  ```

### [ ] 2.2 Crear página Overview
- Archivo `src/app/admin/page.tsx`:
  - **Fila 1 (KPIs grandes):**
    - Total usuarios (con % vs semana anterior)
    - Activos hoy (con % vs ayer)
    - Tasa completación (% que hicieron 3 acciones hoy)
    - Alertas activas ahora
  - **Fila 2 (Gráficas):**
    - Gráfica de registros (últimos 30 días, línea)
    - Gráfica de actividad diaria (últimos 30 días, barras)
  - **Fila 3 (Resumen):**
    - Últimos 5 check-ins en tiempo real
    - Últimas 5 alertas
- Librería de gráficas: `recharts` (ligera, React-native)
  ```bash
  npm install recharts
  ```

### [ ] 2.3 Auto-refresh cada 60 segundos
- useEffect con setInterval que recarga las métricas
- Indicador visual: "Última actualización: hace X segundos"

---

## FASE 3: Gestión de Usuarios — PRIORIDAD P0

### [ ] 3.1 Crear API de listado de usuarios
- Archivo `src/app/api/admin/users/route.ts`:
  ```typescript
  // GET ?page=1&limit=20&search=xxx&status=active|inactive|alert
  // Retorna: lista de usuarios con datos completos
  // JOIN con dok_check_ins (último check-in), dok_familiares (familiares vinculados)
  // Campos: id, pet_name, created_at, last_check_in, streak, status, plan, familiares_count
  ```

### [ ] 3.2 Crear API de detalle de usuario
- Archivo `src/app/api/admin/users/[id]/route.ts`:
  ```typescript
  // GET → detalle completo de un usuario
  // - Datos del usuario
  // - Mascota(s)
  // - Historial de check-ins (últimos 30 días)
  // - Familiares vinculados (nombres, emails)
  // - Plan y método de pago (cuando exista Stripe)
  // - Alertas recibidas
  // - Racha actual y máxima
  ```

### [ ] 3.3 Crear página de listado
- Archivo `src/app/admin/users/page.tsx`:
  - Barra de búsqueda (por nombre, email, código)
  - Filtros: estado (activo/inactivo/alerta), plan (free/premium)
  - Tabla con columnas: Mascota, Último check-in, Racha, Estado, Plan, Acciones
  - Paginación
  - Click en fila → detalle

### [ ] 3.4 Crear página de detalle de usuario
- Archivo `src/app/admin/users/[id]/page.tsx`:
  - Cabecera: avatar mascota + nombre + código + fecha registro
  - Tarjetas: estado actual, racha, plan
  - Historial de check-ins (timeline visual)
  - Familiares vinculados (lista)
  - Acciones admin: enviar notificación, forzar alimentar, pausar cuenta

---

## FASE 4: Panel de Alertas — PRIORIDAD P1

### [ ] 4.1 Crear API de alertas
- Archivo `src/app/api/admin/alerts/route.ts`:
  ```typescript
  // GET ?page=1&limit=50&level=alerta1h|alerta3h|emergencia6h
  // Retorna: historial de alertas con user info
  // Campos: timestamp, user_id, pet_name, level, response_time, resolved
  ```

### [ ] 4.2 Crear página de alertas
- Archivo `src/app/admin/alerts/page.tsx`:
  - Filtros por nivel y fecha
  - Tabla: Hora, Usuario, Mascota, Nivel, Tiempo respuesta, Estado
  - KPIs arriba: alertas hoy, tiempo medio respuesta, % resueltas <1h
  - Gráfica: alertas por día (últimos 30 días)

---

## FASE 5: Revenue & Suscripciones (preparación) — PRIORIDAD P1

### [ ] 5.1 Diseñar modelo de datos para planes
- Tabla `dok_subscriptions`:
  ```sql
  CREATE TABLE dok_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES dok_users(id),
    plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'basic' | 'premium'
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active', -- 'active' | 'past_due' | 'canceled' | 'trialing'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    payment_method_type TEXT, -- 'card' | 'sepa' | etc
    payment_method_last4 TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

### [ ] 5.2 Crear página de Revenue (placeholder)
- Archivo `src/app/admin/revenue/page.tsx`:
  - KPIs: MRR, usuarios free vs paid, conversión
  - Cuando no hay Stripe: mostrar "Conectar Stripe para activar"
  - Gráficas: MRR evolution, plan distribution (pie chart)

### [ ] 5.3 Integrar Stripe Billing (cuando esté listo)
- Crear cuenta Stripe → API keys
- Webhooks de Stripe → actualizar dok_subscriptions
- Eventos clave:
  - `customer.subscription.created` → nuevo subscriber
  - `customer.subscription.updated` → cambio plan
  - `customer.subscription.deleted` → cancelación
  - `invoice.payment_succeeded` → pago OK
  - `invoice.payment_failed` → pago fallido

---

## FASE 6: Leo IA integrado — PRIORIDAD P2

### [ ] 6.1 Crear chat de Leo en el dashboard
- Archivo `src/app/admin/leo/page.tsx`:
  - Chat interface: input + historial de mensajes
  - Leo tiene acceso a todas las métricas via API
  - Preguntas ejemplo:
    - "¿Cuántos usuarios se registraron esta semana?"
    - "¿Por qué bajó la retención?"
    - "¿Cuál es el usuario más activo?"
    - "Dame un resumen del día"

### [ ] 6.2 Crear API de Leo
- Archivo `src/app/api/admin/leo/route.ts`:
  - Recibe pregunta del admin
  - Consulta métricas relevantes de Supabase
  - Genera respuesta con contexto de negocio
  - Retorna respuesta al chat

### [ ] 6.3 Alertas proactivas de Leo
- Leo analiza métricas cada día y envía por Telegram:
  - Resumen diario: registros, actividad, alertas
  - Anomalías: caídas de retención, picos de errores
  - Recomendaciones: "Los usuarios con 7+ días de racha convierten 3x más"

---

## Resumen de progreso

| Fase | Tareas | Completadas | Estado |
|------|--------|-------------|--------|
| 1. Estructura base | 5 | 0 | ⬜ Pendiente |
| 2. Overview | 3 | 0 | ⬜ Pendiente |
| 3. Usuarios | 4 | 0 | ⬜ Pendiente |
| 4. Alertas | 2 | 0 | ⬜ Pendiente |
| 5. Revenue | 3 | 0 | ⬜ Pendiente |
| 6. Leo IA | 3 | 0 | ⬜ Pendiente |
| **TOTAL** | **20** | **0** | **⬜ 0%** |

---

## Dependencias npm a instalar
```bash
npm install recharts bcryptjs jose
npm install -D @types/bcryptjs
```

## Variables de entorno nuevas
```
ADMIN_JWT_SECRET=xxx (generar con: openssl rand -hex 32)
# Stripe (cuando esté listo):
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
```
