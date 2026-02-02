# Supabase Row Level Security (RLS)
> Fuente: https://supabase.com/docs/guides/database/postgres/row-level-security
> Descargado: 2026-01-28

## Secure your data using Postgres Row Level Security.

When you need granular authorization rules, nothing beats Postgres's [Row Level Security (RLS)](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

RLS is incredibly powerful and flexible, allowing you to write complex SQL rules that fit your unique business needs. RLS can be combined with [Supabase Auth](/docs/guides/auth) for end-to-end user security from the browser to the database.

RLS is a Postgres primitive and can provide "[defense in depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing))" to protect your data from malicious actors even when accessed through third-party tooling.

[Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html) are Postgres's rule engine. Policies are easy to understand once you get the hang of them. Each policy is attached to a table, and the policy is executed every time a table is accessed.

You can just think of them as adding a WHERE clause to every query. For example a policy like this ...

```sql
create policy "Individuals can view their own todos."
on todos for select
using ( (select auth.uid()) = user_id );
```

.. would translate to this whenever a user tries to select from the todos table:

```sql
select *
from todos
where auth.uid() = todos.user_id;
-- Policy is implicitly added.
```

You can enable RLS for any table using the enable row level security clause:

```sql
alter table "table_name" enable row level security;
```

Once you have enabled RLS, no data will be accessible via the API when using the public anon key, until you create policies.

Supabase maps every request to one of the roles:

- anon: an unauthenticated request (the user is not logged in)
- authenticated: an authenticated request (the user is logged in)

These are actually Postgres Roles. You can use these roles within your Policies using the TO clause:

```sql
create policy "Profiles are viewable by everyone"
on profiles for select
to authenticated, anon
using ( true );

-- OR

create policy "Public profiles are viewable only by authenticated users"
on profiles for select
to authenticated
using ( true );
```

### SELECT policies

You can specify select policies with the using clause.

```sql
-- 1. Create table
create table profiles (
  id uuid primary key,
  user_id uuid references auth.users,
  avatar_url text
);

-- 2. Enable RLS
alter table profiles enable row level security;

-- 3. Create Policy
create policy "Public profiles are visible to everyone."
on profiles for select
to anon
using ( true );
```

Alternatively, if you only wanted users to be able to see their own profiles:

```sql
create policy "User can see their own profile only."
on profiles
for select using ( (select auth.uid()) = user_id );
```

### INSERT policies

```sql
create policy "Users can create a profile."
on profiles for insert
to authenticated
with check ( (select auth.uid()) = user_id );
```

### UPDATE policies

```sql
create policy "Users can update their own profile."
on profiles for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );
```

### DELETE policies

```sql
create policy "Users can delete a profile."
on profiles for delete
to authenticated
using ( (select auth.uid()) = user_id );
```

### Views

Views bypass RLS by default. In Postgres 15+, use `security_invoker = true`:

```sql
create view <VIEW_NAME>
with(security_invoker = true)
as select <QUERY>
```

## Helper Functions

### auth.uid()
Returns the ID of the user making the request.

### auth.jwt()
Returns the JWT of the user making the request.

```sql
create policy "User is in team"
on my_table
to authenticated
using ( team_id in (select auth.jwt() -> 'app_metadata' -> 'teams'));
```

### MFA

```sql
create policy "Restrict updates."
on profiles
as restrictive
for update
to authenticated using (
  (select auth.jwt()->>'aal') = 'aal2'
);
```

## Performance Recommendations

### Add indexes
```sql
create index userid
on test_table
using btree (user_id);
```

### Call functions with select
```sql
-- Instead of: auth.uid() = user_id
-- Use: (select auth.uid()) = user_id
```

### Add filters to every query
```javascript
const { data } = supabase
  .from('table')
  .select()
  .eq('user_id', userId)
```

### Use security definer functions

```sql
create function private.has_good_role()
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from roles_table
    where (select auth.uid()) = user_id and role = 'good_role'
  );
end;
$$;

create policy "rls_test_select"
on test_table
to authenticated
using ( (select private.has_good_role()) );
```

### Minimize joins
Rewrite policies to avoid joins between source and target tables.

### Specify roles in your policies
Always use the `TO` operator to specify roles.
