# Recomendaciones Concretas para WhatsSound
## Del Superexperto Arquitecto Frontend

---

## 🎯 Decisiones de Arquitectura Definitivas

### 1. Stack Tecnológico

```
React Native 0.83+ (New Architecture)
├── Expo SDK 52+ (managed workflow con Expo Modules API)
├── Expo Router v4 (file-based navigation)
├── TypeScript 5.x (strict mode)
├── Zustand (client state)
├── TanStack Query v5 (server state)
├── Unistyles o Nativewind v4 (styling)
├── Reanimated 4 (animaciones)
├── react-native-track-player (audio)
├── Socket.io-client (real-time)
├── FlashList (listas virtualizadas)
├── MMKV (storage local rápido)
└── EAS Build + EAS Update (CI/CD + OTA)
```

### 2. Estructura del Proyecto

```
app/                           # Expo Router (file-based)
├── (tabs)/
│   ├── chats/
│   │   ├── index.tsx          # Lista de conversaciones
│   │   └── [chatId].tsx       # Conversación individual
│   ├── discover/
│   │   ├── index.tsx          # Feed musical
│   │   └── [trackId].tsx      # Detalle de track
│   ├── library/
│   │   └── index.tsx          # Mi biblioteca
│   └── profile/
│       └── index.tsx          # Perfil
├── player/
│   └── [trackId].tsx          # Player fullscreen (modal)
├── _layout.tsx                # Root layout + providers
└── +not-found.tsx

src/
├── components/                # Design system (ver design-systems.md)
├── stores/                    # Zustand stores
│   ├── usePlayerStore.ts
│   ├── useAuthStore.ts
│   ├── useUIStore.ts
│   └── usePreferencesStore.ts
├── hooks/                     # Custom hooks
│   ├── useMessages.ts         # TanStack Query wrapper
│   ├── useTrack.ts
│   ├── useSocket.ts           # WebSocket connection
│   └── useAudioPlayer.ts     # Bridge store ↔ track-player
├── services/
│   ├── api.ts                 # HTTP client (fetch/axios)
│   ├── socket.ts              # Socket.io setup
│   ├── audio.ts               # Track player service
│   └── notifications.ts      # Push notifications
├── utils/
│   ├── formatTime.ts
│   └── audioHelpers.ts
└── types/
    ├── chat.ts
    ├── track.ts
    └── user.ts
```

### 3. Features Clave y Cómo Implementarlas

#### 🎵 Reproducción de Audio
```
react-native-track-player
├── Background playback ✅
├── Lock screen controls ✅
├── Notification controls ✅
├── Queue management ✅
└── Zustand store sincronizado con player events
```

**Patrón:** El servicio de audio emite eventos → Zustand store se actualiza → UI re-renderiza selectivamente.

#### 💬 Chat en Tiempo Real
```
Socket.io connection
├── Mensajes: emit('message', data) / on('message', handler)
├── Typing: emit('typing', chatId) / on('typing', handler)
├── Presencia: on('presence', handler)
└── Reconexión automática con backoff
```

**Patrón:** Socket.io → Zustand (typing/presencia) + TanStack Query invalidation (mensajes nuevos).

#### 🎤 Mensajes de Audio (core feature)
```
Grabación: expo-av Recording API
├── Visualización waveform durante grabación (Reanimated)
├── Compresión: AAC a 64kbps (buen balance calidad/tamaño)
├── Upload: multipart/form-data al backend
├── Playback: en-chat con mini waveform + progress
└── Cache local con MMKV para audios descargados
```

#### 📱 Mini Player Persistente
```
El mini player vive en _layout.tsx (siempre visible)
├── Absolute positioned en bottom
├── Swipe up → fullscreen player (Reanimated shared transition)
├── Track info + play/pause + progress bar
└── Zustand usePlayerStore alimenta todo
```

### 4. Performance Checklist

- [ ] **FlashList** en vez de FlatList para listas de mensajes y tracks
- [ ] **Reanimated** para todas las animaciones (NO Animated API)
- [ ] **MMKV** en vez de AsyncStorage (10x más rápido)
- [ ] **Hermes** habilitado (default en Expo)
- [ ] **Image caching** con expo-image (no react-native Image)
- [ ] **Lazy loading** de pantallas con React.lazy + Suspense
- [ ] **Memo selectivo** — solo en componentes medidos como lentos
- [ ] **Zustand selectors** — nunca subscribir al store entero
- [ ] **Audio buffer** — precarga siguiente track en cola
- [ ] **Waveform** pre-calculado en backend, no en cliente

### 5. Expo vs Bare: Veredicto

**✅ Expo Managed (con Expo Modules API para nativo)**

Razones:
- EAS Build elimina la necesidad de Xcode/Android Studio local
- EAS Update = OTA updates sin pasar por App Store
- Expo Router = navegación file-based (como Next.js)
- Expo Modules API = escribir código nativo cuando sea necesario
- `react-native-track-player` funciona con Expo dev client
- El "ejecting" ya no existe — Expo es el estándar de facto (RN 0.82+ blog lo confirma)

### 6. Orden de Desarrollo (MVP)

```
Sprint 1 (2 semanas): Foundation
├── Setup Expo + Router + TypeScript
├── Design system base (tokens, primitivos)
├── Auth flow (login/register)
└── Navigation structure

Sprint 2 (2 semanas): Chat
├── Lista de conversaciones
├── Chat screen con mensajes texto
├── WebSocket connection
├── Typing indicators

Sprint 3 (2 semanas): Audio
├── Grabación de audio messages
├── Playback en chat
├── Waveform visualization
└── Upload/download audio

Sprint 4 (2 semanas): Player
├── Track player integration
├── Mini player + fullscreen
├── Cola de reproducción
├── Background playback

Sprint 5 (1 semana): Polish
├── Notificaciones push
├── Offline support (MMKV cache)
├── Performance optimization
└── Testing de integración
```

### 7. Errores a Evitar

1. ❌ **No usar Redux** — overkill para este proyecto, Zustand + TanStack Query cubre todo
2. ❌ **No usar FlatList** — FlashList es estrictamente superior
3. ❌ **No usar AsyncStorage** — MMKV es 10x más rápido
4. ❌ **No usar Animated API** — Reanimated 4 corre en UI thread
5. ❌ **No ejectar de Expo** — Expo Modules API resuelve casos nativos
6. ❌ **No manejar audio con expo-av solo** — react-native-track-player para background
7. ❌ **No calcular waveforms en cliente** — pre-calcular en backend
8. ❌ **No poner todo el estado en un solo store** — separar por dominio

---

## Resumen Ejecutivo

> WhatsSound debe construirse con **Expo + React Native 0.83+**, usando **Zustand** para estado local, **TanStack Query** para datos del servidor, **Socket.io** para real-time, y **react-native-track-player** para audio. La arquitectura es **feature-based** con **file-based routing** (Expo Router). El design system usa **tokens** como primitivos y **Unistyles/Nativewind** para styling. MVP alcanzable en **9 semanas** con un equipo de 2-3 devs.

---

*Generado por: Superexperto #1 — Arquitecto Frontend*  
*Proyecto: WhatsSound — OpenParty*  
*Fecha: Enero 2026*
