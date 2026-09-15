<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Deerva

Deerva is the parent brand and control room for every client platform Marius
Rutkus builds. The public site at **https://deerva.com** is a single, quiet
landing page; the real product is the admin panel behind it, where client
projects, first-party analytics and the platform's own standards live.

## What this project is

- **Public**: one route, `/`. Wordmark, one supporting line, a `mailto:` link
  and a copyright line. No navigation, no forms, no marketing sections.
- **Admin**: `/admin`, staff only. Overview, Analytics, Clients, Users,
  Settings.
- **Standards**: `docs/standards/` is the written source of truth for every
  Deerva project. The workspace Skills mirror it; when one changes, change both.

## Sector and repeating entity

Deerva's sector is "platform studio". Its repeating entity is **clients** —
the client projects Deerva builds and maintains. There is no services table,
no listings table, no articles table.

## Copy rules

- Never invent business copy. The landing line, the contact address and the
  footer are exactly what the owner wrote.
- Contact address is `hello@deerva.com` unless `site_settings.contact_email`
  says otherwise; the page reads it from the database with the address as a
  fallback.
- No client names, logos, testimonials, case studies or prices on the public
  page.

## Architecture

- TanStack Start v1, React 19, SSR on for the public page; the admin subtree is
  client-rendered behind the `_authenticated` gate.
- Tailwind v4, CSS-first. Colours and fonts are semantic tokens in
  `src/styles.css` — never hardcoded in a component. The public page is dark
  (`#15171B` / `#EDEAE2` / `#8B8D91` / `#5C7A8A`); the admin panel is the light
  paper/sand/ink/stone/line palette.
- Server logic goes through `createServerFn` (`*.functions.ts`) or
  `src/routes/api/public/*`. No Supabase edge functions.
- Roles: Solo tier — `developer` > `owner` > `editor`, one role per person,
  stored in `user_roles`. `rutkusmarius@gmail.com` is hardcoded as developer
  and must stay untouchable through the UI.

## Deliberate omissions

Enquiries, maintenance mode, a public-text CMS and an Articles section are
deliberately not built here. The standards require Articles in client
projects; Deerva is an internal tool and defers it. See `PLAN.md`.
