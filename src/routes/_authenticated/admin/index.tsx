import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Plus, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAdminMe, listClients } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: me } = useQuery({ queryKey: ["admin", "me"], queryFn: () => getAdminMe() });
  const { data: clients } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => listClients(),
  });

  const active = (clients ?? []).filter((client) => client.status === "active").length;

  return (
    <div className="mx-auto max-w-4xl space-y-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-stone">
          Welcome{me?.fullName ? `, ${me.fullName.split(" ")[0]}` : ""}.
        </p>
      </header>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Needs attention</h2>
        <p className="mt-4 text-sm text-stone">Nothing waiting. Everything is up to date.</p>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Workspace</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          <Link to="/admin/clients" className="group block">
            <span className="block text-4xl font-light tabular-nums text-ink transition-opacity group-hover:opacity-60">
              {clients?.length ?? 0}
            </span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-stone">Clients</span>
            <span className="mt-1 block text-xs text-stone/80">{active} active</span>
          </Link>
          <div>
            <span className="block text-4xl font-light tabular-nums text-stone">—</span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-stone">Inquiries</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Recent activity</h2>
        <div className="mt-4 rounded-lg border border-line bg-card px-6">
          <p className="py-6 text-sm text-stone">Nothing edited yet.</p>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/clients">
              <Plus className="h-4 w-4" />
              Add a client
            </Link>
          </Button>
          {me?.isManager ? (
            <Button asChild variant="outline">
              <Link to="/admin/users">
                <UserCog className="h-4 w-4" />
                Manage users
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="ghost">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View the live site
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
