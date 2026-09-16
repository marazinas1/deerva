# Finance in the Deerva admin panel

An internal section for recording client payments, built on the same logic as
StageHomy but adapted to Deerva: no separate client list, no contractors, no
CSV import, and a Deerva service vocabulary.

## What I found before planning

- Deerva's `clients` table has **no** `contact_name` / `contact_email` /
  `contact_phone` columns — contacts already live in their own
  `client_contacts` table (name, role, email, phone, is_primary).
- There are three clients today: OCDG, StageHomy, Halliday Architects — and a
  single contact row: Patrick Halliday (OCDG, primary).
- Chris & Shannon Halliday and Dorothe Waltner are not in the system yet; they
  get entered by hand once the screens exist.

So point 1 of the brief stays intact in spirit: contacts are extended, not
duplicated — just one level deeper than expected.

## Access

Finance is manager-only: developer and owner. An editor sees no menu item and
no data. Every Finance table reads and writes through `is_manager()`; nothing
is public, nothing is anon-readable.

## Database (structure only, no data loaded)

New tables, each in one migration with grants, row security and policies:

- `contact_emails` — belongs to a contact: address, status, primary flag.
- `contact_phones` — belongs to a contact: number, label, primary flag.
- `payments` — belongs to a **client** (required), contact optional.
  Date paid, services (multi), payment type, invoice number, gross amount,
  gross currency (EUR/USD), FX rate, net EUR, payment method, description.
- `payment_methods` — the managed list feeding the form, with bank details
  fields for future invoicing.

Existing `client_contacts` is extended, not replaced. Its `email` and `phone`
columns stay as a backup; for every filled value a matching primary row is
created in the new child tables, exactly as the earlier contacts migration was
done.

Each contact can have at most one primary email and one primary phone
(enforced in the database, not only in the UI). Every table gets created and
updated timestamps with the shared trigger, and an index on its parent.

No contractor tables, no contractor cost, no brand field, no import tables.

## Money model

- A payment belongs to the client. Assigning a contact is informational only;
  moving a contact between clients never moves past payments.
- Client pays in EUR or USD. The FX rate field appears only when USD is
  chosen. Net EUR is the single accounting figure: calculated live in the form,
  still editable by hand when a figure needs overriding.
- Client status: Active up to 12 months since last payment, Dormant up to 24,
  Old beyond that, No payments if never paid.

Services vocabulary: Platform Build, Maintenance, Feature Addition, Consulting.

## Screens

Finance gets its own menu group with three tabs:

- **Overview** — total income, this year, number of payments, active clients,
  average payment, income-by-year chart, year and service filters.
- **Payments** — list with search, year, service and client filters.
  "+ New payment" opens a form with client search-select and inline
  "+ New client", service multi-select, payment type, invoice number with a
  `YYMMDD-N` hint, payment method, currency, live net EUR.
- **Payment Methods** — the managed list behind the form.

The existing **Projects** page gains, per project card: the contact list with
emails and phones and primary toggles, and that client's payment history with
its own totals. Deleting a client stays blocked while payments exist.

## Behaviour carried over from StageHomy

- Every query pages through in 1000-row batches until a short page — totals
  never silently show half.
- While any page is still loading, a loading state is shown; never partial
  numbers, never a false "No payments".
- Search matches company name, contact names, emails and phone numbers.
- Plain-language empty states, confirmation on every destructive action,
  usable from a phone.

## Technical notes

- Reads/writes go through `createServerFn` in a new `src/lib/finance.functions.ts`
  guarded by the same manager assertion as `admin.functions.ts`; no edge functions.
- Shared vocabulary, currency and status helpers in `src/lib/finance.ts`;
  React Query hooks in `src/hooks/admin/useFinance.ts` with the paging helper.
- Routes under `src/routes/_authenticated/admin/finance.*`, UI components in
  `src/components/admin/finance/`, semantic admin tokens only.
- RLS policies call `is_manager()` (existing security-definer function).
  `is_owner()` is not used — it does not exist in Deerva.
- No data is loaded by this work: migrations create structure and move the
  existing contact email/phone values only.
