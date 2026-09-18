import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type StandardDraft = Database["public"]["Tables"]["standard_drafts"]["Row"];
export type ProjectStandardAssignment = Database["public"]["Tables"]["project_standard_assignments"]["Row"];

const targetKind = z.enum(["standard", "skill", "document"]);
const draftStatus = z.enum(["draft", "ready", "implemented", "archived"]);
const coverageStatus = z.enum(["compliant", "review_needed", "exception", "not_applicable"]);

const draftInput = z.object({
  id: z.string().uuid().optional(),
  target_kind: targetKind,
  target_slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  reason: z.string().max(2000),
  content: z.string().max(100000),
  base_revision: z.string().max(64),
  status: draftStatus,
});

export const getStandardsLibrary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { listLibraryDocuments } = await import("@/lib/standards.server");
    return listLibraryDocuments();
  });

export const getStandardsDocument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { getLibraryDocument } = await import("@/lib/standards.server");
    const document = getLibraryDocument(data.slug);
    if (!document) throw new Error("Document not found.");
    return document;
  });

export const listStandardDrafts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StandardDraft[]> => {
    const { data, error } = await context.supabase
      .from("standard_drafts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveStandardDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => draftInput.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      target_kind: data.target_kind,
      target_slug: data.target_slug,
      title: data.title.trim(),
      reason: data.reason.trim(),
      content: data.content,
      base_revision: data.base_revision,
      status: data.status,
    };
    const query = data.id
      ? context.supabase.from("standard_drafts").update(payload).eq("id", data.id)
      : context.supabase.from("standard_drafts").insert(payload);
    const { data: row, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteStandardDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("standard_drafts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listProjectStandardAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProjectStandardAssignment[]> => {
    const { data, error } = await context.supabase
      .from("project_standard_assignments")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveProjectStandardAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    client_id: z.string().uuid(),
    standard_slug: z.string().min(1).max(120),
    applied_revision: z.string().max(64),
    status: coverageStatus,
    notes: z.string().max(2000),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      ...data,
      reviewed_at: new Date().toISOString(),
      reviewed_by: context.userId,
    };
    const { data: row, error } = await context.supabase
      .from("project_standard_assignments")
      .upsert(payload, { onConflict: "client_id,standard_slug" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });