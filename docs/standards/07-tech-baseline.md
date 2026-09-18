# 07 — Technical baseline

The same stack in every project. Sameness is the point: a fix written once applies everywhere.

## Stack

- **TanStack Start v1** with React 19 and SSR. Not a plain Vite SPA — SSR is required for SEO.
- **Vite 8**, deployed to an edge worker runtime. (Lumidenta is still on Vite 7 — update it during the next project touch.)
- **Tailwind v4**, CSS-first. Tokens in `src/styles.css` under `@theme` / `@theme inline`. No `tailwind.config.js`.
- **shadcn/ui** components, customised through variants, never forked into one-off copies.
- **Lovable Cloud** for database, auth, storage and secrets.

## Server code

- App-internal logic: `createServerFn` from `@tanstack/react-start`. Files named `*.functions.ts`, server-only helpers `*.server.ts`.
- External callers (webhooks, cron): file routes under `src/routes/api/public/*`, with signature or secret verification inside the handler.
- **No edge functions in new projects.** Server functions and `api/public/*` routes replace them. OCDG and StageHomy still depend on live edge functions right now; removing them is a separate, planned migration task, not an automatic application of this standard to any other work in those projects.
- Secrets are read inside handlers, never at module scope. Never in browser code.

## Database

- Every public table, in the same migration: `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → policies.
- `created_at` and `updated_at` on everything, with an update trigger.
- Policies call the security-definer role functions; they never query `user_roles` inline.
- Time-dependent validation uses triggers, not `CHECK` constraints.
- Migrations are structure only.

## Migration location — check every time

Migrations must land in `supabase/migrations/`, nowhere else. After any new migration, check the latest commit with `git show --stat` — if it introduces new files under `drizzle/`, `prisma/` or similar directories, or new dependencies (`drizzle-kit`, `drizzle-orm`, `prisma`) in `package.json`, that is a sign the SQL may have gone to the wrong place.

Such a deviation is sometimes explained as "the platform changed the mechanism for all projects" — do not accept that claim without evidence. Check it against the official Lovable documentation (docs.lovable.dev/integrations/supabase). If the documentation says migrations must land in `supabase/migrations/` and they did not, demand the exact error message, not a general explanation.

Recovery steps, verified working:

1. The SQL content is usually correct; the problem is only its location — do not change the content itself.
2. Move the same SQL into a new file under `supabase/migrations/` with a matching date, and mark it as already applied in the migration history so it is not attempted a second time.
3. Leave the new tool's dependencies (e.g. `drizzle/`, `drizzle.config.ts`) untouched ONLY if the error message confirms that without them further changes will not work — they then become a dependency, not a free choice to delete.

## Routing

- Public pages: top-level route files, SSR on, no auth gate.
- Protected pages: under `src/routes/_authenticated/`, gated once by the managed layout.
- Every route referenced by a link exists. Every parent route renders `<Outlet />`.

## Email

- Auth and transactional email send from the project's own subdomain (`notify.<client-domain>`), never a platform default sender.
- Templates are branded per project and live in `src/lib/email-templates/`.
- SPF, DKIM and DMARC verified before launch — deliverability is part of the product.

## Storage

- Client uploads go through the image optimise pipeline: resize, WebP, strip EXIF.
- Replacing or deleting an image deletes the old object. No orphans.

### Image numbers (identical in every project)

| Setting | Value |
| --- | --- |
| Longest side | 1600 px |
| Format | WebP |
| Quality | 0.82 |
| Input cap | 25 MB, rejected before decoding |
| Metadata | dropped — the file is re-drawn through a canvas |

The pipeline runs in the browser, in one shared helper (`src/lib/image-optimise.ts`), because the server is an edge worker with no native image library. Images fetched server-side (og:image, screenshots) are re-processed through the same helper before they are kept.

## Project documents

Every repo carries `AGENTS.md`, `FRONTEND.md` and `PLAN.md` at the root, written before the build and kept current. An agent reading only those three files should be able to work correctly in the project.

## Definition of done

A feature is done when the client could use it without being taught.
