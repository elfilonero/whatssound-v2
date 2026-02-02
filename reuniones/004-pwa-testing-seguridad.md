# ACTA REUNIÓN 04: PWA + TESTING + SEGURIDAD + INFRAESTRUCTURA

**Fecha:** 28 enero 2025  
**Duración:** 2.5 horas  
**Modalidad:** Virtual (Google Meet)

## PARTICIPANTES

- **Elena Martínez** - Experta PWA Offline (#14)
- **David Chen** - Especialista Testing & QA (#15)
- **Alejandro Ruiz** - Experto Seguridad Legal (#17)
- **Santiago Torres** - DevOps Lead (#06)
- **Moderador:** Coordinador Técnico WhatsSound

---

## AGENDA Y DECISIONES

### 1. PWA - PROGRESSIVE WEB APP

**Presentación Elena Martínez (25 min)**

**🎯 OBJETIVOS DEFINIDOS:**
- Experiencia nativa en móvil sin descargar app nativa
- Funcionalidad offline para música cacheada y acciones sociales
- Instalación desde navegador con prompts optimizados
- Background audio sin interrupciones

**📋 DECISIONES TÉCNICAS:**

#### 1.1 Service Worker Strategy
```javascript
// Adoptamos estrategia multi-cache con Workbox
CACHE_STRATEGIES = {
  'app-shell': CacheFirst,        // HTML, CSS, JS crítico
  'audio-stream': CacheFirst,     // Archivos MP3/OGG
  'api-social': NetworkFirst,     // Posts, chats, likes
  'metadata': StaleWhileRevalidate, // Info tracks, usuarios
  'images': CacheFirst            // Avatares, portadas
}

CACHE_LIMITS = {
  'audio-stream': '2GB máximo',
  'api-social': '50MB rolling',
  'metadata': '100MB',
  'images': '500MB'
}
```

**💡 Elena:** "El audio caching será inteligente. Cachearemos automáticamente las últimas 50 canciones reproducidas + predicciones ML basadas en horarios de escucha."

**🔧 Santiago (DevOps):** "Perfecto. Podemos usar Vercel Edge para el Service Worker y implementar purging inteligente de cache. ¿Cómo manejamos el offline sync?"

**✅ Elena:** "Implementamos queue con IndexedDB. Todas las acciones offline (likes, comments, adds to playlist) se guardan localmente y se sincronizan cuando hay conexión."

#### 1.2 Web App Manifest
```json
{
  "name": "WhatsSound - Música Social",
  "short_name": "WhatsSound",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#FF6B6B",
  "background_color": "#1A1A1A",
  "shortcuts": [
    {"name": "Descubrir", "url": "/discover"},
    {"name": "Mis Playlists", "url": "/playlists"},
    {"name": "En Vivo", "url": "/live"},
    {"name": "Amigos", "url": "/social"}
  ]
}
```

#### 1.3 Install Prompts Optimizados
**📱 Estrategia UX:**
- **NO** mostrar prompt inmediato
- Triggering inteligente: después de crear playlist, alta engagement (5+ songs), uso offline detectado
- Máximo 3 prompts por usuario
- Custom UI, no browser nativo

**⚠️ Alejandro (Legal):** "Elena, ¿el prompt de instalación recopila datos? Necesitamos disclosure si trackea install attempts."

**✅ Elena:** "Solo medimos install rate agregado. Anonymous analytics, GDPR-compliant."

#### 1.4 Background Audio
**🎵 Implementación:**
```javascript
// Media Session API para controles sistema
navigator.mediaSession.setActionHandler('play', () => {
  audioPlayer.play()
})

// Audio sigue funcionando cuando PWA va a background
audioPlayer.addEventListener('pause', (e) => {
  if (e.reason !== 'user_interaction') {
    e.preventDefault()
  }
})
```

**🔒 Alejandro:** "Background audio está bien legalmente, pero necesitamos consent para notificaciones de 'Now Playing'."

---

### 2. TESTING - PLAN MAESTRO

**Presentación David Chen (30 min)**

**🎯 PLAN ADOPTADO:**
- **39 horas testing por sprint** distribuidas en 4 fases
- **CI/CD pipeline** completo con GitHub Actions
- **E2E testing** con Playwright para flujos críticos
- **Coverage targets:** 85% overall, 95% core business logic

**📋 IMPLEMENTACIÓN POR FASES:**

#### 2.1 Foundation Testing (8 horas/sprint)
```yaml
# .github/workflows/ci.yml
jobs:
  unit-tests:
    name: 🧪 Unit Tests
    coverage_threshold: 85%
    critical_modules: 95%
    
  api-tests:
    name: 🔌 API Testing
    services: [postgres, redis]
    
  e2e-core:
    name: 🎭 E2E Critical Flows
    browsers: [chromium, webkit, firefox]
    mobile: [iPhone 13, Pixel 5]
```

**🎯 Tests Críticos Priorizados:**
```javascript
// NIVEL 1: NO PUEDEN FALLAR JAMÁS
test('usuario puede unirse a sala y música se sincroniza')
test('múltiples usuarios escuchan misma música simultáneamente')  
test('cambio de canción sincroniza para todos')
test('WebSocket reconnection automática funciona')

// NIVEL 2: IMPACTAN UX SIGNIFICATIVAMENTE
test('audio continúa en background mobile')
test('offline actions se sincronizan al reconectar')
test('notificaciones push funcionan correctamente')
```

**⚡ Santiago (DevOps):** "David, ¿cómo integramos esto con nuestro deploy pipeline? Necesitamos que los tests no bloqueen hotfixes urgentes."

**✅ David:** "Implementamos fast-track para hotfixes. Tests críticos (5 min) + E2E smoke (10 min) para emergency releases. Full suite solo para features."

#### 2.2 Playwright E2E Strategy
```javascript
// playwright.config.js
module.exports = {
  projects: [
    { name: 'Desktop Chrome' },
    { name: 'Mobile Safari' },
    { name: 'Mobile Chrome' }
  ],
  
  // Configuración específica WhatsSound
  use: {
    permissions: ['microphone'],  // Para grabación audio
    storageState: 'e2e/auth.json' // Auth persistente
  }
}

// Test real-time music sync
test('multi-user music synchronization', async ({ page, context }) => {
  // Simular 3 usuarios en misma sala
  const user1 = await context.newPage()
  const user2 = await context.newPage()
  const user3 = await context.newPage()
  
  // Usuario 1 crea sala y añade canción
  await user1.goto('/rooms/create')
  await user1.click('[data-testid="add-song"]')
  
  // Usuarios 2 y 3 se unen
  await user2.goto('/rooms/join/test-room')
  await user3.goto('/rooms/join/test-room')
  
  // Verificar sincronización
  await expect(user1.locator('[data-testid="current-time"]'))
    .toHaveText(await user2.locator('[data-testid="current-time"]').textContent())
})
```

#### 2.3 Mobile Testing con Detox
**📱 Santiago:** "Para iOS native necesitaremos Detox además de Playwright web."

**✅ David:** "Correcto. Plan es: Playwright para PWA web, Detox para app nativa iOS cuando la tengamos."

**🔒 Alejandro:** "Los tests deben usar datos sintéticos. Nada de testing con contenido real protegido por copyright."

---

### 3. SEGURIDAD - COMPLIANCE COMPLETA

**Presentación Alejandro Ruiz (35 min)**

**🎯 ROADMAP LEGAL:**
- **Pre-lanzamiento:** RGPD + licencias básicas (SGAE, AGEDI)
- **Post-lanzamiento:** Moderación + protección menores
- **Crecimiento:** Licencias internacionales + audit trail

**📋 IMPLEMENTACIÓN CRÍTICA:**

#### 3.1 Supabase RLS Policies
```sql
-- Política música: solo visible según privacidad
CREATE POLICY "music_access" ON music_uploads FOR SELECT
USING (
  privacy = 'public' OR 
  (privacy = 'friends' AND are_friends(auth.uid(), uploader_id)) OR
  auth.uid() = uploader_id
);

-- Política interactions: solo dueño ve analytics
CREATE POLICY "interaction_privacy" ON user_interactions FOR ALL
USING (
  auth.uid() = user_id OR 
  auth.uid() = (SELECT uploader_id FROM music_uploads WHERE id = music_id)
);
```

**🔧 Santiago:** "Alejandro, ¿esto impacta performance? Con millones de filas podría ser lento."

**✅ Alejandro:** "Buena pregunta. Implementamos RLS con índices optimizados + cache en Redis para friends lookup. Performance antes que todo."

#### 3.2 RGPD Compliance System
```typescript
interface UserConsent {
  essential: boolean;     // Siempre true
  analytics: boolean;     // Opcional
  marketing: boolean;     // Opcional  
  geolocation: boolean;   // Para friends nearby
  social_sharing: boolean; // Para integración redes
}

// Granularidad máxima para compliance
const ConsentManager = {
  updateConsent: async (userId, consents) => {
    await auditLog('consent_updated', { userId, consents })
    await updateAnalyticsPermissions(userId, consents.analytics)
  },
  
  revokeConsent: async (userId, type) => {
    await purgeDataByType(userId, type)
    await notifyThirdParties(userId, 'revoke', type)
  }
}
```

#### 3.3 Licencias Musicales
**📄 Acuerdos Mínimos Pre-Launch:**
- **SGAE:** Tarifa 407.2 (€0.0063 por reproducción)
- **AGEDI/AIE:** 10% revenue share negociado
- **Content ID:** Audible Magic fingerprinting

**🎵 Elena:** "¿El Content ID bloquea el audio caching? No podemos cachear contenido no licenciado."

**✅ Alejandro:** "Content ID valida antes del caching. Solo content verificado va a cache offline."

#### 3.4 Moderación Automatizada
```typescript
const ModerationPipeline = {
  audioAnalysis: {
    copyright_detection: true,    // Audible Magic
    explicit_content: true,       // ML model local
    hate_speech: false,          // Solo para audio speech
    quality_check: true          // Formato/bitrate válido
  },
  
  autoAction: {
    copyright_match: 'block',
    explicit_content: 'flag_review',
    low_quality: 'auto_enhance'
  }
}
```

**⚠️ David (Testing):** "Necesitamos tests para el pipeline de moderación. ¿Cómo probamos copyright sin usar contenido real?"

**✅ Alejandro:** "Audible Magic provee fingerprints de test. Plus generamos audio sintético para edge cases."

---

### 4. INFRAESTRUCTURA - DEPLOY & MONITORING

**Presentación Santiago Torres (40 min)**

**🎯 ARQUITECTURA ADOPTADA:**
- **Frontend:** Vercel (Edge functions + CDN global)
- **Backend:** Supabase (PostgreSQL + Edge Functions + Storage)
- **Mobile:** EAS Build + Updates para OTA
- **Monitoring:** Sentry + PostHog + Supabase Dashboard

**📋 DEPLOY PIPELINE:**

#### 4.1 GitHub Actions Completo
```yaml
name: WhatsSound CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Fast feedback (5 min)
  quick-check:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit
      
  # API tests (10 min)
  api-tests:
    services: [postgres, redis]
    steps:
      - run: npm run test:api
      
  # E2E critical (15 min)
  e2e-critical:
    if: github.ref == 'refs/heads/main'
    steps:
      - run: npx playwright test --grep="critical"
      
  # Deploy staging
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    needs: [quick-check, api-tests]
    steps:
      - run: vercel deploy --token=$VERCEL_TOKEN
      
  # Deploy production
  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [quick-check, api-tests, e2e-critical]
    steps:
      - run: vercel deploy --prod --token=$VERCEL_TOKEN
      - run: npm run test:smoke-production
```

**⚡ David:** "Santiago, ¿qué pasa si Vercel se cae? ¿Tenemos failover?"

**✅ Santiago:** "Vercel tiene 99.99% SLA + edge locations. Para failover extremo, podemos usar Railway como backup, pero honestly Vercel es más confiable que nuestro propio infra."

#### 4.2 Mobile CI/CD con EAS
```yaml
# eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  },
  "update": {
    "production": { "channel": "production" },
    "preview": { "channel": "preview" }
  }
}
```

**📱 Workflow Mobile:**
1. **Develop push** → EAS build preview → TestFlight internal
2. **Main push** → EAS build production → App Store release
3. **Hotfix JS** → EAS Update OTA (sin store review)

#### 4.3 Staging vs Producción
```javascript
// Ambientes definidos
ENVIRONMENTS = {
  local: {
    api: 'http://localhost:3000',
    supabase: 'local-supabase',
    music_cdn: 'local-storage'
  },
  
  staging: {
    api: 'https://staging-api.whatssound.app',
    supabase: 'staging-project.supabase.co',
    music_cdn: 'staging-cdn.whatssound.app',
    features: ['debug_mode', 'test_users']
  },
  
  production: {
    api: 'https://api.whatssound.app',
    supabase: 'prod-project.supabase.co', 
    music_cdn: 'cdn.whatssound.app',
    features: ['analytics', 'error_reporting']
  }
}
```

#### 4.4 Monitoring Setup
```typescript
// Sentry - Error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  beforeSend(event) {
    // Filtrar PII antes de enviar
    return sanitizeErrorEvent(event)
  }
})

// PostHog - Product analytics
posthog.init('phc_project_key', {
  api_host: 'https://app.posthog.com',
  person_profiles: 'identified_only', // GDPR compliance
  capture_pageview: false, // Manual control
  autocapture: false // Solo eventos explícitos
})

// Alerts críticos
const CRITICAL_ALERTS = {
  audio_playback_failure: '5% error rate > 5 min',
  websocket_connection_failure: '10% failures > 5 min',
  api_response_time: 'p95 > 2000ms > 10 min',
  storage_quota_exceeded: '80% of limit reached'
}
```

**🔒 Alejandro:** "Santiago, el monitoring debe ser GDPR-compliant. No IP addresses, user IDs hasheados, datos mínimos."

**✅ Santiago:** "Correcto. PostHog configurado con 'identified_only' profiles. Sentry con beforeSend para sanitizar PII."

#### 4.5 Escalado Automático
```javascript
// Supabase auto-scaling configurado
SUPABASE_CONFIG = {
  database: {
    tier: 'Pro', // Auto-scaling hasta 25GB RAM
    connection_pooling: true,
    read_replicas: 2 // Para queries pesadas
  },
  
  edge_functions: {
    timeout: '30s',
    memory: '256MB',
    concurrency: 100
  },
  
  storage: {
    cdn: 'Cloudflare global',
    auto_optimize: true, // Compresión automática
    backup_retention: '7 days'
  }
}
```

**💰 Pregunta costo:** "¿Cuál es el costo estimado mensual?"

**💸 Santiago:** 
- Vercel Pro: $20/mes
- Supabase Pro: $25/mes + usage
- EAS: $29/mes
- Sentry: $26/mes (10K errors)
- PostHog: $0-50/mes según usage
- **Total: ~$100-150/mes inicialmente**

---

### 5. DISEÑO - NO SE TOCA

**⚠️ ACUERDO UNÁNIME:** 
El equipo de diseño visual ha cerrado las especificaciones. **NO** se realizarán cambios de UI/UX en esta iteración.

**📐 Restricciones para desarrollo:**
- **CSS:** Solo componentes ya diseñados
- **Layouts:** Fixed, no modificaciones de spacing
- **Colores:** Paleta cerrada (#FF6B6B primary, #1A1A1A dark)
- **Tipografía:** Inter font family únicamente
- **Iconografía:** Heroicons, set predefinido

**✅ Santiago:** "Perfect. Esto acelera development significativamente."

---

## DECISIONES FINALES Y PRÓXIMOS PASOS

### 🎯 SPRINT PLANNING (4 SEMANAS)

#### Semana 1: Foundation Setup
- **Elena:** Service Worker básico + manifest implementation
- **David:** CI/CD pipeline setup + unit tests core
- **Alejandro:** Supabase RLS policies + GDPR basics
- **Santiago:** Vercel deployment + staging environment

#### Semana 2: Core Features
- **Elena:** Audio caching inteligente + offline queue
- **David:** Playwright E2E setup + critical flow tests
- **Alejandro:** Content ID integration + básico moderation
- **Santiago:** EAS mobile build pipeline + monitoring

#### Semana 3: Integration & Testing
- **Todos:** Integration testing conjunto
- **David:** Full test suite + coverage reports
- **Alejandro:** Security audit + penetration testing
- **Santiago:** Production deployment preparation

#### Semana 4: Production Ready
- **Elena:** Install prompts optimization + PWA polish
- **David:** Performance testing + load tests
- **Alejandro:** Legal compliance final review
- **Santiago:** Production launch + monitoring setup

### 📊 SUCCESS METRICS

**PWA:**
- Install rate: >15% after 3 sessions
- Offline usage: >25% users use offline features
- Background audio: 0 interruptions reported

**Testing:**
- Code coverage: >85% overall, >95% core business logic
- E2E test suite: <20 min execution time
- Zero critical bugs reach production

**Security:**
- GDPR compliance: 100% requests handled <30 days
- Content moderation: <5% false positives
- Zero data breaches or security incidents

**Infrastructure:**
- Uptime: >99.9%
- Deploy frequency: Daily (staging), 3x/week (production)
- MTTR: <30 minutes for critical issues

### 🔗 INTERDEPENDENCIAS CRÍTICAS

1. **PWA ↔ Testing:** Elena needs David's test framework para validar Service Worker
2. **Security ↔ Infrastructure:** Alejandro's RLS debe implementarse in Santiago's deploy pipeline
3. **Testing ↔ Infrastructure:** David's CI/CD debe usar Santiago's environments
4. **PWA ↔ Security:** Elena's caching must respect Alejandro's content policies

### 📅 CALENDARIO DE REVIEWS

- **Daily standups:** 9:00 AM UTC+1 (15 min)
- **Weekly demo:** Viernes 16:00 UTC+1 (1 hora)
- **Sprint review:** Last Friday 14:00-17:00 UTC+1 (3 horas)

### 🚨 ESCALATION PATHS

- **Technical blockers:** CTO review within 4 hours
- **Legal issues:** Alejandro direct escalation, no delay
- **Infrastructure outages:** Santiago on-call rotation
- **Testing failures:** David can block deploys unilaterally

---

## COMPROMISOS ASUMIDOS

**✅ Elena (PWA):**
- Service Worker funcional semana 1
- Audio offline caching semana 2  
- Install UX optimizado semana 4

**✅ David (Testing):**
- CI/CD pipeline operativo semana 1
- Full E2E suite semana 2
- 85% coverage achieved semana 3

**✅ Alejandro (Security):**
- RLS policies production-ready semana 1
- GDPR compliance semana 2
- Security audit passed semana 3

**✅ Santiago (DevOps):**
- Staging environment semana 1
- Mobile pipeline semana 2
- Production deployment semana 4

---

**Reunión finalizada:** 16:30 UTC+1  
**Próxima reunión:** Sprint Review - Viernes 31 enero 16:00  
**Documento aprobado por:** Todos los participantes

---

*Acta redactada por: Coordinador Técnico WhatsSound*  
*Distribución: Equipo técnico + Product Management + Legal*