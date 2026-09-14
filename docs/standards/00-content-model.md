# 00 — Content model

Decide this before writing a single component. Getting it wrong is what makes a CMS painful six months later.

## The three-category rule

Every string, number and image on a Deerva site belongs to exactly one of three places.

| If it… | Lives in | Example |
|---|---|---|
| appears on **several pages** and must be edited once | `site_settings` | logo, favicon, address, phone, email, licence numbers, social links |
| appears **once, in one place, on one page** | `page_text` / `page_media` | hero heading, CTA paragraph, a quote card |
| **repeats** as a list of similar things | its own table | services, listings, projects, articles, testimonials, prices, FAQ |

**The test:** *if the client would ever want a second one, it needs a table.* A service is not a text slot — they will add a seventh. A hero heading is not a table — there is only ever one.

## Tables every project has

```
site_settings          one row; business identity + appearance
page_text              (page, slot, value)
page_media             (page, slot, bucket, path, alt)      client's choice
page_media_defaults    (page, slot, bucket, path, alt)      developer's pinned default
user_roles             developer / owner / editor
leads                  contact-form submissions
page_views             analytics
```

Everything else is sector-specific.

## Slot naming

`page:slot`, lowercase, no dots, describing the **position**, never the current wording.

```
home:hero_heading        correct — survives a copy rewrite
home:dantu_prieziura     wrong — dies the moment the text changes
```

## Defaults and reset

Resolution order:

```
image:  client's page_media  →  developer's page_media_defaults  →  null (component hides the slot)
text:   page_text value      →  fallback string written into the component
```

This makes "reset to default" free: delete the row, the default returns. No undo log, no versioning.

**Every visible string in a component gets a `copy()` call with the current wording as its fallback.** The site renders fully before a single database row exists, and the client edits from working copy rather than empty boxes.

## Hard rules

1. **No client data in migrations.** Migrations define structure. Real names, prices, hours and photos are entered through the admin panel. The only exception is seeding demo rows when the first screen must not be empty at launch.
2. **Images always go through the optimise pipeline** — resize, WebP, EXIF strip. Deleting or replacing a photo deletes the old file from storage. Orphaned files have bitten sibling projects; do not repeat it.
3. **Address, phone and email are read from `site_settings` everywhere** — footer, contact page, map, schema.org. Changing them in admin updates the whole site. Never hardcode them in a component.
4. **The logo is a `site_settings` value, not an import.** See `02-admin-structure.md`.
5. **Every table gets `created_at`, `updated_at` (with trigger), RLS and GRANT** in the same migration that creates it.

## Sector mapping

The "repeating things" table is what changes between sectors. Everything above it stays identical.

| Sector | Repeating entity |
|---|---|
| Dentist / clinic | `services`, `working_hours`, `appointments` |
| Architect | `projects` with phases and galleries |
| Real-estate broker | `listings` with status, media, enquiries |
| Developer / builder | `developments` with units and build status |
| Visualisation studio | `portfolio_items` |

When starting a new project, write this one line first: *"the repeating entity is X"*. Everything else follows from the standards.
