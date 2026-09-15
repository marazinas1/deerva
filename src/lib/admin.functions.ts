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
  next_payment_on: string | null;
  last_paid_on: string | null;
  thumbnail_source: string | null;
  thumbnail_captured_at: string | null;
  favicon_url: string | null;
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
  "id, name, slug, sector, status, country, live_url, lovable_project_url, github_url, thumbnail_path, thumbnail_source, thumbnail_captured_at, favicon_url, onboarding_fee, onboarding_fee_currency, monthly_fee, monthly_fee_currency, billing_cycle, next_payment_on, last_paid_on, notes, created_at, updated_at";

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
  next_payment_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .or(z.literal("")),
  notes: z.string().max(5000).nullable().optional(),
});

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const THUMB_BUCKET = "client-thumbnails";

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (path: string, expires: number) => PromiseLike<{ data: { signedUrl: string } | null }>;
      upload: (path: string, body: Blob | ArrayBuffer, options?: Record<string, unknown>) => PromiseLike<{ error: { message: string } | null }>;
      remove: (paths: string[]) => PromiseLike<{ error: { message: string } | null }>;
    };
  };
};

async function signThumbnails(
  supabase: StorageClient,
  rows: { thumbnail_path: string | null }[],
): Promise<(string | null)[]> {
  return Promise.all(
    rows.map(async (row) => {
      if (!row.thumbnail_path) return null;
      const { data } = await supabase.storage
        .from(THUMB_BUCKET)
        .createSignedUrl(row.thumbnail_path, 60 * 60);
      return data?.signedUrl ?? null;
    }),
  );
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
      .select(CLIENT_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Omit<ClientRow, "contacts" | "thumbnail_url">[];

    const { data: contacts, error: contactError } = await context.supabase
      .from("client_contacts")
      .select(CONTACT_COLUMNS)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });
    if (contactError) throw new Error(contactError.message);

    const signed = await signThumbnails(context.supabase as unknown as StorageClient, rows);

    return rows.map((row, index) => ({
      ...row,
      thumbnail_url: signed[index] ?? null,
      contacts: ((contacts ?? []) as ClientContactRow[]).filter((c) => c.client_id === row.id),
    }));
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clientInput.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      sector: emptyToNull(data.sector),
      status: data.status,
      country: emptyToNull(data.country),
      live_url: emptyToNull(data.live_url),
      lovable_project_url: emptyToNull(data.lovable_project_url),
      github_url: emptyToNull(data.github_url),
      onboarding_fee: data.onboarding_fee ?? null,
      onboarding_fee_currency: data.onboarding_fee_currency ?? null,
      monthly_fee: data.monthly_fee ?? null,
      monthly_fee_currency: data.monthly_fee_currency ?? null,
      billing_cycle: data.billing_cycle ?? null,
      next_payment_on: emptyToNull(data.next_payment_on),
      notes: emptyToNull(data.notes),
    };

    // RLS restricts writes to developer/owner.
    const query = data.id
      ? context.supabase.from("clients").update(payload).eq("id", data.id)
      : context.supabase.from("clients").insert({ ...payload, created_by: context.userId });

    const { data: row, error } = await query.select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("clients")
      .select("thumbnail_path")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await context.supabase.from("clients").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    const path = (existing as { thumbnail_path: string | null } | null)?.thumbnail_path;
    if (path) {
      await (context.supabase as unknown as StorageClient).storage
        .from(THUMB_BUCKET)
        .remove([path]);
    }
    return { ok: true as const };
  });

export const saveClientContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        client_id: z.string().uuid(),
        name: z.string().min(1).max(200),
        role: z.string().max(120).nullable().optional(),
        email: z.string().max(200).nullable().optional(),
        phone: z.string().max(60).nullable().optional(),
        is_primary: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      client_id: data.client_id,
      name: data.name.trim(),
      role: emptyToNull(data.role),
      email: emptyToNull(data.email),
      phone: emptyToNull(data.phone),
      is_primary: data.is_primary,
    };

    const query = data.id
      ? context.supabase.from("client_contacts").update(payload).eq("id", data.id)
      : context.supabase.from("client_contacts").insert(payload);

    const { error } = await query;
    if (error) throw new Error(error.message);

    if (data.is_primary) {
      let unset = context.supabase
        .from("client_contacts")
        .update({ is_primary: false })
        .eq("client_id", data.client_id);
      if (data.id) unset = unset.neq("id", data.id);
      await unset;
    }

    return { ok: true as const };
  });

export const deleteClientContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("client_contacts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

type ThumbUpdate = {
  thumbnail_path: string | null;
  thumbnail_source: string | null;
  thumbnail_captured_at: string | null;
  favicon_url?: string | null;
};

/** Writes the new image reference and deletes the object it replaced. */
async function applyThumbnail(
  supabase: { from: (t: "clients") => any },
  id: string,
  update: ThumbUpdate,
) {
  const { data: existing } = await supabase
    .from("clients")
    .select("thumbnail_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("clients").update(update).eq("id", id);
  if (error) throw new Error(error.message);

  const previous = (existing as { thumbnail_path: string | null } | null)?.thumbnail_path;
  if (previous && previous !== update.thumbnail_path) {
    await (supabase as unknown as StorageClient).storage.from(THUMB_BUCKET).remove([previous]);
  }
}

/** Stores an already-uploaded thumbnail path and removes the previous image. */
export const setClientThumbnail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        path: z.string().max(300).nullable(),
        // Keeps the original origin label when an image is only re-optimised.
        source: z.enum(["upload", "og", "screenshot"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertManager(context.supabase, context.userId);
    await applyThumbnail(context.supabase as never, data.id, {
      thumbnail_path: data.path,
      thumbnail_source: data.path ? (data.source ?? "upload") : null,
      thumbnail_captured_at: data.path ? new Date().toISOString() : null,
    });
    return { ok: true as const };
  });

function absoluteUrl(candidate: string, base: string): string | null {
  try {
    return new URL(candidate, base).toString();
  } catch {
    return null;
  }
}

/** Pulls og:image / twitter:image and the site icon out of a page's head. */
function readHeadImages(html: string, base: string) {
  const head = html.slice(0, 200_000);

  const meta =
    /<meta[^>]+(?:property|name)=["'](?:og:image:secure_url|og:image|twitter:image(?::src)?)["'][^>]*>/i.exec(
      head,
    );
  const metaContent = meta ? /content=["']([^"']+)["']/i.exec(meta[0])?.[1] : undefined;

  const icon = /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i.exec(head);
  const iconHref = icon ? /href=["']([^"']+)["']/i.exec(icon[0])?.[1] : undefined;

  return {
    image: metaContent ? absoluteUrl(metaContent, base) : null,
    favicon: iconHref
      ? absoluteUrl(iconHref, base)
      : absoluteUrl("/favicon.ico", base),
  };
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * One-off image fetch for a project. Prefers the site's own sharing image and
 * falls back to a screenshot. Only ever runs when the button is pressed.
 */
export const fetchClientImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        url: z.string().url(),
        mode: z.enum(["auto", "screenshot"]).default("auto"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertManager(context.supabase, context.userId);

    let source: "og" | "screenshot" = "og";
    let contentType = "image/jpeg";
    let bytes: ArrayBuffer | null = null;
    let favicon: string | null = null;

    try {
      const page = await fetch(data.url, {
        headers: { Accept: "text/html", "User-Agent": "DeervaBot/1.0" },
      });
      if (page.ok) {
        const html = await page.text();
        const found = readHeadImages(html, page.url || data.url);
        favicon = found.favicon;
        // In screenshot mode we still read the head, but only for the favicon.
        if (found.image && data.mode !== "screenshot") {
          const image = await fetch(found.image, { headers: { Accept: "image/*" } });
          const type = image.headers.get("content-type") ?? "";
          if (image.ok && type.startsWith("image/")) {
            const buffer = await image.arrayBuffer();
            if (buffer.byteLength > 5000 && buffer.byteLength <= MAX_IMAGE_BYTES) {
              bytes = buffer;
              contentType = type.split(";")[0] as string;
            }
          }
        }
      }
    } catch {
      // The site may block us; fall through to the screenshot.
    }

    if (!bytes) {
      source = "screenshot";
      const shot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(data.url)}?w=1200&h=750`;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const response = await fetch(shot, { headers: { Accept: "image/*" } });
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          // The service returns a small placeholder while the shot is still rendering.
          if (buffer.byteLength > 20000) {
            bytes = buffer;
            contentType = "image/jpeg";
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }

    if (!bytes) {
      throw new Error("No image found yet. Try again in a moment.");
    }

    const extension = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";
    const path = `${data.id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await (context.supabase as unknown as StorageClient).storage
      .from(THUMB_BUCKET)
      .upload(path, bytes, { contentType, upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    await applyThumbnail(context.supabase as never, data.id, {
      thumbnail_path: path,
      thumbnail_source: source,
      thumbnail_captured_at: new Date().toISOString(),
      favicon_url: favicon,
    });

    return { ok: true as const, path, source };
  });

/** Records a received payment and moves the next payment date forward. */
export const markClientPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertManager(context.supabase, context.userId);

    const { data: row, error: readError } = await context.supabase
      .from("clients")
      .select("billing_cycle, next_payment_on")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!row) throw new Error("Project not found");

    const today = new Date();
    const months =
      row.billing_cycle === "annual" ? 12 : row.billing_cycle === "semiannual" ? 6 : 1;

    const base = row.next_payment_on ? new Date(`${row.next_payment_on}T00:00:00Z`) : today;
    const next = new Date(base);
    next.setUTCMonth(next.getUTCMonth() + months);
    // Never leave the next date in the past after a late payment.
    while (next.getTime() < today.getTime()) {
      next.setUTCMonth(next.getUTCMonth() + months);
    }

    const { error } = await context.supabase
      .from("clients")
      .update({
        last_paid_on: today.toISOString().slice(0, 10),
        next_payment_on: next.toISOString().slice(0, 10),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    return { ok: true as const, next_payment_on: next.toISOString().slice(0, 10) };
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
