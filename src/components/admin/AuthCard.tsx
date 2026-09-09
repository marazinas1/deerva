import type { ReactNode } from "react";

export default function AuthCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-10">
        {eyebrow ? (
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl text-ink">{title}</h1>
        <div className="mt-6 h-px w-12 bg-ink/20" />
      </div>
      <div className="rounded-sm border border-line bg-card p-8">{children}</div>
    </div>
  );
}
