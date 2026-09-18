import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import BrandLogo from "./BrandLogo";

/**
 * Split sign-in layout: the form on one side, a quiet branded panel on the
 * other. The panel is intentionally typographic — no photography.
 */
export default function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <main className="admin-theme grid min-h-screen grid-cols-1 bg-card md:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <aside className="hidden flex-col items-center justify-center bg-primary px-16 py-24 md:flex">
        <Link to="/" className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground/50">
          <BrandLogo variant="dark" className="h-16 w-auto" />
        </Link>
        <div className="mt-10 h-px w-12 bg-card/20" />
      </aside>
    </main>
  );
}
