# 04 — SEO and performance

Every Deerva platform must earn traffic. A beautiful site that nobody finds is not a product.

## Rendering

Server-side rendering for every public page. Non-negotiable — it is the reason the stack is TanStack Start and not a plain SPA. The admin subtree is the only client-rendered part.

## Per-page head

Every public route defines its own `head()`. The root route is not a substitute.

```
title           under 60 chars, contains the page's keyword, ends with the brand
description     under 160 chars, written for a human, unique per page
og:title / og:description
og:type         website (home) / article (blog post)
twitter:card    summary_large_image when a real image exists
og:image        absolute https URL only — never a bundled import, never relative
canonical
```

Placeholder titles like "Home" or a shared description across pages are treated as bugs.

## Structure

- One `<h1>` per page, and it says what the page is about.
- Semantic HTML: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Alt text on every image, written by whoever uploads it — the alt field is part of the upload form in admin.
- Internal links use real anchors, never `onClick` navigation.

## Machine readability

`JSON-LD` per sector, generated from `site_settings` so it stays true when the client edits their address:

| Sector | Schema |
|---|---|
| Dentist / clinic | `Dentist` / `MedicalBusiness` + `OpeningHoursSpecification` |
| Architect / studio | `ProfessionalService` + `Organization` |
| Broker | `RealEstateAgent`, listings as `Residence` / `Offer` |
| Developer | `Organization` + `Place` per development |
| Any | `BreadcrumbList`, `Article` on blog posts, `FAQPage` where a FAQ exists |

## Crawling

- `sitemap.xml` generated from real routes and published database rows, not a static file.
- `robots.txt` allows everything public, disallows `/admin` and `/api`, and points at the sitemap once a real domain exists.
- While a project lives on `*.deerva.com`, it carries `noindex`. `noindex` and the robots block are removed together at cutover — the same commit, never separately.

## Performance budget

- LCP under 2.5s on 4G, CLS under 0.1, INP under 200ms.
- Images: WebP, correct dimensions, `loading="lazy"` below the fold, explicit width/height so nothing shifts.
- Hero image preloaded; everything else lazy.
- Fonts: one family, `display=swap`, preconnect to the font host.
- No third-party script without a written reason.

## Launch checklist

Before pointing a client domain at a project:

- [ ] every public route has a unique title and description
- [ ] sitemap returns real URLs, robots is correct, `noindex` removed
- [ ] JSON-LD validates
- [ ] og:image resolves as an absolute URL
- [ ] Lighthouse SEO and Accessibility at 95+
- [ ] 404 page exists and links home
- [ ] analytics recording real visits
- [ ] the Deerva footer badge is in place
