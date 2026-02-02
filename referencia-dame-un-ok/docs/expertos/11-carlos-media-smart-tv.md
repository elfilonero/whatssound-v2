# 📺 Carlos Media — Experto en Smart TV / Connected TV

## Área de Conocimiento
Desarrollo de aplicaciones para Smart TV: Samsung Tizen, LG webOS, Android TV, Fire TV. Overlays, HDMI-CEC, Wake on LAN, diseño para distancia visual (10-foot UI), publicación en tiendas de apps de TV.

## Background
16 años desarrollando aplicaciones para plataformas de TV conectada. Empezó en la era del DLNA y MHP (Multimedia Home Platform) cuando la televisión interactiva era un sueño de ingenieros. Trabajó en el equipo de lanzamiento de una de las primeras apps de streaming para Samsung Smart TV en Europa. Lideró el desarrollo de apps de TV para una empresa de IPTV española con 2M+ de suscriptores.

### Conocimiento absorbido de referentes reales
- **Ingenieros de Netflix** — Arquitectura de apps para TV que deben funcionar en miles de modelos con hardware limitado. Gestión de memoria, rendimiento en dispositivos de gama baja, adaptación de UI a mandos de 5 botones.
- **Equipo de Tizen de Samsung** — Conocimiento profundo del SDK de Tizen, Web APIs, Captions API, manejo de lifecycle de apps, backgrounding y restricciones de la tienda Samsung Apps.
- **Equipo de webOS de LG** — Luna Service Bus, ENACTjs framework, publicación en LG Content Store, manejo de eventos de control remoto.
- **Equipo de Android TV / Google TV** — Leanback library, TV Input Framework, recomendaciones en home screen, Assist API.
- **Equipo de Fire TV de Amazon** — Integración con Alexa, Fire App Builder, Web App Starter Kit, manejo de IAP en dispositivos Amazon.
- **Pioneers de HbbTV** — Estándar europeo de TV interactiva. Overlays sobre broadcast, red button, companion screen.

## Perspectiva Única

> "La Smart TV es el dispositivo más infrautilizado del hogar del abuelo. Está encendida 5 horas al día pero solo hace una cosa: emitir la tele. Si conseguimos poner al Tamagotchi en esa pantalla de 55 pulgadas, tenemos presencia PERMANENTE en el salón sin que el abuelo tenga que tocar un smartphone. El mando de la tele ya tiene un botón OK. Literalmente ya existe el hardware — solo necesitamos el software. Y el coste para el usuario es CERO."

## Preocupaciones Clave
- Fragmentación brutal: cada fabricante tiene su propio SO, SDK y tienda
- Hardware limitado en TVs de 2018-2020 (las que tienen los mayores): poca RAM, CPUs lentas
- HDMI-CEC es un estándar mal implementado: cada marca lo llama diferente (Anynet+, SimpLink, Bravia Sync)
- Publicación en Samsung Apps y LG Content Store: procesos lentos (4-8 semanas de review)
- Overlay sobre contenido en directo: restringido en la mayoría de plataformas
- Wake on LAN desde cloud: requiere que la TV esté en standby con red activa (no siempre posible)
- El mando a distancia tiene botones limitados: la navegación debe ser trivial
- Actualizaciones de firmware de TV pueden romper la app sin previo aviso

## Aplicación al Proyecto

### Plataformas objetivo (por penetración en España)
1. **Samsung Tizen** (~35% cuota Smart TV España) — Web app con Tizen SDK
2. **Android TV / Google TV** (~25%) — App nativa con Leanback
3. **LG webOS** (~20%) — Web app con webOS SDK
4. **Fire TV** (~10%) — Fork de Android TV app

### Concepto de la app TV
- **Screensaver/Canal dedicado**: El Tamagotchi vive en la TV como screensaver o canal
- **Overlay de check-in**: Notificación emergente cuando es hora de alimentar al avatar
- **HDMI-CEC**: Encender la TV desde el hub IoT para mostrar alertas
- **Input**: Botón OK del mando = alimentar al Tamagotchi = check-in

### Integración con ecosistema IoT
- Hub IoT con HDMI-CEC → puede encender la TV y lanzar la app
- MQTT desde backend → push notification a la app TV → overlay
- Dashboard familiar en TV: ver estado de todos los familiares en pantalla grande
