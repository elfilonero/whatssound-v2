# 📺 Smart TV — Guía Técnica Completa

**Proyecto:** Dame un Ok  
**Área:** Desarrollo para Smart TV / Connected TV  
**Responsable virtual:** Carlos Media  
**Fecha:** 1 febrero 2026  
**Versión:** 1.0

---

## 1. Introducción: La TV como Canal Zero-Cost

La Smart TV es el dispositivo más presente en los hogares de personas mayores en España. Según datos de Statista y el INE (2024), la penetración de Smart TV en hogares españoles supera el 85%. Las personas mayores de 65 años ven una media de 5+ horas de televisión al día — es, con diferencia, la pantalla con la que más tiempo pasan.

**Ventaja estratégica:** A diferencia de todos los demás dispositivos del ecosistema Dame un Ok, la Smart TV no requiere hardware adicional. No hay coste de fabricación. No hay envío. No hay instalación física. El coste para el usuario es **literalmente 0€**. Solo necesita descargar una app de la tienda de su TV.

### Casos de uso en Dame un Ok

1. **Screensaver / Canal del Tamagotchi:** El avatar vive en la TV. Cuando la TV está en standby o sin señal, el Tamagotchi aparece animado en pantalla completa.
2. **Overlay de alerta:** Cuando es hora del check-in, aparece una notificación superpuesta sobre lo que esté viendo.
3. **Check-in con mando:** El usuario pulsa OK en el mando de la TV → alimenta al Tamagotchi → check-in registrado.
4. **Wake-up remoto:** El hub IoT enciende la TV vía HDMI-CEC para mostrar una alerta urgente.
5. **Dashboard familiar:** En la TV del hijo/hija, ver el estado de los avatares de toda la familia en pantalla grande.
6. **Mensajes de familia:** Los mensajes enviados por familiares se muestran en la TV del abuelo a pantalla completa.

---

## 2. Plataformas de Smart TV — Estado del Arte

### 2.1 Samsung Tizen (~35% cuota en España)

**Sistema operativo:** Tizen OS (basado en Linux, propio de Samsung)  
**Lenguaje de desarrollo:** HTML5 + CSS + JavaScript (Web Apps) o C++ (Native, raro para apps de terceros)  
**SDK:** Tizen Studio + Samsung Smart TV SDK  
**Tienda:** Samsung Apps (Galaxy Store para TV)  
**Versiones activas:** Tizen 3.0 (2017) hasta Tizen 8.0 (2024)

**Capacidades relevantes:**
- **Web app:** La app se desarrolla como una web app empaquetada (HTML/CSS/JS + config.xml)
- **Background mode:** Limitado. Las apps no pueden ejecutarse en background permanente, pero pueden registrar alarmas
- **Push notifications:** Samsung Push Service (SPS) — requiere registro de app en Samsung Developer Portal
- **Overlay:** No disponible como overlay sobre otras apps. Sí como screensaver o app independiente
- **HDMI-CEC:** API `tizen.tvwindow` y `tizen.tvinputdevice` permiten responder a comandos CEC entrantes
- **Wake on LAN:** La TV en standby mantiene la tarjeta de red activa. Se puede enviar Magic Packet para encenderla
- **Remote control:** API `tizen.tvinputdevice.registerKey()` para capturar teclas del mando
- **Almacenamiento:** `localStorage` y `IndexedDB` disponibles
- **Red:** `XMLHttpRequest`, `fetch`, WebSocket nativos. MQTT vía WebSocket

**Ejemplo conceptual — App Tizen básica:**

```javascript
// main.js — App Dame un Ok para Samsung Tizen
const AVATAR_STATE_URL = 'wss://api.dameunok.com/ws/avatar';
let avatarState = 'waiting';
let socket;

// Capturar botón OK del mando
tizen.tvinputdevice.registerKey('Return'); // Botón OK/Enter
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 13) { // OK/Enter
        performCheckin();
    }
});

function performCheckin() {
    fetch('https://api.dameunok.com/v1/checkin', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getDeviceToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            source: 'smart_tv',
            platform: 'tizen',
            device_id: getDeviceId()
        })
    })
    .then(res => res.json())
    .then(data => {
        showFeedingAnimation();
        avatarState = 'happy';
        renderAvatar();
    });
}

// WebSocket para actualizaciones en tiempo real
function connectWebSocket() {
    socket = new WebSocket(AVATAR_STATE_URL);
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        avatarState = data.state;
        renderAvatar();
        if (data.type === 'family_message') {
            showFamilyMessage(data.message);
        }
    };
}

function renderAvatar() {
    const canvas = document.getElementById('avatar-canvas');
    const ctx = canvas.getContext('2d');
    // Renderizar avatar según estado
    drawAvatarSprite(ctx, currentAvatar, avatarState);
    drawStreakCounter(ctx, streakDays);
    drawStatusText(ctx, avatarState);
}
```

```xml
<!-- config.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns="http://www.w3.org/ns/widgets"
        xmlns:tizen="http://tizen.org/ns/widgets"
        id="http://dameunok.com/tv"
        version="1.0.0">
    <tizen:application id="dameunok.tv" package="com.dameunok.tv"
                       required_version="3.0"/>
    <content src="index.html"/>
    <name>Dame un Ok</name>
    <tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>
    <tizen:privilege name="http://tizen.org/privilege/internet"/>
    <tizen:privilege name="http://tizen.org/privilege/alarm"/>
</widget>
```

**Proceso de publicación en Samsung Apps:**
1. Registrarse como desarrollador en Samsung Seller Office
2. Crear seller account (requiere datos de empresa)
3. Subir app empaquetada (.wgt)
4. Declarar dispositivos target (por año de TV)
5. Review: 2-8 semanas (Samsung es lento)
6. Distribución por país (España primero)

**Limitaciones Samsung Tizen:**
- No hay background execution persistente
- Push requiere Samsung Push Service (no FCM)
- Las TVs de 2017-2018 tienen CPUs muy limitadas (~1GHz ARM)
- La memoria disponible para apps es ~150-300MB
- No hay acceso a overlay sobre señal de TV/HDMI

---

### 2.2 LG webOS (~20% cuota en España)

**Sistema operativo:** webOS (basado en Linux, originalmente de Palm/HP, adquirido por LG)  
**Lenguaje:** HTML5 + CSS + JavaScript (Web Apps) o C++ vía Luna Service Bus  
**SDK:** webOS TV SDK + ENACTjs framework  
**Tienda:** LG Content Store  
**Versiones activas:** webOS 4.0 (2018) hasta webOS 24 (2024, renumerado)

**Capacidades relevantes:**
- **ENACTjs:** Framework React-based creado por LG específicamente para webOS TV. Componentes optimizados para navegación con mando
- **Luna Service Bus:** IPC para comunicación entre servicios del SO. Permite registrar servicios en background
- **Push:** LG Push Notification Service
- **HDMI-CEC:** API `luna://com.webos.service.tv.display` para control CEC
- **Remote control:** KeyEvents estándar capturables en JavaScript
- **WebSocket/MQTT:** Soportado vía web estándar

**Proceso de publicación LG Content Store:**
1. Registro en LG Seller Lounge
2. Subir app empaquetada (.ipk)
3. Test en simulador y dispositivos reales
4. Review: 2-6 semanas
5. Distribución geográfica configurable

---

### 2.3 Android TV / Google TV (~25% cuota en España)

**Sistema operativo:** Android TV (Android con Leanback launcher) / Google TV (capa sobre Android TV)  
**Lenguaje:** Kotlin/Java (nativo) o web  
**SDK:** Android SDK + Leanback Support Library + Compose for TV  
**Tienda:** Google Play Store (sección TV)  
**Versiones activas:** Android TV 10+ (API 29+)

**Capacidades relevantes:**
- **Leanback Library:** Componentes UI diseñados para 10-foot experience: `BrowseFragment`, `DetailsFragment`, `SearchFragment`
- **Compose for TV:** Jetpack Compose adaptado para TV (desde 2023). La opción más moderna
- **FCM:** Firebase Cloud Messaging funciona nativamente — GRAN ventaja vs Samsung/LG
- **Background services:** Android services estándar (con restricciones de Doze mode)
- **HDMI-CEC:** `HdmiControlManager` API (desde API 28). Puede enviar y recibir comandos CEC
- **Recommendations:** Puede mostrar contenido en la home screen de Android TV
- **Cast:** Soporte nativo de Google Cast para recibir contenido desde mobile

**Ejemplo conceptual — Android TV con Compose:**

```kotlin
// MainActivity.kt — Dame un Ok para Android TV
@Composable
fun AvatarScreen(viewModel: AvatarViewModel) {
    val avatarState by viewModel.avatarState.collectAsState()
    val streak by viewModel.streak.collectAsState()
    
    TvLazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFFFFF3E0))
    ) {
        item {
            AvatarDisplay(
                state = avatarState,
                streak = streak,
                onOkPressed = { viewModel.performCheckin() }
            )
        }
        item {
            FamilyMessages(messages = viewModel.messages)
        }
    }
}

// Manejar botón OK del mando
override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
    if (keyCode == KeyEvent.KEYCODE_DPAD_CENTER || 
        keyCode == KeyEvent.KEYCODE_ENTER) {
        viewModel.performCheckin()
        return true
    }
    return super.onKeyDown(keyCode, event)
}
```

**Ventajas de Android TV:**
- Push via FCM funciona sin problemas
- Mismo stack que la app mobile (si usamos Kotlin)
- Google Play Store tiene proceso de review más rápido (~1-3 días)
- Background services más flexibles
- Más RAM disponible (~500MB+)
- Cast integration para enviar contenido desde la app mobile del familiar

---

### 2.4 Amazon Fire TV (~10% cuota en España)

**Sistema operativo:** Fire OS (fork de Android)  
**Lenguaje:** Kotlin/Java (mismo que Android TV) o Web App  
**SDK:** Android SDK + Fire TV SDK + Alexa Voice Service  
**Tienda:** Amazon Appstore

La app de Android TV funciona en Fire TV con mínimas adaptaciones:
- Reemplazar FCM por Amazon Device Messaging (ADM)
- Adaptar UI al launcher de Fire TV
- Integrar Alexa: "Alexa, alimenta a mi gatito" → check-in por voz

---

## 3. Diseño de UI para TV (10-foot Experience)

### 3.1 Principios de diseño para distancia

La "10-foot experience" es el paradigma de diseño para TV: el usuario está a 3 metros de distancia con un mando de 5 botones (arriba, abajo, izquierda, derecha, OK).

**Reglas fundamentales:**

| Regla | Valor | Motivo |
|---|---|---|
| Tamaño mínimo de texto | 24sp (TV) = ~32px | Legible a 3 metros |
| Texto principal (títulos) | 40-60sp | Visible inmediatamente |
| Padding mínimo entre elementos | 16dp | Navegación clara con D-pad |
| Safe zone | 5% margin en los 4 bordes | TVs recortan bordes (overscan) |
| Contraste mínimo | 4.5:1 (AAA preferible: 7:1) | Personas mayores con vista reducida |
| Colores | Evitar rojo puro, azul puro | Se ven mal en TV (bleeding) |
| Focus indicator | Borde brillante + scale 1.1x | El usuario debe ver SIEMPRE dónde está |
| Animaciones | 300-500ms, ease-in-out | Suaves, no abruptas |
| Número máximo de items visibles | 5-7 por pantalla | Simplidad cognitiva |

### 3.2 Layout de la app

**Pantalla principal — Avatar a pantalla completa:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│                    ┌────────────────┐                        │
│                    │                │                        │
│                    │   AVATAR       │     Michi              │
│                    │   ANIMADO      │     ♥♥♥♥♥              │
│                    │   (grande)     │     Racha: 32 días 🔥  │
│                    │                │                        │
│                    └────────────────┘     Estado: Contento 😊│
│                                                              │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│   │ Alimentar │  │ Acariciar│  │ Mensajes │                  │
│   │    🍖     │  │    ✋    │  │    💌    │                  │
│   └──────────┘  └──────────┘  └──────────┘                  │
│                                                              │
│                          10:30 AM         Dame un Ok 🇪🇸     │
└─────────────────────────────────────────────────────────────┘
```

**Pantalla de alerta (overlay / interrupción):**

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│         ┌──────────────────────────────────────┐             │
│         │                                      │             │
│         │   🐱 ¡Michi tiene hambre!            │             │
│         │                                      │             │
│         │   Pulsa OK para darle de comer       │             │
│         │                                      │             │
│         │          [  OK  ]                    │             │
│         │                                      │             │
│         └──────────────────────────────────────┘             │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. HDMI-CEC — Control entre Dispositivos

### 4.1 ¿Qué es HDMI-CEC?

HDMI-CEC (Consumer Electronics Control) es un protocolo que permite a los dispositivos conectados por HDMI controlarse mutuamente. Cada fabricante lo llama diferente:

| Fabricante | Nombre comercial |
|---|---|
| Samsung | Anynet+ |
| LG | SimpLink |
| Sony | Bravia Sync |
| Philips | EasyLink |
| Panasonic | VIERA Link |

### 4.2 Capacidades CEC relevantes

| Comando CEC | Opcode | Uso en Dame un Ok |
|---|---|---|
| Image View On | `0x04` | Encender TV desde hub IoT |
| Text View On | `0x0D` | Encender TV y mostrar texto |
| Standby | `0x36` | Apagar TV (después de mostrar alerta) |
| Active Source | `0x82` | Cambiar input a nuestro dispositivo HDMI |
| Set OSD String | `0x64` | Mostrar texto breve en pantalla |
| User Control Pressed | `0x44` | Recibir pulsaciones de mando |
| Deck Control | `0x42` | Control de reproducción |

### 4.3 Integración con Hub IoT

El hub IoT de Dame un Ok (ESP32 con salida HDMI vía adaptador o placa dedicada) puede:

1. **Encender la TV:** Enviar `Image View On` (0x04) + `Active Source` (0x82)
2. **Mostrar alerta:** Encender TV → cambiar a entrada HDMI del hub → mostrar alerta gráfica
3. **Recibir botón OK:** Capturar `User Control Pressed` con opcode de "Select" (0x00) → check-in
4. **Apagar TV:** Enviar `Standby` (0x36) después de timeout

**Flujo de alerta vía HDMI-CEC:**

```
Backend detecta: No hay check-in, han pasado 2h
  → MQTT a hub IoT: { "command": "wake_tv", "content": "checkin_alert" }
  → Hub IoT envía CEC: Image View On + Active Source
  → TV se enciende y cambia a entrada HDMI del hub
  → Hub muestra en pantalla: "🐱 Michi tiene hambre. Pulsa OK en el mando"
  → Hub espera CEC: User Control Pressed (Select)
  → Usuario pulsa OK → Hub envía check-in vía MQTT
  → Hub muestra: "✅ ¡Michi ha comido! Racha: 33 días"
  → Timeout 30s → Hub envía CEC: Standby (o vuelve a la TV)
```

### 4.4 Wake on LAN (WoL)

Para encender la TV sin hub HDMI, se puede usar Wake on LAN si la TV lo soporta:

```python
# Wake on LAN — Magic Packet
import socket
import struct

def wake_on_lan(mac_address):
    mac_bytes = bytes.fromhex(mac_address.replace(':', ''))
    magic_packet = b'\xff' * 6 + mac_bytes * 16
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.sendto(magic_packet, ('255.255.255.255', 9))
    sock.close()
```

**Limitación:** La mayoría de Smart TVs solo responden a WoL cuando están en standby "rápido" (no deep standby). Muchos usuarios apagan la TV con la regleta → WoL no funciona. HDMI-CEC es más fiable.

---

## 5. Estrategia de Desarrollo Multi-Plataforma

### 5.1 Enfoque recomendado: Web App + adaptadores nativos

Dado que Samsung Tizen, LG webOS y Fire TV soportan web apps, la estrategia más eficiente es:

1. **Core como Web App:** HTML5 + CSS + JavaScript (con framework React/Preact)
2. **Adaptadores nativos:** Capa delgada por plataforma para APIs específicas (push, CEC, mando)
3. **Android TV nativo:** App Kotlin separada (comparte backend, diferente frontend)

```
┌─────────────────────────────────────┐
│         DAME UN OK TV APP           │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────────────────────┐     │
│   │     UI LAYER (shared)     │     │
│   │   React/Preact + Canvas   │     │
│   │   Avatar rendering        │     │
│   │   Navigation (D-pad)      │     │
│   └───────────┬───────────────┘     │
│               │                     │
│   ┌───────────┴───────────────┐     │
│   │   PLATFORM ADAPTER        │     │
│   ├───────┬───────┬───────────┤     │
│   │ Tizen │ webOS │ Fire TV   │     │
│   │ API   │ Luna  │ ADM/Web   │     │
│   │ Push  │ Push  │ Alexa     │     │
│   │ Keys  │ Keys  │ Keys      │     │
│   └───────┴───────┴───────────┘     │
│                                     │
│   ┌───────────────────────────┐     │
│   │   ANDROID TV (separate)   │     │
│   │   Kotlin + Compose for TV │     │
│   │   FCM + CEC API           │     │
│   └───────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 Renderizado del avatar en TV

Para la TV, el avatar se renderiza con **Canvas 2D** o **Lottie/Web Animations API**:

- **Canvas 2D:** Máxima compatibilidad con TVs antiguas. Sprite-sheet animation manual
- **Lottie (lottie-web):** Animaciones vectoriales fluidas. Funciona en TVs 2019+
- **CSS Animations:** Para transiciones simples (fade, scale). Muy compatible

**Resoluciones target:**
- 1080p (1920×1080): La mayoría de Smart TVs
- 4K (3840×2160): TVs recientes, pero renderizar a 1080p y upscalear
- Avatar: Renderizar a 512×512 o 1024×1024 para que se vea nítido en pantalla grande

---

## 6. Screensaver / Ambient Mode

### 6.1 Samsung Ambient Mode

Samsung ofrece "Ambient Mode" en sus TVs premium (QLED/Neo QLED): la TV muestra contenido visual cuando está en standby. Samsung permite a desarrolladores crear contenido para Ambient Mode a través del Ambient Mode SDK.

**Posibilidad:** El Tamagotchi de Dame un Ok como Ambient Mode content. La TV "apagada" muestra al gatito dormido. Cuando es hora de check-in, el gatito se despierta y espera.

### 6.2 Screensaver estándar

En Android TV y algunos LG webOS, se puede registrar la app como **Dreams** (screensaver):

```kotlin
// DameUnOkDreamService.kt — Screensaver Android TV
class AvatarDreamService : DreamService() {
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        isInteractive = true // Permitir interacción
        isFullscreen = true
        setContentView(R.layout.dream_avatar)
        startAvatarAnimation()
    }
    
    override fun onDreamingStarted() {
        // Avatar en modo idle/dormido
        showSleepingAvatar()
    }
}
```

---

## 7. Publicación y Distribución

### 7.1 Resumen de tiendas

| Tienda | Tiempo de review | Coste | Requisitos |
|---|---|---|---|
| Samsung Apps | 2-8 semanas | Gratis | Seller Office account, test en dispositivos |
| LG Content Store | 2-6 semanas | Gratis | Seller Lounge account |
| Google Play (TV) | 1-3 días | 25€ (una vez) | Developer account |
| Amazon Appstore | 1-2 semanas | Gratis | Amazon Developer account |

### 7.2 Certificación y requisitos

Cada tienda tiene requisitos específicos:

**Samsung:** 
- Debe funcionar sin crash en TVs 2017+
- Debe responder al botón "Back" del mando para navegar atrás
- No puede solicitar permisos excesivos
- Debe incluir política de privacidad accesible

**LG:**
- Debe funcionar en webOS 4.0+
- ENACTjs recomendado pero no obligatorio
- Test en simulador LG + dispositivo real

**Google Play (TV):**
- Debe declarar `android.software.leanback` en manifest
- Debe proporcionar banner de 320×180px
- Toda la navegación debe funcionar con D-pad
- No puede requerir touch screen

---

## 8. Rendimiento y Optimización

### 8.1 Limitaciones de hardware

Las Smart TVs de gama baja (2017-2019) tienen hardware comparable a un smartphone de 2014:

| Componente | Gama baja (2017) | Gama media (2020) | Gama alta (2023) |
|---|---|---|---|
| CPU | 1GHz ARM quad | 1.5GHz ARM quad | 2GHz ARM quad/octa |
| RAM | 1-1.5GB | 2GB | 3-4GB |
| GPU | Mali-400 | Mali-T760 | Mali-G52+ |
| Storage | 4-8GB | 8GB | 16-32GB |
| WiFi | 802.11n | 802.11ac | 802.11ax |

**Implicaciones:**
- Minimizar uso de memoria: no cargar todos los sprites a la vez
- Evitar frameworks pesados (React completo ~120KB gzip). Usar Preact (~3KB)
- Canvas 2D es más eficiente que DOM manipulation para animaciones
- WebSocket con reconexión automática (las TVs pierden conexión frecuentemente)
- No usar Web Workers (soporte inconsistente en TVs antiguas)

### 8.2 Optimizaciones recomendadas

```javascript
// Optimización: Pre-cargar sprites y cachear
const spriteCache = new Map();

async function preloadSprites(avatarType) {
    const states = ['happy', 'sad', 'sleeping', 'hungry', 'eating'];
    for (const state of states) {
        const img = new Image();
        img.src = `sprites/${avatarType}/${state}.png`;
        await new Promise(r => img.onload = r);
        spriteCache.set(`${avatarType}_${state}`, img);
    }
}

// Optimización: requestAnimationFrame con throttle
let lastFrame = 0;
const TARGET_FPS = 15; // 15 FPS es suficiente para un Tamagotchi
const FRAME_INTERVAL = 1000 / TARGET_FPS;

function gameLoop(timestamp) {
    if (timestamp - lastFrame >= FRAME_INTERVAL) {
        updateAvatar();
        renderFrame();
        lastFrame = timestamp;
    }
    requestAnimationFrame(gameLoop);
}
```

---

## 9. Integración con el Ecosistema Dame un Ok

### 9.1 Comunicación con backend

La app TV se comunica con el backend de Dame un Ok de la misma forma que la app móvil:

- **REST API:** Para check-ins, obtener estado del avatar, mensajes familiares
- **WebSocket:** Para actualizaciones en tiempo real (cambios de estado, nuevos mensajes)
- **Autenticación:** Token de dispositivo almacenado en localStorage de la TV

### 9.2 Emparejamiento TV-Usuario

1. La TV muestra un código QR + código numérico de 6 dígitos
2. El familiar escanea el QR o introduce el código en la app mobile
3. La TV queda vinculada al usuario (abuelo)
4. La TV comienza a mostrar el avatar y recibir actualizaciones

### 9.3 Multi-dispositivo

Un mismo usuario puede tener:
- App móvil + TV + botón IoT → todos muestran el mismo avatar
- El check-in desde cualquier dispositivo actualiza todos los demás en tiempo real
- La TV muestra el estado del avatar incluso si el check-in se hizo desde el botón

---

## 10. Roadmap de Desarrollo TV

| Fase | Alcance | Plataformas | Timeline |
|---|---|---|---|
| **MVP TV** | Avatar estático + check-in con OK + mensajes | Android TV | +2 semanas post-MVP app |
| **v1.1** | Screensaver/Dreams, animaciones | + Samsung Tizen | +4 semanas |
| **v1.2** | HDMI-CEC wake-up, overlay | + Hub IoT integration | +6 semanas |
| **v2.0** | LG webOS, Fire TV, Ambient Mode | Todas | +10 semanas |

---

*Documento técnico preparado para el equipo de desarrollo de Dame un Ok. Basado en documentación oficial de Samsung Tizen, LG webOS, Android TV y especificaciones HDMI-CEC 1.4/2.0.*
