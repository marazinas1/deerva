# 02A — Admin UI brandbook

This standard answers **how the admin looks**. Preserve each project's brand through semantic token values; standardise component anatomy, spacing, density and behaviour.

StageHomy is the reference for thin borders, quiet surfaces and confident density. Its admin source contains hardcoded colours, so copy the aesthetic only. Rebuild every recipe below from semantic tokens. Halliday Architects is the reference for light horizontal tab navigation and Settings structure. Lumidenta proves the same system can remain warm and green without changing its component rules.

## Token discipline

Reusable admin components use only the core semantic roles: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border` and their standard foreground/input/ring/status partners.

Never use project aliases (`ink`, `stone`, `paper`, `sand`, `charcoal`, `slate`), raw colour utilities, hex values or a separate admin palette. `--radius` and `--font-sans` remain brand values; every component consumes them instead of declaring a local radius or font. The entire admin, including every heading, uses `--font-sans`; public `--font-serif` or `--font-display` rules must not leak into it.

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

- the tab list is a transparent horizontal row with a single bottom `border-border` boundary and stable height;
- each trigger has the same padding, no filled rectangle and no local radius;
- active state uses `text-foreground`, medium weight and a clear bottom `primary` border; it never fills the trigger surface;
- inactive state is readable `text-muted-foreground`, not low-contrast decoration;
- tabs are normal case by default, never pills and never forced uppercase. A named strong variant may use bold uppercase only when the project's brand direction explicitly requires it;
- on mobile, keep one horizontally scrollable row with non-wrapping labels. Every tab remains reachable and text never clips.

## Badges

Badges are a required information layer in admin lists, cards and detail headers. They make identity and state scannable without forcing the user to read supporting sentences.

- Use badges for roles (`Developer`, `Owner`, `Editor`), current identity (`You`), publication (`Published`, `Hidden`), workflow/status, permissions (`Read only`) and exceptional attention states.
- Use the shared Badge component. Default anatomy: compact inline-flex label, optional 14–16 px Lucide icon, one-line text, semantic border and token-derived radius. Keep the height stable and visually quieter than buttons.
- Neutral identity/role badges use `secondary`, `muted` or outline roles. State badges use `success`, `warning`, `info` or `destructive` with their foreground pair.
- Every badge must contain a clear text label; colour alone never communicates meaning. Add an icon only when it increases recognition, as with `ShieldCheck` for protected roles.
- Place badges immediately after the name/title they qualify. Multiple badges use a wrapping inline row with a small consistent gap; they must not push primary row actions off-screen.
- `You` and `Developer` may appear together because they answer different questions: identity and permission level. The developer badge is visually protected but not louder than destructive actions.
- Badges are informational, not interactive. Filters, toggles and actions remain proper controls. Never use a badge as a button, tab, decorative category cloud or replacement for explanatory error text.
- Keep labels concise, normally one to three words. Do not show redundant badges when the same state is already the row's explicit heading or only value.

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