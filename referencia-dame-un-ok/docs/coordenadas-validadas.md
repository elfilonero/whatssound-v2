# Coordenadas Validadas — Dame un OK

## Ventana 1: Principal / Esperando (VALIDADA ✅)
Captura: `capturas/validadas/01-ventana-principal-esperando.png`

### Elementos y coordenadas

| Elemento | Propiedad | Valor |
|----------|-----------|-------|
| **Nombre mascota** | Texto | "Fufy" |
| | Fuente | 40px, weight 900 |
| | Color | #2d3436 |
| | Margen inferior (al círculo) | 20px |
| | Letter-spacing | 1px |
| **Círculo avatar** | Diámetro | 200px |
| | Borde | 5px solid white |
| | Sombra | 0 4px 16px rgba(0,0,0,0.08) |
| | Fondo interior | /avatars/fondo-suelo-dia.jpg (object-fit: cover) |
| **Gato (imagen)** | Ancho | 105% del círculo |
| | Posición vertical | bottom: -32% |
| | Centrado horizontal | left: 50% + translateX(-50%) |
| | Sombra | drop-shadow(0 3px 8px rgba(0,0,0,0.18)) |
| | zIndex | 5 |
| **Texto estado** | Texto | "¿Jugamos?" (sin emoji) |
| | Fuente | 38px, weight 700 |
| | Color | #555 |
| | Margen superior (del círculo) | 48px |
| **Fondo pantalla** | Gradiente | linear-gradient(180deg, #c0dece 0%, #cfe8d8 25%, #d8eddf 50%, #cfe8d8 100%) |
| **Blobs decorativos** | Color | rgba(190,225,205, 0.35-0.5) |
| **Header** | Título | "Dame un Ok", 21px, weight 800 |
| **Badge racha** | Fondo | rgba(220,240,225,0.85), border-radius 25 |
| **Botones acción** | 3 columnas grid, gap 10px, border-radius 18 |
| | Alimentar | gradiente #f5b842 → #e89a2e |
| | Mimar | gradiente #f08898 → #e06878 |
| | Jugar | gradiente #5a9ee0 → #4080c8 |
| | Icono | SVG 36x36 blanco |
| | Texto | 16px, weight 700, blanco |

### Layout general
- Viewport: 100dvh, flex column
- Zona central: flex: 1, justify-content: center, align-items: center
- Botones: padding bottom 32px

---

## Lista de ventanas pendientes

### Ventana 2: Contento (después de alimentar)
- **Gato**: misi-contento.png → gato feliz comiendo/satisfecho
- **Fondo círculo**: fondo-suelo-dia.jpg (mismo)
- **Texto estado**: "¡Estoy genial!" (acorde a imagen contento)
- **Botón Alimentar**: cambia a gris (completado, icono check)
- **Elementos nuevos**: ninguno, mismas coordenadas

### Ventana 3: Eufórico (los 3 botones completados)
- **Gato**: misi-euforico.png → gato super feliz
- **Fondo círculo**: fondo-suelo-dia.jpg
- **Texto estado**: "¡Te quiero!" (acorde a imagen eufórico)
- **Botones**: los 3 en gris (completados)
- **Elementos nuevos**: ninguno, mismas coordenadas

### Ventana 4: Dormido (noche)
- **Gato**: misi-dormido.png → gato durmiendo
- **Fondo círculo**: fondo-suelo-noche.jpg
- **Fondo pantalla**: gradiente nocturno (azul oscuro/morado)
- **Texto estado**: "Zzz..." o "Buenas noches"
- **Elementos nuevos**: fondo nocturno, posible luna/estrellas

### Ventana 5: Triste (3h sin interacción)
- **Gato**: misi-triste.png → gato triste
- **Fondo círculo**: fondo-suelo-dia.jpg
- **Texto estado**: "Te echo de menos..." (acorde a imagen triste)
- **Elementos nuevos**: ninguno, mismas coordenadas

### Ventana 6: Enfermo (6h sin interacción)
- **Gato**: misi-enfermo.png → gato enfermo
- **Fondo círculo**: fondo-suelo-enfermo.jpg
- **Fondo pantalla**: gradiente apagado/grisáceo
- **Texto estado**: "No me encuentro bien..." (acorde a imagen enfermo)
- **Elementos nuevos**: fondo enfermo diferente

### Ventana 7: Alarma / Check-in (pantalla actual AlarmScreen)
- Ya existe y funciona (el "¡Estoy aquí!" verde)
- Pendiente: ajustar con mismas coordenadas de gato/círculo

### Ventana 8: Dashboard familiar
- Pantalla nueva: vista del familiar que monitoriza
- **Elementos nuevos**: tabs, estado del avatar del ser querido, historial
