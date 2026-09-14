# 02 — Admin structure

The admin panel is the product. The public site is what it produces. If the client needs to be taught how to add a service or answer an enquiry, the admin is not finished.

## Menu order — fixed

Ordered from most-used to least-used. Same in every project.

```
DAILY
  Overview        dashboard: what needs attention, key numbers
  Enquiries       incoming leads / requests
  Messages        conversations (if the sector has them)
  Analytics       real visitors, countries, sources

MANAGE            ← the sector-specific part
  <repeating entity>    services / listings / projects / developments
  Articles              every project has a blog
  Testimonials

SETTINGS
  Users
  Settings        tabbed, see below
```

Only the MANAGE group changes between sectors. DAILY and SETTINGS are identical everywhere.

Footer of the sidebar: user email, role label in small caps, "Back to site", "Sign out".

## Settings tabs

Tab one and the last tab are fixed. The middle tabs **mirror the public site's menu** — one tab per public page.

```
Business        name, address, phone, email, licence numbers, social links
Appearance      logo upload, logo size slider, favicon, reset to default
Home texts      every editable slot on /
About texts     …
Contact texts   …
<one tab per further public page>
Maintenance     maintenance mode toggle — visitors see a holding page

## Maintenance mode behaviour

When a signed-in staff member visits the site while maintenance mode is on, they see the real public site, not the holding page, but with a persistent, non-dismissible banner at the top: "Maintenance mode is on — you are seeing this site because you are signed in. Visitors see the holding page." The banner has two actions: "Preview as visitor" (switches the view to the same holding page everyone else sees) and "Turn off" (link straight to Settings → Maintenance).

An unsigned-in visitor always sees the holding page, no exceptions.

The default state, while authentication is still being resolved, must be HIDDEN (the holding page), not visible. Showing real content while still checking whether the person is signed in means a quick visit or a crawler could see real content through that window. The default behaviour always shows less, never more, until proven otherwise.
```

Adding a public page means adding its tab in the same change. A page with uneditable text is a bug.

## Logo rule

One logo, one size, everywhere:

- top of the public site
- the sign-in screen
- top-left of the admin sidebar, above the menu

It comes from `site_settings` — uploadable and resizable by the client in Appearance, with "restore default". Clicking it always returns to the home page top, scrolling to the top even when already there.

Favicon is managed in the same tab and derived from the same mark.

## Overview page

Three blocks, in this order:

1. **Needs attention** — unread enquiries, pending requests. Empty state says so plainly.
2. **Numbers** — visits over 7 days, counts of the repeating entity, anything the owner checks weekly.
3. **Quick actions** — 2–4 buttons to the things they do most.

## "Set as default" queue

Clients can ask for their current setup to become the pinned default. They press a button; the developer gets the request in a queue and applies it. Clients never write defaults directly — `page_media_defaults` belongs to the developer.

## Behaviour rules

- Every list has an empty state written in the client's language, not "No data".
- Every destructive action confirms and says what will be lost.
- Saving gives a toast. Unsaved changes warn before navigating away.
- Editors see read-only notices instead of hidden buttons — silence looks like a bug.
- The panel is usable on a phone. Owners check enquiries from a phone.
