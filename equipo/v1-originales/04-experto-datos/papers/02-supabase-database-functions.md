# Supabase Database Functions
> Fuente: https://supabase.com/docs/guides/database/functions
> Descargado: 2026-01-28

Postgres has built-in support for [SQL functions](https://www.postgresql.org/docs/current/sql-createfunction.html).
These functions live inside your database, and they can be used with the API.

## Creating a Basic Function

```sql
create or replace function hello_world()
returns text
language sql
as $$
  select 'hello world';
$$;
```

Parts of a function:
- `create or replace function hello_world()`: Function declaration
- `returns text`: Return type
- `language sql`: Language used (can be plpgsql, plpython, etc.)
- `as $$`: Function wrapper
- `select 'hello world';`: Function body
- `$$;`: Closing symbols

## Returning Table Data

```sql
create or replace function get_planets()
returns setof planets
language sql
as $$
  select * from planets;
$$;
```

## Passing Parameters

```sql
create or replace function add_planet(name text)
returns bigint
language plpgsql
as $$
declare
  new_row bigint;
begin
  insert into planets(name)
  values (add_planet.name)
  returning id into new_row;
  return new_row;
end;
$$;
```

## Security definer vs invoker

```sql
create function hello_world()
returns text
language plpgsql
security definer set search_path = ''
as $$
begin
  select 'hello world';
end;
$$;
```

Best practice: use `security invoker` (default). If using `security definer`, always set `search_path`.

## Function Privileges

Restrict by default:
```sql
revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon, authenticated;

alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

-- Grant specific access:
grant execute on function public.hello_world to authenticated;
```

## Debugging Functions

### General logging
```sql
create function logging_example(
  log_message text,
  warning_message text,
  error_message text
)
returns void
language plpgsql
as $$
begin
  raise log 'logging message: %', log_message;
  raise warning 'logging warning: %', warning_message;
  raise exception 'logging error: %', error_message;
end;
$$;
```

### Error handling
```sql
create or replace function error_if_null(some_val text)
returns text
language plpgsql
as $$
begin
  if some_val is null then
    raise exception 'some_val should not be NULL';
  end if;
  return some_val;
end;
$$;
```

### Assert keyword
```sql
assert student_id is not null, 'assert_example() ERROR: student not found';
```

### Exception handling
```sql
exception
  when others then
    raise exception 'An error occurred: %', sqlerrm;
```
