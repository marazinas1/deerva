import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Home } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { getAdminMe } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: me, isLoading, error } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => getAdminMe(),
    retry: false,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/admin/login", replace: true });
  }

  if (isLoading) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="admin-theme flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted">We could not load your admin account.</p>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  if (!me.role) {
    return (
      <div className="admin-theme flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-semibold">No access yet</h1>
        <p className="max-w-sm text-sm text-muted">
          Your account has no role assigned. Ask a Deerva owner to give you access.
        </p>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-theme">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-secondary">
          <AdminSidebar
            email={me.email ?? ""}
            role={me.role}
            isManager={me.isManager}
            onSignOut={signOut}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card px-4">
              <SidebarTrigger />
              <span className="truncate font-medium tracking-tight text-foreground">
                Deerva Admin
              </span>
              <Link
                to="/"
                className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back to site</span>
              </Link>
            </header>

            <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
