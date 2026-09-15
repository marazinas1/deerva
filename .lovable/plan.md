# Admin assistant — a helper that knows Deerva

A small chat bubble in the bottom corner of every admin page. You ask it how
something works or what your numbers say, it answers in the language you write
in. Nothing on the public site.

Note: I read the Revoo repository you linked — it has no chatbot in it, so
there is nothing to copy. This is built from scratch for Deerva.

## About credits

Yes, it will cost much less than asking me the same question. One question here
is a single small request to the AI, not a full agent turn that reads and writes
your code. Two things keep it cheap:

- a fast, low-cost model instead of a coding model;
- the assistant only loads the document it actually needs, instead of sending
  every standard on every question.

What it cannot do: change code, build features or fix bugs. For that you still
come back here.

## My recommendation on conversations

One ongoing conversation, saved in your browser, with a "Start over" button.
You are the only user, your questions are short and one-off, and a saved
conversation list would be more clutter than help. Nothing goes into the
database, so there is nothing extra to maintain. If you later want a history of
past chats, it is an easy addition.

## What it can answer

**How things work** — from your own written standards and project documents:
roles and who may do what, the admin structure, the content model, SEO rules,
analytics rules, project lifecycle, the tech baseline, and Deerva's own plan.

**What your data says** — it can look up, on request:

- your projects: status, country, fees, links, contacts, payment dates,
  monthly recurring totals, who is due or overdue;
- your visitor numbers for a chosen period: visitors, views, top pages,
  countries, sources, referrers, devices;
- your people: who has access and with what role;
- your business details from Settings.

It reads through your own signed-in permissions, so it can never show anything
you could not already see in the admin, and it can never change anything — every
lookup is read-only.

## How it behaves

- Answers stream in as they are written.
- It says plainly when it does not know, instead of inventing.
- It answers in the language of your question.
- Errors (credits ran out, too many requests) are shown in the panel in plain
  words, not hidden behind a fake answer.
- The bubble is staff-only and lives inside the admin area only.

## Technical notes

**Model**: `google/gemini-3.8-flash` through the Lovable AI Gateway with the AI
SDK (`streamText`, OpenAI-compatible provider, `Lovable-API-Key` header, server
only). Chosen over a frontier model deliberately — it is fast and materially
cheaper per question, which is the point of this feature.

**Endpoint**: `src/routes/api/chat.ts` — a TanStack server route, since the chat
UI streams. It verifies the Supabase bearer token and rejects anyone who is not
admin staff before any model call, so the route is not an open AI endpoint.

**Knowledge**: the nine files in `docs/standards/` plus `AGENTS.md`,
`FRONTEND.md` and `PLAN.md`, imported as raw text server-side. Only
`docs/standards/README.md` and a short hand-written admin map go into the system
prompt; the rest are reachable through a `readDoc(name)` tool the model calls
when the question needs one. This keeps the average question small.

**Data tools** (AI SDK tools, each a read-only query through the request's
authenticated Supabase client, RLS applies):
`listProjects`, `getAnalytics(from, to)` (reuses the existing
`analytics_summary` function), `listStaff`, `getSettings`. `stopWhen:
stepCountIs(10)`.

**UI**: AI Elements installed from the registry (`conversation`, `message`,
`prompt-input`, `shimmer`, `tool`) and composed into
`src/components/admin/AssistantBubble.tsx`, mounted once in
`src/routes/_authenticated/admin/route.tsx`. `useChat` with
`DefaultChatTransport`, one conversation id, messages persisted to
`localStorage`; messages rendered from `message.parts`; tool calls shown
collapsed. Styling uses the existing admin tokens — no new colours.

**Not touched**: public site, SEO, analytics collection, projects, users,
settings, database schema. No new tables, no migration.
