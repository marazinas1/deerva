import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { isBotUserAgent } from "@/lib/bot-detect";

/**
 * First-party page-view collector. The browser posts here instead of writing to
 * the database, so we can read the edge country header and drop robots before
 * anything is stored. No IP address is ever persisted.
 */
const schema = z.object({
  id: z.string().uuid(),
  path: z.string().min(1).max(2048),
  sessionId: z.string().min(1).max(64),
  referrer: z.string().max(2048).default(""),
  utmSource: z.string().max(200).default(""),
  utmMedium: z.string().max(200).default(""),
  utmCampaign: z.string().max(200).default(""),
  durationMs: z
    .number()
    .int()
    .min(0)
    .max(6 * 60 * 60 * 1000)
    .default(0),
});

function countryFrom(request: Request): string {
  const raw =
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("x-country-code") ??
    "";
  const code = raw.trim().toUpperCase();
  if (!code || code === "XX" || code === "T1" || code.length !== 2) return "";
  return code;
}

function deviceFrom(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (!ua) return "unknown";
  if (ua.includes("ipad") || ua.includes("tablet")) return "tablet";
  if (ua.includes("mobi") || ua.includes("iphone") || ua.includes("android")) return "mobile";
  return "desktop";
}

export const Route = createFileRoute("/api/public/pv")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const parsed = schema.safeParse(body);
        if (!parsed.success) return new Response("Bad request", { status: 400 });

        const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 1024);
        if (isBotUserAgent(userAgent)) {
          // Silently accept but store nothing.
          return new Response(null, { status: 204 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("page_views").upsert(
          {
            id: parsed.data.id,
            path: parsed.data.path,
            session_id: parsed.data.sessionId,
            referrer: parsed.data.referrer,
            user_agent: userAgent,
            country_code: countryFrom(request),
            device: deviceFrom(userAgent),
            engaged: true,
            is_bot: false,
            duration_ms: parsed.data.durationMs,
          },
          { onConflict: "id" },
        );

        if (error) {
          console.error("page view insert failed", error.message);
        }

        return new Response(null, { status: 204 });
      },
    },
  },
});
