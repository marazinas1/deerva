# Image uploads: one shared optimise step, per Deerva standards

## What the standards say

The standards already cover this in two places:

- `00-content-model.md`: images always go through the optimise pipeline — resize, WebP, EXIF strip; replacing or deleting an image deletes the old file.
- `07-tech-baseline.md`: same rule, plus "no orphans".
- `04-seo-and-performance.md`: WebP, correct dimensions, explicit width/height, lazy below the fold.

So yes — it is written down, and Deerva only partly follows it today.

## Current state

Project thumbnails uploaded by hand are already resized to 1200px wide and converted to WebP at quality 0.82, inside the Projects page itself. Old files are deleted when replaced. What is missing:

- The optimise step lives inside the Projects page, so any future upload elsewhere in admin would not get it.
- Images pulled automatically from a client's site ("From the site" / "Take screenshot") are stored exactly as the site served them — often a large PNG or JPEG, never converted, never resized.
- No guard on what a person can pick: a 40 MB file is decoded in the browser before anything happens, and non-image files only fail late.

## What I will do

1. Create one shared image helper used by every upload in admin, holding the standard in a single place: longest side capped at 1600px, WebP output, quality 0.82, EXIF and other metadata dropped (re-drawing through a canvas removes them), animated or non-image files rejected with a clear message.
2. Reject files over 25 MB before decoding, and tell the person the limit in plain words.
3. Move the Projects page upload onto that helper so behaviour stays the same but the rule has one home.
4. Convert automatically fetched images too: after the site image or screenshot is stored, the browser re-processes it through the same helper and replaces the stored file with the WebP version, so every image in storage follows the same rule. The old file is removed, as today.
5. Show the resulting size and dimensions under the thumbnail in the edit panel, so it is visible that the rule ran.
6. Add a short "Images" note to `docs/standards/07-tech-baseline.md` fixing the exact numbers (1600px, WebP, 0.82, 25 MB input cap) so other projects implement the identical thing, and mirror it in the tech-baseline skill.

## Technical notes

- Optimisation stays client-side (`createImageBitmap` + `OffscreenCanvas`/`canvas` + `toBlob`). The server runs on an edge worker where `sharp` is unavailable, so browser-side is the only correct place.
- New file `src/lib/image-optimise.ts` exporting `optimiseImage(file, opts)` returning `{ blob, width, height }`.
- `fetchClientImage` keeps its current server-side fetch and storage write; the client then runs a follow-up "normalise" pass that downloads the just-stored object, optimises it, uploads the WebP and calls `setClientThumbnail` with the new path. Existing delete-old-object logic already handles cleanup.
- `clients.tsx` loses its local `toOptimisedWebp` in favour of the shared helper.

## Not in this change

- Re-processing images already sitting in storage (can be done later with a one-off pass if wanted).
- Alt-text fields on uploads — the standard asks for them on public-facing images; project thumbnails are admin-only.
