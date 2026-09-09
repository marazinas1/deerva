# Deerva platform – foundation (phase 1)

## Current state (verified)

- The project already runs on the modern stack: TanStack Start v1 + React 19 + Tailwind v4, SSR on, deployed as an edge worker. This is the same architecture as Lumidenta, Halliday-Architects and Demo-Rentals — no migration needed, nothing to copy from the Vite SPA projects (Revoo/StageHomy are the older SPA approach).
- Right now there is exactly one route (`/`, the landing page) and no backend at all.

So the foundation is right; what is missing is the backend, auth, roles and the admin panel.

## What phase 1 delivers

1. **Lovable Cloud enabled** — database, auth, storage and server-side secrets for the project.
2. **Roles system** modelled on Halliday-Architects: `developer`, `owner`, `editor` stored in a separate `user_roles` table (never on the profile), with a security-definer `has_role()` function used by all access policies. This prevents privilege escalation and is the pattern the other projects already use.
3. **Admin login** at `/admin/login`, plus a `set-password` flow for invited users. Email/password sign-in; no public sign-up.
4. **Admin shell** at `/admin` — sidebar navigation, protected area, dashboard placeholder, sign-out.
5. **Users module** — list of admin users and their roles; `developer` and `owner` can invite users and assign roles, `editor` cannot.
6. **Clients registry** — the first real module: list, create, edit and archive clients (name, slug/subdomain, status, contact person, email, phone, notes, website URL). This is the base every future module (inquiries, emails, analytics, chatbot) will hang off.
7. **Public site untouched** — `/` keeps its current design exactly as is.

## Architecture decisions (so later modules stay easy)

- **SSR by default.** Public pages stay server-rendered for SEO; the admin area is client-rendered behind an auth gate — the standard split in the reference projects.
- **All data access through server functions** with an auth middleware, so the database is never reachable directly from the browser and row-level security applies as the signed-in user.
- **Row Level Security on every table** from day one, with grants written in the same migration.
- **Audit-friendly columns** (`created_at`, `updated_at`, `created_by`) on business tables so history and analytics are possible later.
- **Email, analytics, chatbot, inquiries** are deliberately out of scope for phase 1, but the roles + clients foundation is what they will attach to.

## Technical details

- Enable Lovable Cloud, then one migration creating:
  - `app_role` enum (`developer`, `owner`, `editor`)
  - `user_roles` (user_id, role, unique pair) + grants + RLS
  - `public.has_role(_user_id uuid, _role app_role)` security-definer function
  - `profiles` (id → auth.users, full_name, email, avatar_url) + trigger auto-creating a row on signup
  - `clients` (id, name, slug, status, contact_name, contact_email, contact_phone, website_url, notes, timestamps, created_by) + grants + RLS scoped through `has_role`
- Routes:
  - `src/routes/admin/login.tsx`, `src/routes/admin/set-password.tsx` (public)
  - `src/routes/_authenticated/route.tsx` gate, admin routes under it: `index` (dashboard), `clients`, `users`
- Server functions in `src/lib/*.functions.ts` using `requireSupabaseAuth`; privileged operations (inviting users, assigning roles) verify the caller's role server-side before using the admin client.
- Admin UI built from the existing shadcn components already in the project (sidebar, table, dialog, form, sonner toasts).
- No changes to `src/routes/index.tsx`, `src/styles.css` tokens or the logo.

## Next phases (not built now)

1. Inquiries / contact form + notifications
2. Transactional email from a Deerva domain
3. Analytics dashboard
4. Content model (page_text / page_media) if deerva.com grows past one page
5. Chatbot
