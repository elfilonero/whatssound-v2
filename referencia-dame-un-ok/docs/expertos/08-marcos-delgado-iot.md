# 🔧 Marcos Delgado — Ingeniero IoT / Hardware

## Área de Conocimiento
Diseño de dispositivos IoT, protocolos (WiFi, BLE, Zigbee, MQTT), fabricación CNC, producción en serie, certificación CE/FCC.

## Aplicación al Proyecto

### Familia de dispositivos a diseñar
1. **Botón WiFi standalone** — ESP32-C3, carcasa ABS/CNC, IP54, batería CR2477 o USB-C
2. **Botón empotrable** — Perfil bajo, alimentación por cable oculto, acabado premium
3. **Mando TV+OK** — ESP32-C3 + IR LED, doble función, 2xAAA
4. **Add-on BLE** — nRF52840, ultra-compacto, CR2032, adhesivo

### Proceso de fabricación (Vertex)
```
Diseño CAD → Prototipo CNC (2-3 días) → Test funcional → Ajustes
→ Molde inyección (si volumen >5.000) o CNC serie corta
→ Ensamblaje PCB (pick & place) → Programación firmware
→ Test QC → Packaging → Envío
```

### Bill of Materials estimado (Botón WiFi)
| Componente | Coste unitario |
|---|---|
| ESP32-C3 module | 1,80€ |
| Pulsador 30mm | 0,30€ |
| LED RGB | 0,10€ |
| Buzzer | 0,15€ |
| Batería CR2477 | 0,50€ |
| PCB | 0,40€ |
| Carcasa ABS | 1,20€ |
| Componentes pasivos | 0,30€ |
| Ensamblaje | 0,80€ |
| **Total** | **~5,55€** |

### Certificaciones necesarias
- CE (obligatorio UE) — ~3.000-5.000€ por producto
- RoHS (obligatorio UE)
- WEEE (registro de residuos electrónicos)
- WiFi Alliance (opcional pero recomendado)
