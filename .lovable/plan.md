# Projects: better images, search and payment dates

I read the Revoo code first. Its projects section has no images at all — only
names, statuses, money and link buttons. So there is nothing to copy for
thumbnails; instead this plan makes Deerva's project images genuinely better,
and borrows the three list features Revoo does well.

## Project images

Today the image comes from a free screenshot service that often returns a blank
or half-rendered page. New order, all triggered by one button ("Get image"):

1. **The site's own sharing image.** Deerva reads the project's live page and
   takes the picture the site already publishes for social sharing. It is
   crisp, branded and instant — usually the best possible image.
2. **A screenshot**, only if the site has no sharing image.
3. **Your own upload**, always available and always wins over both.

The card also shows a small site icon (favicon) next to the project name, and a
quiet "image from the site / screenshot / uploaded" note with the date it was
taken, so you can see at a glance whether a picture is stale.

Nothing runs in the background. Images only change when you press the button or
upload a file.

## List improvements

- **Search** by project name, country or contact name.
- **Sort** by newest, oldest, highest monthly fee, or nearest payment.
- **Numbers row** at the top: live projects, monthly recurring total per
  currency, one-off fees collected, and how many payments are due or overdue.
- **Next payment** on each card: a date field per project, shown as
  "in 12 days" or a red "overdue by 3 days". Marking a payment as received
  moves the date forward by the billing cycle automatically.

## What stays the same

Status filter, card grid, contacts, link buttons, fees and currencies, private
thumbnail storage, admin-only access. The public site is untouched.

## Technical notes

**Migration** — add to `public.clients`:
`next_payment_on date`, `last_paid_on date`, `thumbnail_source text`
(`og` | `screenshot` | `upload`), `thumbnail_captured_at timestamptz`,
`favicon_url text`. Additive only, no drops. Existing RLS and grants unchanged
(staff read via `is_admin_staff`, manager writes via `is_manager`).

**Server functions** in `src/lib/admin.functions.ts`:

- Replace `captureClientThumbnail` with `fetchClientImage`: fetches the live URL
  HTML, parses `og:image` / `twitter:image` and `<link rel="icon">`, resolves
  relative URLs, downloads the image, validates content type and size (max
  ~5 MB), uploads to the private `client-thumbnails` bucket, records
  `thumbnail_source = 'og'` and the timestamp. Falls back to the existing
  mShots screenshot path with the current retry loop when no meta image exists,
  recording `thumbnail_source = 'screenshot'`. Manager check kept.
- `setClientThumbnail` also sets `thumbnail_source = 'upload'` and the timestamp.
- `markClientPaid`: sets `last_paid_on = today` and advances `next_payment_on`
  by the project's `billing_cycle` (monthly / semiannual / annual).
- `saveClient` validator gains `next_payment_on`.
- `listClients` returns the new columns; KPI aggregation is computed in the UI
  from the returned rows (no extra round trip).

**UI** — `src/routes/_authenticated/admin/clients.tsx`: add a search input, a
sort select, a KPI strip above the grid, the payment line plus "Mark paid" on
each card, the image-source caption, and rename the capture button to
"Get image". Existing semantic tokens only, no new colours.

**Not touched**: public site, SEO, analytics, users, settings, sidebar.
