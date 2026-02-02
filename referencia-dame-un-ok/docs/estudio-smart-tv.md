# 📺 Estudio de Viabilidad: Dame un Ok en Smart TVs

**Fecha:** 30 enero 2026  
**Versión:** 1.0  
**Autores:** Marcos Delgado (IoT/Hardware), Elena Soto (Embebidos), Ricardo Montoya (Telecom), Sara Jiménez (UX Senior), Iñaki Goicoechea (Cloud), Pablo Ruiz (Gamificación)  
**Documentado por:** Leo (IA)  
**Origen de la idea:** Ángel Fernández (fundador)

---

## Resumen Ejecutivo

Ángel identifica un insight crucial: **muchos mayores no tienen smartphone, pero SÍ tienen Smart TV**. Sus hijos les han actualizado la televisión, y es el dispositivo electrónico con el que más tiempo pasan. Este estudio evalúa la viabilidad técnica, comercial y de experiencia de usuario de llevar "Dame un Ok" a las Smart TVs como canal de check-in.

**Conclusión adelantada: VIABLE y ESTRATÉGICAMENTE PRIORITARIO.** La Smart TV es posiblemente el dispositivo más natural para el público mayor — ya lo usan horas al día, el mando es un input que dominan, y la pantalla grande permite interfaces de altísima accesibilidad.

---

## 1. Penetración de Smart TVs en España

### 1.1 Datos Generales

- **Penetración de Smart TV en hogares españoles:** ~85% de los hogares con TV tienen al menos una Smart TV (2024-2025). España está por encima de la media europea.
- **Hogares con televisor en España:** ~99% (el televisor sigue siendo el electrodoméstico más universal).
- **Ventas anuales de TVs en España:** ~4,5 millones de unidades/año, de las cuales >95% son Smart TVs desde 2022. Ya prácticamente no se venden TVs "tontas".
- **Segundo televisor:** ~40% de los hogares españoles tienen 2 o más televisores.

**Fuentes:** CNMC Panel de Hogares 2024, Euromonitor International, GfK España.

### 1.2 Penetración en Hogares de Personas Mayores

- **Hogares de mayores de 65 años con TV:** ~99,5% — la tasa más alta de cualquier grupo demográfico.
- **Smart TVs en hogares de mayores:** Estimación ~65-75%. Inferior a la media nacional porque muchos mayores conservan TVs más antiguas. PERO: la tendencia es fuertemente ascendente porque:
  - Los hijos renuevan la TV de los padres como regalo (Navidad, cumpleaños)
  - Las TVs no-smart prácticamente han desaparecido del mercado desde 2020
  - Cuando se estropea la vieja, la reemplazan por Smart TV inevitablemente
- **Uso diario de TV en mayores de 65:** ~5,2 horas/día (el grupo que más TV consume, según Barlovento Comunicación / Kantar Media 2024).
- **Proyección 2027:** Se espera que la penetración de Smart TV en hogares de mayores supere el 85%, igualándose con la media nacional.

### 1.3 Implicación para Dame un Ok

> **El televisor es, de facto, el dispositivo tecnológico más usado por nuestro público objetivo.** Los mayores ven la TV una media de 5 horas al día. Es el lugar donde están. Si "Dame un Ok" puede vivir ahí, el check-in se convierte en algo tan natural como cambiar de canal.

---

## 2. Plataformas de Smart TV en España: Cuota de Mercado

### 2.1 Sistemas Operativos de Smart TV (España, estimación 2024-2025)

| Plataforma | Fabricante(s) | Cuota España (est.) | Tecnología de Apps | Tienda |
|---|---|---|---|---|
| **Tizen OS** | Samsung | ~30-33% | HTML5/CSS/JS (WebApp) + Tizen Native (C/C++) | Samsung TV Apps / Samsung Seller Office |
| **webOS** | LG | ~15-18% | HTML5/CSS/JS (WebApp) + webOS Native | LG Content Store / LG Seller Lounge |
| **Android TV / Google TV** | Sony, Philips, TCL, Xiaomi, Hisense, otros | ~35-40% | Android SDK (Java/Kotlin), también Leanback | Google Play Store |
| **Fire OS** | Amazon (Fire TV Stick) | ~8-12% | Android fork + Amazon Appstore | Amazon Appstore |
| **Vidaa / otros** | Hisense (propio), Panasonic (Firefox OS legacy) | ~5-8% | HTML5 (Vidaa), varía | Vidaa App Store |
| **Roku TV** | TCL (algunos modelos), Roku stick | ~2-3% | BrightScript / SceneGraph | Roku Channel Store |
| **Apple TV** | Apple (set-top box) | ~3-5% (box, no TV) | Swift/tvOS | Apple App Store |

### 2.2 Análisis: ¿A qué plataformas apuntar?

**Prioridad 1 — Cobertura ~85% del mercado:**
1. **Android TV / Google TV** (~35-40%) → Mayor cuota, ecosistema familiar, Play Store.
2. **Samsung Tizen** (~30-33%) → Samsung es el líder en ventas de TVs en España.
3. **LG webOS** (~15-18%) → Segunda marca en España.

**Prioridad 2 — Extensión:**
4. **Amazon Fire TV** (~8-12%) → Fork de Android, reutilizable parcialmente.
5. **Vidaa (Hisense)** → Hisense crece rápido en España (precio agresivo).

> **Con Android TV + Tizen + webOS cubrimos ~80-90% del parque instalado de Smart TVs en España.**

---

## 3. Capacidades Técnicas Críticas

### 3.1 ¿Puede una app interrumpir la emisión? (Overlay / Notificación)

Este es el requisito clave de Ángel: cuando llega la hora del check-in, el avatar debe "saltar" sobre lo que esté viendo el usuario.

| Plataforma | ¿Overlay posible? | Mecanismo | Limitaciones |
|---|---|---|---|
| **Android TV** | ✅ SÍ | `TYPE_APPLICATION_OVERLAY` (requiere permiso), o notificaciones con `NotificationCompat` que aparecen como toast/banner | Las notificaciones nativas de Android TV aparecen como banners en la esquina superior. Para overlay completo se necesita permiso especial (accesibilidad o similar). Google Play puede rechazar apps que abusen de overlay. |
| **Samsung Tizen** | ⚠️ PARCIAL | Las apps en background pueden usar la **Notification API** para mostrar banners. No hay overlay arbitrario sobre otras apps. Samsung tiene "Smart Hub" notifications. | No se puede dibujar sobre la emisión de TV en vivo desde una app de terceros. Se limita a notificaciones del sistema. |
| **LG webOS** | ⚠️ PARCIAL | Similar a Tizen: las apps pueden enviar notificaciones toast, pero no superponer UI completa sobre la emisión. webOS tiene la "barra de notificaciones". | Misma limitación: no hay overlay arbitrario. |
| **Fire TV** | ✅ SÍ | Similar a Android TV (fork). Soporta notificaciones y con permisos especiales, overlays. | Amazon es más restrictivo en su Appstore. |

#### Solución Propuesta: Enfoque Híbrido

1. **Notificación push → Apertura automática:** La app envía una notificación que, al recibirse, lanza la app a pantalla completa automáticamente (posible en Android TV con `foreground service` + `startActivity`).
2. **En Tizen/webOS:** Usar la notificación nativa del sistema + banner llamativo que invite al usuario a entrar en la app con un botón del mando.
3. **Alternativa hardware:** Combinar con el **hub IoT** de Dame un Ok. El hub (ESP32) envía un comando HDMI-CEC que cambia la entrada HDMI al dispositivo propio, mostrando la alerta. Esto funciona en CUALQUIER TV, incluso no-Smart.

### 3.2 ¿Se puede encender la TV desde standby?

| Tecnología | ¿Funciona? | Detalles |
|---|---|---|
| **Wake on LAN (WoL)** | ✅ SÍ (si la TV lo soporta y está habilitado) | La mayoría de Smart TVs modernas soportan WoL. Se envía un "magic packet" por la red local. Requiere que la TV esté conectada por cable Ethernet o que el WiFi mantenga escucha en standby (varía por modelo). Samsung y LG lo soportan en la mayoría de modelos desde 2018+. |
| **HDMI-CEC** | ✅ SÍ | Un dispositivo conectado por HDMI (como un Chromecast, Fire Stick, o nuestro propio hub IoT) puede enviar el comando CEC "Power On" + "Active Source" para encender la TV y cambiar a su entrada. Funciona en prácticamente todas las Smart TVs. Samsung lo llama "Anynet+", LG "SimpLink". |
| **Smart Home / API** | ✅ SÍ (parcial) | Samsung SmartThings, LG ThinQ, y Google Home permiten encender TVs compatibles vía API en la nube. Requiere cuenta del usuario y setup previo. |
| **Bluetooth LE** | ❌ NO viable | No se puede encender una TV por BLE desde standby. |

#### Solución Propuesta: HDMI-CEC como mecanismo universal

> **El hub IoT de Dame un Ok (ESP32) conectado por HDMI puede encender CUALQUIER TV vía CEC.** Este es el mecanismo más fiable y universal. No depende de WiFi en standby ni de configuraciones especiales del usuario.

**Flujo:**
1. Backend detecta que es hora de check-in → Push notification a la app de TV
2. Si la TV está encendida: la app muestra overlay/notificación
3. Si la TV está en standby: el hub IoT (conectado por HDMI) envía CEC Power On + Active Source
4. La TV se enciende y muestra la pantalla de check-in del hub
5. El usuario pulsa OK en el mando → Check-in completado
6. Tras 30 segundos sin interacción, la TV vuelve a la fuente anterior o a standby

### 3.3 Mando a Distancia como Input

El mando de TV es un input extremadamente limitado comparado con un smartphone táctil:

| Input disponible | Uso en Dame un Ok |
|---|---|
| **Botón OK/Enter** (centro del pad direccional) | **CHECK-IN** — el gesto principal |
| **Flechas (arriba/abajo/izq/der)** | Navegar entre opciones (alimentar mascota, ver estado, configuración) |
| **Botón Back** | Cerrar la app / volver atrás |
| **Botones de colores (rojo/verde/amarillo/azul)** | Accesos rápidos: Rojo = "Estoy mal", Verde = "Estoy bien", Amarillo = "Necesito ayuda" |
| **Botón numérico** | No usado (demasiado complejo para el público) |
| **Micrófono (mandos con voz)** | Futuro: check-in por voz ("Ok, estoy bien") |

#### Principios de UX para TV

- **Navegación D-pad:** Todo debe ser accesible con las 4 flechas + OK
- **Focus visible:** El elemento seleccionado debe tener un borde/brillo MUY visible (los mayores necesitan ver claramente qué está seleccionado)
- **Tamaño de texto mínimo:** 32px a resolución 1080p (legible a 3 metros)
- **Contraste:** Ratio mínimo 7:1 (WCAG AAA)
- **Sin scroll:** Todo el contenido debe caber en una pantalla
- **Tiempo de respuesta:** Feedback inmediato al pulsar OK (vibración visual: el avatar reacciona al instante)

---

## 4. Desarrollo para Smart TV: Stack Técnico

### 4.1 Tecnologías por Plataforma

#### Android TV (Google TV)
- **SDK:** Android SDK + Leanback library (componentes optimizados para TV)
- **Lenguajes:** Kotlin/Java (nativo), React Native (con limitaciones), Flutter (soporte TV experimental)
- **UI Framework:** Leanback (banners, cards, browse fragments), Jetpack Compose for TV (nuevo, 2024+)
- **Distribución:** Google Play Store (sección TV)
- **Proceso de publicación:** Similar a apps móviles, con requisitos adicionales de TV (D-pad navigation, no touch, banners 320x180, etc.)
- **Revisión:** ~3-7 días

#### Samsung Tizen
- **SDK:** Tizen Studio + TV Extensions
- **Lenguajes:** HTML5/CSS3/JavaScript (web apps — LA OPCIÓN RECOMENDADA), o C/C++ (nativo, raro)
- **UI Framework:** Web app con TAU (Tizen Advanced UI) o frameworks web estándar (React, Vue, etc.)
- **Distribución:** Samsung TV Seller Office → Samsung TV Apps Store
- **Proceso de publicación:** Submit en Seller Office, revisión por Samsung (~1-2 semanas), requiere cuenta de empresa verificada
- **Particularidades:** Las web apps de Tizen corren en Chromium embebido. Muy similar a desarrollo web normal.

#### LG webOS
- **SDK:** webOS TV SDK (basado en Node.js CLI tools)
- **Lenguajes:** HTML5/CSS3/JavaScript (web apps — principal), Enact framework (React-based, creado por LG)
- **UI Framework:** Enact (recomendado por LG, basado en React) o web estándar
- **Distribución:** LG Seller Lounge → LG Content Store
- **Proceso de publicación:** Submit en Seller Lounge, revisión ~1-2 semanas
- **Particularidades:** webOS también usa motor web (Chromium). Apps web muy similares a Tizen.

#### Amazon Fire TV
- **SDK:** Android SDK (Fire TV es fork de Android)
- **Lenguajes:** Kotlin/Java, también web apps
- **Distribución:** Amazon Appstore (Developer Console)
- **Proceso:** Similar a Android pero con requisitos Amazon adicionales

### 4.2 Estrategia de Desarrollo: Web App Universal + Wrappers Nativos

> **RECOMENDACIÓN: Desarrollar una app HTML5/CSS/JS que funcione en las 3 plataformas principales (Tizen, webOS, Android TV webview) con wrappers mínimos para cada plataforma.**

**Ventajas:**
- Un solo código base para el 85%+ del mercado
- HTML5 es el denominador común: Tizen y webOS lo usan nativamente, Android TV lo soporta via WebView
- El equipo de Vertex ya tiene experiencia web (Flutter web, React)
- Iteración rápida: cambiar la UI no requiere re-publicar en las stores (si se usa un modelo híbrido con assets remotos)
- Mismo diseño responsivo que podría servir para la versión web/desktop

**Estructura propuesta:**

```
dame-un-ok-tv/
├── src/                      # Código compartido HTML5/CSS/JS
│   ├── index.html
│   ├── css/
│   │   └── tv-styles.css     # UI optimizada para TV (10-foot UI)
│   ├── js/
│   │   ├── app.js            # Lógica principal
│   │   ├── checkin.js        # Módulo de check-in
│   │   ├── avatar.js         # Tamagotchi rendering (Canvas/SVG)
│   │   ├── navigation.js     # D-pad navigation manager
│   │   └── api.js            # Comunicación con backend
│   └── assets/
│       └── sprites/          # Sprites del avatar
├── platforms/
│   ├── tizen/                # config.xml + packaging Tizen
│   ├── webos/                # appinfo.json + packaging webOS
│   ├── android-tv/           # Wrapper Android (WebView + servicios nativos)
│   └── firetv/               # Wrapper Fire TV
└── shared/                   # Assets compartidos con app móvil
```

**Para el overlay/notificaciones:** cada wrapper nativo implementa el puente entre la web app y las APIs de notificación específicas de la plataforma.

---

## 5. Tiendas de Apps y Proceso de Publicación

### 5.1 Comparativa de Stores

| Store | Plataforma | Coste desarrollador | Tiempo revisión | Requisitos clave |
|---|---|---|---|---|
| **Google Play (TV)** | Android TV / Google TV | 25$ (una vez) | 3-7 días | Leanback support, D-pad navigation, banners 320x180, no touch dependency |
| **Samsung Seller Office** | Tizen | Gratis (cuenta empresa) | 7-14 días | Empresa verificada, screenshots TV, manifest correcto, no crash en 5min test |
| **LG Seller Lounge** | webOS | Gratis (cuenta empresa) | 7-14 días | Empresa verificada, screenshots, test en emulador webOS |
| **Amazon Appstore** | Fire TV | Gratis | 5-10 días | Similar a Android + políticas Amazon |

### 5.2 Categoría de la App

La app se publicaría en la categoría **"Salud y Bienestar"** o **"Estilo de Vida"** según la plataforma. No existe categoría específica de "teleasistencia" en ninguna store de TV.

### 5.3 Certificaciones Necesarias

- **RGPD compliance** (obligatorio en UE)
- **Accesibilidad:** WCAG 2.1 AA mínimo (recomendado AAA para nuestro público)
- **Samsung:** Certificación adicional de seguridad si se manejan datos de salud
- **Google Play:** Política de "Health apps" si se clasifica como salud

---

## 6. Limitaciones y Riesgos

### 6.1 Limitaciones Técnicas

| Limitación | Impacto | Mitigación |
|---|---|---|
| **No hay overlay universal** | No se puede interrumpir Netflix/TDT desde una app de terceros en Tizen/webOS | Hub IoT con HDMI-CEC como fallback; notificaciones del sistema |
| **WiFi en standby** | Algunas TVs desconectan WiFi en standby (no reciben push) | HDMI-CEC desde hub IoT; WoL por cable Ethernet |
| **Input limitado (D-pad)** | UX restringida comparada con touch | Diseño "10-foot UI" específico; mínimas opciones |
| **No hay sensores** | No hay acelerómetro, GPS, etc. | La TV no es para tracking, es para check-in y presencia |
| **Fragmentación** | 5+ plataformas con APIs diferentes | Web app universal + wrappers mínimos |
| **Actualizaciones lentas** | Las stores de TV tardan más en aprobar updates | Assets remotos para cambios de UI; lógica en backend |
| **Distancia de lectura** | Usuario a 2-4 metros de la pantalla | Tipografía mínima 32px, alto contraste, iconos grandes |

### 6.2 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Samsung/LG rechazan la app por overlay agresivo | Media | Alto | Versión "educada" con notificación + botón, no overlay forzado |
| Mayores no saben instalar apps en TV | Alta | Alto | El familiar configura remotamente; o pre-instalación vía hub IoT |
| TV no conectada a Internet | Baja-Media | Crítico | Hub IoT como fallback (WiFi propio + HDMI) |
| Latencia en recibir notificaciones | Baja | Medio | Push notifications + polling cada 5min como backup |
| Competidores copian la idea | Baja | Medio | First mover advantage; ecosistema multi-dispositivo difícil de replicar |

### 6.3 La Pregunta del Millón: ¿Quién instala la app?

> **El mayor NO va a instalar la app en su TV.** Esto lo hará el familiar (hijo/hija) de forma remota o presencial.

**Opciones de instalación:**
1. **Presencial:** El familiar visita al mayor, instala la app y la configura
2. **Remota vía SmartThings/ThinQ:** Samsung y LG permiten instalar apps remotamente desde el móvil del familiar
3. **Hub IoT pre-configurado:** Vertex envía el hub con todo listo. Solo hay que enchufar el HDMI y encender. Zero setup para el mayor.
4. **IPTV/operador:** Acuerdo con Movistar+, Orange TV, Vodafone TV para incluir la app en su decodificador (futuro)

---

## 7. Apps de Salud/Bienestar Existentes en Smart TVs

### 7.1 Panorama Actual

El ecosistema de apps de salud en Smart TV es **extremadamente limitado** comparado con móvil:

| App | Plataforma | Descripción |
|---|---|---|
| **Samsung Health** | Tizen (Samsung) | Pre-instalada. Ejercicios guiados, yoga, meditación. NO check-in ni monitoreo de bienestar. |
| **Apple Fitness+** | Apple TV | Clases de ejercicio en streaming. Solo ecosistema Apple. |
| **Peloton** | Android TV, Fire TV, Apple TV | Clases de ejercicio. Público joven-adulto. |
| **Calm / Headspace** | Android TV, Apple TV, Fire TV | Meditación y mindfulness. |
| **YouTube (ejercicio)** | Todas | Canales de ejercicio para mayores (Teledeporte, etc.) |

### 7.2 Competencia Directa en Check-in de Bienestar

> **NO EXISTE ninguna app de check-in de bienestar o dead man's switch en Smart TVs.** El campo está completamente vacío. Dame un Ok sería la primera.

### 7.3 Oportunidad

- Categoría totalmente virgen en Smart TV
- Los fabricantes (Samsung, LG) tienen programas de bienestar y podrían estar interesados en partnership
- Samsung Health ya está pre-instalada: posibilidad de integración
- Posibilidad de aparecer como app destacada en la sección salud (vacía actualmente)

---

## 8. Opiniones del Equipo de Expertos

### 🔧 Marcos Delgado — IoT/Hardware
> "La Smart TV como dispositivo de check-in es brillante. Pero la clave no es la app de TV sola — es la **combinación de hub IoT + TV**. El hub conectado por HDMI nos da el control total: encender la TV, mostrar la alerta, y funcionar como fallback si la app de TV falla. Recomiendo que la TV sea la 'pantalla' y el hub IoT sea el 'cerebro'. Así no dependemos de las limitaciones de cada plataforma."

### ⚡ Elena Soto — Sistemas Embebidos
> "HDMI-CEC es nuestro mejor amigo. Con un ESP32 + módulo HDMI-CEC (chip Pulse Eight o similar), podemos encender la TV, cambiar de fuente, y enviar comandos de navegación. El coste del módulo CEC es ~3-5€. La solución hub + TV es técnicamente sólida. Lo que me preocupa es la fragmentación CEC: cada fabricante implementa CEC de forma ligeramente diferente. Habrá que testear en muchos modelos."

### 📡 Ricardo Montoya — Telecomunicaciones
> "La conectividad es el talón de Aquiles. Muchos mayores tienen WiFi en casa (el router del operador), pero a veces es inestable. La Smart TV normalmente va por WiFi (pocos las conectan por cable). Si el WiFi cae, la TV no recibe notificaciones. El hub IoT debería tener su propio módulo WiFi independiente y quizás una SIM de datos como backup. También podríamos usar el protocolo MQTT que ya tenemos en la arquitectura IoT."

### 🎨 Sara Jiménez — UX Senior
> "¡POR FIN alguien piensa en la TV! Los mayores pasan la vida delante del televisor. La interfaz debe ser brutalmente simple: pantalla completa, avatar enorme en el centro, UN solo botón que diga 'Pulsa OK para decir que estás bien'. Nada de menús, nada de configuración, nada de texto pequeño. El mando ya lo saben usar — lo llevan 50 años usando. Los botones de colores del mando son un recurso infrautilizado: verde = bien, rojo = mal. Es perfecto."

### ☁️ Iñaki Goicoechea — Cloud/Backend
> "Desde el backend no cambia nada. La TV sería un dispositivo más que se autentica contra la misma API REST. El check-in llega como POST /api/v1/checkin con un device_type='smart_tv'. Lo que sí necesitamos es un servicio de push notifications para cada plataforma de TV: FCM para Android TV, Samsung Push para Tizen, webOS notifications para LG. Tres integraciones de push más, pero manejable."

### 🎮 Pablo Ruiz — Gamificación
> "¡La TV es perfecta para el Tamagotchi! Pantalla grande, colores vivos, el avatar puede tener animaciones mucho más ricas que en el móvil. Imagina al Misi caminando por la pantalla de 55 pulgadas. El check-in puede tener una animación de recompensa espectacular: fuegos artificiales, el avatar saltando de alegría, todo en pantalla gigante. Los mayores van a ADORAR ver a su mascota en la tele. Es como tener compañía."

### 🧠 Dr. Carmen Vidal — Neurociencia (consultora)
> "La TV como canal de check-in tiene una ventaja neurocognitiva enorme: es un estímulo audiovisual que ocupa el campo visual completo. Un mayor que quizá no nota una notificación en el móvil (porque no oye, o no mira el teléfono), SÍ va a notar que su televisor muestra algo diferente. La interrupción de la emisión es un cambio de estímulo que activa la atención automáticamente. Es como cuando cambia la publicidad — el cerebro se da cuenta. Muy efectivo."

---

## 9. Propuesta de MVP para Smart TV

### 9.1 Fase 1: Android TV (Mes 1-2)
- App nativa Android TV con Leanback
- Pantalla de check-in: avatar Tamagotchi + botón OK
- Notificaciones push vía FCM
- Servicio en background para alertas
- Publicación en Google Play Store

### 9.2 Fase 2: Samsung Tizen + LG webOS (Mes 2-4)
- Web app HTML5 compartida
- Wrapper Tizen con config.xml
- Wrapper webOS con appinfo.json
- Push notifications específicas de cada plataforma
- Publicación en Samsung Seller Office y LG Seller Lounge

### 9.3 Fase 3: Hub IoT + HDMI-CEC (Mes 3-5)
- Módulo HDMI-CEC en el hub ESP32
- Capacidad de encender TV desde standby
- Pantalla de alerta renderizada por el hub (independiente de la app de TV)
- Compatible con CUALQUIER TV con HDMI (incluidas TVs no-smart)

### 9.4 Fase 4: Integración con operadores (Mes 6+)
- Conversaciones con Movistar+, Orange TV, Vodafone TV
- App integrada en decodificadores IPTV
- Posibilidad de pre-instalación para clientes mayores

---

## 10. Estimación de Costes

| Concepto | Coste estimado | Notas |
|---|---|---|
| Desarrollo app Android TV | 4.000-6.000€ | Reutiliza lógica de app móvil |
| Desarrollo web app (Tizen + webOS) | 3.000-5.000€ | HTML5 compartido |
| Módulo HDMI-CEC para hub IoT | 500-1.000€ (desarrollo) + 3-5€/unidad | Hardware nuevo en el hub |
| Cuentas de desarrollador (stores) | ~25€ (Google) + 0€ (Samsung/LG) | Coste mínimo |
| Testing en dispositivos reales | 1.000-2.000€ | Compra/alquiler de TVs de diferentes marcas |
| **TOTAL estimado** | **8.500-14.000€** | Incluye 3 plataformas + hub IoT |

---

## 11. Conclusión y Recomendación

### Viabilidad: ✅ ALTA

La Smart TV es el dispositivo más natural para el check-in de personas mayores:

1. **Ya está en sus casas** (85% penetración, tendencia a 95%+)
2. **Ya lo usan horas al día** (5.2h/día en mayores de 65)
3. **El mando es un input que dominan** (50+ años de experiencia)
4. **Pantalla grande = máxima accesibilidad** (ideal para problemas de visión)
5. **Campo competitivo vacío** (ninguna app de check-in en Smart TV)
6. **Coste de desarrollo razonable** (~10K€ para 3 plataformas)
7. **Sinergias con el hub IoT** (HDMI-CEC resuelve las limitaciones)

### Recomendación: Incluir Smart TV como **dispositivo prioritario** en el roadmap, junto con el botón IoT y la app móvil. La combinación hub IoT + Smart TV puede ser incluso MÁS potente que la app móvil para el segmento de mayores.

### Riesgo Principal: La instalación y configuración la debe hacer el familiar. Esto es un obstáculo, pero es el MISMO obstáculo que ya existe con la app móvil — y que el hub IoT (plug & play) resuelve.

---

*Estudio realizado por el equipo de Dame un Ok. Documentado por Leo (IA). Enero 2026.*
