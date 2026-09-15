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
