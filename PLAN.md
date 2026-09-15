# PLAN

Status: **live** (`https://deerva.com`), maintained continuously.

## Done

- Public one-page site, dark tokens, Urbanist, stylised Deerva wordmark.
- Auth: invite-only, branded auth email from `notify.deerva.com`,
  `/admin/login` split layout, `/admin/set-password`.
- Roles: Solo tier `developer` / `owner` / `editor`, hardcoded developer,
  protected developer rows, no self-role changes.
- Clients registry.
- First-party analytics: engagement gate, bot filter, countries, sources,
  devices, duration, bounce rate, referrers and UTM attribution from client
  site badges, 14-month pruning.
- `site_settings` (business identity) + admin Settings → Business tab.
- Admin menu regrouped into DAILY / MANAGE / SETTINGS; Overview rebuilt as
  needs attention · numbers · quick actions.
- SEO baseline: full per-page head, Organization JSON-LD from `site_settings`,
  generated `/sitemap.xml`, `robots.txt` blocking `/admin` and `/api`,
  `noindex` on every non-canonical host.
- Project documents: `AGENTS.md`, `FRONTEND.md`, `PLAN.md`.

## Deliberately deferred

- **Articles admin section** — the standard requires it in every project, but
  Deerva defers it: an internal tool does not need articles yet.
- **Enquiries** — the public page has no form; contact is a `mailto:` link.
- **Maintenance mode** — unnecessary for a static one-pager.
- **Public text CMS** (`page_text` / `page_media`) — landing copy stays in code.
- **Appearance tab** (logo upload, size slider, favicon) — the logo is a static
  asset; move it into `site_settings` if the brand mark starts changing.

## Next, when needed

1. Subscriptions and project lifecycle status per client row
   (`concept → building → review → live → maintained`).
2. Chatbot on the public page.
3. Outbound email to clients from the admin panel.
