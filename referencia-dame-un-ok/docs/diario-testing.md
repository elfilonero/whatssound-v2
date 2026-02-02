# 🧪 Diario de Testing — Dame un Ok

---

## Plantilla de Entrada

```
### Test #[número] — [fecha]

**Componente:** [App / Backend / Botón WiFi / Impresora / SMS Gateway / ...]
**Tipo:** [Unitario / Integración / E2E / Manual / Hardware]
**Ejecutado por:** [Nombre]
**Entorno:** [Local / Staging / Producción / Prototipo físico]

#### Objetivo
[Qué se está probando y por qué]

#### Precondiciones
- [Lista de requisitos previos]

#### Pasos
1. [Paso 1]
2. [Paso 2]
3. [...]

#### Resultado esperado
[Qué debería pasar]

#### Resultado real
[Qué pasó realmente]

#### Estado: ✅ PASS / ❌ FAIL / ⚠️ PARCIAL

#### Notas
[Observaciones, bugs encontrados, capturas, logs relevantes]

#### Acciones
- [ ] [Acción correctiva si FAIL]
```

---

## Áreas de Testing por Componente

### 📱 App Móvil (Flutter)
- [ ] Onboarding completo (registro → hora límite → contactos)
- [ ] Check-in: pulsación del botón → feedback visual/háptico
- [ ] Push notification recibida a la hora configurada
- [ ] Protocolo de fallo: alerta al usuario tras hora límite
- [ ] Protocolo de fallo: email a contactos tras T+3h
- [ ] Historial de check-ins (calendario)
- [ ] Configuración: cambio de hora límite
- [ ] Accesibilidad: contraste, tamaño de botones, VoiceOver/TalkBack
- [ ] Modo oscuro
- [ ] Offline handling

### ☁️ Backend
- [ ] Cron job de verificación de check-ins (fiabilidad)
- [ ] Envío de email de alerta (formato, contenido)
- [ ] Envío de SMS de alerta (Premium)
- [ ] API REST: endpoint de check-in
- [ ] MQTT broker: recepción de check-in
- [ ] Registro de dispositivos
- [ ] Autenticación de dispositivos (tokens)
- [ ] Rate limiting

### 🔴 Botón WiFi (ESP32)
- [ ] Configuración WiFi inicial (modo AP)
- [ ] Pulsación → wake → conexión WiFi → MQTT publish
- [ ] Latencia total (objetivo: <3s)
- [ ] Consumo en deep sleep (objetivo: <10μA)
- [ ] Autonomía con batería CR2477
- [ ] Reconexión tras corte de WiFi
- [ ] Factory reset (10s)
- [ ] OTA update
- [ ] LED de confirmación
- [ ] Buzzer de confirmación

### 🖨️ Impresora Térmica
- [ ] Recepción de mensaje vía MQTT
- [ ] Impresión de texto (encoding, acentos, ñ)
- [ ] Impresión de imágenes (dithering)
- [ ] Detección de papel agotado
- [ ] Buzzer de nuevo mensaje
- [ ] Botón de check-in integrado

### 📞 SMS/USSD
- [ ] Envío de SMS recordatorio
- [ ] Recepción de SMS "OK" → check-in registrado
- [ ] Variantes aceptadas: "ok", "OK", "Ok", "1", "si", "SI"
- [ ] SMS de confirmación al usuario
- [ ] USSD: menú funcional
- [ ] Identificación de usuario por número de teléfono

---

## Registro de Tests

*(Añadir entradas según se ejecuten tests)*

---

*Plantilla creada el 31/01/2026. Actualizar con cada ciclo de testing.*
