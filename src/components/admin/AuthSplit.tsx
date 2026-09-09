import type { ReactNode } from "react";

import BrandLogo from "./BrandLogo";

/**
 * Split sign-in layout: the form on one side, a quiet branded panel on the
 * other. The panel is intentionally typographic — no photography.
 */
export default function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <main className="admin-theme grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <aside className="hidden flex-col items-center justify-center bg-[#141414] px-16 py-24 md:flex">
        <BrandLogo variant="dark" className="h-16 w-auto" />
        <div className="mt-10 h-px w-12 bg-white/20" />
      </aside>
    </main>
  );
}
