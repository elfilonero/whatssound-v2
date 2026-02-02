# WebSockets vs SSE vs WebRTC — Comparativa para WhatsSound

## Resumen Ejecutivo
Para una app de sesiones musicales con chat + votación + audio, **WebSockets es el protocolo principal** (bidireccional, bajo overhead). SSE como fallback para clientes limitados. WebRTC solo si se necesita audio P2P entre usuarios.

---

## Comparativa Técnica

| Criterio | WebSockets | SSE (Server-Sent Events) | WebRTC |
|----------|-----------|--------------------------|--------|
| **Dirección** | Bidireccional | Server → Client only | Bidireccional P2P |
| **Protocolo** | ws:// / wss:// | HTTP/1.1 o HTTP/2 | UDP (SRTP/SCTP) |
| **Latencia** | ~1-5ms (misma región) | ~5-50ms | <1ms (P2P directo) |
| **Reconexión** | Manual (o lib) | Automática (EventSource) | Compleja (ICE restart) |
| **Escalabilidad servidor** | Alta con load balancers | Muy alta (stateless) | Baja (señalización) |
| **Binario** | Sí (frames binarios) | No (texto UTF-8) | Sí |
| **Firewall/proxy** | Puede ser bloqueado | Pasa siempre (HTTP) | Frecuentemente bloqueado |
| **Multiplexación** | No nativo | Sí con HTTP/2 | Múltiples canales |
| **Browser support** | Universal | Universal excepto IE | Universal moderno |

## Análisis por Feature de WhatsSound

### 💬 Chat en Vivo
- **Recomendado: WebSockets** (Supabase Broadcast)
- Bidireccional necesario (enviar + recibir mensajes)
- Supabase Realtime ya usa WebSocket bajo el capó
- Fallback: SSE para recibir + POST HTTP para enviar

### 🗳️ Votación en Tiempo Real
- **Recomendado: WebSockets** (Supabase Postgres Changes)
- Voto: INSERT en tabla → Postgres Changes notifica a todos
- Actualización optimista en cliente, confirmación vía WS
- Alternativa: Supabase Broadcast para resultados parciales

### 🎵 Audio Streaming
- **Recomendado: HTTP streaming (HLS/DASH) + Web Audio API**
- NO usar WebSockets para audio (overhead de framing, no optimizado)
- NO usar WebRTC salvo que usuarios transmitan audio propio
- El DJ selecciona canción → servidor sirve stream → todos reciben vía HTTP
- Web Audio API para playback, crossfading, efectos

### 👥 Presencia (quién está en la sesión)
- **Recomendado: WebSockets** (Supabase Presence)
- Track automático de joins/leaves
- Estado custom: "escuchando", "votando", "DJ activo"

### 🔄 Sincronización de reproducción
- **Recomendado: WebSockets para señalización + HTTP para audio**
- DJ envía timestamp de reproducción vía Broadcast
- Clientes ajustan posición con Web Audio API currentTime
- Heartbeat cada 5-10s para resincronización

## Socket.io: Lecciones de Diseño (Fuente Real)

De la documentación oficial de Socket.io v4:
- **Engine.IO** es la capa de transporte que maneja:
  - Fallback automático: HTTP long-polling primero → upgrade a WebSocket
  - Handshake con `sid`, `pingInterval` (25s), `pingTimeout` (20s)
  - Heartbeat bidireccional para detección de desconexión
- **¿Por qué long-polling primero?** Porque en redes corporativas, proxies bloquean WebSocket. Empezar con HTTP garantiza conexión inmediata, luego upgrade transparente.
- **Relevancia:** Supabase Realtime ya implementa esto internamente con Phoenix Channels

## Supabase Realtime: Stack Nativo (Fuente Real)

De la documentación oficial:
```
┌─────────────────────────────────────────┐
│           Supabase Realtime             │
├─────────────┬─────────────┬─────────────┤
│  Broadcast  │  Presence   │  Postgres   │
│             │             │  Changes    │
├─────────────┴─────────────┴─────────────┤
│         Phoenix Channels (Elixir)       │
├─────────────────────────────────────────┤
│           WebSocket Transport           │
└─────────────────────────────────────────┘
```

- **Broadcast:** Mensajes low-latency entre clientes. Envío vía WS, REST API, o directo desde DB (`realtime.send()`)
- **Presence:** Tracking de estado de usuario. Ideal para "quién está en la sesión"
- **Postgres Changes:** CDC (Change Data Capture) sobre tablas. INSERT en `votes` → broadcast automático

## Decisión para WhatsSound

```
Feature          → Protocolo        → Implementación
─────────────────────────────────────────────────────
Chat             → WebSocket        → Supabase Broadcast
Votación         → WebSocket        → Supabase Postgres Changes
Presencia        → WebSocket        → Supabase Presence  
Audio stream     → HTTP (HLS)       → CDN/Edge + Web Audio API
Sync playback    → WebSocket        → Supabase Broadcast (heartbeat DJ)
Fallback chat    → SSE              → Edge function SSE endpoint
```

**No usar WebRTC** salvo feature futuro de "usuarios cantan al DJ" (karaoke mode).
