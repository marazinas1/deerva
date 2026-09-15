import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";

import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
} from "@/lib/ai-gateway.server";
import { requireStaff } from "@/lib/assistant/auth.server";
import { DOCS, DOC_NAMES, SYSTEM_PROMPT } from "@/lib/assistant/knowledge.server";

type ChatRequestBody = { messages?: unknown };

function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const staff = await requireStaff(request);
        if (!staff) return new Response("Unauthorized", { status: 401 });

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("The assistant is not configured yet.", { status: 500 });

        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const { supabase } = staff;
        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);

        const tools = {
          readDoc: tool({
            description:
              "Read one of Deerva's written documents (standards, agent guide, frontend guide, plan).",
            inputSchema: z.object({ name: z.string().describe(DOC_NAMES.join(", ")) }),
            execute: async ({ name }) => {
              const doc = DOCS[name];
              if (!doc) return { error: `Unknown document. Available: ${DOC_NAMES.join(", ")}` };
              return { name, content: doc };
            },
          }),

          listProjects: tool({
            description:
              "List the client projects in the registry with status, country, links, fees and payment dates.",
            inputSchema: z.object({}),
            execute: async () => {
              const { data, error } = await supabase
                .from("clients")
                .select(
                  "name, slug, sector, status, country, live_url, lovable_project_url, onboarding_fee, onboarding_fee_currency, monthly_fee, monthly_fee_currency, billing_cycle, next_payment_on, last_paid_on, notes",
                )
                .order("created_at", { ascending: false });
              if (error) return { error: error.message };
              return { projects: data ?? [] };
            },
          }),

          listProjectContacts: tool({
            description: "List the contact people recorded for client projects.",
            inputSchema: z.object({}),
            execute: async () => {
              const { data, error } = await supabase
                .from("client_contacts")
                .select("name, role, email, phone, is_primary, clients(name)");
              if (error) return { error: error.message };
              return { contacts: data ?? [] };
            },
          }),

          getAnalytics: tool({
            description:
              "Aggregated visitor analytics for the last N days: visitors, views, top pages, countries, sources, referrers, devices.",
            inputSchema: z.object({
              days: z.number().describe("How many days back, for example 7, 30 or 90."),
            }),
            execute: async ({ days }) => {
              const range = Math.min(Math.max(Math.round(days) || 7, 1), 365);
              const { data, error } = await (
                supabase.rpc as unknown as (
                  fn: string,
                  args: Record<string, unknown>,
                ) => Promise<{ data: unknown; error: { message: string } | null }>
              )("analytics_summary", {
                _from: isoDay(range - 1),
                _to: isoDay(0),
                _include_short: false,
              });
              if (error) return { error: error.message };
              return { days: range, summary: data };
            },
          }),

          listStaff: tool({
            description: "List the people who have access to this admin and their role.",
            inputSchema: z.object({}),
            execute: async () => {
              const { data, error } = await supabase
                .from("user_roles")
                .select("role, user_id, profiles(email, full_name)");
              if (error) return { error: error.message };
              return { staff: data ?? [] };
            },
          }),

          getSettings: tool({
            description: "Read the business details stored in admin Settings.",
            inputSchema: z.object({}),
            execute: async () => {
              const { data, error } = await supabase
                .from("site_settings")
                .select("*")
                .maybeSingle();
              if (error) return { error: error.message };
              return { settings: data ?? null };
            },
          }),
        };

        try {
          const result = streamText({
            model: gateway("google/gemini-3.8-flash"),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages as UIMessage[]),
            tools,
            stopWhen: stepCountIs(10),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            headers: getLovableAiGatewayResponseHeaders(undefined, {}),
            onError: (error) => {
              const message = error instanceof Error ? error.message : String(error);
              if (message.includes("402")) {
                return "The workspace has run out of AI credits. Add credits in Lovable to keep using the assistant.";
              }
              if (message.includes("429")) {
                return "Too many requests right now. Wait a moment and ask again.";
              }
              return "The assistant could not answer that request. Please try again.";
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
