import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Github,
  Globe,
  Camera,
  ImageDown,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  useAddContactChannel,
  useContactEmails,
  useContactPhones,
  useDeleteContactChannel,
  useFinanceClients,
  useFinanceContacts,
  usePaymentMethods,
  usePayments,
  useSavePayment,
  useSetPrimaryChannel,
} from "@/hooks/admin/useFinance";
import PaymentForm from "@/components/admin/finance/PaymentForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { collected, eurExact, shortDate } from "@/lib/finance";

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
import { formatBytes, optimiseImage } from "@/lib/image-optimise";

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
  prospect: "bg-muted text-muted-foreground",
  building: "bg-info/15 text-info-foreground",
  review: "bg-info/10 text-info-foreground",
  live: "bg-success/15 text-success-foreground",
  paused: "bg-warning/20 text-warning-foreground",
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

/** Uploads an optimised copy and points the project at it. */
async function storeOptimised(
  clientId: string,
  source: Blob,
): Promise<{ bytes: number; width: number; height: number }> {
  const { blob, width, height } = await optimiseImage(source);
  const path = `${clientId}/${Date.now()}.webp`;
  const { error } = await supabase.storage
    .from("client-thumbnails")
    .upload(path, blob, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(error.message);
  await setClientThumbnail({ data: { id: clientId, path } });
  return { bytes: blob.size, width, height };
}

const DAY = 86_400_000;

/** Days until the date; negative when it has already passed. */
function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00Z`).getTime();
  const today = new Date();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((target - start) / DAY);
}

function paymentLabel(date: string | null): { text: string; overdue: boolean } | null {
  const days = daysUntil(date);
  if (days == null) return null;
  if (days < 0) return { text: `Overdue by ${Math.abs(days)} d`, overdue: true };
  if (days === 0) return { text: "Due today", overdue: true };
  return { text: `Due in ${days} d`, overdue: false };
}

const SOURCE_LABEL: Record<string, string> = {
  og: "Image from the site",
  screenshot: "Screenshot",
  upload: "Uploaded",
};

type Sort = "newest" | "oldest" | "fee_desc" | "payment";

const SORTS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "fee_desc", label: "Highest fee" },
  { key: "payment", label: "Nearest payment" },
];

function ProjectsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [open, setOpen] = useState(false);
  const [payFor, setPayFor] = useState<ClientRow | null>(null);
  const financeClients = useFinanceClients();
  const financeContacts = useFinanceContacts();
  const paymentMethods = usePaymentMethods();
  const savePayment = useSavePayment();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [current, setCurrent] = useState<ClientRow | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageInfo, setImageInfo] = useState<{
    bytes: number;
    width: number;
    height: number;
  } | null>(null);

  const { data: me } = useQuery({ queryKey: ["admin", "me"], queryFn: () => getAdminMe() });
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => listClients(),
  });

  const canManage = me?.isManager ?? false;
  const rows = clients ?? [];

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!term) return true;
      const haystack = [
        row.name,
        row.country ?? "",
        row.sector ?? "",
        ...row.contacts.flatMap((c) => [c.name, c.email ?? ""]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });

    const sorted = [...matched];
    sorted.sort((a, b) => {
      if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
      if (sort === "fee_desc") return (b.monthly_fee ?? 0) - (a.monthly_fee ?? 0);
      if (sort === "payment") {
        if (!a.next_payment_on) return 1;
        if (!b.next_payment_on) return -1;
        return a.next_payment_on.localeCompare(b.next_payment_on);
      }
      return b.created_at.localeCompare(a.created_at);
    });
    return sorted;
  }, [rows, filter, search, sort]);

  const recurring = rows.reduce<Record<string, number>>((totals, row) => {
    if (row.monthly_fee == null) return totals;
    const key = row.monthly_fee_currency ?? "EUR";
    const factor = row.billing_cycle === "annual" ? 1 / 12 : row.billing_cycle === "semiannual" ? 1 / 6 : 1;
    totals[key] = (totals[key] ?? 0) + row.monthly_fee * factor;
    return totals;
  }, {});

  const onboardingTotals = rows.reduce<Record<string, number>>((totals, row) => {
    if (row.onboarding_fee == null) return totals;
    const key = row.onboarding_fee_currency ?? "EUR";
    totals[key] = (totals[key] ?? 0) + row.onboarding_fee;
    return totals;
  }, {});

  const liveCount = rows.filter((row) => row.status === "live").length;
  const dueCount = rows.filter((row) => {
    const days = daysUntil(row.next_payment_on);
    return days != null && days <= 7;
  }).length;

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
          next_payment_on: values.next_payment_on === "" ? null : values.next_payment_on,
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
    mutationFn: ({
      id,
      url,
      mode,
    }: {
      id: string;
      url: string;
      mode: "auto" | "screenshot";
    }) => fetchClientImage({ data: { id, url, mode } }),
    onSuccess: async (result, variables) => {
      try {
        await normaliseFetched(variables.id, result.source);
      } catch {
        // The image is already saved; only the extra compression failed.
      }
      toast.success(
        result.source === "og" ? "Image taken from the site" : "Screenshot saved",
      );
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const markPaid = useMutation({
    mutationFn: (id: string) => markClientPaid({ data: { id } }),
    onSuccess: () => {
      toast.success("Payment recorded");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function uploadThumbnail(file: File) {
    if (!form.id) return;
    setUploading(true);
    try {
      const result = await storeOptimised(form.id, file);
      setImageInfo(result);
      toast.success(
        `Thumbnail updated — ${result.width}×${result.height}, ${formatBytes(result.bytes)}`,
      );
      refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  /**
   * Images pulled from a client's site arrive as the site served them, so they
   * are re-processed here to the same rule as a manual upload.
   */
  async function normaliseFetched(id: string, source: "og" | "screenshot") {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["admin", "clients"],
      queryFn: () => listClients(),
    });
    const row = fresh.find((item) => item.id === id);
    if (!row?.thumbnail_url) return;
    const response = await fetch(row.thumbnail_url);
    if (!response.ok) return;
    const { blob, width, height } = await optimiseImage(await response.blob());
    const path = `${id}/${Date.now()}.webp`;
    const { error } = await supabase.storage
      .from("client-thumbnails")
      .upload(path, blob, { contentType: "image/webp", upsert: true });
    if (error) throw new Error(error.message);
    await setClientThumbnail({ data: { id, path, source } });
    setImageInfo({ bytes: blob.size, width, height });
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setCurrent(null);
    setImageInfo(null);
    setOpen(true);
  }

  function openEdit(client: ClientRow) {
    setForm(toForm(client));
    setCurrent(client);
    setImageInfo(null);
    setOpen(true);
  }

  const liveClient = form.id ? (rows.find((row) => row.id === form.id) ?? current) : null;

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Projects"
        description="Every platform Deerva builds and maintains. Internal only."
        action={canManage ? <Button onClick={openNew}>Add project</Button> : undefined}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Live projects", value: String(liveCount) },
          {
            label: "Monthly recurring",
            value:
              Object.entries(recurring)
                .map(([currency, amount]) => money(Math.round(amount), currency))
                .join(" · ") || "—",
          },
          {
            label: "Onboarding fees",
            value:
              Object.entries(onboardingTotals)
                .map(([currency, amount]) => money(Math.round(amount), currency))
                .join(" · ") || "—",
          },
          { label: "Payments due", value: String(dueCount) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-lg font-medium text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border py-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, country or contact"
            className="pl-9"
            aria-label="Search projects"
          />
        </div>
        <Select value={filter} onValueChange={(value) => setFilter(value as "all" | Status)}>
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["all", ...CLIENT_STATUSES] as const).map((value) => (
              <SelectItem key={value} value={value} className="capitalize">
                {value === "all" ? "All statuses" : value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {visible.length} of {rows.length}
        </span>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((option) => (
            <Button
              key={option.key}
              size="sm"
              variant={sort === option.key ? "secondary" : "ghost"}
              onClick={() => setSort(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-6 border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load projects. {error instanceof Error ? error.message : "Please try again."}
        </div>
      ) : isLoading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading projects">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-72 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 border border-border bg-card p-6 text-sm text-muted-foreground">
          {rows.length === 0
            ? "No projects yet. Add the first one to start tracking it."
            : "No projects match the current search and filters."}
        </div>
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
                className="block w-full cursor-pointer text-left"
              >
                <div className="aspect-[1.91/1] w-full overflow-hidden bg-muted/10">
                  {client.thumbnail_url ? (
                    <img
                      src={client.thumbnail_url}
                      alt={`${client.name} website`}
                      loading="lazy"
                      className={`h-full w-full ${
                        client.thumbnail_source === "screenshot"
                          ? "object-cover object-top"
                          : "object-contain"
                      }`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-muted-foreground/50">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                      {client.favicon_url ? (
                        <img
                          src={client.favicon_url}
                          alt=""
                          className="h-4 w-4 shrink-0 rounded-sm"
                          loading="lazy"
                        />
                      ) : null}
                      <span className="truncate">{client.name}</span>
                    </h2>
                    <Badge className={`capitalize ${STATUS_TONE[client.status] ?? ""}`} variant="secondary">
                      {client.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[client.country, client.sector].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {money(client.monthly_fee, client.monthly_fee_currency)
                      ? `${money(client.monthly_fee, client.monthly_fee_currency)} / ${client.billing_cycle ?? "monthly"}`
                      : "No maintenance fee set"}
                    {client.onboarding_fee != null
                      ? ` · setup ${money(client.onboarding_fee, client.onboarding_fee_currency)}`
                      : ""}
                  </p>
                  <SetupProgress client={client} />
                  {(() => {
                    const payment = paymentLabel(client.next_payment_on);
                    if (!payment) return null;
                    return (
                      <p
                        className={`text-xs ${payment.overdue ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        Next payment {client.next_payment_on} · {payment.text}
                      </p>
                    );
                  })()}
                </div>
              </button>
              <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
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
                {canManage ? (
                  <Button size="sm" variant="outline" onClick={() => setPayFor(client)}>
                    <Wallet className="h-3.5 w-3.5" /> Add payment
                  </Button>
                ) : null}
                {canManage && client.next_payment_on ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={markPaid.isPending}
                    onClick={() => markPaid.mutate(client.id)}
                  >
                    Mark paid
                  </Button>
                ) : null}
                {client.thumbnail_source ? (
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {SOURCE_LABEL[client.thumbnail_source] ?? client.thumbnail_source}
                    {client.thumbnail_captured_at
                      ? ` · ${client.thumbnail_captured_at.slice(0, 10)}`
                      : ""}
                  </span>
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
              <div className="space-y-2">
                <Label htmlFor="next_payment_on">Next payment</Label>
                <Input
                  id="next_payment_on"
                  type="date"
                  value={form.next_payment_on}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, next_payment_on: event.target.value }))
                  }
                />
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
                        capture.mutate({
                          id: form.id as string,
                          url: form.live_url,
                          mode: "auto",
                        })
                      }
                    >
                      {capture.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ImageDown className="h-3.5 w-3.5" />
                      )}
                      From the site
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!form.live_url || capture.isPending || !canManage}
                      onClick={() =>
                        capture.mutate({
                          id: form.id as string,
                          url: form.live_url,
                          mode: "screenshot",
                        })
                      }
                    >
                      {capture.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5" />
                      )}
                      Take screenshot
                    </Button>
                  </div>
                </div>
                <div className="aspect-[1.91/1] w-full max-w-sm overflow-hidden rounded-md border border-border bg-muted/10">
                  {liveClient?.thumbnail_url ? (
                    <img
                      src={liveClient.thumbnail_url}
                      alt=""
                      className={`h-full w-full ${
                        liveClient.thumbnail_source === "screenshot"
                          ? "object-cover object-top"
                          : "object-contain"
                      }`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image yet
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {imageInfo
                    ? `Optimised: WebP, ${imageInfo.width}×${imageInfo.height}, ${formatBytes(imageInfo.bytes)}`
                    : "Every image is resized, converted to WebP and stripped of camera data."}
                </p>
              </section>

              <ContactsEditor
                clientId={form.id}
                contacts={liveClient?.contacts ?? []}
                canManage={canManage}
                onChanged={refresh}
              />

              {canManage ? (
                <ClientPaymentHistory
                  clientId={form.id}
                  onAddPayment={() => {
                    const row = current;
                    setOpen(false);
                    setPayFor(row);
                  }}
                />
              ) : null}
            </div>
          ) : (
            <p className="border-t border-border pt-4 text-xs text-muted-foreground">
              Save the project first — the thumbnail and contact people can be added right after.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={payFor !== null} onOpenChange={(next) => (next ? null : setPayFor(null))}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{payFor ? `Payment · ${payFor.name}` : "Payment"}</DialogTitle>
          </DialogHeader>
          {payFor ? (
            <PaymentForm
              key={payFor.id}
              payment={null}
              defaultClientId={payFor.id}
              clients={(financeClients.data ?? []) as never}
              contacts={(financeContacts.data ?? []) as never}
              methods={paymentMethods.data ?? []}
              saving={savePayment.isPending}
              onCancel={() => setPayFor(null)}
              onClientCreated={() => void financeClients.refetch()}
              onSubmit={(values) =>
                savePayment.mutate(
                  { values },
                  {
                    onSuccess: () => {
                      toast.success("Payment recorded");
                      setPayFor(null);
                    },
                    onError: (error) => toast.error(error.message),
                  },
                )
              }
            />
          ) : null}
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
        <p className="text-xs text-muted-foreground">Nobody added yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-start gap-3 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-foreground">{contact.name}</span>
                  {contact.is_primary ? (
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      Primary
                    </Badge>
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {[contact.role, contact.email, contact.phone].filter(Boolean).join(" · ") || "—"}
                </p>
                {canManage ? <ContactChannels contactId={contact.id} /> : null}
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

/** Extra email addresses and phone numbers for one person. */
function ContactChannels({ contactId }: { contactId: string }) {
  const emails = useContactEmails();
  const phones = useContactPhones();
  const add = useAddContactChannel();
  const setPrimary = useSetPrimaryChannel();
  const remove = useDeleteContactChannel();

  const [emailDraft, setEmailDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");

  const mine = {
    email: (emails.data ?? []).filter((row) => row.contact_id === contactId),
    phone: (phones.data ?? []).filter((row) => row.contact_id === contactId),
  };

  const rows: { kind: "email" | "phone"; id: string; value: string; isPrimary: boolean }[] = [
    ...mine.email.map((row) => ({
      kind: "email" as const,
      id: row.id,
      value: row.email,
      isPrimary: row.is_primary,
    })),
    ...mine.phone.map((row) => ({
      kind: "phone" as const,
      id: row.id,
      value: row.phone,
      isPrimary: row.is_primary,
    })),
  ];

  const fail = (error: Error) => toast.error(error.message);

  return (
    <div className="mt-2 space-y-2 border-l border-border pl-3">
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No extra emails or numbers.</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-2 text-xs">
              <span className="truncate text-foreground">{row.value}</span>
              {row.isPrimary ? (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  Primary
                </Badge>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground"
                  onClick={() =>
                    setPrimary.mutate(
                      { kind: row.kind, contactId, id: row.id },
                      { onError: fail },
                    )
                  }
                >
                  Make primary
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="ml-auto text-destructive"
                aria-label={`Remove ${row.value}`}
                onClick={() => {
                  if (confirm(`Remove ${row.value}?`)) {
                    remove.mutate({ kind: row.kind, id: row.id }, { onError: fail });
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex gap-2">
          <Input
            className="h-8 text-xs"
            placeholder="Another email"
            value={emailDraft}
            onChange={(event) => setEmailDraft(event.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!emailDraft.trim() || add.isPending}
            onClick={() =>
              add.mutate(
                {
                  kind: "email",
                  contactId,
                  value: emailDraft.trim(),
                  isPrimary: mine.email.length === 0,
                },
                { onSuccess: () => setEmailDraft(""), onError: fail },
              )
            }
          >
            Add
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            className="h-8 text-xs"
            placeholder="Another phone"
            value={phoneDraft}
            onChange={(event) => setPhoneDraft(event.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!phoneDraft.trim() || add.isPending}
            onClick={() =>
              add.mutate(
                {
                  kind: "phone",
                  contactId,
                  value: phoneDraft.trim(),
                  isPrimary: mine.phone.length === 0,
                },
                { onSuccess: () => setPhoneDraft(""), onError: fail },
              )
            }
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Agreed setup sum against what has actually landed, in the currency the deal
 * was made in. Hidden when no setup fee was agreed.
 */
function SetupProgress({
  client,
}: {
  client: { id: string; onboarding_fee: number | null; onboarding_fee_currency: string | null };
}) {
  const payments = usePayments();
  if (client.onboarding_fee == null) return null;

  const received = (payments.data ?? [])
    .filter((row) => row.client_id === client.id && row.kind === "onboarding")
    .reduce((sum, row) => sum + Number(row.gross_amount ?? 0), 0);
  const progress = collected(client.onboarding_fee, received);
  const currency = client.onboarding_fee_currency ?? "EUR";

  return (
    <div className="space-y-1 pt-1">
      <div className="h-1.5 w-full rounded-full bg-muted/20">
        <div
          className="h-1.5 rounded-full bg-foreground"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {money(progress.received, currency)} of {money(progress.agreed, currency)} received
        {progress.left > 0 ? ` · ${money(progress.left, currency)} to go` : " · settled"}
      </p>
    </div>
  );
}

/** What this project has actually paid, newest first. */
function ClientPaymentHistory({
  clientId,
  onAddPayment,
}: {
  clientId: string;
  onAddPayment: () => void;
}) {
  const payments = usePayments();
  const rows = (payments.data ?? []).filter((row) => row.client_id === clientId);
  const total = rows.reduce((sum, row) => sum + Number(row.net_eur ?? 0), 0);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">Payment history</h3>
        <Button size="sm" variant="outline" onClick={onAddPayment}>
          <Wallet className="h-3.5 w-3.5" /> Add payment
        </Button>
      </div>
      {payments.isPending ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing recorded yet — add the first one with the button above.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border rounded-md border border-border">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                <span className="tabular-nums text-muted-foreground">{shortDate(row.paid_on)}</span>
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {(row.services ?? []).join(" / ") || row.description || "Payment"}
                </span>
                <span className="tabular-nums text-foreground">
                  {eurExact(Number(row.net_eur ?? 0))}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            {rows.length} payment{rows.length === 1 ? "" : "s"} · {eurExact(total)} total
          </p>
        </>
      )}
    </section>
  );
}
