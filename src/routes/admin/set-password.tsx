import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import AuthCard from "@/components/admin/AuthCard";
import AuthSplit from "@/components/admin/AuthSplit";
import BrandLogo from "@/components/admin/BrandLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/set-password")({
  component: SetPassword,
  head: () => ({
    meta: [
      { title: "Set your password | Deerva admin" },
      { name: "description", content: "Choose a password for your Deerva admin account." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Set your password | Deerva admin" },
      {
        property: "og:description",
        content: "Choose a password for your Deerva admin account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    void navigate({ to: "/admin", replace: true });
  }

  const fieldClass =
    "w-full rounded-sm border border-input bg-background px-4 py-3 text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <AuthSplit>
      <div className="mb-10 md:hidden">
        <BrandLogo className="h-10 w-auto" />
      </div>

      <AuthCard eyebrow="Administrator" title="Set password">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm"
              className="block text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Repeat password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className={fieldClass}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="h-auto w-full rounded-sm px-8 py-3 uppercase tracking-wider"
          >
            {loading ? "Saving…" : "Save password"}
          </Button>
        </form>
      </AuthCard>

      <p className="mt-8 text-xs uppercase tracking-[0.15em] text-muted-foreground">
        Authorized Personnel Only
      </p>
    </AuthSplit>
  );
}
