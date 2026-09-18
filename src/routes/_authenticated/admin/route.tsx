import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AssistantBubble from "@/components/admin/AssistantBubble";
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
      <div className="admin-theme flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="admin-theme flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">We could not load your admin account.</p>
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
        <p className="max-w-sm text-sm text-muted-foreground">
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
        <div className="flex min-h-screen w-full bg-muted">
          <AdminSidebar
            email={me.email ?? ""}
            role={me.role}
            isManager={me.isManager}
            onSignOut={signOut}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
              <SidebarTrigger />
              <span className="truncate font-medium text-foreground">
                Deerva Admin
              </span>
            </header>

            <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
              <Outlet />
            </main>

            <AssistantBubble />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
