# 📡 Notificaciones Multicanal — Guía Técnica Completa

**Proyecto:** Dame un Ok  
**Área:** Sistemas de Notificación y Comunicación Multicanal  
**Responsable virtual:** Diego Navarro  
**Fecha:** 1 febrero 2026  
**Versión:** 1.0

---

## 1. Principio Fundamental: La Fallback Chain

"Dame un Ok" tiene una promesa implícita: **si el abuelo no está bien, alguien lo sabrá**. Esta promesa se sostiene o se rompe en la capa de notificaciones.

La solución es una **fallback chain**: una cadena de canales donde si uno falla, el siguiente toma el relevo automáticamente.

```
ALERTA AL USUARIO (el abuelo no ha hecho check-in):
  T+0h:     Push notification alta prioridad
  T+30min:  Push recordatorio + vibración + sonido fuerte
  T+1h:     SMS al teléfono del abuelo

ALERTA A FAMILIARES (si el abuelo sigue sin responder):
  T+3h:     Push notification a app familiar
  T+3h:     Email transaccional a todos los contactos
  T+3h15:   SMS a contactos de emergencia
  T+3h30:   WhatsApp message / Telegram (si vinculado)
  T+4h:     Llamada IVR automática al primer contacto
  T+4h15:   Llamada IVR al segundo contacto
  T+6h:     Segunda ronda completa (todos los canales de nuevo)
```

---

## 2. Canal 1: Push Notifications (FCM / APNs)

### 2.1 Firebase Cloud Messaging (FCM) — Android

FCM es el servicio estándar de push para Android. Es gratuito y soporta millones de mensajes.

**Tipos de mensaje:**
- **Notification messages:** Gestionados por el SO. Se muestran automáticamente. No personalizables.
- **Data messages:** Gestionados por la app. Permiten personalización total. **USAR ESTE para Dame un Ok.**

**El problema de Android: Battery Optimization**

Cada fabricante Android implementa su propia "optimización de batería" que **mata apps en background**. Esto es el mayor obstáculo para push fiable:

| Fabricante | Sistema | Comportamiento |
|---|---|---|
| **Xiaomi** | MIUI | Mata apps agresivamente. Requiere "Autostart" + "No battery optimization" |
| **Huawei** | EMUI/HarmonyOS | Mata todo tras 30min en background. Requiere lista blanca manual |
| **Samsung** | OneUI | "Sleeping Apps" mata apps poco usadas. Moderado |
| **OPPO/Realme** | ColorOS | Similar a Xiaomi, muy agresivo |
| **OnePlus** | OxygenOS | Moderado, pero tiene "Deep Optimization" |
| **Vivo** | Funtouch | Muy agresivo, similar a Xiaomi |
| **Google Pixel** | Stock Android | El más permisivo. Doze mode estándar |

**Solución recomendada:**

```kotlin
// 1. Solicitar exclusión de battery optimization
val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
if (!pm.isIgnoringBatteryOptimizations(packageName)) {
    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
    intent.data = Uri.parse("package:$packageName")
    startActivity(intent)
}

// 2. Usar HIGH_PRIORITY en mensajes FCM (servidor)
// Esto fuerza al dispositivo a despertar de Doze
val message = Message.builder()
    .setToken(deviceToken)
    .setAndroidConfig(AndroidConfig.builder()
        .setPriority(AndroidConfig.Priority.HIGH)
        .setDirectBootOk(true)
        .build())
    .putData("type", "checkin_reminder")
    .putData("avatar_name", "Michi")
    .putData("avatar_state", "hungry")
    .build()

// 3. Foreground Service (backup)
// Un foreground service con notificación permanente
// sobrevive a la mayoría de optimizaciones
class CheckinMonitorService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createPersistentNotification()
        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY
    }
}
```

**Guía de onboarding por fabricante:**

La app DEBE mostrar instrucciones específicas según el fabricante del dispositivo:

```kotlin
fun getManufacturerInstructions(): String = when (Build.MANUFACTURER.lowercase()) {
    "xiaomi" -> """
        Para que las notificaciones lleguen siempre:
        1. Ve a Ajustes → Apps → Dame un Ok
        2. Activa "Inicio automático"
        3. En "Ahorro de batería", selecciona "Sin restricciones"
    """
    "huawei" -> """
        1. Ve a Ajustes → Apps → Dame un Ok
        2. Activa "Inicio automático"
        3. En Batería → Más ajustes → Desactivar "Gestión inteligente"
    """
    "samsung" -> """
        1. Ve a Ajustes → Cuidado del dispositivo → Batería
        2. Dame un Ok → "No optimizar"
        3. Desactiva "Poner apps no usadas en reposo"
    """
    else -> "Asegúrate de que Dame un Ok no está optimizada por batería en tus Ajustes."
}
```

### 2.2 Apple Push Notification Service (APNs) — iOS

**Tipos de notificación en iOS:**

| Tipo | Comportamiento | Uso en Dame un Ok |
|---|---|---|
| **Alert** | Banner + sonido estándar | Recordatorios normales |
| **Time Sensitive** (iOS 15+) | Rompe Focus/DND, se muestra inmediato | Alertas de check-in pendiente |
| **Critical Alert** (iOS 12+) | Ignora TODOS los ajustes de silencio/DND. Sonido forzado. | Alertas a familiares |

**Critical Alerts — El Santo Grial:**

Las Critical Alerts son la notificación más intrusiva posible en iOS. Ignoran silencio, modo no molestar, focus mode — todo. Suenan SIEMPRE. Apple las reserva para apps de salud, seguridad y emergencias.

**Proceso para obtener el entitlement:**
1. Escribir a Apple Developer Support explicando el caso de uso
2. Apple revisa si la app califica (seguridad/salud/emergencias)
3. Si aprueba, te dan un entitlement que se añade al provisioning profile
4. La app puede entonces enviar Critical Alerts

**Dame un Ok califica:** Es una app de seguridad personal. La alerta de "tu padre no ha dado señales de vida" es, objetivamente, una emergencia. Hay precedente: apps de teleasistencia y monitorización de salud que han obtenido el entitlement.

```swift
// Solicitar permiso de Critical Alerts en iOS
UNUserNotificationCenter.current().requestAuthorization(
    options: [.alert, .sound, .badge, .criticalAlert]
) { granted, error in
    // Critical alert permission es SEPARADO del permiso estándar
    // El usuario ve un segundo prompt específico para Critical Alerts
}

// Enviar Critical Alert (desde servidor)
let payload: [String: Any] = [
    "aps": [
        "alert": [
            "title": "⚠️ Alerta Dame un Ok",
            "body": "María no ha dado su Ok hoy. Intenta contactarla."
        ],
        "sound": [
            "critical": 1,
            "name": "alert_critical.caf",
            "volume": 1.0  // Volumen máximo, ignora silencio
        ]
    ]
]
```

### 2.3 Tasa de entrega real de push

Basado en datos de la industria y experiencia en teleasistencia:

| Plataforma | Tasa de entrega teórica | Tasa real (primera entrega) | Con optimizaciones |
|---|---|---|---|
| iOS (Alert) | 99%+ | 95-98% | 98%+ (con Time Sensitive) |
| iOS (Critical Alert) | 100% | 99.5%+ | ~100% |
| Android (Pixel/Stock) | 98%+ | 95-97% | 97%+ |
| Android (Samsung) | 95%+ | 88-93% | 95%+ (con exclusión batería) |
| Android (Xiaomi) | 90%+ | 75-85% | 90%+ (con autostart + exclusión) |
| Android (Huawei) | 85%+ | 70-80% | 85%+ (con lista blanca) |

**Conclusión:** Push por sí solo NO es suficiente para mensajes críticos. Se necesita fallback.

---

## 3. Canal 2: SMS

### 3.1 Proveedores para España

| Proveedor | Coste/SMS (España) | Coste/SMS (entrante) | API | Ventajas |
|---|---|---|---|---|
| **Twilio** | 0.0450€ | 0.0075€ | REST + SDK | El más usado, mejor documentación |
| **Vonage (Nexmo)** | 0.0380€ | 0.0065€ | REST + SDK | Más barato para España |
| **Sinch** | 0.0400€ | 0.0060€ | REST | Fuerte en Europa |
| **AWS SNS** | 0.0559€ | N/A (solo salida) | SDK | Si ya usas AWS |
| **MessageBird** | 0.0395€ | 0.0100€ | REST | Plataforma europea (NL) |

**Recomendación:** Vonage para España (mejor precio) con Twilio como fallback.

### 3.2 Números de envío

| Tipo | Formato | Coste mensual | Throughput | Uso |
|---|---|---|---|---|
| **Número largo** | +34 6XX XXX XXX | ~1€/mes | 1 SMS/s | Desarrollo/test |
| **Número corto** | 7XXXX | 200-500€/mes | 100+ SMS/s | Producción |
| **Alphanumeric Sender** | "DameUnOk" | 0€ extra | Varía | Solo envío (no recibe) |

**Para MVP:** Usar número largo con Alphanumeric Sender "DameUnOk" para envíos. Número largo para recibir SMS de check-in.

**Para producción a escala:** Número corto español (requiere registro en CNMC, proceso de 2-4 meses).

### 3.3 Implementación

```typescript
// Envío de SMS de alerta con Twilio
import twilio from 'twilio';

const client = twilio(TWILIO_SID, TWILIO_AUTH);

async function sendAlertSMS(to: string, userName: string, avatarName: string) {
    const message = await client.messages.create({
        body: `${userName} no ha confirmado su bienestar hoy a través de Dame un Ok. ` +
              `${avatarName} no ha sido alimentado. ` +
              `Te recomendamos intentar contactar a ${userName} directamente. ` +
              `— Dame un Ok`,
        from: '+34600000000', // o sender ID "DameUnOk"
        to: to,
        statusCallback: 'https://api.dameunok.com/webhooks/sms/status'
    });
    
    return {
        sid: message.sid,
        status: message.status // 'queued' → 'sent' → 'delivered'
    };
}

// Recepción de SMS de check-in (webhook)
// POST /webhooks/sms/inbound
async function handleInboundSMS(req: Request) {
    const { From, Body } = req.body;
    const normalizedBody = Body.trim().toUpperCase();
    
    // Aceptar múltiples formas de "OK"
    const okPatterns = ['OK', 'SI', 'SÍ', 'BIEN', '1', 'ESTOY BIEN', 'VALE'];
    
    if (okPatterns.includes(normalizedBody)) {
        const user = await findUserByPhone(From);
        if (user) {
            await registerCheckin(user.id, 'sms');
            await sendSMS(From, `✅ ¡${user.avatarName} ha comido! Racha: ${user.streak} días 🔥`);
        }
    }
}
```

### 3.4 Costes estimados a escala (España)

| Escenario | SMS/mes | Coste/mes | Notas |
|---|---|---|---|
| 1.000 usuarios, 5% alertas | ~200 | ~9€ | Solo alertas a familiares |
| 10.000 usuarios, 5% alertas | ~2.000 | ~90€ | + SMS de check-in de feature phones |
| 100.000 usuarios, 3% alertas | ~12.000 | ~540€ | Escala real, tasa menor por engagement |
| + SMS check-in (feature phones) | +30.000 | +1.350€ | Si 10% usa feature phone |

---

## 4. Canal 3: WhatsApp Business API

### 4.1 Tipos de API

| API | Hosting | Coste | Velocidad | Uso |
|---|---|---|---|---|
| **Cloud API (Meta)** | Meta hosted | Gratis (solo coste por conversación) | Rápido | Recomendado |
| **On-Premises API** | Self-hosted | Requiere BSP | Más control | Empresas grandes |
| **Via BSP (Twilio, Vonage)** | Proveedor | Markup del BSP | Fácil integración | Si ya usas Twilio |

**Recomendación:** Cloud API directa de Meta (sin intermediario) para minimizar costes.

### 4.2 Requisitos

1. **Facebook Business Account** verificado (requiere documentación de empresa)
2. **WhatsApp Business Account** asociado
3. **Número de teléfono** dedicado (no puede ser personal)
4. **Verificación de negocio** por Meta (proceso de 1-3 semanas)
5. **Templates pre-aprobados** para mensajes proactivos (fuera de ventana de 24h)

### 4.3 Pricing (España, 2026)

| Categoría | Coste por conversación |
|---|---|
| **Utility** (alertas, notificaciones) | ~0.035€ |
| **Marketing** | ~0.062€ |
| **Authentication** (OTP) | ~0.028€ |
| **Service** (usuario inicia) | Gratis (primeras 1.000/mes) |

Una "conversación" dura 24 horas desde el primer mensaje. Dentro de esa ventana, puedes enviar múltiples mensajes sin coste adicional.

### 4.4 Templates de mensaje (requieren aprobación de Meta)

```
TEMPLATE: checkin_alert
Idioma: es_ES
Categoría: UTILITY
Cuerpo:
"{{1}} no ha confirmado su bienestar hoy a través de Dame un Ok. 
{{2}} no ha sido alimentado desde las {{3}}. 
Te recomendamos intentar contactar a {{1}} directamente.

¿Has podido contactar a {{1}}?
[Sí, está bien] [No contesta]"

Variables:
{{1}} = nombre del usuario (ej: "María")
{{2}} = nombre del avatar (ej: "Michi")
{{3}} = hora límite (ej: "10:00")
```

```
TEMPLATE: family_message_confirmation
Idioma: es_ES
Categoría: UTILITY
Cuerpo:
"✅ Tu mensaje se ha impreso en casa de {{1}}."

Variable: {{1}} = nombre del usuario
```

### 4.5 Implementación (Cloud API)

```typescript
// Enviar template de alerta vía WhatsApp Cloud API
async function sendWhatsAppAlert(
    phoneNumber: string, 
    userName: string, 
    avatarName: string, 
    deadline: string
) {
    const response = await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'template',
                template: {
                    name: 'checkin_alert',
                    language: { code: 'es_ES' },
                    components: [{
                        type: 'body',
                        parameters: [
                            { type: 'text', text: userName },
                            { type: 'text', text: avatarName },
                            { type: 'text', text: deadline }
                        ]
                    }]
                }
            })
        }
    );
    return response.json();
}
```

### 4.6 WhatsApp como canal de mensajería familiar → impresora

El familiar envía un mensaje al número de WhatsApp de Dame un Ok → se imprime en la térmica del abuelo.

```
Webhook de WhatsApp (mensaje entrante):
  POST /webhooks/whatsapp/inbound
  
  1. Identificar al familiar por número de teléfono
  2. Buscar vinculación con impresora del abuelo
  3. Sanitizar mensaje (max 500 chars, filtrar contenido)
  4. Si tiene imagen: convertir a bitmap 1-bit 384px ancho
  5. Encolar en print_queue
  6. Enviar al dispositivo vía MQTT
  7. Confirmar al familiar: "✅ Mensaje impreso en casa de mamá"
```

---

## 5. Canal 4: Telegram Bot API

### 5.1 Ventajas de Telegram

- **Coste: 0€ total.** Sin límites de mensajes, sin costes por conversación, sin verificación de negocio
- API bien documentada, estable, rápida
- Bots muy populares en España (especialmente en tech-savvy 30-50 años)
- Soporta inline keyboards (botones interactivos en mensajes)
- Webhooks fiables

### 5.2 Implementación del bot @DameUnOkBot

```typescript
// Telegram Bot — Dame un Ok
import { Telegraf } from 'telegraf';

const bot = new Telegraf(BOT_TOKEN);

// Comando de vinculación
bot.command('vincular', async (ctx) => {
    await ctx.reply(
        '🔗 Para vincular tu cuenta con la impresora de tu familiar, ' +
        'envíame el código de 6 dígitos que aparece en el dispositivo.',
        { reply_markup: { force_reply: true } }
    );
});

// Recibir mensajes para imprimir
bot.on('text', async (ctx) => {
    const user = await findLinkedUser(ctx.from.id);
    if (!user) {
        return ctx.reply('No tienes ningún dispositivo vinculado. Usa /vincular');
    }
    
    // Encolar mensaje para impresora
    await enqueuePrintMessage({
        printer_device_id: user.printer_id,
        sender_name: user.display_name,
        sender_platform: 'telegram',
        message_text: ctx.message.text
    });
    
    await ctx.reply('✅ Tu mensaje se ha enviado a la impresora de ' + user.elderly_name);
});

// Recibir fotos para imprimir
bot.on('photo', async (ctx) => {
    const user = await findLinkedUser(ctx.from.id);
    if (!user) return;
    
    const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Mayor resolución
    const file = await ctx.telegram.getFile(photo.file_id);
    const imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    
    // Convertir a bitmap 1-bit para impresora
    const bitmap = await convertToPrintBitmap(imageUrl);
    
    await enqueuePrintMessage({
        printer_device_id: user.printer_id,
        sender_name: user.display_name,
        sender_platform: 'telegram',
        message_text: ctx.message.caption || '',
        message_image: bitmap
    });
    
    await ctx.reply('✅ Tu foto se ha enviado a la impresora');
});

// Alerta a familiar (proactiva)
async function sendTelegramAlert(chatId: string, userName: string, avatarName: string) {
    await bot.telegram.sendMessage(chatId, 
        `⚠️ *${userName}* no ha dado su Ok hoy.\n\n` +
        `${avatarName} no ha sido alimentado.\n\n` +
        `¿Has podido contactar a ${userName}?`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: '✅ Sí, está bien', callback_data: `resolved_${alertId}` },
                    { text: '📞 No contesta', callback_data: `escalate_${alertId}` }
                ]]
            }
        }
    );
}
```

---

## 6. Canal 5: IVR — Llamadas Automáticas

### 6.1 ¿Qué es IVR?

IVR (Interactive Voice Response) permite hacer llamadas telefónicas automáticas con voz sintetizada o grabada, y recibir respuestas del usuario mediante teclado numérico (DTMF).

### 6.2 Proveedores

| Proveedor | Coste/minuto (España fijo) | Coste/minuto (España móvil) | TTS español | API |
|---|---|---|---|---|
| **Twilio Voice** | 0.013€ | 0.085€ | Sí (Amazon Polly) | REST |
| **Vonage Voice** | 0.012€ | 0.080€ | Sí | REST + WebSocket |
| **Amazon Connect** | 0.018€ | 0.090€ | Sí (Polly nativo) | SDK |
| **Bandwidth** | 0.010€ | 0.075€ | Sí | REST |

**Recomendación:** Twilio Voice (mejor integración con SMS ya contratado).

### 6.3 Flujo de llamada IVR

```
LLAMADA AUTOMÁTICA A CONTACTO DE EMERGENCIA:

[Ring ring...]
"Hola. Soy Dame un Ok, el servicio de bienestar de María.

María no ha confirmado su bienestar hoy. 
Su hora habitual era las 10 de la mañana, y ya son las 2 de la tarde.

Si ya has contactado a María y está bien, pulsa 1.
Si no has podido contactar a María, pulsa 2.
Para repetir este mensaje, pulsa 9."

[Usuario pulsa 1]
"Gracias. Hemos registrado que María está bien. Hasta mañana."
→ Backend: marca alerta como resuelta

[Usuario pulsa 2]
"Entendido. Vamos a intentar contactar al siguiente contacto de emergencia.
Si la situación es urgente, llama al 112.
Gracias."
→ Backend: escala al siguiente contacto
```

### 6.4 Implementación con Twilio

```typescript
// Iniciar llamada IVR
import twilio from 'twilio';

const client = twilio(TWILIO_SID, TWILIO_AUTH);

async function initiateIVRCall(
    contactPhone: string, 
    userName: string, 
    alertId: string
) {
    const call = await client.calls.create({
        to: contactPhone,
        from: '+34900XXXXXX',
        url: `https://api.dameunok.com/ivr/alert?user=${userName}&alert=${alertId}`,
        statusCallback: `https://api.dameunok.com/webhooks/ivr/status`,
        machineDetection: 'DetectMessageEnd', // Detectar contestador
        timeout: 30
    });
    return call.sid;
}

// TwiML para el árbol IVR
// GET /ivr/alert
function generateAlertTwiML(userName: string, alertId: string) {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Gather input="dtmf" numDigits="1" 
                action="/ivr/response?alert=${alertId}" method="POST">
            <Say voice="Polly.Lucia" language="es-ES">
                Hola. Soy Dame un Ok, el servicio de bienestar de ${userName}.
                ${userName} no ha confirmado su bienestar hoy.
                Si ya has contactado a ${userName} y está bien, pulsa 1.
                Si no has podido contactar a ${userName}, pulsa 2.
                Para repetir este mensaje, pulsa 9.
            </Say>
        </Gather>
        <Say voice="Polly.Lucia" language="es-ES">
            No hemos recibido respuesta. Adiós.
        </Say>
    </Response>`;
}
```

### 6.5 Detección de contestador automático

Twilio puede detectar si responde una persona o un contestador:
- **AMD (Answering Machine Detection):** Analiza los primeros segundos de audio
- Si detecta contestador → deja mensaje grabado
- Si detecta persona → reproduce el flujo IVR

```typescript
// En la llamada:
machineDetection: 'DetectMessageEnd',
// Webhook recibe: AnsweredBy = 'human' | 'machine_start' | 'machine_end_beep'
```

### 6.6 Regulación legal (España)

**LSSI (Ley 34/2002):** Las llamadas comerciales automáticas requieren consentimiento previo. Sin embargo, las llamadas de **seguridad/emergencia** a contactos designados por el usuario están exentas del régimen de comunicaciones comerciales, siempre que:
- El contacto haya aceptado ser contacto de emergencia (opt-in explícito)
- La llamada sea genuinamente de alerta, no comercial
- Se permita al contacto darse de baja

**RGPD:** El contacto de emergencia ha dado su consentimiento al ser añadido como tal. Documentar el consentimiento.

---

## 7. Canal 6: Email Transaccional

### 7.1 Proveedores

| Proveedor | Coste/email | Free tier | Entregabilidad | API |
|---|---|---|---|---|
| **Amazon SES** | 0.0001€ | 62K/mes (primer año) | Alta | SDK |
| **SendGrid** | 0.0001€ | 100/día gratis | Muy alta | REST + SDK |
| **Postmark** | 0.001€ | 100/mes gratis | Excelente | REST |
| **Resend** | 0€ | 3K/mes gratis | Alta | REST |

**Recomendación:** Amazon SES (más barato a escala) o SendGrid (mejor free tier para MVP).

### 7.2 Configuración para máxima entregabilidad

```
DNS Records necesarios:
  SPF:   v=spf1 include:amazonses.com ~all
  DKIM:  Firma criptográfica por dominio
  DMARC: v=DMARC1; p=reject; rua=mailto:dmarc@dameunok.com

Dominio de envío: alertas.dameunok.com (separar del dominio principal)
Reply-to: soporte@dameunok.com
```

### 7.3 Template de email de alerta

```html
Asunto: ⚠️ María no ha dado su Ok hoy — Dame un Ok

Cuerpo:
Hola Javier,

María no ha confirmado su bienestar hoy a través de Dame un Ok.

📅 Fecha: 1 de febrero de 2026
⏰ Hora límite: 10:00 AM
🕑 Hora actual: 13:00 PM
🐱 Estado de Michi: Hambriento desde las 10:00

Esto puede deberse a un olvido, un problema con el teléfono, o cualquier otra razón.

Te recomendamos intentar contactar a María directamente.

[LLAMAR A MARÍA: +34 XXX XXX XXX]
[MARCAR COMO RESUELTA]

---
Dame un Ok — Tu tranquilidad diaria
Este mensaje se ha enviado porque eres contacto de emergencia de María.
Para dejar de recibir estas alertas: [Darme de baja]
```

---

## 8. Arquitectura del Notification Service

### 8.1 Diagrama de flujo

```
┌─────────────────────────────────────────────────────────────┐
│                   NOTIFICATION SERVICE                       │
│                                                              │
│  ┌──────────┐     ┌──────────────┐     ┌────────────────┐   │
│  │ Alert    │────▶│ Channel      │────▶│ Delivery       │   │
│  │ Trigger  │     │ Orchestrator │     │ Tracker        │   │
│  │          │     │              │     │                │   │
│  │ Cron job │     │ Decide qué   │     │ Confirma       │   │
│  │ detecta  │     │ canal usar   │     │ entrega por    │   │
│  │ ausencia │     │ según estado │     │ canal          │   │
│  └──────────┘     │ de la chain  │     │                │   │
│                   └──────┬───────┘     └───────┬────────┘   │
│                          │                     │            │
│                ┌─────────┼─────────┐           │            │
│                ▼         ▼         ▼           │            │
│           ┌────────┐ ┌───────┐ ┌────────┐     │            │
│           │ Push   │ │ SMS   │ │ Voice  │     │            │
│           │Adapter │ │Adapter│ │Adapter │     │            │
│           │(FCM/   │ │(Twilio│ │(Twilio │     │            │
│           │ APNs)  │ │Vonage)│ │ Voice) │     │            │
│           └────────┘ └───────┘ └────────┘     │            │
│                ▼         ▼         ▼           │            │
│           ┌────────┐ ┌───────┐ ┌────────┐     │            │
│           │WhatsApp│ │Telegram│ │ Email  │     │            │
│           │Adapter │ │Adapter│ │Adapter │     │            │
│           │(Meta   │ │(Bot   │ │(SES/   │     │            │
│           │ Cloud) │ │ API)  │ │SendGrid│     │            │
│           └────────┘ └───────┘ └────────┘     │            │
│                                                │            │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Modelo de datos

```sql
-- Tabla de alertas
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'checkin_missed', 'escalation'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(50), -- 'user_checkin', 'contact_confirmed', 'timeout'
    current_escalation_level INTEGER DEFAULT 0
);

-- Tabla de envíos de notificación
CREATE TABLE notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES alerts(id),
    channel VARCHAR(20) NOT NULL, -- 'push', 'sms', 'whatsapp', 'telegram', 'ivr', 'email'
    recipient_id UUID, -- contacto de emergencia
    recipient_address VARCHAR(200), -- teléfono, email, chat_id
    status VARCHAR(20) DEFAULT 'pending', -- 'pending','sent','delivered','read','failed'
    provider_message_id VARCHAR(100), -- ID del proveedor (Twilio SID, etc.)
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    cost_cents INTEGER DEFAULT 0 -- Coste en céntimos de euro
);

-- Índices para consultas rápidas
CREATE INDEX idx_alerts_user_status ON alerts(user_id, status);
CREATE INDEX idx_deliveries_alert ON notification_deliveries(alert_id);
CREATE INDEX idx_deliveries_status ON notification_deliveries(status) WHERE status = 'pending';
```

### 8.3 Lógica del Channel Orchestrator

```typescript
interface NotificationChannel {
    name: string;
    priority: number; // menor = más prioritario
    costCents: number;
    send(recipient: Contact, alert: Alert): Promise<DeliveryResult>;
    checkDelivery(deliveryId: string): Promise<DeliveryStatus>;
}

class ChannelOrchestrator {
    private channels: NotificationChannel[];
    
    async executeFallbackChain(alert: Alert, contacts: Contact[]) {
        // Fase 1: Notificar al usuario
        await this.notifyUser(alert);
        
        // Esperar 3h
        await this.scheduleEscalation(alert, 3 * 60 * 60 * 1000);
    }
    
    async escalateToContacts(alert: Alert, contacts: Contact[]) {
        // Enviar simultáneamente por canales gratuitos
        const freeChannels = ['push', 'email', 'telegram'];
        await Promise.all(
            contacts.flatMap(contact => 
                freeChannels.map(ch => this.sendViaChannel(ch, contact, alert))
            )
        );
        
        // 15 min después: SMS
        await this.scheduleChannelSend('sms', contacts, alert, 15 * 60 * 1000);
        
        // 30 min después: WhatsApp
        await this.scheduleChannelSend('whatsapp', contacts, alert, 30 * 60 * 1000);
        
        // 60 min después: IVR (llamada)
        await this.scheduleChannelSend('ivr', contacts, alert, 60 * 60 * 1000);
    }
}
```

---

## 9. Costes Totales Estimados (España)

### 9.1 Escenario: 10.000 usuarios activos

| Canal | Uso mensual | Coste unitario | Coste/mes |
|---|---|---|---|
| Push (FCM/APNs) | 300.000 | 0€ | 0€ |
| Email (SES) | 5.000 | 0.0001€ | 0.50€ |
| SMS | 2.000 | 0.045€ | 90€ |
| WhatsApp | 500 | 0.035€ | 17.50€ |
| Telegram | 1.000 | 0€ | 0€ |
| IVR (llamadas) | 100 | 0.17€ (2min avg) | 17€ |
| **Total** | — | — | **~125€/mes** |

### 9.2 Escenario: 100.000 usuarios activos

| Canal | Uso mensual | Coste/mes |
|---|---|---|
| Push | 3.000.000 | 0€ |
| Email | 50.000 | 5€ |
| SMS | 15.000 | 675€ |
| WhatsApp | 5.000 | 175€ |
| Telegram | 10.000 | 0€ |
| IVR | 800 | 136€ |
| **Total** | — | **~991€/mes** |

**Nota:** Los canales gratuitos (push, email, Telegram) absorben el 90%+ del volumen. Los canales de pago (SMS, WhatsApp, IVR) solo se usan como fallback para alertas críticas reales.

---

## 10. Monitoring y Alertas del Sistema de Alertas

El sistema que envía alertas también necesita ser monitorizado:

```
ALERTAS INTERNAS (PagerDuty/OpsGenie):
  - Tasa de fallo de push > 5% en última hora → Alerta al equipo
  - SMS gateway no responde → Alerta crítica
  - IVR no puede conectar llamadas → Alerta crítica  
  - Cola de notificaciones > 100 pendientes → Alerta de capacidad
  - Coste diario de SMS > threshold → Alerta de costes (posible spam/abuso)
```

---

*Documento técnico preparado para el equipo de desarrollo de Dame un Ok. Costes basados en pricing público de Twilio, Vonage, Meta y Amazon a enero 2026. Los precios pueden variar.*