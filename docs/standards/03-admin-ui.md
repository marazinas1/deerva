# 03 — Admin UI brandbook

This standard answers **how the admin looks**. Preserve each project's brand through semantic token values; standardise component anatomy, spacing, density and behaviour.

StageHomy is the reference for thin borders, quiet surfaces and confident density. Its admin source contains hardcoded colours, so copy the aesthetic only. Rebuild every recipe below from semantic tokens. Halliday Architects is the closest Settings-structure reference. Lumidenta proves the same system can remain warm and green without changing its component rules.

## Token discipline

Reusable admin components use only the core semantic roles: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border` and their standard foreground/input/ring/status partners.

Never use project aliases (`ink`, `stone`, `paper`, `sand`, `charcoal`, `slate`), raw colour utilities, hex values or a separate admin palette. `--radius` and the font family remain brand values; every component consumes them instead of declaring a local radius or font.

## Shell

- Desktop: fixed collapsible sidebar, top utility bar, flexible main area.
- Mobile: sidebar becomes a drawer and closes after navigation.
- The logo is above navigation. The sidebar footer holds account identity and session actions.
- Main padding is exactly the shared shell spacing; route components do not add a second page-width wrapper.
- The top bar contains the sidebar trigger, concise admin identity and “Back to site”. It is not a second navigation menu.

## Page header

Every screen begins with one unframed header row:

- left: `h1` and one sentence describing the business task;
- right: at most one primary action, with secondary utilities beside it only when needed;
- mobile: action wraps below the text without overlap;
- never centre an admin page title and never put the header inside a card.

## Surface and spacing recipes

- **Section:** unframed full-width content group, separated by `space-y-4` or `space-y-6`.
- **Card:** `border border-border bg-card text-card-foreground`, derived `rounded-lg`, no shadow by default, `p-4` compact or `p-6` standard.
- **Clickable card:** the same anatomy plus pointer, subtle border/background hover and visible focus ring; hover never changes size.
- **Inset panel:** `bg-muted` with border only when separation is otherwise unclear. Never nest decorative cards inside cards.
- **Density:** compact rows 40–44 px, controls 36–40 px, standard card gaps 16–24 px. A page chooses compact or standard density deliberately; it does not mix them randomly.

Borders, not shadows, establish admin hierarchy. A semantic soft shadow is reserved for overlays, dropdowns and dialogs.

## Tabs

Use one shared AdminTabs treatment everywhere:

- the tab list has a visible `border-border` boundary and stable height;
- each trigger has the same padding and derived radius;
- active state changes the whole trigger surface (`bg-card`, `text-foreground`, visible border), never only an underline;
- inactive state is readable `text-muted-foreground`, not low-contrast decoration;
- tabs are never pills and never use local arbitrary radii;
- on mobile, use horizontal scrolling for many labels or an intentional equal-width grid for two to four short labels. Text may wrap, but must never clip.

## Forms

- Label remains visible above every control. Optional or recommended status is quiet text beside the label.
- Placeholder is a faint example only; it must never look like saved content.
- Help text sits below the control; errors replace or follow it and state the correction.
- Related fields use `grid gap-4 sm:grid-cols-2`; long text, addresses and media occupy the full row.
- Save area has a top border, primary Save action and explicit unsaved/saving/saved state. Long screens may use a sticky save bar when it does not cover content.
- Read-only forms stay legible and include a notice explaining who can edit.

## Tables, lists and toolbars

- Search and filters sit in one toolbar above the results. Primary create action belongs in the page header, not among filters.
- Desktop tables have stable columns and clear row hover only when a row opens something.
- On mobile, preserve actions and meaning: allow a table viewport to scroll horizontally or switch to a purpose-built row/card layout. Never let the whole page overflow.
- Pagination or incremental loading is mandatory for potentially large collections.
- Row actions use an overflow menu when more than two; destructive actions stay visually separate.

## Accordions and expandable lists

Use expandable rows for testimonials, articles, services, FAQ and other records with a short identity plus a long edit form.

- Collapsed row shows title, state, ordering and the most useful summary.
- Expanding reveals the edit form in place; one item is open by default unless comparison requires more.
- Lists with many items provide “Expand all” and “Collapse all”.
- Expansion controls have `aria-expanded`, visible focus and a chevron; the whole row is clickable only when every click has the same result.

## States

- **Loading:** skeletons or reserved rows matching the final layout; never a blank screen.
- **Empty:** plain client-language statement plus one relevant next action where permitted.
- **Error:** explain what failed and offer retry; preserve entered form data.
- **Read-only:** explain the role limit; do not make the UI look broken.
- **Success/warning/info:** semantic status tokens only. Status is conveyed by label/icon as well as colour.

## Icon dictionary

Use Lucide only, with 16 px sidebar/action icons and 20 px section icons unless a component standard says otherwise.

| Purpose | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Inquiries | `Inbox` |
| Calendar | `CalendarDays` |
| Messages | `MessageSquare` |
| Analytics | `BarChart3` |
| Projects / developments | `Building2` |
| Services | `BriefcaseBusiness` |
| Articles | `Newspaper` |
| Testimonials | `Quote` |
| Users | `UserCog` |
| Settings | `Settings` |
| Back to site | `ArrowLeft` |
| Sign out | `LogOut` |

Define one semantically precise icon for a new sector entity before building its navigation, then reuse it everywhere. Icon-only buttons require a tooltip and accessible name.

## Interaction and accessibility

- Every interactive element uses pointer; disabled controls use not-allowed.
- Focus-visible ring is never removed. Keyboard order follows visual order.
- Touch targets are at least 40 px where practical.
- Hover changes colour, opacity or border over about 150 ms; never size or layout.
- Respect reduced motion. Admin screens do not use scroll reveals or decorative movement.
- Text, buttons, tabs and badges must wrap or resize without clipping at 320 px width.

## Responsive acceptance check

Verify at phone, tablet and desktop widths:

1. sidebar/drawer navigation is complete and closes correctly;
2. page header and actions do not overlap;
3. tabs remain reachable and readable;
4. forms retain logical field order;
5. tables/lists preserve every action;
6. dialogs fit the viewport and their footer remains reachable;
7. no whole-page horizontal scrolling appears.