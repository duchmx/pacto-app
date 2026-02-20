# Pacto Inmobiliario Dashboard

Mobile-first financial dashboard for property management (properties, contracts, billing, facturas, payments). Built with Next.js (App Router), TypeScript, Tailwind CSS, and shadcn/ui.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without env vars you’ll be redirected to **Login**; after setting Supabase env vars you can sign up/sign in and use the dashboard.

---

## Supabase: env and auth

The app uses Supabase for auth and (when you add it) the database. Client modules and auth are already wired.

1. **Environment variables**
   - Copy the example file and add your values:
   ```bash
   cp .env.local.example .env.local
   ```
   - In Supabase: **Project Settings** → **API**. Copy **Project URL** and **anon** (or **publishable**) key.
   - Edit `.env.local` and set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   ```

2. **Auth**
   - In Supabase: **Authentication** → **Providers** → enable **Email** (and optionally others).
   - **URL Configuration**: set **Site URL** to your app URL (e.g. `http://localhost:3000` for dev, or `https://app.pacto.mx` for production). Add **Redirect URLs** for both: `http://localhost:3000/auth/callback` and `https://app.pacto.mx/auth/callback`.
   - The app has **Login** (`/login`) and **Sign up** (`/signup`). Dashboard routes require a signed-in user; **Sign out** is in the sidebar footer.

3. **Client modules**
   - `lib/supabase/client.ts` — browser client (Client Components: auth, realtime).
   - `lib/supabase/server.ts` — server client (Server Components, Server Actions, Route Handlers).
   - `lib/supabase/middleware.ts` — session refresh and route protection (used by root `middleware.ts`).

4. **Schema and securing the database**
   - Create your tables in Supabase **SQL Editor** (e.g. `propiedades`, `clientes`, `contratos`, etc.) and update the app when ready.
   - **Important:** enable **Row Level Security (RLS)** on every table and add policies so only authenticated users (or the right users) can read/write. See **[docs/DATABASE_SECURITY.md](docs/DATABASE_SECURITY.md)** for step-by-step RLS setup.

---

## GitHub and deployment

- **Repo:** [pacto-app](https://github.com) (connected).
- **Production:** Deployed on Vercel with custom domain **https://app.pacto.mx**.

**Push changes:**
```bash
git add .
git commit -m "Your message"
git push
```
Each push to `main` triggers a new Vercel deployment. Env vars are set in Vercel **Settings** → **Environment Variables**; custom domain **app.pacto.mx** is configured under **Domains**.

---

## Project structure (relevant parts)

- `app/` — App Router: `layout.tsx`, `(dashboard)/` with dashboard layout and pages.
- `app/(dashboard)/` — Dashboard shell: sidebar + pages (Dashboard, Properties, Contracts, Settings).
- `components/` — `app-sidebar.tsx` (nav), `ui/` (shadcn components).
- `lib/` — `utils.ts`, `supabase/client.ts`, `supabase/server.ts`, `supabase/middleware.ts`.
- `docs/DATABASE_SECURITY.md` — how to secure the database with Row Level Security (RLS).

Without `.env.local`, the app runs but redirects to `/login`; add your Supabase URL and anon key to use auth and the dashboard.
