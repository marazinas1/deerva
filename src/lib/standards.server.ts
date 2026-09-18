import { createHash } from "crypto";

import agents from "../../AGENTS.md?raw";
import frontend from "../../FRONTEND.md?raw";
import plan from "../../PLAN.md?raw";
import overview from "../../docs/standards/README.md?raw";
import contentModel from "../../docs/standards/00-content-model.md?raw";
import designSystem from "../../docs/standards/01-design-system.md?raw";
import adminScreens from "../../docs/standards/02-admin-screens.md?raw";
import adminStructure from "../../docs/standards/02-admin-structure.md?raw";
import adminUi from "../../docs/standards/02-admin-ui.md?raw";
import rolesAccess from "../../docs/standards/03-roles-and-access.md?raw";
import seoPerformance from "../../docs/standards/04-seo-and-performance.md?raw";
import analyticsAttribution from "../../docs/standards/05-analytics-and-attribution.md?raw";
import projectLifecycle from "../../docs/standards/06-project-lifecycle.md?raw";
import techBaseline from "../../docs/standards/07-tech-baseline.md?raw";
import adminAudit from "../../docs/standards/admin-brandbook-audit.md?raw";
import adminPrompt from "../../docs/standards/admin-template-prompt.md?raw";
import skillAdminScreens from "../../.workspace/skills/deerva-admin-screens/SKILL.md?raw";
import skillAdminStructure from "../../.workspace/skills/deerva-admin-structure/SKILL.md?raw";
import skillAdminUi from "../../.workspace/skills/deerva-admin-ui/SKILL.md?raw";
import skillAnalytics from "../../.workspace/skills/deerva-analytics-attribution/SKILL.md?raw";
import skillContentModel from "../../.workspace/skills/deerva-content-model/SKILL.md?raw";
import skillDesignSystem from "../../.workspace/skills/deerva-design-system/SKILL.md?raw";
import skillRoles from "../../.workspace/skills/deerva-roles-and-access/SKILL.md?raw";
import skillSeo from "../../.workspace/skills/deerva-seo-baseline/SKILL.md?raw";
import skillTech from "../../.workspace/skills/deerva-tech-baseline/SKILL.md?raw";

export type LibraryKind = "standard" | "skill" | "document";

export type LibraryDocument = {
  slug: string;
  title: string;
  description: string;
  category: string;
  kind: LibraryKind;
  content: string;
  revision: string;
  standardSlug: string | null;
};

type SourceDocument = Omit<LibraryDocument, "revision">;

const SOURCES: SourceDocument[] = [
  {
    slug: "standards-overview",
    title: "Deerva Standards",
    description: "The source-of-truth map and reading order.",
    category: "Foundation",
    kind: "document",
    content: overview,
    standardSlug: null,
  },
  {
    slug: "content-model",
    title: "Content model",
    description: "Where every text, image and repeating record belongs.",
    category: "Foundation",
    kind: "standard",
    content: contentModel,
    standardSlug: null,
  },
  {
    slug: "design-system",
    title: "Design system",
    description: "Visual tokens, typography, controls, spacing and motion.",
    category: "Foundation",
    kind: "standard",
    content: designSystem,
    standardSlug: null,
  },
  {
    slug: "admin-structure",
    title: "Admin structure",
    description: "Navigation, settings structure and admin information architecture.",
    category: "Admin",
    kind: "standard",
    content: adminStructure,
    standardSlug: null,
  },
  {
    slug: "admin-ui",
    title: "Admin UI brandbook",
    description: "Shared admin component anatomy and visual behaviour.",
    category: "Admin",
    kind: "standard",
    content: adminUi,
    standardSlug: null,
  },
  {
    slug: "admin-screens",
    title: "Admin screen patterns",
    description: "Collections, editors, media and save workflows.",
    category: "Admin",
    kind: "standard",
    content: adminScreens,
    standardSlug: null,
  },
  {
    slug: "roles-and-access",
    title: "Roles and access",
    description: "Developer, owner and editor permissions.",
    category: "Foundation",
    kind: "standard",
    content: rolesAccess,
    standardSlug: null,
  },
  {
    slug: "seo-and-performance",
    title: "SEO and performance",
    description: "SSR metadata, schema, indexing and performance baseline.",
    category: "Growth",
    kind: "standard",
    content: seoPerformance,
    standardSlug: null,
  },
  {
    slug: "analytics-and-attribution",
    title: "Analytics and attribution",
    description: "First-party analytics and attribution rules.",
    category: "Growth",
    kind: "standard",
    content: analyticsAttribution,
    standardSlug: null,
  },
  {
    slug: "project-lifecycle",
    title: "Project lifecycle",
    description: "The path from concept to maintained platform.",
    category: "Projects",
    kind: "standard",
    content: projectLifecycle,
    standardSlug: null,
  },
  {
    slug: "tech-baseline",
    title: "Technical baseline",
    description: "Stack, backend, migrations, email and storage rules.",
    category: "Foundation",
    kind: "standard",
    content: techBaseline,
    standardSlug: null,
  },
  {
    slug: "admin-template-prompt",
    title: "Reusable admin implementation prompt",
    description: "The complete prompt for applying Deerva admin standards.",
    category: "Admin",
    kind: "document",
    content: adminPrompt,
    standardSlug: "admin-structure",
  },
  {
    slug: "admin-brandbook-audit",
    title: "Admin brandbook audit",
    description: "Cross-project findings behind the admin standard.",
    category: "Admin",
    kind: "document",
    content: adminAudit,
    standardSlug: "admin-ui",
  },
  {
    slug: "agents-guide",
    title: "Project guide",
    description: "Deerva identity, architecture and non-negotiable project rules.",
    category: "Project",
    kind: "document",
    content: agents,
    standardSlug: null,
  },
  {
    slug: "frontend-guide",
    title: "Frontend guide",
    description: "Current routes, components and frontend responsibilities.",
    category: "Project",
    kind: "document",
    content: frontend,
    standardSlug: null,
  },
  {
    slug: "deerva-plan",
    title: "Project plan",
    description: "Current implementation scope and deliberate omissions.",
    category: "Project",
    kind: "document",
    content: plan,
    standardSlug: null,
  },
  {
    slug: "skill-content-model",
    title: "deerva-content-model",
    description: "Active Skill for content ownership and data shape.",
    category: "Foundation",
    kind: "skill",
    content: skillContentModel,
    standardSlug: "content-model",
  },
  {
    slug: "skill-design-system",
    title: "deerva-design-system",
    description: "Active Skill for semantic visual decisions.",
    category: "Foundation",
    kind: "skill",
    content: skillDesignSystem,
    standardSlug: "design-system",
  },
  {
    slug: "skill-admin-structure",
    title: "deerva-admin-structure",
    description: "Active Skill for admin information architecture.",
    category: "Admin",
    kind: "skill",
    content: skillAdminStructure,
    standardSlug: "admin-structure",
  },
  {
    slug: "skill-admin-ui",
    title: "deerva-admin-ui",
    description: "Active Skill for admin visual patterns.",
    category: "Admin",
    kind: "skill",
    content: skillAdminUi,
    standardSlug: "admin-ui",
  },
  {
    slug: "skill-admin-screens",
    title: "deerva-admin-screens",
    description: "Active Skill for admin screen workflows.",
    category: "Admin",
    kind: "skill",
    content: skillAdminScreens,
    standardSlug: "admin-screens",
  },
  {
    slug: "skill-roles-and-access",
    title: "deerva-roles-and-access",
    description: "Active Skill for role and permission rules.",
    category: "Foundation",
    kind: "skill",
    content: skillRoles,
    standardSlug: "roles-and-access",
  },
  {
    slug: "skill-seo-baseline",
    title: "deerva-seo-baseline",
    description: "Active Skill for SEO and performance delivery.",
    category: "Growth",
    kind: "skill",
    content: skillSeo,
    standardSlug: "seo-and-performance",
  },
  {
    slug: "skill-analytics-attribution",
    title: "deerva-analytics-attribution",
    description: "Active Skill for analytics and attribution.",
    category: "Growth",
    kind: "skill",
    content: skillAnalytics,
    standardSlug: "analytics-and-attribution",
  },
  {
    slug: "skill-tech-baseline",
    title: "deerva-tech-baseline",
    description: "Active Skill for technical architecture and delivery.",
    category: "Foundation",
    kind: "skill",
    content: skillTech,
    standardSlug: "tech-baseline",
  },
];

function revision(content: string) {
  return createHash("sha256").update(content).digest("hex").slice(0, 10);
}

export function listLibraryDocuments(): LibraryDocument[] {
  return SOURCES.map((document) => ({ ...document, revision: revision(document.content) }));
}

export function getLibraryDocument(slug: string): LibraryDocument | null {
  return listLibraryDocuments().find((document) => document.slug === slug) ?? null;
}
