# Arquitectura Discord & Spotify — Lecciones para WhatsSound

## Discord: Escalando a Millones de Conexiones

### Fuente: "How Discord Scaled Elixir to 5,000,000 Concurrent Users"

#### Arquitectura Core
Discord eligió **Elixir/Erlang VM** desde el inicio por:
- Concurrencia masiva (millones de procesos livianos)
- Tolerancia a fallos (supervisor trees)
- Distribución nativa entre nodos

#### Modelo Pub/Sub
> "Most of it boils down to pub/sub. Users connect to a WebSocket and spin up a session process (GenServer), which then communicates with remote Erlang nodes that contain guild processes."

```
Usuario → WebSocket → Session (GenServer) → Guild (GenServer) → Fan-out a sessions
```

- Cada usuario = 1 proceso GenServer (session)
- Cada guild/server = 1 proceso GenServer
- Publicar evento = fan-out a todos los sessions conectados

#### Problema del Fan-out a Escala
Con guilds de 30,000 usuarios concurrentes:
- `send/2` en Erlang: 30-70μs por envío
- Fan-out a 30K: **900ms - 2.1s** por evento
- Los procesos no podían vaciar su message queue

#### Solución: Manifold
Discord creó **Manifold** (open source):
1. Agrupa PIDs por nodo remoto
2. Envía a `Manifold.Partitioner` en cada nodo
3. Partitioner hace consistent hash → distribuye a workers por core
4. Workers envían a los procesos finales

**Resultado:**
- CPU distribuida entre nodos
- Tráfico de red reducido (1 mensaje por nodo, no por PID)
- Linearizabilidad mantenida

#### Fast Shared Data: ETS
- 500K sessions por nodo → millones de lookups al ring de consistent hashing
- Solución: **ETS (Erlang Term Storage)** — tabla en memoria compartida, sin serialización
- Lectura directa desde cualquier proceso sin pasar por GenServer

### Fuente: "How Discord Stores Trillions of Messages" (2023)

#### Evolución del Storage
```
MongoDB (2015) → Cassandra (2017) → ScyllaDB (2022+)
```

#### Problemas con Cassandra a escala:
- **Hot partitions:** Un canal popular sobrecarga el nodo que lo sirve
- **Cascading latency:** Queries a nodos con hot partition afectan todo el cluster
- **Compaction backlog:** SSTables sin compactar → reads más caros
- **GC pauses:** JVM garbage collector causaba spikes de latencia

#### Data Services (Rust)
Discord añadió una capa intermedia en **Rust + Tokio**:
- Controla concurrencia a hot partitions
- Rate limiting por canal
- Protege la DB de ser sobrecargada
- Rust: velocidad de C/C++ + safety + fearless concurrency

#### Modelo de Datos para Mensajes
```sql
PRIMARY KEY ((channel_id, bucket), message_id)
-- partition key: (channel_id, bucket) → datos co-localizados
-- clustering key: message_id (Snowflake, cronológico)
```
- Bucket = ventana temporal estática
- Permite range scans eficientes por canal

### Lecciones para WhatsSound
1. **Pub/sub por sesión:** Cada sesión de DJ = un "guild" con fan-out
2. **No escalar con send individual:** Si una sesión tiene 10K+ listeners, necesitas fan-out distribuido
3. **Supabase Realtime = Phoenix Channels:** Ya implementa el modelo Elixir de Discord
4. **Partición de mensajes:** chat por sesión_id como partition key
5. **Data services pattern:** Si crece, capa de protección entre API y DB

---

## Spotify: Streaming y Sincronización de Audio

### Arquitectura de Streaming
Spotify usa un modelo de **streaming adaptativo**:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Catálogo │───▶│   CDN /  │───▶│  Client  │───▶│  Audio   │
│  Service  │    │   Edge   │    │  Buffer  │    │  Output  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │
                               Adaptive Bitrate
                               (OGG Vorbis / AAC)
```

#### Características clave:
- **Formato:** OGG Vorbis (free/premium), AAC (móvil)
- **Adaptive bitrate:** Cambia calidad según ancho de banda
- **Prefetch:** Pre-descarga siguiente canción antes de que termine la actual
- **Gapless playback:** Crossfade entre canciones sin silencio
- **Offline cache:** Descarga anticipada para reproducción sin red

### Spotify Connect: Sincronización Cross-Device
Spotify Connect permite controlar reproducción entre dispositivos:

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  Phone   │──cmd──▶│  Spotify     │──sync──▶│  Speaker  │
│ (control)│        │  Cloud       │         │ (playback)│
└──────────┘         └──────────────┘         └──────────┘
```

- **Modelo:** El cloud es la fuente de verdad del estado
- **Sincronización:** Cada dispositivo reporta posición de reproducción
- **Transferencia:** El cloud orquesta transferir playback entre devices
- **Latencia aceptable:** ~500ms-2s para transfer (no es live)

### Lecciones para WhatsSound
1. **DJ como fuente de verdad:** El dispositivo del DJ define qué suena y en qué posición
2. **No sincronizar sample-by-sample:** Usar timestamp + offset es suficiente
3. **Prefetch:** Pre-cargar siguiente canción de la cola mientras suena la actual
4. **Adaptive bitrate:** Servir calidad según conexión del listener
5. **HTTP para audio, WS para señalización:** Spotify no usa WebSocket para el audio

---

## Comparativa Aplicada a WhatsSound

| Aspecto | Discord | Spotify | WhatsSound |
|---------|---------|---------|------------|
| **Conexiones** | 5M+ concurrentes | 100M+ MAU | 1K-100K target |
| **Transporte chat** | WebSocket (Elixir) | N/A | Supabase Broadcast |
| **Fan-out** | Manifold (Erlang) | N/A | Supabase Channels |
| **Audio** | WebRTC (voice) | HTTP adaptive | HTTP + Web Audio |
| **Storage mensajes** | ScyllaDB | N/A | Supabase Postgres |
| **Sincronización** | Eventos por guild | Cloud como verdad | DJ timestamp broadcast |
| **Lenguaje server** | Elixir + Rust | Java + Python | Supabase (Elixir under hood) |
