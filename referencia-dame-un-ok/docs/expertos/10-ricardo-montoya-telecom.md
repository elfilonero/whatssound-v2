# 📡 Ricardo Montoya — Especialista en Telecomunicaciones Legacy

## Área de Conocimiento
Redes 2G/3G/4G, SMS gateway, USSD, feature phones, AT commands, SIM M2M/IoT, integración con operadoras.

## Aplicación al Proyecto

### Feature phones: cómo llegar al abuelo sin smartphone
- **SMS check-in:** El usuario envía "OK" a un número corto → gateway lo recibe → backend registra check-in
- **USSD check-in:** El usuario marca *123# → menú interactivo → pulsa "1" → check-in registrado
- **Tecla dedicada:** Acuerdo con fabricante de feature phones para preconfigurar una tecla

### SMS Gateway: opciones
| Proveedor | Coste SMS España | Número corto | USSD |
|---|---|---|---|
| Twilio | 0,04€/SMS | Sí (largo) | No |
| Vonage | 0,035€/SMS | Sí (largo) | No |
| Operadora directa | 0,01-0,02€/SMS | Sí (corto) | Sí |

**Recomendación:** Empezar con Twilio (rápido de implementar), migrar a acuerdo directo con operadora cuando haya volumen (>10.000 SMS/mes).

### USSD: el canal olvidado
- Funciona en CUALQUIER teléfono (incluidos los de 2005)
- No necesita internet ni datos
- Sesión interactiva en tiempo real
- Requiere acuerdo con operadora (Movistar, Vodafone, Orange)
- Coste por sesión: ~0,005€
- Limitación: timeout de sesión ~120s

### SIM IoT para dispositivos con celular
- SIM M2M multi-operador (1nce, Hologram, Soracom)
- Coste: ~1€/mes por SIM con 500KB datos
- Ideal para: botón con módulo celular (pueblos sin WiFi)
- Protocolo: NB-IoT o LTE-M (bajo consumo, buena penetración indoor)

### Sunset 2G/3G: planificación
- España: 2G apagado previsto ~2030, 3G ~2028
- Recomendación: diseñar dispositivos celulares con LTE-M/NB-IoT desde el inicio
- Feature phones 4G (KaiOS) como alternativa a los Nokia 2G clásicos
