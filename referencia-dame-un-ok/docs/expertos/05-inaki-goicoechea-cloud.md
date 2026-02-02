# ☁️ Iñaki Goicoechea — Arquitecto Cloud & Backend

## Área de Conocimiento
Firebase, GCP, serverless, cron jobs, escalabilidad, uptime, infraestructura UE, MQTT brokers.

## Aplicación al Proyecto

### Infraestructura crítica
- **Cron jobs del protocolo de fallo:** Uptime >99.9%. Si el servidor cae y no detecta un check-in perdido, falla la promesa core del producto.
- **MQTT Broker:** Para dispositivos IoT. Opciones: EMQX Cloud (UE), HiveMQ Cloud, o self-hosted Mosquitto en Cloud Run.
- **Multi-canal de notificación:** Push + Email + SMS + Impresora. Si falla uno, los otros cubren.
- **Redundancia:** Multi-región UE (Frankfurt + Madrid). Disaster recovery <1h.

### Nuevos servicios para IoT
- Device Management Service (registro, auth, OTA)
- MQTT Broker con autenticación por token
- Print Queue Service (cola de mensajes para impresoras)
- SMS Gateway Adapter (Twilio webhook handler)
- Device Status Monitoring (batería, conectividad, último contacto)

### Costes estimados (IoT adicional)
| Servicio | Coste/mes (10K dispositivos) |
|---|---|
| MQTT Broker (managed) | ~50€ |
| SMS Gateway (Twilio) | Variable (~0.03€/SMS) |
| Cloud Functions adicionales | ~20€ |
| Almacenamiento device data | ~5€ |
