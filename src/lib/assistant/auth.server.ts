import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type StaffContext = {
  supabase: ReturnType<typeof createClient<Database>>;
  userId: string;
  role: "developer" | "owner" | "editor";
  isManager: boolean;
};

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

/**
 * Verifies the bearer token on a raw server route and returns an RLS-scoped client.
 * Returns null when the caller is not signed in or has no admin role.
 */
export async function requireStaff(request: Request): Promise<StaffContext | null> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return null;

  const supabase = createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isNewSupabaseApiKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const role = (roleRow?.role ?? null) as StaffContext["role"] | null;
  if (!role) return null;

  return { supabase, userId, role, isManager: role === "developer" || role === "owner" };
}
