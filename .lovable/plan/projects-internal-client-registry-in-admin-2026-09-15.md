# Projects — internal client registry in admin

Turn the current basic "Clients" table into a proper **Projects** section: a card
grid of every project you build and maintain, with money, country, links,
contact people and a recognisable thumbnail. Admin only — never rendered on the
public site.

## What you get

**Sidebar:** the MANAGE item is renamed to "Projects" (the database keeps the
name `clients`, the screen says Projects).

**Card grid** — filterable by status (prospect / building / review / live /
paused), plus a total line showing monthly recurring revenue per currency.
Each card shows:

- thumbnail (or a quiet placeholder with the initial until one exists)
- project name, country, status badge
- monthly fee with its currency, and the one-off onboarding fee underneath
- link buttons: Live site, Lovable, GitHub — each shown only when filled in

**Edit form** (opens from a card): all project fields, plus a contacts list at
the bottom where you add, edit and delete as many people as a project needs
(name, role, email, phone, one marked primary).

**Thumbnail** — two ways, never automatic polling:

- upload an image yourself, or
- press "Capture from live site" once; the server fetches a single screenshot
  of the Live URL and stores it. It only ever runs when you press the button.

Both paths resize the image and store it in a private bucket that only signed-in
staff can read.

## Money model

One amount + one currency per fee, not separate EUR and USD columns — so a
project is either priced in EUR or in USD, never half-empty. Fields: onboarding
fee + currency, monthly fee + currency, billing cycle (monthly / semiannual /
annual).

## First entry

OCDG is entered manually once the section is live; nothing is seeded by the
migration.

## Technical notes

**Migration 1 — extend `public.clients`** (table already exists, keep data):
add `sector`, `country`, `live_url`, `lovable_project_url`, `github_url`,
`thumbnail_path`, `onboarding_fee numeric`, `onboarding_fee_currency`,
`monthly_fee numeric`, `monthly_fee_currency`, `billing_cycle`. Keep existing
`name`, `slug`, `status`, `notes`, timestamps. Existing `contact_name` /
`contact_email` / `contact_phone` values are copied into `client_contacts` as
the primary contact, then the three columns are dropped in a follow-up step
(destructive — will ask for confirmation). `website_url` is copied into
`live_url` and dropped the same way.

**Migration 2 — `public.client_contacts`**: `client_id` FK → `clients` with
`on delete cascade`, `name`, `role`, `email`, `phone`, `is_primary`,
`created_at`, `updated_at` + trigger. Order per standard: CREATE TABLE → GRANT
(authenticated, service_role; **no anon**) → ENABLE RLS → policies. SELECT via
`is_admin_staff(auth.uid())`, insert/update/delete via `is_manager(auth.uid())`.
Same policy shape reapplied to `clients` (today staff can read, managers write —
already correct, no anon grant to add).

**Storage**: private bucket `client-thumbnails`, RLS on `storage.objects`
scoped to `is_admin_staff` for read and `is_manager` for write. Images are
resized to ~800px wide WebP before upload; replacing or deleting a project
deletes the old object.

**Server functions** in `src/lib/admin.functions.ts` (all
`.middleware([requireSupabaseAuth])`, manager check inside for writes):
`listClients` extended with contacts and a signed thumbnail URL, `saveClient`,
`deleteClient`, `saveClientContact`, `deleteClientContact`,
`captureClientThumbnail` (fetches one screenshot server-side from the live URL,
stores it, returns the path).

**UI**: `src/routes/_authenticated/admin/clients.tsx` rewritten from table to
card grid + status filter; the edit dialog grows the new field groups and an
inline contacts editor. Sidebar label changed in
`src/components/admin/AdminSidebar.tsx`. Dashboard "Quick actions" link keeps
pointing at the same route.

**Not touched**: public site, SEO, analytics, users, settings.
