# Drizzle ORM - Overview
> Fuente: https://orm.drizzle.team/docs/overview
> Descargado: 2026-01-28

Drizzle ORM is a headless TypeScript ORM with a head. 🐲

It's the only ORM with both relational and SQL-like query APIs, providing the best of both worlds for accessing relational data. Drizzle is lightweight, performant, typesafe, gluten-free, sober, flexible and serverless-ready by design.

## Headless ORM?

Drizzle is a library and collection of complementary opt-in tools. Unlike data frameworks (Django-like, Spring-like), Drizzle lets you build your project the way you want, without interfering with your project or structure.

Using Drizzle you can:
- Define and manage database schemas in TypeScript
- Access your data in a SQL-like or relational way
- Take advantage of opt-in tools

## Why SQL-like?

**If you know SQL, you know Drizzle.**

Other ORMs abstract you away from SQL → double learning curve. Drizzle embraces SQL at its core.

```typescript
// Access your data
await db
  .select()
  .from(countries)
  .leftJoin(cities, eq(cities.countryId, countries.id))
  .where(eq(countries.id, 10))
```

```typescript
// Schema definition
export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
});

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
  countryId: integer('country_id').references(() => countries.id),
});
```

## Relational Queries API

For common scenarios, the Queries API fetches relational nested data without thinking about joins:

```typescript
const result = await db.query.users.findMany({
  with: {
    posts: true
  },
});
```

Drizzle always outputs exactly 1 SQL query.

## Serverless?

- **0 dependencies**
- Dialect-specific, slim, performant, serverless-ready by design
- Operates natively through industry-standard database drivers
- Supports all major PostgreSQL, MySQL, SQLite, and SingleStore drivers
