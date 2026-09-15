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

export type ClientContactRow = {
  id: string;
  client_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
};

export type ClientRow = {
  id: string;
  name: string;
  slug: string;
  sector: string | null;
  status: string;
  country: string | null;
  live_url: string | null;
  lovable_project_url: string | null;
  github_url: string | null;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  onboarding_fee: number | null;
  onboarding_fee_currency: string | null;
  monthly_fee: number | null;
  monthly_fee_currency: string | null;
  billing_cycle: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contacts: ClientContactRow[];
};

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole | null;
  isDeveloper: boolean;
  created_at: string;
};

export const CLIENT_STATUSES = ["prospect", "building", "review", "live", "paused"] as const;
export const CURRENCIES = ["EUR", "USD"] as const;
export const BILLING_CYCLES = ["monthly", "semiannual", "annual"] as const;

const CLIENT_COLUMNS =
  "id, name, slug, sector, status, country, live_url, lovable_project_url, github_url, thumbnail_path, onboarding_fee, onboarding_fee_currency, monthly_fee, monthly_fee_currency, billing_cycle, notes, created_at, updated_at";

const CONTACT_COLUMNS = "id, client_id, name, role, email, phone, is_primary";

const optionalText = z.string().max(300).nullable().optional();

const clientInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Use lowercase letters, numbers and dashes"),
  sector: optionalText,
  status: z.enum(CLIENT_STATUSES),
  country: optionalText,
  live_url: optionalText,
  lovable_project_url: optionalText,
  github_url: optionalText,
  onboarding_fee: z.number().nonnegative().nullable().optional(),
  onboarding_fee_currency: z.enum(CURRENCIES).nullable().optional(),
  monthly_fee: z.number().nonnegative().nullable().optional(),
  monthly_fee_currency: z.enum(CURRENCIES).nullable().optional(),
  billing_cycle: z.enum(BILLING_CYCLES).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}


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
