# Deerva Analytics — Client-site referral tracking

Goal: see in `/admin/analytics` exactly how much traffic arrives from client sites that carry the "Platform developed and maintained by Deerva" footer badge (stagehomy.com, oceancitydevelopment.com, etc.).

## Changes

1. **Capture UTM parameters on page views**
   - Extend `src/lib/page-view-tracking.ts` to read `utm_source`, `utm_medium`, `utm_campaign` from the landing URL (first page of the session only).
   - Extend `src/routes/api/public/pv.ts` to accept and validate these fields.
   - Migration: add `utm_source`, `utm_medium`, `utm_campaign` (text, default '') columns to `public.page_views`, plus the full referrer **domain** column `referrer_host` extracted server-side.

2. **Report real sources in the admin dashboard**
   - Update `analytics_summary` RPC: the `sources` block gains a `referrers` list of top referrer hosts (e.g. `stagehomy.com`, `oceancitydevelopment.com`) with view/visitor counts, plus top `utm_source` values. Keep the existing grouped buckets (google/direct/social/ai).
   - Update `src/hooks/admin/useAnalytics.ts` and the `/admin/analytics` page: new "Client sites & referrers" card listing domains with visitors/views, so badge traffic is visible at a glance.

3. **Footer badge link template for client sites**
   - Provide the exact snippet to paste into each client's footer:
     `https://deerva.com/?utm_source=<client-domain>&utm_medium=referral&utm_campaign=platform-badge`
   - No code change needed on deerva.com for this; it's a copy-paste instruction per client site. Applying it to already-live client sites (StageHomy, Ocean City) is a separate manual step on those projects.

## Notes

- Measurement starts after publishing; past visits cannot be retroactively attributed.
- Some browsers strip referrers; the UTM tags are the reliable fallback — both are captured.
- No changes to bot filtering, engagement logic, or the public landing page design.

## Technical details

- Files: `src/lib/page-view-tracking.ts`, `src/routes/api/public/pv.ts`, `src/hooks/admin/useAnalytics.ts`, `src/routes/_authenticated/admin/analytics.tsx`
- DB: one migration adding 4 columns to `public.page_views` + updated `analytics_summary` function (both backward-compatible with existing rows).
- Verify: typecheck, collector accepts UTM fields, admin page renders new card.
