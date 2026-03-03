# Securing Your Supabase Database (Row Level Security)

Your app uses the **anon** (public) key, so the database must be protected with **Row Level Security (RLS)**. Otherwise, anyone with the anon key could read or write all data.

## 1. Enable RLS on every table

In Supabase **SQL Editor**, run for each table you create:

```sql
ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;
```

Repeat for every table (e.g. `propiedades`, `clientes`, `contratos`, `cargos`, `facturas`, `movimientos`).

## 2. Add policies so only authenticated users can access data

Until you define your schema and roles, a simple approach is: **allow only signed-in users** to read/write.

### 2.1. Production policies for `propiedades` and `contratos`

For the core operational tables `propiedades` and `contratos`, the current production posture is:

- **Only authenticated users** can read and write any row.
- We do not yet restrict by `empresa_id` or specific user ownership.

This is implemented by checking that `auth.uid()` is not null in every policy.

Run the following SQL in Supabase:

```sql
-- Enable RLS on nuevas tablas operativas
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

-- Optional: clean up any old policies before recreating
DROP POLICY IF EXISTS "Authenticated users can select propiedades" ON public.propiedades;
DROP POLICY IF EXISTS "Authenticated users can insert propiedades" ON public.propiedades;
DROP POLICY IF EXISTS "Authenticated users can update propiedades" ON public.propiedades;
DROP POLICY IF EXISTS "Authenticated users can delete propiedades" ON public.propiedades;

DROP POLICY IF EXISTS "Authenticated users can select contratos" ON public.contratos;
DROP POLICY IF EXISTS "Authenticated users can insert contratos" ON public.contratos;
DROP POLICY IF EXISTS "Authenticated users can update contratos" ON public.contratos;
DROP POLICY IF EXISTS "Authenticated users can delete contratos" ON public.contratos;

-- propiedades: full CRUD for any authenticated user
CREATE POLICY "Authenticated users can select propiedades"
  ON public.propiedades
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert propiedades"
  ON public.propiedades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update propiedades"
  ON public.propiedades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete propiedades"
  ON public.propiedades
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- contratos: full CRUD for any authenticated user
CREATE POLICY "Authenticated users can select contratos"
  ON public.contratos
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert contratos"
  ON public.contratos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contratos"
  ON public.contratos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete contratos"
  ON public.contratos
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
```

You can tighten these later (for example, scoping by `empresa_id` or an `owner_user_id`) while keeping the same basic structure.

### 2.2. Generic example for any table

Example for a table named `propiedades`:

```sql
-- Allow authenticated users to read all rows
CREATE POLICY "Authenticated users can read propiedades"
  ON propiedades FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert propiedades"
  ON propiedades FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update propiedades"
  ON propiedades FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete (if you need it)
CREATE POLICY "Authenticated users can delete propiedades"
  ON propiedades FOR DELETE
  TO authenticated
  USING (true);
```

Use `TO authenticated` so only users who signed in via Supabase Auth can run those operations. Replace `propiedades` with each of your tables and add the same four policies (SELECT, INSERT, UPDATE, DELETE) as needed.

## 3. Restrict by user (optional, later)

When you want users to see only their own data, change the policies to use `auth.uid()`:

```sql
-- Example: users see only rows where they are the owner
CREATE POLICY "Users can read own propiedades"
  ON propiedades FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);
```

You’ll add an `owner_user_id` (or similar) column to your schema and reference it in the policy.

## 4. Summary

1. **Enable RLS** on every table.
2. Add **policies** so `authenticated` users (and only they) can SELECT/INSERT/UPDATE/DELETE as needed.
3. Later, narrow policies with `auth.uid()` so each user only accesses their own rows.

Once your schema is ready, you can add these statements in the Supabase SQL Editor or in a migration. If you share your table names and who should see what, we can tailor the policies.
