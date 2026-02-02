# 📚 Catálogo de Fuentes — Experto Realtime & Streaming

## 1. Discord Engineering Blog

### "How Discord Stores Trillions of Messages" (2023)
- **URL:** https://discord.com/blog/how-discord-stores-trillions-of-messages
- **Autor:** Bo Ingram
- **Contenido clave:** Migración de Cassandra a ScyllaDB, problemas de hot partitions, data services en Rust con Tokio, concurrencia controlada
- **Relevancia WhatsSound:** Patrones de almacenamiento de mensajes de chat a escala, uso de Snowflake IDs cronológicos

### "How Discord Stores Billions of Messages" (2017)
- **URL:** https://discord.com/blog/how-discord-stores-billions-of-messages
- **Contenido clave:** Migración MongoDB → Cassandra, modelado KKV (partition key + clustering key), patrones de lectura aleatorio, channel_id como partition key
- **Relevancia WhatsSound:** Modelo de datos para mensajes de chat por sesión/room

### "How Discord Scaled Elixir to 5,000,000 Concurrent Users"
- **URL:** https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users
- **Contenido clave:** 
  - Pub/sub con GenServers en Erlang/Elixir
  - Problema de fan-out: publicar en guild de 30K usuarios → 900ms-2.1s
  - Solución: **Manifold** — distribución de envío por nodo remoto + consistent hashing
  - Fast shared data con ETS (Erlang Term Storage)
  - 500K sesiones por nodo Erlang VM
- **Relevancia WhatsSound:** Arquitectura pub/sub para sesiones de DJ con miles de listeners

## 2. Supabase Realtime (Documentación Oficial)

### Realtime Overview
- **URL:** https://supabase.com/docs/guides/realtime
- **Features:** Broadcast (mensajes low-latency), Presence (tracking de usuarios), Postgres Changes (CDC)
- **Relevancia WhatsSound:** Stack principal recomendado para chat + presencia + votación

### Broadcast
- **URL:** https://supabase.com/docs/guides/realtime/broadcast
- **Contenido clave:** Envío vía client libs (WebSocket), REST API, o Database (realtime.send()), canales/topics, self-send configurable
- **Relevancia WhatsSound:** Chat en vivo, notificaciones de sesión, eventos de votación

### Presence
- **URL:** https://supabase.com/docs/guides/realtime/presence
- **Relevancia WhatsSound:** Quién está en la sesión, estado del DJ, listeners activos

### Postgres Changes
- **URL:** https://supabase.com/docs/guides/realtime/postgres-changes
- **Relevancia WhatsSound:** Cambios en cola de canciones, resultados de votación en tiempo real

## 3. Socket.io

### "How it Works" (Documentación v4)
- **URL:** https://socket.io/docs/v4/how-it-works/
- **Contenido clave:**
  - Engine.IO como capa de transporte (long-polling → WebSocket upgrade)
  - Handshake con sid, pingInterval, pingTimeout
  - Disconnection detection vía heartbeat
  - Fallback automático: primero HTTP long-polling, luego upgrade a WS
- **Relevancia WhatsSound:** Referencia de diseño para fallback, aunque Supabase Realtime es preferido

## 4. Web Audio API (MDN)
- **URL:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Contenido clave:** Audio context, nodos de audio (source → effects → destination), scheduling preciso, baja latencia
- **Relevancia WhatsSound:** Reproducción de audio en el cliente, efectos, crossfading entre canciones

## 5. Spotify Engineering Blog
- **URL base:** https://engineering.atspotify.com/
- **Posts relevantes:**
  - Fleet Management series (2023) — microservicio por componente, miles de servicios
  - Spotify Connect architecture — sincronización cross-device
- **Relevancia WhatsSound:** Modelo de streaming adaptativo, sync entre dispositivos

## 6. Martin Kleppmann — CRDTs y Sistemas Distribuidos
- **Libro:** "Designing Data-Intensive Applications" (O'Reilly, 2017)
- **Papers:** 
  - "A Conflict-Free Replicated JSON Datatype" (2017)
  - "Making CRDTs Byzantine Fault Tolerant" (2022)
- **URL:** https://martin.kleppmann.com/
- **Relevancia WhatsSound:** Resolución de conflictos en votación concurrente, estado de cola compartida

## 7. Ably — Pub/Sub Distribuido
- **URL:** https://ably.com/topic/websockets-vs-sse
- **Contenido:** Comparativas WebSockets vs SSE, arquitectura pub/sub global
- **Relevancia WhatsSound:** Referencia para decisiones de protocolo

## 8. Recursos Adicionales

| Recurso | URL | Tema |
|---------|-----|------|
| WebRTC API (MDN) | https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API | P2P audio/video |
| Phoenix Channels | https://hexdocs.pm/phoenix/channels.html | Modelo de canales Elixir |
| Pusher Docs | https://pusher.com/docs/ | Pub/sub managed |
| PubNub Docs | https://www.pubnub.com/docs/ | Global pub/sub |
| Twitch Engineering Blog | https://blog.twitch.tv/en/tags/engineering/ | Streaming a escala |
| HLS.js | https://github.com/video-dev/hls.js/ | HTTP Live Streaming en browser |
| MediaSource Extensions | https://developer.mozilla.org/en-US/docs/Web/API/MediaSource | Streaming programático |

## Verificación
- ✅ URLs verificadas y contenido extraído: Discord (3 posts), Supabase (2 docs), Socket.io, MDN Web Audio
- ⚠️ URLs no accesibles durante investigación: Ably comparativa (404), algunos Spotify Engineering posts (404)
- 📅 Fecha de investigación: Enero 2026
