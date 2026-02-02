# Audio Streaming — Arquitectura para WhatsSound

## El Problema
En WhatsSound, el DJ selecciona canciones y todos los listeners deben escuchar lo mismo, aproximadamente al mismo tiempo. No es streaming P2P ni llamada de voz — es **un emisor, muchos receptores, contenido pregrabado**.

## Opciones de Transporte para Audio

### ❌ WebSockets para Audio
- **No recomendado.** WebSocket añade overhead de framing por cada chunk
- No tiene adaptive bitrate nativo
- No tiene buffering/seeking nativo
- Difícil de cachear en CDN
- Uso legítimo: señalización (qué canción, en qué posición)

### ❌ WebRTC para Audio (en este caso)
- Diseñado para P2P bidireccional (llamadas)
- Overhead innecesario: ICE, STUN/TURN, DTLS
- Útil si el DJ transmitiera desde su micrófono (futuro feature)
- No aplica para reproducir canciones pregrabadas

### ✅ HTTP Streaming (HLS / DASH)
- **Recomendado para audio pregrabado**
- CDN-friendly (cada segmento es un archivo HTTP)
- Adaptive bitrate nativo
- Amplio soporte en browsers
- Librerías: `hls.js` para HLS en browser

### ✅ Web Audio API + Fetch Streaming
- **Recomendado para máximo control**
- Fetch el archivo de audio → decode → AudioContext → play
- Permite crossfading, efectos, visualización
- Control preciso de timing para sincronización

## Arquitectura Recomendada

```
┌──────────────────────────────────────────────────────┐
│                    SERVIDOR                           │
│                                                       │
│  ┌─────────┐    ┌──────────┐    ┌──────────────┐    │
│  │ Catálogo │───▶│ Storage  │───▶│  CDN / Edge  │    │
│  │ (DB)    │    │ (S3/R2)  │    │  (Cloudflare)│    │
│  └─────────┘    └──────────┘    └──────┬───────┘    │
│                                         │            │
│  ┌─────────────────────────────────┐   │            │
│  │  Supabase Realtime              │   │            │
│  │  - Canal: session:{id}          │   │            │
│  │  - Evento: playback_sync        │   │            │
│  │    { song_url, position_ms,     │   │            │
│  │      timestamp, action }        │   │            │
│  └────────────────┬────────────────┘   │            │
└───────────────────┼────────────────────┼────────────┘
                    │ WebSocket          │ HTTP/HTTPS
                    ▼                    ▼
┌──────────────────────────────────────────────────────┐
│                    CLIENTE                             │
│                                                       │
│  ┌────────────────┐    ┌─────────────────────────┐   │
│  │ Realtime Sub   │───▶│  Audio Controller        │   │
│  │ (sync events)  │    │                          │   │
│  └────────────────┘    │  ┌───────────────────┐  │   │
│                         │  │  Web Audio API     │  │   │
│  ┌────────────────┐    │  │  - AudioContext    │  │   │
│  │ Audio Fetcher  │───▶│  │  - GainNode       │  │   │
│  │ (HTTP from CDN)│    │  │  - AnalyserNode   │  │   │
│  └────────────────┘    │  └───────────────────┘  │   │
│                         └─────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Sincronización de Reproducción

### Modelo: DJ como Fuente de Verdad
```typescript
// El DJ emite heartbeats de posición
interface PlaybackSync {
  action: 'play' | 'pause' | 'seek' | 'next' | 'stop';
  song_id: string;
  song_url: string;        // URL del CDN
  position_ms: number;     // posición actual
  timestamp: number;       // Date.now() del DJ
  duration_ms: number;
}
```

### Protocolo de Sync
```
1. DJ inicia canción:
   Broadcast: { action: 'play', song_url: '...', position_ms: 0, timestamp: now }

2. Listener recibe evento:
   - Calcula latencia: latency = Date.now() - event.timestamp
   - Posición ajustada: adjusted_pos = event.position_ms + latency
   - Inicia reproducción en adjusted_pos

3. Heartbeat cada 10s (DJ → todos):
   Broadcast: { action: 'sync', position_ms: current, timestamp: now }

4. Listener ajusta drift:
   - Si |expected_pos - actual_pos| > 500ms → seek
   - Si |drift| < 500ms → gradual rate adjustment (playbackRate 1.01 o 0.99)

5. DJ pausa/salta:
   Broadcast: { action: 'pause' | 'next', ... }
```

### Implementación Web Audio API
```typescript
class AudioPlayer {
  private ctx: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private buffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private offset: number = 0;

  constructor() {
    this.ctx = new AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
  }

  async loadSong(url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  play(offsetMs: number = 0): void {
    if (!this.buffer) return;
    this.stop();
    
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    
    this.offset = offsetMs / 1000;
    this.startTime = this.ctx.currentTime;
    this.source.start(0, this.offset);
  }

  get currentPositionMs(): number {
    return (this.offset + (this.ctx.currentTime - this.startTime)) * 1000;
  }

  seekTo(positionMs: number): void {
    this.play(positionMs);
  }

  // Crossfade a siguiente canción
  async crossfadeTo(nextUrl: string, durationMs: number = 3000): Promise<void> {
    const nextBuffer = await this.loadBuffer(nextUrl);
    const nextSource = this.ctx.createBufferSource();
    const nextGain = this.ctx.createGain();
    
    nextSource.buffer = nextBuffer;
    nextSource.connect(nextGain);
    nextGain.connect(this.ctx.destination);
    
    // Fade out actual, fade in siguiente
    const now = this.ctx.currentTime;
    const duration = durationMs / 1000;
    
    this.gainNode.gain.setValueAtTime(1, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    nextGain.gain.setValueAtTime(0, now);
    nextGain.gain.linearRampToValueAtTime(1, now + duration);
    
    nextSource.start(0);
  }

  stop(): void {
    this.source?.stop();
    this.source = null;
  }
}
```

## Latencia y Buffering

### Presupuesto de Latencia
```
Acción del DJ → Broadcast WS:           ~10-50ms
Red WS → Cliente:                        ~20-100ms
Fetch audio chunk (si no cacheado):      ~100-500ms
Decode + buffer → playback:              ~10-50ms
─────────────────────────────────────────────────
Total primera reproducción:              ~150-700ms
Sincronización steady-state:             ~50-200ms
```

### Estrategias de Buffering
1. **Prefetch:** Descargar siguiente canción de la cola mientras suena la actual
2. **Progressive loading:** Para canciones largas, usar `fetch` con streaming + `decodeAudioData` por chunks
3. **Cache local:** Service Worker cache de canciones ya escuchadas
4. **Adaptive quality:** 128kbps en 3G, 256kbps en WiFi

### Formatos Recomendados
| Formato | Bitrate | Soporte Browser | Uso |
|---------|---------|----------------|-----|
| AAC (.m4a) | 128-256 kbps | Universal | Default |
| OGG Vorbis | 128-320 kbps | Chrome, Firefox | Alternativa libre |
| MP3 | 128-320 kbps | Universal | Legacy fallback |
| Opus | 64-128 kbps | Moderno | Mejor calidad/tamaño |

**Recomendación:** Servir **AAC 128kbps** por defecto, **Opus 128kbps** para browsers modernos (menor tamaño, mejor calidad).
