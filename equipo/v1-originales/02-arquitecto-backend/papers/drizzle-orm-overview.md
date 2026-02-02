# Drizzle ORM - Why Drizzle?
Source: https://orm.drizzle.team/docs/overview

Drizzle ORM is a headless TypeScript ORM with a head. 🐲

It looks and feels simple, performs on day 1000 of your project, lets you do things your way, and is there when you need it.

It's the only ORM with both relational and SQL-like query APIs, providing you the best of both worlds when it comes to accessing your relational data. Drizzle is lightweight, performant, typesafe, non-lactose, gluten-free, sober, flexible and serverless-ready by design.

## Headless ORM?

First and foremost, Drizzle is a library and a collection of complementary opt-in tools.

ORM stands for object relational mapping, and developers tend to call Django-like or Spring-like tools an ORM. We truly believe it's a misconception based on legacy nomenclature, and we call them data frameworks.

Drizzle lets you build your project the way you want, without interfering with your project or structure.

Using Drizzle you can define and manage database schemas in TypeScript, access your data in a SQL-like or relational way, and take advantage of opt-in tools to push your developer experience through the roof.

## Why SQL-like?

If you know SQL, you know Drizzle.

Other ORMs and data frameworks tend to deviate/abstract you away from SQL, which leads to a double learning curve: needing to know both SQL and the framework's API.

Drizzle is the opposite. We embrace SQL and built Drizzle to be SQL-like at its core, so you can have zero to no learning curve and access to the full power of SQL.

```ts
// Access your data
await db
  .select()
  .from(countries)
  .leftJoin(cities, eq(cities.countryId, countries.id))
  .where(eq(countries.id, 10))
```

```ts
// manage your schema
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

## Why not SQL-like?

We've built the Queries API for you, so you can fetch relational nested data from the database in the most convenient and performant way, and never think about joins and data mapping.

Drizzle always outputs exactly 1 SQL query. Feel free to use it with serverless databases and never worry about performance or roundtrip costs!

```ts
const result = await db.query.users.findMany({
  with: {
    posts: true
  },
});
```

## Serverless?

The best part is no part. Drizzle has exactly 0 dependencies!

Drizzle ORM is dialect-specific, slim, performant and serverless-ready by design. We support all major PostgreSQL, MySQL, SQLite or SingleStore drivers.

## Welcome on board!

More and more companies are adopting Drizzle in production, experiencing immense benefits in both DX and performance.

Now go build something awesome with Drizzle and your PostgreSQL, MySQL or SQLite database. 🚀
