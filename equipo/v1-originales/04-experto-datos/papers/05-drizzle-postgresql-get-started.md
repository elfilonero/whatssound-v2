# Drizzle ORM - Get Started with PostgreSQL
> Fuente: https://orm.drizzle.team/docs/get-started/postgresql-new
> Descargado: 2026-01-28

## Prerequisites
- dotenv - environment variables
- tsx - running TypeScript files
- node-postgres - querying PostgreSQL

## File Structure
```
📦 <project root>
 ├ 📂 drizzle
 ├ 📂 src
 │ ├ 📂 db
 │ │ └ 📜 schema.ts
 │ └ 📜 index.ts
 ├ 📜 .env
 ├ 📜 drizzle.config.ts
 ├ 📜 package.json
 └ 📜 tsconfig.json
```

## Step 1 - Install packages
```bash
npm i drizzle-orm pg dotenv
npm i -D drizzle-kit tsx @types/pg
```

## Step 2 - Setup .env
```
DATABASE_URL=
```

## Step 3 - Connect to database
```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL!);
```

With config:
```typescript
const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true
  }
});
```

With Pool:
```typescript
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle({ client: pool });
```

## Step 4 - Create a table
```typescript
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
```

## Step 5 - Drizzle config
```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Step 6 - Apply changes
```bash
npx drizzle-kit push
# Or generate + apply migrations:
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Step 7 - CRUD operations
```typescript
import { eq } from 'drizzle-orm';
import { usersTable } from './db/schema';

async function main() {
  // Create
  await db.insert(usersTable).values({ name: 'John', age: 30, email: 'john@example.com' });

  // Read
  const users = await db.select().from(usersTable);

  // Update
  await db.update(usersTable).set({ age: 31 }).where(eq(usersTable.email, 'john@example.com'));

  // Delete
  await db.delete(usersTable).where(eq(usersTable.email, 'john@example.com'));
}
```

## Step 8 - Run
```bash
npx tsx src/index.ts
```
