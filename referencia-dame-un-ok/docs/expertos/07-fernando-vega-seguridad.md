# 🛡️ Dr. Fernando Vega — Seguridad y Criptografía

## Área de Conocimiento
Ciberseguridad, encriptación, seguridad IoT, pentesting, datos médicos/bienestar.

## Aplicación al Proyecto

### Riesgos de seguridad IoT
- **Dispositivos como vector de ataque:** Un botón WiFi hackeado podría enviar check-ins falsos (el sistema cree que el abuelo está bien cuando no lo está). Consecuencias potencialmente fatales.
- **Firmware tampering:** Si alguien modifica el firmware del dispositivo, podría interceptar datos o desactivar el check-in.
- **MQTT sin auth:** Si el broker MQTT no tiene autenticación robusta, cualquiera puede publicar check-ins falsos.
- **Impresora como printer de spam:** Sin auth, alguien podría enviar mensajes no deseados a la impresora del abuelo.

### Medidas obligatorias
1. Token único por dispositivo, almacenado en flash encriptada (ESP32 eFuse)
2. Firmware firmado (Ed25519), verificación antes de OTA
3. MQTT con TLS + autenticación por certificado cliente
4. Rate limiting en todos los endpoints
5. Logs de auditoría de todos los check-ins (quién, cuándo, desde qué dispositivo)
6. Rotación de tokens cada 90 días
7. Penetration testing antes de lanzar hardware
