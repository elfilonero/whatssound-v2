# PostgreSQL Indexing - Official Documentation
> Fuente: https://www.postgresql.org/docs/current/indexes.html (Chapter 11)
> Descargado: 2026-01-28

## 11.1 Introduction

Indexes allow the database server to find and retrieve specific rows much faster than without an index. But indexes also add overhead, so they should be used sensibly.

```sql
CREATE INDEX test1_id_index ON test1 (id);
```

Key points:
- No further intervention required after creation — system auto-updates the index
- Run `ANALYZE` regularly to update statistics for the query planner
- Indexes benefit SELECT, UPDATE, DELETE with search conditions, and JOINs
- Creating an index on a large table can take a long time
- Reads are allowed during index creation; writes are blocked (unless using CONCURRENTLY)
- Indexes that are seldom used should be removed (they add overhead)

## 11.2 Index Types

PostgreSQL provides several index types:

### B-Tree (default)
- Handles equality and range queries: `< <= = >= >`
- Supports `BETWEEN`, `IN`, `IS NULL`, `IS NOT NULL`
- Pattern matching with anchored patterns: `col LIKE 'foo%'`
- Can retrieve data in sorted order

### Hash
- Only handles simple equality: `=`
- Stores 32-bit hash codes

### GiST
- Infrastructure for many indexing strategies
- Used for geometric data types, nearest-neighbor searches
- Supports operators like `@> <@ && ~=`

### SP-GiST
- Supports non-balanced data structures: quadtrees, k-d trees, radix trees
- Good for two-dimensional points

### GIN (Generalized Inverted Index)
- "Inverted indexes" for data with multiple component values (arrays, full-text search)
- Supports `<@ @> = &&`

### BRIN (Block Range INdex)
- Stores summaries for consecutive physical block ranges
- Most effective when column values correlate with physical row order
- Supports `< <= = >= >`

## 11.3 Multicolumn Indexes

```sql
CREATE INDEX test2_mm_idx ON test2 (major, minor);
```

- B-tree, GiST, GIN, and BRIN support multicolumn indexes
- Up to 32 columns
- B-tree: most efficient when constraints are on leading (leftmost) columns
- B-tree supports skip scan optimization for non-leading column queries
- GIN: effectiveness is same regardless of which columns are used
- **Use sparingly** — single column indexes are usually sufficient

## 11.6 Unique Indexes

```sql
CREATE UNIQUE INDEX name ON table (column [, ...]) [ NULLS [ NOT ] DISTINCT ];
```

- Only B-tree indexes can be declared unique
- PostgreSQL auto-creates unique indexes for PRIMARY KEY and UNIQUE constraints
- No need to manually create indexes on unique columns

## 11.8 Partial Indexes

An index built over a subset of a table, defined by a conditional expression (predicate).

### Use case 1: Exclude common values
```sql
CREATE INDEX access_log_client_ip_ix ON access_log (client_ip)
WHERE NOT (client_ip > inet '192.168.100.0' AND client_ip < inet '192.168.100.255');
```

### Use case 2: Index only interesting values
```sql
CREATE INDEX orders_unbilled_index ON orders (order_nr)
WHERE billed is not true;
```

### Use case 3: Partial unique index
```sql
CREATE UNIQUE INDEX tests_success_constraint ON tests (subject, target)
WHERE success;
```

### Anti-pattern: Don't use many partial indexes as substitute for partitioning
```sql
-- BAD:
CREATE INDEX mytable_cat_1 ON mytable (data) WHERE category = 1;
CREATE INDEX mytable_cat_2 ON mytable (data) WHERE category = 2;
-- ...

-- GOOD:
CREATE INDEX mytable_cat_data ON mytable (category, data);
```

If the table is really too large for a single index, use table partitioning instead.
