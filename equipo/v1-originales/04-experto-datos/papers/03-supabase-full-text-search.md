# Supabase Full Text Search
> Fuente: https://supabase.com/docs/guides/database/full-text-search
> Descargado: 2026-01-28

## How to use full text search in PostgreSQL.

Postgres has built-in functions to handle Full Text Search queries — like a "search engine" within Postgres.

## Core Functions

### to_tsvector()
Converts data into searchable tokens ("to text search vector"):
```sql
select to_tsvector('green eggs and ham');
-- Returns 'egg':2 'green':1 'ham':4
```

### to_tsquery()
Converts a query string into tokens to match. Variants:
- `to_tsquery()` - Manual operators (&, |, !)
- `plainto_tsquery()` - Plain text to AND query
- `phraseto_tsquery()` - Creates phrase queries
- `websearch_to_tsquery()` - Web search syntax with quotes, "or", and negation

### Match: @@
The match symbol for Full Text Search:
```sql
select *
from books
where to_tsvector(title) @@ to_tsquery('Harry');
```

## Basic Queries

### Search a single column
```sql
select * from books
where to_tsvector(description) @@ to_tsquery('big');
```

### Search multiple columns
```sql
select * from books
where to_tsvector(description || ' ' || title) @@ to_tsquery('little');
```

### Match all search words (AND)
```sql
where to_tsvector(description) @@ to_tsquery('little & big');
```

### Match any search words (OR)
```sql
where to_tsvector(description) @@ to_tsquery('little | big');
```

## Partial Search
```sql
select title from books where to_tsvector(title) @@ to_tsquery('Lit:*');
```

### RPC function for partial search
```sql
create or replace function search_books_by_title_prefix(prefix text)
returns setof books AS $$
begin
  return query
  select * from books where to_tsvector('english', title) @@ to_tsquery(prefix || ':*');
end;
$$ language plpgsql;
```

## Web Search Syntax (websearch_to_tsquery)

```sql
-- Basic
where to_tsvector(description) @@ websearch_to_tsquery('english', 'green eggs');

-- Quoted phrases
@@ websearch_to_tsquery('english', '"Green Eggs"');

-- OR searches
@@ websearch_to_tsquery('english', 'puppy or rabbit');

-- Negation
@@ websearch_to_tsquery('english', 'animal -rabbit');

-- Complex
@@ websearch_to_tsquery('english', '"Harry Potter" or "Dr. Seuss" -vegetables');
```

## Creating Indexes

### Generated column + GIN index
```sql
alter table books
add column fts tsvector generated always as (to_tsvector('english', description || ' ' || title)) stored;

create index books_fts on books using gin (fts);
```

## Advanced Operators

### Proximity
```sql
-- Adjacent words
where to_tsvector(description) @@ to_tsquery('big <-> dreams');
-- Within 2 words
where to_tsvector(description) @@ to_tsquery('year <2> school');
```

### Negation
```sql
where to_tsvector(description) @@ to_tsquery('big & !little');
```

## Ranking

### Basic ranking function
```sql
create or replace function search_books(search_query text)
returns table(id int, title text, description text, rank real) as $$
begin
  return query
  select books.id, books.title, books.description,
    ts_rank(to_tsvector('english', books.description), to_tsquery(search_query)) as rank
  from books
  where to_tsvector('english', books.description) @@ to_tsquery(search_query)
  order by rank desc;
end;
$$ language plpgsql;
```

### Weighted columns
Weight labels: A (1.0), B (0.4), C (0.2), D (0.1)

```sql
alter table books
add column fts_weighted tsvector
generated always as (
  setweight(to_tsvector('english', title), 'A') ||
  setweight(to_tsvector('english', description), 'B')
) stored;

create index books_fts_weighted on books using gin (fts_weighted);
```
