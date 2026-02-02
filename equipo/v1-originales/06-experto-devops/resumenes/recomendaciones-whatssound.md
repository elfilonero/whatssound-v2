# 🎯 Recomendaciones WhatsSound — SUPEREXPERTO #6: Deployer

## Stack de Infraestructura Recomendado

```
Backend API:     Vercel (serverless functions)
Base de Datos:   Supabase (PostgreSQL managed + Auth + Storage)
Audio Storage:   Supabase Storage + CDN
Mobile Builds:   EAS Build (Expo)
Store Submit:    EAS Submit
OTA Updates:     Expo Updates (expo-updates)
CI/CD:           GitHub Actions
Error Tracking:  Sentry
Analytics:       PostHog
Monitoring BD:   Supabase Dashboard + pg_stat_statements
```

---

## 1. GitHub Actions Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD WhatsSound

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test

  deploy-api:
    needs: lint-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  migrate-db:
    needs: lint-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm install --frozen-lockfile
      - run: pnpm drizzle-kit migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  build-mobile:
    needs: lint-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive --profile production

  ota-update:
    needs: [deploy-api]
    if: github.ref == 'refs/heads/main' && contains(github.event.head_commit.message, '[ota]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas update --branch production --message "${{ github.event.head_commit.message }}"
```

---

## 2. Vercel Configuration

```json
// vercel.json
{
  "framework": null,
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "s-maxage=0, stale-while-revalidate" }
      ]
    }
  ]
}
```

---

## 3. Supabase Storage para Audio

```typescript
// Upload de canción
async function uploadSong(file: File, userId: string) {
  const path = `songs/${userId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(path, file, {
      contentType: 'audio/mpeg',
      cacheControl: '31536000', // 1 año (inmutable)
      upsert: false,
    });

  // URL pública con CDN
  const { data: { publicUrl } } = supabase.storage
    .from('audio')
    .getPublicUrl(path);

  return publicUrl;
}
```

**Storage policies:**
```sql
-- Solo el usuario puede subir a su carpeta
CREATE POLICY "Users upload own songs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio' AND
    (storage.foldername(name))[1] = 'songs' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Audio público para reproducción
CREATE POLICY "Audio is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio');
```

---

## 4. Sentry Setup

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2, // 20% de transacciones
  profilesSampleRate: 0.1,
  environment: __DEV__ ? 'development' : 'production',
  integrations: [
    Sentry.reactNativeTracingIntegration(),
  ],
});

// Capturar errores de audio
try {
  await TrackPlayer.play();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'audio-player' },
    extra: { trackId: currentTrack.id },
  });
}
```

---

## 5. PostHog Analytics

```typescript
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY, {
  host: 'https://app.posthog.com',
});

// Eventos clave a trackear:
posthog.capture('song_played', { songId, artistId, duration });
posthog.capture('tip_sent', { amount, songId });
posthog.capture('follow', { artistId });
posthog.capture('song_uploaded', { genre, duration });
posthog.capture('search', { query, resultsCount });
```

---

## 6. EAS Build Profiles

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true,
      "env": { "APP_ENV": "production" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "dev@whatssound.app",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./play-store-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 7. Estrategia de Environments

| Environment | Backend | BD | Mobile | Trigger |
|---|---|---|---|---|
| **Development** | localhost:3000 | Supabase local (CLI) | Expo Dev Client | `pnpm dev` |
| **Preview** | Vercel Preview | Supabase staging project | EAS preview build | PR a main |
| **Production** | Vercel Prod | Supabase prod project | EAS production build | Merge a main |

---

## 8. Costos Estimados (MVP → Scale)

| Servicio | MVP (gratis/mínimo) | 1K usuarios | 10K usuarios |
|---|---|---|---|
| Supabase | Free | $25/mes | $25/mes + usage |
| Vercel | Free | Free | $20/mes |
| EAS Build | Free (30/mes) | Free | $99/mes |
| Sentry | Free (5K events) | Free | $26/mes |
| PostHog | Free (1M events) | Free | Free |
| **TOTAL** | **$0** | **$25/mes** | **~$170/mes** |

---

## Prioridades de Implementación

1. **Semana 1:** GitHub Actions (lint + test) + Vercel deploy + Supabase proyecto
2. **Semana 2:** EAS Build config + Sentry + Storage policies
3. **Semana 3:** PostHog + OTA updates pipeline
4. **Semana 4:** Preview environments + monitoring dashboards
