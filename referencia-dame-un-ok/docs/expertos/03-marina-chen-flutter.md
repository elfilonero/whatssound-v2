# 📱 Marina Chen — Ingeniera Mobile Senior (Flutter)

## Área de Conocimiento
Desarrollo Flutter, arquitectura mobile, Firebase, notificaciones push, background tasks, compatibilidad multi-fabricante.

## Aplicación al Proyecto

### Retos técnicos principales
- **Push notifications fiables:** El 95% del trabajo técnico. Cada fabricante Android (Xiaomi, Huawei, Samsung) mata apps en background de forma diferente. Hay que gestionar exclusiones de batería por marca.
- **Critical Alerts (iOS):** Necesario entitlement especial de Apple para sonido alto incluso en silencio. Requiere justificación en App Store review.
- **Integración IoT desde la app:** BLE pairing con dispositivos, configuración WiFi del ESP32 vía BLE provisioning.
- **Offline handling:** Si no hay internet, el check-in debe guardarse y enviarse al reconectar.
- **Widget:** Check-in sin abrir la app (iOS WidgetKit, Android App Widget).

### Arquitectura mobile recomendada
- Clean Architecture con BLoC/Riverpod
- Repository pattern para abstracción de data source (REST/MQTT/local)
- BLE service layer para comunicación con dispositivos
- Background service para recepción MQTT (mensajes de impresora, comandos)
