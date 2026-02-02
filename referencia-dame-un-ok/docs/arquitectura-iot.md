# 🌐 Arquitectura IoT — Dame un Ok

**Fecha:** 31 enero 2026  
**Versión:** 1.0  
**Autores:** Marcos Delgado (IoT/Hardware), Elena Soto (Embebidos), Ricardo Montoya (Telecom), Iñaki Goicoechea (Cloud)  
**Documentado por:** Leo (IA)

---

## 1. Visión General: Estrategia Multi-Dispositivo

"Dame un Ok" nace como app móvil, pero su verdadero potencial está en convertirse en un **ecosistema de dispositivos** que permita hacer check-in desde cualquier punto del hogar, sin depender de un smartphone moderno.

### Principio Rector

> **"El check-in debe ser tan fácil como encender la luz."**

No importa si el usuario tiene un iPhone 16 o un Nokia con teclas. No importa si está en el sofá, en la cocina o en la cama. Siempre debe haber un botón al alcance que diga "estoy bien".

### Ventaja Competitiva: Vertex como Fabricante

Vertex dispone de **fábrica propia con CNC y líneas de producción**, lo que permite:
- Iterar prototipos en días (no semanas)
- Controlar costes de fabricación directamente
- Producir tiradas cortas para validación antes de escalar
- Personalizar carcasas y formatos sin depender de terceros
- Certificación CE gestionada internamente

### Familia de Dispositivos

| # | Dispositivo | Protocolo | Alimentación | Coste Est. | Prioridad |
|---|---|---|---|---|---|
| 1 | Botón físico IoT (WiFi) | WiFi + MQTT | Batería CR2477 / USB-C | 8-12€ | Alta |
| 2 | Botón físico IoT (BLE) | BLE → Hub/Móvil | Batería CR2032 | 5-8€ | Alta |
| 3 | Botón integrado en muebles | WiFi/BLE | Cable oculto | 10-15€ | Media |
| 4 | Mando a distancia con botón OK | IR + WiFi/BLE | 2x AAA | 12-18€ | Media |
| 5 | Feature phone (SMS/USSD) | 2G/3G/4G | Batería del teléfono | 0€ (solo software) | Alta |
| 6 | Impresora térmica de tickets | WiFi + MQTT | USB-C / Enchufe | 25-40€ | Media-Baja |
| 7 | Add-on para dispositivos existentes | Zigbee/BLE | Varía | 6-10€ | Baja |
| 8 | **Smart TV** | WiFi + HTTPS/MQTT + HDMI-CEC | Corriente (TV) | 0€ (solo software) | **Alta** |

---

## 2. Arquitectura de API Unificada

### Principio: Un Endpoint, Muchos Orígenes

Todos los dispositivos convergen en una **API de check-in unificada**. No importa si el check-in llega por HTTPS, MQTT o SMS — el backend lo procesa igual.

```
┌─────────────────────────────────────────────────────────────────┐
│                     DISPOSITIVOS / CLIENTES                      │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│  App     │  Botón   │  Botón   │  Feature │ Impresora│  Mando   │
│  Móvil   │  WiFi    │  BLE     │  Phone   │ Térmica  │  TV+OK   │
│ (Flutter)│ (ESP32)  │ (nRF52)  │ (SMS)    │ (ESP32)  │ (ESP32)  │
├──────────┴────┬─────┴─────┬────┴──────────┴─────┬────┴──────────┤
│   HTTPS/REST  │   MQTT    │    SMS Gateway       │   BLE→Hub    │
│   (JSON)      │ (QoS 1)   │    (Twilio/Vonage)   │   →WiFi→API  │
└───────┬───────┴─────┬─────┴──────────┬───────────┴──────┬───────┘
        │             │                │                  │
        ▼             ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Cloud Run / API Gateway)         │
│                                                                  │
│  POST /api/v1/checkin     ← REST (app, botones WiFi)            │
│  TOPIC ok/{device_id}     ← MQTT (botones, impresora)           │
│  Webhook /sms/inbound     ← SMS Gateway (feature phones)        │
│  POST /api/v1/devices     ← Registro de dispositivos            │
│  GET  /api/v1/status      ← Dashboard familiar                  │
│  POST /api/v1/print       ← Enviar mensaje a impresora          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Cloud Functions / Supabase)          │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐         │
│  │ Check-in    │  │ Protocolo    │  │ Device          │         │
│  │ Service     │  │ de Fallo     │  │ Management      │         │
│  │             │  │ (Cron Jobs)  │  │ (Registro,      │         │
│  │ Valida      │  │              │  │  Auth, OTA)     │         │
│  │ check-in,   │  │ Detecta      │  │                 │         │
│  │ actualiza   │  │ ausencias,   │  │ Gestiona        │         │
│  │ estado      │  │ escala       │  │ dispositivos    │         │
│  │             │  │ alertas      │  │ por usuario     │         │
│  └─────────────┘  └──────────────┘  └────────────────┘         │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐         │
│  │ Print       │  │ SMS          │  │ Notification    │         │
│  │ Service     │  │ Gateway      │  │ Service         │         │
│  │             │  │ Adapter      │  │                 │         │
│  │ Cola de     │  │              │  │ Push + Email    │         │
│  │ mensajes    │  │ IN: check-in │  │ + SMS + Print   │         │
│  │ para        │  │ OUT: alertas │  │                 │         │
│  │ impresoras  │  │              │  │                 │         │
│  └─────────────┘  └──────────────┘  └────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (Supabase / Firestore)         │
│                                                                  │
│  users          devices          checkins         print_queue   │
│  ├─ id          ├─ id            ├─ id            ├─ id         │
│  ├─ name        ├─ user_id       ├─ user_id       ├─ device_id  │
│  ├─ phone       ├─ type          ├─ device_id     ├─ message    │
│  ├─ deadline    ├─ protocol      ├─ timestamp     ├─ format     │
│  ├─ contacts[]  ├─ mac/imei      ├─ source        ├─ status     │
│  └─ settings    ├─ firmware_v    └─ location?     └─ created_at │
│                 ├─ last_seen                                     │
│                 └─ status                                        │
└─────────────────────────────────────────────────────────────────┘
```

### API REST — Endpoints Principales

```
POST /api/v1/checkin
  Headers: Authorization: Bearer {device_token}
  Body: { "device_id": "abc123", "source": "button_wifi", "timestamp": 1706700000 }
  Response: { "ok": true, "next_deadline": "2026-02-01T10:00:00Z" }

POST /api/v1/devices/register
  Headers: Authorization: Bearer {user_token}
  Body: { "type": "button_wifi", "mac": "AA:BB:CC:DD:EE:FF", "name": "Cocina" }
  Response: { "device_id": "abc123", "mqtt_topic": "ok/abc123", "token": "..." }

GET /api/v1/devices
  Headers: Authorization: Bearer {user_token}
  Response: { "devices": [{ "id": "abc123", "type": "button_wifi", "last_checkin": "...", "battery": 85 }] }

POST /api/v1/print
  Headers: Authorization: Bearer {user_token}
  Body: { "device_id": "printer_001", "message": "¡Buenos días mamá! ❤️", "from": "Javier" }
  Response: { "queued": true }
```

### MQTT — Topics

```
ok/{device_id}/checkin    → Dispositivo publica check-in (QoS 1)
ok/{device_id}/status     → Dispositivo publica estado (batería, WiFi RSSI)
ok/{device_id}/command    → Servidor envía comandos (LED, sonido, OTA)
ok/{device_id}/print      → Servidor envía mensajes a impresora
```

### SMS Gateway — Flujos

```
INBOUND (Check-in por SMS):
  Usuario envía "OK" al número corto 7625 (ОК)
  → Webhook Twilio → /sms/inbound
  → Backend identifica usuario por número de teléfono
  → Registra check-in

INBOUND (Check-in por USSD):
  Usuario marca *123*1#
  → Operadora ejecuta menú USSD
  → "1. Estoy bien  2. Necesito ayuda"
  → Usuario pulsa 1
  → Callback al backend → Registra check-in

OUTBOUND (Alertas por SMS):
  Backend → Twilio API → SMS a contactos de emergencia
  "María no ha confirmado su bienestar hoy. Intentad contactarla."
```

---

## 3. Dispositivos en Detalle

### 3.1 Botón Físico IoT (WiFi)

**Descripción:** Dispositivo independiente del tamaño de un posavasos. Un solo botón grande, LED de confirmación, buzzer. Se conecta directamente al WiFi del hogar.

**Hardware:**
- MCU: ESP32-C3 (WiFi + BLE, bajo coste, bajo consumo)
- Botón: Pulsador mecánico de 30mm, tacto satisfactorio, 100.000 ciclos
- LED: RGB para estados (verde = OK enviado, rojo = sin WiFi, azul = configurando)
- Buzzer: Confirmación sonora al pulsar
- Alimentación: Batería CR2477 (1.000mAh, ~6 meses) O USB-C (para enchufe permanente)
- Carcasa: ABS inyectado o mecanizado CNC, IP54

**Protocolo de conexión:**
1. Primera vez: botón entra en modo AP → usuario conecta desde app → configura WiFi
2. Uso diario: deep sleep → wake on button press → conecta WiFi → MQTT publish → deep sleep
3. Latencia: <3 segundos desde pulsación hasta confirmación en servidor

**Flujo de check-in:**
```
[Botón pulsado] → [Wake ESP32] → [Conectar WiFi ~1.5s] → [MQTT publish ok/{id}/checkin]
                                                         → [Esperar ACK ~0.5s]
                                                         → [LED verde + beep]
                                                         → [Deep sleep]
```

**Requisitos técnicos:**
- Consumo en deep sleep: <10μA
- Consumo en transmisión: ~120mA durante ~3s
- OTA updates vía MQTT command channel
- Watchdog timer para recovery automático
- Factory reset: mantener botón 10s

---

### 3.2 Botón Integrado en Muebles

**Descripción:** Versión empotrable del botón, diseñada para ser integrada en el reposabrazos del sofá, la mesita de noche o la mesa de la cocina. Perfil ultra-bajo.

**Hardware:**
- MCU: ESP32-C3 (mismo que botón standalone)
- Botón: Pulsador capacitivo o mecánico de perfil bajo (15mm)
- LED: Anillo luminoso alrededor del botón
- Alimentación: Cable USB-C oculto (siempre enchufado, no depende de batería)
- Carcasa: Disco de 50mm diámetro x 10mm alto, acabado en madera/metal

**Diferencias con botón standalone:**
- Sin batería (alimentación permanente → puede hacer polling de mensajes)
- Perfil más bajo y estético
- Montaje con adhesivo 3M VHB o tornillo empotrado
- Puede incluir NFC para emparejamiento rápido

---

### 3.3 Mando a Distancia con Botón Dedicado

**Descripción:** Mando tipo TV con botones grandes y un botón verde "OK" prominente. El usuario puede usarlo como mando de TV normal (IR) y además tiene el botón de check-in (WiFi/BLE).

**Hardware:**
- MCU: ESP32-C3 (WiFi) + IR LED + IR receiver
- Botón OK: Botón grande verde en posición central/superior
- Otros botones: Volumen, canal, encendido (funciones IR estándar)
- Alimentación: 2x AAA (~12 meses)
- Carcasa: ABS, ergonómico, botones grandes retroiluminados

**Flujo:**
- Los botones IR funcionan como mando normal (aprendizaje IR)
- El botón OK verde: wake ESP32 → WiFi → MQTT check-in → LED confirmación
- Opcionalmente, programar botón de TV para que también haga check-in

---

### 3.4 Feature Phones — Check-in por SMS/USSD

**Descripción:** Soporte para teléfonos básicos con teclas físicas. El usuario puede hacer check-in enviando un SMS o marcando un código USSD, sin necesidad de internet ni smartphone.

**Opción A: SMS**
```
Configuración: El hijo registra el número del feature phone en la app
Uso diario: 
  - El teléfono recibe SMS recordatorio: "Buenos días María. Responde OK"
  - María responde "OK" (o simplemente "1")
  - El SMS llega al gateway → Backend registra check-in
  - María recibe SMS confirmación: "✓ Ok registrado. Buen día!"
```

**Opción B: USSD**
```
Configuración: Se asocia el número de teléfono
Uso diario:
  - María marca *123# (o código corto asignado)
  - Menú: "Dame un Ok - Pulsa 1 si estás bien"
  - María pulsa 1
  - Respuesta: "Ok registrado. ¡Buen día!"
  - Coste: 0€ para el usuario (coste operadora para nosotros: ~0.005€)
```

**Opción C: Tecla dedicada (requiere acuerdo con fabricante)**
- Feature phone con firmware modificado
- Una tecla física (ej: tecla lateral) configurada para enviar SMS automático
- O app Java ME/KaiOS ultra-ligera preinstalada

**Requisitos técnicos:**
- SMS Gateway: Twilio/Vonage con número corto español
- Parser de SMS entrantes (regex: OK, Si, 1, Bien, etc.)
- Rate limiting anti-spam
- Identificación por número de teléfono (verificado en registro)
- Coste estimado: 0.03-0.06€/SMS (entrada + salida)
- USSD requiere acuerdo con operadora (Movistar, Vodafone, Orange)

---

### 3.5 Impresora Térmica de Tickets

**Descripción:** Pequeña impresora térmica (tipo ticket de supermercado) que recibe e imprime mensajes de la familia sin necesidad de móvil. Servicio premium complementario.

**Concepto:**
- La familia envía mensajes desde la app → llegan a la impresora → se imprimen automáticamente
- El abuelo tiene un "buzón de mensajes" físico en la cocina
- Sin pantalla, sin batería que cargar, sin interfaz compleja
- Solo papel térmico (sin tinta, sin cartuchos)

**Hardware:**
- MCU: ESP32-S3 (WiFi, más RAM para buffer de impresión)
- Mecanismo de impresión: Cabezal térmico 58mm (estándar POS)
- Resolución: 203 DPI (suficiente para texto e imágenes básicas)
- Papel: Rollo térmico estándar 58mm x 30m (~100 mensajes por rollo)
- Alimentación: USB-C (5V/2A) — siempre enchufada
- Botón: Un botón frontal que también sirve como check-in
- LED: Estado de conexión
- Buzzer: Aviso cuando llega un mensaje nuevo

**Protocolo:**
```
RECEPCIÓN DE MENSAJES:
  App familiar → POST /api/v1/print → Cola de mensajes → MQTT ok/{printer_id}/print
  Impresora suscrita a topic → Recibe mensaje → Imprime

FORMATO DE IMPRESIÓN:
  ┌────────────────────────────┐
  │    ♥ Dame un Ok ♥         │
  │                            │
  │  De: Javier (tu hijo)      │
  │  31/01/2026 - 10:30        │
  │                            │
  │  ¡Buenos días mamá!        │
  │  Hoy hace sol en Madrid.   │
  │  Te quiero mucho. ❤️       │
  │                            │
  │  [imagen: foto baja res]   │
  │                            │
  │  ── ── ── ── ── ── ── ──  │
  └────────────────────────────┘

ALERTAS/RECORDATORIOS:
  ┌────────────────────────────┐
  │  ⏰ RECORDATORIO           │
  │                            │
  │  María, aún no has dado    │
  │  tu Ok de hoy.             │
  │                            │
  │  Pulsa el botón verde      │
  │  de la impresora.          │
  │                            │
  │  ── ── ── ── ── ── ── ──  │
  └────────────────────────────┘
```

**Capacidades de impresión:**
- Texto: Cualquier carácter UTF-8, múltiples tamaños
- Imágenes: Blanco y negro, dithering, hasta 384px ancho
- Emojis: Renderizados como imágenes bitmap
- QR: Para links o información adicional
- Líneas, bordes, separadores

**Modelo de negocio:**
- Dispositivo: 35-45€ (coste fabricación ~15-20€)
- Servicio mensual: 2,99€/mes (incluye mensajes ilimitados de hasta 5 familiares)
- Papel térmico: Pack de 5 rollos por 4,99€ (margen ~60%)

---

### 3.6 Add-on para Dispositivos Existentes

**Descripción:** Módulo pequeño que se puede acoplar a cualquier dispositivo existente (mando de TV, teléfono fijo, electrodoméstico) para añadirle un botón de check-in.

**Hardware:**
- MCU: nRF52840 (BLE, ultra-bajo consumo)
- Botón: Pulsador adhesivo con cable corto o inalámbrico
- Alimentación: Batería CR2032 (~1 año)
- Conexión: BLE → Hub Zigbee/BLE o → Smartphone cercano
- Tamaño: 30mm x 30mm x 10mm

**Casos de uso:**
- Pegado al lateral del teléfono fijo
- Adherido al mando de TV
- En la mesita de noche
- En el marco de la puerta (check-in al salir/entrar)

---

## 4. Botones IoT: Decisiones Técnicas

### WiFi vs BLE vs Zigbee

| Criterio | WiFi (ESP32) | BLE (nRF52) | Zigbee (nRF52+) |
|---|---|---|---|
| **Alcance** | Toda la casa (via router) | ~10m directo | ~30m + mesh |
| **Consumo** | Alto (120mA tx) | Muy bajo (8mA tx) | Bajo (15mA tx) |
| **Autonomía batería** | 3-6 meses (CR2477) | 1-2 años (CR2032) | 1-2 años |
| **Requiere hub** | No (directo a router) | Sí (o smartphone) | Sí (coordinador) |
| **Latencia** | ~2s (conexión WiFi) | <1s | <1s |
| **Coste MCU** | ~2€ | ~3€ | ~3.50€ |
| **Complejidad setup** | Media (config WiFi) | Baja (BLE pairing) | Alta (red mesh) |
| **OTA updates** | Fácil | Medio | Medio |

**Recomendación:**
- **Producto principal:** WiFi (ESP32-C3) — independiente, sin hub, setup razonable
- **Producto secundario:** BLE (nRF52) — para add-ons y botones de batería larga
- **Futuro:** Zigbee mesh para hogares con múltiples dispositivos

### Alimentación: Batería vs Enchufe

| Modo | Pros | Contras | Recomendado para |
|---|---|---|---|
| **Batería** | Sin cables, ubicación libre | Hay que cambiarla, capacidad limitada | Botones standalone, add-ons |
| **USB-C** | Siempre encendido, más funciones | Necesita enchufe, cable visible | Impresora, botón de mueble |
| **Hybrid** | Lo mejor de ambos (batería + carga USB) | Más caro, más complejo | Mando a distancia |

---

## 5. Preparación del Código: Interfaces y Adaptadores

### Patrón Adaptador en Backend

El backend debe implementar un **patrón adaptador** para que añadir nuevos tipos de dispositivo sea trivial:

```typescript
// Interfaz base para cualquier fuente de check-in
interface CheckinSource {
  type: 'app' | 'button_wifi' | 'button_ble' | 'sms' | 'ussd' | 'printer' | 'remote';
  deviceId: string;
  userId: string;
  timestamp: Date;
  metadata?: {
    battery?: number;      // Porcentaje batería
    rssi?: number;         // Señal WiFi/BLE
    firmware?: string;     // Versión firmware
    location?: GeoPoint;   // Opcional
  };
}

// Adaptador genérico
interface DeviceAdapter {
  parseCheckin(rawData: any): CheckinSource;
  sendCommand(deviceId: string, command: DeviceCommand): Promise<void>;
  validateAuth(token: string): Promise<Device>;
}

// Adaptadores específicos
class RestCheckinAdapter implements DeviceAdapter { ... }
class MqttCheckinAdapter implements DeviceAdapter { ... }
class SmsCheckinAdapter implements DeviceAdapter { ... }
class UssdCheckinAdapter implements DeviceAdapter { ... }

// Registro de adaptadores
const adapters: Map<string, DeviceAdapter> = new Map([
  ['rest', new RestCheckinAdapter()],
  ['mqtt', new MqttCheckinAdapter()],
  ['sms', new SmsCheckinAdapter()],
  ['ussd', new UssdCheckinAdapter()],
]);
```

### Servicios a Exponer

```typescript
// Device Management Service
interface DeviceService {
  register(userId: string, device: DeviceRegistration): Promise<Device>;
  list(userId: string): Promise<Device[]>;
  updateFirmware(deviceId: string, firmwareUrl: string): Promise<void>;
  getStatus(deviceId: string): Promise<DeviceStatus>;
  remove(deviceId: string): Promise<void>;
}

// Print Service (para impresora térmica)
interface PrintService {
  sendMessage(printerId: string, message: PrintMessage): Promise<void>;
  getQueue(printerId: string): Promise<PrintMessage[]>;
  getPaperStatus(printerId: string): Promise<PaperStatus>;
}

// SMS Gateway Service
interface SmsService {
  handleInbound(from: string, body: string): Promise<CheckinResult>;
  sendAlert(to: string, message: string): Promise<void>;
  sendReminder(to: string): Promise<void>;
}

// MQTT Broker Interface
interface MqttService {
  publishCommand(topic: string, payload: Buffer): Promise<void>;
  onCheckin(callback: (deviceId: string, data: any) => void): void;
  onStatus(callback: (deviceId: string, status: any) => void): void;
}
```

---

## 6. Diagrama de Arquitectura General

```
╔══════════════════════════════════════════════════════════════════════╗
║                        DAME UN OK — ECOSISTEMA                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   DISPOSITIVOS DE CHECK-IN              DISPOSITIVOS DE RECEPCIÓN    ║
║   ═══════════════════════               ══════════════════════════    ║
║                                                                      ║
║   📱 App Móvil (Flutter)                📱 App Familiar (Dashboard)  ║
║   🔴 Botón WiFi (ESP32)                🖨️  Impresora Térmica        ║
║   🔵 Botón BLE (nRF52)                 📧 Email                     ║
║   📺 Mando TV+OK                        📲 SMS                      ║
║   📞 Feature Phone (SMS)               🔔 Push Notification         ║
║   ⌨️  Feature Phone (USSD)              📞 Llamada IVR (Premium)    ║
║   🔲 Add-on (BLE)                                                    ║
║                                                                      ║
║          │ │ │ │ │ │                          ▲ ▲ ▲ ▲ ▲ ▲            ║
║          ▼ ▼ ▼ ▼ ▼ ▼                          │ │ │ │ │ │            ║
║   ┌──────────────────┐                  ┌──────────────────┐         ║
║   │  INGRESS LAYER   │                  │  EGRESS LAYER    │         ║
║   │                  │                  │                  │         ║
║   │ • REST API       │                  │ • FCM/APNs       │         ║
║   │ • MQTT Broker    │                  │ • SendGrid       │         ║
║   │ • SMS Webhook    │                  │ • Twilio SMS     │         ║
║   │ • USSD Callback  │                  │ • MQTT Publish   │         ║
║   └────────┬─────────┘                  └────────▲─────────┘         ║
║            │                                     │                   ║
║            ▼                                     │                   ║
║   ┌──────────────────────────────────────────────┐                   ║
║   │              CORE ENGINE                      │                   ║
║   │                                               │                   ║
║   │  ┌─────────┐ ┌──────────┐ ┌───────────────┐ │                   ║
║   │  │ Checkin  │ │ Failure  │ │ Device Mgmt   │ │                   ║
║   │  │ Service  │ │ Protocol │ │ Service       │ │                   ║
║   │  └─────────┘ └──────────┘ └───────────────┘ │                   ║
║   │  ┌─────────┐ ┌──────────┐ ┌───────────────┐ │                   ║
║   │  │ Print   │ │ Auth     │ │ OTA Update    │ │                   ║
║   │  │ Service │ │ Service  │ │ Service       │ │                   ║
║   │  └─────────┘ └──────────┘ └───────────────┘ │                   ║
║   └──────────────────┬───────────────────────────┘                   ║
║                      │                                               ║
║                      ▼                                               ║
║   ┌──────────────────────────────────────────────┐                   ║
║   │           DATABASE (Supabase UE)              │                   ║
║   │  users │ devices │ checkins │ print_queue     │                   ║
║   └──────────────────────────────────────────────┘                   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 7. Seguridad IoT

### Autenticación de Dispositivos
- Cada dispositivo tiene un **token único** generado en el registro
- Los tokens se almacenan en flash encriptada del ESP32
- Rotación de tokens cada 90 días (vía OTA)
- Certificate pinning para conexiones MQTT/HTTPS

### Firmware
- Firmado criptográficamente (Ed25519)
- OTA updates solo desde servidor verificado
- Rollback automático si falla update

---

## 8. 🐣 Avatar Tamagotchi en Dispositivos IoT

*Sección añadida: 31 enero 2026 (noche) — Concepto Tamagotchi de Ángel Fernández*

La incorporación del concepto Tamagotchi impacta directamente en el hardware IoT. Los dispositivos ya no solo registran un check-in — **muestran y dan vida a un avatar virtual** que el usuario cuida.

### 8.1 Pantallas OLED para Avatares

**Especificación de pantalla recomendada:**

| Parámetro | Valor |
|---|---|
| Tipo | OLED monocromática (SSD1306 / SH1106) |
| Resolución | 128x64 píxeles (0.96") o 128x128 (1.3") |
| Interfaz | I2C (2 pines, simple) o SPI (más rápido) |
| Coste añadido | ~1.50-2.50€ por unidad |
| Consumo | ~20mA activa, 0μA apagada |
| Controlador | Librería u8g2 (ESP32) — soporta SSD1306/SH1106 nativamente |

**Sprites del avatar en OLED:**

Cada avatar se almacena como **sprite sheet en formato XBM** en la flash del ESP32:

```
Tamaño por frame:    32x32 = 128 bytes (monocromático)
Frames por estado:   4-8 (idle, comer, dormir, triste, feliz, hambriento)
Estados:             6
Avatares:            8
Total estimado:      8 avatares × 6 estados × 6 frames × 128B ≈ 36KB
                     (cabe holgadamente en flash del ESP32-C3: 4MB)
```

**Layout de pantalla OLED (128x64):**

```
┌──────────────────────────────────┐
│  [Avatar 32x32]  Nombre          │
│                  ♥♥♥♥♥ (vida)    │
│                  🔥 15 (racha)   │
│  Estado: Contento    HH:MM      │
└──────────────────────────────────┘
```

**Layout de pantalla OLED (128x128):**

```
┌──────────────────────────────────┐
│         MICHI                     │
│     ┌──────────┐                 │
│     │          │                 │
│     │  Avatar  │                 │
│     │  64x64   │                 │
│     │          │                 │
│     └──────────┘                 │
│     ♥♥♥♥♥  😊                   │
│     Racha: 15 días 🔥            │
│     Último: 09:15                │
└──────────────────────────────────┘
```

**Animaciones en OLED:**
- Frame rate: 4-8 FPS (suficiente para animaciones simples)
- Transiciones entre estados: fade o slide
- Al pulsar botón (alimentar): animación de comida + avatar masticando + corazones
- Idle: avatar parpadea, respira, mueve cola/hojas según tipo

**Integración con firmware:**

```c
// Pseudocódigo ESP32 — Rendering de avatar en OLED
#include <U8g2lib.h>
#include "avatar_sprites.h"  // XBM sprite sheets

typedef enum {
    AVATAR_SLEEPING,
    AVATAR_WAITING,
    AVATAR_HUNGRY,
    AVATAR_HAPPY,
    AVATAR_SAD,
    AVATAR_SICK
} AvatarState;

void render_avatar(U8G2 &display, AvatarState state, uint8_t frame) {
    const uint8_t *sprite = get_sprite(current_avatar, state, frame);
    display.clearBuffer();
    display.drawXBM(0, 0, 32, 32, sprite);
    display.drawStr(40, 12, avatar_name);
    draw_health_bar(display, 40, 24, streak_days);
    draw_streak(display, 40, 40, streak_days);
    display.sendBuffer();
}
```

**Dispositivos con pantalla OLED:**

| Dispositivo | Pantalla | Prioridad |
|---|---|---|
| Botón WiFi Premium | 0.96" (128x64) | Alta — producto estrella |
| Botón de mueble | 0.96" (128x64) | Media |
| Impresora térmica | 1.3" (128x128) | Media — muestra avatar mientras idle |
| Mando TV+OK | 0.96" (128x64) | Baja — en lateral del mando |

### 8.2 Estados LED para Avatares (Dispositivos Sin Pantalla)

Para botones básicos sin OLED, el LED RGB comunica el **estado emocional del avatar**, no el estado técnico del dispositivo:

| Color | Patrón | Estado Avatar | Mapeo Técnico |
|---|---|---|---|
| 🟢 Verde fijo | Constante | Contento (alimentado) | Check-in completado hoy |
| 🟢 Verde respiración | Pulsante lento (2s ciclo) | Dormido | Fuera de ventana de check-in |
| 🟡 Amarillo fijo | Constante | Esperando comida | Ventana abierta, sin check-in |
| 🟡 Amarillo parpadeo | Parpadeo 1Hz | Hambriento | +1h sin check-in |
| 🔴 Rojo parpadeo | Parpadeo 2Hz | Triste / Enfermo | +3h sin check-in (alerta activa) |
| 🔵 Azul parpadeo | Parpadeo rápido | — | Modo configuración |
| 🟣 Púrpura flash | 3 destellos | ¡Evolución! | Avatar sube de etapa |
| 🌈 Arcoíris | Ciclo de colores | Celebración | Hito de racha alcanzado |

**Implementación:**
```c
// LED PWM para efecto "respiración" (dormido)
void led_breathe(uint8_t r, uint8_t g, uint8_t b) {
    for (int i = 0; i < 255; i++) {
        set_led(r * i / 255, g * i / 255, b * i / 255);
        delay(8);  // ~2s ciclo completo
    }
    for (int i = 255; i > 0; i--) {
        set_led(r * i / 255, g * i / 255, b * i / 255);
        delay(8);
    }
}
```

**Sincronización de estado:**
- El ESP32 consulta el estado del avatar al servidor periódicamente (cada 15min si USB, o tras cada wake si batería)
- Topic MQTT `ok/{device_id}/avatar_state` recibe actualizaciones push del servidor
- El LED refleja siempre el estado actual del avatar, no solo el último check-in local

### 8.3 Impresión de Avatar en Térmica

La impresora térmica incorpora al avatar en sus impresiones:

**Avatar ASCII/bitmap para impresión:**

```
GATO (Michi):                    PERRO (Toby):
   /\_/\                            /^ ^\
  ( o.o )                          / 0 0 \
   > ^ <                          V\ Y /V
  /|   |\                          / - \
                                  /    |
                                 V__) ||

PLANTA (Brote):                  POLLITO (Pío):
    \|/                             ,-,
   -(·)-                           (O O)
    /|\                            /(   )\
   _|_|_                            " "
  |_____|
```

**Formatos de impresión con avatar:**

1. **Check-in diario** — Avatar pequeño + "¡Alimentado! Racha: X días"
2. **Hito de racha** — Avatar grande celebrando + mensaje de felicitación
3. **Evolución** — Avatar antes/después + "¡Michi ha crecido!"
4. **Regalo familiar** — Avatar con accesorio + "Lucía le ha regalado un gorrito"
5. **Buenos días** — Avatar + mensaje de la familia

**Renderizado en ESC/POS:**
```c
// Impresión de bitmap del avatar (128x128 px)
void print_avatar(const uint8_t *bitmap, const char *name, int streak) {
    printer_align_center();
    printer_print_bitmap(128, 128, bitmap);
    printer_set_font_size(2);
    printer_println(name);
    printer_set_font_size(1);
    char buf[64];
    snprintf(buf, sizeof(buf), "Racha: %d dias", streak);
    printer_println(buf);
    printer_feed(3);
    printer_cut();
}
```

### 8.4 Tabla Actualizada de Dispositivos con Avatar

| # | Dispositivo | Avatar Visual | Avatar Sonoro | Coste Extra |
|---|---|---|---|---|
| 1 | Botón WiFi (básico) | LED RGB (estado) | Beep al alimentar | +0€ (ya tiene LED) |
| 2 | Botón WiFi Premium | OLED 0.96" (avatar animado) | Beep melodía | +2.50€ |
| 3 | Botón mueble | OLED 0.96" o LED | Silencioso | +0-2.50€ |
| 4 | Mando TV+OK | LED RGB | Beep | +0€ |
| 5 | Feature phone | Emoji en SMS | — | +0€ |
| 6 | Impresora térmica | OLED 1.3" + impresión bitmap | Buzzer melodía | +2€ (OLED) |
| 7 | Add-on BLE | LED RGB | — | +0€ |

### 8.5 Pipeline de Sprites

Para mantener coherencia visual entre plataformas, se define un pipeline de arte:

```
Ilustrador → Vector (SVG)
                │
        ┌───────┼───────┬──────────┐
        ▼       ▼       ▼          ▼
    App (Rive)  OLED    Impresora  SMS
    (color,     (1-bit  (1-bit     (emoji
     animado)   32x32)  128x128)   fallback)
```

- **App:** Animaciones Rive/Lottie a color, resolución libre
- **OLED:** Sprites XBM monocromáticos, 32x32 o 64x64
- **Impresora:** Bitmaps monocromáticos, 128x128, dithering para sombras
- **SMS:** Emojis Unicode como fallback (🐱🐕🌱🐦)
- **ASCII:** Arte ASCII para feature phones sin emoji

**Estimación de recursos necesarios:**
- 8 avatares × 3 etapas × 6 estados × 6-8 frames = ~1.000-1.400 frames totales
- Para OLED (32x32 mono): ~180KB total
- Para app (color, vectorial): ~2-5MB total
- Para impresora (128x128 mono): ~700KB total
- Tiempo estimado de producción: 2-3 semanas con un ilustrador dedicado

---

*Sección de avatar/Tamagotchi IoT añadida el 31 de enero de 2026 (noche). Ver `docs/gamificacion-tamagotchi.md` para el documento completo del concepto.*

---

## 9. 💌 Mensajería Bidireccional — Impresora Térmica como Canal Familiar

*Sección añadida: 1 febrero 2026 — Concepto de Ángel Fernández*

### 9.1 Concepto: El Ticketito del Cariño

La impresora térmica del abuelo evoluciona de un dispositivo pasivo (que solo imprime alertas del sistema) a un **canal de comunicación familiar unidireccional**: los familiares envían mensajes desde sus apps de mensajería habituales y estos se imprimen físicamente en la térmica del abuelo.

> **"El abuelo no necesita aprender WhatsApp. Su hijo le manda un mensaje por WhatsApp y le sale un ticketito en la cocina. Físico. Tangible. Sin pantallas."** — Ángel Fernández

#### Flujo de comunicación completo

```
FAMILIAR → ABUELO (vía impresora térmica):
  El hijo abre WhatsApp/Telegram/App → Envía mensaje al bot/número
  → Backend recibe el mensaje → Lo encola en print_queue
  → MQTT publica en ok/{printer_id}/print
  → Impresora térmica imprime el ticketito
  → El abuelo lee el mensaje en papel 📄

ABUELO → SISTEMA (vía botón físico):
  El abuelo pulsa el botón grande del dispositivo
  → Check-in registrado → Avatar alimentado
  → Familia ve en el dashboard que el abuelo está bien ✅
```

**Es comunicación asimétrica por diseño:**
- **Familiar → Abuelo:** Mensajes de texto impresos en térmica (canal cálido, físico)
- **Abuelo → Sistema:** Botón de check-in (canal mínimo, sin fricción)
- **Sistema → Familia:** Dashboard + notificaciones (canal digital estándar)

### 9.2 El Dispositivo IoT Completo: La Estación Dame un Ok

El concepto de dispositivo evoluciona de "impresora con botón" a una **estación integrada** con tres componentes:

```
┌─────────────────────────────────────────────────────┐
│            ESTACIÓN "DAME UN OK"                     │
│                                                      │
│   ┌──────────────────┐                               │
│   │   PANTALLA OLED  │  ← Muestra avatar Tamagotchi  │
│   │   (NO táctil)    │  ← Estado, racha, hora        │
│   │   128x128 1.3"   │  ← NO requiere interacción    │
│   └──────────────────┘                               │
│                                                      │
│   ┌──────────────────┐                               │
│   │                  │                               │
│   │  BOTÓN GRANDE    │  ← Check-in / Alimentar avatar│
│   │  (60mm, verde)   │  ← Retroiluminado             │
│   │                  │  ← Feedback: LED + buzzer      │
│   └──────────────────┘                               │
│                                                      │
│   ┌──────────────────┐                               │
│   │  IMPRESORA       │  ← Mensajes de familiares      │
│   │  TÉRMICA 58mm    │  ← Recordatorios               │
│   │                  │  ← Tickets de racha/hitos      │
│   └──────────────────┘                               │
│                                                      │
│   Alimentación: USB-C (siempre enchufada)            │
│   Conectividad: WiFi + MQTT                          │
│   MCU: ESP32-S3                                      │
│   Buzzer: Aviso sonoro al recibir mensaje             │
│   LED: Indicador de conexión + mensaje pendiente      │
└─────────────────────────────────────────────────────┘
```

**Principio clave: NO hay pantalla táctil.** Son personas mayores. La pantalla OLED es solo para mostrar el avatar. El único elemento de interacción es el botón físico grande. La impresora es solo de salida.

### 9.3 Integración con Plataformas de Mensajería

El sistema actúa como **puente** entre las apps de mensajería que los familiares YA usan y la impresora térmica del abuelo. El familiar no necesita instalar nada nuevo.

#### Plataformas soportadas

| Plataforma | Integración | Coste | Prioridad |
|---|---|---|---|
| **WhatsApp** | WhatsApp Business API (Meta Cloud API) | ~0.05€/conversación | Alta |
| **Telegram** | Telegram Bot API (gratuita) | 0€ | Alta |
| **SMS** | Twilio/Vonage inbound | ~0.03€/SMS | Media |
| **Dashboard App** | REST API directa | 0€ | Alta |
| **Email** | Webhook inbound (SendGrid) | ~0€ | Baja |

#### Arquitectura de mensajería

```
┌──────────────────────────────────────────────────────────────┐
│                   FUENTES DE MENSAJES                         │
├──────────┬──────────┬──────────┬──────────┬──────────────────┤
│ WhatsApp │ Telegram │   SMS    │ Dashboard│     Email        │
│ Business │   Bot    │ Inbound  │   App    │   Webhook        │
│   API    │   API    │          │          │                  │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────────┬─────────┘
     │          │          │          │              │
     ▼          ▼          ▼          ▼              ▼
┌──────────────────────────────────────────────────────────────┐
│              MESSAGE INGRESS SERVICE                          │
│                                                              │
│  • Identifica al familiar por número/usuario                 │
│  • Valida que está vinculado a un dispositivo                │
│  • Sanitiza el mensaje (longitud, contenido)                 │
│  • Extrae imágenes (las convierte a bitmap 1-bit)            │
│  • Encola en print_queue                                     │
│                                                              │
│  POST /api/v1/messages/inbound                               │
│  Body: { "from": "+34666...", "platform": "whatsapp",        │
│          "text": "Buenos días mamá", "media_url": null }     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              PRINT QUEUE (Base de datos)                      │
│                                                              │
│  messages_queue                                              │
│  ├─ id                                                       │
│  ├─ printer_device_id     (dispositivo destino)              │
│  ├─ sender_id             (familiar que envía)               │
│  ├─ sender_name           ("Javier", "Lucía")               │
│  ├─ sender_platform       ("whatsapp", "telegram", "app")   │
│  ├─ message_text          (texto del mensaje)                │
│  ├─ message_image         (bitmap 1-bit, opcional)           │
│  ├─ status                ("queued", "sent", "printed",      │
│  │                         "failed")                         │
│  ├─ created_at                                               │
│  ├─ sent_at               (enviado al dispositivo)           │
│  └─ printed_at            (confirmación de impresión)        │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              MQTT DISPATCH SERVICE                            │
│                                                              │
│  • Publica mensaje en ok/{printer_id}/print                  │
│  • Espera ACK del dispositivo (QoS 1)                        │
│  • Reintenta si no hay ACK en 30s                            │
│  • Marca como "failed" tras 3 reintentos                     │
│  • Notifica al familiar: "✅ Mensaje impreso" o              │
│    "⚠️ Impresora no disponible, se imprimirá cuando conecte" │
└──────────────────────────────────────────────────────────────┘
```

#### Flujo detallado: WhatsApp → Impresora

```
1. El familiar (Javier) envía un WhatsApp al número +34 900 XXX XXX:
   "¡Buenos días mamá! Hoy vamos a ir a verte el domingo. ❤️"

2. Meta Cloud API envía webhook a nuestro servidor:
   POST /webhooks/whatsapp
   { "from": "+34666123456", "text": "¡Buenos días mamá!...", "timestamp": ... }

3. Message Ingress Service:
   - Busca +34666123456 en tabla family_links → encuentra vinculación con printer_001
   - Resuelve nombre: "Javier (tu hijo)"
   - Sanitiza: texto OK, longitud OK (<500 chars), sin contenido inapropiado
   - Encola en messages_queue con status "queued"

4. MQTT Dispatch publica en ok/printer_001/print:
   { "from": "Javier (tu hijo)", "text": "¡Buenos días mamá!...", "emoji": "❤️", "ts": ... }

5. Impresora térmica recibe, imprime:
   ┌────────────────────────────────┐
   │      ♥ Dame un Ok ♥           │
   │                                │
   │  📩 Mensaje de Javier          │
   │     (tu hijo)                  │
   │  01/02/2026 - 09:15            │
   │                                │
   │  ¡Buenos días mamá!            │
   │  Hoy vamos a ir a verte       │
   │  el domingo. ❤️                │
   │                                │
   │  ── ── ── ── ── ── ── ──      │
   └────────────────────────────────┘

6. Impresora envía ACK → Dispatch marca "printed" → Javier recibe en WhatsApp:
   "✅ Tu mensaje se ha impreso en casa de mamá"

7. Buzzer del dispositivo suena: bip-bip (aviso de mensaje nuevo)
```

#### Flujo detallado: Telegram → Impresora

```
1. El familiar abre el bot @DameUnOkBot en Telegram
2. Escribe: "Abuela, te echo de menos. Besos de los niños 😘"
3. Telegram Bot API envía update → nuestro servidor procesa
4. Mismo flujo: identificar → encolar → MQTT → imprimir → ACK
5. Respuesta en Telegram: "✅ Mensaje impreso en casa de abuela"
```

### 9.4 Vinculación Familiar-Dispositivo

Para que un familiar pueda enviar mensajes a la impresora, debe vincular su cuenta de mensajería al dispositivo del abuelo.

#### Proceso de vinculación

```
OPCIÓN A: Desde la app/dashboard del familiar:
  1. Familiar abre la app → "Dispositivos de mamá" → "Impresora Cocina"
  2. Pulsa "Vincular mi WhatsApp" o "Vincular mi Telegram"
  3. Recibe un código de 6 dígitos
  4. Envía el código al bot/número de WhatsApp
  5. ✅ Vinculado. Ahora cualquier mensaje que envíe se imprimirá.

OPCIÓN B: Directamente desde la mensajería:
  1. Familiar envía "VINCULAR" al bot de Telegram o número de WhatsApp
  2. Bot responde: "¿Cuál es el código de la impresora?" (código QR en el dispositivo)
  3. Familiar envía el código del dispositivo
  4. Bot confirma: "✅ Vinculado a la impresora de María (Cocina)"
```

#### Tabla de vinculación

```sql
CREATE TABLE family_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    printer_device_id UUID REFERENCES devices(id),
    family_member_id UUID REFERENCES users(id),
    platform VARCHAR(20) NOT NULL,          -- 'whatsapp', 'telegram', 'sms', 'app'
    platform_identifier VARCHAR(100),       -- número de teléfono o username
    display_name VARCHAR(50) NOT NULL,      -- "Javier (tu hijo)"
    relationship VARCHAR(30),               -- "hijo", "nieta", "vecina"
    is_active BOOLEAN DEFAULT true,
    max_messages_day INTEGER DEFAULT 20,    -- límite anti-spam
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);
```

### 9.5 Tipos de Impresión Automatizada

La impresora no solo imprime mensajes de familiares. El sistema genera impresiones automáticas:

| Tipo | Trigger | Contenido | Frecuencia |
|---|---|---|---|
| **Mensaje familiar** | Familiar envía mensaje | Texto + nombre + emoji | Bajo demanda |
| **Buenos días** | Programado (ej: 9:00 AM) | Saludo + avatar + previsión tiempo | Diario |
| **Recordatorio check-in** | Si no ha pulsado el botón | "Tu [avatar] tiene hambre" + avatar triste | Según protocolo de fallo |
| **Ticket de racha** | Al completar check-in | "¡Racha de X días! 🔥" + avatar feliz | Diario (tras check-in) |
| **Hito de racha** | Cada 7, 30, 100 días | Ticket especial celebración + avatar grande | Puntual |
| **Evolución avatar** | Al alcanzar etapa | "¡[Avatar] ha crecido!" + antes/después | Puntual |
| **Regalo familiar** | Familiar envía regalo en app | "[Nombre] te ha regalado un gorrito" | Bajo demanda |
| **Recordatorio medicación** | Programado por familiar | "⏰ Hora de la pastilla de las 14:00" | Según configuración |
| **Efemérides** | Fechas configuradas | "🎂 ¡Hoy cumple Lucía 8 añitos!" | Puntual |

### 9.6 Gestión de Contenido y Seguridad

#### Filtrado de contenido
- **Longitud máxima:** 500 caracteres por mensaje (el papel térmico es finito)
- **Imágenes:** Se convierten a bitmap 1-bit con dithering (máx. 384x384 px)
- **Emojis:** Renderizados como bitmap (librería de emojis monocromáticos)
- **Sin enlaces:** Los URLs se eliminan automáticamente (prevención phishing a mayores)
- **Filtro de spam:** Máximo 20 mensajes/día por familiar vinculado
- **Horario silencioso:** No imprimir entre 22:00-08:00 (configurable). Los mensajes se encolan y se imprimen a las 8:00.

#### Confirmación de entrega
- El dispositivo envía ACK vía MQTT tras imprimir
- Si la impresora está offline, los mensajes se encolan (máx. 50 mensajes o 48h)
- El familiar recibe notificación de estado: impreso / pendiente / fallido
- Si el papel se acaba, el dispositivo avisa al familiar desde la app

### 9.7 API Endpoints para Mensajería

```
POST /api/v1/messages/send
  Headers: Authorization: Bearer {family_member_token}
  Body: {
    "printer_device_id": "printer_001",
    "text": "¡Buenos días mamá! ❤️",
    "image_base64": null,
    "schedule_at": null
  }
  Response: { "message_id": "msg_123", "status": "queued" }

GET /api/v1/messages/{message_id}/status
  Response: { "status": "printed", "printed_at": "2026-02-01T09:16:00Z" }

POST /api/v1/family-links
  Headers: Authorization: Bearer {family_member_token}
  Body: {
    "printer_device_id": "printer_001",
    "platform": "whatsapp",
    "platform_identifier": "+34666123456",
    "display_name": "Javier (tu hijo)",
    "relationship": "hijo"
  }
  Response: { "link_id": "link_001", "verification_code": "482917" }

POST /api/v1/family-links/verify
  Body: { "link_id": "link_001", "code": "482917" }
  Response: { "verified": true }

GET /api/v1/printers/{device_id}/queue
  Response: { "pending": 3, "messages": [...] }

POST /webhooks/whatsapp     ← Meta Cloud API webhook
POST /webhooks/telegram     ← Telegram Bot API webhook
POST /webhooks/sms          ← Twilio inbound SMS webhook
```

### 9.8 Coste del Servicio de Mensajería

| Concepto | Coste por mensaje | Coste mensual estimado (20 msgs/día) |
|---|---|---|
| WhatsApp Business API | ~0.05€/conversación (24h) | ~1.50€ |
| Telegram Bot API | 0€ | 0€ |
| SMS inbound | ~0.03€ | ~0.60€ |
| Infraestructura (MQTT + DB) | ~0.001€ | ~0.02€ |
| Papel térmico (coste real) | ~0.005€ | ~0.10€ |

**Modelo de monetización:**
- Servicio de mensajería incluido en la suscripción de la impresora (2,99€/mes)
- Hasta 5 familiares vinculados por impresora
- Mensajes ilimitados (con límite diario anti-spam de 20/familiar)
- El Telegram es gratuito para nosotros → incentivar su uso
- WhatsApp tiene coste → se absorbe en la suscripción

### 9.9 Diagrama de Flujo Completo: Ecosistema de Comunicación

```
╔══════════════════════════════════════════════════════════════════════════╗
║              ECOSISTEMA DE COMUNICACIÓN "DAME UN OK"                    ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║   FAMILIAR (emisor)                    ABUELO/A (receptor)               ║
║   ═════════════════                    ═══════════════════               ║
║                                                                          ║
║   📱 WhatsApp ──┐                     ┌── 🖨️ Impresora (mensajes)       ║
║   📱 Telegram ──┤                     │                                  ║
║   📱 SMS ───────┤  ── MENSAJES ──►    ├── 📺 Pantalla OLED (avatar)      ║
║   💻 Dashboard ─┤                     │                                  ║
║   📧 Email ─────┘                     └── 🔴 Botón grande (check-in)     ║
║                                              │                           ║
║   ◄── ESTADO ──────────────────────────────  │                           ║
║                                              │                           ║
║   📱 App familiar ◄─┐                       │                           ║
║   🔔 Push notif ◄───┤  ◄── CHECK-IN ◄──────┘                           ║
║   📧 Email alerta ◄─┘      (botón pulsado)                              ║
║                                                                          ║
║   El familiar ENVÍA con lo que ya usa.                                   ║
║   El abuelo RECIBE en papel físico.                                      ║
║   El abuelo CONFIRMA con un botón.                                       ║
║   El familiar VE el estado en su app.                                    ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

*Sección de mensajería bidireccional añadida el 1 de febrero de 2026. Concepto original de Ángel Fernández.*

---

## 10. 🟢🔴🟡 Botones de Respuesta Rápida — Comunicación Bidireccional Real

*Sección añadida: 2 febrero 2026 — Concepto de Ángel Fernández*

### 10.1 Concepto: El Abuelo Puede Responder

La impresora térmica permite al familiar enviar mensajes al abuelo, pero hasta ahora el abuelo solo podía hacer check-in (pulsar el botón grande). Con los **3 botones de respuesta rápida**, el abuelo puede responder de forma sencilla a cualquier mensaje recibido.

> **"No le pidas al abuelo que escriba un WhatsApp. Dale 3 botones: Bien, Mal, No te he entendido. Es suficiente."**

### 10.2 El Dispositivo Completo: 4 Botones

La Estación Dame un Ok pasa de tener 1 botón a 4:

```
┌─────────────────────────────────────────────────────┐
│            ESTACIÓN "DAME UN OK" v2                   │
│                                                      │
│   ┌──────────────────┐                               │
│   │   PANTALLA OLED  │  ← Avatar Tamagotchi          │
│   │   128x128 1.3"   │  ← Estado, racha, hora        │
│   └──────────────────┘                               │
│                                                      │
│   ┌──────────────────┐                               │
│   │  IMPRESORA       │  ← Mensajes de familiares      │
│   │  TÉRMICA 58mm    │  ← Recordatorios / tickets     │
│   └──────────────────┘                               │
│                                                      │
│   ┌──────────────────────────────────────┐           │
│   │                                      │           │
│   │      🟢 BOTÓN GRANDE CHECK-IN       │           │
│   │      (60mm, verde, retroiluminado)   │           │
│   │      Alimentar avatar / Estoy bien   │           │
│   │                                      │           │
│   └──────────────────────────────────────┘           │
│                                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│   │ 🟢 BIEN │  │ 🔴 MAL  │  │ 🟡 ???  │          │
│   │  (tick)  │  │   (X)    │  │   (?)    │          │
│   │  verde   │  │   rojo   │  │ amarillo │          │
│   └──────────┘  └──────────┘  └──────────┘          │
│     Respuesta rápida a mensajes recibidos            │
│                                                      │
│   Alimentación: USB-C (siempre enchufada)            │
│   MCU: ESP32-S3 · WiFi + MQTT                       │
└─────────────────────────────────────────────────────┘
```

**Distribución de botones:**
| Botón | Tamaño | Color | Icono | Función |
|---|---|---|---|---|
| **CHECK-IN** | 60mm (grande) | 🟢 Verde brillante | ✓ / corazón | Alimentar avatar, confirmar bienestar |
| **BIEN** | 30mm | 🟢 Verde | ✓ / 👍 | Respuesta positiva a mensaje |
| **MAL** | 30mm | 🔴 Rojo | ✗ / 😞 | Respuesta negativa a mensaje |
| **NO ENTIENDO** | 30mm | 🟡 Amarillo | ? | No ha entendido el mensaje |

### 10.3 Flujo de Respuesta Rápida

```
FLUJO COMPLETO:

1. FAMILIAR ENVÍA MENSAJE
   Javier (WhatsApp) → "Mamá, ¿has dormido bien?"
   → Backend encola → MQTT → Impresora imprime ticket

2. ABUELO LEE Y RESPONDE
   María lee el ticket → Pulsa 🟢 BIEN
   → ESP32 detecta pulsación → MQTT publish ok/{id}/response
     { "type": "quick_reply", "response": "bien",
       "in_reply_to": "msg_456", "timestamp": ... }

3. SISTEMA NOTIFICA AL FAMILIAR
   → Backend recibe respuesta → Identifica mensaje original
   → Envía por el mismo canal (WhatsApp de Javier):
     "✅ Tu madre ha respondido: BIEN 👍"

4. FAMILIAR ADAPTA SU COMUNICACIÓN
   Javier sabe que solo hay 3 opciones →
   Formula preguntas que se respondan con Bien/Mal/No entiendo
```

**Diagrama técnico:**

```
[Familiar]                    [Backend]                    [Dispositivo]
    │                             │                             │
    │── "¿Has dormido bien?" ──►  │                             │
    │   (WhatsApp/Telegram)       │── MQTT print ─────────────► │
    │                             │                             │── Imprime ticket
    │                             │                             │
    │                             │                             │── Abuelo lee
    │                             │                             │── Pulsa 🟢 BIEN
    │                             │                             │
    │                             │◄── MQTT response ────────── │
    │                             │   { response: "bien" }      │
    │◄── "Tu madre ha ──────────  │                             │
    │    respondido: BIEN 👍"     │                             │
    │   (mismo canal)             │                             │
```

### 10.4 Respuestas del Sistema por Canal

El sistema traduce la respuesta del abuelo y la envía al familiar por el mismo canal:

| Botón | Respuesta enviada al familiar |
|---|---|
| 🟢 BIEN | "✅ [Nombre] ha respondido: **BIEN** 👍" |
| 🔴 MAL | "⚠️ [Nombre] ha respondido: **MAL** 😟 — Quizás quieras llamarle." |
| 🟡 NO ENTIENDO | "❓ [Nombre] ha respondido: **NO TE HE ENTENDIDO** — Intenta reformular el mensaje." |

**Nota:** Si el abuelo pulsa 🔴 MAL, el sistema puede opcionalmente escalar una alerta leve al dashboard familiar (configurable).

### 10.5 Preguntas Automáticas del Sistema

Los 3 botones también permiten que el sistema haga preguntas programadas:

```
PREGUNTAS AUTOMÁTICAS (configurables por el familiar):

  ⏰ 09:00 → Imprime: "Buenos días María. ¿Has dormido bien?"
             → Espera respuesta: 🟢 Bien / 🔴 Mal / 🟡 ?

  ⏰ 14:00 → Imprime: "¿Has tomado la medicación de mediodía?"
             → Espera respuesta: 🟢 Sí / 🔴 No / 🟡 ?

  ⏰ 18:00 → Imprime: "¿Cómo te encuentras esta tarde?"
             → Espera respuesta: 🟢 Bien / 🔴 Mal / 🟡 ?
```

**Tabla de preguntas automáticas:**

```sql
CREATE TABLE auto_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id),
    configured_by UUID REFERENCES users(id),     -- familiar que la configura
    question_text VARCHAR(200) NOT NULL,
    schedule_time TIME NOT NULL,                  -- hora del día
    schedule_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- días de la semana
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE question_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES auto_questions(id),
    message_id UUID REFERENCES messages_queue(id), -- mensaje impreso
    device_id UUID REFERENCES devices(id),
    response VARCHAR(20) NOT NULL,                 -- 'bien', 'mal', 'no_entiendo'
    response_time TIMESTAMPTZ NOT NULL,
    latency_seconds INTEGER,                       -- tiempo entre impresión y respuesta
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.6 Dashboard: Histórico de Respuestas

Las respuestas rápidas generan datos valiosos para el dashboard familiar:

| Métrica | Descripción | Alerta si... |
|---|---|---|
| **Patrón de bienestar** | % de respuestas "Bien" vs "Mal" por semana | >50% "Mal" en 3 días |
| **Comprensión** | % de "No entiendo" | >40% → mensajes demasiado complejos |
| **Tiempo de respuesta** | Latencia entre impresión y pulsación | >30 min → posible ausencia |
| **Frecuencia de respuesta** | Preguntas respondidas vs ignoradas | <50% respondidas → revisar |
| **Tendencia emocional** | Evolución temporal de respuestas | Declive sostenido → alerta |

**Ejemplo de visualización en dashboard:**

```
ESTA SEMANA — María (tu madre)
═══════════════════════════════

Lun: 🟢🟢🟢  |  Mar: 🟢🟢🔴  |  Mié: 🟢🟡🟢
Jue: 🔴🔴🟢  |  Vie: 🟢🟢🟢  |  Sáb: 🟢🟢🟢

Bienestar: 78% 👍
Comprensión: 94% ✅
Respuestas: 17/18 (94%)
⚠️ Jueves tuvo un mal día (2 respuestas "Mal")
```

### 10.7 Hardware: Integración de los 3 Botones

**Pines GPIO del ESP32-S3:**

| Botón | GPIO | Pull-up | Debounce | Color LED |
|---|---|---|---|---|
| CHECK-IN (grande) | GPIO 4 | Interno | 50ms | Verde (GPIO 5) |
| BIEN | GPIO 6 | Interno | 50ms | Verde (GPIO 7) |
| MAL | GPIO 8 | Interno | 50ms | Rojo (GPIO 9) |
| NO ENTIENDO | GPIO 10 | Interno | 50ms | Amarillo (GPIO 11) |

**Firmware — manejo de respuestas:**

```c
// Pseudocódigo ESP32 — Botones de respuesta rápida
typedef enum {
    RESPONSE_BIEN,
    RESPONSE_MAL,
    RESPONSE_NO_ENTIENDO
} QuickResponse;

// Estado: ¿hay un mensaje pendiente de respuesta?
static bool pending_response = false;
static char pending_message_id[64] = {0};

void on_message_printed(const char *message_id) {
    pending_response = true;
    strncpy(pending_message_id, message_id, sizeof(pending_message_id));
    // Iluminar los 3 botones de respuesta
    led_set(BTN_BIEN_LED, GREEN, ON);
    led_set(BTN_MAL_LED, RED, ON);
    led_set(BTN_NOENTIENDO_LED, YELLOW, ON);
}

void on_response_button(QuickResponse response) {
    if (!pending_response) return;

    const char *response_str;
    switch (response) {
        case RESPONSE_BIEN:       response_str = "bien"; break;
        case RESPONSE_MAL:        response_str = "mal"; break;
        case RESPONSE_NO_ENTIENDO: response_str = "no_entiendo"; break;
    }

    // Publicar respuesta por MQTT
    char payload[256];
    snprintf(payload, sizeof(payload),
        "{\"type\":\"quick_reply\",\"response\":\"%s\","
        "\"in_reply_to\":\"%s\",\"timestamp\":%lu}",
        response_str, pending_message_id, time(NULL));

    mqtt_publish("ok/%s/response", device_id, payload);

    // Feedback visual + sonoro
    led_flash(response == RESPONSE_BIEN ? GREEN : 
              response == RESPONSE_MAL ? RED : YELLOW, 3);
    buzzer_beep(200);

    // Apagar LEDs de respuesta
    led_set(BTN_BIEN_LED, OFF);
    led_set(BTN_MAL_LED, OFF);
    led_set(BTN_NOENTIENDO_LED, OFF);
    pending_response = false;
}
```

### 10.8 MQTT Topics para Respuestas

```
ok/{device_id}/response       → Dispositivo publica respuesta rápida (QoS 1)
  Payload: {
    "type": "quick_reply",
    "response": "bien" | "mal" | "no_entiendo",
    "in_reply_to": "msg_456",       // ID del mensaje al que responde
    "timestamp": 1706900000
  }

ok/{device_id}/question       → Servidor envía pregunta automática
  Payload: {
    "message_id": "msg_789",
    "text": "¿Has tomado la medicación?",
    "source": "auto_question",
    "question_id": "q_123"
  }
```

### 10.9 API Endpoints para Respuestas

```
GET /api/v1/responses/{device_id}
  Query: ?from=2026-02-01&to=2026-02-07
  Response: {
    "responses": [
      { "id": "r_001", "message_id": "msg_456", "response": "bien",
        "timestamp": "2026-02-01T09:05:00Z", "source": "family_message",
        "from": "Javier" },
      { "id": "r_002", "question_id": "q_123", "response": "mal",
        "timestamp": "2026-02-01T14:10:00Z", "source": "auto_question",
        "question": "¿Has tomado la medicación?" }
    ],
    "summary": { "bien": 12, "mal": 3, "no_entiendo": 1, "total": 16 }
  }

POST /api/v1/auto-questions
  Headers: Authorization: Bearer {family_member_token}
  Body: {
    "device_id": "printer_001",
    "question_text": "¿Has dormido bien?",
    "schedule_time": "09:00",
    "schedule_days": [1,2,3,4,5,6,7]
  }
  Response: { "question_id": "q_456", "status": "active" }
```

---

*Sección de botones de respuesta rápida añadida el 2 de febrero de 2026. Concepto original de Ángel Fernández.*

---

## 11. Smart TV como Dispositivo de Check-in

**Añadido:** 30 enero 2026  
**Origen:** Ángel Fernández (insight: "muchos mayores no tienen móvil pero SÍ tienen Smart TV")  
**Estudio completo:** `docs/estudio-smart-tv.md`

### 11.1 Concepto

La Smart TV se convierte en el **dispositivo principal de check-in para mayores** que no tienen o no manejan smartphone. El Tamagotchi (Misi) vive en la televisión. Cuando es hora de check-in, el avatar aparece superpuesto sobre la emisión, y el mayor pulsa OK en su mando para confirmar que está bien.

### 11.2 Arquitectura: App HTML5 Universal + SDK Nativo para Overlay

```
┌─────────────────────────────────────────────────────────────────┐
│                        SMART TV                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              APP HTML5 UNIVERSAL                          │   │
│  │  ┌────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐  │   │
│  │  │ Avatar │  │ Check-in   │  │ D-pad    │  │ API     │  │   │
│  │  │ Render │  │ Manager    │  │ Naviga-  │  │ Client  │  │   │
│  │  │(Canvas)│  │            │  │ tion     │  │ (REST)  │  │   │
│  │  └────────┘  └────────────┘  └──────────┘  └─────────┘  │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │ Bridge JS ↔ Nativo                     │
│  ┌──────────────────────┴───────────────────────────────────┐   │
│  │              WRAPPER NATIVO (por plataforma)              │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │ Push        │  │ Overlay /   │  │ Background       │  │   │
│  │  │ Notification│  │ Foreground  │  │ Service          │  │   │
│  │  │ Receiver    │  │ Launch      │  │ (keep-alive)     │  │   │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Plataformas: Android TV (Kotlin) │ Tizen (Web+API) │ webOS     │
└─────────────────────┬───────────────────────────────────────────┘
                      │ WiFi (HTTPS/MQTT)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (misma API REST)                       │
│                                                                  │
│  POST /api/v1/checkin  { device_type: "smart_tv", ... }         │
│  GET  /api/v1/schedule { device_id: "tv_001" }                  │
│  Push: FCM (Android TV) │ Samsung Push │ webOS Notification     │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Wake on LAN / HDMI-CEC: Encender TV desde Standby

Cuando la TV está en standby y es hora de check-in, el **hub IoT (ESP32)** conectado por HDMI puede encenderla:

```
┌──────────┐    HDMI-CEC     ┌──────────────┐
│ Hub IoT  │ ───────────────→│  Smart TV    │
│ (ESP32 + │   "Power On"   │  (standby)   │
│  CEC     │   "Active Src" │              │
│  module) │                 │  → ENCIENDE  │
└────┬─────┘                 │  → Muestra   │
     │ WiFi/MQTT             │    alerta    │
     ▼                       └──────────────┘
┌──────────┐
│ Backend  │  "Es hora de check-in para María"
│ (Cloud)  │  → Push al hub IoT
└──────────┘
```

**Protocolos soportados:**

| Protocolo | Qué hace | Compatibilidad |
|---|---|---|
| **HDMI-CEC** | Encender TV, cambiar fuente HDMI, enviar comandos de navegación | Universal (todas las TVs con HDMI). Samsung="Anynet+", LG="SimpLink" |
| **Wake on LAN** | Encender TV por red local (magic packet) | La mayoría de Smart TVs 2018+. Requiere WiFi activo en standby o cable Ethernet |
| **SmartThings API** | Encender Samsung TVs remotamente vía cloud | Solo Samsung con cuenta SmartThings |
| **LG ThinQ API** | Encender LG TVs remotamente vía cloud | Solo LG con cuenta ThinQ |

**Recomendación:** HDMI-CEC es el más fiable y universal. El hub IoT ya planificado se amplía con un módulo CEC (chip Pulse Eight CEC adapter, ~3-5€).

### 11.4 Mando a Distancia como Input

El mando de TV sustituye al táctil del smartphone. Mapeo de botones:

```
┌─────────────────────────────────┐
│         MANDO DE TV             │
│                                 │
│    [🔴] [🟢] [🟡] [🔵]        │  ← Botones de colores
│     MAL  BIEN  ?   INFO        │
│                                 │
│         [  ▲  ]                │
│    [ ◄ ] [OK] [ ► ]           │  ← D-pad + OK = CHECK-IN
│         [  ▼  ]                │
│                                 │
│    [BACK]         [HOME]       │
│     Cerrar         Salir        │
└─────────────────────────────────┘
```

| Botón mando | Acción en Dame un Ok |
|---|---|
| **OK (centro)** | **CHECK-IN** principal — "Estoy bien" |
| **Verde** | "Estoy bien" (alternativa al OK) |
| **Rojo** | "Estoy mal" / "Necesito ayuda" |
| **Amarillo** | "No entiendo" / Repetir pregunta |
| **Flechas** | Navegar menú (si hay opciones) |
| **Back** | Cerrar alerta / volver a la emisión |
| **Micrófono** | (Futuro) Check-in por voz |

### 11.5 Overlay sobre Contenido: Cómo Interrumpir la Emisión

**Escenario:** María está viendo Antena 3. Son las 10:00, hora de check-in. El Tamagotchi debe aparecer.

**Solución por plataforma:**

| Plataforma | Mecanismo | Nivel de interrupción |
|---|---|---|
| **Android TV** | Foreground Service + startActivity(FLAG_NEW_TASK) lanza la app sobre cualquier contenido | ✅ COMPLETO — la app puede ponerse en primer plano |
| **Tizen** | Notification API muestra banner. La app puede auto-lanzarse si está en background con `tizen.application.launch()` | ⚠️ PARCIAL — banner + auto-launch (puede no cubrir TV en vivo) |
| **webOS** | Toast notification + launch. Luna Service Bus puede lanzar app en foreground | ⚠️ PARCIAL — similar a Tizen |
| **Hub IoT + CEC** | CEC cambia la fuente HDMI al hub → pantalla completa del hub | ✅ COMPLETO — funciona en CUALQUIER TV |

**Estrategia combinada (máxima cobertura):**
1. La app de TV intenta ponerse en foreground (funciona en Android TV)
2. Si no puede (Tizen/webOS), muestra notificación llamativa
3. Si la TV está en standby, el hub IoT la enciende vía CEC y muestra la alerta

### 11.6 Integración con el Backend

La Smart TV es un dispositivo más en la API unificada:

```json
// Registro de dispositivo Smart TV
POST /api/v1/devices
{
  "device_type": "smart_tv",
  "platform": "android_tv",          // "tizen" | "webos" | "firetv"
  "tv_model": "Samsung UE55AU7105",
  "tv_os_version": "Tizen 7.0",
  "user_id": "user_maria_001",
  "push_token": "fcm_token_xxx",     // FCM, Samsung Push, o webOS
  "capabilities": {
    "overlay": true,                  // ¿Puede mostrar overlay?
    "cec_hub": "hub_maria_001",       // ID del hub IoT asociado (si tiene)
    "wol_mac": "AA:BB:CC:DD:EE:FF",  // MAC para Wake on LAN
    "color_buttons": true,            // ¿Tiene botones de colores?
    "voice_input": false              // ¿Tiene micrófono en mando?
  }
}

// Check-in desde Smart TV
POST /api/v1/checkin
{
  "device_id": "tv_maria_001",
  "device_type": "smart_tv",
  "user_id": "user_maria_001",
  "input_method": "remote_ok_button", // "remote_color_green" | "voice"
  "response": "bien",                 // "bien" | "mal" | "no_entiendo"
  "timestamp": "2026-01-30T10:00:05Z"
}
```

### 11.7 Flujo Completo: Check-in por Smart TV

```
09:55  Backend programa alerta para las 10:00
10:00  Backend envía push notification a la TV de María
       │
       ├── TV ENCENDIDA (María ve Antena 3):
       │   ├── Android TV: App salta a pantalla completa
       │   ├── Tizen/webOS: Notificación banner + auto-launch
       │   └── Misi aparece: "¡Buenos días María! Pulsa OK 🟢"
       │
       └── TV EN STANDBY:
           ├── Backend envía comando al hub IoT (MQTT)
           ├── Hub envía CEC "Power On" + "Active Source"
           ├── TV se enciende → muestra pantalla del hub
           └── Hub muestra: "¡Buenos días María! Pulsa OK 🟢"

10:00-10:05  María ve a Misi en la TV
             María pulsa OK en su mando
             → Check-in enviado al backend
             → Misi salta de alegría 🎉
             → Familiar recibe notificación: "María ha dado su Ok ✅"
             → TV vuelve a Antena 3 (o a standby)

10:15  Si María NO ha pulsado OK:
       → Misi se pone triste en pantalla
       → Audio: "María, ¿estás ahí? Pulsa OK"
       → Si sigue sin respuesta → Protocolo de fallo normal
```

---

*Sección Smart TV añadida el 30 de enero de 2026. Concepto original de Ángel Fernández. Estudio completo en docs/estudio-smart-tv.md.*