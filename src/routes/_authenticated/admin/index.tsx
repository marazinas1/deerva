import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

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
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-foreground">
        Hi{me?.fullName ? `, ${me.fullName.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-sm text-muted">Deerva control panel.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/clients"
          className="rounded-lg border border-border p-5 transition-colors hover:border-accent"
        >
          <p className="text-sm text-muted">Clients</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{clients?.length ?? "—"}</p>
          <p className="mt-1 text-xs text-muted">{active} active</p>
        </Link>
        <div className="rounded-lg border border-border p-5">
          <p className="text-sm text-muted">Inquiries</p>
          <p className="mt-2 text-3xl font-semibold text-muted">—</p>
          <p className="mt-1 text-xs text-muted">Coming in the next phase</p>
        </div>
      </div>
    </div>
  );
}
