# Project card images: correct crop and a real choice of source

## What I found

- **StageHomy looks cut off** because the card frame is 16:10 while the site's own
  sharing image is 1200x630 (about 1.91:1). The card fills the frame and shaves
  the sides, so headline text runs off both edges.
- **Halliday shows the OCDG house** for an honest reason: `ha.stagehomy.com`
  publishes its own sharing image at `https://ha.stagehomy.com/og-image.jpg`, and
  that file on the Halliday site is the same house photo used by OCDG. We are
  taking the image from the right link — the link simply serves that picture.
  So the fix is not the fetch; it is giving you a second way to get the image.

## What I will change

**1. Nothing gets cut off**

- Card image frame becomes 1.91:1, matching the standard sharing-image shape.
- The image is fitted inside the frame instead of filled, on a quiet neutral
  backdrop, so wide or tall images are shown whole. Screenshots keep aligning to
  the top.
- Same treatment in the project detail panel.

**2. Two clear image buttons per project**

Instead of one "fetch image" action:

- **From the site** — uses the site's own sharing image (today's behaviour).
- **Take screenshot** — always captures the live page itself, ignoring the
  sharing image. This is what fixes Halliday: you get a real picture of
  `ha.stagehomy.com`.
- Manual upload stays as it is.

The small caption under the card keeps saying which source the current image
came from and when it was taken.

**3. Correct favicon per project**

The little icon next to each name is also read from the site while fetching. It
stays tied to the address you entered, so each project keeps its own mark.

## Technical notes

- `src/lib/admin.functions.ts`: `fetchClientImage` gains a `mode` input
  (`"auto" | "screenshot"`). `"screenshot"` skips the head-image branch and goes
  straight to the screenshot service; `"auto"` keeps sharing-image-first with
  screenshot fallback. Favicon lookup still runs in both modes so the icon is
  refreshed either way.
- `src/routes/_authenticated/admin/clients.tsx`: image frame `aspect-[1.91/1]`,
  `object-contain` on a neutral surface token; card and detail panel both. The
  single capture button becomes two, wired to the new `mode`.
- No schema change; existing `thumbnail_source` already records `og` vs
  `screenshot`.
