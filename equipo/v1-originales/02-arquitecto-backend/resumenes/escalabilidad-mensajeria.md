# 📡 Escalabilidad y Arquitectura de Mensajería

## El Reto WhatsSound
No es un chat 1:1 como WhatsApp. Es un **chat grupal en tiempo real** con:
- Cientos/miles de usuarios en una sesión DJ simultáneamente
- Mensajes de chat + votos + propinas + cambios de cola — todo en tiempo real
- Baja latencia crítica (la música no espera)

## Referentes de Arquitectura

### WhatsApp (Erlang/BEAM)
- 2 millones de conexiones por servidor usando Erlang
- Protocolo XMPP modificado
- **Lección para WhatsSound:** Erlang/BEAM es el gold standard para concurrencia masiva
- **Conexión:** Supabase Realtime usa **Elixir** (que corre sobre BEAM, misma VM que Erlang)
- Fuente: https://www.wired.com/2015/09/whatsapp-serves-900-million-users-50-engineers/

### Discord (Elixir + Rust)
- Millones de conexiones simultáneas
- Migró de Cassandra a ScyllaDB para mensajes
- Usa Elixir para el gateway WebSocket
- **Lección:** Elixir/BEAM escala horizontalmente para WebSockets
- Fuente: https://discord.com/blog/how-discord-stores-trillions-of-messages

### Supabase Realtime (Elixir/Phoenix)
- Built on Phoenix Channels (WebSocket multiplexing)
- Escucha PostgreSQL WAL (Write-Ahead Log) via logical replication
- Tres primitivas:
  1. **Broadcast** — pub/sub entre clientes (no toca DB)
  2. **Presence** — estado compartido (quién está online)
  3. **Postgres Changes** — escucha INSERTs/UPDATEs en tablas
- **Repo:** https://github.com/supabase/realtime

## Arquitectura Propuesta para WhatsSound

### Canal Realtime por Sesión DJ
```typescript
// Cada sesión DJ = 1 canal con 3 sub-canales
const session = supabase.channel(`session:${sessionId}`)

// 1. Chat messages (Broadcast - sin persistir en DB para velocidad)
session.on('broadcast', { event: 'chat' }, (payload) => {
  addMessageToUI(payload.message)
})

// 2. Presence (quién está en la sesión)
session.on('presence', { event: 'sync' }, () => {
  const state = session.presenceState()
  updateParticipantCount(Object.keys(state).length)
})

// 3. DB Changes (votos, cola, propinas - persisten)
session.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'votes',
  filter: `session_id=eq.${sessionId}`
}, (payload) => {
  updateVoteCount(payload.new)
})

session.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await session.track({ user_id: userId, username })
  }
})
```

### Estrategia de Persistencia Híbrida

| Dato | Persistencia | Canal Realtime | Razón |
|------|-------------|---------------|-------|
| Chat messages | PostgreSQL (async batch) | Broadcast | Velocidad > durabilidad para chat |
| Votos | PostgreSQL (inmediato) | Postgres Changes | Integridad de datos crítica |
| Propinas | PostgreSQL (inmediato) | Postgres Changes | Financiero, debe persistir |
| Cola de canciones | PostgreSQL (inmediato) | Postgres Changes | Estado compartido autoritativo |
| Presencia | In-memory (Presence) | Presence | Efímero por naturaleza |
| Typing indicators | Ninguna | Broadcast | Totalmente efímero |

### Optimizaciones de Escala

#### 1. Batch Inserts para Chat
```sql
-- En vez de 1 INSERT por mensaje, batch cada 500ms
INSERT INTO messages (session_id, user_id, content, created_at)
VALUES 
  ($1, $2, $3, now()),
  ($1, $4, $5, now()),
  ($1, $6, $7, now());
```

#### 2. Particionamiento de Mensajes
```sql
-- Particionar por mes para queries rápidas
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  content text,
  created_at timestamptz DEFAULT now()
) PARTITION BY RANGE (created_at);

CREATE TABLE messages_2025_01 PARTITION OF messages
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### 3. Índices Estratégicos
```sql
-- Índice para cargar mensajes de una sesión (query más frecuente)
CREATE INDEX idx_messages_session_created 
  ON messages (session_id, created_at DESC);

-- Índice para votos en tiempo real
CREATE INDEX idx_votes_session_song 
  ON votes (session_id, song_id);

-- Índice para leaderboard de DJs
CREATE INDEX idx_tips_dj_amount 
  ON tips (dj_id, amount DESC);
```

#### 4. Connection Pooling
```
Supabase usa PgBouncer por defecto:
- Transaction mode para Edge Functions
- Session mode para Realtime
- Pool size configurable por plan
```

### Límites y Números

| Métrica | Supabase Free | Supabase Pro ($25/mo) | Supabase Team ($599/mo) |
|---------|--------------|----------------------|------------------------|
| DB Size | 500MB | 8GB | 16GB |
| Realtime messages | 2M/mo | 5M/mo | 10M/mo |
| Concurrent connections | 200 | 500 | 1000+ |
| Edge Function invocations | 500K/mo | 2M/mo | 5M/mo |
| Bandwidth | 5GB | 250GB | 500GB |

**Para WhatsSound MVP:** Pro plan ($25/mo) soporta ~5M mensajes realtime/mes = ~166K mensajes/día. Suficiente para miles de sesiones.

### Plan de Escalado

```
Fase 1 (0-10K users):  Supabase Pro ($25/mo)
Fase 2 (10K-100K):     Supabase Team ($599/mo) + CDN para audio
Fase 3 (100K-1M):      Supabase Enterprise o self-host + Cloudflare Workers
Fase 4 (1M+):          Custom Elixir cluster + PostgreSQL dedicado
```

## Serverless vs Server para Realtime

### Veredicto: **Managed Realtime (Supabase) + Edge Functions** ✅

| Approach | Pros | Contras |
|----------|------|---------|
| **Supabase Realtime (managed)** | Zero ops, escala auto, Elixir/BEAM | Límites en free/pro |
| **Custom WebSocket server** | Control total | Hay que mantener, escalar, monitoring |
| **AWS Lambda + API Gateway WS** | Serverless puro | Cold starts (100-500ms), caro a escala |
| **Cloudflare Durable Objects** | Edge, baja latencia | API inmadura, vendor lock-in |

**Kelsey Hightower's rule:** "Use managed services until you can't."
Para WhatsSound, Supabase Realtime cubre hasta 100K+ usuarios. No reinventar la rueda.

## Fuentes
- https://supabase.com/docs/guides/realtime
- https://github.com/supabase/realtime
- https://discord.com/blog/how-discord-stores-trillions-of-messages
- https://www.wired.com/2015/09/whatsapp-serves-900-million-users-50-engineers/
- Kelsey Hightower: https://github.com/kelseyhightower/kubernetes-the-hard-way
