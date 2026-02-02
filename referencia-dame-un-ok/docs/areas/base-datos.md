# 🗄️ Base de Datos — Esquema Completo Supabase

**Proyecto:** Dame un Ok  
**Fecha:** Febrero 2026  
**Motor:** PostgreSQL 15+ (Supabase)  
**Región:** eu-central-1 (Frankfurt) — Cumplimiento RGPD  
**Versión:** 1.0

---

## 1. Diagrama de Relaciones (Entidad-Relación)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   users      │       │   devices        │       │   device_types   │
│──────────────│       │──────────────────│       │──────────────────│
│ id (PK)      │◄──┐   │ id (PK)          │       │ id (PK)          │
│ email        │   │   │ user_id (FK)─────│──►usr │ code             │
│ phone        │   │   │ device_type_id───│──►dt  │ name             │
│ display_name │   │   │ name             │       │ protocol         │
│ deadline_hour│   │   │ mac_address      │       │ has_screen       │
│ timezone     │   │   │ token_hash       │       │ has_printer      │
│ role         │   │   │ status           │       └──────────────────┘
│ settings     │   │   │ battery_level    │
│ created_at   │   │   │ last_seen_at     │       ┌──────────────────┐
└──────┬───────┘   │   └──────────────────┘       │   checkins       │
       │           │                               │──────────────────│
       │           │   ┌──────────────────┐       │ id (PK)          │
       │           │   │   avatars        │       │ user_id (FK)     │
       │           └──►│ id (PK)          │       │ device_id (FK)   │
       │               │ user_id (FK)     │       │ source           │
       │               │ type / name      │       │ checkin_date (UQ)│
       │               │ stage / mood     │       │ timestamp        │
       │               └────────┬─────────┘       └──────────────────┘
       │                        │
       │               ┌────────┴─────────┐       ┌──────────────────┐
       │               │  avatar_states   │       │   streaks        │
       │               │  (historial)     │       │──────────────────│
       │               │ avatar_id (FK)   │       │ user_id (FK, UQ) │
       │               │ state            │       │ current_count    │
       │               │ trigger_reason   │       │ longest_count    │
       │               │ changed_at       │       │ milestones (JSON)│
       │               └─────────────────┘       └──────────────────┘
       │
       │  ┌────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
       ├─►│ emergency_contacts │  │   alerts         │  │   messages       │
       │  │ user_id (FK)       │  │ user_id (FK)     │  │ printer_dev (FK) │
       │  │ name / phone       │  │ type / severity  │  │ sender_id (FK)   │
       │  │ email              │  │ status           │  │ message_text     │
       │  │ priority           │  │ escalation_level │  │ status           │
       │  └────────────────────┘  └────────┬─────────┘  └───────┬──────────┘
       │                                   │                     │
       │  ┌────────────────────┐           │            ┌───────┴──────────┐
       └─►│ notification_log   │◄──────────┘            │ quick_responses  │
          │ channel / status   │                        │ response (enum)  │
          │ recipient          │                        │ latency_seconds  │
          └────────────────────┘                        └──────────────────┘

Tablas auxiliares: family_links, auto_questions, streak_milestones
```

---

## 2. SQL de Creación — Todas las Tablas

### 2.1 Extensiones

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 2.2 Tipos enumerados

```sql
CREATE TYPE user_locale AS ENUM ('es', 'en', 'fr', 'de', 'pt');
CREATE TYPE device_status AS ENUM ('active', 'inactive', 'setup', 'maintenance', 'retired');
CREATE TYPE device_protocol AS ENUM ('rest', 'mqtt', 'sms', 'ussd', 'ble', 'cec');
CREATE TYPE checkin_source AS ENUM (
  'app_mobile', 'button_wifi', 'button_ble', 'sms', 'ussd',
  'printer_button', 'smart_tv', 'remote_ok', 'voice_assistant', 'web_dashboard'
);
CREATE TYPE avatar_type AS ENUM ('cat','dog','chick','plant','turtle','owl','rabbit','sunflower');
CREATE TYPE avatar_stage AS ENUM ('baby', 'juvenile', 'adult');
CREATE TYPE avatar_mood AS ENUM ('sleeping','happy','euphoric','waiting','hungry','sad','sick');
CREATE TYPE alert_type AS ENUM ('missed_checkin','sos','low_battery','device_offline','bad_response_trend');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE alert_status AS ENUM ('triggered','escalated','acknowledged','resolved','false_positive');
CREATE TYPE message_status AS ENUM ('queued', 'sent', 'printed', 'failed', 'expired');
CREATE TYPE message_platform AS ENUM ('whatsapp','telegram','sms','app','email','system');
CREATE TYPE quick_response_type AS ENUM ('bien', 'mal', 'no_entiendo');
CREATE TYPE notification_channel AS ENUM ('push','email','sms','whatsapp','telegram','ivr','print');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');
```

### 2.3 Tabla `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(20),
    display_name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    locale user_locale NOT NULL DEFAULT 'es',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Madrid',
    deadline_hour SMALLINT NOT NULL DEFAULT 10 CHECK (deadline_hour BETWEEN 0 AND 23),
    deadline_minute SMALLINT NOT NULL DEFAULT 0 CHECK (deadline_minute BETWEEN 0 AND 59),
    grace_period_minutes SMALLINT NOT NULL DEFAULT 60 CHECK (grace_period_minutes BETWEEN 15 AND 360),
    reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    share_location BOOLEAN NOT NULL DEFAULT false,
    location_on_alert_only BOOLEAN NOT NULL DEFAULT true,
    role VARCHAR(20) NOT NULL DEFAULT 'senior' CHECK (role IN ('senior','family','admin')),
    settings JSONB NOT NULL DEFAULT '{"notifications":{"sound":true,"vibration":true,"quiet_start":"23:00","quiet_end":"08:00"},"accessibility":{"high_contrast":false,"large_text":false,"haptic":true}}'::jsonb,
    fcm_token TEXT,
    apns_token TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_checkin_at TIMESTAMPTZ,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_auth ON users(auth_id);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
```

### 2.4 Tabla `device_types`

```sql
CREATE TABLE device_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    protocol device_protocol NOT NULL,
    has_screen BOOLEAN NOT NULL DEFAULT false,
    has_printer BOOLEAN NOT NULL DEFAULT false,
    has_response_buttons BOOLEAN NOT NULL DEFAULT false,
    has_oled BOOLEAN NOT NULL DEFAULT false,
    has_led BOOLEAN NOT NULL DEFAULT true,
    has_buzzer BOOLEAN NOT NULL DEFAULT true,
    battery_powered BOOLEAN NOT NULL DEFAULT false,
    icon VARCHAR(10) DEFAULT '📱',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.5 Tabla `devices`

```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_type_id UUID NOT NULL REFERENCES device_types(id),
    name VARCHAR(100) NOT NULL DEFAULT 'Mi dispositivo',
    mac_address VARCHAR(17),
    serial_number VARCHAR(50),
    imei VARCHAR(20),
    mqtt_topic VARCHAR(200),
    token_hash VARCHAR(128) NOT NULL,
    push_token TEXT,
    status device_status NOT NULL DEFAULT 'setup',
    firmware_version VARCHAR(20),
    last_seen_at TIMESTAMPTZ,
    battery_level SMALLINT CHECK (battery_level BETWEEN 0 AND 100),
    wifi_rssi SMALLINT,
    tv_platform VARCHAR(20),
    tv_model VARCHAR(100),
    cec_hub_device_id UUID REFERENCES devices(id),
    wol_mac VARCHAR(17),
    capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_devices_mac ON devices(mac_address) WHERE mac_address IS NOT NULL;
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_type ON devices(device_type_id);
CREATE INDEX idx_devices_mqtt ON devices(mqtt_topic) WHERE mqtt_topic IS NOT NULL;
```

### 2.6 Tabla `checkins`

```sql
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    source checkin_source NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location GEOGRAPHY(POINT, 4326),
    location_accuracy REAL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_checkins_user_date ON checkins(user_id, checkin_date);
CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_timestamp ON checkins(timestamp);
CREATE INDEX idx_checkins_date ON checkins(checkin_date);
```

### 2.7 Tabla `emergency_contacts`

```sql
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    relationship VARCHAR(50),
    priority SMALLINT NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
    notify_email BOOLEAN NOT NULL DEFAULT true,
    notify_sms BOOLEAN NOT NULL DEFAULT false,
    notify_push BOOLEAN NOT NULL DEFAULT false,
    notify_whatsapp BOOLEAN NOT NULL DEFAULT false,
    notify_telegram BOOLEAN NOT NULL DEFAULT false,
    notify_ivr BOOLEAN NOT NULL DEFAULT false,
    family_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_token VARCHAR(64),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_user ON emergency_contacts(user_id);
CREATE INDEX idx_contacts_priority ON emergency_contacts(user_id, priority);
```

### 2.8 Tabla `avatars`

```sql
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type avatar_type NOT NULL DEFAULT 'cat',
    name VARCHAR(50) NOT NULL DEFAULT 'Michi',
    stage avatar_stage NOT NULL DEFAULT 'baby',
    total_days_fed INTEGER NOT NULL DEFAULT 0,
    current_mood avatar_mood NOT NULL DEFAULT 'sleeping',
    mood_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unlocked_accessories JSONB NOT NULL DEFAULT '[]'::jsonb,
    equipped_accessories JSONB NOT NULL DEFAULT '{}'::jsonb,
    gifts_received JSONB NOT NULL DEFAULT '[]'::jsonb,
    gifted_by_name VARCHAR(100),
    gifted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_avatars_user ON avatars(user_id);
CREATE INDEX idx_avatars_mood ON avatars(current_mood);
```

### 2.9 Tabla `avatar_states` (Historial)

```sql
CREATE TABLE avatar_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    state avatar_mood NOT NULL,
    previous_state avatar_mood,
    streak_at_change INTEGER NOT NULL DEFAULT 0,
    stage_at_change avatar_stage NOT NULL,
    accessories_snapshot JSONB DEFAULT '[]'::jsonb,
    trigger_reason VARCHAR(100),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_avatar_states_avatar ON avatar_states(avatar_id);
CREATE INDEX idx_avatar_states_time ON avatar_states(changed_at);
```

### 2.10 Tabla `streaks`

```sql
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_count INTEGER NOT NULL DEFAULT 0,
    current_start_date DATE,
    longest_count INTEGER NOT NULL DEFAULT 0,
    longest_start_date DATE,
    longest_end_date DATE,
    last_checkin_date DATE,
    last_checkin_at TIMESTAMPTZ,
    stage avatar_stage NOT NULL DEFAULT 'baby',
    milestones_reached JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_streaks_current ON streaks(current_count DESC);
```

### 2.11 Tabla `messages`

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    printer_device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_platform message_platform NOT NULL DEFAULT 'app',
    sender_platform_id VARCHAR(100),
    message_text TEXT NOT NULL CHECK (length(message_text) <= 500),
    message_image BYTEA,
    message_type VARCHAR(30) NOT NULL DEFAULT 'family_message',
    status message_status NOT NULL DEFAULT 'queued',
    retry_count SMALLINT NOT NULL DEFAULT 0,
    max_retries SMALLINT NOT NULL DEFAULT 3,
    schedule_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    printed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '48 hours',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_printer ON messages(printer_device_id);
CREATE INDEX idx_messages_status ON messages(status) WHERE status IN ('queued','sent');
CREATE INDEX idx_messages_schedule ON messages(schedule_at) WHERE schedule_at IS NOT NULL AND status = 'queued';
```

### 2.12 Tabla `alerts`

```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type alert_type NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'warning',
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    status alert_status NOT NULL DEFAULT 'triggered',
    escalation_level SMALLINT NOT NULL DEFAULT 0,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    escalated_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolved_reason VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_active ON alerts(user_id, status) WHERE status NOT IN ('resolved','false_positive');
```

### 2.13 Tabla `quick_responses`

```sql
CREATE TABLE quick_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    response quick_response_type NOT NULL,
    responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latency_seconds INTEGER,
    auto_question_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_user ON quick_responses(user_id);
CREATE INDEX idx_qr_date ON quick_responses(responded_at);
```

### 2.14 Tabla `notification_log`

```sql
CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
    channel notification_channel NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),
    subject VARCHAR(200),
    content TEXT NOT NULL,
    template_id VARCHAR(50),
    status notification_status NOT NULL DEFAULT 'pending',
    provider_id VARCHAR(100),
    provider_response JSONB,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notification_log(user_id);
CREATE INDEX idx_notif_alert ON notification_log(alert_id) WHERE alert_id IS NOT NULL;
CREATE INDEX idx_notif_pending ON notification_log(status) WHERE status = 'pending';
```

### 2.15 Tablas auxiliares

```sql
CREATE TABLE family_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    printer_device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform message_platform NOT NULL,
    platform_identifier VARCHAR(100),
    display_name VARCHAR(50) NOT NULL,
    relationship VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_messages_day INTEGER NOT NULL DEFAULT 20,
    verification_code VARCHAR(6),
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_fl_unique ON family_links(printer_device_id, family_member_id, platform);

CREATE TABLE auto_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    configured_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_text VARCHAR(200) NOT NULL,
    schedule_time TIME NOT NULL,
    schedule_days SMALLINT[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE streak_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    days_required INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    reward_type VARCHAR(30) NOT NULL,
    reward_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Row Level Security (RLS)

### 3.1 Habilitar RLS

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;
```

### 3.2 Funciones auxiliares

```sql
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_family_of(target_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM emergency_contacts
    WHERE user_id = target_user_id
      AND family_user_id = get_current_user_id()
      AND is_active = true AND is_verified = true
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### 3.3 Políticas por tabla

```sql
-- USERS: ver propio + familiares monitorizados
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth_id = auth.uid());
CREATE POLICY "users_select_family" ON users FOR SELECT USING (is_family_of(id));
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());
CREATE POLICY "users_insert_self" ON users FOR INSERT WITH CHECK (auth_id = auth.uid());

-- DEVICE_TYPES: catálogo público (solo lectura)
CREATE POLICY "dt_select" ON device_types FOR SELECT USING (true);

-- DEVICES: propios + familiares (lectura)
CREATE POLICY "devices_own" ON devices FOR ALL USING (user_id = get_current_user_id());
CREATE POLICY "devices_family_read" ON devices FOR SELECT USING (is_family_of(user_id));

-- CHECKINS: propios + familiares (lectura)
CREATE POLICY "checkins_own" ON checkins FOR SELECT USING (user_id = get_current_user_id());
CREATE POLICY "checkins_insert" ON checkins FOR INSERT WITH CHECK (user_id = get_current_user_id());
CREATE POLICY "checkins_family" ON checkins FOR SELECT USING (is_family_of(user_id));

-- EMERGENCY_CONTACTS: gestión propia + familiar ve que es contacto
CREATE POLICY "contacts_own" ON emergency_contacts FOR ALL USING (user_id = get_current_user_id());
CREATE POLICY "contacts_as_family" ON emergency_contacts FOR SELECT USING (family_user_id = get_current_user_id());

-- AVATARS: propios + familiares
CREATE POLICY "avatars_own" ON avatars FOR ALL USING (user_id = get_current_user_id());
CREATE POLICY "avatars_family" ON avatars FOR SELECT USING (is_family_of(user_id));

-- AVATAR_STATES: a través del avatar
CREATE POLICY "as_own" ON avatar_states FOR SELECT
  USING (avatar_id IN (SELECT id FROM avatars WHERE user_id = get_current_user_id()));
CREATE POLICY "as_family" ON avatar_states FOR SELECT
  USING (avatar_id IN (SELECT id FROM avatars WHERE is_family_of(user_id)));

-- STREAKS: propias + familiares
CREATE POLICY "streaks_own" ON streaks FOR SELECT USING (user_id = get_current_user_id());
CREATE POLICY "streaks_family" ON streaks FOR SELECT USING (is_family_of(user_id));

-- MESSAGES: remitente ve enviados, destinatario ve recibidos
CREATE POLICY "msg_sender" ON messages FOR SELECT USING (sender_id = get_current_user_id());
CREATE POLICY "msg_target" ON messages FOR SELECT USING (target_user_id = get_current_user_id());
CREATE POLICY "msg_insert" ON messages FOR INSERT WITH CHECK (is_family_of(target_user_id));

-- ALERTS: propias + familiares pueden ver y acknowledger
CREATE POLICY "alerts_own" ON alerts FOR SELECT USING (user_id = get_current_user_id());
CREATE POLICY "alerts_family" ON alerts FOR SELECT USING (is_family_of(user_id));
CREATE POLICY "alerts_ack" ON alerts FOR UPDATE USING (is_family_of(user_id));

-- QUICK_RESPONSES: propias + familiares
CREATE POLICY "qr_own" ON quick_responses FOR SELECT USING (user_id = get_current_user_id());
CREATE POLICY "qr_family" ON quick_responses FOR SELECT USING (is_family_of(user_id));

-- NOTIFICATION_LOG: solo propias
CREATE POLICY "nl_own" ON notification_log FOR SELECT USING (user_id = get_current_user_id());

-- FAMILY_LINKS: miembro familiar ve las suyas
CREATE POLICY "fl_member" ON family_links FOR ALL USING (family_member_id = get_current_user_id());

-- AUTO_QUESTIONS: configurador ve las suyas
CREATE POLICY "aq_own" ON auto_questions FOR ALL USING (configured_by = get_current_user_id());

-- STREAK_MILESTONES: catálogo público
CREATE POLICY "sm_read" ON streak_milestones FOR SELECT USING (true);
```

> **Nota:** Los dispositivos IoT (ESP32, impresoras) usan la `service_role` key de Supabase para operaciones de check-in y MQTT, ya que no tienen sesión de usuario JWT. Las Edge Functions actúan como proxy autenticado.

---

## 4. Funciones y Triggers

### 4.1 Auto-actualizar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_devices_updated BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_avatars_updated BEFORE UPDATE ON avatars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4.2 Procesar check-in: actualizar racha, avatar y usuario

```sql
CREATE OR REPLACE FUNCTION process_checkin()
RETURNS TRIGGER AS $$
DECLARE
    v_streak RECORD;
    v_avatar RECORD;
    v_new_count INTEGER;
    v_new_stage avatar_stage;
    v_milestone RECORD;
BEGIN
    -- 1. Actualizar last_checkin_at del usuario
    UPDATE users SET last_checkin_at = NEW.timestamp WHERE id = NEW.user_id;

    -- 2. Obtener o crear racha
    SELECT * INTO v_streak FROM streaks WHERE user_id = NEW.user_id FOR UPDATE;
    
    IF NOT FOUND THEN
        INSERT INTO streaks (user_id, current_count, current_start_date, last_checkin_date, last_checkin_at)
        VALUES (NEW.user_id, 1, NEW.checkin_date, NEW.checkin_date, NEW.timestamp);
        v_new_count := 1;
    ELSE
        IF v_streak.last_checkin_date = NEW.checkin_date THEN
            -- Ya hizo check-in hoy, no hacer nada más con la racha
            v_new_count := v_streak.current_count;
        ELSIF v_streak.last_checkin_date = NEW.checkin_date - INTERVAL '1 day' THEN
            -- Día consecutivo: incrementar racha
            v_new_count := v_streak.current_count + 1;
            UPDATE streaks SET
                current_count = v_new_count,
                last_checkin_date = NEW.checkin_date,
                last_checkin_at = NEW.timestamp,
                longest_count = GREATEST(v_streak.longest_count, v_new_count),
                longest_start_date = CASE WHEN v_new_count > v_streak.longest_count
                    THEN v_streak.current_start_date ELSE v_streak.longest_start_date END,
                longest_end_date = CASE WHEN v_new_count > v_streak.longest_count
                    THEN NEW.checkin_date ELSE v_streak.longest_end_date END
            WHERE user_id = NEW.user_id;
        ELSE
            -- Racha rota: reiniciar
            v_new_count := 1;
            UPDATE streaks SET
                current_count = 1,
                current_start_date = NEW.checkin_date,
                last_checkin_date = NEW.checkin_date,
                last_checkin_at = NEW.timestamp
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;

    -- 3. Calcular etapa del avatar según racha
    IF v_new_count >= 31 THEN v_new_stage := 'adult';
    ELSIF v_new_count >= 8 THEN v_new_stage := 'juvenile';
    ELSE v_new_stage := 'baby';
    END IF;

    -- 4. Actualizar avatar: mood + stage + days_fed
    UPDATE avatars SET
        current_mood = 'happy',
        mood_changed_at = NOW(),
        stage = v_new_stage,
        total_days_fed = total_days_fed + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    -- 5. Registrar cambio de estado del avatar
    SELECT * INTO v_avatar FROM avatars WHERE user_id = NEW.user_id;
    IF FOUND THEN
        INSERT INTO avatar_states (avatar_id, state, previous_state, streak_at_change, stage_at_change, trigger_reason)
        VALUES (v_avatar.id, 'happy', v_avatar.current_mood, v_new_count, v_new_stage, 'checkin');
    END IF;

    -- 6. Actualizar etapa de la racha
    UPDATE streaks SET stage = v_new_stage WHERE user_id = NEW.user_id;

    -- 7. Verificar hitos de racha
    FOR v_milestone IN SELECT * FROM streak_milestones WHERE days_required = v_new_count LOOP
        UPDATE streaks SET
            milestones_reached = milestones_reached || jsonb_build_object(
                'days', v_milestone.days_required,
                'name', v_milestone.name,
                'reached_at', NOW()::text
            )
        WHERE user_id = NEW.user_id;
    END LOOP;

    -- 8. Resolver alertas activas de missed_checkin
    UPDATE alerts SET
        status = 'resolved',
        resolved_at = NOW(),
        resolved_reason = 'checkin_received'
    WHERE user_id = NEW.user_id
      AND type = 'missed_checkin'
      AND status IN ('triggered', 'escalated');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_process_checkin
    AFTER INSERT ON checkins
    FOR EACH ROW EXECUTE FUNCTION process_checkin();
```

### 4.3 Crear perfil y racha al registrar usuario

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear registro en tabla users vinculado a auth.users
    INSERT INTO users (auth_id, email, phone, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.phone,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Crear racha y avatar por defecto al crear usuario
CREATE OR REPLACE FUNCTION init_user_data()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO streaks (user_id) VALUES (NEW.id);
    INSERT INTO avatars (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_init_user_data
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION init_user_data();
```

### 4.4 Resetear racha a medianoche si no hubo check-in

Esta lógica se ejecuta desde una Edge Function cron, no desde un trigger, porque debe evaluar la **ausencia** de eventos. Ver sección 6.

---

## 5. Edge Functions Necesarias

### 5.1 Cron: Verificación de check-ins (Protocolo de Fallo)

**Ejecuta cada minuto.** Busca usuarios cuya hora límite + gracia ha pasado sin check-in.

```typescript
// supabase/functions/check-deadlines/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Buscar usuarios activos sin check-in hoy cuya hora límite ya pasó
  const { data: users } = await supabase.rpc('get_overdue_users', {
    current_time: now.toISOString(),
    check_date: today
  })

  for (const user of users ?? []) {
    const deadlineTime = new Date(today + `T${String(user.deadline_hour).padStart(2,'0')}:${String(user.deadline_minute).padStart(2,'0')}:00`)
    deadlineTime.setMinutes(deadlineTime.getMinutes() + user.grace_period_minutes)
    
    const hoursOverdue = (now.getTime() - deadlineTime.getTime()) / (1000 * 60 * 60)

    if (hoursOverdue <= 0) continue

    // Determinar nivel de escalación
    let escalation = 0
    if (hoursOverdue >= 6) escalation = 3
    else if (hoursOverdue >= 3) escalation = 2
    else if (hoursOverdue >= 1) escalation = 1

    // Crear o escalar alerta
    const { data: existing } = await supabase
      .from('alerts')
      .select('id, escalation_level')
      .eq('user_id', user.id)
      .eq('type', 'missed_checkin')
      .in('status', ['triggered', 'escalated'])
      .single()

    if (!existing) {
      // Crear nueva alerta
      await supabase.from('alerts').insert({
        user_id: user.id,
        type: 'missed_checkin',
        severity: escalation >= 2 ? 'critical' : 'warning',
        message: `${user.display_name} no ha confirmado su bienestar hoy.`,
        escalation_level: escalation,
        details: { hours_overdue: hoursOverdue, deadline: `${user.deadline_hour}:${user.deadline_minute}` }
      })
    } else if (escalation > existing.escalation_level) {
      // Escalar alerta existente
      await supabase.from('alerts')
        .update({ escalation_level: escalation, escalated_at: new Date().toISOString(), status: 'escalated' })
        .eq('id', existing.id)
    }

    // Actualizar mood del avatar
    const mood = hoursOverdue >= 6 ? 'sick' : hoursOverdue >= 3 ? 'sad' : 'hungry'
    await supabase.from('avatars')
      .update({ current_mood: mood, mood_changed_at: new Date().toISOString() })
      .eq('user_id', user.id)

    // Enviar notificaciones según nivel de escalación
    if (escalation >= 1) await notifyUser(supabase, user)
    if (escalation >= 2) await notifyContacts(supabase, user)
    if (escalation >= 3) await notifyContactsUrgent(supabase, user)
  }

  return new Response('OK')
})
```

**SQL para la función RPC:**

```sql
CREATE OR REPLACE FUNCTION get_overdue_users(current_time TIMESTAMPTZ, check_date DATE)
RETURNS TABLE (
    id UUID, display_name TEXT, deadline_hour SMALLINT,
    deadline_minute SMALLINT, grace_period_minutes SMALLINT, timezone TEXT
) AS $$
    SELECT u.id, u.display_name, u.deadline_hour, u.deadline_minute,
           u.grace_period_minutes, u.timezone
    FROM users u
    WHERE u.is_active = true
      AND u.role = 'senior'
      AND u.deleted_at IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM checkins c WHERE c.user_id = u.id AND c.checkin_date = check_date
      )
      AND (current_time AT TIME ZONE u.timezone)::time >
          make_time(u.deadline_hour, u.deadline_minute, 0) + (u.grace_period_minutes || ' minutes')::interval
$$ LANGUAGE sql STABLE;
```

### 5.2 Cron: Reset de avatares a medianoche

```typescript
// supabase/functions/midnight-reset/index.ts
// Ejecuta cada día a las 00:05 de cada timezone configurado
// Pone en mood 'sleeping' a todos los avatares cuyo usuario ya pasó medianoche
```

### 5.3 Cron: Limpieza de mensajes expirados

```sql
-- Ejecutar diariamente: eliminar mensajes expirados de la cola
DELETE FROM messages WHERE expires_at < NOW() AND status IN ('queued', 'failed');
```

### 5.4 Webhook handlers

```typescript
// supabase/functions/webhook-whatsapp/index.ts   — Meta Cloud API
// supabase/functions/webhook-telegram/index.ts    — Telegram Bot API
// supabase/functions/webhook-sms/index.ts         — Twilio inbound SMS
// supabase/functions/webhook-mqtt/index.ts        — Bridge MQTT → REST
```

### 5.5 Cron schedule (pg_cron)

```sql
-- Activar pg_cron en Supabase (Dashboard → Extensions)
SELECT cron.schedule('check-deadlines', '* * * * *',
  $$ SELECT net.http_post('https://<project>.supabase.co/functions/v1/check-deadlines',
     '{}', '{"Authorization": "Bearer <service_role_key>"}') $$
);

SELECT cron.schedule('midnight-reset', '5 0 * * *',
  $$ SELECT net.http_post('https://<project>.supabase.co/functions/v1/midnight-reset',
     '{}', '{"Authorization": "Bearer <service_role_key>"}') $$
);

SELECT cron.schedule('cleanup-messages', '0 3 * * *',
  $$ DELETE FROM messages WHERE expires_at < NOW() AND status IN ('queued','failed') $$
);

SELECT cron.schedule('cleanup-old-states', '0 4 * * 0',
  $$ DELETE FROM avatar_states WHERE changed_at < NOW() - INTERVAL '90 days' $$
);
```

---

## 6. Migrations Strategy

### Estructura de migraciones

```
supabase/
├── migrations/
│   ├── 20260201000000_initial_schema.sql        -- Tipos + tablas
│   ├── 20260201000001_indexes.sql               -- Índices
│   ├── 20260201000002_rls_policies.sql          -- RLS
│   ├── 20260201000003_functions_triggers.sql    -- Funciones y triggers
│   ├── 20260201000004_seed_device_types.sql     -- Datos iniciales
│   ├── 20260201000005_seed_milestones.sql       -- Hitos de racha
│   ├── 20260201000006_cron_jobs.sql             -- pg_cron schedules
│   └── ...futuras migraciones incrementales
├── functions/
│   ├── check-deadlines/index.ts
│   ├── midnight-reset/index.ts
│   ├── webhook-whatsapp/index.ts
│   ├── webhook-telegram/index.ts
│   └── webhook-sms/index.ts
└── seed.sql
```

### Protocolo de migración

1. **Desarrollo:** `supabase db reset` recrea todo desde cero localmente
2. **Staging:** `supabase db push` aplica migraciones pendientes
3. **Producción:** `supabase db push --linked` con review manual obligatorio
4. **Rollback:** Cada migración tiene un `down.sql` correspondiente
5. **Nunca** modificar migraciones ya aplicadas; crear nuevas migraciones incrementales

### Convenciones

- Archivos con timestamp: `YYYYMMDDHHMMSS_descripcion.sql`
- Migraciones idempotentes cuando sea posible (`CREATE IF NOT EXISTS`, `DO $$ ... $$`)
- Cambios destructivos (DROP COLUMN, cambio de tipo) requieren migración de datos explícita
- Tests de migración en CI antes de aplicar a staging

---

## 7. Datos Seed para Testing

```sql
-- seed.sql — Datos de prueba para desarrollo y testing

-- 7.1 Device types (ya definidos arriba, aquí repetidos por completitud en seed)
INSERT INTO device_types (code, name, protocol, has_screen, has_printer, has_response_buttons, has_oled, battery_powered, icon) VALUES
('app_mobile',    'App Móvil',           'rest', true,  false, false, false, false, '📱'),
('button_wifi',   'Botón WiFi',          'mqtt', false, false, false, false, true,  '🔴'),
('button_wifi_p', 'Botón WiFi Premium',  'mqtt', false, false, false, true,  true,  '🟢'),
('printer',       'Impresora Térmica',   'mqtt', false, true,  true,  true,  false, '🖨️'),
('smart_tv',      'Smart TV',            'rest', true,  false, true,  false, false, '📺'),
('feature_phone', 'Teléfono Básico',     'sms',  false, false, false, false, false, '📞')
ON CONFLICT (code) DO NOTHING;

-- 7.2 Hitos de racha
INSERT INTO streak_milestones (days_required, name, emoji, reward_type, reward_data) VALUES
(3,   'Primeros pasos',        '🐾', 'animation', '{"animation":"first_steps"}'),
(7,   'Una semana cuidando',   '🌟', 'accessory', '{"accessory":"scarf_basic"}'),
(14,  'Cuidador dedicado',     '💪', 'stage_up',  '{"new_stage":"juvenile"}'),
(30,  'Un mes de amor',        '❤️', 'accessory', '{"accessory":"crown_silver"}'),
(60,  'Inseparables',          '🤝', 'avatar_unlock', '{"avatar":"owl"}'),
(100, 'Centenario del cariño', '🏅', 'badge',     '{"badge":"centenarian"}'),
(365, 'Un año juntos',         '🎂', 'accessory', '{"accessory":"crown_gold"}')
ON CONFLICT (days_required) DO NOTHING;

-- 7.3 Usuarios de prueba (los IDs de auth se crean con Supabase Auth)
-- En desarrollo, crear usuarios vía supabase auth admin y luego:

-- María (senior, 78 años, pueblo de Soria)
INSERT INTO users (id, display_name, phone, email, deadline_hour, deadline_minute, timezone, role, locale)
VALUES ('a1000000-0000-0000-0000-000000000001', 'María García', '+34600111222', 'maria.test@dameunok.es', 10, 0, 'Europe/Madrid', 'senior', 'es');

-- Javier (familiar, hijo de María)
INSERT INTO users (id, display_name, phone, email, role, locale)
VALUES ('a2000000-0000-0000-0000-000000000002', 'Javier García', '+34666333444', 'javier.test@dameunok.es', 'family', 'es');

-- Laura (senior, nómada digital)
INSERT INTO users (id, display_name, phone, email, deadline_hour, timezone, role, locale)
VALUES ('a3000000-0000-0000-0000-000000000003', 'Laura Martínez', '+34677555666', 'laura.test@dameunok.es', 9, 'Asia/Bangkok', 'senior', 'en');

-- Rachas
INSERT INTO streaks (user_id, current_count, current_start_date, longest_count, last_checkin_date)
VALUES
('a1000000-0000-0000-0000-000000000001', 15, '2026-01-17', 15, '2026-01-31'),
('a3000000-0000-0000-0000-000000000003', 45, '2025-12-17', 45, '2026-01-31');

-- Avatares
INSERT INTO avatars (user_id, type, name, stage, total_days_fed, current_mood) VALUES
('a1000000-0000-0000-0000-000000000001', 'cat', 'Michi', 'juvenile', 15, 'happy'),
('a3000000-0000-0000-0000-000000000003', 'plant', 'Brote', 'adult', 45, 'happy');

-- Dispositivos (token_hash ficticio para testing)
INSERT INTO devices (id, user_id, device_type_id, name, status, token_hash, mqtt_topic) VALUES
('d1000000-0000-0000-0000-000000000001',
 'a1000000-0000-0000-0000-000000000001',
 (SELECT id FROM device_types WHERE code = 'printer'),
 'Cocina María', 'active',
 '$2b$10$testhashneveruseinprod000000000000000000000000',
 'ok/d1000000-0000-0000-0000-000000000001');

-- Contactos de emergencia
INSERT INTO emergency_contacts (user_id, name, phone, email, relationship, priority, notify_email, family_user_id, is_verified)
VALUES
('a1000000-0000-0000-0000-000000000001', 'Javier García', '+34666333444', 'javier.test@dameunok.es', 'hijo', 1, true, 'a2000000-0000-0000-0000-000000000002', true);

-- Check-ins de ejemplo (últimos 5 días)
INSERT INTO checkins (user_id, source, checkin_date, timestamp) VALUES
('a1000000-0000-0000-0000-000000000001', 'printer_button', '2026-01-27', '2026-01-27T09:15:00+01:00'),
('a1000000-0000-0000-0000-000000000001', 'printer_button', '2026-01-28', '2026-01-28T09:22:00+01:00'),
('a1000000-0000-0000-0000-000000000001', 'printer_button', '2026-01-29', '2026-01-29T10:05:00+01:00'),
('a1000000-0000-0000-0000-000000000001', 'printer_button', '2026-01-30', '2026-01-30T09:48:00+01:00'),
('a1000000-0000-0000-0000-000000000001', 'printer_button', '2026-01-31', '2026-01-31T09:30:00+01:00');

-- Family links
INSERT INTO family_links (printer_device_id, family_member_id, platform, platform_identifier, display_name, relationship, verified) VALUES
('d1000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'whatsapp', '+34666333444', 'Javier (tu hijo)', 'hijo', true);
```

---

## 8. Consultas Frecuentes de Referencia

### Dashboard familiar: estado de todos los monitorizados

```sql
SELECT
    u.display_name,
    a.name AS avatar_name, a.type AS avatar_type,
    a.current_mood, a.stage,
    s.current_count AS streak,
    s.last_checkin_at,
    CASE WHEN s.last_checkin_date = CURRENT_DATE THEN true ELSE false END AS checked_in_today
FROM users u
JOIN avatars a ON a.user_id = u.id
JOIN streaks s ON s.user_id = u.id
WHERE u.id IN (
    SELECT ec.user_id FROM emergency_contacts ec
    WHERE ec.family_user_id = :family_user_id AND ec.is_active = true
)
ORDER BY s.last_checkin_at DESC NULLS LAST;
```

### Historial de check-ins por mes (calendario)

```sql
SELECT checkin_date, source, timestamp
FROM checkins
WHERE user_id = :user_id
  AND checkin_date BETWEEN :start_date AND :end_date
ORDER BY checkin_date;
```

### Resumen semanal de respuestas rápidas

```sql
SELECT
    date_trunc('day', responded_at) AS dia,
    COUNT(*) FILTER (WHERE response = 'bien') AS bien,
    COUNT(*) FILTER (WHERE response = 'mal') AS mal,
    COUNT(*) FILTER (WHERE response = 'no_entiendo') AS no_entiendo,
    ROUND(AVG(latency_seconds)) AS latencia_promedio_seg
FROM quick_responses
WHERE user_id = :user_id
  AND responded_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY dia ORDER BY dia;
```

---

## 9. Consideraciones de Rendimiento

| Aspecto | Estrategia |
|---------|-----------|
| **Checkins** | Índice único `(user_id, checkin_date)` evita duplicados y acelera consultas diarias |
| **Alertas activas** | Índice parcial `WHERE status NOT IN ('resolved','false_positive')` |
| **Mensajes pendientes** | Índice parcial `WHERE status IN ('queued','sent')` |
| **Notificaciones** | Índice parcial `WHERE status = 'pending'` |
| **Particionado** | `checkins` y `avatar_states` candidatas a particionado por rango de fecha cuando superen 1M filas |
| **JSONB** | `settings`, `capabilities`, `milestones_reached` usan índices GIN si se busca por contenido |
| **Soft delete** | `users.deleted_at` permite retención RGPD antes de borrado real (cron semanal) |
| **Connection pooling** | Supabase incluye PgBouncer; configurar pool_mode=transaction |
| **Realtime** | Habilitar Supabase Realtime en `avatars`, `alerts`, `messages` para dashboard en tiempo real |

---

## 10. Backup y Recuperación

- **Automático:** Supabase Pro incluye backups diarios con retención de 7 días
- **Point-in-time recovery:** Disponible en plan Pro (recuperar a cualquier momento en las últimas 24h)
- **Manual:** `pg_dump` semanal a S3 cifrado (eu-central-1) para retención extendida de 30 días
- **Testing de restore:** Mensual, restaurar backup en proyecto Supabase temporal y verificar integridad
- **Política RGPD:** Datos de usuarios con `deleted_at` se eliminan permanentemente tras 30 días vía cron

---

*Este documento define el esquema completo de base de datos para Dame un Ok. Todas las tablas, relaciones, políticas de seguridad, funciones, triggers y estrategias de migración necesarias para el MVP y primeras fases de crecimiento.*
