import { createFileRoute } from "@tanstack/react-router";

import { CANONICAL_ORIGIN } from "@/lib/settings.functions";

/** Public, indexable routes only. Admin and API paths never appear here. */
const PUBLIC_PATHS = [{ path: "/", changefreq: "monthly", priority: "1.0" }];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = PUBLIC_PATHS.map(
          (entry) =>
            `  <url>\n    <loc>${CANONICAL_ORIGIN}${entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
        ).join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
