# Cursillo: Generación de Imágenes con IA — FLUX en Hugging Face

> **Objetivo:** Dominar la creación de imágenes profesionales con IA para nuestros proyectos, con consistencia de personajes, control de ratios y prompts de nivel experto.
> **Herramientas:** FLUX.1 [schnell] (text-to-image) + FLUX.1 Kontext [dev] (image editing)
> **Coste:** Gratuito, sin registro

---

## 1. Herramientas disponibles

### FLUX.1 [schnell] — Generación desde texto
- **URL:** https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell
- **Qué hace:** Genera imágenes desde cero a partir de un prompt de texto
- **Velocidad:** 1-4 pasos de inferencia, resultado en ~20-30 segundos
- **Sin registro, sin límite conocido** (es un Space gratuito en HF con GPU Zero)
- **Modelo:** 12B parámetros, licencia Apache 2.0
- **Cuándo usarlo:** Para crear el personaje BASE original, escenas nuevas, fondos, mockups de pantallas completas

### FLUX.1 Kontext [dev] — Edición de imagen existente
- **URL:** https://huggingface.co/spaces/black-forest-labs/FLUX.1-Kontext-Dev
- **Qué hace:** Toma una imagen existente y la modifica según instrucciones de texto
- **Capacidad clave:** MANTIENE LA IDENTIDAD del personaje mientras cambia expresión, pose, contexto
- **Sin registro** (Space gratuito en HF con GPU Zero)
- **Cuándo usarlo:** Para generar VARIACIONES de un personaje ya creado (triste, contento, dormido, hambriento...)

### Flujo de trabajo para consistencia:
```
1. FLUX schnell → Generar personaje BASE (ej: Misi contenta)
2. Descargar imagen base
3. FLUX Kontext → Subir imagen base + prompt "make this kitten look sad with tears"
4. Resultado: mismo personaje, distinta emoción
5. Repetir para cada estado
```

---

## 2. Parámetros avanzados (FLUX schnell)

### Advanced Settings (botón expandible):
| Parámetro | Rango | Default | Qué hace |
|-----------|-------|---------|----------|
| **Seed** | 0 - 2147483647 | Aleatorio | Semilla de reproducibilidad. MISMO seed + MISMO prompt = MISMA imagen |
| **Width** | 256 - 2048 | 1024 | Ancho en píxeles |
| **Height** | 256 - 2048 | 1024 | Alto en píxeles |
| **Inference Steps** | 1 - 50 | 4 | Más pasos = más calidad (pero más lento). 4 ya es excelente |
| **Randomize Seed** | checkbox | ✅ On | Si está ON, genera imagen diferente cada vez. Desactivar para reproducir |

### Ratios de aspecto recomendados:
| Ratio | Width x Height | Uso |
|-------|---------------|-----|
| **1:1** | 1024 x 1024 | Avatares, iconos, perfil |
| **9:16** | 576 x 1024 | **Pantalla de móvil (vertical)** — para mockups de app |
| **16:9** | 1024 x 576 | Pantalla horizontal, banners |
| **3:4** | 768 x 1024 | Retrato clásico |
| **4:3** | 1024 x 768 | Paisaje clásico |
| **2:3** | 680 x 1024 | Póster vertical |

> ⚠️ **Para mockups de app móvil usar SIEMPRE 9:16 (576x1024)** o ratios similares verticales.
> ⚠️ Los ratios se cambian con los sliders de Width/Height, NO en el prompt.

### Truco del Seed para consistencia:
1. Generar imagen con Randomize ON
2. Anotar el seed que aparece
3. Desactivar Randomize
4. Usar MISMO seed con prompt ligeramente modificado
5. El resultado será similar pero con los cambios pedidos

> ⚡ Sin embargo, para consistencia de personajes es MUCHO mejor usar **Kontext** (subir imagen + editar) que jugar con seeds.

---

## 3. Cómo escribir prompts profesionales

### Estructura recomendada (en orden de importancia):
```
[Sujeto principal] + [Estilo artístico] + [Acción/Pose] + [Expresión] + [Detalles físicos] + [Fondo] + [Iluminación] + [Calidad técnica]
```

### Ejemplo completo:
```
A cute baby orange tabby kitten in Disney Pixar 3D animation style, sitting facing forward, 
very round chubby body, enormous adorable eyes with sparkling light reflections, tiny pink nose, 
warm orange fur with subtle gradient, pink inner ears, thin delicate whiskers, rosy blushing cheeks, 
small round paws with pink toe beans, happy smiling expression, 
soft pastel green gradient background, 
cinematic studio lighting with soft volumetric shadows, 
professional Pixar movie quality render, kawaii baby proportions with oversized head, 
isolated character on clean minimal background
```

### Reglas de oro para prompts en FLUX:

1. **Sé descriptivo, no genérico.** "cute cat" ❌ → "cute baby orange tabby kitten with enormous sparkling eyes, tiny pink nose, round chubby body" ✅
2. **Especifica el estilo artístico claramente.** "Disney Pixar 3D animation style" / "flat vector illustration" / "watercolor painting"
3. **Indica la calidad.** "professional render" / "Pixar movie quality" / "studio photography" / "4K detailed"
4. **Describe el fondo.** "clean minimal background" / "pastel green gradient" / "white studio backdrop"
5. **Menciona la iluminación.** "cinematic studio lighting" / "soft shadows" / "warm golden hour light"
6. **NO uses negative prompts** (FLUX schnell no tiene campo de negative prompt, a diferencia de Stable Diffusion)
7. **Escribe en inglés.** FLUX entiende mejor el inglés que otros idiomas
8. **Sé específico con colores.** "warm orange fur with subtle gradient" mejor que "orange"
9. **Indica proporciones.** "kawaii baby proportions with oversized head" para estilo cute
10. **Usa modificadores de calidad al final.** "professional 3D render, cinematic lighting, high detail"
11. **Colores exactos con HEX.** FLUX.2 soporta hex en prompt: "the color #FF6B35" (verificar en schnell)
12. **Prompt estructurado (JSON).** Para mayor precisión, FLUX.2 acepta JSON con campos subject/background/lighting/style/camera_angle/composition. En schnell funciona mejor el texto natural.
13. **Texto en imágenes.** FLUX es bueno renderizando texto legible dentro de imágenes. Usa comillas: 'a sign that says "Dame un Ok"'

### Vocabulario útil por categoría:

**Estilos artísticos:**
- Disney Pixar 3D animation style
- Soft cartoon illustration
- Flat vector art, clean lines
- Watercolor painting
- Claymation / stop-motion style
- Kawaii Japanese illustration
- Children's book illustration

**Expresiones:**
- Happy smiling, bright eyes, rosy cheeks
- Sad crying, teardrops, droopy ears, worried look
- Sleepy drowsy, half-closed eyes, yawning
- Hungry, looking at food bowl, drooling slightly
- Worried, slight frown, looking up
- Sick, pale, thermometer, tired eyes
- Excited, jumping, sparkles around

**Calidad/Técnica:**
- Professional 3D render quality
- Pixar movie quality
- Cinematic studio lighting
- Soft volumetric shadows
- High detail, sharp focus
- Clean minimal background
- Isolated character, no distractions

**Proporciones cute (Kindchenschema):**
- Kawaii baby proportions
- Oversized head relative to body
- Very large round eyes
- Small nose and mouth
- Round chubby body
- Tiny limbs and paws

---

## 4. FLUX Kontext — Edición con consistencia

### Cómo funciona:
1. Subir imagen (arrastrar o click en zona de upload)
2. Escribir instrucción de edición en el campo Prompt
3. Click "Run"
4. El resultado mantiene el personaje original pero con los cambios pedidos

### Prompts de edición efectivos:
```
# Cambiar emoción
"Make this kitten look sad with tears falling from its eyes, droopy ears"
"Make this kitten look sleepy with half-closed eyes, yawning"
"Make this kitten look hungry, staring at an empty food bowl"
"Make this kitten look worried with a slight frown"
"Make this kitten look sick with pale fur and tired eyes"

# Cambiar contexto/fondo
"Place this kitten on a smartphone screen as part of a mobile app UI"
"Put this kitten in a cozy living room setting"
"Change the background to a soft pink gradient"

# Añadir elementos
"Add a small crown on this kitten's head"
"Add a tiny red heart floating above this kitten"
"Put a food bowl in front of this kitten"

# Cambiar vista
"Show this same kitten from a side angle"
"Make this kitten larger filling the whole frame"
```

### Advanced Settings de Kontext:
| Parámetro | Default | Qué hace |
|-----------|---------|----------|
| **Seed** | Aleatorio | Reproducibilidad |
| **Guidance Scale** | 2.5 | Cuánto sigue el prompt (2-5 recomendado) |
| **Inference Steps** | 28 | Más = mejor calidad |

### Tips profesionales de prompting en Kontext (fuente: Replicate + BFL):

1. **Sé específico:** Nombra colores exactos, describe elementos visuales con precisión, usa verbos directos. Evita "make it better".
2. **Empieza simple:** Prueba ediciones pequeñas primero, luego construye sobre lo que funciona.
3. **Preserva intencionalmente:** Usa frases como "while keeping the same facial features" o "maintain the original composition".
4. **Itera paso a paso:** Ediciones complejas = mejor hacerlas en pasos pequeños secuenciales.
5. **Nombra al sujeto directamente:** "the orange tabby kitten" NO "it" o "the character". Evita pronombres vagos.
6. **Usa comillas para texto:** Para editar texto en imagen: "replace 'Hello' with 'Hola'"
7. **Controla composición explícitamente:** Si quieres mantener ángulo de cámara o encuadre, DILO.
8. **Elige verbos con cuidado:** "transform" = rework completo. "change the expression to sad" = más controlado.
9. **Kontext soporta edición multi-turno:** Puedes editar → descargar → re-subir → editar de nuevo. ¡La consistencia se mantiene incluso tras múltiples ediciones!
10. **Para cambiar fondo manteniendo sujeto:** "Change the background to [X] while keeping the character in the exact same position, maintain identical subject placement, camera angle, framing, and perspective. Only replace the environment."

### Limitaciones:
- A veces introduce cambios sutiles no pedidos (color ligeramente diferente, etc.)
- Para cambios muy drásticos puede perder consistencia
- Los fondos pueden cambiar aunque no se pida
- Mejor pedir UN cambio a la vez, no muchos simultáneos
- Superó a GPT-4o/gpt-image-1 de OpenAI en tests independientes (Replicate, KontextBench)
- Paper técnico: arxiv.org/abs/2506.15742

---

## 5. Flujo de trabajo para Dame un Ok

### Paso 1: Generar avatar base (FLUX schnell)
- Ratio 1:1 (1024x1024)
- Prompt detallado con estilo Pixar, proporciones kawaii
- Estado: CONTENTO (es el estado base/default)
- Descargar y guardar como `AVATAR-[animal]-[nombre]-base-contento.webp`

### Paso 2: Generar estados emocionales (FLUX Kontext)
- Subir imagen base a Kontext
- Prompt: "Make this [animal] look [emoción]"
- 7 estados por avatar: contento ✅, dormido, hambriento, preocupado, triste, enfermo, crítico
- Guardar como `AVATAR-[animal]-[nombre]-[estado].webp`

### Paso 3: Generar vistas de la app (FLUX schnell)
- Ratio **9:16** (576x1024) para simular pantalla móvil
- Prompt: descripción completa de la pantalla incluyendo UI, botones, avatar, textos
- Usar prompt estructurado tipo JSON para mayor precisión:
```
A mobile app screenshot in flat modern UI design, portrait orientation 9:16 ratio,
showing a pet care app interface with:
- Top bar with "Dame un Ok" logo and settings icon
- Large center area showing a cute happy orange kitten character (Pixar style, same as reference)
- Green status badge saying "Todo bien"  
- Two large rounded buttons at bottom: "Dar de comer" (green) and "Jugar" (blue)
- Soft warm color palette, rounded corners, accessible large text
- Clean minimal iOS-style design, no stock emojis or icons
- All UI elements hand-designed, custom style
```

### Paso 4: Generar vistas con personaje integrado (FLUX Kontext)
- Si queremos meter el avatar exacto dentro de un mockup:
  1. Generar primero el mockup de pantalla vacío con FLUX schnell
  2. Usar Kontext para insertar el avatar: "Add the kitten character in the center of this app screen"
  - O alternativamente: componer en un editor de imágenes (más control)

---

## 6. Naming convention para archivos

```
[número]-[tipo]-[descripción-corta].webp

Tipos:
- AVATAR = Personaje solo, sin contexto
- SCREEN = Vista completa de pantalla de app
- ICON = Icono o elemento UI
- BG = Fondo o escena

Ejemplos:
01-AVATAR-gato-misi-contento.webp
02-AVATAR-gato-misi-triste.webp
03-AVATAR-gato-misi-dormido.webp
04-AVATAR-perro-toby-contento.webp
10-SCREEN-home-misi-contenta.webp
11-SCREEN-dashboard-familiar.webp
20-ICON-estrella-racha.webp
```

---

## 7. Límites y precauciones

- **Uso gratuito en HF Spaces:** No hay límite documentado, pero usa GPU compartida (Zero). En horas punta puede haber cola o timeout.
- **Si se agota la GPU:** Esperar unos minutos e intentar de nuevo.
- **Calidad del modelo schnell:** Es el modelo rápido (4 pasos). Para máxima calidad existe FLUX.1 [dev] (50 pasos) pero es más lento y puede requerir login HF.
- **Descarga:** Las URLs de descarga expiran. Descargar inmediatamente después de generar.
- **Formato:** Las imágenes se generan en WebP. Si necesitamos PNG, convertir con `sips` o `ffmpeg`.
- **Conversión WebP → PNG:** `sips -s format png input.webp --out output.png`

---

## 8. Alternativas investigadas

| Plataforma | Ventajas | Inconvenientes | ¿Registro? |
|-----------|----------|---------------|------------|
| **HF Spaces FLUX** | Gratis, calidad top, sin registro | GPU compartida, puede haber cola | NO |
| **Dreamina (ByteDance)** | Calidad muy alta, china | Probable registro con móvil chino | SÍ |
| **Tongyi Wanxiang (Alibaba)** | Muy buena calidad | Requiere cuenta Aliyun | SÍ |
| **SeaArt** | Muchos modelos | Registro, créditos limitados | SÍ |
| **LiblibAI** | Plataforma china líder | Registro, créditos | SÍ |
| **SiliconFlow API** | API OpenAI-compatible, barata | Requiere API key, coste | SÍ |
| **Replicate** | Muchos modelos, API REST | Coste por uso | SÍ |
| **ComfyUI local** | Sin límites, gratis, privado | Requiere GPU potente, setup complejo | NO |

> **Decisión actual:** Usar HF Spaces (FLUX schnell + Kontext) como herramienta principal. Es gratis, sin registro, y la calidad es de las mejores del mercado.

---

## 9. Familia de modelos FLUX (referencia)

| Modelo | Velocidad | Calidad | Uso | Precio |
|--------|----------|---------|-----|--------|
| FLUX.1 [schnell] | ⚡⚡⚡ | ★★★★ | Generación rápida | Gratis (Apache 2.0) |
| FLUX.1 [dev] | ⚡⚡ | ★★★★★ | Mayor calidad | Gratis (no comercial) |
| FLUX.1 Kontext [dev] | ⚡⚡ | ★★★★★ | Edición de imagen | Gratis (no comercial) |
| FLUX.2 [klein] | ⚡⚡⚡⚡ | ★★★★ | Sub-segundo | $0.014/img |
| FLUX.2 [pro] | ⚡⚡ | ★★★★★ | Producción | $0.03/MP |
| FLUX.2 [max] | ⚡ | ★★★★★★ | Máxima calidad | $0.07/MP |

> FLUX.2 tiene **multi-reference** (hasta 10 imágenes de referencia simultáneas) y **colores hex exactos** en el prompt — ideal para producción con brand guidelines.

---

---

## 10. Guía oficial de prompting BFL (descargada de docs.bfl.ai)

### Framework de prompt FLUX
Estructura: **Subject + Action + Style + Context**
- Subject: foco principal (persona, objeto, personaje)
- Action: qué hace o pose
- Style: enfoque artístico, medio, estética
- Context: escenario, iluminación, hora, mood

**El orden importa:** FLUX presta MÁS atención a lo que viene PRIMERO.
Prioridad: Sujeto principal → Acción clave → Estilo crítico → Contexto esencial → Detalles secundarios

### Longitud óptima de prompt
- Corto (10-30 palabras): conceptos rápidos, exploración
- Medio (30-80 palabras): ideal para la mayoría de proyectos
- Largo (80+ palabras): escenas complejas con especificaciones detalladas

### Capas de mejora (Enhancement Layers)
```
Foundation: Subject + Action + Style + Context
+ Visual Layer: iluminación específica, paleta de color, composición
+ Technical Layer: cámara, lente, marcadores de calidad
+ Atmospheric Layer: mood, tono emocional, narrativa
```

### Evitar prompts negativos
FLUX NO usa negative prompts. En su lugar:
- En vez de "no crowds" → "peaceful solitude"
- En vez de "without glasses" → "clear, unobstructed eyes"
- Pregunta: "Si eso NO estuviera, ¿qué vería en su lugar?"

### Quick Templates
```
Portrait: [Descripción sujeto], [pose/expresión], [estilo], [iluminación], [fondo]
Product: [Detalles producto], [colocación], [setup iluminación], [estilo], [mood]
Landscape: [Ubicación], [hora/clima], [ángulo cámara], [estilo], [atmósfera]
Architecture: [Edificio], [perspectiva], [iluminación], [estilo], [mood]
```

### Texto en imágenes
- Comillas: "The text 'OPEN' appears in red neon letters above the door"
- Placement: dónde aparece el texto respecto a otros elementos
- Estilo: "elegant serif typography", "bold industrial lettering", "handwritten script"
- Tamaño: "large headline text", "small body copy", "medium subheading"
- Color hex: "The logo text 'ACME' in color #FF5733"

### Colores HEX
Sintaxis: `The vase has color #02eb3c` o `The background is hex #1a1a2e`
Gradientes: "starting with color #02eb3c and finishing with color #edfa3c"
En JSON: `"color_palette": ["#E91E63", "#9C27B0", "#673AB7"]`

### JSON Structured Prompting (avanzado)
```json
{
  "scene": "descripción general",
  "subjects": [
    {
      "description": "descripción detallada",
      "position": "dónde en el frame",
      "action": "qué hace",
      "color_palette": ["colores"]
    }
  ],
  "style": "estilo artístico",
  "color_palette": ["#hex1", "#hex2"],
  "lighting": "descripción iluminación",
  "mood": "tono emocional",
  "background": "detalles fondo",
  "composition": "encuadre y layout",
  "camera": {
    "angle": "ángulo",
    "lens": "tipo lente",
    "depth_of_field": "comportamiento foco"
  }
}
```

### Ratios de aspecto oficiales
| Ratio | Uso | Dimensiones ejemplo |
|-------|-----|-------------------|
| 1:1 | Social media, productos | 1024×1024, 1536×1536 |
| 16:9 | Paisajes, cine | 1920×1080, 1536×864 |
| 9:16 | Móvil, retratos | 1080×1920, 864×1536 |
| 4:3 | Revistas, presentaciones | 1536×1152, 1024×768 |
| 21:9 | Panoramas | 2048×864 |

Límites: Mínimo 64×64, máximo 4MP (ej: 2048×2048). Dimensiones múltiplo de 16.

### Estilos fotorrealistas
| Estilo | Descriptores clave |
|--------|-------------------|
| Digital moderno | "shot on Sony A7IV, clean sharp, high dynamic range" |
| Digicam 2000s | "early digital camera, slight noise, flash photography, candid" |
| Vintage 80s | "film grain, warm color cast, soft focus, 80s vintage photo" |
| Film analógico | "shot on Kodak Portra 400, natural grain, organic colors" |

### Fotografía profesional (avanzado)
- **Apertura (f-number):** f/1.4 = fondo borroso, f/8 = todo nítido
- **Focal length (mm):** 24mm = gran angular, 85mm = retrato zoom
- **Iluminación:** "Rembrandt lighting" = dramático, "golden hour" = cálido
- Ejemplo: "Professional headshot, 85mm lens, f/2.8, Rembrandt lighting, corporate setting"

### Multi-idioma
FLUX entiende múltiples idiomas. Inglés da mejores resultados generales, pero idiomas nativos dan resultados más culturalmente auténticos.

### Prompt Upsampling
Parámetro `prompt_upsampling` (en API) que mejora automáticamente tu prompt. Útil para:
- Iteraciones rápidas sin escribir prompts detallados
- Explorar variaciones creativas

### Comic Strips / Sequential Art
Para consistencia en múltiples paneles: **definir el personaje en detalle y mantener esa descripción idéntica entre paneles**.

---

## 11. Guía Kontext — Tips de edición (fuente: Replicate blog + BFL)

### Principios clave de Kontext:
1. **Edición iterativa robusta:** Puedes editar → descargar → re-subir → editar de nuevo. La consistencia se mantiene.
2. **Preservación de identidad:** El mismo personaje se mantiene a través de múltiples ediciones de escena, pose, ropa.
3. **Supera a modelos cerrados:** Mejor que GPT-4o/gpt-image-1 de OpenAI en benchmarks independientes (KontextBench).

### Categorías de edición:
1. **Edición local:** Cambiar un elemento específico (expresión, accesorio, color de un objeto)
2. **Edición global:** Cambiar estilo, fondo, iluminación de toda la imagen
3. **Referencia de personaje:** Mantener identidad del personaje en nuevas escenas
4. **Referencia de estilo:** Aplicar el estilo de una imagen a otra
5. **Edición de texto:** Modificar texto existente en la imagen

### Errores comunes y soluciones:
| Error | Solución |
|-------|----------|
| "Transform the person into Viking" → cambia identidad | "Change the clothing to Viking armor" → mantiene identidad |
| "Put on beach" → sujeto se mueve | "Change background to beach while keeping exact same position" |
| Cambios múltiples a la vez | Dividir en pasos: primero ropa, luego fondo, luego expresión |
| Usar pronombres "it", "the character" | Nombrar explícitamente: "the orange tabby kitten" |

### Templates de edición para Dame un Ok:
```
# Cambiar emoción (mantener personaje)
"Change the expression of the orange tabby kitten to look sad with tears, droopy ears, while keeping the same character, same fur color, same proportions, same art style"

# Cambiar fondo (mantener sujeto)
"Change the background to a soft pastel blue gradient while keeping the orange tabby kitten in the exact same position, same size, same pose, same expression"

# Añadir accesorio
"Add a small golden crown on top of the orange tabby kitten's head, keeping everything else exactly the same"

# Cambiar a vista de app
"Place this character inside a smartphone screen mockup, showing it as a mobile app interface with rounded buttons below"
```

---

*Documento creado el 31 de enero de 2026. Fuentes: docs.bfl.ai, arxiv.org/abs/2506.15742, replicate.com/blog/flux-kontext, huggingface.co/black-forest-labs. Actualizar cuando haya nuevos modelos o herramientas.*
