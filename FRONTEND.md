# FRONTEND — page map

## Public

| Route | File | Reads | Notes |
|---|---|---|---|
| `/` | `src/routes/index.tsx` | `site_settings` (name, tagline, contact email, phone, address, socials) | SSR. Full head: title, description, og/twitter, canonical, `og:image` at `https://deerva.com/og-image.jpg`, Organization JSON-LD. Emits `noindex` on any host other than `deerva.com`. Also forwards invite/recovery hash tokens to `/admin/set-password`. |
| `/sitemap.xml` | `src/routes/sitemap[.]xml.ts` | — | Generated from the public route list, not a static file. |
| `robots.txt` | `public/robots.txt` | — | Allows everything public, disallows `/admin` and `/api`, points at the sitemap. |

Landing copy is written in the component with `site_settings` values taking
precedence when filled in. There is no `page_text` / `page_media` layer here —
a one-page internal site does not need one.

## Auth

| Route | File |
|---|---|
| `/admin/login` | `src/routes/admin/login.tsx` — split layout, logo links home |
| `/admin/set-password` | `src/routes/admin/set-password.tsx` — invite and recovery landing |

## Admin (`_authenticated`, client-rendered)

Menu order follows `docs/standards/02-admin-structure.md`:

```text
DAILY
  Overview    /admin                 needs attention · numbers · quick actions
  Analytics   /admin/analytics       7/30/90 days, countries, sources, referrers
MANAGE
  Clients     /admin/clients         the repeating entity
SETTINGS
  Users       /admin/users           manager only
  Settings    /admin/settings        Business tab
```

| Page | Reads / writes |
|---|---|
| Overview | `analytics_summary` (7 d), `clients`, `site_settings` |
| Analytics | `analytics_summary` RPC, staff-only |
| Clients | `clients` — managers write, staff read |
| Users | `profiles` + `user_roles` via server functions |
| Settings → Business | `site_settings` — managers write, everyone reads |

## Server functions

- `src/lib/admin.functions.ts` — me, clients, users, invites, roles.
- `src/lib/settings.functions.ts` — `getSiteSettings` (public),
  `getPublicSiteContext` (settings + request origin, for SSR head),
  `updateSiteSettings` (manager only, RLS enforced).

## Tracking

`src/lib/page-view-tracking.ts` + `src/routes/api/public/pv.ts`: cookie-free,
engagement-gated, bot-filtered, admin/API/staff excluded, UTM captured on first
landing.
