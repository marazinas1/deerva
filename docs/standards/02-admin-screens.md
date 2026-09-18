# 02B — Admin screen patterns

This standard answers **what each reusable admin screen is made of and how it behaves**. It complements `02-admin-structure.md` and `02-admin-ui.md`.

## Collection screen

Use for services, projects, listings, articles, testimonials, inquiries and users.

```text
Page header: title + one sentence + primary create action
Toolbar: search + relevant filters + result count
Collection: table, cards or expandable rows
Pagination / load-more
Empty, loading, error and read-only states
```

Choose the collection shape by the work:

- **Table** for fast comparison across stable fields.
- **Card grid** when an image or visual state is essential.
- **Expandable rows** when users repeatedly edit long records in context.

Do not offer two navigation paths to the same content. Page text belongs in Settings; repeatable records belong in Manage.

## Expandable editor list

Testimonials are the reference pattern; the same anatomy may serve articles, services and FAQ.

- Start collapsed with title/name, published state, order and short excerpt.
- Open the form inline. Keep no more than one row open by default.
- Provide “Expand all” / “Collapse all” for review work.
- Include a clear “Shown on site” control when publication is optional.
- Save reports success with a toast; closing or navigating with changes triggers a warning.
- Delete uses a confirmation that names the record and what disappears from the public site.

## Edit form versus dialog

- Use inline expansion for frequent editing of repeated items.
- Use a dialog or sheet for a short create flow or a focused secondary task.
- Use a dedicated route for a complex record with multiple sub-sections, history or deep links.
- Never place a long multi-section form in a small modal.

## Page-content Settings tab

Each public page tab follows the rendered page order so the owner can recognise the site while editing it.

- Group fields by public section and label them with client-facing names.
- Every visible string has a text field; every replaceable image has a media slot and alt text.
- Media shows current preview, replace, remove/reset and source state.
- The public component keeps a working fallback; an empty database never creates a broken page.
- A new public route and its Settings tab ship together.

## Defaults workflow

- Owner and editor edit client-owned `page_text` / `page_media` within their permissions.
- Owner can request “Set as default” for the current approved setup.
- The request enters the developer's Needs attention queue with project, page, slot and preview.
- Only developer writes or updates `page_media_defaults` and other pinned defaults.
- Approve and reject actions leave a visible result; clients never directly mutate developer-owned defaults.

## Media slot

```text
Label + recommended aspect/usage
Current preview with truthful crop behaviour
Alt text
Replace / remove or reset
Upload progress and error
```

Every upload uses the shared optimisation pipeline. Replacing or removing media cleans up the old client-owned object. A reset removes the override and reveals the developer default; it does not copy a duplicate file.

## Ordering and publication

- If public order matters, expose a stable explicit order control or proven drag-and-drop interaction. Save the final order, not transient visual state.
- Published/visible is an explicit labelled switch, never inferred from whether fields are filled.
- Hidden items remain editable and are visually marked; editors see why an action is unavailable.

## Inquiries

- Default order: newest first.
- Show unread state, contact identity, received time, source/page and workflow status.
- Opening marks read only when the product has made that consequence clear.
- Reply/contact actions use the available channel; status changes stay separate from contact links.
- Dashboard Needs attention links directly to the filtered unread/pending view.

## Dashboard

Always render in this order:

1. Needs attention — actionable rows with direct destinations.
2. Numbers — a small grid of weekly operational metrics.
3. Quick actions — two to four frequent commands.

Do not fill the dashboard with decorative charts. Analytics depth belongs in Analytics.

## Settings save behaviour

- Business & appearance may use one coordinated save when fields share one source of truth.
- Page tabs save independently so editing one page cannot overwrite another.
- Save buttons keep their width while loading and show a success toast.
- Dirty state is visible and warns on browser close and client-side navigation.
- Validation preserves all entered values and focuses or links to the first error.

## Permission-aware rendering

Security comes from server/database policies. UI mirrors it:

- developer: all controls plus defaults queue;
- owner: business/content/user controls allowed by the chosen role tier, plus request-default actions;
- editor: permitted content fields; no destructive/settings/user actions unless the Team-tier matrix explicitly grants them.

When a control is unavailable, show a concise read-only explanation where its absence would be confusing.