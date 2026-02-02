# State Management Patterns
## Análisis para WhatsSound

---

## El Problema del Estado en una App Musical + Chat

WhatsSound tiene **4 tipos de estado** distintos:

1. **Estado del servidor** — mensajes, canciones, perfiles, playlists (viene del backend)
2. **Estado del cliente** — UI abierta, modal visible, tab seleccionado
3. **Estado del reproductor** — canción actual, posición, volumen, cola de reproducción
4. **Estado real-time** — presencia online, "escribiendo...", nuevos mensajes

Cada tipo necesita una estrategia diferente.

---

## Comparativa: Zustand vs Jotai vs Redux Toolkit

### Zustand (Recomendado para estado cliente + reproductor)

**Repo:** https://github.com/pmndrs/zustand  
**Tamaño:** ~1.1kb gzipped  
**Filosofía:** Flux simplificado con hooks. Sin providers, sin boilerplate.

```typescript
// Ejemplo: Player Store para WhatsSound
import { create } from 'zustand'

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  queue: Track[]
  play: (track: Track) => void
  pause: () => void
  next: () => void
}

const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  play: (track) => set({ currentTrack: track, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  next: () => {
    const { queue } = get()
    if (queue.length > 0) {
      set({ currentTrack: queue[0], queue: queue.slice(1) })
    }
  },
}))
```

**Ventajas:**
- Sin providers — funciona fuera del árbol React (servicios de audio)
- Subscripciones selectivas — solo re-render lo que cambia
- Middleware: persist, devtools, immer
- Transient updates (sin re-render) para visualizador de audio
- Resuelve zombie child, concurrency, context loss

**Ideal para:** Estado del reproductor, UI state, preferencias

---

### Jotai (Alternativa para estado atómico)

**Repo:** https://github.com/pmndrs/jotai  
**Tamaño:** ~2kb core  
**Filosofía:** Átomos primitivos + derivados. Como useState pero global.

```typescript
import { atom, useAtom } from 'jotai'

const volumeAtom = atom(0.8)
const mutedAtom = atom(false)
const effectiveVolumeAtom = atom((get) => 
  get(mutedAtom) ? 0 : get(volumeAtom)
)
```

**Ventajas:**
- Extremadamente granular — cada átomo es independiente
- Derivaciones automáticas
- Sin keys string (vs Recoil)

**Ideal para:** Configuración granular, settings, toggles

---

### Redux Toolkit (No recomendado para WhatsSound)

**Repo:** https://github.com/reduxjs/redux-toolkit

**Por qué NO para WhatsSound:**
- Overkill para una app que no es enterprise legacy
- Más boilerplate que Zustand incluso simplificado
- RTK Query compite con TanStack Query pero es menos flexible
- El equipo de React (incluyendo Dan Abramov, su creador) ya no lo recomienda como default

---

### TanStack Query (Para estado del servidor)

**Repo:** https://github.com/TanStack/query (48.3k ⭐)

```typescript
// Ejemplo: Fetch de mensajes con cache y refetch
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function useMessages(chatId: string) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => api.getMessages(chatId),
    staleTime: 30_000, // 30s fresh
    refetchOnWindowFocus: true,
  })
}

function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.sendMessage,
    onMutate: async (newMessage) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', newMessage.chatId] })
      const previous = queryClient.getQueryData(['messages', newMessage.chatId])
      queryClient.setQueryData(['messages', newMessage.chatId], (old) => [...old, newMessage])
      return { previous }
    },
    onError: (err, newMessage, context) => {
      queryClient.setQueryData(['messages', newMessage.chatId], context.previous)
    },
  })
}
```

**Ideal para:** Todo lo que viene del servidor — mensajes, perfiles, playlists, búsquedas

---

## ✅ Estrategia Recomendada para WhatsSound

| Tipo de Estado | Herramienta | Razón |
|---------------|-------------|-------|
| **Server state** (mensajes, users, tracks) | TanStack Query | Cache, refetch, optimistic updates |
| **Client state** (UI, navigation) | Zustand | Simple, sin providers, performante |
| **Player state** (reproducción, cola) | Zustand (store dedicado) | Accesible fuera de React (servicios nativos) |
| **Real-time** (presencia, typing) | Zustand + WebSocket | WebSocket alimenta el store directamente |
| **Persistencia** | Zustand persist + MMKV | Estado offline (última canción, preferencias) |

### Arquitectura de Stores

```
stores/
├── usePlayerStore.ts      # Reproducción, cola, volumen
├── useAuthStore.ts        # Token, user actual
├── useUIStore.ts          # Modals, sheets, tabs
├── useChatStore.ts        # Typing indicators, presencia (WS-fed)
└── usePreferencesStore.ts # Theme, calidad audio, notificaciones
```

**Regla de oro:** Si el dato viene del servidor → TanStack Query. Si es estado local/efímero → Zustand. Nunca duplicar.

---

*Fuentes: github.com/pmndrs/zustand, github.com/pmndrs/jotai, github.com/TanStack/query*
