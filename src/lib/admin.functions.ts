import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** developer -> owner -> editor. Exactly one role per person. */
export type AppRole = "developer" | "owner" | "editor";

export type AdminMe = {
  userId: string;
  email: string | null;
  fullName: string | null;
  role: AppRole | null;
  isManager: boolean;
  isDeveloper: boolean;
};

export type ClientRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole | null;
  isDeveloper: boolean;
  created_at: string;
};


const clientInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Use lowercase letters, numbers and dashes"),
  status: z.enum(["active", "prospect", "paused", "archived"]),
  contact_name: z.string().max(200).nullable().optional(),
  contact_email: z.string().email().max(200).nullable().or(z.literal("")).optional(),
  contact_phone: z.string().max(50).nullable().optional(),
  website_url: z.string().max(300).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Current signed-in staff member with their single role. */
export const getAdminMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminMe> => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: roleRow, error: roleError }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    ]);

    if (roleError) throw new Error(roleError.message);

    const role = (roleRow?.role ?? null) as AppRole | null;

    return {
      userId,
      email: profile?.email ?? (context.claims["email"] as string | undefined) ?? null,
      fullName: profile?.full_name ?? null,
      role,
      isManager: role === "developer" || role === "owner",
      isDeveloper: role === "developer",
    };
  });


export const listClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ClientRow[]> => {
    const { data, error } = await context.supabase
      .from("clients")
      .select(
        "id, name, slug, status, contact_name, contact_email, contact_phone, website_url, notes, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as ClientRow[];
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clientInput.parse(input))
  .handler(async ({ data, context }): Promise<ClientRow> => {
    const payload = {
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      status: data.status,
      contact_name: emptyToNull(data.contact_name),
      contact_email: emptyToNull(data.contact_email),
      contact_phone: emptyToNull(data.contact_phone),
      website_url: emptyToNull(data.website_url),
      notes: emptyToNull(data.notes),
    };

    // RLS restricts writes to developer/owner; no extra client-side trust needed.
    const query = data.id
      ? context.supabase.from("clients").update(payload).eq("id", data.id)
      : context.supabase.from("clients").insert({ ...payload, created_by: context.userId });

    const { data: row, error } = await query
      .select(
        "id, name, slug, status, contact_name, contact_email, contact_phone, website_url, notes, created_at, updated_at",
      )
      .single();

    if (error) throw new Error(error.message);
    return row as ClientRow;
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("clients").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

async function assertManager(supabase: {
  rpc: (fn: "is_manager", args: { _user_id: string }) => PromiseLike<{ data: unknown; error: unknown }>;
}, userId: string) {
  const { data, error } = await supabase.rpc("is_manager", { _user_id: userId });
  if (error || data !== true) throw new Error("Forbidden");
}

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    const { data: profiles, error } = await context.supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const { data: roles, error: roleError } = await context.supabase
      .from("user_roles")
      .select("user_id, role");
    if (roleError) throw new Error(roleError.message);

    return (profiles ?? []).map((profile) => {
      const role = ((roles ?? []).find((row) => row.user_id === profile.id)?.role ?? null) as
        | AppRole
        | null;
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        role,
        isDeveloper: role === "developer",
      };
    });
  });

/** Only a developer may touch a developer account. */
async function assertMayManageTarget(
  supabase: { rpc: (fn: "is_developer", args: { _user_id: string }) => PromiseLike<{ data: unknown; error: unknown }> },
  callerId: string,
  targetRole: AppRole | null,
  requestedRole: AppRole | null,
) {
  if (targetRole !== "developer" && requestedRole !== "developer") return;
  const { data, error } = await supabase.rpc("is_developer", { _user_id: callerId });
  if (error || data !== true) throw new Error("This account is managed by the developer.");
}

export const inviteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().email().max(200),
        fullName: z.string().max(200).optional(),
        role: z.enum(["owner", "editor"]),
        redirectTo: z.string().url(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertManager(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.email.trim().toLowerCase();

    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: data.redirectTo,
      data: data.fullName ? { full_name: data.fullName } : {},
    });
    if (error) throw new Error(error.message);

    const userId = invited.user?.id;
    if (!userId) throw new Error("Invite failed: no user returned");

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role }, { onConflict: "user_id" });
    if (roleError) throw new Error(roleError.message);

    return { ok: true as const, userId };
  });

/** Sets the single role of a person, or removes their access when role is null. */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["developer", "owner", "editor"]).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertManager(context.supabase, context.userId);

    if (data.userId === context.userId) {
      throw new Error("You cannot change your own role");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId)
      .maybeSingle();

    await assertMayManageTarget(
      context.supabase,
      context.userId,
      (existing?.role ?? null) as AppRole | null,
      data.role,
    );

    if (data.role) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId);
      if (error) throw new Error(error.message);
    }

    return { ok: true as const };
  });

  });
