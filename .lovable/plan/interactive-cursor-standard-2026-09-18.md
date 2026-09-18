# Interactive cursor standard

## Goal

Make "clickable elements show the pointer cursor" a written Deerva standard so it applies by default in every current and future project — no need to ask for it per project.

## Changes

1. **`docs/standards/01-design-system.md`** — add a short rule to the interaction/motion section:
   - Every interactive element (buttons, links, clickable cards, table rows that open something, icon buttons) shows `cursor: pointer` on hover.
   - Disabled elements show `cursor: not-allowed`.
   - Non-interactive text never shows a pointer.
2. **`docs/standards/02-admin-structure.md`** — one line under behavior rules: clickable cards and rows in admin lists use the pointer cursor.
3. **Workspace Skills** — mirror the same rule in the matching active skill(s) (Settings → Skills), so it follows into every project automatically.

## Out of scope

- No code changes to this project (the projects cards already have `cursor-pointer`).
- No changes to client projects now — they pick it up next time someone asks to "apply Deerva standards".
