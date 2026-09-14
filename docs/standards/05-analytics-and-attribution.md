# 05 — Analytics and attribution

Every client gets honest numbers. Deerva gets a growth loop out of the same system.

## Collection

First-party, cookie-free. No Google Analytics, no third-party pixel, no consent banner needed.

- Session id in `sessionStorage`, regenerated per visit. No cross-site identity.
- The visit is only recorded after **real engagement**: 5 seconds on the page, or a scroll / click / keypress — whichever comes first. Anything shorter is noise, not a visitor.
- Final dwell time is sent when the page is left (`visibilitychange` + beacon).
- IP addresses are never stored. Country is derived server-side and only the two-letter code is kept.
- Bots are filtered server-side by user-agent before insert, and never counted.
- Admin routes, API routes and **signed-in staff visits** are excluded. The owner refreshing their own site does not inflate their numbers.
- Rows are pruned after 14 months.

## What the analytics page shows

Ranges 7 / 30 / 90 days, each compared to the previous equal period.

Visitors · page views · average visit duration · bounce rate · pages per visit · daily chart · countries · sources · devices · top pages · referring sites.

Sources are grouped: direct, google, other search, social by network, AI assistants (ChatGPT / Perplexity / Claude), other. Referring hosts are listed raw alongside, because "other" hides exactly the traffic that matters.

## The Deerva badge — the growth loop

Every platform Deerva builds carries this in its footer:

```
Platform developed and maintained by Deerva
```

linking to:

```
https://www.deerva.com/?utm_source=<client-domain>&utm_medium=referral&utm_campaign=platform-badge
```

The UTM tags are captured on first landing and stored with the page view, so Deerva's own analytics show **which client site sent which visitor**. Without the tags every referral collapses into "other" and the loop is invisible.

Rules:

- one `utm_source` per client domain, always the bare domain (`lumidenta.lt`, not `https://lumidenta.lt/`)
- `utm_medium=referral`, `utm_campaign=platform-badge` — never varied
- UTM tags only on external links pointing at deerva.com; never on internal navigation
- quiet styling: muted text, accent on hover, no logo, no button

More platforms → more badges → more enquiries → more platforms. That is the whole business model in one footer line.
