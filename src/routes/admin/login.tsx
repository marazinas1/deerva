import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import AuthCard from "@/components/admin/AuthCard";
import AuthSplit from "@/components/admin/AuthSplit";
import BrandLogo from "@/components/admin/BrandLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  component: AdminLogin,
  head: () => ({
    meta: [
      { title: "Sign in | Deerva admin" },
      { name: "description", content: "Sign in to the Deerva admin panel." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Sign in | Deerva admin" },
      { property: "og:description", content: "Sign in to the Deerva admin panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data.session) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Only accounts with a staff role may enter. RLS hides everyone else.
    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id);

    if (roleError || !roleRows || roleRows.length === 0) {
      await supabase.auth.signOut();
      setError("This account is not authorized.");
      setLoading(false);
      return;
    }

    setLoading(false);
    void navigate({ to: "/admin", replace: true });
  }

  async function onForgotPassword() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/set-password`,
    });
    setNotice("If that address has an account, a reset link is on its way.");
  }

  return (
    <AuthSplit>
      {/* The branded panel is hidden on small screens, so show the mark here. */}
      <div className="mb-10 md:hidden">
        <BrandLogo className="h-10 w-auto" />
      </div>

      <AuthCard eyebrow="Administrator" title="Sign in">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs uppercase tracking-[0.2em] text-stone">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-sm border border-input bg-background px-4 py-3 text-ink transition focus:outline-hidden focus:ring-1 focus:ring-ink"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-[0.2em] text-stone"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-sm border border-input bg-background px-4 py-3 text-ink transition focus:outline-hidden focus:ring-1 focus:ring-ink"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? <p className="text-sm text-stone">{notice}</p> : null}

          <Button
            type="submit"
            disabled={loading}
            className="h-auto w-full rounded-sm px-8 py-3 uppercase tracking-wider"
          >
            {loading ? "Signing In…" : "Sign In"}
          </Button>
        </form>

        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          className="mt-4 w-full text-stone underline underline-offset-4 hover:text-ink"
        >
          Forgot password?
        </Button>
      </AuthCard>

      <p className="mt-8 text-xs uppercase tracking-[0.15em] text-stone">
        Authorized Personnel Only
      </p>
    </AuthSplit>
  );
}
