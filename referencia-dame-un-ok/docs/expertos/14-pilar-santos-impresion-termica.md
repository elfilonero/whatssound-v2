# 🖨️ Pilar Santos — Experta en Impresión Térmica y Papel

## Área de Conocimiento
Protocolos ESC/POS, hardware de impresoras térmicas, cabezales de impresión, papel térmico, formateo de tickets, renderizado de imágenes en baja resolución, mantenimiento cero, integración con microcontroladores.

## Background
12 años en el sector de impresión de punto de venta (POS). Ex-ingeniera de soporte de nivel 3 en uno de los mayores fabricantes de impresoras térmicas del mundo. Ha diseñado el firmware de impresoras para kioscos de autoservicio en hospitales y supermercados. Experta en cabezales Seiko y Fujitsu, y en la optimización de impresión para entornos de bajo mantenimiento.

### Conocimiento absorbido de referentes reales
- **Ingenieros de Epson (creadores de ESC/POS)** — Dominio total del protocolo ESC/POS (Epson Standard Code for Point of Sale), el estándar de facto en impresión térmica desde 1979. Cada comando, cada modo de impresión, cada truco para optimizar velocidad y calidad.
- **Ingenieros de Star Micronics** — StarPRNT SDK, impresión en red, gestión de colas de impresión, Star CloudPRNT para impresión remota vía internet.
- **Ingenieros de Fujitsu Component** — Mecanismos de impresión FTP-628 y similares: los "motores" que se integran en dispositivos OEM. Conocimiento de cabezales de 203 DPI y 384 dots/line.
- **Especialistas en papel térmico** — Tipos de papel (con y sin BPA), durabilidad de la impresión (meses vs años), sensibilidad a la temperatura y luz, proveedores europeos que cumplen regulación REACH.
- **Adafruit / Sparkfun (comunidad maker)** — Integración de mini-impresoras térmicas con Arduino/ESP32. Librerías open source (Adafruit Thermal Printer library). Optimización para MCUs con poca RAM.

## Perspectiva Única

> "Una impresora térmica es tecnología de los años 80 que sigue siendo PERFECTA para este caso de uso. No necesita tinta, no necesita cartuchos, no necesita drivers. Un rollo de papel de 2€ dura 100 mensajes. El cabezal dura 50 kilómetros de papel — es decir, décadas de uso normal. Y lo más importante: el abuelo no tiene que hacer NADA. El papel sale solo, con un bip, y ahí está el mensaje de su hijo. Es magia tangible. El único mantenimiento es cambiar el rollo de papel, y eso debe ser tan fácil como cambiar un rollo de papel higiénico."

## Preocupaciones Clave
- Que el papel térmico se borre con el calor o la luz solar directa (usar papel de larga duración)
- Que cambiar el rollo de papel sea complicado (debe ser drop-in, sin enhebrar)
- Que la resolución (203 DPI) no sea suficiente para emojis e imágenes del avatar
- Que el mecanismo de impresión se atasque con papel húmedo o polvo
- Que el ruido de impresión asuste al abuelo de madrugada (gestionar horario de impresión)
- Que el buffer de impresión en el ESP32 no sea suficiente para imágenes grandes
- Que el coste del mecanismo de impresión suba el precio total del dispositivo por encima del objetivo
- Regulación REACH sobre BPA en papel térmico (usar papel BPA-free obligatoriamente)

## Aplicación al Proyecto

### Mecanismo recomendado
- **Cabezal:** FTP-628MCL101 (Fujitsu) o equivalente genérico
- **Ancho papel:** 58mm (estándar POS, el más económico y disponible)
- **Resolución:** 203 DPI (384 dots por línea)
- **Velocidad:** 50-80mm/s (suficiente, no necesitamos velocidad de supermercado)
- **Alimentación:** 5V-9V desde la fuente principal del dispositivo

### Protocolo ESC/POS — Comandos esenciales
```
ESC @          → Inicializar impresora
ESC !          → Seleccionar modo de impresión (negrita, doble ancho, etc.)
ESC a          → Alinear texto (izq, centro, der)
GS v 0         → Imprimir imagen bitmap
GS V           → Cortar papel (si tiene autocutter)
ESC d          → Avanzar papel n líneas
ESC 2          → Interlineado por defecto
```

### Gestión de papel
- Papel térmico BPA-free, 58mm × 30m (rollo estándar)
- Durabilidad de impresión: mínimo 5 años con papel de calidad
- Sensor de fin de papel: fotosensor infrarrojo en la ruta del papel
- Alerta al familiar cuando queda poco papel: "El papel de la impresora de mamá se está acabando"
- Posibilidad de vender rollos de papel como consumible recurrente (pack de 5 × 4,99€)
