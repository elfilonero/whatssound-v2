# 🗄️ Auditoría de Base de Datos — Dame un OK (v2)

**Fecha:** 2025-07-17  
**Proyecto Supabase:** `eobqqwhywkdsxnpekkkd`  
**Esquema:** `public`  
**Prefijo de tablas:** `dok_`

---

## 📊 Resumen General

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| `dok_users` | 9 | Usuarios principales (mayores) |
| `dok_familiares` | 5 | Familiares/cuidadores vinculados |
| `dok_check_ins` | 9 | Check-ins diarios ("estoy bien") |
| `dok_invitations` | 11 | Invitaciones de familiar a usuario |
| `dok_admin_invitations` | 2 | Invitaciones admin para registro |
| `dok_achievements` | 8 | Logros desbloqueados |
| `dok_alertas` | 0 | Alertas de inactividad |
| `dok_push_subscriptions` | 1 | Suscripciones push notification |
| `dok_schedules` | 16 | Horarios configurados |
| `dok_subscriptions` | 0 | Suscripciones de pago (Stripe) |
| `dok_payment_events` | 0 | Eventos de pago |
| `dok_viewer_invitations` | 0 | Invitaciones para viewers |
| **TOTAL** | **12 tablas** | |

---

## 📐 Esquema Completo por Tabla

### 1. `dok_users` — Usuarios principales

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `name` | text | NO | — |
| `email` | text | SÍ | — |
| `pet_name` | text | SÍ | `'Fufy'` |
| `pet_type` | text | SÍ | `'cat'` |
| `streak` | integer | SÍ | `0` |
| `last_check_in` | timestamptz | SÍ | — |
| `created_at` | timestamptz | SÍ | `now()` |
| `auth_id` | uuid | SÍ | — |
| `onboarded` | boolean | SÍ | `false` |
| `invite_code` | text | SÍ | — |
| `phone` | text | SÍ | — |
| `dnd_until` | timestamptz | SÍ | — |
| `last_lat` | double precision | SÍ | — |
| `last_lng` | double precision | SÍ | — |
| `last_location_at` | timestamptz | SÍ | — |
| `battery_low` | boolean | SÍ | `false` |
| `country` | text | SÍ | — |
| `timezone` | text | SÍ | — |
| `force_wake_until` | timestamptz | SÍ | — |

**Índices:**
- `dok_users_pkey` — PK en `id`
- `dok_users_email_key` — UNIQUE en `email`
- `dok_users_auth_id_key` — UNIQUE en `auth_id`
- `dok_users_invite_code_key` — UNIQUE en `invite_code`

---

### 2. `dok_familiares` — Familiares/Cuidadores

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | SÍ | — |
| `familiar_name` | text | NO | — |
| `familiar_email` | text | SÍ | — |
| `relacion` | text | SÍ | `'familiar'` |
| `created_at` | timestamptz | SÍ | `now()` |
| `auth_id` | uuid | SÍ | — |
| `invitation_code` | text | SÍ | — |
| `onboarded` | boolean | SÍ | `false` |
| `rol` | text | SÍ | `'principal'` |
| `linked_user_id` | text | SÍ | — |
| `country` | text | SÍ | — |
| `timezone` | text | SÍ | — |

**Índices:**
- `dok_familiares_pkey` — PK en `id`
- `dok_familiares_invitation_code_key` — UNIQUE en `invitation_code`
- `idx_dok_familiares_user` — en `user_id`
- `idx_dok_familiares_auth` — en `auth_id`

---

### 3. `dok_check_ins` — Check-ins diarios

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | NO | — |
| `actions` | jsonb | SÍ | `'[]'::jsonb` |
| `device_type` | text | SÍ | `'smartphone'` |
| `created_at` | timestamptz | SÍ | `now()` |

**Índices:**
- `dok_check_ins_pkey` — PK en `id`
- `idx_dok_check_ins_user_date` — en `(user_id, created_at DESC)`

---

### 4. `dok_invitations` — Invitaciones de familiar

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `familiar_id` | uuid | SÍ | — |
| `code` | text | NO | — |
| `used` | boolean | SÍ | `false` |
| `used_by` | uuid | SÍ | — |
| `created_at` | timestamptz | SÍ | `now()` |
| `familiar_name` | text | SÍ | — |
| `schedules` | jsonb | SÍ | — |
| `pet_type` | text | SÍ | `'cat'` |
| `alert_times` | jsonb | SÍ | — |

**Índices:**
- `dok_invitations_pkey` — PK en `id`
- `dok_invitations_code_key` — UNIQUE en `code`

---

### 5. `dok_admin_invitations` — Invitaciones admin

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `code` | text | NO | — |
| `created_at` | timestamptz | SÍ | `now()` |
| `used` | boolean | SÍ | `false` |
| `used_by` | uuid | SÍ | — |
| `used_at` | timestamptz | SÍ | — |
| `label` | text | SÍ | — |

**Índices:**
- `dok_admin_invitations_pkey` — PK en `id`
- `dok_admin_invitations_code_key` — UNIQUE en `code`

---

### 6. `dok_achievements` — Logros

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | SÍ | — |
| `achievement_id` | text | NO | — |
| `unlocked_at` | timestamptz | SÍ | `now()` |

**Índices:**
- `dok_achievements_pkey` — PK en `id`
- `dok_achievements_user_id_achievement_id_key` — UNIQUE en `(user_id, achievement_id)`

---

### 7. `dok_alertas` — Alertas de inactividad

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | NO | — |
| `nivel` | text | NO | — |
| `mensaje` | text | SÍ | — |
| `resolved` | boolean | SÍ | `false` |
| `created_at` | timestamptz | SÍ | `now()` |

**Índices:**
- `dok_alertas_pkey` — PK en `id`
- `idx_dok_alertas_user_date` — en `(user_id, created_at DESC)`
- `idx_dok_alertas_user_resolved` — en `(user_id, resolved)`

---

### 8. `dok_push_subscriptions` — Push notifications

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | NO | — |
| `endpoint` | text | NO | — |
| `keys` | jsonb | NO | — |
| `created_at` | timestamptz | SÍ | `now()` |

**Índices:**
- `dok_push_subscriptions_pkey` — PK en `id`
- `dok_push_subscriptions_endpoint_key` — UNIQUE en `endpoint`
- `idx_dok_push_subs_user` — en `user_id`

---

### 9. `dok_schedules` — Horarios

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | text | NO | — |
| `type` | text | NO | — |
| `time` | text | NO | — |
| `created_at` | timestamptz | SÍ | `now()` |

**Índices:**
- `dok_schedules_pkey` — PK en `id`
- `idx_dok_schedules_user` — en `user_id`

> ⚠️ **Problema:** `user_id` es de tipo `text` en lugar de `uuid`. Esto obliga a hacer casts en las policies RLS y rompe la consistencia con el resto de tablas.

---

### 10. `dok_subscriptions` — Suscripciones (Stripe)

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | SÍ | — |
| `plan` | text | NO | `'free'` |
| `stripe_customer_id` | text | SÍ | — |
| `stripe_subscription_id` | text | SÍ | — |
| `status` | text | NO | `'active'` |
| `current_period_start` | timestamptz | SÍ | — |
| `current_period_end` | timestamptz | SÍ | — |
| `created_at` | timestamptz | SÍ | `now()` |

**Índices:**
- `dok_subscriptions_pkey` — PK en `id`
- ⚠️ Falta índice en `user_id`
- ⚠️ Falta índice UNIQUE en `stripe_subscription_id`

---

### 11. `dok_payment_events` — Eventos de pago

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `subscription_id` | uuid | SÍ | — |
| `event_type` | text | NO | — |
| `stripe_event_id` | text | SÍ | — |
| `amount` | integer | SÍ | — |
| `created_at` | timestamptz | SÍ | `now()` |

**Índices:**
- `dok_payment_events_pkey` — PK en `id`
- ⚠️ Falta índice en `subscription_id`
- ⚠️ Falta índice UNIQUE en `stripe_event_id` (para idempotencia)

---

### 12. `dok_viewer_invitations` — Invitaciones viewer

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `code` | text | NO | — |
| `creator_familiar_id` | uuid | SÍ | — |
| `used` | boolean | SÍ | `false` |
| `used_by_auth_id` | uuid | SÍ | — |
| `created_at` | timestamptz | SÍ | `now()` |

**Índices:**
- `dok_viewer_invitations_pkey` — PK en `id`
- `dok_viewer_invitations_code_key` — UNIQUE en `code`

---

## 🔗 Relaciones (Foreign Keys)

| Tabla origen | Columna | → Tabla destino | Columna destino |
|-------------|---------|-----------------|-----------------|
| `dok_achievements` | `user_id` | `dok_users` | `id` |
| `dok_alertas` | `user_id` | `dok_users` | `id` |
| `dok_check_ins` | `user_id` | `dok_users` | `id` |
| `dok_familiares` | `user_id` | `dok_users` | `id` |
| `dok_subscriptions` | `user_id` | `dok_users` | `id` |
| `dok_payment_events` | `subscription_id` | `dok_subscriptions` | `id` |

### ⚠️ Foreign Keys que FALTAN

| Tabla | Columna | Debería referenciar |
|-------|---------|---------------------|
| `dok_invitations` | `familiar_id` | `dok_familiares.id` |
| `dok_invitations` | `used_by` | `dok_users.id` (o `auth.users.id`) |
| `dok_admin_invitations` | `used_by` | `auth.users.id` |
| `dok_push_subscriptions` | `user_id` | `dok_users.id` |
| `dok_schedules` | `user_id` | `dok_users.id` (requiere cambiar a uuid) |
| `dok_viewer_invitations` | `creator_familiar_id` | `dok_familiares.id` |
| `dok_viewer_invitations` | `used_by_auth_id` | `auth.users.id` |
| `dok_familiares` | `auth_id` | `auth.users.id` |
| `dok_users` | `auth_id` | `auth.users.id` |

---

## 🔒 Políticas RLS (Row Level Security)

### `dok_users`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `dok_users_select` | SELECT | `auth.uid() IS NOT NULL` |
| `dok_users_insert` | INSERT | `auth.uid() = auth_id` |
| `dok_users_update` | UPDATE | `auth.uid() IS NOT NULL` |

> ⚠️ **UPDATE demasiado permisivo:** Cualquier usuario autenticado puede actualizar CUALQUIER usuario. Debería ser `auth.uid() = auth_id`.
> ⚠️ **SELECT demasiado permisivo:** Cualquier usuario autenticado ve TODOS los usuarios. Aceptable solo si los familiares necesitan ver datos del usuario vinculado.
> ❌ **Falta DELETE policy** (no necesaria si no se borran usuarios).

### `dok_familiares`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `dok_familiares_select` | SELECT | `auth.uid() IS NOT NULL` |
| `dok_familiares_insert_v2` | INSERT | `auth_id = auth.uid()` |
| `dok_familiares_update` | UPDATE | `auth_id = auth.uid()` |

> ✅ INSERT y UPDATE bien restringidos al propio familiar.
> ⚠️ SELECT permite a cualquier autenticado ver todos los familiares.

### `dok_check_ins`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `dok_check_ins_select` | SELECT | `auth.uid() IS NOT NULL` |
| `dok_check_ins_insert` | INSERT | `auth.uid() IS NOT NULL` |

> ⚠️ **INSERT sin restricción:** Cualquier autenticado puede insertar check-ins para cualquier user_id.
> ⚠️ **SELECT sin restricción:** Todos ven todos los check-ins.

### `dok_invitations`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `dok_invitations_select_v2` | SELECT | `true` (público) |
| `dok_invitations_insert_v2` | INSERT | `auth.uid() IS NOT NULL` |
| `allow_anon_insert_invitations` | INSERT | `true` (anónimo) |
| `dok_invitations_update_v2` | UPDATE | `auth.uid() IS NOT NULL` |

> ⚠️ **SELECT público** y **INSERT anónimo**: Cualquiera (sin autenticar) puede leer y crear invitaciones. Potencial abuso.

### `dok_admin_invitations`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `Anyone can read admin invitations` | SELECT | `true` |
| `Auth users can insert admin invitations` | INSERT | `true` |
| `Auth users can update admin invitations` | UPDATE | `auth.uid() IS NOT NULL` |

> 🚨 **CRÍTICO:** INSERT con `with_check = true` permite a CUALQUIERA crear invitaciones admin. Debería estar restringido a un rol admin o service_role.

### `dok_achievements`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `Users can see own achievements` | SELECT | `auth.uid() IS NOT NULL` |
| `Users can insert own achievements` | INSERT | `auth.uid() IS NOT NULL` |

> ⚠️ A pesar del nombre, no filtra por "own" — cualquier autenticado ve/inserta todos.

### `dok_alertas`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `dok_alertas_select` | SELECT | `auth.uid() IS NOT NULL` |
| `dok_alertas_insert_v2` | INSERT | user_id pertenece al usuario O a un familiar vinculado |
| `dok_alertas_update_v2` | UPDATE | `auth.uid() IS NOT NULL` |

> ✅ INSERT bien implementado (usuario propio o familiar vinculado).
> ⚠️ UPDATE demasiado abierto.

### `dok_push_subscriptions`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `dok_push_select` | SELECT | `auth.uid() IS NOT NULL` |
| `dok_push_insert` | INSERT | user_id del usuario o familiar vinculado |
| `dok_push_delete` | DELETE | `auth.uid() IS NOT NULL` |

> ✅ INSERT bien restringido.
> ⚠️ DELETE permite borrar suscripciones de otros.

### `dok_schedules`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `dok_schedules_select` | SELECT | `auth.uid() IS NOT NULL` |
| `dok_schedules_insert` | INSERT | user_id (cast a uuid) del usuario o familiar |
| `dok_schedules_update` | UPDATE | `auth.uid() IS NOT NULL` |
| `dok_schedules_delete` | DELETE | `auth.uid() IS NOT NULL` |

> ✅ INSERT bien restringido.
> ⚠️ UPDATE y DELETE demasiado abiertos.

### `dok_subscriptions`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `authenticated_select_subscriptions` | SELECT | `auth.uid() IS NOT NULL` |
| `authenticated_insert_subscriptions` | INSERT | `auth.uid() IS NOT NULL` |
| `authenticated_update_subscriptions` | UPDATE | `auth.uid() IS NOT NULL` |

> ⚠️ Todas demasiado permisivas. Cualquier autenticado puede ver/crear/modificar suscripciones de otros.

### `dok_payment_events`
Misma situación que subscriptions — solo requiere autenticación.

### `dok_viewer_invitations`
| Policy | Comando | Condición |
|--------|---------|-----------|
| `viewer_inv_select` | SELECT | `true` (público) |
| `viewer_inv_insert` | INSERT | `auth.uid() IS NOT NULL` |
| `viewer_inv_update` | UPDATE | `auth.uid() IS NOT NULL` |

---

## 🔍 Índices: Existentes y Recomendados

### ✅ Índices existentes bien diseñados
- `idx_dok_check_ins_user_date` — Perfecto para consultas de historial por usuario
- `idx_dok_alertas_user_date` y `idx_dok_alertas_user_resolved` — Buenos para dashboard
- `idx_dok_familiares_user` e `idx_dok_familiares_auth` — Necesarios para lookups
- `idx_dok_push_subs_user` — Para buscar suscripciones push por usuario
- `idx_dok_schedules_user` — Para horarios por usuario
- Todos los UNIQUE en `code` — Correctos para lookup de invitaciones

### ⚠️ Índices recomendados que faltan

| Tabla | Índice sugerido | Motivo |
|-------|----------------|--------|
| `dok_subscriptions` | `idx_dok_subscriptions_user` en `user_id` | Lookup de plan por usuario |
| `dok_subscriptions` | UNIQUE en `stripe_subscription_id` | Idempotencia Stripe |
| `dok_payment_events` | `idx_dok_payment_events_sub` en `subscription_id` | Historial de pagos |
| `dok_payment_events` | UNIQUE en `stripe_event_id` | Idempotencia webhooks |
| `dok_invitations` | `idx_dok_invitations_familiar` en `familiar_id` | Lookup por familiar |
| `dok_viewer_invitations` | `idx_dok_viewer_inv_creator` en `creator_familiar_id` | Lookup por creador |

---

## 🔌 Conexión desde la App

**Archivo:** `src/src/lib/services/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- Usa `anon key` (correcto para cliente con RLS).
- No hay `service_role` key expuesta en el cliente (bien).
- No hay tipado TypeScript de las tablas (mejorable con `supabase gen types`).

---

## 🧪 Datos de Prueba a Limpiar para v3

Los 9 usuarios actuales son **todos de prueba** (creados el 2026-02-01):

| Nombre | Email | Indicador de prueba |
|--------|-------|---------------------|
| María Test | `maria.test@dameunok.com` | Nombre dice "Test" |
| HBA9T8 | `HBA9T8@dameunok.app` | Nombre = código invitación |
| Leo | `ZUR04T2D@dameunok.app` | Email auto-generado |
| Yo | `8Q7UFEAU@dameunok.app` | Nombre genérico, email auto |
| Yo | `N4RF4R3K@dameunok.app` | Duplicado |
| Yo1 | `NLQNHTCO@dameunok.app` | Variante de prueba |
| 1 | `O1FKUDHP@dameunok.app` | Nombre mínimo |
| 1 | `ITD5007K@dameunok.app` | Duplicado |
| 12 | `8V5IJF00@dameunok.app` | Nombre mínimo |

**Para v3 se deben limpiar:**
- Todos los registros de `dok_users` (9)
- Todos los registros de `dok_familiares` (5)
- Todos los registros de `dok_check_ins` (9)
- Todos los registros de `dok_invitations` (11)
- Todos los registros de `dok_admin_invitations` (2)
- Todos los registros de `dok_achievements` (8)
- Todos los registros de `dok_push_subscriptions` (1)
- Todos los registros de `dok_schedules` (16)
- También limpiar usuarios de `auth.users` en Supabase Dashboard

---

## 🎯 Recomendaciones de Mejora

### 🚨 Prioridad ALTA (Seguridad)

1. **Restringir RLS de `dok_users` UPDATE:** Cambiar a `auth.uid() = auth_id` para que solo el propio usuario pueda editarse.

2. **Restringir `dok_admin_invitations` INSERT:** Solo `service_role` o una función RPC con validación debería poder crear invitaciones admin. Actualmente CUALQUIERA puede crearlas.

3. **Restringir `dok_check_ins` INSERT:** Validar que `user_id` pertenece al usuario autenticado (como se hace en alertas).

4. **Restringir `dok_subscriptions` y `dok_payment_events`:** Solo `service_role` (webhooks Stripe) debería poder insertar/actualizar. Las policies actuales permiten que cualquier usuario cree suscripciones falsas.

5. **Cerrar INSERT anónimo en `dok_invitations`:** La policy `allow_anon_insert_invitations` permite crear invitaciones sin autenticación.

### ⚡ Prioridad MEDIA (Integridad)

6. **Cambiar `dok_schedules.user_id` de `text` a `uuid`:** Es el único campo que usa text para un ID, requiriendo casts en las policies.

7. **Añadir Foreign Keys faltantes:** Especialmente en `dok_invitations.familiar_id`, `dok_push_subscriptions.user_id`, `dok_viewer_invitations.creator_familiar_id`.

8. **Cambiar `dok_familiares.linked_user_id` de `text` a `uuid`:** Mismo problema que schedules.

9. **Añadir índices faltantes** (ver sección de índices arriba).

### 💡 Prioridad BAJA (Mejoras)

10. **Generar tipos TypeScript:** Ejecutar `supabase gen types typescript` para type-safety en el cliente.

11. **Revisar SELECTs permisivos:** La mayoría de tablas permiten que cualquier autenticado lea todo. Funcional para la app actual (los familiares necesitan ver datos del usuario), pero podría restringirse más.

12. **Añadir columna `updated_at`** a tablas que se actualizan frecuentemente (`dok_users`, `dok_familiares`, `dok_subscriptions`).

13. **Considerar soft-delete** en lugar de borrado directo para `dok_familiares` y `dok_users`.

14. **Validar `pet_type` con CHECK constraint:** Actualmente es texto libre, podría ser `CHECK (pet_type IN ('cat', 'dog', 'bird', ...))`.

15. **Limpiar todos los datos de prueba** antes del lanzamiento de v3.

---

## 📊 Diagrama de Relaciones

```
auth.users
    │
    ├──→ dok_users (auth_id)
    │       │
    │       ├──→ dok_check_ins (user_id)
    │       ├──→ dok_familiares (user_id)
    │       │       │
    │       │       ├──→ dok_invitations (familiar_id) [FK falta]
    │       │       └──→ dok_viewer_invitations (creator_familiar_id) [FK falta]
    │       │
    │       ├──→ dok_achievements (user_id)
    │       ├──→ dok_alertas (user_id)
    │       ├──→ dok_push_subscriptions (user_id) [FK falta]
    │       ├──→ dok_schedules (user_id como text) [FK falta]
    │       └──→ dok_subscriptions (user_id)
    │               │
    │               └──→ dok_payment_events (subscription_id)
    │
    └──→ dok_familiares (auth_id) [FK falta]

    dok_admin_invitations (tabla independiente)
```

---

*Informe generado automáticamente. No se realizaron modificaciones a la base de datos.*
