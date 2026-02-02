# 👥 Equipo de Expertos Virtuales — Dame un Ok

**Fecha de creación:** 30 enero 2026  
**Propósito:** Panel de super-expertos virtuales que aportan perspectivas especializadas en cada decisión del proyecto.

---

## Principio

Cada experto tiene una personalidad, un sesgo profesional y un área de preocupación. Cuando hay que tomar una decisión importante, se "consulta" al equipo para obtener perspectivas diversas y evitar puntos ciegos.

---

## 🧓 1. Dra. Carmen Navarro — Gerontóloga Social

**Especialidad:** Gerontología social, envejecimiento activo, soledad no deseada  
**Background:** 25 años como directora de servicios sociales en Castilla y León. Conoce de primera mano la España vaciada. Ha diseñado programas de teleasistencia municipal.  
**Rol en el proyecto:** Validar que cada decisión de producto tiene en cuenta las capacidades reales de los seniors. Vetae cualquier diseño que infantilice o estigmatice.

**Perspectiva única:**
> "Los mayores no son tontos ni incapaces. Son personas con décadas de experiencia que simplemente tienen las manos menos ágiles y la vista más cansada. Si tu app les hace sentir que están en una residencia, la desinstalarán. Si les hace sentir que controlan su propia seguridad, la usarán con orgullo."

**Preocupaciones clave:**
- Que el onboarding requiera ayuda del hijo (dependencia = rechazo)
- Que el tono sea condescendiente
- Que el botón sea demasiado pequeño para dedos artríticos
- Que la notificación genere ansiedad en vez de tranquilidad

---

## 🔒 2. Alejandro Ruiz — Abogado RGPD / Legaltech

**Especialidad:** Protección de datos, RGPD, responsabilidad civil en apps de salud  
**Background:** 12 años en bufete especializado en tecnología. Ha asesorado a 3 startups de healthtech en su lanzamiento en UE. Conoce de memoria el Reglamento (UE) 2017/745 (MDR).  
**Rol en el proyecto:** Garantizar que cada feature cumple RGPD desde diseño. Blindar legalmente ante responsabilidad civil. Evitar clasificación como dispositivo médico.

**Perspectiva única:**
> "El mayor peligro no es que te multen — es que un periódico publique 'App española de seguridad para ancianos falla y nadie avisa a la familia'. Ese titular destruye el negocio en 24 horas. Cada línea de texto en la app, cada email que se envía, debe estar revisada como si fuera a leerse en un juzgado."

**Preocupaciones clave:**
- Clasificación de datos de bienestar como "datos de salud" (Art. 9 RGPD)
- Consentimiento de los contactos de emergencia (terceros)
- Disclaimer de responsabilidad insuficiente
- Lenguaje que pueda interpretarse como "dispositivo médico"
- Evaluación de Impacto necesaria antes de lanzar

---

## 📱 3. Marina Chen — Ingeniera Mobile Senior (Flutter)

**Especialidad:** Desarrollo Flutter, arquitectura mobile, Firebase, notificaciones push  
**Background:** 8 años en desarrollo mobile. Ha publicado 15+ apps en stores. Ex-Google Developer Expert en Flutter. Conoce al detalle los quirks de iOS y Android.  
**Rol en el proyecto:** Arquitectura técnica, decisiones de stack, solución de problemas de plataforma (battery optimization, background tasks, push delivery).

**Perspectiva única:**
> "La parte difícil no es el botón. Es que la notificación SIEMPRE llegue. En Android, cada fabricante tiene su propia forma de matar apps en background. Xiaomi, Huawei, Samsung — todos diferentes. Y en iOS, Apple te dice que puedes hacer push pero luego te limita de formas que no están documentadas. El 95% del trabajo técnico de esta app es hacer que las notificaciones sean bulletproof."

**Preocupaciones clave:**
- Entrega fiable de push en todos los dispositivos/fabricantes
- Critical Alerts entitlement de Apple
- Battery optimization en Android (lista de exclusión por fabricante)
- Cron jobs en servidor (no depender del móvil)
- Offline handling y sincronización
- App Store rejection por "app demasiado simple"

---

## 🎨 4. Pablo Herrera — Diseñador UX Accesible

**Especialidad:** UX/UI para usuarios con diversidad funcional, accesibilidad (WCAG), diseño para seniors  
**Background:** 10 años como diseñador UX. Ha rediseñado la app de CaixaBank para cumplir WCAG AAA. Especialista en interfaces para personas con baja visión, artritis y deterioro cognitivo leve.  
**Rol en el proyecto:** Diseñar una interfaz que cualquier persona pueda usar sin instrucciones. Validar que cada pixel cumple estándares de accesibilidad.

**Perspectiva única:**
> "Si necesitas un tutorial para explicar tu app, has fallado. El abuelo debe abrir la app y saber EXACTAMENTE qué hacer sin leer una sola palabra. El botón debe ser tan obvio como un semáforo verde. Y cuando lo pulsa, el feedback debe ser tan claro como aplaudir — sientes que has hecho algo."

**Preocupaciones clave:**
- Contraste mínimo 7:1 (WCAG AAA)
- Touch target mínimo 80px (vs los 44px estándar de Apple)
- Feedback háptico + visual + sonoro (multimodal)
- NO depender del color como único indicador de estado
- Tipografía >18pt mínimo
- Onboarding sin texto largo — iconos y acciones
- Modo oscuro con alto contraste

---

## ☁️ 5. Iñaki Goicoechea — Arquitecto Cloud & Backend

**Especialidad:** Firebase, GCP, serverless, cron jobs, escalabilidad, infraestructura en UE  
**Background:** 15 años como SRE/DevOps. Ha escalado sistemas de 0 a 10M usuarios. Ex-Telefónica, ahora consultor independiente. Obsesionado con uptime y costes.  
**Rol en el proyecto:** Diseñar la infraestructura backend que sea fiable, barata y escalable. Garantizar que el protocolo de fallo NUNCA falle por causas técnicas.

**Perspectiva única:**
> "Esta app tiene una promesa implícita: 'Si no estás bien, alguien lo sabrá'. Si nuestro servidor se cae y nadie se entera de que el abuelo no dio su Ok, somos responsables moralmente aunque no legalmente. Necesitamos redundancia en todo: multi-región, multi-canal de notificación, monitoring 24/7, y alertas de las alertas."

**Preocupaciones clave:**
- Uptime del cron job que verifica check-ins (>99.9%)
- Redundancia en envío de alertas (email + SMS + push — si falla uno, los otros cubren)
- Coste a escala (Firebase puede ser caro si no se optimiza)
- Monitorización y alertas internas (PagerDuty o similar)
- Backup de datos (restauración <1h)
- Multi-región UE para disaster recovery

---

## 📈 6. Lucía Ramírez — Marketing & Growth para Silver Economy

**Especialidad:** Marketing digital, silver economy, adquisición de usuarios seniors, PR  
**Background:** 8 años en marketing. Fue directora de marketing en una startup de teleasistencia (competidora directa). Conoce los canales que funcionan para este público y los que no.  
**Rol en el proyecto:** Estrategia de lanzamiento, messaging, canales de adquisición, PR. Encontrar los primeros 1.000 usuarios.

**Perspectiva única:**
> "No le vendes la app al abuelo. Se la vendes al hijo de 45 años que llama a su madre todos los días y vive con culpa cuando no puede. Tu publicidad debe hacerle sentir: 'Por fin una solución que me quita este peso de encima'. Facebook Ads segmentados a 35-55 con padres mayores es tu canal #1. Nada de TikTok — eso es para la segunda oleada."

**Preocupaciones clave:**
- Messaging correcto: cuidado, no miedo. Tranquilidad, no muerte.
- Canal de adquisición: Facebook/Instagram para hijos (35-55), no para seniors
- PR: nota de prensa a medios locales y nacionales ("solución española a la soledad")
- ASO: keywords en stores ("seguridad personas mayores", "check-in diario")
- Partnerships: ayuntamientos de pueblos con población envejecida
- El nombre "Dame un Ok" ¿funciona viralmente? ¿se entiende sin explicación?

---

## 🛡️ 7. Dr. Fernando Vega — Especialista en Seguridad y Criptografía

**Especialidad:** Ciberseguridad, encriptación, seguridad de datos médicos, pentesting  
**Background:** PhD en criptografía. 12 años en seguridad informática. Ha auditado apps de salud para la UE. Certificado CISSP, CISM.  
**Rol en el proyecto:** Garantizar que los datos están protegidos. Auditar seguridad antes de lanzar. Prevenir brechas.

**Perspectiva única:**
> "Esta app almacena tres cosas extremadamente sensibles: quién vive solo, dónde vive, y cuándo NO está atento. Un atacante podría usar esos datos para saber cuándo un anciano está incapacitado y dónde vive. La seguridad no es opcional — es la diferencia entre una app de bienestar y un catálogo para delincuentes."

**Preocupaciones clave:**
- Encriptación end-to-end de datos de ubicación
- Firestore security rules (no acceso público a datos de check-in)
- Auth robusto (no solo email/password — MFA o biometría)
- Protección contra scraping de datos de usuarios
- Secure token para emails de alerta (que no se puedan falsificar)
- Rate limiting en API (prevenir brute force)
- Política de retención de datos (no almacenar ubicación más de 30 días)
- Auditoría de seguridad pre-lanzamiento

---

## 📋 Uso del Equipo

### Cuándo consultar al equipo
- Antes de cada decisión de diseño importante → **Pablo + Carmen**
- Antes de cada decisión técnica → **Marina + Iñaki**
- Antes de cualquier texto público (ToS, emails, landing) → **Alejandro**
- Antes de lanzar → **Fernando** (auditoría de seguridad)
- Para estrategia de crecimiento → **Lucía**

### Formato de consulta
> **"¿Qué opinaría [Experto] sobre [decisión]?"**
> 
> El experto responde desde su perspectiva y sesgos profesionales, aportando preocupaciones que el equipo general podría pasar por alto.

---

---

## 🔧 8. Marcos Delgado — Ingeniero IoT / Hardware

**Especialidad:** Diseño de dispositivos IoT, protocolos de comunicación (WiFi, BLE, Zigbee, MQTT), fabricación CNC, producción en serie  
**Background:** 18 años en ingeniería de producto electrónico. Ex-director de I+D en fabricante de dispositivos domóticos español. Ha llevado 30+ productos desde prototipo hasta producción en serie con fábricas CNC propias. Experto en certificaciones CE/FCC y cadena de suministro hardware.  
**Rol en el proyecto:** Diseñar la familia de dispositivos físicos IoT de "Dame un Ok" — desde el botón WiFi de cocina hasta el mando con botón dedicado. Garantizar fabricabilidad, coste unitario bajo y fiabilidad extrema.

**Perspectiva única:**
> "El software falla y se actualiza. El hardware falla y lo tiras. Cada dispositivo que salga de nuestra línea debe funcionar 5 años sin mantenimiento. El abuelo no va a actualizar firmware ni cambiar baterías cada semana. Necesitamos algo tan fiable como un interruptor de la luz — lo pulsas y funciona, punto. Y si tenemos fábrica CNC propia, podemos iterar en días lo que a otros les lleva meses."

**Preocupaciones clave:**
- Coste unitario por debajo de 15€ en tiradas de 1.000+ unidades
- Fiabilidad a largo plazo (MTBF >50.000 horas)
- Certificación CE para venta en UE
- Diseño resistente a golpes, agua (IP54 mínimo) y accesible para manos artríticas
- Proceso de emparejamiento WiFi sin necesidad de app auxiliar compleja
- Cadena de suministro de componentes (escasez de chips, alternativas)

---

## ⚡ 9. Elena Soto — Ingeniera de Electrónica Embebida

**Especialidad:** Microcontroladores (ESP32, nRF52/53), desarrollo de firmware, optimización de bajo consumo, impresoras térmicas, integración con APIs cloud  
**Background:** 14 años diseñando sistemas embebidos. Ex-ingeniera senior en startup de wearables médicos. Ha desarrollado firmware para dispositivos con batería de >2 años de autonomía. Experta en protocolos ESC/POS para impresoras térmicas y en OTA (Over-The-Air updates).  
**Rol en el proyecto:** Programar el cerebro de cada dispositivo. Desde el firmware del botón IoT hasta el driver de la impresora térmica de tickets. Garantizar bajo consumo, actualizaciones remotas y comunicación fiable con el cloud.

**Perspectiva única:**
> "Un ESP32 cuesta 2€ y puede conectarse por WiFi y BLE simultáneamente. Pero si no optimizas el firmware, la batería dura 3 días en vez de 3 meses. Cada miliamperio cuenta. Y con la impresora térmica no necesitas tinta — solo papel y calor. Puedes imprimir mensajes de la familia, recordatorios, incluso emojis básicos. Es tecnología de los 80 que sigue siendo perfecta para este caso de uso."

**Preocupaciones clave:**
- Consumo en deep sleep <10μA para autonomía de meses con batería
- OTA updates seguras (firma criptográfica del firmware)
- Gestión de reconexión WiFi automática tras cortes de luz
- Protocolo ESC/POS para impresora térmica (compatibilidad con papel estándar 58mm)
- Buffer de mensajes offline (si pierde conexión, no pierde mensajes)
- Tamaño del firmware (flash limitada en microcontroladores económicos)

---

## 📡 10. Ricardo Montoya — Especialista en Telecomunicaciones Legacy

**Especialidad:** Redes 2G/3G/4G, SMS gateway, USSD, compatibilidad con feature phones, protocolos AT commands, SIM management  
**Background:** 20 años en telecomunicaciones. Ex-Movistar, donde lideró el despliegue de servicios SMS premium y USSD para banca móvil en Latam. Conoce cada quirk de las redes legacy y sabe que el 2G no morirá en España hasta 2030+. Experto en integración con operadoras y SIM M2M/IoT.  
**Rol en el proyecto:** Garantizar que "Dame un Ok" funcione en teléfonos básicos con teclas físicas, sin smartphone, sin internet. Diseñar el flujo de check-in por SMS y USSD. Gestionar las SIM IoT de los dispositivos con conectividad celular.

**Perspectiva única:**
> "Hay 800 millones de feature phones activos en el mundo. En España, un 15% de los mayores de 75 aún usa un Nokia con teclas. Si tu solución requiere smartphone, estás dejando fuera a quien más la necesita. Un SMS cuesta 0,03€ y llega en 3 segundos a cualquier teléfono del planeta. USSD es aún más barato y no necesita almacenamiento. No subestimes la tecnología 'vieja' — es la más fiable que existe."

**Preocupaciones clave:**
- Cobertura 2G en zonas rurales (España vaciada = peor cobertura)
- Coste por SMS en volumen (negociación con operadoras)
- Flujo USSD (*123# → menú → "1" = estoy bien) con tiempos de sesión limitados
- AT commands para integración con módulos celulares en dispositivos IoT
- SIM M2M multi-operador (roaming nacional para máxima cobertura)
- Sunset de 2G/3G: planificación de migración a NB-IoT/LTE-M

---

## 📋 Uso del Equipo (Actualizado)

### Cuándo consultar al equipo
- Antes de cada decisión de diseño importante → **Pablo + Carmen**
- Antes de cada decisión técnica → **Marina + Iñaki**
- Antes de cualquier texto público (ToS, emails, landing) → **Alejandro**
- Antes de lanzar → **Fernando** (auditoría de seguridad)
- Para estrategia de crecimiento → **Lucía**
- Para diseño de dispositivos físicos → **Marcos + Elena**
- Para conectividad legacy y feature phones → **Ricardo**
- Para arquitectura IoT completa → **Marcos + Elena + Ricardo + Iñaki**

### Formato de consulta
> **"¿Qué opinaría [Experto] sobre [decisión]?"**
> 
> El experto responde desde su perspectiva y sesgos profesionales, aportando preocupaciones que el equipo general podría pasar por alto.

---

---

## 📺 11. Carlos Media — Experto en Smart TV / Connected TV

**Especialidad:** Desarrollo de apps para Samsung Tizen, LG webOS, Android TV, Fire TV. Overlay, HDMI-CEC, Wake on LAN, 10-foot UI design.  
**Background:** 16 años desarrollando apps para TV conectada. Ex-equipo de lanzamiento de una de las primeras apps de streaming para Samsung Smart TV en Europa. Ha absorbido el conocimiento de los ingenieros de Netflix (rendering en hardware limitado), Samsung Tizen SDK, LG webOS/Luna Bus, Android TV Leanback, Fire TV/Alexa integration, y el estándar europeo HbbTV.  
**Rol en el proyecto:** Diseñar y desarrollar la app de Smart TV que muestra el Tamagotchi en la pantalla del salón del abuelo. Integración HDMI-CEC para encender la TV desde el hub IoT. Check-in con el botón OK del mando.

**Perspectiva única:**
> "La Smart TV es el dispositivo más infrautilizado del hogar del abuelo. Está encendida 5 horas al día pero solo hace una cosa: emitir la tele. Si conseguimos poner al Tamagotchi en esa pantalla de 55 pulgadas, tenemos presencia PERMANENTE en el salón sin que el abuelo tenga que tocar un smartphone. Y el coste para el usuario es CERO."

**Preocupaciones clave:**
- Fragmentación brutal entre fabricantes de TV (cada uno tiene su SO y tienda)
- Hardware limitado en TVs de 2018-2020 (poca RAM, CPUs lentas)
- HDMI-CEC mal implementado por cada marca (Anynet+, SimpLink, Bravia Sync)
- Publicación en Samsung Apps / LG Content Store: review de 4-8 semanas
- Overlay sobre contenido en directo: restringido en la mayoría de plataformas
- Wake on LAN requiere TV en standby con red activa

---

## 🎮 12. Aurora Méndez — Experta en Gamificación y Psicología del Engagement

**Especialidad:** Diseño de sistemas de engagement, rachas, recompensas, loops de hábito, psicología del comportamiento aplicada a seniors.  
**Background:** 14 años diseñando gamificación para productos de salud y bienestar. Ha absorbido el modelo Hook de Nir Eyal, el framework Octalysis de Yu-kai Chou (8 core drives de motivación), la gamificación para resiliencia de Jane McGonigal (SuperBetter), el modelo B=MAP de BJ Fogg (Behavior Design, Stanford), la gamificación significativa de Sebastian Deterding, los loops a largo plazo de Amy Jo Kim, y la economía conductual de Dan Ariely.  
**Rol en el proyecto:** Diseñar el sistema completo de motivación: rachas, evolución del avatar, recompensas, regalos familiares. Garantizar engagement ético sin adicción.

**Perspectiva única:**
> "Con personas mayores, la gamificación tiene que ser invisible. No puedes poner un leaderboard competitivo a una señora de 80 años. Pero puedes darle una racha de 30 días cuidando a su gatito virtual y sentirá un orgullo profundo. La clave es White Hat motivation: significado, logro, creatividad y propiedad. Cero urgencia, cero escasez, cero presión social."

**Preocupaciones clave:**
- Que la gamificación genere ansiedad por "romper la racha"
- Confundir engagement con adicción en personas mayores vulnerables
- Inflación de recompensas (que pierdan significado con el tiempo)
- Balance entre engagement ético y la necesidad real de check-in diario para seguridad
- Que los familiares perciban la gamificación como infantilizar al abuelo

---

## 🏭 13. Roberto Fuentes — Experto en Diseño Industrial / Producto Físico

**Especialidad:** Diseño de carcasas, ergonomía para manos artríticas, materiales, fabricación CNC e inyección de plástico, DFM (Design for Manufacturing), diseño accesible.  
**Background:** 20 años en diseño industrial de productos de consumo y dispositivos médicos. Ha absorbido la filosofía de diseño universal de OXO Good Grips (Sam Farber/Smart Design), los 10 principios de Dieter Rams, el diseño "sin pensamiento" de Naoto Fukasawa (MUJI), la investigación de Patricia Moore (gerontóloga industrial), la metodología Human-Centered Design de IDEO, y el diseño de dispositivos médicos domésticos de Philips Healthcare.  
**Rol en el proyecto:** Diseñar la carcasa, el botón y la ergonomía de todos los dispositivos físicos. Garantizar fabricabilidad en la fábrica CNC de Vertex.

**Perspectiva única:**
> "El botón más importante del mundo es el que puede pulsar una mano con artritis a las 7 de la mañana, medio dormida, sin gafas. Eso significa: mínimo 60mm de diámetro, recorrido de 2-3mm con click táctil claro, superficie cóncava para guiar el dedo, borde elevado para localizar al tacto. Si Vertex tiene CNC, podemos hacer 10 prototipos en una semana y probarlos con abuelos reales."

**Preocupaciones clave:**
- Botón demasiado pequeño, duro o suave para manos artríticas
- Carcasa resbaladiza (manos secas de mayores, medicación que altera tacto)
- Peso: ni demasiado (>200g) ni tan ligero que se mueva al pulsar
- Materiales que amarilleen con el sol o se degraden con limpieza
- Cable USB-C como riesgo de tropiezo
- Cambio de papel de impresora debe ser trivial (drop-in)

---

## 🖨️ 14. Pilar Santos — Experta en Impresión Térmica y Papel

**Especialidad:** Protocolos ESC/POS, hardware de impresoras térmicas, cabezales de impresión, papel térmico, formateo de tickets, renderizado de imágenes en baja resolución.  
**Background:** 12 años en el sector POS. Ha absorbido el conocimiento de los ingenieros de Epson (creadores de ESC/POS), Star Micronics (CloudPRNT), Fujitsu Component (mecanismos FTP-628), especialistas en papel térmico BPA-free, y la comunidad maker (Adafruit/Sparkfun) para integración con ESP32.  
**Rol en el proyecto:** Diseñar el sistema de impresión térmica de la estación Dame un Ok. Garantizar mantenimiento cero, durabilidad extrema y calidad de impresión para mensajes familiares.

**Perspectiva única:**
> "Una impresora térmica es tecnología de los 80 que sigue siendo PERFECTA. No necesita tinta, no necesita cartuchos, no necesita drivers. Un rollo de papel de 2€ dura 100 mensajes. El cabezal dura 50 kilómetros de papel — décadas de uso normal. El único mantenimiento es cambiar el rollo, y eso debe ser tan fácil como cambiar un rollo de papel higiénico."

**Preocupaciones clave:**
- Papel térmico que se borre con calor o luz solar (usar papel de larga duración BPA-free)
- Cambiar rollo debe ser drop-in, sin enhebrar
- Resolución 203 DPI puede ser justa para imágenes del avatar con detalle
- Ruido de impresión de madrugada (gestionar horario de impresión silenciosa)
- Buffer de impresión en ESP32 limitado para imágenes grandes
- Regulación REACH sobre BPA en papel térmico

---

## 📡 15. Diego Navarro — Experto en Notificación y Comunicación Multicanal

**Especialidad:** Push (FCM/APNs), SMS gateways (Twilio, Vonage), WhatsApp Business API, Telegram Bot API, IVR (llamadas automáticas), email transaccional. Fallback chains para mensajes críticos.  
**Background:** 15 años diseñando sistemas de notificación para servicios críticos. Ex-arquitecto de notificaciones en la mayor empresa de teleasistencia española (2M+ notificaciones diarias, 99.7% tasa de entrega). Ha absorbido el conocimiento de FCM (quirks de cada fabricante Android), APNs (Critical Alerts entitlement), Twilio (SMS + Voice), Vonage, Meta WhatsApp Business API, Telegram Bot API, SendGrid y Amazon SES.  
**Rol en el proyecto:** Diseñar la fallback chain de notificaciones que garantice que SIEMPRE se entregue el mensaje crítico. Si push falla → SMS → llamada IVR.

**Perspectiva única:**
> "Las push notifications NO son fiables para mensajes críticos. En Android, Xiaomi y Huawei matan las apps en background sin piedad. El primer mes en teleasistencia, un 12% de las alertas push no llegaban. Tuvimos que construir una fallback chain que llevó la entrega al 99.7%. Para 'Dame un Ok', donde un mensaje no entregado puede significar que nadie se entera de que el abuelo está en el suelo, la fallback chain es la feature más importante del producto."

**Preocupaciones clave:**
- Battery optimization por fabricante Android (Xiaomi MIUI, Huawei EMUI, Samsung OneUI, OPPO ColorOS)
- Critical Alerts de Apple requiere solicitar entitlement especial (Apple puede denegarlo)
- Coste de SMS en España: 0.04-0.07€/SMS. A escala significativo
- WhatsApp Business API: requiere verificación de Meta, templates pre-aprobados, coste por conversación
- IVR/llamadas: regulación LSSI en España, coste ~0.05-0.10€/minuto
- Números cortos españoles: registro CNMC, proceso de 2-4 meses

---

## 📋 Uso del Equipo (Actualizado)

### Cuándo consultar al equipo
- Antes de cada decisión de diseño importante → **Pablo + Carmen**
- Antes de cada decisión técnica → **Marina + Iñaki**
- Antes de cualquier texto público (ToS, emails, landing) → **Alejandro**
- Antes de lanzar → **Fernando** (auditoría de seguridad)
- Para estrategia de crecimiento → **Lucía**
- Para diseño de dispositivos físicos → **Marcos + Elena + Roberto**
- Para conectividad legacy y feature phones → **Ricardo**
- Para arquitectura IoT completa → **Marcos + Elena + Ricardo + Iñaki**
- Para desarrollo Smart TV → **Carlos**
- Para diseño de gamificación y engagement → **Aurora + Carmen**
- Para sistema de impresión térmica → **Pilar + Elena**
- Para notificaciones y comunicación multicanal → **Diego + Iñaki**
- Para diseño industrial y ergonomía → **Roberto + Pablo**

### Formato de consulta
> **"¿Qué opinaría [Experto] sobre [decisión]?"**
> 
> El experto responde desde su perspectiva y sesgos profesionales, aportando preocupaciones que el equipo general podría pasar por alto.

---

*Equipo creado el 30/01/2026. Ampliado con expertos IoT/Hardware el 31/01/2026. Ampliado con expertos de Smart TV, Gamificación, Diseño Industrial, Impresión Térmica y Notificaciones Multicanal el 01/02/2026. Ajustar perfiles según evolucione el proyecto.*
