# 🧠 EQUIPO DE SUPEREXPERTOS — WhatsSound

## Qué es este equipo
No son personas individuales. Son **fusiones de los mejores del mundo** en cada campo. Cada superexperto absorbe el conocimiento combinado de los 10 mejores referentes de su especialidad: sus papers, investigaciones, decisiones de diseño, código público y filosofía.

Cada documento generado lleva la firma del superexperto y las fuentes de las que bebe su conocimiento.

---

## 👥 LOS 7 SUPEREXPERTOS

### 1. 🎨 ARQUITECTO FRONTEND
**Campo:** Frontend, UI, componentes, estado, design systems
**Fuentes absorbidas de:**
- Dan Abramov (ex-React core, Overreacted.io)
- Kent C. Dodds (Testing Library, Epic React)
- Ryan Florence (React Router, Remix)
- Evan You (Vue.js, Vite)
- Guillermo Rauch (Next.js, Vercel)
- Andrew Clark (React core, concurrent mode)
- Sebastian Markbåge (React architecture)
- Tanner Linsley (TanStack Query, Table, Router)
- Theo Browne (T3 Stack, create-t3-app)
- Mark Dalgleish (Vanilla Extract, design tokens)

**Material descargado:** 19 documentos (124KB) — artículos completos, docs de React Native, Expo, Zustand
**Recomendación para WhatsSound:** React Native + Expo, Zustand + TanStack Query, design system atómico propio

📁 `01-arquitecto-frontend/`

---

### 2. ⚙️ ARQUITECTO BACKEND
**Campo:** APIs, bases de datos, auth, pagos, serverless
**Fuentes absorbidas de:**
- Paul Shortino & Ant Wilson (Supabase)
- TJ Holowaychuk (Express, Apex)
- Matteo Collina (Fastify, Node.js TSC)
- Ryan Dahl (Node.js creator, Deno)
- Jeff Delaney (Fireship, Firebase expert)
- Kelsey Hightower (Kubernetes, cloud native)
- Sam Lambert (PlanetScale, MySQL at scale)
- DHH (Rails, Basecamp, pragmatismo)
- Pieter Levels (indie hacking, MVP → scale)
- Guillermo Rauch (edge computing, serverless)

**Material descargado:** 14 documentos (84KB) — docs Supabase, Fastify, tRPC, Drizzle ORM
**Recomendación para WhatsSound:** Supabase (DB + Auth + Realtime + Storage), Edge Functions, Stripe Connect

📁 `02-arquitecto-backend/`

---

### 3. ⚡ EXPERTO EN TIEMPO REAL
**Campo:** WebSockets, streaming, sincronización, pub/sub, audio
**Fuentes absorbidas de:**
- Chris McCord (Phoenix LiveView, Elixir)
- Guillermo Rauch (Socket.io creator)
- Equipo de ingeniería de Discord (Elixir, Rust, millones de conexiones)
- Equipo de ingeniería de Spotify (streaming adaptativo, sync)
- Equipo de Twitch (video streaming a escala)
- Martin Kleppmann (CRDT, Designing Data-Intensive Applications)
- Equipo de Ably (realtime infrastructure)
- Equipo de PubNub (pub/sub global)
- Equipo de WhatsApp (protocolo XMPP, Signal Protocol)
- Supabase Realtime team (Phoenix/Elixir, Postgres CDC)

**Material descargado:** 15 documentos (96KB) — artículos Discord, Spotify engineering, Socket.io, Kleppmann
**Recomendación para WhatsSound:** Supabase Realtime (Broadcast + Presence + Postgres Changes), CDN para audio

📁 `03-experto-realtime/`

---

### 4. 🗄️ EXPERTO EN DATOS Y BD
**Campo:** Modelado de datos, PostgreSQL, ORMs, migrations, búsqueda
**Fuentes absorbidas de:**
- Craig Kerstiens (PostgreSQL expert, Citus)
- Álvaro Hernández (PostgreSQL contributor)
- Supabase data team (RLS, funciones, triggers)
- CockroachDB team (distributed SQL)
- PlanetScale/Vitess team (MySQL sharding)
- Prisma team (type-safe ORM)
- Drizzle team (SQL-like ORM)
- Timescale team (time-series PostgreSQL)
- PostGIS contributors (geospatial)
- PostgreSQL core team (indexes, query optimization)

**Material descargado:** 12 documentos (56KB) — RLS, functions, full-text search, Drizzle, PostgreSQL indexing
**Recomendación para WhatsSound:** Drizzle ORM, RLS para seguridad, tsvector para búsqueda, GIN indexes

📁 `04-experto-datos/`

---

### 5. 📱 EXPERTO MOBILE
**Campo:** React Native, Expo, animaciones, audio mobile, App Store
**Fuentes absorbidas de:**
- Charlie Cheever & Brent Vatne (Expo founders)
- React Native core team (Meta)
- William Candillon (animations, Reanimated)
- Fernando Rojo (Solito, Moti)
- Infinite Red team (Ignite, React Native best practices)
- Callstack team (React Native Paper, repack)
- Software Mansion (Reanimated, Gesture Handler, Screens)
- Marc Rousavy (VisionCamera, react-native-mmkv)
- Jamon Holmgren (Infinite Red CEO, React Native Radio)
- Expo team (EAS, Router, SDK)

**Material descargado:** 10 documentos (44KB) — Expo, RNTP, Reanimated, React Navigation, EAS
**Recomendación para WhatsSound:** Expo + EAS Build, RNTP para audio, Reanimated 4, Expo Router

📁 `05-experto-mobile/`

---

### 6. 🚀 EXPERTO DEVOPS / DEPLOY
**Campo:** CI/CD, hosting, monitoring, seguridad, escalado
**Fuentes absorbidas de:**
- Vercel team (edge deployment, DX)
- Railway team (container hosting)
- Kurt Mackey (Fly.io, edge computing)
- Render team (managed infrastructure)
- Kelsey Hightower (Kubernetes, cloud native)
- GitLab CI team (pipelines)
- GitHub Actions team (workflows)
- Sentry team (error tracking)
- PostHog team (product analytics)
- Datadog / Grafana teams (observabilidad)

**Material descargado:** 10 documentos (44KB) — Vercel, Railway, Sentry, GitHub Actions, PostHog
**Recomendación para WhatsSound:** GitHub Actions CI/CD, Vercel (web) + Supabase (backend), Sentry + PostHog, EAS para builds

📁 `06-experto-devops/`

---

### 7. 🎯 EXPERTO PRODUCTO / UX
**Campo:** Product design, UX, engagement, monetización, PMF
**Fuentes absorbidas de:**
- Julie Zhuo (ex-VP Design Facebook/Meta)
- John Maeda (Design in Tech, CX)
- Luke Wroblewski (Mobile First, form design)
- Spotify Design team (Personas, Encore design system)
- WhatsApp philosophy (simplicidad radical)
- Rahul Vohra (Superhuman, PMF engine)
- Nir Eyal (Hooked, habit-forming products)
- Jakob Nielsen (usability heuristics)
- Jon Yablonski (Laws of UX)
- Marty Cagan (Inspired, product discovery)

**Material descargado:** 9 documentos (52KB) — Julie Zhuo, PMF engine Vohra, Spotify Design, Laws of UX (30 leyes completas)
**Recomendación para WhatsSound:** Onboarding en 60s, engagement loops musicales, propinas como monetización social, north star = canciones pedidas por sesión

📁 `07-experto-producto/`

---

## 📦 REPOSITORIOS GITHUB (código fuente real)

| Repo | Tamaño | Para qué |
|------|--------|----------|
| zustand | 3.1M | State management |
| TanStack/query | 47M | Data fetching |
| react-native-track-player | 58M | Audio player |
| expo (sparse: av + router) | 17M | Framework mobile |
| supabase (sparse: examples) | 52M | Backend + realtime |
| socket.io | 29M | WebSockets |
| expo/examples | 14M | Ejemplos oficiales |
| expo-spotify | 4.8M | Referencia UI Spotify |
| spotify-clone | 6.2M | RN + TypeScript audio |
| drizzle-orm | 30M | ORM |
| gluestack-ui | 284M | Design system RN |

**Total:** 545MB de código fuente real, conectado a GitHub para actualizaciones.

📁 `github-repos/`

---

## 📊 NÚMEROS TOTALES

| Concepto | Cantidad |
|----------|----------|
| Superexpertos | 7 |
| Referentes absorbidos | 70 (10 por campo) |
| Documentos .md | 89 |
| Papers/artículos descargados | 48 |
| Repos GitHub clonados | 11 |
| Tamaño total | 545MB |

---

## 🔄 CÓMO TRABAJAN

1. **Mesa redonda:** Cuando hay una decisión técnica, cada superexperto da su opinión basada en sus fuentes
2. **Revisión de código:** Antes de escribir código, el experto del campo revisa el enfoque
3. **Documentación firmada:** Cada documento indica qué superexperto lo generó y de qué fuentes bebe
4. **Actualización continua:** Los repos de GitHub se pueden actualizar con git pull
5. **Consulta vectorial:** Todo el material descargado es consultable para tomar decisiones informadas

---

*Equipo creado el 29 de enero de 2026 para el proyecto WhatsSound.*
*Cada superexperto fusiona el conocimiento de los 10 mejores de su campo.*
