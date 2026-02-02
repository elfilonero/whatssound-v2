# 📱 Frontend Mobile — Arquitectura de la App

**Proyecto:** Dame un Ok  
**Fecha:** Febrero 2026  
**Stack:** React Native + Expo (SDK 52)  
**Versión:** 1.0

---

## 1. Decisión de Stack: React Native + Expo

### ¿Por qué React Native + Expo y no Flutter?

| Criterio | React Native + Expo | Flutter |
|----------|-------------------|---------|
| **Velocidad MVP** | ✅ Más rápido con Expo managed workflow | ⚠️ Requiere más setup inicial |
| **Ecosistema JS** | ✅ Supabase JS SDK nativo, npm completo | ⚠️ SDK Dart menos maduro |
| **Push Notifications** | ✅ expo-notifications unificado (FCM+APNs) | ⚠️ Plugins separados |
| **OTA Updates** | ✅ EAS Update (hot updates sin App Store) | ❌ No disponible nativo |
| **Animaciones** | ✅ Lottie + Reanimated 3 | ✅ Rive/Lottie nativo |
| **Tamaño equipo** | ✅ Más fácil encontrar devs React | ⚠️ Pool más pequeño |
| **Build iOS sin Mac** | ✅ EAS Build en la nube | ❌ Necesita Mac |
| **Rendimiento** | ⚠️ Suficiente para nuestro caso | ✅ Superior en animaciones complejas |

**Decisión:** React Native + Expo para el MVP. La app es simple (un botón, un avatar, configuración básica). No necesitamos el rendimiento de Flutter. Las ventajas de Expo (OTA updates, build en nube, ecosistema npm, Supabase JS SDK) son decisivas para velocidad de desarrollo.

---

## 2. Estructura de Carpetas

```
dame-un-ok-app/
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout (providers, fonts, splash)
│   ├── index.tsx                     # Redirect a home o onboarding
│   ├── (auth)/                       # Grupo: pantallas de autenticación
│   │   ├── _layout.tsx
│   │   ├── login.tsx                 # Login (email, magic link, OAuth)
│   │   ├── signup.tsx                # Registro
│   │   └── verify-otp.tsx           # Verificación OTP por teléfono
│   ├── (onboarding)/                 # Grupo: onboarding (3 pasos)
│   │   ├── _layout.tsx
│   │   ├── step1-avatar.tsx          # Elegir avatar y nombre
│   │   ├── step2-deadline.tsx        # Configurar hora límite
│   │   └── step3-contacts.tsx        # Añadir contactos de emergencia
│   ├── (tabs)/                       # Grupo: tabs principales
│   │   ├── _layout.tsx               # Tab navigator
│   │   ├── home.tsx                  # Pantalla principal (avatar + check-in)
│   │   ├── history.tsx               # Historial / calendario
│   │   ├── family.tsx                # Dashboard familiar (rol family)
│   │   └── profile.tsx               # Perfil y configuración
│   └── (modals)/                     # Grupo: modales
│       ├── avatar-customize.tsx      # Personalizar avatar / accesorios
│       ├── gift-send.tsx             # Enviar regalo al avatar de un familiar
│       ├── contact-add.tsx           # Añadir contacto de emergencia
│       ├── device-setup.tsx          # Configurar dispositivo IoT
│       └── alert-detail.tsx          # Detalle de una alerta
│
├── src/
│   ├── components/                   # Componentes reutilizables
│   │   ├── avatar/
│   │   │   ├── AvatarAnimated.tsx    # Avatar principal con Lottie/Reanimated
│   │   │   ├── AvatarMoodIndicator.tsx
│   │   │   ├── AvatarAccessories.tsx
│   │   │   ├── AvatarSelector.tsx    # Selector de tipo de avatar
│   │   │   └── FeedAnimation.tsx     # Animación de "alimentar"
│   │   ├── checkin/
│   │   │   ├── CheckinButton.tsx     # BOTÓN GRANDE de check-in
│   │   │   ├── StreakBadge.tsx       # Badge de racha actual
│   │   │   ├── MilestonePopup.tsx    # Popup de hito alcanzado
│   │   │   └── DeadlineCountdown.tsx # Cuenta atrás hasta deadline
│   │   ├── family/
│   │   │   ├── FamilyMemberCard.tsx  # Tarjeta de familiar monitorizado
│   │   │   ├── AlertBanner.tsx       # Banner de alerta activa
│   │   │   ├── ResponseChart.tsx     # Gráfico de respuestas semanales
│   │   │   └── SendMessageForm.tsx   # Enviar mensaje a impresora
│   │   ├── history/
│   │   │   ├── CalendarGrid.tsx      # Calendario mensual con check/miss
│   │   │   ├── DayDetail.tsx         # Detalle de un día
│   │   │   └── StreakChart.tsx       # Gráfico de evolución de racha
│   │   ├── common/
│   │   │   ├── Button.tsx            # Botón base (accesible, grande)
│   │   │   ├── Card.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── AccessibleText.tsx    # Texto con soporte large_text
│   │   └── onboarding/
│   │       ├── StepIndicator.tsx
│   │       └── OnboardingSlide.tsx
│   │
│   ├── stores/                       # Gestión de estado (Zustand)
│   │   ├── useAuthStore.ts           # Estado de autenticación
│   │   ├── useUserStore.ts           # Perfil del usuario
│   │   ├── useAvatarStore.ts         # Estado del avatar
│   │   ├── useStreakStore.ts         # Racha actual
│   │   ├── useCheckinStore.ts        # Check-in del día
│   │   ├── useFamilyStore.ts         # Dashboard familiar
│   │   ├── useDevicesStore.ts        # Dispositivos IoT
│   │   ├── useAlertsStore.ts         # Alertas activas
│   │   └── useSettingsStore.ts       # Configuración local
│   │
│   ├── services/                     # Capa de servicios (API calls)
│   │   ├── supabase.ts               # Cliente Supabase configurado
│   │   ├── auth.service.ts           # Autenticación
│   │   ├── checkin.service.ts        # Check-in API
│   │   ├── avatar.service.ts         # Avatar API
│   │   ├── streak.service.ts         # Rachas API
│   │   ├── family.service.ts         # Dashboard familiar API
│   │   ├── devices.service.ts        # Dispositivos API
│   │   ├── messages.service.ts       # Mensajería API
│   │   ├── alerts.service.ts         # Alertas API
│   │   └── notifications.service.ts  # Push notifications
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useCheckin.ts             # Lógica de check-in
│   │   ├── useRealtimeAvatar.ts      # Suscripción Realtime al avatar
│   │   ├── useRealtimeAlerts.ts      # Suscripción Realtime a alertas
│   │   ├── useOfflineSync.ts         # Sync offline-first
│   │   ├── useAccessibility.ts       # Alto contraste, texto grande
│   │   └── useDeadline.ts            # Cuenta atrás al deadline
│   │
│   ├── theme/                        # Sistema de diseño
│   │   ├── colors.ts                 # Paleta de colores (normal + high contrast)
│   │   ├── typography.ts             # Tipografías y tamaños
│   │   ├── spacing.ts                # Sistema de spacing
│   │   ├── shadows.ts
│   │   └── index.ts                  # Theme provider
│   │
│   ├── animations/                   # Assets de animación
│   │   ├── lottie/                   # Archivos .lottie / .json
│   │   │   ├── cat-happy.json
│   │   │   ├── cat-sleeping.json
│   │   │   ├── cat-hungry.json
│   │   │   ├── cat-sad.json
│   │   │   ├── cat-eating.json
│   │   │   ├── dog-happy.json
│   │   │   ├── ... (todos los avatares × estados)
│   │   │   ├── confetti.json
│   │   │   ├── hearts.json
│   │   │   └── milestone-celebration.json
│   │   └── sprites/                  # Fallback estático si Lottie falla
│   │       └── ...
│   │
│   ├── utils/                        # Utilidades
│   │   ├── date.ts                   # Formateo de fechas (luxon/date-fns)
│   │   ├── storage.ts               # AsyncStorage helpers
│   │   ├── haptics.ts               # Feedback háptico
│   │   ├── sounds.ts                # Efectos de sonido
│   │   └── validators.ts            # Validación de formularios
│   │
│   ├── constants/                    # Constantes
│   │   ├── avatars.ts                # Catálogo de avatares
│   │   ├── milestones.ts             # Hitos de racha
│   │   ├── accessoryCategories.ts
│   │   └── api.ts                    # URLs base, timeouts
│   │
│   └── types/                        # TypeScript types
│       ├── user.ts
│       ├── avatar.ts
│       ├── checkin.ts
│       ├── device.ts
│       ├── alert.ts
│       ├── message.ts
│       └── navigation.ts
│
├── assets/                           # Assets estáticos
│   ├── fonts/
│   ├── images/
│   │   ├── logo.png
│   │   ├── onboarding/
│   │   └── avatars/                  # Imágenes estáticas de avatares
│   └── sounds/
│       ├── feed.mp3                  # Sonido al alimentar
│       ├── purr.mp3                  # Ronroneo
│       ├── milestone.mp3            # Hito alcanzado
│       └── alert.mp3                # Alerta
│
├── app.json                          # Configuración Expo
├── eas.json                          # Configuración EAS Build
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## 3. Componentes Principales — Código Conceptual

### 3.1 Pantalla Principal: Home (Avatar + Check-in)

```tsx
// app/(tabs)/home.tsx
import { View, StyleSheet, Pressable } from 'react-native'
import { useCheckin } from '@/hooks/useCheckin'
import { useAvatarStore } from '@/stores/useAvatarStore'
import { useStreakStore } from '@/stores/useStreakStore'
import { AvatarAnimated } from '@/components/avatar/AvatarAnimated'
import { CheckinButton } from '@/components/checkin/CheckinButton'
import { StreakBadge } from '@/components/checkin/StreakBadge'
import { DeadlineCountdown } from '@/components/checkin/DeadlineCountdown'
import { MilestonePopup } from '@/components/checkin/MilestonePopup'
import * as Haptics from 'expo-haptics'

export default function HomeScreen() {
  const { avatar } = useAvatarStore()
  const { streak } = useStreakStore()
  const { doCheckin, isCheckedIn, isLoading, milestone } = useCheckin()

  const handleCheckin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    await doCheckin()
  }

  return (
    <View style={styles.container}>
      {/* Avatar animado — ocupa la mayor parte de la pantalla */}
      <View style={styles.avatarContainer}>
        <AvatarAnimated
          type={avatar.type}
          mood={avatar.current_mood}
          stage={avatar.stage}
          accessories={avatar.equipped_accessories}
          onTap={() => {
            // Acariciar: animación extra (no es check-in)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }}
        />
        <StreakBadge count={streak.current_count} stage={streak.stage} />
      </View>

      {/* Cuenta atrás si no ha hecho check-in */}
      {!isCheckedIn && <DeadlineCountdown />}

      {/* BOTÓN GRANDE de check-in */}
      <CheckinButton
        onPress={handleCheckin}
        isCheckedIn={isCheckedIn}
        isLoading={isLoading}
        avatarName={avatar.name}
      />

      {/* Popup de hito (si se alcanzó) */}
      {milestone && <MilestonePopup milestone={milestone} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
})
```

### 3.2 Botón de Check-in (GRANDE, accesible)

```tsx
// src/components/checkin/CheckinButton.tsx
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useAccessibility } from '@/hooks/useAccessibility'
import { colors } from '@/theme/colors'

interface Props {
  onPress: () => void
  isCheckedIn: boolean
  isLoading: boolean
  avatarName: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function CheckinButton({ onPress, isCheckedIn, isLoading, avatarName }: Props) {
  const scale = useSharedValue(1)
  const { isLargeText } = useAccessibility()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.92)
  }

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    )
  }

  const label = isCheckedIn
    ? `¡${avatarName} está contento! ✅`
    : `Alimentar a ${avatarName} 🍽️`

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isCheckedIn || isLoading}
      style={[
        styles.button,
        isCheckedIn && styles.buttonDone,
        animatedStyle,
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isCheckedIn }}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <Text style={[styles.text, isLargeText && styles.textLarge]}>
          {isCheckedIn ? '✅ ¡Hecho!' : `🍽️ Dar de comer a ${avatarName}`}
        </Text>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '90%',
    minHeight: 80,                    // Touch target grande (accesibilidad)
    borderRadius: 40,
    backgroundColor: colors.primary,  // Verde
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDone: {
    backgroundColor: colors.success,  // Verde más claro
    opacity: 0.8,
  },
  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  textLarge: {
    fontSize: 28,
  },
})
```

### 3.3 Avatar Animado (Lottie + Reanimated)

```tsx
// src/components/avatar/AvatarAnimated.tsx
import { useEffect, useRef } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import LottieView from 'lottie-react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { AvatarType, AvatarMood, AvatarStage } from '@/types/avatar'

// Mapeo de archivos de animación
const ANIMATIONS: Record<AvatarType, Record<AvatarMood, any>> = {
  cat: {
    sleeping: require('@/animations/lottie/cat-sleeping.json'),
    happy: require('@/animations/lottie/cat-happy.json'),
    euphoric: require('@/animations/lottie/cat-euphoric.json'),
    waiting: require('@/animations/lottie/cat-waiting.json'),
    hungry: require('@/animations/lottie/cat-hungry.json'),
    sad: require('@/animations/lottie/cat-sad.json'),
    sick: require('@/animations/lottie/cat-sick.json'),
  },
  dog: { /* ... */ },
  chick: { /* ... */ },
  plant: { /* ... */ },
  turtle: { /* ... */ },
  owl: { /* ... */ },
  rabbit: { /* ... */ },
  sunflower: { /* ... */ },
}

interface Props {
  type: AvatarType
  mood: AvatarMood
  stage: AvatarStage
  accessories: Record<string, string>
  onTap?: () => void
}

export function AvatarAnimated({ type, mood, stage, accessories, onTap }: Props) {
  const lottieRef = useRef<LottieView>(null)

  useEffect(() => {
    // Reiniciar animación al cambiar de mood
    lottieRef.current?.reset()
    lottieRef.current?.play()
  }, [mood])

  // Escala según etapa
  const stageScale = stage === 'baby' ? 0.7 : stage === 'juvenile' ? 0.85 : 1.0

  return (
    <Pressable onPress={onTap} style={styles.container}>
      <Animated.View
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(300)}
        style={[styles.avatarWrapper, { transform: [{ scale: stageScale }] }]}
      >
        <LottieView
          ref={lottieRef}
          source={ANIMATIONS[type][mood]}
          autoPlay
          loop
          style={styles.lottie}
        />
        {/* Capa de accesorios encima del avatar */}
        {Object.entries(accessories).map(([slot, accessoryId]) => (
          <AccessoryOverlay key={slot} slot={slot} accessoryId={accessoryId} />
        ))}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: '100%',
    height: '100%',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
})
```

### 3.4 Calendario de Historial

```tsx
// src/components/history/CalendarGrid.tsx
import { View, Text, StyleSheet } from 'react-native'
import { useCheckinStore } from '@/stores/useCheckinStore'
import { colors } from '@/theme/colors'

interface Props {
  month: number  // 0-11
  year: number
}

export function CalendarGrid({ month, year }: Props) {
  const { history } = useCheckinStore()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    const checkin = history.find(c => c.date === date)
    const today = new Date().toISOString().split('T')[0]
    const isFuture = date > today

    return {
      day: i + 1,
      date,
      status: isFuture ? 'future' : checkin ? 'done' : date === today ? 'pending' : 'missed'
    }
  })

  return (
    <View style={styles.grid}>
      {/* Cabecera: L M X J V S D */}
      {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
        <Text key={d} style={styles.header}>{d}</Text>
      ))}
      {/* Espacios vacíos antes del día 1 */}
      {Array.from({ length: (firstDayOfWeek + 6) % 7 }, (_, i) => (
        <View key={`empty-${i}`} style={styles.cell} />
      ))}
      {/* Días del mes */}
      {days.map(({ day, status }) => (
        <View key={day} style={[styles.cell, styles[status]]}>
          <Text style={[styles.dayText, status === 'done' && styles.doneText]}>
            {status === 'done' ? '✅' : status === 'missed' ? '❌' : day}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  header: { width: '14.28%', textAlign: 'center', fontWeight: '700', color: '#666', marginBottom: 8 },
  cell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  dayText: { fontSize: 14, color: '#333' },
  done: { backgroundColor: colors.successLight },
  doneText: { fontSize: 18 },
  missed: { backgroundColor: colors.errorLight },
  pending: { backgroundColor: colors.warningLight },
  future: { opacity: 0.3 },
})
```

### 3.5 Dashboard Familiar — Tarjeta de Familiar

```tsx
// src/components/family/FamilyMemberCard.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { AvatarAnimated } from '@/components/avatar/AvatarAnimated'
import { colors } from '@/theme/colors'
import { MonitoredUser } from '@/types/user'

interface Props {
  user: MonitoredUser
  onPress: () => void
  onSendGift: () => void
  onCall: () => void
}

export function FamilyMemberCard({ user, onPress, onSendGift, onCall }: Props) {
  const isAlert = user.active_alerts > 0
  const moodEmoji = {
    happy: '😊', euphoric: '🥳', sleeping: '😴',
    waiting: '😐', hungry: '😿', sad: '😢', sick: '🤒'
  }[user.avatar.mood]

  const moodLabel = {
    happy: 'Contento', euphoric: 'Eufórico', sleeping: 'Dormido',
    waiting: 'Esperando', hungry: 'Hambriento', sad: 'Triste', sick: 'Enfermo'
  }[user.avatar.mood]

  return (
    <Pressable onPress={onPress} style={[styles.card, isAlert && styles.cardAlert]}>
      <View style={styles.row}>
        <View style={styles.avatarSmall}>
          <AvatarAnimated
            type={user.avatar.type}
            mood={user.avatar.mood}
            stage={user.avatar.stage}
            accessories={{}}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user.avatar.name}</Text>
          <Text style={styles.subtitle}>({user.display_name})</Text>
          <Text style={styles.mood}>{moodEmoji} {moodLabel}</Text>
          {user.checked_in_today ? (
            <Text style={styles.ok}>✅ Comió a las {formatTime(user.last_checkin.at)}</Text>
          ) : (
            <Text style={styles.waiting}>⏳ Esperando check-in</Text>
          )}
          <Text style={styles.streak}>🔥 Racha: {user.streak.current} días</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onSendGift} style={styles.actionBtn}>
          <Text>🎁 Regalo</Text>
        </Pressable>
        {isAlert && (
          <Pressable onPress={onCall} style={styles.actionBtnAlert}>
            <Text style={{ color: '#fff' }}>📞 Llamar</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  )
}
```

---

## 4. Navegación (Expo Router)

```
Estructura de navegación:

(auth)                           ← Stack no autenticado
├── login
├── signup
└── verify-otp

(onboarding)                     ← Stack primera vez
├── step1-avatar
├── step2-deadline
└── step3-contacts

(tabs)                           ← Tab navigator principal
├── home       [🏠 Inicio]      ← Avatar + botón check-in
├── history    [📅 Historial]   ← Calendario + racha
├── family     [👨‍👩‍👧 Familia]    ← Dashboard familiar (solo rol family)
└── profile    [⚙️ Perfil]      ← Configuración

(modals)                         ← Modales superpuestos
├── avatar-customize
├── gift-send
├── contact-add
├── device-setup
└── alert-detail
```

**Decisión de navegación por rol:**

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { useUserStore } from '@/stores/useUserStore'

export default function TabLayout() {
  const { user } = useUserStore()
  const isFamily = user?.role === 'family'

  return (
    <Tabs screenOptions={{ tabBarStyle: { height: 70, paddingBottom: 10 } }}>
      <Tabs.Screen name="home" options={{ title: 'Inicio', tabBarIcon: () => '🏠' }} />
      <Tabs.Screen name="history" options={{ title: 'Historial', tabBarIcon: () => '📅' }} />
      {isFamily && (
        <Tabs.Screen name="family" options={{ title: 'Familia', tabBarIcon: () => '👨‍👩‍👧' }} />
      )}
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: () => '⚙️' }} />
    </Tabs>
  )
}
```

---

## 5. Gestión de Estado (Zustand)

### 5.1 Store de autenticación

```typescript
// src/stores/useAuthStore.ts
import { create } from 'zustand'
import { supabase } from '@/services/supabase'
import { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, isAuthenticated: !!session, isLoading: false })

    // Listener de cambios de sesión
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, isAuthenticated: !!session })
    })
  },

  signIn: async (email, password) => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    set({ isLoading: false })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, isAuthenticated: false })
  },
}))
```

### 5.2 Store del avatar (con Realtime)

```typescript
// src/stores/useAvatarStore.ts
import { create } from 'zustand'
import { supabase } from '@/services/supabase'
import { Avatar } from '@/types/avatar'

interface AvatarState {
  avatar: Avatar | null
  isLoading: boolean
  fetch: () => Promise<void>
  updateName: (name: string) => Promise<void>
  equipAccessory: (slot: string, accessoryId: string) => Promise<void>
  subscribeRealtime: () => () => void  // Retorna función de cleanup
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
  avatar: null,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true })
    const { data } = await supabase.from('avatars').select('*').single()
    set({ avatar: data, isLoading: false })
  },

  updateName: async (name) => {
    const { data } = await supabase
      .from('avatars').update({ name }).eq('id', get().avatar!.id).select().single()
    set({ avatar: data })
  },

  equipAccessory: async (slot, accessoryId) => {
    const current = get().avatar!.equipped_accessories
    const updated = { ...current, [slot]: accessoryId }
    const { data } = await supabase
      .from('avatars').update({ equipped_accessories: updated })
      .eq('id', get().avatar!.id).select().single()
    set({ avatar: data })
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel('avatar-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'avatars',
        filter: `user_id=eq.${get().avatar?.user_id}`
      }, (payload) => {
        set({ avatar: payload.new as Avatar })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  },
}))
```

### 5.3 Store de check-in

```typescript
// src/stores/useCheckinStore.ts
import { create } from 'zustand'
import { checkinService } from '@/services/checkin.service'

interface CheckinState {
  isCheckedIn: boolean
  isLoading: boolean
  todayCheckin: any | null
  history: Array<{ date: string; source: string; timestamp: string }>
  milestone: any | null

  doCheckin: (source?: string) => Promise<void>
  fetchToday: () => Promise<void>
  fetchHistory: (from: string, to: string) => Promise<void>
  clearMilestone: () => void
}

export const useCheckinStore = create<CheckinState>((set) => ({
  isCheckedIn: false,
  isLoading: false,
  todayCheckin: null,
  history: [],
  milestone: null,

  doCheckin: async (source = 'app_mobile') => {
    set({ isLoading: true })
    try {
      const result = await checkinService.checkin({ source })
      set({
        isCheckedIn: true,
        todayCheckin: result,
        milestone: result.streak.milestone_reached,
        isLoading: false
      })
    } catch (err: any) {
      if (err.code === 'CHECKIN_ALREADY_DONE') {
        set({ isCheckedIn: true, isLoading: false })
      } else {
        set({ isLoading: false })
        throw err
      }
    }
  },

  fetchToday: async () => {
    const result = await checkinService.getToday()
    set({ isCheckedIn: result.checked_in, todayCheckin: result.checkin })
  },

  fetchHistory: async (from, to) => {
    const result = await checkinService.getHistory(from, to)
    set({ history: result.checkins })
  },

  clearMilestone: () => set({ milestone: null }),
}))
```

---

## 6. Animaciones del Tamagotchi

### 6.1 Lottie para animaciones complejas

Las animaciones principales del avatar se crean en **Adobe After Effects** y se exportan como Lottie JSON con el plugin Bodymovin. Cada avatar tiene animaciones para cada estado:

| Avatar | Estados | Frames aprox. | Peso JSON |
|--------|---------|---------------|-----------|
| 🐱 Gato | 7 estados × loop | ~120 frames c/u | ~50KB c/u |
| 🐕 Perro | 7 estados × loop | ~120 frames c/u | ~55KB c/u |
| 🐦 Pollito | 7 estados × loop | ~100 frames c/u | ~40KB c/u |
| 🌱 Planta | 7 estados × loop | ~80 frames c/u | ~30KB c/u |
| Total 8 avatares | 56 animaciones | | ~2.5MB total |

### 6.2 Reanimated 3 para micro-interacciones

- **Bounce del botón:** `withSpring` al presionar
- **Respiración del avatar dormido:** `withRepeat(withTiming)` en scale
- **Fade entre estados:** `FadeIn/FadeOut` al cambiar mood
- **Confeti de hito:** Partículas con `useSharedValue` + translateY

### 6.3 Animación especial: Alimentar

```tsx
// src/components/avatar/FeedAnimation.tsx
import { useEffect } from 'react'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSequence, withTiming, withDelay, runOnJS
} from 'react-native-reanimated'
import LottieView from 'lottie-react-native'

export function FeedAnimation({ onComplete }: { onComplete: () => void }) {
  const foodY = useSharedValue(-100)
  const foodOpacity = useSharedValue(0)
  const heartsOpacity = useSharedValue(0)

  useEffect(() => {
    // 1. Comida cae desde arriba
    foodOpacity.value = withTiming(1, { duration: 200 })
    foodY.value = withSequence(
      withTiming(0, { duration: 500 }),      // Cae
      withDelay(800, withTiming(50, { duration: 300 }))  // Se absorbe
    )
    // 2. Comida desaparece, corazones aparecen
    foodOpacity.value = withDelay(1300, withTiming(0, { duration: 200 }))
    heartsOpacity.value = withDelay(1300, withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(1500, withTiming(0, { duration: 500 }))
    ))
    // 3. Completar
    setTimeout(() => runOnJS(onComplete)(), 3000)
  }, [])

  const foodStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: foodY.value }],
    opacity: foodOpacity.value,
  }))

  const heartsStyle = useAnimatedStyle(() => ({
    opacity: heartsOpacity.value,
  }))

  return (
    <>
      <Animated.Text style={[{ fontSize: 40, position: 'absolute' }, foodStyle]}>
        🍽️
      </Animated.Text>
      <Animated.View style={[{ position: 'absolute', top: -30 }, heartsStyle]}>
        <LottieView source={require('@/animations/lottie/hearts.json')} autoPlay style={{ width: 100, height: 100 }} />
      </Animated.View>
    </>
  )
}
```

---

## 7. Push Notifications (Expo)

### 7.1 Setup

```typescript
// src/services/notifications.service.ts
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { supabase } from './supabase'

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null  // No funciona en simulador

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  // Obtener Expo push token (unifica FCM + APNs)
  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: 'dame-un-ok-expo-project-id'
  })).data

  // Guardar token en el perfil del usuario
  await supabase.from('users').update({
    fcm_token: token  // Expo push token funciona para ambas plataformas
  }).eq('auth_id', (await supabase.auth.getUser()).data.user?.id)

  // Android: canal de notificación
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('checkin-reminder', {
      name: 'Recordatorio de Check-in',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'alert.mp3',
    })
    await Notifications.setNotificationChannelAsync('family-alerts', {
      name: 'Alertas Familiares',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      sound: 'alert.mp3',
    })
  }

  return token
}

// Listener de notificaciones recibidas (app en foreground)
export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback)
}

// Listener de tap en notificación (app en background/killed)
export function onNotificationTapped(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback)
}
```

### 7.2 Envío desde backend (Expo Push API)

```typescript
// En Edge Function / worker
async function sendPushNotification(expoPushToken: string, title: string, body: string, data?: any) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: expoPushToken,
      title,
      body,
      sound: 'default',
      data: data || {},
      channelId: 'checkin-reminder',  // Android
      badge: 1,
    })
  })
}
```

---

## 8. Offline-First (AsyncStorage + Sync)

### 8.1 Estrategia

La app debe funcionar sin conexión para el caso más crítico: **hacer check-in sin internet** (el abuelo en un pueblo con mala cobertura).

```
┌──────────────────────────────────────────────┐
│              OFFLINE-FIRST FLOW               │
│                                               │
│  1. Usuario pulsa "Alimentar"                │
│  2. Check-in se guarda en AsyncStorage       │
│  3. UI muestra ✅ inmediatamente             │
│  4. En background: intentar enviar a API     │
│     ├── Si hay red → enviar → borrar local   │
│     └── Si no hay red → encolar              │
│  5. Al recuperar red → sync pendientes       │
│  6. Conflictos: server wins (timestamp)      │
└──────────────────────────────────────────────┘
```

### 8.2 Implementación

```typescript
// src/hooks/useOfflineSync.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { checkinService } from '@/services/checkin.service'

const PENDING_CHECKINS_KEY = 'pending_checkins'

export function useOfflineSync() {
  // Guardar check-in pendiente localmente
  const savePendingCheckin = async (checkin: { source: string; timestamp: string }) => {
    const pending = JSON.parse(await AsyncStorage.getItem(PENDING_CHECKINS_KEY) || '[]')
    pending.push(checkin)
    await AsyncStorage.setItem(PENDING_CHECKINS_KEY, JSON.stringify(pending))
  }

  // Sincronizar check-ins pendientes
  const syncPending = async () => {
    const netState = await NetInfo.fetch()
    if (!netState.isConnected) return

    const pending = JSON.parse(await AsyncStorage.getItem(PENDING_CHECKINS_KEY) || '[]')
    if (pending.length === 0) return

    const synced: number[] = []
    for (let i = 0; i < pending.length; i++) {
      try {
        await checkinService.checkin(pending[i])
        synced.push(i)
      } catch (err: any) {
        if (err.code === 'CHECKIN_ALREADY_DONE') synced.push(i) // Ya sincronizado
      }
    }

    // Eliminar los sincronizados
    const remaining = pending.filter((_: any, i: number) => !synced.includes(i))
    await AsyncStorage.setItem(PENDING_CHECKINS_KEY, JSON.stringify(remaining))
  }

  // Listener de reconexión
  const startSyncListener = () => {
    return NetInfo.addEventListener(state => {
      if (state.isConnected) syncPending()
    })
  }

  return { savePendingCheckin, syncPending, startSyncListener }
}
```

### 8.3 Caché local del avatar y racha

```typescript
// Siempre guardar último estado conocido en AsyncStorage
// Al abrir la app: cargar desde caché primero, luego fetch del servidor
// Si no hay red: mostrar datos cacheados con indicador "Sin conexión"

const CACHE_KEYS = {
  avatar: 'cache_avatar',
  streak: 'cache_streak',
  history: 'cache_history',
  family: 'cache_family',
}

async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const data = await fetcher()
    await AsyncStorage.setItem(key, JSON.stringify(data))
    return data
  } catch {
    const cached = await AsyncStorage.getItem(key)
    if (cached) return JSON.parse(cached)
    throw new Error('Sin conexión y sin datos en caché')
  }
}
```

---

## 9. Accesibilidad

### 9.1 Principios de diseño accesible

| Requisito | Implementación |
|-----------|---------------|
| **Touch targets grandes** | Mínimo 60px (idealmente 80px para botón principal) |
| **Alto contraste** | Ratio mínimo 4.5:1 (WCAG AA), modo alto contraste con 7:1 (AAA) |
| **Texto escalable** | Soporte `fontScale` del sistema + opción en app |
| **VoiceOver / TalkBack** | `accessibilityLabel` en todos los elementos interactivos |
| **Reducción de movimiento** | Detectar `prefers-reduced-motion` → animaciones estáticas |
| **Haptics** | Feedback háptico en botón principal (configurable) |
| **Sonidos** | Confirmación audible de check-in (configurable) |

### 9.2 Hook de accesibilidad

```typescript
// src/hooks/useAccessibility.ts
import { useWindowDimensions, AccessibilityInfo, PixelRatio } from 'react-native'
import { useSettingsStore } from '@/stores/useSettingsStore'

export function useAccessibility() {
  const { settings } = useSettingsStore()
  const { fontScale } = useWindowDimensions()
  const isLargeText = fontScale > 1.2 || settings.accessibility.large_text
  const isHighContrast = settings.accessibility.high_contrast
  const isReducedMotion = settings.accessibility.reduced_motion

  return { isLargeText, isHighContrast, isReducedMotion, fontScale }
}
```

---

## 10. Build y Deploy (EAS)

### 10.1 Configuración EAS

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "env": { "SUPABASE_URL": "http://localhost:54321" }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "buildConfiguration": "Release" },
      "env": {
        "SUPABASE_URL": "https://staging-xxx.supabase.co",
        "SUPABASE_ANON_KEY": "eyJ..."
      }
    },
    "production": {
      "ios": { "buildConfiguration": "Release" },
      "android": { "buildType": "app-bundle" },
      "env": {
        "SUPABASE_URL": "https://prod-xxx.supabase.co",
        "SUPABASE_ANON_KEY": "eyJ..."
      }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "vertexdeveloperchina@gmail.com", "ascAppId": "..." },
      "android": { "serviceAccountKeyPath": "./google-play-key.json" }
    }
  }
}
```

### 10.2 Flujo de build y deploy

```
Desarrollo:
  npx expo start                       → Dev server con hot reload
  eas build -p ios --profile dev       → Build de desarrollo (simulador)

Preview (testers internos):
  eas build -p all --profile preview   → Build iOS + Android interno
  eas update --branch preview          → OTA update (sin rebuild)

Producción:
  eas build -p all --profile production  → Build final
  eas submit -p all                      → Subir a App Store + Google Play
  eas update --branch production         → OTA update crítico

OTA Updates (EAS Update):
  - Cambios de JS/assets → sin pasar por App Store
  - Cambios nativos (nueva dependencia, permisos) → rebuild necesario
  - Canal: production / preview → control de rollout
```

### 10.3 App Store / Google Play

**App Store (iOS):**
- Cuenta Apple Developer: $99/año (ya disponible: vertexdeveloperchina@gmail.com)
- Review time: ~24-48h (primera vez puede ser más)
- Categoría: "Salud y bienestar" o "Estilo de vida"
- Clasificación: 4+ (sin contenido restringido)
- Requisitos: Política de privacidad, screenshots, App Privacy labels

**Google Play (Android):**
- Cuenta Google Play Developer: $25 (pago único)
- Review time: ~24h (primera vez ~7 días)
- Categoría: "Salud y bienestar"
- Clasificación: PEGI 3 / Everyone
- Requisitos: Política de privacidad, Data Safety form, screenshots

### 10.4 Configuración de la app

```json
// app.json (extracto)
{
  "expo": {
    "name": "Dame un Ok",
    "slug": "dame-un-ok",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "dameunok",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#22C55E"
    },
    "ios": {
      "bundleIdentifier": "es.dameunok.app",
      "supportsTablet": true,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Para compartir tu ubicación con tu familia en caso de alerta (opcional)",
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "package": "es.dameunok.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#22C55E"
      },
      "permissions": ["VIBRATE", "RECEIVE_BOOT_COMPLETED"]
    },
    "plugins": [
      "expo-router",
      "expo-notifications",
      "expo-location",
      "expo-haptics"
    ]
  }
}
```

---

## 11. Tema y Sistema de Diseño

### 11.1 Paleta de colores

```typescript
// src/theme/colors.ts
export const colors = {
  // Primarios
  primary: '#22C55E',          // Verde — "todo bien"
  primaryDark: '#16A34A',
  primaryLight: '#86EFAC',

  // Estados del avatar
  happy: '#22C55E',
  euphoric: '#F59E0B',
  sleeping: '#6366F1',
  waiting: '#F59E0B',
  hungry: '#EAB308',
  sad: '#EF4444',
  sick: '#DC2626',

  // UI
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',

  // Feedback
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // Alto contraste (accesibilidad)
  highContrast: {
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    primary: '#00FF66',
    error: '#FF4444',
  }
}
```

### 11.2 Tipografía

```typescript
// src/theme/typography.ts
export const typography = {
  // Tamaños base (se multiplican por fontScale del sistema)
  hero: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40 },
  h1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  button: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  buttonLarge: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },

  // Para modo accesible (large_text)
  accessible: {
    hero: { fontSize: 40 },
    h1: { fontSize: 30 },
    body: { fontSize: 20 },
    button: { fontSize: 24 },
  }
}
```

---

*Este documento define la arquitectura completa de la aplicación móvil de Dame un Ok: stack tecnológico, estructura de carpetas, componentes principales con código conceptual, navegación, gestión de estado con Zustand, animaciones Lottie/Reanimated para el Tamagotchi, push notifications con Expo, estrategia offline-first, accesibilidad WCAG, y build/deploy con EAS Build para iOS y Android.*
