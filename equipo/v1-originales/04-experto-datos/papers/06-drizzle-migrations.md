# Drizzle ORM - Migrations
> Fuente: https://orm.drizzle.team/docs/migrations
> Descargado: 2026-01-28

## Fundamentals

SQL databases require strict schema definitions upfront. When you need to change entities, you need schema migrations.

Two approaches:
- **Database first**: DB schema is source of truth → pull to codebase
- **Codebase first**: TypeScript schema is source of truth → push to DB

## drizzle-kit Commands

| Command | Purpose |
|---------|---------|
| `drizzle-kit migrate` | Apply SQL migrations to database |
| `drizzle-kit generate` | Generate SQL migration files from schema diff |
| `drizzle-kit push` | Push schema directly to database (no migration files) |
| `drizzle-kit pull` | Pull database schema to TypeScript |

## Migration Options

### Option 1: Database First (pull)
Use external tools to manage DB, then `drizzle-kit pull` to generate TypeScript schema.

### Option 2: Push (no migration files)
Best for rapid prototyping. Schema in TypeScript → `drizzle-kit push` → applies directly to DB.

### Option 3: Generate + Migrate (CLI)
Schema changes → `drizzle-kit generate` creates SQL files → `drizzle-kit migrate` applies them.

### Option 4: Generate + Runtime Migrate
Generate SQL files, then apply during app runtime:
```typescript
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const db = drizzle(process.env.DATABASE_URL);
await migrate(db);
```
Good for monolithic apps with zero-downtime deployment.

### Option 5: Generate + External Tools
Generate SQL files with Drizzle, apply via external tools (Bytebase, Liquibase, Atlas, etc.)

### Option 6: Export + Atlas
`drizzle-kit export` outputs SQL to console → apply via Atlas or other tools.

## Generated Migration Structure
```
📂 drizzle
└ 📂 20242409125510_premium_mister_fear
  ├ 📜 snapshot.json
  └ 📜 migration.sql
```
