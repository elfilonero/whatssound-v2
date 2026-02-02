# Cola de Música con Votación en Tiempo Real

## Arquitectura General

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Listeners  │────▶│  Supabase    │────▶│  Cola de        │
│  (votan)    │     │  Realtime    │     │  Canciones (DB) │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                      │
                    Broadcast ◀──── Postgres Changes (CDC)
                           │
                    ┌──────▼──────┐
                    │  Todos los  │
                    │  clientes   │
                    └─────────────┘
```

## Modelo de Datos

### Tablas
```sql
-- Sesión del DJ
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, paused, ended
  current_song_id UUID,
  current_position_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cola de canciones
CREATE TABLE queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL, -- referencia al catálogo
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  song_duration_ms INTEGER,
  added_by UUID REFERENCES auth.users(id),
  vote_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, playing, played, skipped
  position INTEGER, -- orden manual del DJ (override)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Votos individuales
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id UUID REFERENCES queue(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT DEFAULT 'up', -- up, down
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(queue_item_id, user_id) -- 1 voto por usuario por canción
);
```

### Función de Reconteo (trigger)
```sql
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE queue
  SET vote_count = (
    SELECT COUNT(*) FILTER (WHERE vote_type = 'up')
         - COUNT(*) FILTER (WHERE vote_type = 'down')
    FROM votes WHERE queue_item_id = COALESCE(NEW.queue_item_id, OLD.queue_item_id)
  )
  WHERE id = COALESCE(NEW.queue_item_id, OLD.queue_item_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_count();
```

## Flujo en Tiempo Real

### 1. Listener Vota
```
Cliente → INSERT INTO votes → Trigger actualiza queue.vote_count
                                    ↓
                          Postgres Changes detecta UPDATE en queue
                                    ↓
                          Supabase Realtime broadcast a todos
                                    ↓
                          Todos los clientes reordenan la cola UI
```

### 2. Implementación Cliente (TypeScript)
```typescript
// Suscribirse a cambios en la cola
const channel = supabase
  .channel(`session:${sessionId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'queue',
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      // Actualizar cola local
      updateQueueItem(payload.new);
      // Reordenar por vote_count DESC
      reorderQueue();
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'queue',
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      addToQueue(payload.new);
    }
  )
  .subscribe();

// Votar (optimistic update)
async function vote(queueItemId: string, type: 'up' | 'down') {
  // Optimistic: actualizar UI inmediatamente
  optimisticUpdateVote(queueItemId, type);
  
  // Persistir
  const { error } = await supabase
    .from('votes')
    .upsert({
      queue_item_id: queueItemId,
      user_id: currentUser.id,
      vote_type: type
    });
  
  if (error) rollbackOptimisticUpdate(queueItemId);
}
```

### 3. DJ Controla la Cola
```typescript
// DJ puede reordenar manualmente (override votos)
async function djReorder(queueItemId: string, newPosition: number) {
  await supabase
    .from('queue')
    .update({ position: newPosition })
    .eq('id', queueItemId);
}

// Siguiente canción: mayor vote_count (o position del DJ si existe)
async function getNextSong(sessionId: string) {
  const { data } = await supabase
    .from('queue')
    .select('*')
    .eq('session_id', sessionId)
    .eq('status', 'pending')
    .order('position', { ascending: true, nullsFirst: false })
    .order('vote_count', { ascending: false })
    .limit(1);
  
  return data?.[0];
}
```

## Patrones de Consistencia

### Conflicto: Dos usuarios votan simultáneamente
- **Solución:** UNIQUE constraint `(queue_item_id, user_id)` + UPSERT
- El trigger recalcula el conteo real desde la tabla `votes`
- No hay conflicto: cada INSERT/UPSERT es atómico en Postgres

### Conflicto: DJ reordena mientras usuarios votan
- **Solución:** `position` del DJ es override; si es NULL, se usa `vote_count`
- El ordenamiento es: `ORDER BY position ASC NULLS LAST, vote_count DESC`
- El DJ siempre gana sobre los votos (es su sesión)

### Latencia Esperada
```
Voto del usuario → UI optimista:          ~0ms (local)
Voto → DB → Trigger → CDC → Broadcast:   ~50-200ms
Todos los clientes ven actualización:     ~100-300ms total
```

## Escalabilidad

| Métrica | Valor Estimado | Estrategia |
|---------|---------------|-----------|
| Sesiones simultáneas | 100-1,000 | 1 canal Supabase por sesión |
| Listeners por sesión | 10-10,000 | Fan-out de Supabase Realtime |
| Votos por segundo | 10-1,000 | Postgres handles it, trigger atómico |
| Items en cola | 10-500 | Paginación si >100 |

Para >10K listeners por sesión, considerar:
- Aggregar votos en memoria y flush periódico a DB
- Broadcast resultado cada 2-5s en vez de por cada voto
- Rate limiting: máximo 1 voto por usuario cada 5s
