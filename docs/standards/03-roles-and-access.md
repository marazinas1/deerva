# 03 — Roles and access

Identical in every Deerva project. No variations, no per-client exceptions.

## The three roles

| Role | Who | Can |
|---|---|---|
| `developer` | Marius (`rutkusmarius@gmail.com`) | everything, always, in every project |
| `owner` | the client | all content, all settings, invite and manage editors |
| `editor` | client's staff | edit content; no delete, no settings, no user management |

Exactly **one role per user**. No stacking.

## Two tiers — pick one, do not mix

**Solo tier (default)** — one owner, no staff. Use the three-role model
above: `developer` / `owner` / `editor`, one role per user, via `user_roles`
plus the `has_role`/`is_developer`/`is_manager`/`is_admin_staff` functions.

**Team tier** — the client has staff who each need different scopes (e.g. an
agent who only sees their own listings vs a manager who sees everyone's).
Use a `permissions` + `role_permissions` matrix with granular keys
(`resource.action.own` / `resource.action.any`) instead of the three-role
enum. `developer` stays hardcoded and identical either way.

Never introduce the three-role enum into a Team-tier project to
"standardise" it — the granular model is doing a job the enum cannot. Never
introduce the permission matrix into a Solo-tier project — it is unneeded
complexity for a single owner.

## Non-negotiables

1. Roles live in a separate `user_roles` table. Never a column on `profiles` or `users` — that is a privilege-escalation hole.
2. Checks go through `SECURITY DEFINER` functions: `has_role`, `is_developer`, `is_manager`, `is_admin_staff`. RLS policies call those, never query `user_roles` inline.
3. `developer_email()` is hardcoded to `rutkusmarius@gmail.com`. A user with that email is granted `developer` automatically on signup, by trigger.
4. Developer rows cannot be modified or deleted by anyone except a developer. Enforced by a `BEFORE` trigger, not by UI.
5. Nobody can change their own role.
6. At least one owner must always remain. The last owner cannot be demoted or removed.
7. No public sign-up. Access is by invitation only.

## Users page

Shows, for every account: name, email, role badge, `You` badge on the current user, created date, **last sign-in timestamp**. Role and `You` badges sit directly after the identity in one wrapping row. Use the shared outlined/neutral Badge anatomy and a small shield icon where it clarifies protected access. `You` and `Developer` may appear together because they communicate different facts. Developer rows are marked as protected with no controls.

Invite form: email, optional name, role select (owner/editor only), invite button.

The last-sign-in column is not decoration — it is how the health of every client business gets monitored from one place.

## Auth flow

- Sign-in at `/admin/login`, split layout: form left, brand panel right, logo links home.
- Invitation and recovery links land on `/admin/set-password`.
- Auth emails send from the project's own domain, never a platform default address.
- Protected routes live under `_authenticated/`; the route gate is the only auth check. No per-page `useEffect` redirects.
