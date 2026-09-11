# Deerva

Build a single-page landing site. No navigation, no routing beyond "/", no
backend, no forms, no database.

CONTENT (use this exact copy, nothing invented):
- Wordmark: "Deerva"
- Supporting line: "We build and maintain custom platforms for growing
  businesses."
- Contact: a mailto link reading "marius@deerva.com" (mailto:marius@deerva.com)
- Footer: "© 2026 Deerva"

LAYOUT:
Single centered composition, vertically and horizontally centered in the
viewport, no scrolling needed on desktop. Content stacks the same way on
mobile, just smaller. Max-width of the text block around 420px.

Order top to bottom: wordmark, a short thin horizontal rule (about 48px wide,
1px tall), supporting line, generous gap, contact link. Footer copyright sits
pinned near the bottom of the viewport, small and quiet.

DESIGN TOKENS (use these exact values, do not substitute):
- Background: #15171B
- Primary text: #EDEAE2
- Muted text: #8B8D91
- Accent (rule line, link hover/focus): #5C7A8A
- Hairline (subtle dividers only): #2A2D33

TYPOGRAPHY:
- Wordmark "Deerva": Fraunces (Google Font), weight 500, size clamp(2.5rem,
  6vw, 4rem), tight letter-spacing, color primary text.
- Supporting line, contact link, footer: IBM Plex Sans (Google Font).
  Supporting line at weight 400, ~1.0625rem, line-height 1.6, color muted
  text. Contact link at weight 500, color primary text, accent-colored
  underline, accent color on hover and on keyboard focus with a visible
  focus outline. Footer at weight 400, ~0.8125rem, color muted text.

MOTION:
One single, restrained fade-and-rise entrance (opacity + 8px translateY,
~600ms ease-out) on the whole central block when the page loads. Nothing
else animates. Respect prefers-reduced-motion by disabling it.

Set the page <title> to "Deerva" and a meta description: "We build and
maintain custom platforms for growing businesses."

DO NOT:
- Do not add a navigation bar, menu, or any additional pages/routes
- Do not add a contact form — the mailto link is the only contact method
- Do not add client logos, testimonials, case studies, or pricing
- Do not connect Supabase or add any backend, auth, or database
- Do not use stock photography, illustrations, or icons
- Do not use rounded cards, drop shadows, or gradient backgrounds
- Do not add an all-caps eyebrow label above the wordmark
- Do not append an arrow (→) to the contact link text
- Do not invent any copy beyond what is specified above

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://deerva.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3511cb34-db9e-45c9-87ca-bc7ad64e0b50).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
