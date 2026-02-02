# 🔌 API Design Patterns: REST vs tRPC vs GraphQL

## Veredicto para WhatsSound: **Supabase REST (auto-generated) + tRPC para Edge Functions** ✅

## Comparativa

| Criterio | REST (Supabase PostgREST) | tRPC | GraphQL |
|----------|---------------------------|------|---------|
| **Type safety** | Generada con `supabase gen types` | Nativa, end-to-end | Con codegen (GraphQL Code Generator) |
| **Setup** | Zero (viene con Supabase) | Mínimo (solo TypeScript) | Alto (schema, resolvers, server) |
| **Performance** | Excelente (PostgREST en Haskell) | Excelente (lightweight) | Overhead de parsing/resolving |
| **Realtime** | Supabase Realtime separado | Subscriptions (WebSocket) | Subscriptions (complejo) |
| **Over/under-fetching** | Filtros con `.select()` | No aplica (RPC) | Resuelto por diseño |
| **Learning curve** | Baja | Baja (si usas TS) | Alta |
| **Mobile clients** | Supabase SDK | Solo web/Node | Apollo Client (pesado) |
| **Caching** | HTTP caching estándar | React Query integrado | Apollo cache (complejo) |

## Estrategia para WhatsSound

### Capa 1: Supabase Client SDK (80% de las queries)
```typescript
// Acceso directo a DB con type safety
const { data: sessions } = await supabase
  .from('dj_sessions')
  .select('*, dj:users(*), songs(*)')
  .eq('status', 'live')
  .order('created_at', { ascending: false })
```
- **PostgREST** genera REST API automáticamente desde el schema
- **RLS** filtra datos por usuario sin lógica en servidor
- **Realtime** escucha cambios sin API extra

### Capa 2: Edge Functions para Lógica Compleja (20%)
```typescript
// Edge Function con validación
Deno.serve(async (req) => {
  const { sessionId, songId } = await req.json()
  
  // Lógica de negocio que no cabe en RLS
  const canVote = await checkVotingRules(sessionId, userId)
  if (!canVote) return new Response('Rate limited', { status: 429 })
  
  // Insert con service role (bypass RLS)
  await supabaseAdmin.from('votes').insert({ sessionId, songId, userId })
  return Response.json({ ok: true })
})
```

### Por Qué NO GraphQL
1. **Overhead innecesario** — Supabase ya resuelve over-fetching con `.select()`
2. **Complejidad** — Schema duplication (PostgreSQL + GraphQL schema)
3. **Mobile** — Apollo Client añade ~50KB al bundle
4. **N+1 problem** — Hay que resolver manualmente con DataLoaders
5. **DHH lo dice bien:** "GraphQL is solving Facebook's problems, not yours"

### Por Qué NO tRPC como Capa Principal
1. **React Native** — tRPC funciona mejor en Next.js/web
2. **Supabase SDK** — Ya da type safety con `supabase gen types typescript`
3. **Duplicación** — Crear un servidor tRPC encima de Supabase es redundante

### Cuándo SÍ usar tRPC
- Si decides mover lógica pesada a un servidor Fastify separado
- Para comunicación server-to-server entre microservicios TypeScript
- Como reemplazo de REST en Edge Functions complejas

## Fastify vs Express (Si Necesitas Servidor Custom)

**Fastify gana** por goleada:
- **~47K req/s** vs Express ~9K req/s (5x más rápido)
- Schema validation con JSON Schema (validación y serialización)
- Plugin system superior (encapsulación, decorators)
- Logging con Pino (10x más rápido que console.log)
- TypeScript first-class support
- Hooks lifecycle más granular

```typescript
// Fastify con type safety
import Fastify from 'fastify'

const app = Fastify({ logger: true }) // Pino automático

app.post<{
  Body: { sessionId: string; songId: string }
}>('/vote', {
  schema: {
    body: {
      type: 'object',
      required: ['sessionId', 'songId'],
      properties: {
        sessionId: { type: 'string', format: 'uuid' },
        songId: { type: 'string', format: 'uuid' }
      }
    }
  }
}, async (req) => {
  // Body ya validado y tipado
  return { ok: true }
})
```

**Pero para WhatsSound:** Supabase Edge Functions (Deno) cubren el 95% de los casos. Fastify solo si necesitas un servicio dedicado (ej: procesamiento de audio).

## Fuentes
- https://trpc.io/docs
- https://fastify.dev/benchmarks/
- https://supabase.com/docs/guides/api
- https://postgrest.org
- Matteo Collina talks: NodeConf, Node.js collaborator summit
