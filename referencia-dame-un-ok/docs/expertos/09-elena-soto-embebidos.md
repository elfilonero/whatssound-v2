# ⚡ Elena Soto — Ingeniera de Electrónica Embebida

## Área de Conocimiento
Microcontroladores (ESP32, nRF52/53), firmware C/C++, bajo consumo, impresoras térmicas (ESC/POS), OTA updates, integración APIs cloud.

## Aplicación al Proyecto

### Firmware del botón WiFi
```c
// Ciclo de vida simplificado
void setup() {
  init_hardware();          // GPIO, LED, buzzer
  load_credentials();       // WiFi SSID/pass + device token (desde NVS)
}

void on_button_press() {
  led_blue();               // Conectando...
  wifi_connect();           // ~1.5s
  mqtt_publish_checkin();   // ~0.5s
  wait_for_ack();           // ~0.5s
  led_green();              // ¡OK!
  buzzer_beep();
  deep_sleep();             // Hasta próxima pulsación
}
```

### Optimización de consumo
- Deep sleep con wake on GPIO (botón): <10μA
- Transmisión WiFi: ~120mA durante ~3s
- Con CR2477 (1000mAh): ~6 meses con 1 check-in/día + overhead
- Truco: No hacer DHCP cada vez — IP estática reduce conexión de 1.5s a 0.8s

### Impresora térmica
- Protocolo ESC/POS sobre serial (UART)
- Cabezal de 58mm, 384 dots/línea
- Buffer circular para mensajes offline
- Renderizado de emoji como bitmap (lookup table en flash)
- Detección de papel: sensor óptico en el mecanismo

### OTA Updates
- Partición dual (A/B) en ESP32 para rollback seguro
- Verificación de firma Ed25519 antes de aplicar
- Trigger: comando MQTT en topic ok/{device_id}/command
- Descarga por HTTPS desde CDN (no por MQTT — demasiado lento)
