# 🟢 Dame un Ok — Documento Fundacional de Visión

**Autor de la visión:** Ángel Fernández  
**Fecha:** 30 enero 2026  
**Documentado por:** Leo (IA)  
**Versión:** 1.0  

---

## LA IDEA CORE

**"Dame un Ok" es el Dead Man's Switch humanizado.**

No es una app médica. No es un localizador GPS. No es un sistema de teleasistencia. Es un botón diario — un gesto mínimo que dice "estoy bien" — y si ese gesto no llega, alguien que te importa lo sabrá.

> **En UNA frase:** "Es el WhatsApp de la tranquilidad familiar — un Ok al día que vale más que mil llamadas."

---

## EL PROBLEMA QUE RESUELVE

### La España Vaciada y la Epidemia de Soledad

España tiene **4,9 millones de personas viviendo solas** (INE, 2024). De ellas, más de **2 millones son mayores de 65 años**. En la "España vaciada" (zonas rurales despobladas), hay pueblos enteros donde los únicos habitantes son ancianos que viven solos.

**El problema real no es técnico, es emocional:**
- El hijo que vive en Madrid y se preocupa por su madre en un pueblo de Soria
- La hija que llama todos los días a las 10AM y si no contesta, entra en pánico
- El anciano que se cae en casa y nadie lo descubre hasta días después
- El nómada digital que viaja solo y nadie sabría si le pasara algo

**Las soluciones actuales son insuficientes:**
- **Teleasistencia (Cruz Roja/Comunidades Autónomas):** Requiere pulsera/medallón. Estigma de "soy dependiente". Coste mensual. Burocracia para acceder.
- **Llamadas diarias:** Dependen de que ambas partes estén disponibles a la misma hora. Generan dependencia y culpa si se olvida.
- **Life360 y localizadores GPS:** Invasivos. El abuelo siente que le vigilan. Problemas de privacidad graves.
- **Nada:** La opción mayoritaria. Cruzar los dedos y esperar que no pase nada.

### El Insight Clave

> **La app china "¿Estás muerto?" ("你死了吗") se hizo viral en 2025 con millones de descargas.** Demostró que existe una demanda masiva y global para este tipo de solución. Pero su tono de humor negro no funciona en Europa, y sus datos están en servidores chinos — inaceptable para RGPD.

"Dame un Ok" toma el concepto validado y lo adapta al mercado europeo con:
- Lenguaje cálido y familiar (no humor negro)
- Servidores en UE (Frankfurt/Madrid)
- Cumplimiento RGPD nativo
- Posicionamiento como herramienta de cuidado, no de miedo

---

## PÚBLICO OBJETIVO (DUAL)

### 🎯 Segmento 1: Seniors Solos (El Mercado Primario)

**Perfil del usuario:** María, 78 años, vive sola en un pueblo de Castilla y León. Tiene un smartphone básico que le regaló su hijo. Sabe usar WhatsApp y poco más.

**Perfil del cliente real (quien compra/instala):** Javier, 45 años, hijo de María. Vive en Madrid. Llama a su madre todos los días pero no siempre puede. Vive con la angustia de "¿y si un día no contesta y no es que no oye el teléfono?"

**Datos del mercado:**
- 2+ millones de mayores de 65 viviendo solos en España
- 47% de los hogares unipersonales en España son de personas >65 años
- El mercado de teleasistencia en España mueve ~400M€/año
- Penetración smartphone en mayores de 65: ~72% (y subiendo)

**Necesidades específicas:**
- UI con botones ENORMES (accesibilidad visual)
- Alto contraste (cataratas, presbicia)
- Mínima interacción (un solo toque al día)
- Sin configuración compleja
- Sin suscripciones (los mayores desconfían de pagos recurrentes)

### 🎯 Segmento 2: Singles y Nómadas (El Mercado Secundario)

**Perfil:** Laura, 32 años, nómada digital. Viaja sola por el sudeste asiático. Su familia en España no sabe exactamente dónde está cada día. Si le pasara algo, podrían pasar días sin que nadie se alarmara.

**Datos del mercado:**
- 35 millones de nómadas digitales globalmente (2024)
- 5,5 millones de españoles de 25-44 viven solos
- Crecimiento del "solo living" del 30% en la última década en España

**Necesidades específicas:**
- Diseño moderno (no "app de abuelos")
- Geolocalización opcional (compartir última ubicación conocida)
- Integración con wearables (Apple Watch, smartbands)
- Multi-idioma (ES/EN mínimo)

---

## ARQUITECTURA FUNCIONAL (MVP)

### Principio de Diseño: "Una Sola Pantalla"

La app debe poder usarse con un solo dedo, con los ojos entrecerrados, recién levantado. La fricción debe ser **CERO**.

### 🟢 El "Happy Path" (Flujo Principal)

```
1. ONBOARDING (Solo primera vez — 3 pasos máximo)
   ├── Registro ultra-rápido (Apple ID / Google Auth / Teléfono)
   ├── Definir Hora Límite ("Tengo que dar el OK antes de las ___")
   └── Añadir Contactos de Emergencia (email/teléfono)

2. USO DIARIO
   ├── Push notification: "☀️ Buenos días, María. Es hora de tu Ok"
   ├── Abrir app → Pantalla con BOTÓN GIGANTE verde
   ├── Pulsar botón → Feedback visual ✅ + haptic
   └── Cerrar app. Hecho. Hasta mañana.

3. PROTOCOLO DE FALLO (Si NO hay pulsación)
   ├── T+0 (hora límite): Nada. Gracia de 1 hora.
   ├── T+1h: Push insistente + vibración + sonido alto al USUARIO
   │         "⚠️ María, aún no has dado tu Ok de hoy"
   ├── T+3h: Envío automático a contactos de emergencia
   │         EMAIL: "María no ha hecho su check-in diario.
   │                 Intentad contactarla por teléfono."
   │         SMS (Premium): Mismo mensaje + última ubicación
   └── T+6h (opcional): Segunda ronda de avisos
```

### 🔴 Protocolo de Fallo — Diseño del Mensaje

**CRÍTICO:** El mensaje a los contactos **NUNCA** debe decir "Ha muerto" ni "Emergencia". Debe ser neutral y accionable:

> *"María no ha confirmado su bienestar hoy a través de Dame un Ok. Esto puede deberse a un olvido, un problema con el teléfono, o cualquier otra razón. Te recomendamos intentar contactarla directamente."*

Esto evita:
- Falsos positivos alarmantes (el "efecto Pedro y el Lobo")
- Responsabilidad legal por diagnósticos médicos
- Ansiedad innecesaria

### 📱 Pantallas del MVP

1. **Splash Screen** — Logo + "Made in Spain 🇪🇸" + "Tus datos no salen de Europa"
2. **Onboarding (3 pasos)** — Registro → Hora límite → Contactos
3. **Pantalla Principal** — BOTÓN GIGANTE verde (95% de la pantalla)
4. **Configuración** — Hora límite, contactos, idioma, ubicación on/off
5. **Historial** — Calendario con ✅/❌ por día (motivación tipo "streak")

---

## NAMING Y MARCA

### Nombre
- **ES:** Dame un Ok
- **EN:** Give Me an Ok
- **Slogan ES:** "Tu tranquilidad diaria, un toque a la vez."
- **Slogan EN:** "Your daily peace of mind, one tap away."

### Diferenciador Cultural
La app china "¿Estás muerto?" usa humor negro como gancho viral. Funciona en China pero es inaceptable en Europa, especialmente para el segmento senior. "Dame un Ok" usa el lenguaje coloquial español de confirmación y cuidado:
- "¿Estás bien?" → "Dame un ok"
- "Sí, estoy bien" → *[pulsa botón]*
- Natural, cálido, familiar

### Identidad Visual (Dirección)
- **Color primario:** Verde (✅ = todo bien)
- **Color de alerta:** Amarillo → Rojo (gradiente de urgencia)
- **Tipografía:** Grande, sans-serif, alto contraste
- **Logo:** Tick/check minimalista + mano/pulgar (concepto "ok")
- **Estilo:** Limpio, profesional, NO infantil ni condescendiente

---

## STACK TECNOLÓGICO

### Frontend
- **Flutter** (código único iOS + Android)
- Diseño de alto contraste (WCAG AA mínimo, AAA objetivo)
- Botones grandes (mínimo 60px touch target, idealmente 80px+)
- Soporte modo oscuro

### Backend
- **Firebase** (Google Cloud) o **Supabase** en UE
- Cloud Functions para cron jobs (temporizadores del protocolo de fallo)
- Firestore/PostgreSQL para datos de usuario
- **CRÍTICO:** Los cron jobs DEBEN ejecutarse en servidor, NO en el móvil (si el móvil se queda sin batería o se rompe, el sistema de alerta debe seguir funcionando)

### Infraestructura
- **Servidores en UE:** Frankfurt (AWS eu-central-1) o Madrid (Google Cloud europe-southwest1)
- Encriptación en tránsito (TLS 1.3) y en reposo (AES-256)
- Backups diarios automáticos

### Notificaciones
- **Push:** Firebase Cloud Messaging (FCM) para Android, APNs para iOS
- **Email:** SendGrid / Amazon SES (coste ~$0.0001/email)
- **SMS (Premium):** Twilio / Vonage (coste ~0.04-0.07€/SMS en España)

---

## MODELO DE NEGOCIO

### Principio: "Menos que un café"

> **Precio:** 1,99€ - 2,99€ (pago único, lifetime)

### Justificación del Pago Único
1. **Los seniors detestan las suscripciones.** No entienden por qué hay que pagar cada mes. Un pago único elimina esa barrera.
2. **El coste por usuario es ínfimo.** Un usuario "pasivo" (un push + un check-in al día) cuesta céntimos al año en infraestructura.
3. **"Menos que un café por tranquilidad eterna"** — psicología de precio irresistible.
4. **La app china demostró que el pago único funciona** a escala masiva.

### Upselling (Fase 2)
- **Premium (0,99€/mes):** SMS a contactos de emergencia + llamadas automatizadas IVR + geolocalización en tiempo real
- **Cuentas Familiares:** Un dashboard donde el hijo ve el estado de varios familiares (padre, madre, tío solo...)

### Sostenibilidad Financiera

| Concepto | Coste/usuario/año | Ingreso/usuario |
|---|---|---|
| Infraestructura (DB + Functions) | ~0,10€ | — |
| Push notifications | ~0,01€ | — |
| Email (si alerta) | ~0,001€ | — |
| **Total coste** | **~0,11€** | — |
| Pago único | — | 1,99-2,99€ |
| **Margen bruto** | — | **~95%** |

Con 10.000 usuarios: ~2.000€ coste/año vs ~25.000€ ingreso. Margen enorme.

Con 100.000 usuarios: ~11.000€ coste/año vs ~250.000€ ingreso.

---

## DIFERENCIADORES ÚNICOS vs COMPETENCIA

1. **Simplicidad radical** — Un botón. Un toque. Cero fricción. Las apps de seguridad existentes (Life360, etc.) son complejas y requieren GPS permanente.
2. **Respeto a la privacidad** — No rastreamos ubicación constantemente. Solo compartimos la última conocida SI hay alerta Y el usuario lo ha activado.
3. **Precio justo** — Pago único ~2€ vs suscripciones de $5-10/mes de competidores.
4. **Hecho en España, para España** — Servidores en UE, RGPD nativo, idioma y cultura españoles. Vs apps americanas o chinas.
5. **No estigmatiza** — No es "un aparato para viejos". Es una app moderna que cualquier persona sola puede usar. Diseño que no avergüenza.
6. **El familiar también tiene paz** — El valor real no es solo para el usuario, sino para quien se preocupa por él/ella.
7. **Seguridad pasiva** — A diferencia de botones de emergencia (teleasistencia), no requiere acción durante una crisis. Si no puedes pulsar, eso ya ES la señal.

---

## ANÁLISIS DE RIESGOS INICIALES

### Riesgo A: El Falso Positivo ("Pedro y el Lobo")
**Escenario:** Usuario olvida pulsar. Familia recibe aviso. Pánico innecesario.
**Mitigación:** Sistema de pre-aviso escalonado (1h, 3h, 6h). Mensaje neutral. Historial visible para familia ("ha olvidado 3 veces este mes" vs "primera vez que falla").

### Riesgo B: Dependencia del Dispositivo
**Escenario:** El móvil se queda sin batería, se rompe, se pierde.
**Mitigación:** El protocolo de fallo se ejecuta en SERVIDOR. Si el móvil muere, el servidor detecta la falta de check-in y avisa igual. Futuro: integración Alexa/Google Home/smartwatch.

### Riesgo C: Percepción de "Estafa" o "App Demasiado Simple"
**Escenario:** "¿2€ por un botón? Esto es una estafa."
**Mitigación:** UI extremadamente pulida. Landing page profesional. Sección "Quiénes Somos" con empresa española real. Testimonios. Cobertura en medios.

### Riesgo D: Responsabilidad Legal
**Escenario:** El sistema falla (fallo de red, bug) y un usuario muere sin que se avise a los contactos.
**Mitigación:** Disclaimer legal blindado: "Esta aplicación es una herramienta de comunicación, no un dispositivo médico ni un servicio de emergencias (112). [Entidad legal] no se hace responsable de fallos de red, batería o consecuencias derivadas de la falta de aviso."

### Riesgo E: Competidores Establecidos
**Escenario:** Snug Safety (USA), Life360, o la propia app china se expanden a Europa.
**Mitigación:** First mover en España con enfoque local, RGPD nativo, idioma español. La competencia americana no suele adaptarse bien al mercado europeo.

---

## HOJA DE RUTA

### Fase 1 — MVP (3-4 semanas)
- App Flutter (iOS + Android)
- Registro con Apple ID / Google / Teléfono
- Pantalla principal con botón de check-in
- Configuración de hora límite
- Hasta 3 contactos de emergencia
- Push notifications (recordatorio + alerta al usuario)
- Email automático a contactos si falla el check-in
- Backend con cron jobs en cloud
- Landing page + Términos de Servicio + Política de Privacidad

### Fase 2 — Crecimiento (1-2 meses post-lanzamiento)
- SMS a contactos de emergencia (tier Premium)
- Llamadas IVR automatizadas (Premium)
- Historial/calendario de check-ins (streaks)
- Dashboard familiar (ver estado de varios familiares)
- Geolocalización opcional (última ubicación en alerta)
- Widget iOS/Android (check-in sin abrir app)
- Apple Watch / wearable companion

### Fase 3 — Expansión (3-6 meses)
- Multi-idioma (EN, FR, DE, PT)
- Expansión a Latam y resto de Europa
- Integración con asistentes de voz ("Alexa, dame un ok")
- Modo comunidad (residencias, ayuntamientos, parroquias)
- API para integración con servicios de teleasistencia
- Acuerdos con Cruz Roja, Cáritas, ayuntamientos

### Fase 4 — Escala (6-12 meses)
- Partnerships institucionales
- B2G (gobiernos, servicios sociales)
- Personalización de alertas (nivel de urgencia, frecuencia)
- IA: detección de patrones (si el usuario siempre da ok a las 9AM y hoy no lo ha dado a las 11AM, pre-alerta)
- Marca registrada + protección IP

---

## MARKETING Y POSICIONAMIENTO

### Mensaje Clave
> **"¿Te preocupa tu padre/madre que vive solo/a?"**

El target de marketing NO es el senior — es el hijo/a de 35-55 años que se preocupa.

### Canales
1. **Redes sociales:** Facebook (donde está el target de 40-55), Instagram, TikTok (viral)
2. **Medios locales:** Notas de prensa a periódicos regionales ("La solución española a la soledad")
3. **Influencers senior:** Canales de YouTube de tecnología para mayores
4. **Institucional:** Presentación a ayuntamientos de la España vaciada, centros de día, asociaciones de jubilados
5. **SEO:** "app seguridad personas mayores", "app check-in diario", "alternativa teleasistencia"

### Viralidad Estructural
Cada usuario activo genera potencialmente 1-5 contactos de emergencia que VEN la app funcionando. Cada contacto es un potencial nuevo usuario ("yo también quiero esto para mi padre").

---

## CONCLUSIÓN

"Dame un Ok" es un proyecto de **baja complejidad técnica y alto impacto emocional**. La tecnología es commodity — un botón, un temporizador, un email. La clave del éxito está en:

1. **Posicionamiento de marca** — Ser el estándar de confianza en España
2. **UX impecable** — Que un abuelo de 80 años pueda usarlo sin ayuda
3. **Velocidad de ejecución** — Aprovechar la viralidad del concepto chino antes de que alguien más lo haga en Europa
4. **Confianza RGPD** — "Tus datos no salen de Europa" como diferenciador real

Es un producto "instalar y olvidar" que genera ingresos pasivos recurrentes (por nuevas descargas) con un mantenimiento operativo muy bajo.

**Recomendación: Proceder al desarrollo del prototipo inmediatamente.**

---

---

## VISIÓN IoT Y HARDWARE — ECOSISTEMA COMPLETO

### El Salto: De App a Ecosistema

A partir del 31 de enero de 2026, "Dame un Ok" evoluciona de una app móvil a un **ecosistema completo de dispositivos + software**. La visión de Ángel es clara: no depender exclusivamente de smartphones modernos.

> **"El abuelo de 85 años en un pueblo de Soria no tiene iPhone. Tiene un Nokia con teclas y un sofá. El botón tiene que estar en el sofá, no en un smartphone que no entiende."** — Ángel Fernández

### Vertex como Fabricante

Vertex dispone de **fábrica propia con CNC y líneas de producción en serie**, lo que convierte a "Dame un Ok" en algo que ningún competidor software puede replicar fácilmente:

- **Prototipado rápido:** De idea a prototipo funcional en días, no semanas
- **Control de calidad total:** Sin depender de fábricas en China ni intermediarios
- **Costes competitivos:** Fabricación propia = margen en hardware desde el día 1
- **Iteración continua:** Feedback del usuario → nueva versión del dispositivo en semanas
- **Marca propia:** Dispositivos con branding "Dame un Ok" fabricados en España 🇪🇸

### Familia de Dispositivos

1. **Botón físico IoT** — Para cocina, entrada, mesita de noche. WiFi/BLE, un solo botón grande. Tan simple como un timbre.
2. **Botón integrado en muebles** — Empotrado en el reposabrazos del sofá, la mesa del salón. Siempre al alcance.
3. **Mando a distancia con botón OK** — Funciona como mando de TV normal + botón verde de check-in. El abuelo ya sabe usar un mando.
4. **Feature phones con teclas** — Check-in por SMS o USSD. Sin internet. Sin app. Solo una tecla.
5. **Impresora térmica de tickets** — Recibe mensajes de la familia impresos en papel. Sin pantalla, sin complejidad. Servicio premium.
6. **Add-ons para dispositivos existentes** — Módulo BLE que se pega a cualquier objeto para convertirlo en botón de check-in.
7. **Smart TV** — App para Samsung Tizen, LG webOS y Android TV. El Tamagotchi vive en la tele del abuelo. Check-in con el botón OK del mando. Alerta a pantalla completa cuando toca. Combinada con el hub IoT (HDMI-CEC), puede incluso encender la TV desde standby. **Coste: 0€ para el usuario** (solo software). Penetración Smart TV en España: ~85% de hogares.

### El Ecosistema Completo

```
         App Móvil (Flutter)
              │
    ┌─────────┼─────────┐
    │         │         │
  Botón    Mando    Feature
  WiFi     TV+OK    Phone
    │         │     (SMS)
    └─────────┼─────────┘
              │
         Cloud Backend
              │
    ┌─────────┼─────────┐
    │         │         │
  Push     Email    Impresora
  Notif    Alert    Térmica
```

### Modelo de Negocio Hardware

| Producto | Coste fabricación | PVP | Margen |
|---|---|---|---|
| Botón WiFi | ~5€ | 19,99€ | ~75% |
| Botón mueble | ~7€ | 24,99€ | ~72% |
| Mando TV+OK | ~10€ | 29,99€ | ~67% |
| Impresora térmica | ~18€ | 49,99€ | ~64% |
| Pack familiar (botón + impresora) | ~22€ | 59,99€ | ~63% |

El hardware no es solo un producto — es un **canal de adquisición**. Cada dispositivo vendido es un usuario cautivo del servicio cloud.

### Ventaja Competitiva Definitiva

Ningún competidor (Snug Safety, Life360, la app china) fabrica hardware propio. Son solo software. "Dame un Ok" con Vertex detrás puede ofrecer:

- **App gratuita o de pago único** (entrada baja)
- **Dispositivos físicos** (ingreso recurrente por hardware + servicio)
- **Impresora con suscripción** (ingreso recurrente mensual)
- **Fabricación española** (orgullo de marca, sin dependencia de Asia)

Esto convierte a "Dame un Ok" en un **negocio de ecosistema tipo Apple**: el software atrae, el hardware retiene, el servicio monetiza.

---

---

## 🐣 PILAR CENTRAL: EL TAMAGOTCHI — MOTIVACIÓN EMOCIONAL

### El Giro Conceptual (31 enero 2026, noche)

La noche del 31 de enero, Ángel propone el cambio más importante en la filosofía del proyecto: **sustituir el "botón frío" de check-in por un avatar virtual tipo Tamagotchi** que el usuario cuida diariamente.

> **"En vez de que el abuelo confirme que está vivo (deprimente), cuida a un bichito virtual. Le da de comer cada día. Si no lo hace, el bichito se pone triste, y eso activa la alerta. La motivación es emocional, no funcional."** — Ángel Fernández

### Por Qué Esto Cambia Todo

1. **Motivación invertida:** De "tengo que reportar que estoy vivo" → "mi gatito me necesita"
2. **Eliminación del estigma:** "Cuido a mi mascota virtual" vs "uso un monitor de vida"
3. **Engagement sostenido:** Gamificación (rachas, evolución, accesorios) mantiene al usuario activo meses/años
4. **Vínculo intergeneracional:** El nieto elige/regala el avatar al abuelo → conexión emocional
5. **Dashboard humanizado:** La familia ve "El gatito de mamá comió a las 9" en vez de "Check-in: OK"
6. **Diferenciador TOTAL:** Ningún competidor (Snug Safety, Life360, app china) usa gamificación emocional

### Mecánica Core

- **Alimentar al avatar = Check-in diario.** El mecanismo de seguridad es idéntico; la experiencia de usuario es radicalmente diferente.
- **Avatar triste = Alerta activada.** Si el usuario no alimenta al bichito, pasa de hambriento → triste → enfermo, y el sistema escala las alertas.
- **Gamificación:** Rachas de días, evolución del avatar (bebé → juvenil → adulto), accesorios desbloqueables, regalos de la familia.
- **Multi-plataforma:** En la app (avatar animado), en OLED (sprite pixel art), en LED (colores = estado), en SMS (emoji), en impresora térmica (imprime al avatar).

### Respaldo Científico

El concepto se apoya en investigación sólida sobre mascotas robóticas y bienestar en mayores (robot PARO, AIBO de Sony, estudios de la Universidad de Saint Louis), que demuestran que la interacción con compañeros virtuales produce beneficios emocionales comparables a mascotas reales: reducción de soledad, ansiedad y depresión, aumento de oxitocina.

> **📄 Documento completo:** Ver `docs/gamificacion-tamagotchi.md` para el diseño detallado de avatares, estados, gamificación, integración IoT y opiniones del equipo.

### El Tamagotchi como Marca

El Tamagotchi no es un feature más — es **el alma del producto**. El marketing lidera con emoción ("Regálale un compañero a mamá"), no con función ("Monitor de bienestar"). Esto abre posibilidades virales (abuelas enseñando orgullosas a su gatito virtual con corona de 100 días) que un botón frío nunca tendría.

---

---

## 💌 MENSAJERÍA FAMILIAR → IMPRESORA TÉRMICA

### El Puente Físico entre Generaciones (1 febrero 2026)

La impresora térmica evoluciona de accesorio premium a **pieza central del ecosistema**. El concepto de Ángel es simple y poderoso: los familiares envían mensajes desde las apps de mensajería que YA usan (WhatsApp, Telegram, SMS) y esos mensajes se imprimen físicamente en la impresora térmica del abuelo.

> **"No le pidas al abuelo que use WhatsApp. Deja que su hijo use WhatsApp, y al abuelo le llega un ticketito de papel en la cocina. Tangible. Sin pantallas. Sin aprender nada."** — Ángel Fernández

### Por Qué Esto es Transformador

1. **Cero fricción para el familiar:** Envía un mensaje por WhatsApp o Telegram. Ya sabe hacerlo. No necesita instalar nada nuevo.
2. **Cero fricción para el abuelo:** Recibe un papel impreso. Lo lee. No necesita tocar ninguna pantalla.
3. **Tangibilidad emocional:** Un mensaje en papel tiene un peso emocional que un mensaje digital no tiene. El abuelo puede guardarlo, ponerlo en la nevera, enseñárselo al vecino.
4. **Canal de cariño asimétrico:** El familiar envía amor, el abuelo lo recibe en papel y confirma que está bien pulsando el botón. Dos gestos mínimos que mantienen la conexión.
5. **El dispositivo cobra vida:** Ya no es "un botón para confirmar que estás vivo" — es una estación que muestra a tu mascota virtual, imprime mensajes de tus hijos y te recuerda cosas. Es un compañero.

### La Estación Dame un Ok

El dispositivo final integra tres componentes en un solo aparato de cocina/salón:
- **Pantalla OLED** (NO táctil) → muestra el avatar Tamagotchi, hora, estado
- **Botón grande** (60mm, verde, retroiluminado) → check-in diario = alimentar al avatar
- **Impresora térmica** → recibe mensajes de familiares, imprime recordatorios, celebra rachas

### Integración con Plataformas de Mensajería

| Plataforma | Cómo funciona | Coste para nosotros |
|---|---|---|
| **WhatsApp** | Familiar envía mensaje al número oficial → se imprime | ~0.05€/conversación |
| **Telegram** | Familiar envía mensaje al bot @DameUnOkBot → se imprime | 0€ |
| **SMS** | Familiar envía SMS al número → se imprime | ~0.03€/SMS |
| **App/Dashboard** | Familiar escribe desde la app → se imprime | 0€ |

Los familiares vinculan su cuenta de mensajería al dispositivo del abuelo mediante un código de verificación. Hasta 5 familiares por dispositivo. El sistema confirma la entrega: "✅ Tu mensaje se ha impreso en casa de mamá."

### Impacto en el Modelo de Negocio

La estación integrada (pantalla + botón + impresora) se posiciona como el **producto estrella**:
- **PVP estimado:** 59,99-79,99€ (estación completa)
- **Suscripción:** 2,99€/mes (mensajería ilimitada + 5 familiares + papel incluido)
- **Valor percibido:** Altísimo — es un canal de comunicación familiar, no solo un botón de seguridad

La impresora convierte a "Dame un Ok" de una herramienta de supervisión en un **sistema de conexión familiar**. El marketing ya no es "vigila a tu padre" sino "mantén el contacto con mamá, aunque no sepa usar WhatsApp".

> **📄 Arquitectura técnica completa:** Ver `docs/arquitectura-iot.md` sección 9 para flujos, APIs, webhooks, esquemas de base de datos y costes detallados.

---

*Este documento recoge la visión completa del proyecto tal como fue definida por Ángel Fernández en los informes del 30-31 de enero de 2026, ampliada con investigación de mercado, análisis estratégico, visión IoT/hardware, concepto Tamagotchi y mensajería bidireccional por Leo (IA).*
