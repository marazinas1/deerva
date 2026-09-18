# 01 — Design system

StageHomy is the reference for space, rhythm and motion — section spacing, hover effects, overall restraint. Do not copy its component code directly: Header.tsx, Footer.tsx, HeroSection.tsx and similar files contain hardcoded colours that this standard forbids. Take the aesthetic, not the code. Lumidenta is the reference for applying it to a warm, service-based business. Both are "restrained, confident, generous with space" — that is the Deerva look.

## Tokens

All colour, shadow and font values are **semantic CSS tokens** in `src/styles.css`. Never a hardcoded colour utility in a component — no `text-white`, no `bg-black`, no `bg-[#1a1a1a]`.

```css
:root {
  --background / --foreground
  --card / --card-foreground
  --primary / --primary-foreground
  --secondary / --secondary-foreground
  --muted / --muted-foreground
  --accent / --accent-foreground
  --destructive / --destructive-foreground
  --border / --input / --ring
  --success / --success-foreground
  --warning / --warning-foreground
  --info / --info-foreground
  --shadow-sm / --shadow-md
}
@theme inline { --color-background: var(--background); ... }
```

Per-project the **values** change. The **names** never do. That is what makes a remix a one-file recolour.

The public site and admin share this same semantic token contract. Do not create a separate hardcoded admin palette. Project-specific aliases such as `ink`, `stone`, `paper`, `sand`, `charcoal` or `slate` may support a public design, but reusable admin components use only the core semantic roles above. Raw palette utilities (`emerald-*`, `amber-*`), `white`/`black` utilities and hex colours are forbidden in components.

## Typography

- Every project has one deliberately chosen primary `--font-sans`, loaded with a `<link>` in the root route head — never `@import` a URL in CSS (Tailwind v4 breaks on it).
- Public body copy, the entire admin and every auth screen use that same `--font-sans`. Admin and auth headings must never consume `--font-serif` or `--font-display`.
- A public site may add a serif/display face for expressive public headings, but its selectors must be scoped so they cannot leak into admin or auth. Never apply a display family globally to bare `h1`–`h6` selectors when those screens share the document.
- Urbanist is the house default. Deviate only when the brand demands it, then keep that project's chosen sans consistent across public body, admin and auth — never add a second admin-only font.
- Weights: 300 / 400 / 500 / 600 / 700 / 800. Headings 600–700, body 400, labels 500.
- Body text 16–17px, line-height 1.6. Headings tight tracking.
- Small caps labels: 11px, `uppercase`, `tracking-[0.14em]`, muted colour. Used for section eyebrows and admin group labels.

## Buttons — the hierarchy is fixed

| Variant | Used for | Rule |
|---|---|---|
| `primary` | the one action that moves the user forward | **max one per screen region** |
| `secondary` / `outline` | real alternatives | any number |
| `ghost` | low-weight navigation, toolbar actions | no border until hover |
| `destructive` | delete only | always behind a confirm |
| `link` | inline in prose | underline, accent on hover |

Behaviour, identical everywhere:

- hover: subtle, ~150ms, opacity or one shade — never a size jump
- focus-visible: a real visible ring, always (keyboard users are not optional)
- disabled: 50% opacity, no pointer events
- loading: spinner replaces the label, width does not change

## Fields and states

- Labels are always visible. Placeholders are examples, never substitutes for labels, and are visibly lighter than entered values.
- Help text explains format or consequence; error text names the correction. Neither relies on colour alone.
- `success`, `warning` and `info` use semantic status tokens. Never borrow a brand colour or Tailwind palette colour for a product state.
- Focus rings use `ring`; inputs use `input`; validation and destructive states use `destructive`.
- Loading placeholders keep the final element's dimensions so the page does not jump.

## Cursor

- Every interactive element — buttons, links, clickable cards, table rows that open something, icon buttons — shows `cursor: pointer` on hover.
- Disabled elements show `cursor: not-allowed`.
- Non-interactive text never shows a pointer.

## Layout

- Page container: `max-w-7xl` with `px-4 md:px-6 lg:px-8`. Prose blocks cap at ~65 characters.
- Section vertical rhythm: `py-16 md:py-24`. Hero may go larger; nothing goes smaller.
- Full-bleed sections are allowed and encouraged — the content inside still respects the container.
- Radius: one scale, one per-brand `--radius`, derived sizes. No local arbitrary radii and no pill tabs. Lumidenta may stay softer than OCDG because the value belongs to the brand; component anatomy does not change.
- Shadows: semantic `--shadow-sm` / `--shadow-md`, very soft and low opacity. Borders define most admin surfaces; never use a hard drop shadow.

## Motion

Restraint is the style. Allowed:

- `fade-up` (opacity + ~30px translateY, 0.6–0.8s ease-out) on section entry, once, on scroll into view
- image scale on hover, max 1.03, 400–600ms
- 150ms colour/opacity transitions on interactive elements

Not allowed: parallax, bouncing, auto-playing carousels, anything that moves while the user reads.

`prefers-reduced-motion: reduce` disables all of it. Always.

## Banned by default

Default system fonts · purple/indigo gradients on white · stock photography as filler · icon soup · rounded cards with heavy shadows stacked on gradients · three competing primary buttons · interchangeable hero/nav/footer templates.

## Per-client variation

Same structure, different skin. A concept is: palette + type pair + hero composition + section rhythm. Ten concepts in rotation means two clients in the same sector never recognise each other's site — and none of it is rebuilt from zero.
