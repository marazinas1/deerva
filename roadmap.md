# Roadmap

## Done — Deerva standards applied to deerva.com

- [x] `site_settings` table (business identity) with RLS + GRANT
- [x] Settings server functions + admin Settings page (Business tab)
- [x] Admin menu regrouped: DAILY / MANAGE / SETTINGS
- [x] Overview page: Needs attention / Numbers / Quick actions
- [x] SEO baseline: full `/` head, Organization JSON-LD, sitemap.xml, robots.txt,
      noindex on non-canonical hosts
- [x] Project documents: AGENTS.md (real project description), FRONTEND.md, PLAN.md

## In progress — Finance section

- [ ] Tables: contact_emails, contact_phones, payments, payment_methods (manager-only)
- [ ] Backfill primary email/phone rows from existing client_contacts values
- [ ] `src/lib/finance.ts`, `finance.functions.ts`, `hooks/admin/useFinance.ts`
- [ ] `/admin/finance` — one Manage sidebar item, tabs: Overview / Payments / Payment Methods
- [ ] Projects page: contacts with emails/phones + payment history per card

## Deliberately deferred

- Enquiries — the public page has no form.
- Maintenance mode — unnecessary for a static one-pager.
- Articles admin section — the standard requires it in every project, but Deerva
  defers it: an internal tool does not need articles yet.
- Public text CMS (`page_text` / `page_media`) — landing copy stays in code.
- Appearance tab (logo upload / size) — logo stays a static asset for now.
