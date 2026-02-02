# 🔌 API y Backend — Diseño Completo

**Proyecto:** Dame un Ok  
**Fecha:** Febrero 2026  
**Stack:** Supabase Edge Functions (Deno/TypeScript) + PostgreSQL + MQTT  
**Versión API:** v1  
**Base URL:** `https://api.dameunok.es/v1` (producción) / `https://<project>.supabase.co/functions/v1` (directo)

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                     │
├─────────────┬──────────────┬──────────────┬──────────────┬──────────┤
│ App Flutter │ Dashboard Web│ Bot Telegram │ WhatsApp API │ IoT MQTT │
│  (REST+JWT) │  (REST+JWT)  │  (Webhook)   │  (Webhook)   │ (MQTT)   │
└──────┬──────┴──────┬───────┴──────┬───────┴──────┬───────┴────┬─────┘
       │             │              │              │            │
       ▼             ▼              ▼              ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / EDGE FUNCTIONS                      │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ Auth     │ │ Rate     │ │ Request      │ │ Error Handler      │  │
│  │ Middleware│ │ Limiter  │ │ Validator    │ │ (estándar)         │  │
│  └──────────┘ └──────────┘ └──────────────┘ └────────────────────┘  │
│                                                                      │
│  ENDPOINTS:                                                          │
│  /auth/*        /checkin        /devices/*       /contacts/*         │
│  /avatars/*     /streaks/*      /alerts/*        /messages/*         │
│  /responses/*   /dashboard/*    /webhooks/*      /admin/*            │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL + Auth + Realtime)           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Autenticación

### 2.1 Supabase Auth

Todos los endpoints requieren autenticación JWT excepto los webhooks (que usan verificación por firma) y los endpoints públicos marcados explícitamente.

**Flujos de autenticación soportados:**

| Método | Endpoint | Uso principal |
|--------|----------|---------------|
| Email + contraseña | `POST /auth/signup`, `POST /auth/login` | Registro estándar |
| Magic Link (email) | `POST /auth/magic-link` | Login sin contraseña (seniors) |
| Teléfono + OTP | `POST /auth/otp` | Verificación por SMS |
| Apple Sign-In | Via Supabase OAuth | iOS nativo |
| Google Sign-In | Via Supabase OAuth | Android nativo |

**Header de autenticación:**
```
Authorization: Bearer <jwt_token>
```

**Token JWT contiene:**
```json
{
  "sub": "auth_user_uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "exp": 1706800000
}
```

### 2.2 Autenticación de dispositivos IoT

Los dispositivos IoT no tienen sesión de usuario. Usan un **token de dispositivo** generado en el registro:

```
Authorization: Bearer <device_token>
```

El backend verifica el token contra `devices.token_hash` (bcrypt). Los dispositivos IoT acceden a un subconjunto limitado de endpoints: solo `/checkin`, `/devices/heartbeat` y `/devices/status`.

### 2.3 Webhooks

Los webhooks de plataformas externas se autentican por verificación de firma:

| Plataforma | Verificación |
|------------|-------------|
| WhatsApp (Meta) | Header `X-Hub-Signature-256` con HMAC-SHA256 |
| Telegram | Token secreto en URL + IP whitelist |
| Twilio (SMS) | Header `X-Twilio-Signature` con HMAC-SHA1 |

---

## 3. Endpoints REST — Referencia Completa

### 3.1 Auth

```
POST /auth/signup
  Body: { "email": "maria@example.com", "password": "...", "display_name": "María García", "phone": "+34600111222" }
  Response 201: { "user": { "id": "uuid", "email": "..." }, "session": { "access_token": "jwt", "refresh_token": "..." } }
  Errors: 400 (validación), 409 (email ya existe)

POST /auth/login
  Body: { "email": "maria@example.com", "password": "..." }
  Response 200: { "user": {...}, "session": { "access_token": "jwt", "refresh_token": "..." } }
  Errors: 401 (credenciales inválidas)

POST /auth/magic-link
  Body: { "email": "maria@example.com" }
  Response 200: { "message": "Enlace enviado a tu email" }

POST /auth/otp
  Body: { "phone": "+34600111222" }
  Response 200: { "message": "Código enviado por SMS" }

POST /auth/otp/verify
  Body: { "phone": "+34600111222", "code": "123456" }
  Response 200: { "user": {...}, "session": {...} }

POST /auth/refresh
  Body: { "refresh_token": "..." }
  Response 200: { "session": { "access_token": "new_jwt", "refresh_token": "new_refresh" } }

POST /auth/logout
  Headers: Authorization: Bearer <jwt>
  Response 200: { "message": "Sesión cerrada" }

DELETE /auth/account
  Headers: Authorization: Bearer <jwt>
  Response 200: { "message": "Cuenta marcada para eliminación. Se completará en 30 días." }
  Nota: Soft delete (RGPD). El usuario puede reactivar dentro de 30 días.
```

### 3.2 Check-in

```
POST /checkin
  Headers: Authorization: Bearer <jwt|device_token>
  Body: {
    "source": "app_mobile",                    // checkin_source enum
    "device_id": "uuid" | null,                // Opcional si es desde app
    "location": { "lat": 41.65, "lng": -2.47 } | null,  // Solo si share_location=true
    "metadata": { "battery": 85, "rssi": -45 } | null
  }
  Response 200: {
    "ok": true,
    "checkin_id": "uuid",
    "streak": { "current": 16, "stage": "juvenile", "milestone_reached": null },
    "avatar": { "mood": "happy", "stage": "juvenile" },
    "next_deadline": "2026-02-02T10:00:00+01:00"
  }
  Response 409: { "error": "already_checked_in", "message": "Ya has hecho check-in hoy" }
  Nota: Idempotente para el mismo día (devuelve 409 sin error real)

GET /checkin/history
  Headers: Authorization: Bearer <jwt>
  Query: ?from=2026-01-01&to=2026-01-31&limit=31
  Response 200: {
    "checkins": [
      { "date": "2026-01-31", "timestamp": "2026-01-31T09:30:00Z", "source": "printer_button", "device_name": "Cocina" },
      { "date": "2026-01-30", "timestamp": "2026-01-30T09:48:00Z", "source": "app_mobile", "device_name": null }
    ],
    "total_days": 28,
    "missed_days": 3
  }

GET /checkin/today
  Headers: Authorization: Bearer <jwt>
  Response 200: {
    "checked_in": true,
    "checkin": { "timestamp": "2026-01-31T09:30:00Z", "source": "printer_button" },
    "deadline": "2026-01-31T10:00:00+01:00",
    "avatar_mood": "happy"
  }
  Response 200 (no check-in): {
    "checked_in": false,
    "deadline": "2026-01-31T10:00:00+01:00",
    "avatar_mood": "waiting",
    "hours_until_deadline": 2.5
  }
```

### 3.3 Devices

```
POST /devices
  Headers: Authorization: Bearer <jwt>
  Body: {
    "device_type_code": "button_wifi",
    "name": "Cocina",
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "firmware_version": "1.0.0"
  }
  Response 201: {
    "device_id": "uuid",
    "device_token": "generated_token_only_shown_once",
    "mqtt_topic": "ok/uuid",
    "mqtt_broker": "mqtt.dameunok.es",
    "mqtt_port": 8883
  }

GET /devices
  Headers: Authorization: Bearer <jwt>
  Response 200: {
    "devices": [{
      "id": "uuid", "name": "Cocina", "type": "printer",
      "status": "active", "battery_level": null,
      "last_seen_at": "2026-01-31T15:00:00Z",
      "firmware_version": "1.0.0"
    }]
  }

GET /devices/:id
  Response 200: { "device": { ...full device details... } }

PATCH /devices/:id
  Body: { "name": "Salón", "status": "active" }
  Response 200: { "device": { ...updated... } }

DELETE /devices/:id
  Response 200: { "message": "Dispositivo eliminado" }

POST /devices/:id/heartbeat
  Headers: Authorization: Bearer <device_token>
  Body: { "battery_level": 72, "wifi_rssi": -52, "firmware_version": "1.0.0" }
  Response 200: {
    "avatar_mood": "happy",
    "pending_commands": [],
    "ota_available": null
  }
  Nota: Los dispositivos IoT llaman esto periódicamente para reportar estado y recibir comandos.

POST /devices/:id/ota
  Headers: Authorization: Bearer <jwt> (solo admin/propietario)
  Body: { "firmware_url": "https://ota.dameunok.es/fw/1.1.0.bin", "version": "1.1.0" }
  Response 200: { "command_queued": true }
```

### 3.4 Contacts (Emergency Contacts)

```
GET /contacts
  Headers: Authorization: Bearer <jwt>
  Response 200: {
    "contacts": [{
      "id": "uuid", "name": "Javier García", "phone": "+34666333444",
      "email": "javier@example.com", "relationship": "hijo", "priority": 1,
      "notify_email": true, "notify_sms": false,
      "is_verified": true, "is_active": true
    }]
  }

POST /contacts
  Body: {
    "name": "Javier García", "phone": "+34666333444",
    "email": "javier@example.com", "relationship": "hijo",
    "notify_email": true, "notify_sms": true
  }
  Response 201: { "contact": { ...created... }, "verification_sent": true }
  Nota: Envía email/SMS de verificación al contacto para que confirme

POST /contacts/:id/verify
  Body: { "token": "abc123" }
  Response 200: { "verified": true }
  Nota: Endpoint público (el contacto no necesita cuenta)

PATCH /contacts/:id
  Body: { "priority": 2, "notify_sms": true }
  Response 200: { "contact": { ...updated... } }

DELETE /contacts/:id
  Response 200: { "message": "Contacto eliminado" }
```

### 3.5 Avatars

```
GET /avatars/me
  Headers: Authorization: Bearer <jwt>
  Response 200: {
    "avatar": {
      "id": "uuid", "type": "cat", "name": "Michi",
      "stage": "juvenile", "current_mood": "happy",
      "total_days_fed": 15,
      "unlocked_accessories": ["scarf_basic"],
      "equipped_accessories": { "head": "scarf_basic" },
      "gifts_received": [{ "from": "Lucía", "item": "bow_pink", "date": "2026-01-25" }],
      "gifted_by": "Lucía (tu nieta)"
    }
  }

PATCH /avatars/me
  Body: { "name": "Peluso", "type": "dog" }
  Response 200: { "avatar": { ...updated... } }
  Nota: Cambiar tipo resetea stage a 'baby' (decisión de diseño)

PATCH /avatars/me/accessories
  Body: { "equip": { "head": "crown_silver" }, "unequip": ["scarf_basic"] }
  Response 200: { "equipped_accessories": { "head": "crown_silver" } }

POST /avatars/:user_id/gift
  Headers: Authorization: Bearer <jwt> (debe ser familiar verificado)
  Body: { "accessory": "bow_pink", "message": "¡Para Michi, de parte de Lucía!" }
  Response 200: { "gift_sent": true }
  Nota: Genera notificación push + impresión en térmica si disponible

GET /avatars/catalog
  Response 200: {
    "types": [
      { "type": "cat", "default_name": "Michi", "description": "Independiente y cariñoso", "icon": "🐱" },
      { "type": "dog", "default_name": "Toby", "description": "Leal y entusiasta", "icon": "🐕" },
      ...
    ],
    "accessories": [
      { "id": "scarf_basic", "category": "ropa", "name": "Bufanda básica", "unlock_condition": "streak_7" },
      ...
    ]
  }
```

### 3.6 Streaks

```
GET /streaks/me
  Headers: Authorization: Bearer <jwt>
  Response 200: {
    "streak": {
      "current_count": 15,
      "current_start_date": "2026-01-17",
      "longest_count": 15,
      "last_checkin_date": "2026-01-31",
      "stage": "juvenile",
      "milestones_reached": [
        { "days": 3, "name": "Primeros pasos", "reached_at": "2026-01-19" },
        { "days": 7, "name": "Una semana cuidando", "reached_at": "2026-01-23" },
        { "days": 14, "name": "Cuidador dedicado", "reached_at": "2026-01-30" }
      ],
      "next_milestone": { "days": 30, "name": "Un mes de amor", "remaining": 15 }
    }
  }

GET /streaks/milestones
  Response 200: {
    "milestones": [
      { "days": 3, "name": "Primeros pasos", "emoji": "🐾", "reward": "animation" },
      { "days": 7, "name": "Una semana cuidando", "emoji": "🌟", "reward": "accessory" },
      ...
    ]
  }
```

### 3.7 Alerts

```
GET /alerts
  Headers: Authorization: Bearer <jwt>
  Query: ?status=triggered,escalated&limit=20
  Response 200: {
    "alerts": [{
      "id": "uuid", "user_id": "uuid", "user_name": "María García",
      "type": "missed_checkin", "severity": "warning",
      "message": "María no ha confirmado su bienestar hoy.",
      "status": "triggered", "escalation_level": 1,
      "triggered_at": "2026-01-31T11:00:00Z",
      "avatar_mood": "hungry"
    }]
  }

POST /alerts/:id/acknowledge
  Headers: Authorization: Bearer <jwt> (familiar)
  Body: { "action": "acknowledge", "note": "Le he llamado, está bien" }
  Response 200: { "status": "acknowledged" }

POST /alerts/:id/resolve
  Body: { "reason": "false_positive" | "contacted" | "other", "note": "..." }
  Response 200: { "status": "resolved" }

POST /alerts/:id/dismiss
  Nota: Solo el propio usuario puede descartar su alerta
  Response 200: { "status": "resolved", "reason": "user_dismissed" }
```

### 3.8 Messages (Mensajería Familiar → Impresora)

```
POST /messages/send
  Headers: Authorization: Bearer <jwt>
  Body: {
    "printer_device_id": "uuid",
    "text": "¡Buenos días mamá! Hoy hace sol en Madrid. ❤️",
    "image_base64": null,
    "schedule_at": null
  }
  Response 201: { "message_id": "uuid", "status": "queued" }
  Errors: 400 (texto >500 chars), 403 (no vinculado a esa impresora), 429 (límite diario)

GET /messages/:id/status
  Response 200: { "status": "printed", "printed_at": "2026-01-31T09:16:00Z" }

GET /messages/sent
  Headers: Authorization: Bearer <jwt>
  Query: ?limit=20&offset=0
  Response 200: {
    "messages": [{
      "id": "uuid", "text": "¡Buenos días mamá!", "status": "printed",
      "printed_at": "2026-01-31T09:16:00Z", "target_user_name": "María García",
      "response": { "type": "bien", "responded_at": "2026-01-31T09:18:00Z" }
    }]
  }

GET /messages/received
  Headers: Authorization: Bearer <jwt> (senior)
  Query: ?limit=20
  Response 200: { "messages": [...] }
```

### 3.9 Quick Responses

```
GET /responses
  Headers: Authorization: Bearer <jwt>
  Query: ?from=2026-01-25&to=2026-01-31
  Response 200: {
    "responses": [
      { "id": "uuid", "response": "bien", "responded_at": "2026-01-31T09:18:00Z",
        "message_text": "¿Has dormido bien?", "from": "Javier", "latency_seconds": 120 }
    ],
    "summary": { "bien": 12, "mal": 3, "no_entiendo": 1, "total": 16,
                 "avg_latency_seconds": 95 }
  }
```

### 3.10 Dashboard Familiar

```
GET /dashboard/family
  Headers: Authorization: Bearer <jwt> (rol family)
  Response 200: {
    "monitored_users": [{
      "user_id": "uuid",
      "display_name": "María García",
      "avatar": { "name": "Michi", "type": "cat", "mood": "happy", "stage": "juvenile" },
      "streak": { "current": 15, "longest": 15 },
      "last_checkin": { "at": "2026-01-31T09:30:00Z", "source": "printer_button" },
      "checked_in_today": true,
      "active_alerts": 0,
      "devices": [{ "name": "Cocina", "type": "printer", "status": "active", "battery": null }],
      "weekly_responses": { "bien": 5, "mal": 1, "no_entiendo": 0 }
    }]
  }

GET /dashboard/family/:user_id/history
  Query: ?period=week|month|year
  Response 200: {
    "user_name": "María García",
    "period": "week",
    "checkins": [...],
    "responses": [...],
    "alerts": [...],
    "streak_chart": [15,14,13,12,11,10,9]
  }
```

### 3.11 Family Links (Vinculación con Impresora)

```
POST /family-links
  Headers: Authorization: Bearer <jwt>
  Body: {
    "printer_device_id": "uuid",
    "platform": "whatsapp",
    "platform_identifier": "+34666333444",
    "display_name": "Javier (tu hijo)",
    "relationship": "hijo"
  }
  Response 201: { "link_id": "uuid", "verification_code": "482917" }

POST /family-links/verify
  Body: { "link_id": "uuid", "code": "482917" }
  Response 200: { "verified": true }

GET /family-links
  Response 200: { "links": [...] }

DELETE /family-links/:id
  Response 200: { "message": "Vinculación eliminada" }
```

### 3.12 Auto Questions

```
POST /auto-questions
  Headers: Authorization: Bearer <jwt> (familiar)
  Body: {
    "device_id": "uuid",
    "question_text": "¿Has dormido bien?",
    "schedule_time": "09:00",
    "schedule_days": [1,2,3,4,5,6,7]
  }
  Response 201: { "question_id": "uuid", "status": "active" }

GET /auto-questions?device_id=uuid
  Response 200: { "questions": [...] }

PATCH /auto-questions/:id
  Body: { "is_active": false }

DELETE /auto-questions/:id
```

---

## 4. MQTT Topics para Dispositivos IoT

### 4.1 Estructura de topics

```
ok/{device_id}/checkin         → Dispositivo publica check-in (QoS 1)
ok/{device_id}/status          → Dispositivo publica estado periódico
ok/{device_id}/response        → Dispositivo publica respuesta rápida
ok/{device_id}/command         → Servidor envía comandos al dispositivo (subscribe)
ok/{device_id}/print           → Servidor envía mensajes a imprimir (subscribe)
ok/{device_id}/avatar_state    → Servidor envía estado del avatar (subscribe)
ok/{device_id}/ota             → Servidor envía info de actualización (subscribe)
```

### 4.2 Payloads

**Check-in (device → server):**
```json
{
  "type": "checkin",
  "device_id": "uuid",
  "timestamp": 1706700000,
  "metadata": { "battery": 85, "rssi": -45, "firmware": "1.0.0" }
}
```

**Status heartbeat (device → server):**
```json
{
  "type": "status",
  "battery": 72,
  "rssi": -52,
  "uptime_seconds": 86400,
  "firmware": "1.0.0",
  "paper_status": "ok",
  "wifi_reconnects": 2
}
```

**Quick response (device → server):**
```json
{
  "type": "quick_reply",
  "response": "bien",
  "in_reply_to": "msg_456",
  "timestamp": 1706700120
}
```

**Print command (server → device):**
```json
{
  "type": "print",
  "message_id": "uuid",
  "from": "Javier (tu hijo)",
  "text": "¡Buenos días mamá!",
  "emoji": "❤️",
  "image_b64": null,
  "timestamp": 1706700000
}
```

**Avatar state update (server → device):**
```json
{
  "type": "avatar_state",
  "mood": "happy",
  "stage": "juvenile",
  "streak": 15,
  "name": "Michi",
  "accessories": ["scarf_basic"]
}
```

**OTA command (server → device):**
```json
{
  "type": "ota",
  "firmware_url": "https://ota.dameunok.es/fw/1.1.0.bin",
  "version": "1.1.0",
  "checksum_sha256": "abc123...",
  "size_bytes": 524288
}
```

### 4.3 Broker MQTT

- **Broker:** EMQX Cloud o HiveMQ Cloud (plan gratuito para MVP)
- **Puerto:** 8883 (MQTT over TLS)
- **Autenticación:** Username = device_id, Password = device_token
- **QoS:** 1 para check-ins y respuestas (at-least-once), 0 para status
- **Keep-alive:** 300 segundos (5 min)
- **Clean session:** false (persistir mensajes si dispositivo offline)
- **Bridge a Supabase:** Edge Function suscrita al broker que inserta en DB

---

## 5. Webhooks — Integraciones Externas

### 5.1 WhatsApp Business API (Meta Cloud API)

```
POST /webhooks/whatsapp
  Headers: X-Hub-Signature-256: sha256=...
  Body: {
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "34666333444",
            "type": "text",
            "text": { "body": "¡Buenos días mamá!" },
            "timestamp": "1706700000"
          }]
        }
      }]
    }]
  }

  Procesamiento:
  1. Verificar firma HMAC-SHA256
  2. Extraer número de teléfono del remitente
  3. Buscar en family_links por platform='whatsapp' AND platform_identifier='+34666333444'
  4. Si encontrado → encolar mensaje en messages con status='queued'
  5. Si no encontrado → responder "No tienes un dispositivo vinculado. Envía VINCULAR para empezar."
  6. Publicar en MQTT ok/{printer_id}/print
  7. Al recibir ACK → notificar por WhatsApp: "✅ Tu mensaje se ha impreso en casa de mamá"

GET /webhooks/whatsapp
  Verificación de webhook (Meta challenge): devolver hub.challenge
```

### 5.2 Telegram Bot API

```
POST /webhooks/telegram
  Body: {
    "update_id": 123456789,
    "message": {
      "from": { "id": 987654, "first_name": "Javier" },
      "chat": { "id": 987654, "type": "private" },
      "text": "Buenos días mamá"
    }
  }

  Procesamiento:
  1. Verificar token secreto en URL path
  2. Buscar family_links por platform='telegram' AND platform_identifier='987654'
  3. Comandos especiales:
     /start → Bienvenida + instrucciones de vinculación
     /vincular <código> → Vincular Telegram con impresora
     /estado → Estado actual del avatar del familiar
     /ayuda → Lista de comandos
  4. Texto normal → encolar como mensaje para imprimir
```

### 5.3 Twilio SMS Inbound

```
POST /webhooks/sms
  Headers: X-Twilio-Signature: ...
  Body (form-urlencoded): From=+34600111222&Body=OK&To=+34900123456

  Procesamiento:
  1. Verificar firma Twilio
  2. Parsear Body: regex para detectar check-in ("OK", "Si", "Bien", "1", "Sí")
  3. Si es check-in → buscar usuario por phone → registrar check-in
  4. Si es mensaje → buscar family_link → encolar para impresión
  5. Responder con TwiML:
     Check-in: "🐱 ¡Michi ha comido! Racha: 16 días 🔥"
     Error: "No te hemos reconocido. Contacta con tu familiar para configurar."
```

---

## 6. Rate Limiting

| Grupo de endpoints | Límite | Ventana | Notas |
|---------------------|--------|---------|-------|
| `/auth/*` | 10 req | 15 min | Prevenir brute force |
| `/checkin` | 5 req | 1 min | Evitar spam de check-in |
| `/messages/send` | 20 req | 24h | Por familiar por impresora |
| `/devices` | 30 req | 1 min | CRUD normal |
| `/dashboard/*` | 60 req | 1 min | Polling frecuente del dashboard |
| `/webhooks/*` | 100 req | 1 min | Tráfico de plataformas externas |
| `/alerts` | 30 req | 1 min | Consulta de alertas |
| IoT heartbeat | 1 req | 5 min | Por dispositivo |
| Global por IP | 300 req | 1 min | Protección DDoS básica |

**Implementación:** Headers estándar `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. Respuesta 429 con `Retry-After`.

---

## 7. Versionado de API

- **URL prefix:** `/v1/` para la primera versión
- **Estrategia:** Versionado por URL path (no por header)
- **Compatibilidad:** v1 se mantiene mínimo 12 meses tras lanzamiento de v2
- **Deprecación:** Header `Sunset: <date>` + `Deprecation: true` cuando se anuncie nueva versión
- **Breaking changes:** Solo en nueva versión mayor (v2)
- **Non-breaking additions:** Nuevos campos en respuestas, nuevos endpoints → se añaden en v1

---

## 8. Error Handling Estándar

### Formato de error

```json
{
  "error": {
    "code": "CHECKIN_ALREADY_DONE",
    "message": "Ya has hecho check-in hoy",
    "status": 409,
    "details": { "checkin_date": "2026-01-31", "checked_at": "09:30:00" }
  }
}
```

### Códigos de error

| HTTP | Código interno | Descripción |
|------|---------------|-------------|
| 400 | `VALIDATION_ERROR` | Parámetros inválidos. `details` contiene campos con errores |
| 401 | `UNAUTHORIZED` | Token ausente o expirado |
| 403 | `FORBIDDEN` | Sin permisos para este recurso |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Operación conflictiva (ej: check-in duplicado) |
| 422 | `UNPROCESSABLE` | Datos válidos sintácticamente pero semánticamente incorrectos |
| 429 | `RATE_LIMITED` | Demasiadas peticiones. Incluye `Retry-After` |
| 500 | `INTERNAL_ERROR` | Error interno del servidor |
| 503 | `SERVICE_UNAVAILABLE` | Servicio temporalmente no disponible |

### Validación de entrada

Todas las Edge Functions validan input con **Zod** (TypeScript):

```typescript
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const CheckinSchema = z.object({
  source: z.enum(['app_mobile', 'button_wifi', 'button_ble', 'sms', 'ussd',
    'printer_button', 'smart_tv', 'remote_ok', 'voice_assistant', 'web_dashboard']),
  device_id: z.string().uuid().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  metadata: z.record(z.unknown()).optional()
})
```

---

## 9. Código Conceptual — Handlers Principales

### 9.1 Handler de Check-in

```typescript
// supabase/functions/checkin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Autenticar: JWT de usuario o token de dispositivo
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return errorResponse(401, 'UNAUTHORIZED', 'Token requerido')

  const token = authHeader.replace('Bearer ', '')
  let userId: string

  // Intentar como JWT de usuario
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (user) {
    const { data: profile } = await supabase
      .from('users').select('id').eq('auth_id', user.id).single()
    userId = profile!.id
  } else {
    // Intentar como token de dispositivo
    const body = await req.json()
    const { data: device } = await supabase
      .from('devices').select('id, user_id, token_hash')
      .eq('id', body.device_id).single()
    
    if (!device || !(await verifyToken(token, device.token_hash))) {
      return errorResponse(401, 'UNAUTHORIZED', 'Token inválido')
    }
    userId = device.user_id
  }

  const body = await req.json()
  const today = new Date().toISOString().split('T')[0]

  // Insertar check-in (el trigger process_checkin hace el resto)
  const { data: checkin, error } = await supabase
    .from('checkins')
    .insert({
      user_id: userId,
      device_id: body.device_id || null,
      source: body.source,
      checkin_date: today,
      location: body.location ? `POINT(${body.location.lng} ${body.location.lat})` : null,
      metadata: body.metadata || {}
    })
    .select()
    .single()

  if (error?.code === '23505') { // Unique violation
    return errorResponse(409, 'CHECKIN_ALREADY_DONE', 'Ya has hecho check-in hoy')
  }
  if (error) return errorResponse(500, 'INTERNAL_ERROR', error.message)

  // Obtener datos actualizados (el trigger ya procesó racha + avatar)
  const { data: streak } = await supabase
    .from('streaks').select('*').eq('user_id', userId).single()
  const { data: avatar } = await supabase
    .from('avatars').select('current_mood, stage, name').eq('user_id', userId).single()

  return new Response(JSON.stringify({
    ok: true,
    checkin_id: checkin.id,
    streak: {
      current: streak?.current_count,
      stage: streak?.stage,
      milestone_reached: checkMilestone(streak?.current_count)
    },
    avatar: {
      mood: avatar?.current_mood,
      stage: avatar?.stage,
      name: avatar?.name
    }
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})

function errorResponse(status: number, code: string, message: string, details?: any) {
  return new Response(JSON.stringify({ error: { code, message, status, details } }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 9.2 Handler del Dashboard Familiar

```typescript
// supabase/functions/dashboard-family/index.ts
serve(async (req: Request) => {
  const supabase = createClient(/* ... */)
  const { data: { user } } = await supabase.auth.getUser(getToken(req))
  if (!user) return errorResponse(401, 'UNAUTHORIZED', 'No autenticado')

  const { data: currentUser } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()

  // Obtener usuarios monitorizados (donde soy contacto verificado)
  const { data: monitored } = await supabase.rpc('get_monitored_users', {
    family_user_id: currentUser!.id
  })

  const result = await Promise.all(monitored.map(async (u: any) => {
    const [avatar, streak, alerts, devices, responses] = await Promise.all([
      supabase.from('avatars').select('*').eq('user_id', u.id).single(),
      supabase.from('streaks').select('*').eq('user_id', u.id).single(),
      supabase.from('alerts').select('*').eq('user_id', u.id)
        .in('status', ['triggered', 'escalated']),
      supabase.from('devices').select('id, name, status, battery_level')
        .eq('user_id', u.id),
      supabase.from('quick_responses').select('response')
        .eq('user_id', u.id)
        .gte('responded_at', new Date(Date.now() - 7 * 86400000).toISOString())
    ])

    const today = new Date().toISOString().split('T')[0]
    return {
      user_id: u.id,
      display_name: u.display_name,
      avatar: avatar.data ? {
        name: avatar.data.name, type: avatar.data.type,
        mood: avatar.data.current_mood, stage: avatar.data.stage
      } : null,
      streak: streak.data ? {
        current: streak.data.current_count,
        longest: streak.data.longest_count
      } : null,
      last_checkin: { at: u.last_checkin_at, source: null },
      checked_in_today: streak.data?.last_checkin_date === today,
      active_alerts: alerts.data?.length || 0,
      devices: devices.data || [],
      weekly_responses: summarizeResponses(responses.data || [])
    }
  }))

  return jsonResponse({ monitored_users: result })
})
```

### 9.3 Handler de Webhook WhatsApp

```typescript
// supabase/functions/webhook-whatsapp/index.ts
import { createHmac } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

serve(async (req: Request) => {
  // GET = verificación de webhook de Meta
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    if (mode === 'subscribe' && token === Deno.env.get('WA_VERIFY_TOKEN')) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // POST = mensaje entrante
  const body = await req.text()
  
  // Verificar firma HMAC-SHA256
  const signature = req.headers.get('X-Hub-Signature-256')
  const expected = 'sha256=' + createHmac('sha256', Deno.env.get('WA_APP_SECRET')!)
    .update(body).digest('hex')
  if (signature !== expected) return new Response('Invalid signature', { status: 403 })

  const data = JSON.parse(body)
  const supabase = createClient(/* service role */)

  for (const entry of data.entry || []) {
    for (const change of entry.changes || []) {
      const messages = change.value?.messages || []
      for (const msg of messages) {
        const phone = '+' + msg.from
        const text = msg.text?.body || ''

        // Buscar vinculación
        const { data: link } = await supabase
          .from('family_links')
          .select('*, printer_device_id, display_name')
          .eq('platform', 'whatsapp')
          .eq('platform_identifier', phone)
          .eq('verified', true)
          .single()

        if (!link) {
          await sendWhatsAppReply(msg.from, 'No tienes un dispositivo vinculado. Envía VINCULAR para empezar.')
          continue
        }

        // Comando VINCULAR
        if (text.toUpperCase().startsWith('VINCULAR')) {
          const code = text.split(' ')[1]
          if (code) {
            await supabase.from('family_links')
              .update({ verified: true })
              .eq('verification_code', code)
              .eq('platform_identifier', phone)
            await sendWhatsAppReply(msg.from, '✅ Vinculado correctamente.')
          }
          continue
        }

        // Encolar mensaje para impresión
        const { data: message } = await supabase.from('messages').insert({
          printer_device_id: link.printer_device_id,
          target_user_id: link.printer_device_id, // resuelto vía device.user_id
          sender_name: link.display_name,
          sender_platform: 'whatsapp',
          sender_platform_id: phone,
          message_text: text.substring(0, 500),
          message_type: 'family_message',
          status: 'queued'
        }).select().single()

        // Publicar en MQTT para que la impresora lo reciba
        await publishMqtt(`ok/${link.printer_device_id}/print`, {
          type: 'print',
          message_id: message!.id,
          from: link.display_name,
          text: text.substring(0, 500),
          timestamp: Date.now()
        })
      }
    }
  }

  return new Response('OK', { status: 200 })
})
```

### 9.4 Bridge MQTT → Supabase

```typescript
// Worker permanente (Railway/Fly.io, no Edge Function)
// Suscrito a todos los topics ok/+/checkin y ok/+/response

import mqtt from 'mqtt'
import { createClient } from '@supabase/supabase-js'

const client = mqtt.connect('mqtts://broker.dameunok.es:8883', {
  username: 'bridge_service',
  password: process.env.MQTT_BRIDGE_TOKEN
})

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

client.subscribe(['ok/+/checkin', 'ok/+/status', 'ok/+/response'])

client.on('message', async (topic: string, payload: Buffer) => {
  const parts = topic.split('/')
  const deviceId = parts[1]
  const action = parts[2]
  const data = JSON.parse(payload.toString())

  switch (action) {
    case 'checkin': {
      // Buscar usuario del dispositivo
      const { data: device } = await supabase
        .from('devices').select('user_id').eq('id', deviceId).single()
      if (!device) return

      await supabase.from('checkins').insert({
        user_id: device.user_id,
        device_id: deviceId,
        source: data.metadata?.source || 'button_wifi',
        metadata: data.metadata || {}
      })
      break
    }
    case 'status': {
      await supabase.from('devices').update({
        battery_level: data.battery,
        wifi_rssi: data.rssi,
        firmware_version: data.firmware,
        last_seen_at: new Date().toISOString()
      }).eq('id', deviceId)
      break
    }
    case 'response': {
      const { data: device } = await supabase
        .from('devices').select('user_id').eq('id', deviceId).single()
      if (!device) return

      await supabase.from('quick_responses').insert({
        device_id: deviceId,
        user_id: device.user_id,
        message_id: data.in_reply_to || null,
        response: data.response,
        responded_at: new Date(data.timestamp * 1000).toISOString()
      })
      break
    }
  }
})
```

---

## 10. Arquitectura de Deploy

### Componentes y dónde viven

| Componente | Servicio | Justificación |
|-----------|---------|---------------|
| **API REST** | Supabase Edge Functions | Serverless, escala automática, cerca de la DB |
| **Base de datos** | Supabase PostgreSQL (Frankfurt) | RGPD, Realtime incluido |
| **Auth** | Supabase Auth | Integrado, JWT automático |
| **MQTT Broker** | EMQX Cloud / HiveMQ Cloud | Managed, TLS, ACLs |
| **MQTT Bridge** | Railway (worker 24/7) | Persistente, suscripción continua |
| **Cron Jobs** | pg_cron + Edge Functions | Verificación de check-ins cada minuto |
| **Dashboard Web** | Vercel (Next.js) | CDN global, SSR |
| **Landing Page** | Vercel (estático) | CDN, rápido |
| **OTA Server** | Cloudflare R2 | Almacenamiento de firmware |
| **Emails** | Resend / SendGrid | Transaccional |
| **SMS** | Twilio | Alertas + check-in SMS |

### Variables de entorno necesarias

```bash
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...REDACTED.
SUPABASE_SERVICE_ROLE_KEY=eyJ...REDACTED.

# MQTT
MQTT_BROKER_URL=mqtts://broker.dameunok.es:8883
MQTT_BRIDGE_USER=bridge_service
MQTT_BRIDGE_TOKEN=...

# WhatsApp Business API
WA_PHONE_NUMBER_ID=123456789
WA_ACCESS_TOKEN=EAAx...
WA_APP_SECRET=abc123
WA_VERIFY_TOKEN=my_verify_token

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+34900123456

# Email
RESEND_API_KEY=re_xxx
FROM_EMAIL=avisos@dameunok.es
```

---

## 11. Testing de la API

### Estrategia de tests

| Nivel | Herramienta | Cobertura |
|-------|-------------|-----------|
| **Unit** | Deno test / Vitest | Validación, lógica de negocio, helpers |
| **Integration** | Supabase local (`supabase start`) | DB + Edge Functions + RLS |
| **E2E API** | Bruno / Hoppscotch | Flujos completos con datos de seed |
| **Load** | k6 | Check-in endpoint bajo carga (objetivo: <200ms p95) |

### Colección de tests (Bruno/Postman)

```
Dame un Ok API/
├── Auth/
│   ├── Signup.bru
│   ├── Login.bru
│   ├── Magic Link.bru
│   └── Refresh Token.bru
├── Checkin/
│   ├── Do Checkin.bru
│   ├── Duplicate Checkin (409).bru
│   ├── History.bru
│   └── Today Status.bru
├── Devices/
│   ├── Register Device.bru
│   ├── List Devices.bru
│   └── Heartbeat.bru
├── Dashboard/
│   ├── Family Overview.bru
│   └── User History.bru
└── Webhooks/
    ├── WhatsApp Message.bru
    ├── Telegram Message.bru
    └── SMS Inbound.bru
```

---

*Este documento define la API completa de Dame un Ok: endpoints REST, autenticación JWT, topics MQTT para IoT, webhooks de plataformas de mensajería, rate limiting, versionado, error handling estándar y código conceptual TypeScript de los handlers principales.*
