# 📚 Catálogo de Fuentes — Arquitecto Backend

## 1. Paul Copplestone (CEO Supabase)
- **Blog:** https://supabase.com/blog
- **GitHub:** https://github.com/kiwicopple
- **Twitter:** https://twitter.com/kaborafluffy
- **Charla clave:** "Building Supabase" — https://www.youtube.com/watch?v=WiwFnwOqFGI
- **Filosofía:** Open source > vendor lock-in; PostgreSQL como fundación universal

## 2. Ant Wilson (CTO Supabase)
- **GitHub:** https://github.com/awalias
- **Twitter:** https://twitter.com/antwilson
- **Contribución:** Diseñó Supabase Realtime (Elixir/Phoenix sobre PostgreSQL logical replication)
- **Repo Realtime:** https://github.com/supabase/realtime
- **Charla:** "Supabase Realtime Architecture" en Supabase Launch Week

## 3. TJ Holowaychuk (Creador Express.js)
- **GitHub:** https://github.com/tj (11K+ repos/paquetes npm)
- **Blog:** https://medium.com/@tjholowaychuk
- **Repos clave:** Express.js, Koa, Commander.js, Mocha, Jade/Pug
- **Impacto:** Definió el modelo middleware de Node.js que usamos hoy
- **Post famoso:** "Farewell Node.js" (2014) — anticipó problemas que Deno resolvió

## 4. Matteo Collina (Creador Fastify)
- **GitHub:** https://github.com/mcollina
- **Twitter:** https://twitter.com/matteocollina
- **Web:** https://www.matteo.collina.com/
- **Repo:** https://github.com/fastify/fastify
- **Benchmarks:** https://fastify.dev/benchmarks/ — Fastify ~47K req/s vs Express ~9K req/s
- **Charla:** "Take your HTTP server to ludicrous speed" — NodeConf
- **Otro:** Pino logger (JSON logging ultrarrápido), Node.js TSC member

## 5. Ryan Dahl (Creador Node.js y Deno)
- **GitHub:** https://github.com/ry
- **Charla histórica:** "10 Things I Regret About Node.js" — JSConf EU 2018
  - https://www.youtube.com/watch?v=M3BM9TB-8yA
- **Deno:** https://deno.land / https://github.com/denoland/deno
- **Impacto en WhatsSound:** Supabase Edge Functions corren en Deno

## 6. Jeff Delaney (Fireship)
- **YouTube:** https://www.youtube.com/@Fireship (2M+ subs)
- **Web:** https://fireship.io
- **GitHub:** https://github.com/codediodeio
- **Videos relevantes:**
  - "Supabase in 100 Seconds": https://www.youtube.com/watch?v=zBZgdTb-dns
  - "7 Database Paradigms": explica cuándo usar qué
  - "Firebase vs Supabase": comparativa práctica
- **Valor:** Explicaciones pragmáticas, corta el hype

## 7. Kelsey Hightower (Kubernetes / Google Cloud)
- **GitHub:** https://github.com/kelseyhightower
- **Twitter:** https://twitter.com/kelseyhightower
- **Repo famoso:** "kubernetes-the-hard-way" — https://github.com/kelseyhightower/kubernetes-the-hard-way
- **Charla:** "No Code" keynote (irónica, sobre simplicidad)
- **Filosofía:** "Use managed services until you can't"

## 8. Sam Lambert (ex-CEO PlanetScale)
- **Twitter:** https://twitter.com/isamlambert
- **Blog PlanetScale:** https://planetscale.com/blog
- **Concepto clave:** Database branching (como Git para tu DB)
- **Nota 2024:** PlanetScale eliminó free tier, validando el modelo Supabase con free tier generoso

## 9. DHH - David Heinemeier Hansson (Creador Rails)
- **Blog:** https://world.hey.com/dhh
- **GitHub:** https://github.com/dhh
- **Twitter:** https://twitter.com/dhh
- **Posts clave:**
  - "The Majestic Monolith" — https://m.signalvnoise.com/the-majestic-monolith/
  - "Why we're leaving the cloud" (2023) — anti-serverless puro
- **Libro:** "Getting Real" (37signals)
- **Valor para WhatsSound:** No sobrecomplicar, monolito bien hecho > microservicios mal hechos

## 10. Pieter Levels (levelsio)
- **Twitter:** https://twitter.com/levelsio
- **Web:** https://levels.io
- **Productos:** Nomad List, Remote OK, Photo AI ($3M+ ARR)
- **Stack:** PHP/jQuery → ahora Cursor + Supabase para nuevos proyectos
- **Filosofía:** Un dev, un servidor, ship daily, sin over-engineering
- **Podcast:** Lex Fridman #504 — https://www.youtube.com/watch?v=oFtjKbXKqbg

---

## Fuentes Técnicas Específicas

### Supabase
- **Docs oficiales:** https://supabase.com/docs
- **Realtime docs:** https://supabase.com/docs/guides/realtime
- **Auth docs:** https://supabase.com/docs/guides/auth
- **Edge Functions:** https://supabase.com/docs/guides/functions
- **Self-hosting:** https://supabase.com/docs/guides/self-hosting
- **Blog técnico:** https://supabase.com/blog
- **GitHub org:** https://github.com/supabase

### Fastify
- **Docs:** https://fastify.dev/docs/latest/
- **Benchmarks:** https://fastify.dev/benchmarks/
- **Plugins ecosystem:** https://fastify.dev/ecosystem/

### tRPC
- **Docs:** https://trpc.io/docs
- **GitHub:** https://github.com/trpc/trpc
- **Valor:** Type-safety end-to-end sin code generation

### Pagos
- **Stripe Docs:** https://stripe.com/docs
- **RevenueCat Docs:** https://docs.revenuecat.com
- **RevenueCat + Stripe:** https://www.revenuecat.com/docs/stripe

### Arquitectura de Mensajería
- **WhatsApp Architecture (paper):** "WhatsApp Engineering at Scale" — InfoQ
- **Discord Architecture:** https://discord.com/blog/how-discord-stores-trillions-of-messages
- **Signal Protocol:** https://signal.org/docs/

### Recursos Generales
- **System Design Primer:** https://github.com/donnemartin/system-design-primer
- **High Scalability blog:** http://highscalability.com
- **Martin Fowler patterns:** https://martinfowler.com/articles/patterns-of-distributed-systems/
