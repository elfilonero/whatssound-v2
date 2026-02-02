# 🎯 Recomendaciones WhatsSound — SUPEREXPERTO #4: DataForge

## Stack Recomendado

```
BD:          Supabase (PostgreSQL managed)
ORM:         Drizzle ORM (performance + SQL-like)
Migrations:  Drizzle Kit
Búsqueda:    PostgreSQL tsvector → Meilisearch (si escala)
Realtime:    Supabase Realtime
Auth:        Supabase Auth + RLS
```

---

## 1. Modelo de Datos Core

### Esquema principal (Drizzle):

```typescript
// users - perfil básico
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 30 }).unique().notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  isArtist: boolean('is_artist').default(false),
  walletBalance: integer('wallet_balance').default(0), // centavos
  createdAt: timestamp('created_at').defaultNow(),
});

// songs - canciones/tracks
export const songs = pgTable('songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  artistId: uuid('artist_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  audioUrl: text('audio_url').notNull(),
  coverUrl: text('cover_url'),
  duration: integer('duration'), // segundos
  genre: varchar('genre', { length: 50 }),
  playCount: integer('play_count').default(0),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  searchVector: tsvector('search_vector'), // full-text search
});

// follows - relaciones sociales
export const follows = pgTable('follows', {
  followerId: uuid('follower_id').references(() => users.id).notNull(),
  followingId: uuid('following_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  pk: primaryKey(t.followerId, t.followingId),
}));

// tips - propinas
export const tips = pgTable('tips', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id').references(() => users.id).notNull(),
  toArtistId: uuid('to_artist_id').references(() => users.id).notNull(),
  songId: uuid('song_id').references(() => songs.id),
  amount: integer('amount').notNull(), // centavos
  message: varchar('message', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// playlists
export const playlists = pgTable('playlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 2. RLS Policies (Supabase)

```sql
-- Usuarios: lectura pública, edición propia
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles públicos visibles"
  ON users FOR SELECT USING (true);

CREATE POLICY "Usuarios editan su propio perfil"
  ON users FOR UPDATE USING (auth.uid() = id);

-- Canciones: públicas visibles, artista gestiona las suyas
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Canciones públicas visibles"
  ON songs FOR SELECT USING (is_public = true);

CREATE POLICY "Artistas ven todas sus canciones"
  ON songs FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Artistas CRUD sus canciones"
  ON songs FOR ALL USING (auth.uid() = artist_id);

-- Tips: solo el emisor o receptor pueden ver
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver propinas propias"
  ON tips FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_artist_id);

CREATE POLICY "Enviar propinas autenticado"
  ON tips FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);
```

---

## 3. Índices Estratégicos

```sql
-- Búsqueda de canciones por texto
CREATE INDEX idx_songs_search ON songs USING GIN (search_vector);

-- Feed: canciones recientes de artistas seguidos
CREATE INDEX idx_songs_artist_created ON songs (artist_id, created_at DESC);
CREATE INDEX idx_follows_follower ON follows (follower_id);

-- Ranking de canciones
CREATE INDEX idx_songs_play_count ON songs (play_count DESC);

-- Propinas por artista
CREATE INDEX idx_tips_artist ON tips (to_artist_id, created_at DESC);
```

---

## 4. Full-Text Search

```sql
-- Trigger para actualizar search_vector automáticamente
CREATE OR REPLACE FUNCTION update_song_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(NEW.genre, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_song_search
  BEFORE INSERT OR UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_song_search_vector();

-- Query de búsqueda
SELECT * FROM songs
WHERE search_vector @@ plainto_tsquery('spanish', 'reggaeton nuevo')
ORDER BY ts_rank(search_vector, plainto_tsquery('spanish', 'reggaeton nuevo')) DESC;
```

---

## 5. Drizzle vs Prisma — Decisión

| Criterio | Drizzle ✅ | Prisma |
|---|---|---|
| Performance | ~2-5x más rápido | Más overhead |
| Bundle size | ~7.4KB | ~200KB+ |
| SQL control | SQL-like nativo | Abstracción |
| Serverless | Optimizado | Más lento cold start |
| Type safety | Excelente | Excelente |
| Ecosistema | Creciendo | Maduro |

**Recomendación: Drizzle ORM** para WhatsSound por rendimiento serverless y control SQL.

---

## 6. Migrations Strategy

```bash
# Generar migración desde schema changes
npx drizzle-kit generate

# Aplicar en dev
npx drizzle-kit migrate

# En CI/CD (producción)
npx drizzle-kit migrate --config=drizzle.config.prod.ts
```

**Reglas:**
- Nunca editar migraciones ya aplicadas
- Una migración por PR
- Migrations destructivas en 2 pasos (deprecar → eliminar)

---

## 7. Supabase Realtime para Chat/Notificaciones

```typescript
// Escuchar nuevas propinas en tiempo real
const channel = supabase
  .channel('tips')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'tips',
    filter: `to_artist_id=eq.${artistId}`,
  }, (payload) => {
    showNotification(`¡${payload.new.amount/100}€ de propina!`);
  })
  .subscribe();
```

---

## Prioridades de Implementación

1. **Semana 1:** Schema base (users, songs, follows) + RLS
2. **Semana 2:** Tips + playlists + índices
3. **Semana 3:** Full-text search + Realtime
4. **Semana 4:** Optimización queries + monitoring
