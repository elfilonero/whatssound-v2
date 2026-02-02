# Recomendaciones Específicas para WhatsSound

## Roadmap de Implementación Legal y Seguridad

### Fase 1: Pre-lanzamiento (Crítico) - 8 semanas

#### 1.1 Política de Privacidad y Términos de Servicio

**Política de Privacidad RGPD-compliant**:

```markdown
## Template recomendado para secciones críticas:

### 1. Datos que recopilamos
- **Datos de cuenta**: email, nombre usuario, fecha nacimiento
- **Datos de audio**: grabaciones, metadatos, duración
- **Datos de uso**: interacciones, tiempo sesión, preferencias
- **Datos técnicos**: IP, device ID, tipo navegador
- **Datos sociales**: conexiones, listas reproducción compartidas

### 2. Base legal para el tratamiento
- **Ejecución contrato**: servicios principales de la app
- **Consentimiento**: geolocalización, marketing, compartir datos
- **Interés legítimo**: mejoras servicio, análisis uso (anonimizado)

### 3. Compartir datos con terceros
- **Proveedores servicios**: hosting (Supabase), CDN, análisis
- **Entidades musicales**: metadatos para licensing compliance
- **Autoridades**: solo si requerido legalmente

### 4. Derechos del usuario
- **Acceso**: descarga completa datos (JSON)
- **Rectificación**: edición perfil y preferencias
- **Supresión**: eliminación cuenta y datos
- **Portabilidad**: exportación formato estándar
- **Oposición**: opt-out análisis no esencial
```

**Términos de Servicio - Elementos clave**:
- Licencia de uso para contenido musical compartido
- Prohibición explícita de copyright infringement
- Procedimientos de reporte y takedown
- Limitaciones de responsabilidad por contenido usuario
- Jurisdicción y ley aplicable (España/UE)

#### 1.2 Consent Management System

**Implementación técnica recomendada**:

```typescript
// Estructura de consentimientos granulares
interface UserConsent {
  userId: string;
  consents: {
    essential: boolean; // siempre true
    analytics: boolean;
    marketing: boolean;
    geolocation: boolean;
    social_sharing: boolean;
    ai_recommendations: boolean;
  };
  timestamp: Date;
  ip_address: string;
  consent_version: string;
}

// Componente UI - Consent Banner
const ConsentBanner = () => {
  return (
    <div className="consent-banner">
      <p>Usamos cookies y procesamos datos para mejorar tu experiencia.</p>
      <div className="consent-options">
        <label>
          <input type="checkbox" checked disabled /> Esenciales (requeridas)
        </label>
        <label>
          <input type="checkbox" name="analytics" /> Análisis y mejoras
        </label>
        <label>
          <input type="checkbox" name="marketing" /> Marketing personalizado
        </label>
        <label>
          <input type="checkbox" name="geolocation" /> Geolocalización
        </label>
      </div>
      <button onClick="acceptSelected">Aceptar selección</button>
      <button onClick="acceptAll">Aceptar todo</button>
      <a href="/privacy">Más información</a>
    </div>
  );
};
```

#### 1.3 Licencias Musicales Básicas

**Acuerdos inmediatos necesarios**:

1. **SGAE (España)**
   - Tarifa 407.2: Comunicación pública por internet
   - Base: 0.0063€ por reproducción
   - Contacto: digital@sgae.es

2. **AGEDI/AIE**
   - Licensing bundle para plataformas streaming
   - Negociación tarifa startup: 8-12% ingresos netos
   - Contacto: direccion@agedi.es, aie@aie.es

3. **Content ID partnerships**
   - Audible Magic para fingerprinting
   - YouTube Content ID para UGC
   - Implementación pre-lanzamiento obligatoria

**Template de acuerdo básico**:
```
Aplicación: WhatsSound
Territorio: España + UE (fase 1)
Catálogo: Repertorio completo entidad
Modalidad: Streaming no-download
Usuarios estimados: 10K-100K (primer año)
Revenue share: 10-15% ingresos publicitarios + subscripciones
Reporting: Mensual, formato digital estándar
```

#### 1.4 Registro DPO (Data Protection Officer)

**Designación obligatoria** porque WhatsSound:
- Procesa datos a gran escala
- Incluye datos biométricos (audio)
- Monitorea usuarios sistemáticamente

**Opciones recomendadas**:
1. **Alejandro Ruiz** (Dame un OK) - Externo especializado
2. **DPO as a Service** - Empresas especializadas
3. **DPO interno** - Si equipo >50 personas

**Funciones del DPO**:
- Asesoramiento sobre compliance RGPD
- Supervisión de DPIA (evaluaciones impacto)
- Punto contacto con AEPD
- Formación equipo en protección datos

### Fase 2: Post-lanzamiento inmediato (4 semanas)

#### 2.1 Configuración Supabase RLS Avanzada

**Políticas de seguridad específicas**:

```sql
-- Tabla: user_profiles
CREATE POLICY "profile_access" ON user_profiles
  FOR ALL USING (
    auth.uid() = user_id OR 
    (visibility = 'public' AND auth.role() = 'authenticated')
  );

-- Tabla: music_uploads  
CREATE POLICY "music_upload_access" ON music_uploads
  FOR SELECT USING (
    auth.uid() = uploader_id OR
    (
      privacy_level = 'public' OR
      (privacy_level = 'friends' AND 
       auth.uid() IN (
         SELECT friend_id FROM friendships 
         WHERE user_id = music_uploads.uploader_id AND status = 'accepted'
       ))
    )
  );

CREATE POLICY "music_upload_insert" ON music_uploads
  FOR INSERT WITH CHECK (
    auth.uid() = uploader_id AND
    -- Verificar licencia válida
    EXISTS (
      SELECT 1 FROM music_licenses 
      WHERE track_fingerprint = NEW.fingerprint AND status = 'active'
    )
  );

-- Tabla: user_interactions (plays, likes, shares)
CREATE POLICY "interactions_privacy" ON user_interactions
  FOR ALL USING (
    auth.uid() = user_id OR
    -- Solo visible para el dueño del contenido
    auth.uid() = (
      SELECT uploader_id FROM music_uploads 
      WHERE id = user_interactions.music_id
    )
  );

-- Tabla: private_messages
CREATE POLICY "private_messages_access" ON private_messages
  FOR ALL USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

-- Función auxiliar: verificar amistad
CREATE OR REPLACE FUNCTION are_friends(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friendships 
    WHERE (user_id = user1 AND friend_id = user2 AND status = 'accepted')
       OR (user_id = user2 AND friend_id = user1 AND status = 'accepted')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2.2 Sistema de Moderación de Contenido

**Arquitectura de moderación automatizada**:

```typescript
// Pipeline de moderación
interface ModerationPipeline {
  audioAnalysis: {
    copyright_detection: boolean;
    explicit_content: boolean;
    hate_speech: boolean;
    quality_check: boolean;
  };
  textAnalysis: {
    title_moderation: boolean;
    description_moderation: boolean;
    language_detection: boolean;
  };
  user_reports: {
    threshold_reports: number;
    auto_action: 'hide' | 'review' | 'remove';
  };
}

// Implementación con Supabase Functions
const moderateContent = async (uploadId: string) => {
  const { data, error } = await supabase.functions.invoke('moderate-content', {
    body: { upload_id: uploadId }
  });
  
  if (data.flagged) {
    // Marcar para revisión humana
    await supabase
      .from('moderation_queue')
      .insert({
        content_id: uploadId,
        content_type: 'audio',
        flags: data.flags,
        priority: data.severity_score > 0.8 ? 'high' : 'normal',
        status: 'pending_review'
      });
  }
};

// Content policy enforcement
const CONTENT_RULES = {
  audio: {
    max_duration: 300, // 5 minutos
    max_size_mb: 10,
    allowed_formats: ['mp3', 'wav', 'ogg'],
    copyright_tolerance: 0.8 // 80% match = flag
  },
  text: {
    max_length_title: 100,
    max_length_description: 500,
    banned_words: [], // cargar desde DB
    hate_speech_threshold: 0.7
  }
};
```

**Procedimientos DSA compliance**:

1. **Sistema de reportes**:
   - Formulario 24/7 accesible
   - Categorías: copyright, hate speech, explicit content, spam
   - Tracking de reportes por usuario/IP

2. **Notice and Action**:
   - Evaluación inicial: 2 horas
   - Acción: 24 horas máximo
   - Notificación automática a reportante y usuario
   - Sistema de apelaciones interno

3. **Transparencia**:
   - Reporte semestral de moderación
   - Estadísticas públicas de contenido eliminado
   - Directrices comunitarias claras

#### 2.3 Protección de Menores

**Verificación de edad**:

```typescript
interface AgeVerification {
  method: 'self_declaration' | 'credit_card' | 'id_verification';
  age: number;
  country: string;
  parental_consent_required: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
}

// Lógica edad mínima por país UE
const getMinimumAge = (country: string): number => {
  const ages = {
    'AT': 14, 'BE': 13, 'BG': 14, 'CY': 14, 'CZ': 15,
    'DE': 16, 'DK': 13, 'EE': 13, 'ES': 14, 'FI': 13,
    'FR': 15, 'GR': 15, 'HR': 16, 'HU': 16, 'IE': 16,
    'IT': 14, 'LT': 14, 'LU': 16, 'LV': 13, 'MT': 16,
    'NL': 16, 'PL': 13, 'PT': 13, 'RO': 16, 'SE': 13,
    'SI': 15, 'SK': 16
  };
  return ages[country] || 16; // default más restrictivo
};

// Funciones limitadas para menores
const getRestrictedFeatures = (isMinor: boolean) => ({
  geolocation: !isMinor,
  public_profile: !isMinor,
  direct_messages_strangers: !isMinor,
  data_sharing_third_parties: !isMinor,
  behavioral_advertising: !isMinor,
  recommendation_algorithm: isMinor ? 'safe_mode' : 'full'
});
```

### Fase 3: Crecimiento y Optimización (12 semanas)

#### 3.1 Seguridad JWT Avanzada

**Implementación secure tokens**:

```typescript
// Configuración JWT segura
const JWT_CONFIG = {
  algorithm: 'RS256',
  issuer: 'whatssound.app',
  audience: 'whatssound-api',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  rotateRefreshToken: true
};

// Middleware de validación JWT
const validateJWT = async (token: string) => {
  try {
    const payload = jwt.verify(token, PUBLIC_KEY, {
      algorithm: 'RS256',
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
    
    // Verificar si token está en blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new Error('Token revoked');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Rotación automática refresh tokens
const rotateRefreshToken = async (oldToken: string) => {
  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);
  
  // Blacklist token anterior
  await redis.setex(`blacklist:${oldToken}`, 604800, 'revoked'); // 7 días
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
```

#### 3.2 Audit Trail y Compliance Monitoring

**Sistema de auditoría completo**:

```sql
-- Tabla de auditoría
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(30),
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID
);

-- Índices para consultas frecuentes
CREATE INDEX idx_audit_user_time ON audit_log(user_id, timestamp);
CREATE INDEX idx_audit_action_time ON audit_log(action, timestamp);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);

-- Trigger para auditar cambios en datos sensibles
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id, action, resource_type, resource_id,
    old_values, new_values, ip_address
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::TEXT,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    inet_client_addr()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

#### 3.3 Licencias Internacionales

**Expansión territorial progresiva**:

**Fase 3A - Europa (semana 16-20)**:
- GEMA (Alemania)
- SACEM (Francia) 
- PRS for Music (Reino Unido)
- STIM (Suecia)

**Fase 3B - América (semana 20-24)**:
- ASCAP/BMI (EE.UU.)
- SOCAN (Canadá)
- ECAD (Brasil)

**Template negociación internacional**:
```
Modelo de licencia: Direct licensing vs. Hub deals
Territorio: País específico o región
Catálogo: Local vs. repertorio mundial
Revenue share: 8-15% según territorio
Minimum guarantee: €10K-50K anuales
Reporting: Estándar DDEX (digital data exchange)
Currency: Local vs. EUR/USD
```

### Fase 4: Optimización Avanzada (Continuo)

#### 4.1 Privacy by Design Avanzado

**Técnicas de minimización de datos**:

```typescript
// Pseudonimización automática
const pseudonymizeUser = (userId: string): string => {
  const salt = process.env.PSEUDONYM_SALT;
  return crypto
    .createHash('sha256')
    .update(userId + salt)
    .digest('hex')
    .substring(0, 16);
};

// Agregación diferencial para analytics
const generatePrivateAnalytics = (rawData: UserEvent[]) => {
  const epsilon = 0.1; // privacy budget
  const noise = generateLaplaceNoise(epsilon);
  
  return {
    daily_active_users: rawData.length + noise,
    avg_session_duration: calculateAverage(rawData.map(d => d.duration)) + noise,
    popular_genres: addNoiseToDistribution(getGenreDistribution(rawData), epsilon)
  };
};

// Data retention automático
const scheduleDataRetention = () => {
  cron.schedule('0 2 * * *', async () => {
    // Eliminar datos más antiguos que retention period
    await cleanupOldAuditLogs();
    await anonymizeOldUserData();
    await purgeDeletedAccounts();
  });
};
```

#### 4.2 Compliance Automation

**Dashboard de compliance en tiempo real**:

```typescript
interface ComplianceMetrics {
  rgpd: {
    data_requests_pending: number;
    avg_response_time_hours: number;
    consent_rate_percentage: number;
    data_breaches_ytd: number;
  };
  content_moderation: {
    reports_pending: number;
    avg_resolution_time_hours: number;
    false_positive_rate: number;
    content_removed_ytd: number;
  };
  music_licensing: {
    unlicensed_content_detected: number;
    license_compliance_rate: number;
    royalty_payments_pending: number;
  };
}

// Alertas automáticas
const complianceAlerts = {
  rgpd_response_overdue: 'Solicitud RGPD > 30 días sin respuesta',
  high_copyright_violations: 'Infracciones copyright > umbral',
  license_payment_due: 'Pago licencias vence en 7 días',
  security_incident: 'Posible brecha de seguridad detectada'
};
```

## Checklist de Lanzamiento

### ✅ Legal y Compliance (Crítico)
- [ ] Política de Privacidad publicada y accesible
- [ ] Términos de Servicio actualizados
- [ ] DPO designado y registrado
- [ ] Consent management system implementado
- [ ] DPIA completada y archivada
- [ ] Procedimientos RGPD documentados

### ✅ Licencias Musicales (Crítico)
- [ ] Acuerdo con SGAE firmado
- [ ] Acuerdo con AGEDI/AIE firmado  
- [ ] Content ID system implementado
- [ ] Sistema de reporting automático
- [ ] Procedimientos takedown documentados

### ✅ Seguridad Aplicativa (Crítico)
- [ ] Supabase RLS policies configuradas
- [ ] JWT security implementado
- [ ] HTTPS/TLS 1.3 configurado
- [ ] Security headers configurados
- [ ] Penetration testing completado

### ✅ Moderación de Contenido (Crítico)
- [ ] Sistema de reportes implementado
- [ ] Pipeline de moderación automatizada
- [ ] Procedimientos DSA documentados
- [ ] Equipo de moderación formado
- [ ] Sistema de apelaciones activo

### ✅ Protección de Menores (Crítico)
- [ ] Verificación de edad implementada
- [ ] Funciones limitadas para menores
- [ ] Parental consent system (si aplica)
- [ ] Safe mode por defecto menores

## Contactos de Implementación

### Legal y RGPD
- **Alejandro Ruiz** (Dame un OK) - DPO especializado
- **Eduardo Ustaran** (Hogan Lovells) - Consultoría internacional
- **AEPD** - Consultas formales compliance

### Licencias Musicales
- **SGAE Digital**: digital@sgae.es
- **AGEDI**: direccion@agedi.es  
- **AIE**: aie@aie.es
- **Audible Magic**: partnerships@audiblemagic.com

### Seguridad
- **Supabase Security**: security@supabase.io
- **OWASP España**: spain@owasp.org
- **INCIBE**: info@incibe.es

### Moderación
- **Trust & Safety Consulting**
- **Content Moderation vendors**: Besedo, Crisp Thinking
- **YouTube Content ID**: content-partnerships@google.com

## Presupuesto Estimado (Primer Año)

| Categoría | Costo Estimado | Notas |
|-----------|---------------|--------|
| DPO Externo | €15K-25K | Alejandro Ruiz o similar |
| Licencias SGAE | €5K-15K | Basado en uso real |
| Licencias AGEDI/AIE | €8K-20K | Revenue share |
| Content ID System | €10K-20K | Setup + ongoing |
| Security Audit | €8K-15K | Anual |
| Legal Compliance | €20K-35K | Asesoría continua |
| **Total** | **€66K-130K** | Escalable según crecimiento |

---

*Implementación recomendada por fases para minimizar riesgo y optimizar time-to-market. Priorizar elementos críticos marcados como "Crítico" antes del lanzamiento público.*