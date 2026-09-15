import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Github,
  Globe,
  ImageDown,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import {
  BILLING_CYCLES,
  CLIENT_STATUSES,
  CURRENCIES,
  deleteClient,
  deleteClientContact,
  fetchClientImage,
  getAdminMe,
  listClients,
  markClientPaid,
  saveClient,
  saveClientContact,
  setClientThumbnail,
  type ClientContactRow,
  type ClientRow,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: ProjectsPage,
});

type Currency = (typeof CURRENCIES)[number];
type Status = (typeof CLIENT_STATUSES)[number];
type Cycle = (typeof BILLING_CYCLES)[number];

type FormState = {
  id?: string;
  name: string;
  slug: string;
  sector: string;
  status: Status;
  country: string;
  live_url: string;
  lovable_project_url: string;
  github_url: string;
  onboarding_fee: string;
  onboarding_fee_currency: Currency;
  monthly_fee: string;
  monthly_fee_currency: Currency;
  billing_cycle: Cycle;
  next_payment_on: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  sector: "",
  status: "prospect",
  country: "",
  live_url: "",
  lovable_project_url: "",
  github_url: "",
  onboarding_fee: "",
  onboarding_fee_currency: "EUR",
  monthly_fee: "",
  monthly_fee_currency: "EUR",
  billing_cycle: "monthly",
  next_payment_on: "",
  notes: "",
};

const STATUS_TONE: Record<string, string> = {
  prospect: "bg-muted/15 text-muted",
  building: "bg-accent/15 text-accent",
  review: "bg-accent/10 text-accent",
  live: "bg-emerald-500/15 text-emerald-700",
  paused: "bg-amber-500/15 text-amber-700",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toForm(client: ClientRow): FormState {
  return {
    id: client.id,
    name: client.name,
    slug: client.slug,
    sector: client.sector ?? "",
    status: (CLIENT_STATUSES as readonly string[]).includes(client.status)
      ? (client.status as Status)
      : "prospect",
    country: client.country ?? "",
    live_url: client.live_url ?? "",
    lovable_project_url: client.lovable_project_url ?? "",
    github_url: client.github_url ?? "",
    onboarding_fee: client.onboarding_fee != null ? String(client.onboarding_fee) : "",
    onboarding_fee_currency: (client.onboarding_fee_currency as Currency) ?? "EUR",
    monthly_fee: client.monthly_fee != null ? String(client.monthly_fee) : "",
    monthly_fee_currency: (client.monthly_fee_currency as Currency) ?? "EUR",
    billing_cycle: (client.billing_cycle as Cycle) ?? "monthly",
    next_payment_on: client.next_payment_on ?? "",
    notes: client.notes ?? "",
  };
}

function money(amount: number | null, currency: string | null) {
  if (amount == null) return null;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency ?? "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Downscales to ~1200px wide WebP before upload so storage stays small. */
async function toOptimisedWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process the image");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82),
  );
  if (!blob) throw new Error("Could not process the image");
  return blob;
}

function ProjectsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [current, setCurrent] = useState<ClientRow | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: me } = useQuery({ queryKey: ["admin", "me"], queryFn: () => getAdminMe() });
  const { data: clients, isLoading } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => listClients(),
  });

  const canManage = me?.isManager ?? false;
  const rows = clients ?? [];
  const visible = filter === "all" ? rows : rows.filter((row) => row.status === filter);

  const recurring = rows.reduce<Record<string, number>>((totals, row) => {
    if (row.monthly_fee == null) return totals;
    const key = row.monthly_fee_currency ?? "EUR";
    const factor = row.billing_cycle === "annual" ? 1 / 12 : row.billing_cycle === "semiannual" ? 1 / 6 : 1;
    totals[key] = (totals[key] ?? 0) + row.monthly_fee * factor;
    return totals;
  }, {});

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
  }

  const save = useMutation({
    mutationFn: async (values: FormState) => {
      const result = await saveClient({
        data: {
          ...(values.id ? { id: values.id } : {}),
          name: values.name,
          slug: values.slug || slugify(values.name),
          sector: values.sector,
          status: values.status,
          country: values.country,
          live_url: values.live_url,
          lovable_project_url: values.lovable_project_url,
          github_url: values.github_url,
          onboarding_fee: values.onboarding_fee === "" ? null : Number(values.onboarding_fee),
          onboarding_fee_currency: values.onboarding_fee_currency,
          monthly_fee: values.monthly_fee === "" ? null : Number(values.monthly_fee),
          monthly_fee_currency: values.monthly_fee_currency,
          billing_cycle: values.billing_cycle,
          notes: values.notes,
        },
      });
      return result;
    },
    onSuccess: (result) => {
      toast.success("Project saved");
      setForm((previous) => ({ ...previous, id: result.id }));
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteClient({ data: { id } }),
    onSuccess: () => {
      toast.success("Project deleted");
      setOpen(false);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const capture = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      captureClientThumbnail({ data: { id, url } }),
    onSuccess: () => {
      toast.success("Screenshot saved");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function uploadThumbnail(file: File) {
    if (!form.id) return;
    setUploading(true);
    try {
      const blob = await toOptimisedWebp(file);
      const path = `${form.id}/${Date.now()}.webp`;
      const { error } = await supabase.storage
        .from("client-thumbnails")
        .upload(path, blob, { contentType: "image/webp", upsert: true });
      if (error) throw new Error(error.message);
      await setClientThumbnail({ data: { id: form.id, path } });
      toast.success("Thumbnail updated");
      refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setCurrent(null);
    setOpen(true);
  }

  function openEdit(client: ClientRow) {
    setForm(toForm(client));
    setCurrent(client);
    setOpen(true);
  }

  const liveClient = form.id ? (rows.find((row) => row.id === form.id) ?? current) : null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            Every platform Deerva builds and maintains. Internal only.
          </p>
        </div>
        {canManage ? <Button onClick={openNew}>Add project</Button> : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", ...CLIENT_STATUSES] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
            className="capitalize"
          >
            {value}
          </Button>
        ))}
        {Object.keys(recurring).length > 0 ? (
          <span className="ml-auto text-sm text-muted">
            Monthly recurring:{" "}
            {Object.entries(recurring)
              .map(([currency, amount]) => money(Math.round(amount), currency))
              .join(" · ")}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          No projects here yet. Add the first one to start tracking it.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((client) => (
            <article
              key={client.id}
              className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-accent/50"
            >
              <button
                type="button"
                onClick={() => openEdit(client)}
                className="block w-full text-left"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-muted/10">
                  {client.thumbnail_url ? (
                    <img
                      src={client.thumbnail_url}
                      alt={`${client.name} website`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-muted/50">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate font-medium text-foreground">{client.name}</h2>
                    <Badge className={`capitalize ${STATUS_TONE[client.status] ?? ""}`} variant="secondary">
                      {client.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {[client.country, client.sector].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <p className="text-xs text-muted">
                    {money(client.monthly_fee, client.monthly_fee_currency)
                      ? `${money(client.monthly_fee, client.monthly_fee_currency)} / ${client.billing_cycle ?? "monthly"}`
                      : "No maintenance fee set"}
                    {client.onboarding_fee != null
                      ? ` · setup ${money(client.onboarding_fee, client.onboarding_fee_currency)}`
                      : ""}
                  </p>
                </div>
              </button>
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                {client.live_url ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={client.live_url} target="_blank" rel="noreferrer">
                      <Globe className="h-3.5 w-3.5" /> Live
                    </a>
                  </Button>
                ) : null}
                {client.lovable_project_url ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={client.lovable_project_url} target="_blank" rel="noreferrer">
                      <Sparkles className="h-3.5 w-3.5" /> Lovable
                    </a>
                  </Button>
                ) : null}
                {client.github_url ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={client.github_url} target="_blank" rel="noreferrer">
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </a>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? form.name || "Edit project" : "Add project"}</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-5"
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((previous) => ({ ...previous, status: value as Status }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  placeholder="dental, architect, broker…"
                  value={form.sector}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, sector: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, country: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Billing cycle</Label>
                <Select
                  value={form.billing_cycle}
                  onValueChange={(value) =>
                    setForm((previous) => ({ ...previous, billing_cycle: value as Cycle }))
                  }
                >
                  <SelectTrigger id="billing_cycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLES.map((cycle) => (
                      <SelectItem key={cycle} value={cycle} className="capitalize">
                        {cycle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FeeField
                label="Maintenance fee"
                amount={form.monthly_fee}
                currency={form.monthly_fee_currency}
                onAmount={(value) => setForm((p) => ({ ...p, monthly_fee: value }))}
                onCurrency={(value) => setForm((p) => ({ ...p, monthly_fee_currency: value }))}
              />
              <FeeField
                label="Onboarding fee"
                amount={form.onboarding_fee}
                currency={form.onboarding_fee_currency}
                onAmount={(value) => setForm((p) => ({ ...p, onboarding_fee: value }))}
                onCurrency={(value) => setForm((p) => ({ ...p, onboarding_fee_currency: value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="live_url">Live site URL</Label>
                <Input
                  id="live_url"
                  placeholder="https://…"
                  value={form.live_url}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, live_url: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lovable_project_url">Lovable project URL</Label>
                <Input
                  id="lovable_project_url"
                  placeholder="https://lovable.dev/projects/…"
                  value={form.lovable_project_url}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      lovable_project_url: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  placeholder="https://github.com/…"
                  value={form.github_url}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, github_url: event.target.value }))
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

            <DialogFooter className="gap-2 sm:justify-between">
              {form.id && canManage ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(`Delete ${form.name} and all of its contacts?`)) {
                      remove.mutate(form.id as string);
                    }
                  }}
                >
                  Delete project
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button type="submit" disabled={save.isPending || !canManage}>
                  {save.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>

          {form.id ? (
            <div className="space-y-6 border-t border-border pt-5">
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-foreground">Thumbnail</h3>
                  <div className="flex gap-2">
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadThumbnail(file);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={uploading || !canManage}
                      onClick={() => fileInput.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      Upload
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!form.live_url || capture.isPending || !canManage}
                      onClick={() =>
                        capture.mutate({ id: form.id as string, url: form.live_url })
                      }
                    >
                      {capture.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5" />
                      )}
                      Capture from live site
                    </Button>
                  </div>
                </div>
                <div className="aspect-[16/10] w-full max-w-sm overflow-hidden rounded-md border border-border bg-muted/10">
                  {liveClient?.thumbnail_url ? (
                    <img
                      src={liveClient.thumbnail_url}
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      No image yet
                    </div>
                  )}
                </div>
              </section>

              <ContactsEditor
                clientId={form.id}
                contacts={liveClient?.contacts ?? []}
                canManage={canManage}
                onChanged={refresh}
              />
            </div>
          ) : (
            <p className="border-t border-border pt-4 text-xs text-muted">
              Save the project first — the thumbnail and contact people can be added right after.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeeField({
  label,
  amount,
  currency,
  onAmount,
  onCurrency,
}: {
  label: string;
  amount: string;
  currency: Currency;
  onAmount: (value: string) => void;
  onCurrency: (value: Currency) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={amount}
          onChange={(event) => onAmount(event.target.value)}
        />
        <Select value={currency} onValueChange={(value) => onCurrency(value as Currency)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((code) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

const EMPTY_CONTACT = { name: "", role: "", email: "", phone: "", is_primary: false };

function ContactsEditor({
  clientId,
  contacts,
  canManage,
  onChanged,
}: {
  clientId: string;
  contacts: ClientContactRow[];
  canManage: boolean;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState(EMPTY_CONTACT);

  const save = useMutation({
    mutationFn: (values: typeof EMPTY_CONTACT & { id?: string }) =>
      saveClientContact({
        data: {
          ...(values.id ? { id: values.id } : {}),
          client_id: clientId,
          name: values.name,
          role: values.role,
          email: values.email,
          phone: values.phone,
          is_primary: values.is_primary,
        },
      }),
    onSuccess: () => {
      setDraft(EMPTY_CONTACT);
      toast.success("Contact saved");
      onChanged();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteClientContact({ data: { id } }),
    onSuccess: () => {
      toast.success("Contact removed");
      onChanged();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Contact people</h3>

      {contacts.length === 0 ? (
        <p className="text-xs text-muted">Nobody added yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-foreground">{contact.name}</span>
                  {contact.is_primary ? (
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      Primary
                    </Badge>
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted">
                  {[contact.role, contact.email, contact.phone].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              {canManage ? (
                <>
                  {!contact.is_primary ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        save.mutate({
                          id: contact.id,
                          name: contact.name,
                          role: contact.role ?? "",
                          email: contact.email ?? "",
                          phone: contact.phone ?? "",
                          is_primary: true,
                        })
                      }
                    >
                      Make primary
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm(`Remove ${contact.name}?`)) remove.mutate(contact.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canManage ? (
        <div className="grid gap-2 sm:grid-cols-4">
          <Input
            placeholder="Name"
            value={draft.name}
            onChange={(event) => setDraft((p) => ({ ...p, name: event.target.value }))}
          />
          <Input
            placeholder="Role"
            value={draft.role}
            onChange={(event) => setDraft((p) => ({ ...p, role: event.target.value }))}
          />
          <Input
            placeholder="Email"
            value={draft.email}
            onChange={(event) => setDraft((p) => ({ ...p, email: event.target.value }))}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Phone"
              value={draft.phone}
              onChange={(event) => setDraft((p) => ({ ...p, phone: event.target.value }))}
            />
            <Button
              type="button"
              disabled={!draft.name || save.isPending}
              onClick={() => save.mutate({ ...draft, is_primary: contacts.length === 0 })}
            >
              Add
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
