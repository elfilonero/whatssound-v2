# Recomendaciones PWA para WhatsSound: Implementación Práctica

## Estrategia de Implementación por Fases

### Fase 1: Fundación PWA (Semanas 1-4)
**Objetivo**: Establecer base técnica sólida para experiencia offline

#### 1.1 Web App Manifest Optimizado para WhatsSound
```json
{
  "name": "WhatsSound - Música Social en Tiempo Real",
  "short_name": "WhatsSound", 
  "description": "Descubre, comparte y disfruta música con amigos",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#FF6B6B",
  "background_color": "#1A1A1A",
  "categories": ["music", "social", "entertainment"],
  "lang": "es-ES",
  "dir": "ltr",
  
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png", 
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512", 
      "type": "image/png",
      "purpose": "any"
    }
  ],
  
  "shortcuts": [
    {
      "name": "Descubrir",
      "description": "Explorar nueva música",
      "url": "/discover",
      "icons": [{ "src": "/icons/discover-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Mis Playlists",
      "description": "Ver playlists personales",
      "url": "/playlists/mine",
      "icons": [{ "src": "/icons/playlist-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "En Vivo",
      "description": "Sesiones musicales en tiempo real",
      "url": "/live",
      "icons": [{ "src": "/icons/live-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Amigos",
      "description": "Actividad de amigos",
      "url": "/friends/activity",
      "icons": [{ "src": "/icons/friends-96x96.png", "sizes": "96x96" }]
    }
  ],

  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "application/x-www-form-urlencoded",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  },

  "protocol_handlers": [{
    "protocol": "whatsound",
    "url": "/music?track=%s"
  }],

  "file_handlers": [
    {
      "action": "/import-music",
      "accept": {
        "audio/*": [".mp3", ".wav", ".m4a", ".flac"]
      }
    }
  ]
}
```

#### 1.2 Service Worker Base con Workbox
```javascript
// sw.js - Service Worker optimizado para WhatsSound
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { BackgroundSync } from 'workbox-background-sync'
import { ExpirationPlugin } from 'workbox-expiration'

// Cleanup versiones antiguas
cleanupOutdatedCaches()

// Precache assets críticos
precacheAndRoute(self.__WB_MANIFEST)

// STRATEGY 1: App Shell - Cache First
registerRoute(
  ({ request }) => 
    request.destination === 'document' ||
    request.destination === 'script' ||
    request.destination === 'style',
  new CacheFirst({
    cacheName: 'whatsound-shell',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
      })
    ]
  })
)

// STRATEGY 2: Audio Files - Cache First con expiration
registerRoute(
  ({ request }) => request.url.includes('/api/audio/stream/'),
  new CacheFirst({
    cacheName: 'whatsound-audio',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días
        purgeOnQuotaError: true
      })
    ]
  })
)

// STRATEGY 3: API Social - Network First con background sync
const bgSync = new BackgroundSync('whatsound-api-queue', {
  maxRetentionTime: 24 * 60 // 24 horas
})

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/social/'),
  new NetworkFirst({
    cacheName: 'whatsound-api',
    networkTimeoutSeconds: 3,
    plugins: [bgSync]
  })
)

// STRATEGY 4: Metadata - Stale While Revalidate
registerRoute(
  ({ url }) => 
    url.pathname.startsWith('/api/tracks/') ||
    url.pathname.startsWith('/api/playlists/') ||
    url.pathname.startsWith('/api/users/'),
  new StaleWhileRevalidate({
    cacheName: 'whatsound-metadata',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 24 * 60 * 60 // 1 día
      })
    ]
  })
)

// STRATEGY 5: Images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'whatsound-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
      })
    ]
  })
)

// Background sync para acciones offline
self.addEventListener('sync', event => {
  if (event.tag === 'whatsound-actions-sync') {
    event.waitUntil(syncOfflineActions())
  }
})

async function syncOfflineActions() {
  // Sincronizar likes, shares, comments realizados offline
  const actionsDB = await openIndexedDB('whatsound-offline-actions')
  const pendingActions = await getAllPendingActions(actionsDB)
  
  for (const action of pendingActions) {
    try {
      await fetch('/api/actions/sync', {
        method: 'POST',
        body: JSON.stringify(action),
        headers: { 'Content-Type': 'application/json' }
      })
      await removeActionFromDB(actionsDB, action.id)
    } catch (error) {
      console.log('Sync failed, will retry later:', error)
    }
  }
}
```

### Fase 2: Experiencia Offline Inteligente (Semanas 5-8)

#### 2.1 Sistema de Queue Offline para Acciones Sociales
```javascript
// offline-queue.js - Manager de acciones offline
class WhatsoundOfflineQueue {
  constructor() {
    this.dbName = 'whatsound-offline'
    this.dbVersion = 1
    this.db = null
  }

  async init() {
    this.db = await this.openDB()
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Store para acciones pendientes
        if (!db.objectStoreNames.contains('pending_actions')) {
          const store = db.createObjectStore('pending_actions', {
            keyPath: 'id',
            autoIncrement: true
          })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Store para audio cache metadata  
        if (!db.objectStoreNames.contains('audio_cache')) {
          const cacheStore = db.createObjectStore('audio_cache', {
            keyPath: 'trackId'
          })
          cacheStore.createIndex('lastAccessed', 'lastAccessed', { unique: false })
          cacheStore.createIndex('priority', 'priority', { unique: false })
        }
      }
    })
  }

  // Queue acciones para sync posterior
  async queueAction(actionType, data) {
    const transaction = this.db.transaction(['pending_actions'], 'readwrite')
    const store = transaction.objectStore('pending_actions')
    
    const action = {
      type: actionType,
      data: data,
      timestamp: Date.now(),
      retryCount: 0
    }
    
    await store.add(action)
    
    // Mostrar feedback optimista inmediato
    this.showOptimisticUI(actionType, data)
    
    // Intentar sync si hay conexión
    if (navigator.onLine) {
      this.triggerBackgroundSync()
    }
  }

  showOptimisticUI(actionType, data) {
    // Actualizar UI inmediatamente como si la acción fue exitosa
    switch (actionType) {
      case 'like':
        document.querySelector(`[data-track-id="${data.trackId}"]`)
          .classList.add('liked')
        break
      case 'follow':
        document.querySelector(`[data-user-id="${data.userId}"]`)
          .textContent = 'Siguiendo'
        break
      case 'add_to_playlist':
        this.showToast('Canción agregada a playlist')
        break
    }
  }

  triggerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(reg => {
        return reg.sync.register('whatsound-actions-sync')
      })
    }
  }
}

// Usage en la app
const offlineQueue = new WhatsoundOfflineQueue()
await offlineQueue.init()

// Interceptar acciones del usuario
document.addEventListener('click', async (event) => {
  const likeBtn = event.target.closest('[data-action="like"]')
  if (likeBtn) {
    const trackId = likeBtn.dataset.trackId
    await offlineQueue.queueAction('like', { trackId })
  }

  const followBtn = event.target.closest('[data-action="follow"]')
  if (followBtn) {
    const userId = followBtn.dataset.userId  
    await offlineQueue.queueAction('follow', { userId })
  }
})
```

#### 2.2 Smart Audio Caching con Machine Learning Local
```javascript
// smart-audio-cache.js - Caching inteligente basado en comportamiento
class SmartAudioCache {
  constructor() {
    this.modelWeights = {
      playCount: 0.3,
      recency: 0.25,
      socialSignals: 0.2,
      timeOfDay: 0.15,
      userSimilarity: 0.1
    }
    this.maxCacheSize = 2000 // MB
    this.currentCacheSize = 0
  }

  async calculateCachePriority(track) {
    const features = await this.extractFeatures(track)
    let score = 0

    // Factor 1: Frecuencia de reproducción
    score += features.playCount * this.modelWeights.playCount

    // Factor 2: Recency - más peso a tracks recientes
    const daysSinceLastPlay = (Date.now() - features.lastPlayedAt) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 30 - daysSinceLastPlay) / 30 * this.modelWeights.recency

    // Factor 3: Señales sociales (likes de amigos, shares)
    score += features.socialScore * this.modelWeights.socialSignals

    // Factor 4: Patrones temporales
    const currentHour = new Date().getHours()
    if (features.preferredHours.includes(currentHour)) {
      score += this.modelWeights.timeOfDay
    }

    // Factor 5: Similitud con otros usuarios
    score += features.userSimilarityScore * this.modelWeights.userSimilarity

    return Math.min(1, Math.max(0, score))
  }

  async extractFeatures(track) {
    const userStats = await this.getUserStats()
    const socialData = await this.getSocialData(track.id)
    
    return {
      playCount: this.normalizePlayCount(track.playCount),
      lastPlayedAt: track.lastPlayedAt || 0,
      socialScore: this.calculateSocialScore(socialData),
      preferredHours: userStats.listeningPatterns.hourPreferences,
      userSimilarityScore: await this.calculateUserSimilarity(track)
    }
  }

  async shouldCacheTrack(track) {
    const priority = await this.calculateCachePriority(track)
    
    // Cache si prioridad alta O si hay espacio disponible
    if (priority > 0.7) return true
    if (this.currentCacheSize < this.maxCacheSize * 0.8) return true
    
    // Si cache lleno, cache solo si mejor que el track con menor prioridad
    const lowestPriorityTrack = await this.getLowestPriorityTrack()
    return priority > lowestPriorityTrack.priority
  }

  async preloadSmartCache() {
    // Ejecutar durante horarios de baja actividad
    if (!this.isLowActivityTime()) return

    const recommendations = await fetch('/api/recommendations/preload').then(r => r.json())
    
    for (const track of recommendations) {
      if (await this.shouldCacheTrack(track)) {
        await this.cacheTrackAudio(track)
      }
    }
  }

  async cacheTrackAudio(track) {
    const cache = await caches.open('whatsound-audio')
    const audioUrl = `/api/audio/stream/${track.id}`
    
    // Solo precargar si no está ya cacheado
    const cached = await cache.match(audioUrl)
    if (cached) return

    try {
      const response = await fetch(audioUrl)
      if (response.ok) {
        await cache.put(audioUrl, response.clone())
        await this.updateCacheMetadata(track)
      }
    } catch (error) {
      console.log('Failed to cache audio:', error)
    }
  }
}
```

### Fase 3: Colaboración Offline-First (Semanas 9-12)

#### 3.1 Integración Yjs para Playlists Colaborativas
```javascript
// collaborative-playlists.js - Playlists offline-first con Yjs
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'

class CollaborativePlaylist {
  constructor(playlistId, userId) {
    this.playlistId = playlistId
    this.userId = userId
    this.doc = new Y.Doc()
    this.tracks = this.doc.getArray('tracks')
    this.metadata = this.doc.getMap('metadata')
    this.comments = this.doc.getMap('comments')
    this.presence = this.doc.getMap('presence')
    
    this.setupPersistence()
    this.setupProviders()
    this.setupObservers()
  }

  setupPersistence() {
    // Persistencia offline en IndexedDB
    this.indexeddbProvider = new IndexeddbPersistence(
      `whatsound-playlist-${this.playlistId}`, 
      this.doc
    )
    
    this.indexeddbProvider.whenSynced.then(() => {
      console.log('Playlist loaded from offline storage')
      this.renderPlaylist()
    })
  }

  setupProviders() {
    // WebSocket para sync con servidor
    this.websocketProvider = new WebsocketProvider(
      'wss://api.whatsound.com/collaboration',
      `playlist-${this.playlistId}`,
      this.doc
    )

    // WebRTC para sync P2P directo entre usuarios
    this.webrtcProvider = new WebrtcProvider(
      `playlist-${this.playlistId}`,
      this.doc
    )

    // Awareness para mostrar usuarios conectados
    this.webrtcProvider.awareness.setLocalStateField('user', {
      id: this.userId,
      name: this.userName,
      cursor: null,
      color: this.getUserColor()
    })
  }

  setupObservers() {
    // Observar cambios en tracks
    this.tracks.observe((event) => {
      event.changes.delta.forEach((change) => {
        if (change.retain) return
        
        if (change.insert) {
          this.animateTrackInsert(change.insert)
        }
        
        if (change.delete) {
          this.animateTrackDelete(change.delete)
        }
      })
      
      this.renderPlaylist()
    })

    // Observar presencia de usuarios
    this.webrtcProvider.awareness.on('change', () => {
      this.renderCollaborators()
    })

    // Observar comentarios en tiempo real
    this.comments.observe(() => {
      this.renderComments()
    })
  }

  // API para modificar playlist
  addTrack(track, position = null) {
    const trackData = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      addedBy: this.userId,
      addedAt: Date.now(),
      uuid: this.generateUUID()
    }

    if (position === null) {
      this.tracks.push([trackData])
    } else {
      this.tracks.insert(position, [trackData])
    }

    // Tracking para analytics
    this.trackAction('track_added', {
      playlistId: this.playlistId,
      trackId: track.id,
      position,
      collaborators: this.getActiveCollaborators().length
    })
  }

  removeTrack(index) {
    const track = this.tracks.get(index)
    this.tracks.delete(index, 1)
    
    this.trackAction('track_removed', {
      playlistId: this.playlistId,
      trackId: track.id,
      removedBy: this.userId
    })
  }

  reorderTrack(fromIndex, toIndex) {
    const track = this.tracks.get(fromIndex)
    this.tracks.delete(fromIndex, 1)
    this.tracks.insert(toIndex, [track])
  }

  addComment(trackIndex, commentText) {
    const commentId = this.generateUUID()
    const comment = {
      id: commentId,
      trackIndex,
      text: commentText,
      author: this.userId,
      timestamp: Date.now()
    }

    this.comments.set(commentId, comment)
  }

  // Sync status management
  getSyncStatus() {
    return {
      websocket: this.websocketProvider.wsconnected,
      webrtc: this.webrtcProvider.connected,
      offline: !navigator.onLine,
      pendingChanges: this.getPendingChanges()
    }
  }

  getPendingChanges() {
    // Calcular si hay cambios locales no sincronizados
    const localState = Y.encodeStateVector(this.doc)
    const persistedState = this.indexeddbProvider.getPersistedState()
    return !this.statesEqual(localState, persistedState)
  }

  // UI helpers
  renderSyncIndicator() {
    const status = this.getSyncStatus()
    const indicator = document.querySelector('#sync-status')
    
    if (status.offline && status.pendingChanges) {
      indicator.className = 'sync-pending'
      indicator.textContent = 'Cambios guardados localmente'
    } else if (!status.websocket && !status.webrtc) {
      indicator.className = 'sync-disconnected'  
      indicator.textContent = 'Sin conexión'
    } else {
      indicator.className = 'sync-connected'
      indicator.textContent = 'Sincronizado'
    }
  }

  renderCollaborators() {
    const awareness = this.webrtcProvider.awareness
    const collaborators = Array.from(awareness.getStates().values())
      .filter(state => state.user && state.user.id !== this.userId)
    
    const container = document.querySelector('#collaborators')
    container.innerHTML = collaborators.map(state => 
      `<div class="collaborator" style="--color: ${state.user.color}">
         <div class="avatar"></div>
         <span class="name">${state.user.name}</span>
       </div>`
    ).join('')
  }
}

// Usage
const playlist = new CollaborativePlaylist('playlist-123', 'user-456')

// Event listeners para drag & drop
document.addEventListener('drop', (e) => {
  const trackData = JSON.parse(e.dataTransfer.getData('track'))
  const position = calculateDropPosition(e.target)
  playlist.addTrack(trackData, position)
})
```

#### 3.2 Background Sync para Social Features
```javascript
// background-sync.js - Sincronización inteligente en background
class WhatsoundBackgroundSync {
  constructor() {
    this.syncStrategies = {
      'user_activity': { priority: 'high', interval: 30000 },
      'playlist_changes': { priority: 'high', interval: 15000 },
      'social_interactions': { priority: 'medium', interval: 60000 },
      'play_stats': { priority: 'low', interval: 300000 },
      'recommendations': { priority: 'low', interval: 600000 }
    }
  }

  async initBackgroundSync() {
    // Register service worker background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready
      
      // Programar syncs periódicos
      Object.keys(this.syncStrategies).forEach(async (syncType) => {
        await registration.sync.register(`sync-${syncType}`)
      })
    }

    // Fallback: sync basado en visibilidad de página
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncHighPriorityData()
      }
    })

    // Sync al recuperar conexión
    window.addEventListener('online', () => {
      this.syncAllPendingData()
    })
  }

  async syncHighPriorityData() {
    const pendingActions = await this.getPendingActions(['user_activity', 'playlist_changes'])
    
    for (const action of pendingActions) {
      try {
        await this.syncAction(action)
        await this.markActionAsSynced(action.id)
      } catch (error) {
        await this.incrementRetryCount(action.id)
        console.log(`Sync failed for action ${action.id}:`, error)
      }
    }
  }

  async syncAction(action) {
    const endpoint = this.getEndpointForAction(action.type)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      body: JSON.stringify(action.data)
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`)
    }

    return response.json()
  }

  // Conflict resolution para datos modificados mientras offline
  async resolveConflicts(localData, serverData) {
    const conflictResolution = {
      'playlist_tracks': this.resolvePlaylstConflict,
      'user_profile': this.resolveProfileConflict,
      'social_connections': this.resolveSocialConflict
    }

    const resolver = conflictResolution[localData.type]
    if (resolver) {
      return resolver(localData, serverData)
    }

    // Default: usar timestamp más reciente
    return localData.timestamp > serverData.timestamp ? localData : serverData
  }

  resolvePlaylstConflict(local, server) {
    // Para playlists: merge inteligente manteniendo orden lógico
    const localTracks = new Set(local.tracks.map(t => t.id))
    const serverTracks = new Set(server.tracks.map(t => t.id))
    
    // Tracks añadidos localmente
    const addedLocally = local.tracks.filter(t => !serverTracks.has(t.id))
    
    // Tracks añadidos en servidor  
    const addedOnServer = server.tracks.filter(t => !localTracks.has(t.id))
    
    // Mantener orden del servidor y añadir tracks locales al final
    return {
      ...server,
      tracks: [...server.tracks, ...addedLocally],
      mergedAt: Date.now()
    }
  }
}

// Service Worker sync handler
self.addEventListener('sync', event => {
  const syncTag = event.tag
  
  if (syncTag.startsWith('sync-')) {
    const syncType = syncTag.replace('sync-', '')
    event.waitUntil(performSync(syncType))
  }
})

async function performSync(syncType) {
  const syncManager = new WhatsoundBackgroundSync()
  
  switch (syncType) {
    case 'user_activity':
      await syncManager.syncUserActivity()
      break
    case 'playlist_changes':
      await syncManager.syncPlaylistChanges()
      break
    case 'social_interactions':
      await syncManager.syncSocialInteractions()
      break
    default:
      console.log(`Unknown sync type: ${syncType}`)
  }
}
```

### Fase 4: UX de Instalación Optimizada (Semanas 13-16)

#### 4.1 Install Prompt Strategy Personalizada
```javascript
// install-prompt.js - UX optimizada para instalación PWA
class WhatsoundInstallManager {
  constructor() {
    this.deferredPrompt = null
    this.installMetrics = {
      promptShown: 0,
      installationsCompleted: 0,
      dismissals: 0
    }
    
    this.setupInstallFlow()
  }

  setupInstallFlow() {
    // Capturar prompt nativo
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      
      // Evaluar si mostrar prompt personalizado
      this.evaluateInstallPrompt()
    })

    // Tracking post-instalación
    window.addEventListener('appinstalled', () => {
      this.installMetrics.installationsCompleted++
      this.trackInstallation('success')
      this.showPostInstallOnboarding()
    })
  }

  async evaluateInstallPrompt() {
    const userMetrics = await this.getUserEngagementMetrics()
    const shouldPrompt = this.shouldShowInstallPrompt(userMetrics)
    
    if (shouldPrompt) {
      // Esperar momento óptimo
      this.scheduleOptimalPrompt(userMetrics)
    }
  }

  shouldShowInstallPrompt(metrics) {
    // Criterios para mostrar prompt
    return (
      metrics.sessionCount >= 3 &&               // Al menos 3 sesiones
      metrics.totalTimeSpent > 600000 &&         // 10+ minutos total
      metrics.playlistsCreated > 0 &&            // Ha creado contenido
      !this.hasBeenDismissedRecently() &&        // No dismissal reciente
      this.installMetrics.promptShown < 3        // Máximo 3 prompts
    )
  }

  scheduleOptimalPrompt(metrics) {
    // Momentos óptimos identificados en research:
    const optimalMoments = [
      'after_playlist_creation',
      'during_peak_engagement', 
      'after_social_interaction',
      'during_offline_usage'
    ]

    // Observar eventos para triggering
    this.observeOptimalMoments()
  }

  observeOptimalMoments() {
    // Momento 1: Después de crear playlist exitosamente
    document.addEventListener('playlist-created', () => {
      setTimeout(() => this.showInstallPrompt('post_playlist'), 2000)
    })

    // Momento 2: Durante alta engagement (5+ canciones en sesión)
    let tracksPlayedInSession = 0
    document.addEventListener('track-played', () => {
      tracksPlayedInSession++
      if (tracksPlayedInSession === 5) {
        this.showInstallPrompt('high_engagement')
      }
    })

    // Momento 3: Al detectar uso offline
    window.addEventListener('offline', () => {
      this.hasUsedOffline = true
    })

    window.addEventListener('online', () => {
      if (this.hasUsedOffline) {
        setTimeout(() => this.showInstallPrompt('offline_usage'), 1000)
      }
    })
  }

  showInstallPrompt(trigger) {
    if (!this.deferredPrompt) return

    this.installMetrics.promptShown++
    
    // UI personalizada según contexto
    const promptConfig = this.getPromptConfig(trigger)
    this.renderCustomPrompt(promptConfig)
  }

  getPromptConfig(trigger) {
    const configs = {
      'post_playlist': {
        title: '¡Lleva tu música siempre contigo!',
        message: 'Instala WhatsSound y accede a tus playlists offline',
        icon: '🎵',
        primaryAction: 'Instalar App'
      },
      'high_engagement': {
        title: 'Disfrutando la experiencia?',
        message: 'Instala WhatsSound para una experiencia más fluida',
        icon: '