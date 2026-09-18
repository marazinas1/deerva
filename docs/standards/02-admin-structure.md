# 02 — Admin structure

The admin panel is the product. The public site is what it produces. This standard answers **what exists and where it lives**. Visual recipes belong in `02-admin-ui.md`; screen workflows belong in `02-admin-screens.md`.

## Menu order — fixed

Order items from most-used to least-used. Every client project has only these three groups:

```text
WORKSPACE
  Dashboard       what needs attention, key numbers
  Inquiries       incoming leads / requests
  Calendar        when the sector requires it
  Messages        conversations, only when the sector has no Calendar
  Analytics       real visitors, countries, sources

MANAGE            the sector-specific group
  <repeating entity>    services / listings / projects / developments
  <other sector management items>
  Articles
  Testimonials

SETTINGS
  Users
  Settings
```

`Workspace` and `Settings` stay identical. Only `Manage` changes with the sector. Do not show Calendar and Messages together without a real product need. Articles and Testimonials are default parts of every client project.

Deerva's own internal control room may document sector-specific omissions because it is not a client website, but it follows the same shell and UI system.

The sidebar footer always shows the user's email, role label in small caps, “Back to site” and “Sign out”.

## Settings tabs — fixed model

The first and last tabs are fixed. The middle tabs mirror the public site's primary navigation in the same order and use the exact public menu labels.

```text
Business & appearance   identity, address, map, contacts, social links,
                        logo, logo size, favicon, maintenance
Home                    editable content for /: text, images and page-specific settings
<one tab per further primary public page, in menu order>
Contact                 always last
```

Legal or shared content that is not a primary-navigation page sits before Contact or in a clearly labelled shared block. Contact remains last.

Name page tabs only after their public menu label: `Home`, `Developments`, `Gallery`, `Testimonials`, `About`, `Contact`. Never append `texts`, `content`, `page`, `settings` or another implementation label. Those qualifiers are misleading because one tab can edit text, images, alt text and page-specific options.

Adding a public page means adding its Settings tab in the same change. Every page tab edits all client-owned content for that page, including text and replaceable images. A visible page with uneditable content is a defect.

Do not duplicate page links in a second sidebar “Content” group. Repeating entities belong in Manage; page-specific text, media and options belong only in Settings.

## Business & appearance

This tab edits the single `site_settings` source of truth:

- business name, licences and domain;
- address, map coordinates, phone, email and social profiles;
- logo upload, one shared logo-size control, favicon and restore default;
- maintenance mode and its visitor message.

One logo and one configured size are used in the public header, sign-in screen and admin sidebar. Clicking the public logo always returns to the home page top, including when already on `/`.

## Maintenance mode behaviour

Maintenance is the last section of Business & appearance, never a separate tab and never a collapsible block. It is small — a switch and one visitor message — so it stays fully visible in its own bordered card at the very bottom of the tab, after the logo and favicon sections. The card carries the title, one explaining sentence, the switch on the right of that row, then the message field with its own `Save`.

An unsigned visitor sees a holding page styled like the real site, with the real phone and email from `site_settings`. They never see the hidden site.

Signed-in staff see the real site with a persistent, non-dismissible banner: “Maintenance mode is on — you are seeing this site because you are signed in. Visitors see the holding page.” It provides “Preview as visitor” and “Turn off”; the latter links directly to the maintenance section inside Business & appearance.

While authentication is unresolved, default to the holding page. The system reveals less until access is proven, never more.

## Admin width

Admin is a working surface, not a reading page. Every admin route uses the full content width; only the shell padding constrains it (`px-4 py-6 md:px-6 md:py-8`).

- Root page container: `w-full` with consistent vertical spacing; never root-level `max-w-*` or `mx-auto` islands.
- Lists, tables, forms and card grids fill the available width. Control density with grid columns, not a narrow wrapper.
- Forms use responsive field grids rather than one narrow column.
- `max-w-*` is allowed only inside dialogs/sheets, public-site preview frames and an isolated short field where full width is nonsensical.
- Every page starts with a left-aligned title, one-sentence description and optional primary action. Width must not jump between sidebar destinations.

## Dashboard

Three blocks, in this order:

1. **Needs attention** — unread inquiries and pending requests; the empty state says plainly that nothing needs attention.
2. **Numbers** — visits over seven days, repeating-entity counts and anything the owner checks weekly.
3. **Quick actions** — two to four links to the most frequent tasks.

## Set as default queue

Owners may request that their current text or media become the pinned default. The developer receives and applies the request. Clients never write `page_media_defaults` or other developer-owned defaults directly.

## Behaviour and access

- Every list has a specific empty state in the client's language, never “No data”.
- Every destructive action confirms exactly what will be lost.
- Saving produces a toast. Unsaved changes warn before navigation.
- Editors see an explicit read-only notice instead of silently missing controls.
- Clickable cards and rows use a pointer cursor; disabled controls use not-allowed.
- The panel works on a phone; owners check inquiries there.
- Visibility and mutation rights follow `03-roles-and-access.md`; hiding a button is never the security boundary.