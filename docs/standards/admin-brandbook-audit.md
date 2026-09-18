# Universal admin brandbook — source audit

Audited projects: Lumidenta, OCDG, StageHomy, Halliday Architects and Dorothe. The standard keeps brand token values and sector content different while freezing navigation, component anatomy and behaviour.

## Halliday Architects — structural reference

Keep:

- exact `Workspace / Manage / Settings` sidebar grouping;
- `Dashboard / Inquiries / Analytics`, then Projects, Articles, Testimonials, then Users and Settings;
- one `Business & appearance` Settings entry followed by public-page tabs;
- maintenance inside Business & appearance;
- full-width admin root and mobile sidebar.

Normalize:

- use only core semantic tokens instead of `ink / stone / paper / sand / line` aliases in admin recipes;
- preserve the light horizontal underline anatomy through the shared semantic-token AdminTabs;
- make Contact the final tab and keep photographs within their corresponding page tabs;
- use the fixed icon vocabulary (`Building2`, `Newspaper`, etc.).

## StageHomy — visual rhythm reference, never a code source

Keep:

- restrained black-and-light visual hierarchy;
- generous spacing, thin borders, dense but readable project cards;
- simple 4 px-feeling brand radius through the shared `--radius` token.

Normalize:

- the audited admin contains 523 raw black/white/hex colour occurrences across admin pages and components; replace them with semantic tokens rather than copying this implementation;
- combine Business and Appearance into one first tab;
- make Contact the final Settings tab;
- replace hardcoded underline tabs with the shared semantic-token AdminTabs while preserving their light horizontal anatomy;
- remove local inline radius values and raw buttons in favour of shared components;
- add Testimonials to Manage if the public site uses them.

## OCDG — strong content coverage, inconsistent shell

Keep:

- comprehensive page-text and media editing;
- truthful fallback previews and separate client/default media resolution;
- full-width forms and explicit dirty-state warning.

Normalize:

- rename `Daily / Overview` to `Workspace / Dashboard`;
- add Articles to Manage;
- combine Business and Appearance;
- move Maintenance from its own tab into a collapsible block at the bottom of Business & appearance;
- make Contact the final page tab;
- replace local bordered chips and filled tab rectangles with shared underline AdminTabs; replace project colour aliases and `rounded-[4px]` with semantic core tokens;
- scope the global Playfair Display `h1`–`h6` rule to public content so admin and auth use the existing Inter `--font-sans` instead;
- split the 1,800+ line Settings implementation into page-tab and reusable media/form components.

## Dorothe — closest shared-component implementation

Keep:

- three sidebar groups, permission-aware rows and optional Calendar;
- semantic-token components and dedicated settings parts;
- Manage collection for listings, articles and testimonials.

Normalize:

- rename the translated `daily` group to Workspace;
- combine Business and Appearance;
- move Maintenance from its final tab into Business & appearance;
- make Contact the final tab after legal/shared content;
- avoid a second admin-only palette and radius override; the public and admin surfaces use one semantic token contract;
- convert testimonial edit from a separate action into the standard inline expandable row where frequent editing benefits from it.

## Lumidenta — workflow reference for expandable editing

Keep:

- warm brand tokens and softer radius as intentional brand values;
- clear read-only notice and role-aware forms;
- testimonial rows with collapsed summary, inline edit, publication state and destructive confirmation;
- safe maintenance gate: signed-out visitors see the holding screen while staff retain access with a banner.

Normalize:

- rename `Kasdien / Apžvalga` to localized Workspace / Dashboard;
- remove the duplicate `Turinys` navigation path for page texts: page copy and media live only under Settings tabs;
- move Services, Prices, Articles and Testimonials to Manage as repeatable entities;
- combine Practice and Appearance;
- move Technical works from a separate tab into Business & appearance;
- make Contact the final Settings tab;
- replace pill Settings tabs with the shared horizontal underline AdminTabs;
- add Expand all / Collapse all for long expandable collections.

## Rollout order

1. Halliday Architects — freeze the reference structure and shared AdminTabs.
2. StageHomy — preserve appearance while replacing hardcoded implementation.
3. OCDG — split Settings and align navigation.
4. Dorothe — remove the separate admin theme and relocate Maintenance.
5. Lumidenta — preserve warm branding and proven workflows while removing duplicate navigation.

Each rollout is a separate project task. No client project is changed by this audit.