import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Deerva" },
      {
        name: "description",
        content: "We build and maintain custom websites and platforms for growing businesses.",
      },
      { property: "og:title", content: "Deerva" },
      {
        property: "og:description",
        content: "We build and maintain custom websites and platforms for growing businesses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="animate-fade-rise w-full max-w-[420px] text-center">
          <h1 className="flex justify-center">
            <img
              src="/logo.png?v=2"
              alt="Deerva"
              width={1024}
              height={512}
              className="h-[clamp(2.5rem,6vw,4rem)] w-auto"
            />
          </h1>
          <div
            className="mx-auto mt-5 h-px w-12 bg-accent"
            aria-hidden="true"
          />
          <p className="mt-5 font-body text-[1.0625rem] font-normal leading-[1.6] text-muted">
            We build and maintain custom websites and platforms for growing businesses.
          </p>
          <div className="mt-10">
            <a
              href="mailto:hello@deerva.com"
              className="font-body text-[1.0625rem] font-medium text-foreground underline decoration-accent underline-offset-4 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              hello@deerva.com
            </a>
          </div>
        </div>
      </main>
      <footer className="pb-8 text-center">
        <p className="font-body text-[0.8125rem] font-normal text-muted">
          © 2026 Deerva
        </p>
      </footer>
    </div>
  );
}
