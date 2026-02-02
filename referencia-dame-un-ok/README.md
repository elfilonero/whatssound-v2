![CI](https://github.com/cursor-ai-downloads/dame-un-ok/actions/workflows/ci.yml/badge.svg)

# 🐱 Dame un Ok

**Tu tranquilidad diaria, un toque a la vez**

App de seguridad pasiva tipo Tamagotchi virtual. Cuida a tu mascota virtual cada día — si no la alimentas, tus familiares reciben alertas escalonadas.

## 🎯 Concepto

- El usuario cuida un avatar (gato, perro, planta) cada día con 3 acciones: Alimentar, Mimar, Jugar
- Si no interactúa, se activa un protocolo de alerta escalonado:
  - **1h** → Alerta amarilla (push notification)
  - **3h** → Alerta roja (push + SMS + contactos de emergencia)
  - **6h+** → Emergencia (push + SMS + email + llamada IVR)

## 🏗️ Arquitectura

```
src/
├── lib/
│   ├── types/          # TypeScript types
│   ├── constants/      # Theme, pets, alerts config
│   ├── devices/        # Device adapters (multi-plataforma)
│   ├── services/       # Supabase, check-in, alerts, notifications
│   └── hooks/          # React hooks
├── components/
│   ├── ui/             # Reusable UI (Card, Badge, Avatar, TabBar, Icons)
│   ├── user/           # User screens
│   ├── alarm/          # Alarm screen
│   └── familiar/       # Family dashboard (tabs)
└── app/                # Next.js pages
```

## 📱 Dispositivos soportados (roadmap)

| Dispositivo | Estado | Descripción |
|-------------|--------|-------------|
| Smartphone | ✅ MVP | App web responsive |
| Smart TV | 🔲 Planned | HbbTV/WebOS/Tizen overlay |
| Botón IoT | 🔲 Planned | ESP32 WiFi/BLE |
| Pantalla IoT | 🔲 Planned | OLED + LED strip |
| Asistente voz | 🔲 Planned | Alexa / Google Home |
| SMS/IVR | 🔲 Planned | Twilio fallback |

## 🛠️ Stack

- **Frontend:** Next.js 14 + TypeScript + Nunito font
- **Backend:** Supabase (Auth + DB + Realtime + Edge Functions)
- **IoT:** MQTT (planned)
- **Notifications:** Web Push + Twilio SMS/Voice (planned)

## 🚀 Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Build de producción
```

## 📄 Licencia

Propiedad de Vertex Developer. Todos los derechos reservados.
