# 🎯 Recomendaciones Finales — Realtime & Streaming para WhatsSound

## Arquitectura Completa Recomendada

```
┌─────────────────────────────────────────────────────────────┐
│                      WhatsSound Realtime                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Supabase Realtime                       │   │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │   │
│  │  │ Broadcast  │ │ Presence   │ │ Postgres Changes │  │   │
│  │  │            │ │            │ │                  │  │   │
│  │  │ • Chat     │ │ • Quién    │ │ • Votos         │  │   │
│  │  │ • DJ sync  │ │   está     │ │ • Cola cambios  │  │   │
│  │  │ • Reactions│ │ • Estado   │ │ • Sesión estado │  │   │
│  │  └────────────┘ └────────────┘ └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Audio Pipeline                          │   │
│  │  Storage (R2/S3) → CDN (Cloudflare) → Web Audio API  │   │
│  │  • HTTP fetch de audio files                          │   │
│  │  • Crossfade entre canciones                          │   │
│  │  • Visualización con AnalyserNode                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Decisiones Clave

### 1. Supabase Realtime como ÚNICO backend realtime
**Por qué:** Ya viene con el stack, es Phoenix/Elixir bajo el capó (mismo tech que Discord), incluye Broadcast + Presence + CDC. No añadir Socket.io, Ably ni Pusher.

### 2. Canales por Sesión
```
session:{session_id}         → Chat, sync, reacciones
session:{session_id}:queue   → Cambios en cola (Postgres Changes)
session:{session_id}:votes   → Resultados de votación
```

### 3. HTTP para Audio, WebSocket para Todo lo Demás
- Audio: fetch desde CDN → Web Audio API
- Chat, votos, sync, presencia: Supabase Realtime (WebSocket)

### 4. DJ como Fuente de Verdad de Reproducción
- DJ emite eventos de playback (play, pause, seek, next)
- Listeners sincronizan posición con heartbeat cada 10s
- Tolerancia de drift: ±500ms antes de forzar seek

### 5. Optimistic Updates para Votación
- Actualizar UI inmediatamente al votar
- Rollback si el server rechaza
- Postgres trigger recalcula conteo real

## Implementación por Fases

### Fase 1: MVP (Semana 1-2)
- [ ] Chat en vivo con Supabase Broadcast
- [ ] Presence básica (quién está en la sesión)
- [ ] Audio playback con Web Audio API (una canción)
- [ ] Cola estática (DJ la define, sin votos)

### Fase 2: Interactividad (Semana 3-4)
- [ ] Votación de canciones (tabla votes + trigger + CDC)
- [ ] Cola dinámica ordenada por votos
- [ ] Sincronización de playback (DJ heartbeat)
- [ ] Reacciones en vivo (emoji burst)

### Fase 3: Pulido (Semana 5-6)
- [ ] Crossfade entre canciones
- [ ] Prefetch de siguiente canción
- [ ] Visualización de audio (AnalyserNode)
- [ ] Reconexión automática y estado stale recovery
- [ ] Rate limiting en votos

### Fase 4: Escala (Cuando sea necesario)
- [ ] CDN para audio files
- [ ] Agregación de votos (batch cada 2s vs real-time)
- [ ] Métricas: latencia p95, conexiones activas, mensajes/s
- [ ] Fallback SSE para clientes con WS bloqueado

## Métricas a Monitorear

| Métrica | Target | Alerta |
|---------|--------|--------|
| Latencia chat (p95) | <200ms | >500ms |
| Latencia sync playback | <300ms | >1s |
| Conexiones WS activas | tracking | >80% de límite Supabase |
| Mensajes/segundo | tracking | >1000/s por canal |
| Reconexiones/minuto | <5% usuarios | >10% |
| Audio buffer underruns | 0 | >0 |

## Errores a Evitar

1. **NO usar WebSocket para streaming de audio** — usa HTTP/CDN
2. **NO sincronizar sample-by-sample** — timestamp + offset es suficiente
3. **NO crear un canal por usuario** — un canal por sesión, fan-out nativo
4. **NO guardar mensajes de chat para siempre en v1** — TTL de 30 días
5. **NO implementar tu propio pub/sub** — Supabase Realtime ya lo hace
6. **NO hacer polling para votos** — usa Postgres Changes (CDC)
7. **NO olvidar reconexión** — Supabase client reconecta automáticamente, pero manejar estado stale al reconectar

## Stack Técnico Final

```
Backend:          Supabase (Postgres + Realtime + Auth + Storage)
Realtime:         Supabase Realtime (Broadcast + Presence + Postgres Changes)
Audio storage:    Supabase Storage → Cloudflare R2/CDN
Audio playback:   Web Audio API (AudioContext, GainNode, AnalyserNode)
Frontend:         React/Next.js + @supabase/supabase-js
Formato audio:    AAC 128kbps (default) / Opus 128kbps (moderno)
Sync protocol:    DJ heartbeat via Broadcast cada 10s
```

## Fuentes que Respaldan Estas Decisiones

- Discord escaló Elixir (misma tech que Supabase Realtime) a 5M usuarios concurrentes
- Discord usa pub/sub con fan-out por "guild" = nuestro fan-out por "sesión"
- Spotify usa HTTP para audio + servicio cloud para sincronización = nuestro CDN + Broadcast
- Socket.io demostró que fallback HTTP→WS es importante = Supabase ya lo implementa
- Web Audio API de MDN confirma: scheduling preciso, baja latencia, crossfading nativo
