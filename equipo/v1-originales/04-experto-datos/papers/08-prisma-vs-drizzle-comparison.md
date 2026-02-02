# Prisma vs Drizzle ORM - Comparison
> Fuente: https://www.prisma.io/docs/orm/more/comparisons/prisma-and-drizzle
> Descargado: 2026-01-28
> Nota: Esta comparación está escrita por Prisma, por lo que tiene sesgo hacia su producto.

## Overview

- **Drizzle**: Traditional SQL query builder with JS/TS functions. SQL-like API + Queries API for relational data. Schema defined in TypeScript files.
- **Prisma**: Higher-level abstraction with Prisma Schema Language (PSL). Auto-generated type-safe client. Uses declarative `.prisma` schema.

## Key Differences

### Philosophy
- **Drizzle**: "If you know SQL, you know Drizzle" — thin wrapper around SQL
- **Prisma**: Higher-level, team-friendly, no SQL expertise required

### Type Safety
- **Drizzle**: Types on query results, but can write invalid queries
- **Prisma**: Full type safety via generated types

### Schema Definition

**Prisma** (PSL):
```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String?
  email String  @unique
  posts Post[]
}
```

**Drizzle** (TypeScript):
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
  email: varchar('email', { length: 256 }).unique(),
})
```

### Querying

**Read (similar with Queries API)**:
```typescript
// Prisma
const users = await prisma.user.findMany()
const user = await prisma.user.findUnique({ where: { email: 'nilu@prisma.io' } })

// Drizzle
const users = await db.query.users.findMany()
const user = await db.query.users.findFirst({ where: eq(users.email, 'nilu@prisma.io') })
```

**Mutations (Drizzle uses SQL-like API)**:
```typescript
// Prisma
await prisma.user.create({ data: { name: 'Nilu', email: 'nilu@prisma.io' } })
await prisma.user.update({ where: { email: '...' }, data: { name: 'New' } })

// Drizzle
await db.insert(users).values({ name: 'Nilu', email: 'nilu@prisma.io' })
await db.update(users).set({ name: 'New' }).where(eq(users.email, '...')).returning()
```

### Relations
```typescript
// Prisma
const posts = await prisma.post.findMany({ include: { author: true } })

// Drizzle
const posts = await db.query.posts.findMany({ with: { author: true } })
```

### Filtering
- **Prisma**: Provides `contains`, `startsWith`, `endsWith`
- **Drizzle**: Uses SQL operators `like`, `ilike` with wildcards

### Migrations
Both generate SQL files from model definitions. Both allow modification before execution.

### Database Support
- **Prisma**: Also supports CockroachDB, MSSQL, MongoDB
- **Drizzle**: Also supports Cloudflare D1, bun:sqlite

## When to Choose

| Factor | Prisma | Drizzle |
|--------|--------|---------|
| Team with mixed SQL experience | ✅ Better | ⚠️ Requires SQL knowledge |
| Solo dev who loves SQL | ⚠️ More abstraction | ✅ Direct SQL feel |
| Type safety | ✅ Full | ⚠️ Partial |
| Performance/bundle size | ⚠️ Larger | ✅ 0 dependencies |
| Serverless | ⚠️ Needs Accelerate | ✅ Native |
| Ecosystem maturity | ✅ Since 2021 | ⚠️ Newer |
| MongoDB support | ✅ | ❌ |

## Ecosystem
- Prisma: Studio, Accelerate (connection pooler), Optimize, ERD generators, Zod generators, tRPC generators
- Drizzle: Studio, lightweight, SQL-native
