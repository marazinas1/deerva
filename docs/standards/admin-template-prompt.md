# Reusable admin implementation prompt

Use this prompt in a client project:

> Build or refactor this project's admin structure and visual system according to the active Deerva standards. Apply `deerva-content-model`, `deerva-design-system`, `deerva-admin-structure`, `deerva-admin-ui`, `deerva-admin-screens`, `deerva-roles-and-access`, `deerva-analytics-attribution`, `deerva-seo-baseline` and `deerva-tech-baseline` where relevant.
>
> First inspect the existing public navigation, repeating entities, roles, `site_settings`, admin routes and semantic tokens. Preserve this project's brand palette, primary sans font and token-defined radius. Admin and auth always use the project's `--font-sans` for headings and body; scope public serif/display heading rules so they cannot leak into those screens. Do not add an admin-only font or copy colours or component code from another project.
>
> Use exactly three sidebar groups: Workspace, Manage and Settings. Workspace contains Dashboard, Inquiries, optional Calendar or Messages, then Analytics. Manage contains the sector's repeating entities, Articles and Testimonials. Settings contains Users and Settings. Use the fixed icon vocabulary.
>
> Settings starts with one Business & appearance tab backed by one source of truth, mirrors each public menu page in order, and ends with Contact. Name every page tab with the exact public menu label only (for example Home, Developments, Gallery), never “Home texts” or “Gallery content”. Put maintenance as a collapsible block inside Business & appearance, not a separate tab. Page text and media editing exists only in Settings; repeatable entities exist only in Manage.
>
> Use the shared full-width admin layout and Halliday-style AdminTabs: one transparent horizontal row with a bottom divider and an active underline, never filled tab rectangles or pills. Use standard card/form/table/expandable-row anatomy and complete loading, empty, error, read-only, dirty and save states. Use only semantic design tokens and shared controls. Verify phone, tablet and desktop layouts, keyboard focus, cursor behaviour and unsaved-change protection.
>
> Before editing, report any deliberate project exception that conflicts with the standards. Do not invent business content or data. After implementation, list verified acceptance checks and any external blocker.