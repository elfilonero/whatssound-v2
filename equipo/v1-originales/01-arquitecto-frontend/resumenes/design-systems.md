# Design Systems Escalables
## Análisis para WhatsSound

---

## Principios (Fusión Dalgleish + Browne + Abramov)

> "Design tokens son la API entre diseño y código" — Mark Dalgleish

### 1. Tokens como Fundamento

```typescript
// tokens/colors.ts
export const colors = {
  // Brand
  primary: '#1DB954',      // Verde musical (inspiración Spotify)
  primaryLight: '#1ED760',
  primaryDark: '#1AA34A',
  
  // Semantic
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#282828',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#727272',
  
  // Chat
  bubbleSent: '#1DB954',
  bubbleReceived: '#282828',
  
  // Status
  online: '#1DB954',
  recording: '#FF4444',
  playing: '#1DB954',
} as const

// tokens/spacing.ts
export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const

// tokens/typography.ts
export const typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
} as const
```

### 2. Componentes Headless + Styled

Separar lógica de presentación (filosofía TanStack/Headless):

```
components/
├── primitives/          # Átomos: Text, Box, Pressable, Icon
│   ├── Text.tsx
│   ├── Box.tsx
│   └── Pressable.tsx
├── ui/                  # Moléculas: Button, Input, Avatar, Badge
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Avatar.tsx
│   └── Badge.tsx
├── patterns/            # Organismos: ChatBubble, TrackCard, PlayerBar
│   ├── ChatBubble.tsx
│   ├── TrackCard.tsx
│   ├── PlayerBar.tsx
│   └── AudioWaveform.tsx
└── layouts/             # Templates: ChatLayout, PlayerLayout
    ├── ChatLayout.tsx
    └── PlayerLayout.tsx
```

### 3. Opciones de Styling en RN (2025)

| Herramienta | Enfoque | Tamaño | Ideal para |
|-------------|---------|--------|------------|
| **Nativewind v4** | Tailwind → RN | ~15kb | Prototipado rápido, utilidades |
| **Tamagui** | Universal (RN+Web) | ~30kb | Apps web+mobile simultáneas |
| **Unistyles** | StyleSheet mejorado | ~8kb | Performance-first, temas |
| **StyleSheet nativo** | React Native built-in | 0kb | Control total, sin deps |

**Recomendación WhatsSound:** **Unistyles** o **Nativewind v4**

- **Unistyles:** Mejor performance, theming nativo, breakpoints, media queries. Sin overhead de runtime.
- **Nativewind:** Más familiar si el equipo conoce Tailwind. Buena DX.

### 4. Theming: Dark/Light

```typescript
// themes/index.ts
import { colors } from '../tokens/colors'

export const darkTheme = {
  colors: {
    bg: colors.background,
    surface: colors.surface,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    accent: colors.primary,
    bubbleSent: colors.bubbleSent,
    bubbleReceived: colors.bubbleReceived,
  },
}

export const lightTheme = {
  colors: {
    bg: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    accent: colors.primary,
    bubbleSent: colors.primary,
    bubbleReceived: '#E8E8E8',
  },
}
```

### 5. Iconografía

- **Lucide Icons** (react-native): Consistentes, ligeros, open source
- Alternativa: **Phosphor Icons**
- Custom icons para: audio waveform, instrumentos musicales, estados de reproducción

### 6. Motion/Animaciones (Design System)

Con Reanimated 4:
- **Micro-interactions:** Botón press (scale 0.95), heart animation
- **Transitions:** Shared element entre lista → player
- **Gestures:** Swipe para responder mensaje, pull-to-refresh
- **Audio viz:** Waveform animado sincronizado con reproducción

---

## Estructura Final del Design System

```
design-system/
├── tokens/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── radius.ts
│   └── shadows.ts
├── themes/
│   ├── dark.ts
│   ├── light.ts
│   └── index.ts
├── primitives/
│   ├── Text.tsx
│   ├── Box.tsx
│   └── Pressable.tsx
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   └── Icon.tsx
├── patterns/
│   ├── ChatBubble.tsx
│   ├── TrackCard.tsx
│   ├── PlayerBar.tsx
│   ├── MiniPlayer.tsx
│   └── AudioWaveform.tsx
└── index.ts              # Re-exports todo
```

---

*Fuentes: Vanilla Extract (Dalgleish), Braid Design System, Tamagui, Nativewind, Unistyles*
