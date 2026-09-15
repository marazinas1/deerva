import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The site's public, canonical origin. Anything else must not be indexed. */
export const CANONICAL_ORIGIN = "https://deerva.com";

export type SocialLink = { label: string; url: string };

export type SiteSettings = {
  business_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  address_street: string;
  address_city: string;
  address_country: string;
  primary_domain: string;
  social_links: SocialLink[];
};

const SELECT =
  "business_name, tagline, contact_email, contact_phone, address_street, address_city, address_country, primary_domain, social_links";

export const EMPTY_SETTINGS: SiteSettings = {
  business_name: "",
  tagline: "",
  contact_email: "",
  contact_phone: "",
  address_street: "",
  address_city: "",
  address_country: "",
  primary_domain: "",
  social_links: [],
};

const socialLink = z.object({
  label: z.string().min(1).max(60),
  url: z.string().url().max(300),
});

const settingsInput = z.object({
  business_name: z.string().max(200),
  tagline: z.string().max(300),
  contact_email: z.string().max(200),
  contact_phone: z.string().max(60),
  address_street: z.string().max(200),
  address_city: z.string().max(120),
  address_country: z.string().max(120),
  primary_domain: z.string().max(200),
  social_links: z.array(socialLink).max(12),
});

function normalise(row: Record<string, unknown> | null): SiteSettings {
  if (!row) return EMPTY_SETTINGS;
  const links = Array.isArray(row["social_links"]) ? (row["social_links"] as SocialLink[]) : [];
  return { ...EMPTY_SETTINGS, ...(row as Partial<SiteSettings>), social_links: links };
}

/** Public business identity. Readable by anyone — no session required. */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const { data, error } = await supabase.from("site_settings").select(SELECT).maybeSingle();
    if (error) throw new Error(error.message);
    return normalise(data as Record<string, unknown> | null);
  },
);

/**
 * Everything the public shell needs in one round trip: business identity plus
 * the host this request arrived on, so non-canonical hosts can be de-indexed.
 */
export const getPublicSiteContext = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabase.from("site_settings").select(SELECT).maybeSingle();

  const request = getRequest();
  const url = new URL(request.url);
  const forwarded = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
  const origin = forwarded ? `https://${forwarded}` : url.origin;

  return {
    settings: normalise(data as Record<string, unknown> | null),
    origin,
    isCanonicalHost: origin === CANONICAL_ORIGIN,
  };
});

export const updateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsInput.parse(input))
  .handler(async ({ data, context }): Promise<SiteSettings> => {
    // RLS restricts writes to developer/owner.
    const { data: row, error } = await context.supabase
      .from("site_settings")
      .update({
        business_name: data.business_name.trim(),
        tagline: data.tagline.trim(),
        contact_email: data.contact_email.trim(),
        contact_phone: data.contact_phone.trim(),
        address_street: data.address_street.trim(),
        address_city: data.address_city.trim(),
        address_country: data.address_country.trim(),
        primary_domain: data.primary_domain.trim(),
        social_links: data.social_links,
      })
      .eq("id", true)
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return normalise(row as Record<string, unknown>);
  });
