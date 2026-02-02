# 🎯 Recomendaciones Backend para WhatsSound

## Decisiones Arquitectónicas Finales

### 1. Stack Definitivo

```
BACKEND STACK WHATSSOUND
========================
Database:       Supabase PostgreSQL (managed)
Auth:           Supabase Auth (Phone OTP + Apple + Google)
Realtime:       Supabase Realtime (Broadcast + Presence + Postgres Changes)
Storage:        Supabase Storage (avatares, audio covers)
API:            PostgREST auto-generated + Edge Functions (Deno)
Payments:       RevenueCat (suscripciones) + Stripe Connect (propinas)
Push:           Expo Push Notifications via Edge Function
Audio CDN:      Cloudflare R2 (si Supabase Storage no basta)
Monitoring:     Supabase Dashboard + Sentry + Logflare
```

### 2. Schema PostgreSQL (Core Tables)

```sql
-- Usuarios
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  is_dj boolean DEFAULT false,
  stripe_account_id text,        -- Stripe Connect para DJs
  rc_customer_id text,           -- RevenueCat
  plan text DEFAULT 'free',      -- free | premium | dj_pro
  created_at timestamptz DEFAULT now()
);

-- Sesiones DJ
CREATE TABLE dj_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id uuid REFERENCES users(id) NOT NULL,
  title text NOT NULL,
  description text,
  cover_url text,
  genre text[],
  status text DEFAULT 'scheduled', -- scheduled | live | ended
  max_participants int DEFAULT 1000,
  voting_enabled boolean DEFAULT true,
  tips_enabled boolean DEFAULT true,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Participantes de sesión
CREATE TABLE session_participants (
  session_id uuid REFERENCES dj_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);

-- Mensajes de chat
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES dj_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  content text NOT NULL,
  type text DEFAULT 'text', -- text | system | tip_notification
  created_at timestamptz DEFAULT now()
);

-- Cola de canciones
CREATE TABLE song_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES dj_sessions(id) ON DELETE CASCADE,
  title text NOT NULL,
  artist text,
  album_art_url text,
  audio_url text,
  duration_ms int,
  position int NOT NULL,
  status text DEFAULT 'queued', -- queued | playing | played | skipped
  added_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Votos
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES dj_sessions(id) ON DELETE CASCADE,
  song_id uuid REFERENCES song_queue(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  vote_type text DEFAULT 'up', -- up | down
  created_at timestamptz DEFAULT now(),
  UNIQUE (song_id, user_id) -- 1 voto por usuario por canción
);

-- Propinas
CREATE TABLE tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES dj_sessions(id),
  tipper_id uuid REFERENCES users(id),
  dj_id uuid REFERENCES users(id),
  amount_cents int NOT NULL,
  currency text DEFAULT 'eur',
  stripe_payment_id text,
  status text DEFAULT 'pending', -- pending | completed | failed
  created_at timestamptz DEFAULT now()
);

-- Índices clave
CREATE INDEX idx_messages_session ON messages(session_id, created_at DESC);
CREATE INDEX idx_queue_session ON song_queue(session_id, position);
CREATE INDEX idx_votes_song ON votes(song_id);
CREATE INDEX idx_sessions_status ON dj_sessions(status) WHERE status = 'live';
CREATE INDEX idx_tips_dj ON tips(dj_id, created_at DESC);
```

### 3. RLS Policies Esenciales

```sql
-- Cualquiera puede ver sesiones live
CREATE POLICY "public sessions" ON dj_sessions
  FOR SELECT USING (status = 'live' OR status = 'scheduled');

-- Solo el DJ modifica su sesión
CREATE POLICY "dj owns session" ON dj_sessions
  FOR UPDATE USING (dj_id = auth.uid());

-- Mensajes visibles si participas
CREATE POLICY "participant sees messages" ON messages
  FOR SELECT USING (
    session_id IN (SELECT session_id FROM session_participants WHERE user_id = auth.uid())
  );

-- Autenticados pueden enviar mensajes
CREATE POLICY "auth sends messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 1 voto por canción por usuario (el UNIQUE constraint ayuda)
CREATE POLICY "auth votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Edge Functions Necesarias

| Function | Trigger | Responsabilidad |
|----------|---------|----------------|
| `stripe-webhook` | POST from Stripe | Procesar pagos de propinas, actualizar tabla tips |
| `revenuecat-webhook` | POST from RevenueCat | Actualizar plan del usuario |
| `create-tip` | Client call | Crear Stripe PaymentIntent para propina |
| `dj-connect` | Client call | Onboarding Stripe Connect para DJs |
| `send-push` | DB trigger (via pg_net) | Enviar push notification via Expo |
| `session-cleanup` | Cron (pg_cron) | Cerrar sesiones abandonadas > 4h |

### 5. Roadmap de Implementación

```
Semana 1-2: Auth + Schema + RLS
  ✅ Setup Supabase project
  ✅ Schema PostgreSQL completo
  ✅ RLS policies
  ✅ Auth (Phone OTP + Apple + Google)
  ✅ Generar tipos TypeScript

Semana 3-4: Realtime + Chat
  ✅ Canales por sesión DJ
  ✅ Broadcast para chat
  ✅ Presence para participantes
  ✅ Postgres Changes para votos/cola

Semana 5-6: Pagos
  ✅ RevenueCat setup (iOS + Android)
  ✅ Stripe Connect para DJs
  ✅ Edge Function propinas
  ✅ Webhooks

Semana 7-8: Optimización + Monitoring
  ✅ Índices y query optimization
  ✅ Sentry error tracking
  ✅ Load testing (k6 o artillery)
  ✅ CDN para assets
```

### 6. Costos Estimados (MVP → Escala)

| Servicio | MVP (0-5K users) | Growth (5K-50K) | Scale (50K+) |
|----------|-------------------|-----------------|--------------|
| Supabase | $25/mo (Pro) | $599/mo (Team) | Custom |
| RevenueCat | $0 (< $2.5K MRR) | ~1% revenue | ~1% revenue |
| Stripe | 2.9% + $0.30/tx | Same | Volume discount |
| Twilio (OTP) | ~$20/mo | ~$100/mo | ~$500/mo |
| Expo Push | $0 (free tier) | $99/mo | $99/mo |
| Sentry | $0 (free) | $26/mo | $80/mo |
| **TOTAL** | **~$50/mo** | **~$850/mo** | **Custom** |

### 7. Principios No Negociables

1. **No microservicios hasta 100K+ users** (DHH, Pieter Levels)
2. **PostgreSQL es la single source of truth** (Paul Copplestone)
3. **RLS en CADA tabla** — no confiar solo en el frontend (Ryan Dahl security-first)
4. **Medir antes de optimizar** — benchmarks reales, no teóricos (Matteo Collina)
5. **Ship weekly** — features incrementales, no big bang (Pieter Levels)
6. **Managed > self-hosted** hasta que duela económicamente (Kelsey Hightower)
7. **Type safety end-to-end** — `supabase gen types` en CI/CD (tRPC philosophy)

---

*Documento generado como síntesis de los 10 referentes backend para el proyecto WhatsSound/OpenParty.*
*Última actualización: Enero 2025*
