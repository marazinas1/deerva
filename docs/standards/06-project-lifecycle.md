# 06 — Project lifecycle

From first conversation to recurring revenue. 80% of the product already exists; the 20% is what this document schedules.

## Statuses

```
concept  →  building  →  review  →  live  →  maintained
```

Tracked in the Deerva admin, one row per client project.

## 1. Concept

Before any code:

- name the **sector** and the **repeating entity** (see `00-content-model.md`)
- pick the **visual concept** from the rotation, checking no client in the same sector and market already has it
- write the three project documents:
  - `AGENTS.md` — who this client is, what the copy may and may not say, what was removed from the remix source, sector-specific legal limits
  - `FRONTEND.md` — the page map: every page, every editable slot, which tables it reads
  - `PLAN.md` — build order

This step is the difference between Lumidenta and Dorothe. It is never skipped to "save time".

## 2. Building

- remix the closest completed project, then **delete what does not belong** rather than adapting it — leftover modules from the source project are the main source of later confusion
- build on `<name>.deerva.com` with `noindex` in place
- one task per prompt; plan mode for anything structural
- no real client data in migrations

## 3. Review

The client gets an owner account and uses the admin for a week on real content. Deerva watches which screens they hesitate on and fixes those, not the ones that felt hard to build.

## 4. Live

Cutover to the client's own domain:

- DNS pointed, HTTPS verified
- `noindex` and the robots block removed in one change
- sitemap submitted
- auth emails sending from the client's own domain
- Deerva badge with the correct UTM source in the footer
- the launch checklist in `04-seo-and-performance.md` fully ticked

## 5. Maintained

Monthly subscription starts. It covers hosting, updates, security, backups, small content help and continued development. Larger new features are quoted separately.

The client controls their content. Deerva controls the architecture and the design system. That boundary is the product: they are independent day to day and dependent for everything structural — and they get real value for it.

## What the client can and cannot change

| Client | Deerva |
|---|---|
| logo, logo size, favicon | colour tokens and typography |
| address, phone, email, hours, social | page structure and layout |
| all page text and images | components and features |
| the repeating entity (add/edit/delete) | database schema |
| articles | SEO plumbing |
| users (owner only) | domains, email, infrastructure |
| maintenance mode | the design system |

## Pricing shape

Build fee up front, then a monthly maintenance subscription billed in 6-month blocks. The reference is OCDG: 250 USD/month, invoiced as 1500 USD twice a year.
