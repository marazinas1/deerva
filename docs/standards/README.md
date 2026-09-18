# Deerva Standards

The rules every Deerva platform follows. A platform is not "done" — it is "compliant".

Read order when starting a new client project:

1. [`00-content-model.md`](./00-content-model.md) — where every piece of content lives (decide this first, always)
2. [`01-design-system.md`](./01-design-system.md) — tokens, typography, buttons, spacing, motion
3. [`02-admin-structure.md`](./02-admin-structure.md) — what exists in admin and where it lives
4. [`03-admin-ui.md`](./03-admin-ui.md) — admin shell, cards, tabs, forms, states and responsive behaviour
5. [`04-admin-screens.md`](./04-admin-screens.md) — reusable screen anatomy and editing workflows
6. [`05-roles-and-access.md`](./05-roles-and-access.md) — developer / owner / editor
7. [`06-seo-and-performance.md`](./06-seo-and-performance.md) — SSR, head, sitemap, schema, images
8. [`07-analytics-and-attribution.md`](./07-analytics-and-attribution.md) — tracking, bot filter, Deerva badge
9. [`08-project-lifecycle.md`](./08-project-lifecycle.md) — from concept to subscription
10. [`09-tech-baseline.md`](./09-tech-baseline.md) — stack, server functions, RLS, email

## How these are used

- **Source of truth:** these files. Edited here, in the Deerva repo.
- **Applied automatically:** as workspace Skills (Settings → Skills), so every project in the workspace follows them without copying files.
- **Tracked:** Deerva admin records which project follows which version.

## Where they came from

| Project | What it proved |
|---|---|
| Lumidenta | Starting from `AGENTS.md` + `FRONTEND.md` + `PLAN.md` before any code is the single biggest predictor of a smooth build |
| Halliday Architects | Role hierarchy, `page_media_defaults` reset mechanic, admin shell |
| StageHomy | Visual language: restrained surfaces, thin borders and confident density. Copy the aesthetic through semantic tokens, never its hardcoded admin colours |
| OCDG | What a missing content model costs later — a full architecture migration |
| Dorothe | Building "a generic product" before a specific one is slower, not faster |

## The one rule above all others

**Standardise decisions, not code.** Code gets remixed per client; the decisions must not be re-made per client.
