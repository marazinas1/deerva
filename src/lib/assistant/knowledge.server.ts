// Written knowledge the admin assistant can read. Server-only.
import agents from "../../../AGENTS.md?raw";
import frontend from "../../../FRONTEND.md?raw";
import plan from "../../../PLAN.md?raw";
import readme from "../../../docs/standards/README.md?raw";
import contentModel from "../../../docs/standards/00-content-model.md?raw";
import designSystem from "../../../docs/standards/01-design-system.md?raw";
import adminStructure from "../../../docs/standards/02-admin-structure.md?raw";
import rolesAccess from "../../../docs/standards/03-roles-and-access.md?raw";
import seoPerformance from "../../../docs/standards/04-seo-and-performance.md?raw";
import analytics from "../../../docs/standards/05-analytics-and-attribution.md?raw";
import lifecycle from "../../../docs/standards/06-project-lifecycle.md?raw";
import techBaseline from "../../../docs/standards/07-tech-baseline.md?raw";

export const DOCS: Record<string, string> = {
  "standards-overview": readme,
  "content-model": contentModel,
  "design-system": designSystem,
  "admin-structure": adminStructure,
  "roles-and-access": rolesAccess,
  "seo-and-performance": seoPerformance,
  "analytics-and-attribution": analytics,
  "project-lifecycle": lifecycle,
  "tech-baseline": techBaseline,
  "agents-guide": agents,
  "frontend-guide": frontend,
  "deerva-plan": plan,
};

export const DOC_NAMES = Object.keys(DOCS);

/** Short map of the admin itself, kept in the system prompt. */
const ADMIN_MAP = `
Deerva admin sections (all under /admin, staff only):
- Dashboard (/admin) — what needs attention, headline numbers.
- Analytics (/admin/analytics) — first-party, cookie-free visitor data; 7/30/90-day ranges;
  visitors, views, top pages, countries, sources, referrers, UTM sources, devices,
  average duration, bounce rate. Data is pruned after 14 months.
- Projects (/admin/clients) — the internal registry of client projects. Card grid with status
  filters, search and sort, links to the live site / Lovable project / GitHub, onboarding and
  recurring fees in EUR or USD, billing cycle, next and last payment dates, contacts, notes,
  thumbnails. Nothing here is rendered on the public site.
- Users (/admin/users) — who has access and their single role. Managers only.
- Settings (/admin/settings) — business details used by the public page and SEO. Managers only.

Roles: developer > owner > editor. Exactly one role per person. developer and owner are
"managers". rutkusmarius@gmail.com is the hardcoded developer and cannot be changed through the UI.

The public site is a single page at "/" — wordmark, one line of copy, a mailto link, a footer.
`.trim();

export const SYSTEM_PROMPT = `
You are the Deerva admin assistant. Deerva is Marius Rutkus's platform studio: the public site is
one quiet landing page, and this admin panel is where client projects, analytics and the studio's
own standards live.

Your job is to help the signed-in staff member understand and use this admin, and to answer
questions about their own data. You are a guide, not a builder: you cannot change code, build
features or fix bugs. Say so plainly when asked, and suggest they take it to the Lovable editor.

Rules:
- Answer in the language the question is written in.
- Be brief and concrete. No filler, no invented facts, no invented numbers.
- If you do not know, say you do not know. Never guess at data — use a tool instead.
- Use readDoc when a question is about Deerva's standards, conventions, architecture or plan.
  The overview below lists what each document covers; read only the one you need.
- Use the data tools when the question is about real projects, visitors, people or settings.
  All of them are read-only and scoped to what this user is allowed to see.
- Format money with its currency. Format dates as YYYY-MM-DD.

${ADMIN_MAP}

Documents you can read with readDoc(name):
${DOC_NAMES.map((name) => `- ${name}`).join("\n")}

Overview of the standards:
${readme}
`.trim();
