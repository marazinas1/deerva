import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteClient,
  getAdminMe,
  listClients,
  saveClient,
  type ClientRow,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: ClientsPage,
});

const STATUSES = ["active", "prospect", "paused", "archived"] as const;

type FormState = {
  id?: string;
  name: string;
  slug: string;
  status: (typeof STATUSES)[number];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  status: "active",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  website_url: "",
  notes: "",
};

function toForm(client: ClientRow): FormState {
  return {
    id: client.id,
    name: client.name,
    slug: client.slug,
    status: (STATUSES as readonly string[]).includes(client.status)
      ? (client.status as FormState["status"])
      : "active",
    contact_name: client.contact_name ?? "",
    contact_email: client.contact_email ?? "",
    contact_phone: client.contact_phone ?? "",
    website_url: client.website_url ?? "",
    notes: client.notes ?? "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ClientsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: me } = useQuery({ queryKey: ["admin", "me"], queryFn: () => getAdminMe() });
  const { data: clients, isLoading } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => listClients(),
  });

  const canManage = me?.isManager ?? false;

  const save = useMutation({
    mutationFn: (values: FormState) =>
      saveClient({
        data: {
          ...(values.id ? { id: values.id } : {}),
          name: values.name,
          slug: values.slug || slugify(values.name),
          status: values.status,
          contact_name: values.contact_name,
          contact_email: values.contact_email,
          contact_phone: values.contact_phone,
          website_url: values.website_url,
          notes: values.notes,
        },
      }),
    onSuccess: () => {
      toast.success("Client saved");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteClient({ data: { id } }),
    onSuccess: () => {
      toast.success("Client deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openNew() {
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(client: ClientRow) {
    setForm(toForm(client));
    setOpen(true);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
          <p className="mt-1 text-sm text-muted">Every business Deerva builds and maintains for.</p>
        </div>
        {canManage ? <Button onClick={openNew}>Add client</Button> : null}
      </div>

      <div className="mt-8 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (clients ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted">
                  No clients yet.
                </TableCell>
              </TableRow>
            ) : (
              (clients ?? []).map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-foreground">
                    {client.name}
                    {client.website_url ? (
                      <a
                        href={client.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-xs text-accent underline underline-offset-2"
                      >
                        visit
                      </a>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden text-muted sm:table-cell">{client.slug}</TableCell>
                  <TableCell className="capitalize text-muted">{client.status}</TableCell>
                  <TableCell className="hidden text-muted md:table-cell">
                    {client.contact_email ?? client.contact_name ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {canManage ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(client)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`Delete ${client.name}?`)) remove.mutate(client.id);
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit client" : "Add client"}</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(form);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                      slug: previous.id ? previous.slug : slugify(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug / subdomain</Label>
                <Input
                  id="slug"
                  required
                  value={form.slug}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, slug: slugify(event.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((previous) => ({ ...previous, status: value as FormState["status"] }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact person</Label>
                <Input
                  id="contact_name"
                  value={form.contact_name}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, contact_name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, contact_email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact phone</Label>
                <Input
                  id="contact_phone"
                  value={form.contact_phone}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, contact_phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  placeholder="https://…"
                  value={form.website_url}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, website_url: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, notes: event.target.value }))
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
