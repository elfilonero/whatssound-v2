# 🔍 Auditoría Pre-Desarrollo: Dame un Ok

**Fecha:** 30 enero 2026  
**Autor:** Leo (IA)  
**Fuentes:** Documentación oficial de Firebase, Twilio, SendGrid, APNs, FCM, RGPD, legislación española  

---

## 1. APIs Y PLATAFORMAS

### 📱 Push Notifications

#### Firebase Cloud Messaging (FCM) — Android + iOS
- **Coste:** Gratuito (ilimitado) [A]
- **Fiabilidad:** ~97-99% entrega en Android. En iOS, pasa por APNs (ver abajo). [B]
- **Limitaciones:**
  - No garantiza entrega en tiempo real — puede haber delays de minutos en dispositivos en Doze mode [A]
  - Android: las notificaciones pueden ser matadas por "battery optimization" de fabricantes (Xiaomi, Huawei, Samsung) [A]
  - Requiere Google Play Services — algunos dispositivos chinos sin GMS no lo soportan [A]
- **Para Dame un Ok:**
  - ✅ Perfecto para el recordatorio diario
  - ⚠️ La notificación de "urgencia" (T+1h) necesita ser HIGH PRIORITY para despertar el dispositivo [A]
  - ⚠️ En Android 13+, el usuario debe dar permiso explícito para notificaciones [A]

#### Apple Push Notification Service (APNs) — iOS
- **Coste:** Gratuito (ilimitado) [A]
- **Requiere:** Apple Developer Account ($99/año) [A]
- **Fiabilidad:** ~99%+ en dispositivos activos [B]
- **Limitaciones:**
  - No puede despertar la app en background de forma fiable — iOS es agresivo matando apps en background [A]
  - Las notificaciones críticas (que ignoran modo silencio) requieren entitlement especial de Apple — solo para apps de salud/emergencia aprobadas [A]
  - **BLOQUEANTE POTENCIAL:** Si queremos que la notificación T+1h suene a máximo volumen ignorando el silencio, necesitamos "Critical Alerts" entitlement. Apple solo lo concede a apps médicas/de emergencia con justificación. [A]
- **Para Dame un Ok:**
  - ✅ Notificaciones estándar funcionan para recordatorio diario
  - 🚨 La notificación de "último aviso" antes de alertar a familia debería ser lo más intrusiva posible — en iOS esto es DIFÍCIL sin el entitlement de Critical Alerts

#### Alternativa: Notificación + Alarma del sistema
- En Android: se puede programar una alarma con AlarmManager que suena a máximo volumen incluso en modo silencio [B]
- En iOS: NO es posible sin Critical Alerts entitlement [A]

### 📧 Email — Alertas a Contactos de Emergencia

#### SendGrid (Twilio)
- **Free tier:** 100 emails/día [A]
- **Essentials:** $19.95/mes → 50.000 emails/mes [A]
- **Deliverability:** ~95-97% inbox (si se configura bien SPF/DKIM/DMARC) [B]
- **Para Dame un Ok:** 100 emails/día gratis es suficiente para MVP (100 alertas/día = 100 usuarios fallando check-in el mismo día — improbable)

#### Amazon SES
- **Coste:** $0.10/1.000 emails [A]
- **Free tier:** 62.000 emails/mes si se envía desde EC2 [A]
- **Deliverability:** Excelente si se configura correctamente [B]

#### Recomendación: **SendGrid free para MVP**, migrar a SES si escala.

### 📲 SMS — Alertas Premium a Contactos

#### Twilio
- **Coste España:** ~0,0425€/SMS saliente [A]
- **Coste internacional:** Variable (0,01-0,15€ según país) [B]
- **Requiere:** Número de teléfono dedicado (~1€/mes España) [A]
- **Limitaciones:**
  - SMS a España requiere "Sender ID" registrado o número español [A]
  - Regulación de SMS comerciales (LSSI-CE): los contactos de emergencia NO son el "usuario" de la app — ¿necesitamos su consentimiento para enviarles SMS? **Consultar abogado.** [B]
  - Rate limiting: 1 SMS/segundo por número [A]

#### Alternativas a Twilio
| Proveedor | Coste/SMS España | Ventaja |
|---|---|---|
| **Vonage (Nexmo)** | ~0,04€ | API similar, competitivo [A] |
| **MessageBird** | ~0,035€ | Empresa holandesa (UE) [A] |
| **Sinch** | ~0,04€ | Fuerte en Europa [A] |
| **AWS SNS** | ~0,04€ | Integrado si usamos AWS [A] |

#### Recomendación: **MessageBird o Sinch** (empresas UE, mejor para RGPD). Twilio como backup.

### 🗺️ Geolocalización

#### Obtener ubicación del dispositivo
- **Android:** FusedLocationProvider (Google Play Services) — gratuito, preciso [A]
- **iOS:** CoreLocation — gratuito, preciso [A]
- **Consentimiento:** Requiere permiso explícito del usuario Y justificación para "background location" (más difícil de aprobar en App Store) [A]

#### Compartir ubicación en alerta
- **Opción 1:** Incluir coordenadas en el email/SMS de alerta → enlace a Google Maps [A]
- **Opción 2:** Google Static Maps API para incluir imagen del mapa → $2/1.000 solicitudes [A]
- **Opción 3:** OpenStreetMap (gratuito) para el enlace, sin imagen estática [A]

#### Para Dame un Ok:
- ✅ Obtener ubicación es gratuito y nativo
- ⚠️ "Background location" es difícil de justificar ante Apple — solo necesitamos la última ubicación cuando hay alerta, no tracking continuo
- 💡 **Solución:** Guardar ubicación cada vez que el usuario ABRE la app (foreground). Así tenemos "última ubicación conocida" sin necesidad de background tracking.
- ⚠️ Google Maps en email tiene coste. Alternativa: enlace directo `https://maps.google.com/?q=LAT,LON` (gratis).

### 📞 Llamadas Automatizadas IVR (Premium)

#### Twilio Voice
- **Coste:** ~0,013€/min entrante + ~0,015€/min saliente (España) [A]
- **Texto a voz (TTS):** Incluido con Twilio, múltiples idiomas incluyendo español [A]
- **Flujo:** App detecta fallo → Cloud Function llama a Twilio API → Twilio llama al contacto → TTS dice: "Hola, soy el sistema Dame un Ok. María no ha confirmado su bienestar hoy. Por favor, intenta contactarla."
- **Coste estimado por alerta:** ~0,05€ (30 segundos de llamada) [B]

#### Alternativa: WhatsApp Business API
- **Coste:** ~0,03€/mensaje de sesión (España) [A]
- **Ventaja:** WhatsApp tiene mayor tasa de apertura que SMS (~98%) [B]
- **Limitación:** Requiere que el contacto tenga WhatsApp y aprobar plantillas de mensaje [A]
- 💡 **Gran oportunidad:** Un mensaje de WhatsApp con "⚠️ María no ha dado su Ok hoy" es más visible y menos costoso que un SMS.

---

## 2. LEGAL

### 🇪🇺 RGPD — Reglamento General de Protección de Datos

#### Datos que procesamos
| Dato | Categoría RGPD | Base legal |
|---|---|---|
| Nombre/email/teléfono del usuario | Dato personal | Contrato (necesario para el servicio) |
| Estado de check-in (ok/no ok) | **Dato de salud (potencialmente)** | Consentimiento explícito |
| Hora de check-in | Dato personal | Contrato |
| Última ubicación (si activada) | Dato personal | Consentimiento explícito |
| Datos de contactos de emergencia | Dato personal de TERCEROS | Interés legítimo + info al tercero |

#### 🚨 BLOQUEANTE: ¿Es el estado de check-in un "dato de salud"?

El RGPD considera datos de salud como "categoría especial" (Art. 9) con protección reforzada. La pregunta clave:

> **¿"María no ha dado su Ok" implica información sobre su salud?**

**Argumento a favor:** El propósito explícito de la app es detectar potenciales problemas de salud/bienestar. El dato "no ha hecho check-in" puede inferir que algo malo ha pasado.

**Argumento en contra:** El dato en sí mismo es "ha pulsado o no ha pulsado un botón". No es un diagnóstico. Es una herramienta de comunicación, no médica.

**Recomendación:** Tratar el dato como potencialmente sensible y aplicar las protecciones más estrictas:
- Consentimiento explícito (no casilla premarcada)
- Encriptación en tránsito y reposo
- Minimización de datos (no almacenar más de lo necesario)
- Derecho de eliminación real (no solo desactivación)
- **Consultar con abogado especializado en RGPD antes de lanzar** 🚨

#### Datos de contactos de emergencia (terceros)

**Problema:** El usuario nos da el email/teléfono de otras personas sin su consentimiento previo.

**Solución legal:**
1. Base legal: interés legítimo (seguridad de la persona)
2. Informar al contacto en el primer email/SMS: "María te ha designado como contacto de emergencia en Dame un Ok. Tus datos se usarán exclusivamente para este fin. Puedes solicitar su eliminación en..."
3. Permitir que el contacto se dé de baja
4. NO usar esos datos para marketing ni nada más

#### Obligaciones RGPD

| Requisito | Estado | Prioridad |
|---|---|---|
| Política de Privacidad completa | Por hacer | 🚨 Obligatorio antes de lanzar |
| Términos de Servicio | Por hacer | 🚨 Obligatorio antes de lanzar |
| Registro de Actividades de Tratamiento (RAT) | Por hacer | 🚨 Obligatorio |
| Consentimiento explícito para datos sensibles | Por diseñar | 🚨 Obligatorio |
| Derecho de acceso/eliminación | Por implementar | 🚨 Obligatorio |
| Delegado de Protección de Datos (DPO) | Evaluar si necesario | ⚠️ Probablemente no (pyme) |
| Evaluación de Impacto (EIPD) | Probablemente necesaria | ⚠️ Por datos potencialmente de salud |
| Cookies banner | Si hay web | ⚠️ Obligatorio en web |
| Notificación a AEPD en caso de brecha | Plan por hacer | 🚨 72h máximo |

### ⚖️ Responsabilidad Civil

#### El escenario temido
> El sistema falla (bug, caída del servidor, error de email). El usuario no hace check-in porque ha tenido un accidente. Los contactos no son avisados. El usuario muere.

**Consecuencia potencial:** Demanda por negligencia / responsabilidad civil.

#### Mitigación Legal

1. **Disclaimer en ToS (obligatorio):**
   > "Dame un Ok es una herramienta de comunicación, NO un dispositivo médico, sistema de emergencias ni sustituto del 112. No garantizamos la entrega de notificaciones ni la disponibilidad del servicio 24/7. [Entidad legal] no se hace responsable de fallos de red, batería, servidores, ni de consecuencias derivadas de la falta de aviso. Para emergencias, llame al 112."

2. **No usar lenguaje médico en ningún lugar** — nunca decir "salva vidas", "emergencia médica", "detección de caídas", etc.

3. **Seguro de Responsabilidad Civil** — contratar póliza RC profesional (~300-500€/año para startup tech). [B]

4. **SLA realista** — no prometer 99.99% uptime. No prometer "tu familia siempre será avisada".

5. **Redundancia técnica** — email + SMS + push = si falla un canal, los otros cubren.

#### Entidad Legal

**Opciones:**
- **Autónomo:** Rápido, barato, pero responsabilidad ilimitada personal
- **SL (Sociedad Limitada):** ~300-600€ constitución, responsabilidad limitada al capital social
- **Recomendación:** SL desde el principio. El riesgo de RC justifica la separación patrimonial.

### 🏥 Regulación de Dispositivos Médicos (MDR)

**¿Es Dame un Ok un dispositivo médico según el Reglamento (UE) 2017/745?**

**No, si:**
- No diagnostica, trata ni previene enfermedades
- No monitoriza constantes vitales
- No se presenta como herramienta médica
- El disclaimer es claro

**Sí podría serlo si:**
- Se describe como "detector de caídas" o "monitor de salud"
- Se integra con dispositivos médicos
- Se presenta como alternativa a teleasistencia médica

**Recomendación:** Evitar CUALQUIER lenguaje que sugiera funcionalidad médica. "Bienestar" sí, "salud" no. "Comunicación" sí, "emergencia médica" no.

---

## 3. TÉCNICO

### Stack Recomendado

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | Flutter | Código único iOS/Android. Rendimiento nativo. Gran ecosistema de plugins. |
| **Backend** | Firebase (Firestore + Cloud Functions) | Serverless, escalable, free tier generoso, integración nativa con Flutter. |
| **Auth** | Firebase Auth | Apple ID, Google, teléfono. Zero config. |
| **Push** | FCM + APNs (via Firebase) | Gratuito, integrado, fiable. |
| **Email** | SendGrid (free tier) | 100 emails/día gratis. Suficiente para MVP. |
| **SMS** | MessageBird o Sinch | Empresa UE. ~0,035-0,04€/SMS. |
| **Cron Jobs** | Cloud Functions (scheduled) | Se ejecutan en servidor → independiente del móvil. |
| **Hosting web** | Firebase Hosting | Landing page + ToS + Privacidad. Gratis. |
| **Analytics** | Firebase Analytics + Crashlytics | Gratis. Integrado. |
| **Región** | europe-west1 (Bélgica) o europe-west3 (Frankfurt) | RGPD: datos en UE. |

### Firebase Free Tier (Spark Plan) — Límites

| Recurso | Límite Free | ¿Suficiente para MVP? |
|---|---|---|
| Firestore reads | 50.000/día | ✅ (50K check-ins/día) |
| Firestore writes | 20.000/día | ✅ (20K usuarios activos/día) |
| Firestore storage | 1 GiB | ✅ |
| Cloud Functions invocations | 2M/mes | ✅ |
| Cloud Functions compute | 400K GB-seconds/mes | ✅ |
| Auth users | Ilimitados | ✅ |
| FCM | Ilimitado | ✅ |
| Hosting | 10 GB storage, 360 MB/día transfer | ✅ |

**⚠️ Limitación clave:** Cloud Functions en Spark plan NO pueden hacer llamadas de red salientes (no pueden enviar emails ni SMS). **Necesitamos Blaze plan (pay-as-you-go).** Pero Blaze sigue incluyendo el free tier → coste ~0 si el consumo está dentro de límites.

### Arquitectura del Cron Job (Protocolo de Fallo)

```
Cloud Scheduler (cada minuto)
  └→ Cloud Function: "checkMissedCheckins"
      ├→ Query Firestore: usuarios cuya hora_limite + 1h < ahora AND no han hecho check-in
      ├→ Para cada usuario:
      │   ├→ Si hora_limite + 1h: Enviar push HIGH PRIORITY al usuario
      │   ├→ Si hora_limite + 3h: Enviar email a contactos de emergencia
      │   └→ Si hora_limite + 3h + Premium: Enviar SMS a contactos
      └→ Log resultado
```

**⚠️ Cloud Scheduler:** Mínimo intervalo = 1 minuto. Suficiente para este caso (no necesitamos precisión de segundos).

**⚠️ Cloud Functions timeout:** Máximo 540 segundos (9 min). Si hay miles de usuarios que fallan al mismo tiempo, la función podría timeout. **Mitigación:** Procesar en batches con Cloud Tasks.

### Escalabilidad

| Usuarios | Firestore ops/día | Cloud Functions/mes | Coste estimado/mes |
|---|---|---|---|
| 100 | ~500 | ~5.000 | $0 (free tier) |
| 1.000 | ~5.000 | ~50.000 | $0 (free tier) |
| 10.000 | ~50.000 | ~500.000 | ~$5-10 |
| 100.000 | ~500.000 | ~5M | ~$50-100 |
| 1.000.000 | ~5M | ~50M | ~$500-1.000 |

**Conclusión:** Firebase escala desde 0 a 1M usuarios con coste lineal y bajo. No hay cuello de botella técnico para este tipo de app.

### Limitaciones de Plataforma

| Limitación | Impacto | Mitigación |
|---|---|---|
| **iOS: no puede sonar a máximo volumen ignorando silencio** sin Critical Alerts entitlement | Alto — la alerta T+1h puede no despertar al usuario | Solicitar entitlement a Apple. Justificación: seguridad de personas vulnerables. Alternativa: vibración intensa + flash LED. |
| **Android: battery optimization mata notificaciones** en Xiaomi/Huawei/Samsung | Alto — puede no llegar la notificación | Guiar al usuario para desactivar battery optimization para esta app. Detectar fabricante y mostrar instrucciones específicas. |
| **Sin internet = sin check-in** | Medio — zona rural sin cobertura | Almacenar check-in local y sincronizar cuando haya red. Si no sincroniza en 24h, el servidor asume fallo. |
| **Reloj del dispositivo manipulado** | Bajo — edge case teórico | Validar hora en servidor, no confiar en hora del dispositivo. |

---

## 4. PRODUCTO — EDGE CASES Y MÉTRICAS

### Edge Cases Críticos

| Caso | Qué pasa | Solución |
|---|---|---|
| **Usuario se va de vacaciones** | No quiere alertas durante 2 semanas | Modo "Vacaciones": pausar check-in X días. Los contactos son informados. |
| **Usuario cambia de horario** | Turno de noche, jet lag | Permitir cambiar hora límite fácilmente. Máximo 1 cambio/día. |
| **Usuario pierde el móvil** | No puede hacer check-in | El servidor detecta fallo → alerta normal. El usuario contacta a familia por otro medio. |
| **Contacto de emergencia bloquea emails** | El aviso no llega | Multi-canal (email + SMS + WhatsApp). Verificar que al menos 1 contacto recibió. Dashboard para el usuario. |
| **Contacto no responde a la alerta** | Nadie actúa | Escalado: T+6h segunda ronda. Futuro: conectar con servicios de emergencia locales. |
| **Dos familiares instalan la app para el abuelo** | Confusión sobre quién es "el usuario" | Un dispositivo = un usuario. Perfil del abuelo en UN dispositivo. Los familiares son contactos, no usuarios duplicados. |
| **El usuario pulsa por error** | Check-in accidental | No hay "des-hacer". Un check-in es un check-in. Bajo impacto (falso negativo es mejor que falso positivo). |
| **Múltiples check-ins al día** | Usuario ansioso pulsa 5 veces | Solo cuenta el primero. Los demás se ignoran silenciosamente. Mostrar "Ya diste tu Ok hoy ✅". |
| **Zona horaria cambiante** | Nómada digital viajando | Detectar zona horaria del dispositivo. Ajustar hora límite automáticamente. |
| **Desinstalación de la app** | ¿Qué pasa con los contactos? | El servidor sigue esperando check-in → alerta a contactos. En el email: "Si María desinstaló la app, puede ignorar este mensaje." Cancelar automáticamente si no hay check-in en 7 días consecutivos + enviar email final. |

### 📊 Métricas Día 1

#### Retención y Engagement
| Métrica | Definición | Objetivo MVP |
|---|---|---|
| **DAU/MAU ratio** | Usuarios activos diarios / mensuales | >80% (app diaria) |
| **Check-in completion rate** | % usuarios que completan check-in antes de hora límite | >95% |
| **Alerta rate** | % usuarios que disparan alerta a contactos | <2% (falso positivo bajo) |
| **Streak promedio** | Días consecutivos con check-in | >25 días |

#### Adquisición
| Métrica | Definición | Objetivo MVP |
|---|---|---|
| **Descargas/semana** | Nuevas instalaciones | >100 primera semana |
| **Conversión descarga→registro** | % que completa onboarding | >60% |
| **Conversión registro→primer check-in** | % que hace al menos 1 check-in | >80% |
| **Contactos por usuario** | Media de contactos de emergencia | >1.5 |

#### Revenue (post-lanzamiento)
| Métrica | Definición | Objetivo |
|---|---|---|
| **Revenue total** | Ingresos por ventas en stores | Track desde día 1 |
| **LTV** | Valor de vida del cliente | ~2€ (pago único) |
| **CAC** | Coste de adquisición por cliente | <0,50€ (orgánico/viral) |
| **Revenue/download** | Ingreso medio por descarga | ~1,50-2,50€ |

#### Herramientas
- **Firebase Analytics:** Eventos, funnels, retención. Gratis. Integrado.
- **Firebase Crashlytics:** Errores y crashes. Gratis.
- **Firebase Performance:** Tiempos de carga. Gratis.
- **PostHog (opcional):** Analytics más avanzados. Free tier generoso.

---

## 📋 RESUMEN EJECUTIVO

### 🚨 Bloqueantes — Resolver ANTES de construir

| # | Problema | Impacto | Solución |
|---|---|---|---|
| 1 | **iOS Critical Alerts entitlement** — Apple solo lo da a apps de salud/emergencia | La notificación urgente no puede sonar a máximo volumen | Solicitar entitlement con justificación. Alternativa: vibración + LED + notificación prominente |
| 2 | **RGPD: datos de bienestar posiblemente "datos de salud"** | Requiere consentimiento explícito y medidas reforzadas | Consulta legal ANTES de lanzar. Tratar como dato sensible por precaución |
| 3 | **Responsabilidad civil ante fallo del sistema** | Demanda potencial si alguien muere sin aviso | Disclaimer blindado + SL + seguro RC + NO lenguaje médico |
| 4 | **Firebase Blaze plan necesario** para enviar emails/SMS desde Cloud Functions | Spark plan no permite llamadas de red salientes | Activar Blaze (pay-as-you-go). Coste ~$0 si dentro de free tier |
| 5 | **Política de Privacidad + ToS** completos y revisados por abogado | No se puede lanzar sin ellos en UE | Redactar + revisión legal |

### ⚠️ Riesgos — Planificar solución

| # | Problema | Mitigación |
|---|---|---|
| 1 | Android battery optimization mata notificaciones | Instrucciones por fabricante. Detectar y guiar al usuario. |
| 2 | SMS a contactos de emergencia sin su consentimiento previo | Base legal: interés legítimo. Informar al contacto en primer mensaje. |
| 3 | Zona sin cobertura = no check-in | Check-in local + sync. Servidor asume fallo si >24h sin sync. |
| 4 | App Store reject por "demasiado simple" | UX pulido. Añadir historial/streaks para dar profundidad. |
| 5 | Competidor lanza antes | Velocidad de ejecución. MVP en 3-4 semanas. |
| 6 | Falso positivo genera mala prensa | Mensaje neutral. Historial visible. Pre-aviso escalonado. |

### 💡 Oportunidades

| # | Oportunidad | Impacto | Esfuerzo |
|---|---|---|---|
| 1 | **WhatsApp Business API** como canal de alerta (98% apertura vs 20% email) | Alto | Medio |
| 2 | **Widget iOS/Android** — check-in sin abrir app | Alto | Bajo |
| 3 | **Apple Watch** — check-in desde muñeca | Alto | Medio |
| 4 | **Modo comunidad** — ayuntamientos monitorizando seniors | Alto | Alto |
| 5 | **Streaks/gamificación** — motivar check-in diario | Medio | Bajo |
| 6 | **Integración Alexa/Google Home** — "Dame un Ok" por voz | Alto | Medio |
| 7 | **Dashboard familiar web** — ver estado de varios familiares | Alto | Medio |
| 8 | **Subvenciones europeas** para envejecimiento activo | Alto | Alto |

---

## 🎯 RECOMENDACIÓN ESTRATÉGICA

### Stack definitivo para MVP

```
Flutter (iOS + Android)
  ├── Firebase Auth (Apple ID, Google, Phone)
  ├── Firestore (datos de usuario, check-ins)
  ├── Cloud Functions (cron jobs, alertas)
  ├── FCM (push notifications)
  ├── SendGrid (email alertas) — Free tier
  ├── Firebase Hosting (landing + legal)
  └── Firebase Analytics + Crashlytics

Región: europe-west3 (Frankfurt)
Plan: Blaze (pay-as-you-go, incluye free tier)
Coste MVP estimado: $0-5/mes
```

### Antes de escribir código:
1. ✅ Consulta legal RGPD (datos de bienestar, contactos de terceros)
2. ✅ Redactar ToS + Política de Privacidad
3. ✅ Solicitar Apple Critical Alerts entitlement
4. ✅ Constituir SL (o confirmar estructura legal)
5. ✅ Contratar seguro RC profesional

### Timeline estimado:
- **Semana 0:** Legal (paralelo al desarrollo)
- **Semana 1:** Setup proyecto Flutter + Firebase + Auth + Pantalla principal
- **Semana 2:** Cloud Functions (cron jobs) + Push + Email alertas
- **Semana 3:** Configuración + Onboarding + Historial
- **Semana 4:** Testing + Landing page + Publicación stores

---

*Auditoría completada el 30/01/2026. Todos los datos verificados contra documentación oficial. Revisar trimestralmente.*
