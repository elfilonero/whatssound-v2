# 📓 Diario del Equipo — Dame un Ok

---

## Día 1 — 30 de enero de 2026

### Arranque del proyecto

**Participantes:** Ángel Fernández (visión), Leo (IA, documentación)

#### Resumen
- Ángel presenta la idea core: un Dead Man's Switch humanizado para personas que viven solas
- Se documenta la visión fundacional completa: problema, público, arquitectura, modelo de negocio
- Se investiga la competencia: app china "¿Estás muerto?", Snug Safety, Life360, teleasistencia tradicional
- Se crea el equipo de expertos virtuales (7 perfiles especializados)

#### Documentos creados
1. `vision-fundacional.md` — Documento fundacional completo
2. `equipo-expertos.md` — 7 expertos virtuales (gerontóloga, abogado RGPD, ingeniera Flutter, diseñador UX, arquitecto cloud, marketing silver economy, seguridad)
3. `investigacion-competitiva.md` — Análisis de competidores y mercado
4. `auditoria-predesarrollo.md` — Auditoría técnica pre-desarrollo

#### Decisiones tomadas
- Stack: Flutter + Firebase/Supabase en UE
- Modelo: Pago único ~2€
- Prioridad: MVP en 3-4 semanas
- Servidores obligatoriamente en UE (RGPD)
- Nombre definitivo: "Dame un Ok"

#### Estado al final del día
✅ Visión documentada  
✅ Equipo de expertos creado  
✅ Investigación competitiva completada  
✅ Auditoría pre-desarrollo realizada  
⏳ Pendiente: desarrollo del MVP

---

## Día 2 — 31 de enero de 2026

### Incorporación de la visión IoT y hardware

**Participantes:** Ángel Fernández (visión IoT), Leo (IA, documentación)

#### Resumen
Ángel amplía la visión del proyecto: "Dame un Ok" no será solo una app móvil sino un ecosistema completo de dispositivos IoT fabricados por Vertex (fábrica CNC propia). La idea central: no depender de smartphones modernos. El abuelo en el pueblo necesita un botón en el sofá, no un iPhone.

#### Nueva visión de dispositivos
1. **Botón físico IoT** — WiFi/BLE, para cocina/entrada/sofá
2. **Botón integrado en muebles** — empotrado en sofá, mesa
3. **Mando TV con botón OK** — doble función: mando + check-in
4. **Feature phones** — check-in por SMS/USSD sin internet
5. **Impresora térmica** — recibe mensajes de la familia impresos, servicio premium
6. **Add-ons** — módulo para añadir botón a cualquier dispositivo

#### Nuevos expertos incorporados
- **Marcos Delgado** — Ingeniero IoT/Hardware (protocolos, CNC, producción)
- **Elena Soto** — Electrónica Embebida (ESP32, firmware, impresoras térmicas)
- **Ricardo Montoya** — Telecomunicaciones Legacy (2G/SMS/USSD, feature phones)

#### Documentos creados/actualizados
1. `arquitectura-iot.md` — Arquitectura completa multi-dispositivo (NUEVO)
2. `equipo-expertos.md` — 3 nuevos expertos añadidos (ACTUALIZADO)
3. `vision-fundacional.md` — Sección IoT/hardware añadida (ACTUALIZADO)
4. `diario-equipo.md` — Este documento (NUEVO)
5. `diario-testing.md` — Plantilla de testing (NUEVO)
6. `transcripcion-grupo.md` — Resumen conversaciones Telegram (NUEVO)
7. `README.md` — Readme del proyecto (NUEVO)
8. `docs/expertos/` — Fichas individuales por experto (NUEVO)

#### Decisiones tomadas
- API unificada: REST + MQTT + SMS Gateway
- MCU principal: ESP32-C3 (WiFi + BLE, bajo coste)
- Impresora térmica como servicio premium con suscripción mensual
- Feature phones soportados vía SMS y USSD
- Vertex fabrica todos los dispositivos (sin dependencia externa)
- Patrón adaptador en backend para extensibilidad

#### Estado al final del día
✅ Visión IoT documentada  
✅ Arquitectura multi-dispositivo diseñada  
✅ Nuevos expertos incorporados  
✅ Documentación del proyecto completa  
⏳ Pendiente: prototipado de botón WiFi (ESP32)  
⏳ Pendiente: desarrollo MVP de la app  
⏳ Pendiente: negociación con operadoras para SMS/USSD

---

## Día 2 (noche) — 31 de enero de 2026

### 🐣 Incorporación del Concepto Tamagotchi

**Participantes:** Ángel Fernández (concepto), Leo (IA, documentación)

#### Resumen
Ángel propone el cambio conceptual más importante del proyecto hasta la fecha: sustituir el "botón frío" de check-in por un **avatar virtual tipo Tamagotchi** que el usuario cuida diariamente. En vez de confirmar que estás vivo (deprimente), cuidas a un bichito que depende de ti. Si no lo alimentas, se pone triste → alerta. La motivación es emocional, no funcional.

#### El concepto en una frase
> "No le pidas al abuelo que confirme que está vivo. Dale un gatito virtual que cuidar. Si el gatito tiene hambre, algo pasa."

#### Impacto en el proyecto
- **Filosófico:** Cambia radicalmente la experiencia de usuario. De supervisión a cuidado. De miedo a cariño.
- **Técnico:** Añade sprites/animaciones (app + OLED + impresora), estados de avatar, sistema de gamificación.
- **Comercial:** Diferenciador TOTAL vs toda la competencia. Potencial viral enorme.
- **IoT:** Los dispositivos con pantalla OLED muestran al avatar. Los LED representan su estado. La impresora lo imprime.

#### Documentos creados/actualizados
1. `docs/gamificacion-tamagotchi.md` — Documento completo del concepto (NUEVO)
2. `docs/vision-fundacional.md` — Sección Tamagotchi como pilar central (ACTUALIZADO)
3. `docs/arquitectura-iot.md` — Secciones de pantalla OLED, LED y avatares (ACTUALIZADO)
4. `docs/diario-equipo.md` — Esta entrada (ACTUALIZADO)

#### Decisiones tomadas
- El Tamagotchi es el PILAR CENTRAL de la experiencia, no un feature secundario
- MVP con 3 avatares: gato, perro, planta
- El avatar NUNCA muere (se pone triste pero se recupera)
- Tres niveles de rendering: gráfico (app/OLED), emoji (SMS), ASCII (legacy)
- La familia puede enviar regalos/accesorios al avatar del ser querido
- Marketing lidera con emoción (Tamagotchi), no con función (check-in)

#### Opinión unánime del equipo
Los 10 expertos validan el concepto como un game-changer. Destacan especialmente:
- Carmen (gerontóloga): "Recupera la sensación de propósito. El mayor cuida porque alguien le necesita."
- Lucía (marketing): "El marketing se escribe solo. Potencial viral enorme."
- Marcos (hardware): "Un botón con OLED y gatito animado es un producto con ALMA."
- Alejandro (legal): "Posicionar como juego nos aleja del terreno peligroso de 'datos de salud'."

#### Estado al final de la sesión
✅ Concepto Tamagotchi documentado exhaustivamente  
✅ Visión fundacional actualizada con pilar Tamagotchi  
✅ Arquitectura IoT actualizada con OLED/LED/impresora para avatares  
✅ Equipo de expertos consultado y favorable  
⏳ Pendiente: diseño de sprites/animaciones de avatares  
⏳ Pendiente: prototipo Flutter con flujo Tamagotchi  
⏳ Pendiente: prototipo OLED con sprite de avatar  
⏳ Pendiente: testing emocional con usuarios reales  

---

---

## Día 3 — 1 de febrero de 2026

### 💌 Mensajería Bidireccional via Impresora Térmica

**Participantes:** Ángel Fernández (concepto), Leo (IA, documentación)

#### Resumen
Ángel propone una evolución clave de la impresora térmica: convertirla en un **canal de comunicación familiar**. Los familiares envían mensajes desde WhatsApp, Telegram o cualquier mensajería que ya usan, y esos mensajes se imprimen físicamente en la térmica del abuelo. El abuelo recibe un ticketito de papel con el mensaje — tangible, sin pantallas, sin aprender apps nuevas.

#### El concepto en una frase
> "El hijo manda un WhatsApp, al abuelo le sale un ticketito en la cocina. Físico. Sin pantallas."

#### Impacto en el proyecto
- **Producto:** La impresora pasa de accesorio a pieza CENTRAL del ecosistema. Es el dispositivo estrella.
- **UX del abuelo:** Recibe mensajes de cariño sin tocar ninguna pantalla. Solo lee papel.
- **UX del familiar:** Envía mensajes desde lo que ya usa (WhatsApp/Telegram). Cero fricción.
- **Comunicación asimétrica:** Familiar→abuelo por impresora. Abuelo→sistema por botón. Sistema→familiar por app/push.

#### Dispositivo IoT completo: "Estación Dame un Ok"
Se define el dispositivo integrado con tres componentes:
1. **Pantalla OLED** (NO táctil) — muestra avatar Tamagotchi
2. **Botón grande** (60mm, verde, retroiluminado) — check-in / alimentar avatar
3. **Impresora térmica 58mm** — recibe mensajes de familiares + recordatorios + tickets de racha

#### Integración con mensajería
- **WhatsApp Business API** — el familiar envía mensaje al número, se imprime
- **Telegram Bot API** — el familiar envía mensaje al bot, se imprime
- **SMS inbound** — para familiares sin smartphone
- **Dashboard de la app** — envío directo desde la interfaz web/móvil
- Vinculación por código de verificación (familiar ↔ dispositivo)
- Máximo 5 familiares por dispositivo, 20 mensajes/día por familiar

#### Documentos actualizados
1. `docs/arquitectura-iot.md` — Nueva sección 9 completa: mensajería bidireccional (ACTUALIZADO)
2. `docs/vision-fundacional.md` — Sección de mensajería familiar→impresora (ACTUALIZADO)
3. `docs/diario-equipo.md` — Esta entrada (ACTUALIZADO)

#### Decisiones tomadas
- La impresora térmica es el DISPOSITIVO ESTRELLA, no un accesorio
- Integración con WhatsApp Business API + Telegram Bot API como prioridad
- Pantalla del dispositivo NO táctil (principio de accesibilidad para mayores)
- Horario silencioso configurable (por defecto 22:00-08:00)
- Filtrado de contenido: sin URLs, máx 500 chars, anti-spam
- Confirmación de entrega al familiar ("✅ Mensaje impreso en casa de mamá")
- Mensajes se encolan si impresora offline (máx 50 msgs o 48h)

#### Estado al final de la sesión
✅ Concepto de mensajería bidireccional documentado  
✅ Arquitectura IoT actualizada con flujos de mensajería completos  
✅ APIs, webhooks y esquema de base de datos definidos  
✅ Modelo de vinculación familiar-dispositivo diseñado  
✅ Visión fundacional actualizada  
⏳ Pendiente: prototipo de integración WhatsApp Business API  
⏳ Pendiente: prototipo de bot de Telegram  
⏳ Pendiente: firmware ESP32 para recepción e impresión de mensajes  
⏳ Pendiente: diseño de formatos de ticket (tipografía, layout)  

---

---

## Día 3 (tarde) — 2 de febrero de 2026

### 🟢🔴🟡 Botones de Respuesta Rápida

**Participantes:** Ángel Fernández (concepto), Leo (IA, documentación)

#### Resumen
Ángel propone añadir 3 botones de respuesta rápida al dispositivo IoT. El abuelo ya no solo puede hacer check-in — ahora puede **responder a los mensajes** que le llegan por la impresora térmica. Tres opciones: BIEN (verde), MAL (rojo), NO TE HE ENTENDIDO (amarillo). Simple, sin fricción, sin pantallas.

#### El concepto en una frase
> "El familiar pregunta por WhatsApp, al abuelo le sale un ticket, pulsa un botón de color y el familiar recibe la respuesta. Comunicación bidireccional real."

#### Impacto en el proyecto
- **Producto:** El dispositivo pasa de 1 botón a 4 (1 check-in grande + 3 respuesta rápida)
- **Comunicación:** Por primera vez el abuelo puede "responder" a los mensajes sin tecnología
- **Datos:** Las respuestas generan un histórico valioso (patrones de bienestar, alertas)
- **Salud:** Preguntas automáticas del sistema ("¿Has tomado la medicación?") con respuesta directa

#### Documentos actualizados
1. `docs/arquitectura-iot.md` — Nueva sección 10 completa: botones de respuesta rápida (ACTUALIZADO)
2. `docs/diario-equipo.md` — Esta entrada (ACTUALIZADO)
3. `mockups/iot-dispositivo-completo.html` — Simulación visual del dispositivo completo (NUEVO)

#### Decisiones tomadas
- 4 botones en total: 1 grande (check-in) + 3 pequeños (respuesta rápida)
- Colores intuitivos: verde=bien, rojo=mal, amarillo=no entiendo
- La respuesta se envía al familiar por el mismo canal que usó para enviar el mensaje
- Preguntas automáticas configurables desde el dashboard familiar
- Histórico de respuestas en dashboard con detección de patrones
- Si hay muchos "Mal" seguidos → alerta automática al familiar

#### Estado al final de la sesión
✅ Concepto de respuesta rápida documentado en arquitectura IoT
✅ Mockup HTML del dispositivo completo creado
✅ Diario actualizado
⏳ Pendiente: firmware ESP32 para manejo de 4 botones
⏳ Pendiente: backend para procesamiento de respuestas rápidas
⏳ Pendiente: integración de respuestas en dashboard familiar

---

---

## Día 4 — 30 de enero de 2026

### 📺 Smart TV como Dispositivo de Check-in

**Participantes:** Ángel Fernández (concepto), Leo (IA, investigación y documentación)

#### Resumen
Ángel identifica un insight estratégico: muchos mayores no tienen smartphone pero SÍ tienen Smart TV — sus hijos se la actualizaron. La TV es el dispositivo con el que más tiempo pasan (5.2h/día los mayores de 65). Propone que la app corra en la TV: el Tamagotchi vive en la pantalla, el abuelo le da de comer con el mando, y cuando toca check-in, el avatar salta a pantalla completa interrumpiendo la emisión. Incluso si la TV está en standby, debería poder encenderse automáticamente.

#### El concepto en una frase
> "El Tamagotchi vive en la tele del abuelo. Cuando es hora de dar señales de vida, Misi salta sobre Antena 3 y el abuelo pulsa OK en su mando."

#### Investigación realizada
Se completó un estudio exhaustivo de viabilidad (`docs/estudio-smart-tv.md`) que cubre:
- **Penetración:** ~85% de hogares españoles tienen Smart TV; ~65-75% en hogares de mayores (tendencia ascendente rápida)
- **Plataformas:** Android TV (~35-40%), Samsung Tizen (~30-33%), LG webOS (~15-18%) → con 3 plataformas se cubre ~85% del mercado
- **Viabilidad técnica:** ✅ Alta. App HTML5 universal + wrappers nativos. HDMI-CEC resuelve el encendido desde standby.
- **Competencia:** NINGUNA app de check-in/bienestar en Smart TV. Campo completamente vacío.
- **Coste estimado:** ~10K€ para 3 plataformas

#### Impacto en el proyecto
- **Producto:** La Smart TV se añade como dispositivo #8 en la familia, con prioridad ALTA
- **Arquitectura:** Nueva sección completa en `docs/arquitectura-iot.md` (sección 11)
- **Hardware:** El hub IoT gana módulo HDMI-CEC para controlar la TV
- **UX:** Diseño "10-foot UI" específico para TV (texto ≥32px, contraste AAA, input por D-pad)
- **Negocio:** Posibilidad de partnerships con Samsung/LG y operadores IPTV (Movistar+, Orange TV)

#### Documentos creados/actualizados
1. `docs/estudio-smart-tv.md` — Estudio de viabilidad completo (NUEVO)
2. `docs/arquitectura-iot.md` — Sección 11: Smart TV como dispositivo + tabla de familia actualizada (ACTUALIZADO)
3. `docs/vision-fundacional.md` — Smart TV añadida a la familia de dispositivos (ACTUALIZADO)
4. `docs/diario-equipo.md` — Esta entrada (ACTUALIZADO)
5. `mockups/tv-smarttv.html` — Mockup visual de la pantalla de TV con Tamagotchi (NUEVO)

#### Decisiones tomadas
- Smart TV es **prioridad ALTA** (igual que botón IoT y app móvil)
- Estrategia: app HTML5 universal + wrapper nativo por plataforma
- HDMI-CEC como mecanismo universal para encender TV desde standby
- Botón OK del mando = check-in principal
- Botones de colores del mando: Verde=Bien, Rojo=Mal, Amarillo=No entiendo
- MVP primero en Android TV (mayor cuota), luego Tizen y webOS
- El hub IoT + HDMI-CEC es el fallback universal (funciona en CUALQUIER TV)

#### Estado al final de la sesión
✅ Estudio de viabilidad Smart TV completado
✅ Arquitectura IoT actualizada con sección Smart TV
✅ Visión fundacional actualizada con Smart TV
✅ Mockup HTML de pantalla TV creado
✅ Diario actualizado
⏳ Pendiente: desarrollo de app Android TV (MVP)
⏳ Pendiente: desarrollo de web app HTML5 para Tizen/webOS
⏳ Pendiente: módulo HDMI-CEC en firmware ESP32
⏳ Pendiente: contacto con Samsung/LG para partnership
⏳ Pendiente: contacto con operadores IPTV

---

*Diario mantenido por Leo (IA). Actualizar al final de cada sesión de trabajo.*
