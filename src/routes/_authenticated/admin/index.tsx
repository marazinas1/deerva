import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Plus, Settings, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/admin/useAnalytics";
import { getAdminMe, listClients } from "@/lib/admin.functions";
import { getSiteSettings } from "@/lib/settings.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: me } = useQuery({ queryKey: ["admin", "me"], queryFn: () => getAdminMe() });
  const { data: clients } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => listClients(),
  });
  const { data: settings } = useQuery({
    queryKey: ["admin", "site-settings"],
    queryFn: () => getSiteSettings(),
  });
  const { data: analytics } = useAnalytics(7);

  const live = (clients ?? []).filter((client) => client.status === "live").length;

  // Anything the owner should act on, in plain words.
  const attention: { text: string; to: "/admin/settings" | "/admin/clients" }[] = [];
  if (settings && !settings.business_name.trim()) {
    attention.push({ text: "Business details are still empty", to: "/admin/settings" });
  }
  if (clients && clients.length === 0) {
    attention.push({ text: "No projects added yet", to: "/admin/clients" });
  }


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
        {attention.length === 0 ? (
          <p className="mt-4 text-sm text-stone">Nothing waiting. Everything is up to date.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {attention.map((item) => (
              <li key={item.text}>
                <Link to={item.to} className="text-sm text-ink underline-offset-4 hover:underline">
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Numbers</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
          <Link to="/admin/analytics" className="group block">
            <span className="block text-4xl font-light tabular-nums text-ink transition-opacity group-hover:opacity-60">
              {analytics?.totals.visitors ?? 0}
            </span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-stone">
              Visitors
            </span>
            <span className="mt-1 block text-xs text-stone/80">last 7 days</span>
          </Link>
          <Link to="/admin/analytics" className="group block">
            <span className="block text-4xl font-light tabular-nums text-ink transition-opacity group-hover:opacity-60">
              {analytics?.totals.views ?? 0}
            </span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-stone">
              Page views
            </span>
            <span className="mt-1 block text-xs text-stone/80">last 7 days</span>
          </Link>
          <Link to="/admin/clients" className="group block">
            <span className="block text-4xl font-light tabular-nums text-ink transition-opacity group-hover:opacity-60">
              {clients?.length ?? 0}
            </span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-stone">
              Clients
            </span>
            <span className="mt-1 block text-xs text-stone/80">{active} active</span>
          </Link>
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
          <Button asChild variant="outline">
            <Link to="/admin/settings">
              <Settings className="h-4 w-4" />
              Business details
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
