import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { CANONICAL_ORIGIN, getPublicSiteContext } from "@/lib/settings.functions";

// Invitation and password-reset links land on "/" with the token in the URL hash.
// Capture it before anything can strip it, then hand it to the password page.
const initialHash = typeof window !== "undefined" ? window.location.hash : "";

const TAGLINE = "We build and maintain custom websites and platforms for growing businesses.";
const OG_IMAGE = `${CANONICAL_ORIGIN}/og-image.jpg`;
const FALLBACK_EMAIL = "hello@deerva.com";

export const Route = createFileRoute("/")({
  loader: () => getPublicSiteContext(),
  component: Index,
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    const name = settings?.business_name?.trim() || "Deerva";
    const description = settings?.tagline?.trim() || TAGLINE;
    const email = settings?.contact_email?.trim() || FALLBACK_EMAIL;
    const sameAs = (settings?.social_links ?? []).map((link) => link.url);

    const organisation: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      url: CANONICAL_ORIGIN,
      logo: `${CANONICAL_ORIGIN}/logo.png`,
      image: OG_IMAGE,
      description,
      email,
    };
    if (settings?.contact_phone) organisation["telephone"] = settings.contact_phone;
    if (settings?.address_city || settings?.address_street) {
      organisation["address"] = {
        "@type": "PostalAddress",
        streetAddress: settings.address_street || undefined,
        addressLocality: settings.address_city || undefined,
        addressCountry: settings.address_country || undefined,
      };
    }
    if (sameAs.length > 0) organisation["sameAs"] = sameAs;

    return {
      meta: [
        { title: `${name} — Custom websites and platforms` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} — Custom websites and platforms` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: name },
        { property: "og:url", content: `${CANONICAL_ORIGIN}/` },
        { property: "og:image", content: OG_IMAGE },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${name} — Custom websites and platforms` },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: OG_IMAGE },
        // Preview and staging hosts must never compete with the real domain.
        ...(loaderData && !loaderData.isCanonicalHost
          ? [{ name: "robots", content: "noindex, nofollow" }]
          : []),
      ],
      links: [{ rel: "canonical", href: `${CANONICAL_ORIGIN}/` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(organisation) }],
    };
  },
});

function Index() {
  const { settings } = Route.useLoaderData();
  const tagline = settings.tagline.trim() || TAGLINE;
  const email = settings.contact_email.trim() || FALLBACK_EMAIL;
  const name = settings.business_name.trim() || "Deerva";

  useEffect(() => {
    if (/access_token=|type=(invite|recovery|signup)/.test(initialHash)) {
      window.location.replace(`/admin/set-password${initialHash}`);
    }
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="animate-fade-rise w-full max-w-[420px] text-center">
          <h1 className="flex justify-center">
            <img
              src="/logo.png?v=5"
              alt={name}
              width={716}
              height={192}
              className="h-[clamp(2.25rem,5vw,3.5rem)] w-auto"
            />
          </h1>
          <div className="mx-auto mt-5 h-px w-12 bg-accent" aria-hidden="true" />
          <p className="mt-5 font-body text-[1.0625rem] font-normal leading-[1.6] text-muted">
            {tagline}
          </p>
          <div className="mt-10">
            <a
              href={`mailto:${email}`}
              className="font-body text-[1.0625rem] font-medium text-foreground underline decoration-accent underline-offset-4 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {email}
            </a>
          </div>
        </div>
      </main>
      <footer className="pb-8 text-center">
        <p className="font-body text-[0.8125rem] font-normal text-muted">© 2026 {name}</p>
      </footer>
    </div>
  );
}
