# Analytics for deerva.com admin

Port the analytics system proven in Lumidenta: cookie-free visitor collection, bot filtering, an "engaged visitor" rule, and an admin page with 7 / 30 / 90 day ranges. Scope for now: deerva.com traffic only. No conversions block yet (no form on the site).

## What you get

A new **Analytics** item in the admin sidebar, showing for the chosen period:

- Visitors and page views, with change vs the previous period
- A daily chart of visitors and views
- Countries (flag + name + visitors)
- Traffic sources — which sites people arrive from (Google, LinkedIn, direct, etc.)
- Devices (mobile / tablet / desktop)
- Top pages
- Average time on page and bounce rate
- A toggle to also include very short visits, off by default

## How visitors are counted

- No cookies, no third-party scripts, no IP address is ever stored. A random session id lives in the browser tab only.
- A visit is recorded only after **real engagement**: 5 seconds on the page, or a scroll / click / keypress. Anything shorter is never stored, which removes the 1-3 second drive-by traffic.
- Known crawlers, monitors, preview fetchers and AI scrapers are dropped by user-agent before anything is written.
- Country comes from the edge request header, not from an IP lookup.
- Signed-in staff visits are not counted.
- Data older than 14 months is deleted.

## Technical details

Database migration:

- `public.page_views` (id uuid, path, session_id, referrer, user_agent, country_code, device, engaged, is_bot, duration_ms, created_at) with indexes on `created_at`, `country_code`, and a partial index on engaged non-bot rows.
- No `anon` / `authenticated` INSERT — writes only via service role from the collector. RLS on; staff-only SELECT through `is_admin_staff(auth.uid())`; `GRANT ALL ... TO service_role`.
- `public.analytics_summary(_from date, _to date, _include_short boolean)` — security-definer, returns one jsonb payload (totals, previous period, daily series, top pages, countries, sources, devices, avg duration, bounce rate, pages per visit). Raises unless the caller is admin staff. `EXECUTE` granted to `authenticated` only.
- `public.prune_page_views()` deleting rows older than 14 months, executable by `service_role`.

App code:

- `src/lib/bot-detect.ts` — crawler user-agent patterns (ported).
- `src/lib/page-view-tracking.ts` — `usePageViewTracking(pathname, enabled)`: engagement timer + interaction listeners, `sendBeacon` flush of final dwell time on hide/unmount.
- `src/routes/api/public/pv.ts` — POST collector, Zod-validated, reads `cf-ipcountry`, derives device from the user agent, drops bots, upserts through `supabaseAdmin` loaded inside the handler.
- `src/routes/__root.tsx` — enable tracking only for public paths (not `/admin`, `/api`) and only when no staff session is present.
- `src/hooks/admin/useAnalytics.ts` — range query + duration/country/percent-change helpers.
- `src/routes/_authenticated/admin/analytics.tsx` — the admin page, built from existing shadcn components in the current light admin theme; sidebar entry added in `AdminSidebar.tsx`.

Nothing on the public landing page changes visually.
