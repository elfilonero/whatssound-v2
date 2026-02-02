# 🎯 Recomendaciones WhatsSound — SUPEREXPERTO #5: MobileSmith

## Stack Mobile Recomendado

```
Framework:     Expo SDK 52+ (managed workflow)
Navigation:    Expo Router v4 (file-based)
Audio:         react-native-track-player (RNTP)
Animaciones:   react-native-reanimated + moti
Listas:        @shopify/flash-list
State:         Zustand + React Query
Builds:        EAS Build + EAS Submit
Notifications: expo-notifications
```

---

## 1. Estructura de Navegación

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator
│   ├── index.tsx            # Feed (Home)
│   ├── explore.tsx          # Explorar/Buscar
│   ├── create.tsx           # Subir canción
│   └── profile.tsx          # Mi perfil
├── song/
│   └── [id].tsx             # Detalle canción (deep linkable)
├── artist/
│   └── [id].tsx             # Perfil artista
├── player.tsx               # Modal player (full screen)
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
└── _layout.tsx              # Root layout
```

**¿Por qué Expo Router?**
- Deep linking automático: `whatssound://song/abc123`
- SEO en web (si se expande)
- File-based = menos boilerplate
- Typed routes con TypeScript

---

## 2. Audio Player con RNTP

```typescript
// services/audio-service.ts
import TrackPlayer, { Capability, Event } from 'react-native-track-player';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer({
    maxCacheSize: 1024 * 50, // 50MB cache
  });

  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
    // Notification en lock screen
    notificationCapabilities: [Capability.Play, Capability.Pause],
  });
}

// Añadir canción a la cola
export async function playSong(song: Song) {
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: song.id,
    url: song.audioUrl,
    title: song.title,
    artist: song.artistName,
    artwork: song.coverUrl,
    duration: song.duration,
  });
  await TrackPlayer.play();
}

// Hook para UI del player
export function usePlayerState() {
  const { position, duration } = useProgress();
  const { state: playbackState } = usePlaybackState();
  const activeTrack = useActiveTrack();

  return { position, duration, playbackState, activeTrack };
}
```

**¿Por qué RNTP y no expo-av?**
- Background playback nativo (lock screen, notificación)
- Cola de reproducción built-in
- Media controls (Bluetooth, CarPlay, Android Auto)
- Adaptive bitrate streaming (HLS/DASH)
- Caching de audio
- expo-av es para audio simple; RNTP es para music apps

---

## 3. Animaciones

### Waveform animado (Reanimated)

```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';

function WaveformBar({ index, isPlaying }: { index: number; isPlaying: boolean }) {
  const height = useSharedValue(10);

  useEffect(() => {
    if (isPlaying) {
      height.value = withRepeat(
        withTiming(30 + Math.random() * 20, { duration: 300 + index * 50 }),
        -1, // infinite
        true  // reverse
      );
    } else {
      height.value = withTiming(10);
    }
  }, [isPlaying]);

  const style = useAnimatedStyle(() => ({
    height: height.value,
    width: 3,
    backgroundColor: '#1DB954',
    borderRadius: 2,
    marginHorizontal: 1,
  }));

  return <Animated.View style={style} />;
}
```

### Transición de mini-player a full-player (Moti)

```typescript
import { MotiView } from 'moti';

function MiniPlayer({ onExpand }) {
  return (
    <MotiView
      from={{ translateY: 100 }}
      animate={{ translateY: 0 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <Pressable onPress={onExpand}>
        {/* Mini player content */}
      </Pressable>
    </MotiView>
  );
}
```

---

## 4. Lista de Canciones Performante

```typescript
import { FlashList } from '@shopify/flash-list';

function SongFeed({ songs }) {
  return (
    <FlashList
      data={songs}
      renderItem={({ item }) => <SongCard song={item} />}
      estimatedItemSize={80}
      keyExtractor={(item) => item.id}
      // Prefetch de audio para siguiente canción
      onViewableItemsChanged={prefetchNextSong}
    />
  );
}
```

---

## 5. Push Notifications

```typescript
// Configurar en app startup
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Tipos de notificación WhatsSound:
// - "new_tip": Alguien te envió propina
// - "new_follower": Nuevo seguidor
// - "new_song": Artista que sigues publicó canción
// - "live_now": Artista en vivo
```

---

## 6. EAS Build Configuration

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "..." },
      "android": { "serviceAccountKeyPath": "./google-sa.json" }
    }
  }
}
```

---

## 7. Consideraciones Clave

### Performance
- **Hermes** habilitado por defecto (Expo SDK 50+)
- **New Architecture** activar cuando RNTP lo soporte completamente
- **Image caching** con `expo-image` (no `<Image>` de RN)
- **Avoid re-renders** con `memo` + `useCallback` en listas

### Audio-específico
- Pedir permiso de **background audio** en `app.json`:
  ```json
  { "ios": { "infoPlist": { "UIBackgroundModes": ["audio"] } } }
  ```
- Android: foreground service automático con RNTP
- Precarga del siguiente track para reproducción sin gaps

---

## Prioridades de Implementación

1. **Semana 1:** Expo Router setup + navegación base + auth flow
2. **Semana 2:** RNTP integración + player (mini + full)
3. **Semana 3:** Feed con FlashList + animaciones + búsqueda
4. **Semana 4:** Notifications + EAS Build pipeline + testing en devices
