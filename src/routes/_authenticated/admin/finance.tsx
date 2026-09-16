import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PaymentForm from "@/components/admin/finance/PaymentForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeletePayment,
  useDeletePaymentMethod,
  useFinanceClients,
  useFinanceContacts,
  usePaymentMethods,
  usePayments,
  useSavePayment,
  useSavePaymentMethod,
  type FinancePayment,
  type FinancePaymentMethod,
  type PaymentMethodInput,
} from "@/hooks/admin/useFinance";
import {
  CLIENT_STATUS_LABEL,
  clientStatus,
  downloadCsv,
  eur,
  eurExact,
  FINANCE_PAYMENT_METHOD_KINDS,
  FINANCE_SERVICES,
  PAYMENT_METHOD_KIND_LABEL,
  shortDate,
} from "@/lib/finance";
import { getAdminMe } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/finance")({
  component: FinancePage,
});

function FinancePage() {
  const { data: me, isPending: mePending } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => getAdminMe(),
  });

  if (mePending) {
    return <p className="text-sm text-stone">Loading…</p>;
  }

  // Editors never see finance. The database refuses them too; this is the
  // polite version of the same rule.
  if (!me?.isManager) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Finance</h1>
        <p className="mt-3 text-sm text-stone">
          Only the owner and developer can see payment records.
        </p>
      </div>
    );
  }

  return <FinanceWorkspace />;
}

function FinanceWorkspace() {
  const clientsQuery = useFinanceClients();
  const contactsQuery = useFinanceContacts();
  const paymentsQuery = usePayments();
  const methodsQuery = usePaymentMethods();

  const clients = clientsQuery.data ?? [];
  const contacts = contactsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const methods = methodsQuery.data ?? [];

  // Totals stay hidden until the whole history is in — a partial number is
  // worse than none.
  const loading = paymentsQuery.isPending || clientsQuery.isPending;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Finance</h1>
        <p className="mt-1 text-sm text-stone">Every payment received, by project.</p>
      </header>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="methods">Payment methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-8">
          <Overview loading={loading} payments={payments} clients={clients} />
        </TabsContent>

        <TabsContent value="payments" className="pt-8">
          <PaymentsTab
            loading={loading}
            payments={payments}
            clients={clients}
            contacts={contacts}
            methods={methods}
            refetchClients={() => void clientsQuery.refetch()}
          />
        </TabsContent>

        <TabsContent value="methods" className="pt-8">
          <MethodsTab loading={methodsQuery.isPending} methods={methods} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------------------------------------------------------- Overview */

function Overview({
  loading,
  payments,
  clients,
}: {
  loading: boolean;
  payments: FinancePayment[];
  clients: { id: string; name: string }[];
}) {
  const stats = useMemo(() => {
    const year = new Date().getFullYear();
    const total = payments.reduce((sum, row) => sum + Number(row.net_eur ?? 0), 0);
    const thisYear = payments
      .filter((row) => new Date(row.paid_on).getFullYear() === year)
      .reduce((sum, row) => sum + Number(row.net_eur ?? 0), 0);

    const byYear = new Map<number, number>();
    const lastPaid = new Map<string, string>();
    for (const row of payments) {
      const rowYear = new Date(row.paid_on).getFullYear();
      byYear.set(rowYear, (byYear.get(rowYear) ?? 0) + Number(row.net_eur ?? 0));
      const current = lastPaid.get(row.client_id);
      if (!current || row.paid_on > current) lastPaid.set(row.client_id, row.paid_on);
    }

    const activeClients = clients.filter(
      (client) => clientStatus(lastPaid.get(client.id) ?? null) === "active",
    ).length;

    const years = [...byYear.entries()].sort((a, b) => a[0] - b[0]);
    const peak = Math.max(1, ...years.map(([, value]) => value));

    return { total, thisYear, count: payments.length, activeClients, years, peak };
  }, [payments, clients]);

  if (loading) {
    return <p className="text-sm text-stone">Loading the full payment history…</p>;
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-stone">
        No payments recorded yet. Add the first one in the Payments tab.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
        <Figure label="Total received" value={eur(stats.total)} />
        <Figure label={`${new Date().getFullYear()} so far`} value={eur(stats.thisYear)} />
        <Figure label="Payments" value={String(stats.count)} />
        <Figure label="Active clients" value={String(stats.activeClients)} />
      </div>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">By year</h2>
        <div className="mt-6 space-y-3">
          {stats.years.map(([year, value]) => (
            <div key={year} className="flex items-center gap-4">
              <span className="w-12 text-sm tabular-nums text-stone">{year}</span>
              <div className="h-2 flex-1 bg-sand">
                <div
                  className="h-2 bg-ink"
                  style={{ width: `${Math.max(2, (value / stats.peak) * 100)}%` }}
                />
              </div>
              <span className="w-28 text-right text-sm tabular-nums text-ink">{eur(value)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-3xl font-light tabular-nums text-ink">{value}</span>
      <span className="mt-1 block text-xs text-stone">{label}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- Payments */

function PaymentsTab({
  loading,
  payments,
  clients,
  contacts,
  methods,
  refetchClients,
}: {
  loading: boolean;
  payments: FinancePayment[];
  clients: { id: string; name: string }[];
  contacts: { id: string; client_id: string; name: string }[];
  methods: FinancePaymentMethod[];
  refetchClients: () => void;
}) {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [editing, setEditing] = useState<FinancePayment | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<FinancePayment | null>(null);

  const savePayment = useSavePayment();
  const deletePayment = useDeletePayment();

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "Unknown";

  const years = useMemo(
    () =>
      [...new Set(payments.map((row) => new Date(row.paid_on).getFullYear()))].sort(
        (a, b) => b - a,
      ),
    [payments],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payments.filter((row) => {
      if (clientFilter !== "all" && row.client_id !== clientFilter) return false;
      if (serviceFilter !== "all" && !(row.services ?? []).includes(serviceFilter)) return false;
      if (yearFilter !== "all" && String(new Date(row.paid_on).getFullYear()) !== yearFilter) {
        return false;
      }
      if (!term) return true;
      const haystack = [
        clientName(row.client_id),
        row.invoice_no,
        row.description,
        row.payment_method,
        (row.services ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [payments, search, clientFilter, serviceFilter, yearFilter, clients]);

  const filteredTotal = rows.reduce((sum, row) => sum + Number(row.net_eur ?? 0), 0);

  function exportCsv() {
    downloadCsv(
      `deerva-payments-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Date", "Client", "Services", "Type", "Invoice", "Gross", "Currency", "Net EUR", "Method"],
      rows.map((row) => [
        row.paid_on,
        clientName(row.client_id),
        (row.services ?? []).join(" / "),
        row.payment_type,
        row.invoice_no,
        row.gross_amount,
        row.gross_currency,
        row.net_eur,
        row.payment_method,
      ]),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search payments"
          />
        </div>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {FINANCE_SERVICES.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New payment
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-stone">Loading the full payment history…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-stone">
          {payments.length === 0
            ? "No payments recorded yet."
            : "Nothing matches those filters."}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto border border-line">
            <table className="w-full text-sm">
              <thead className="bg-sand text-left text-xs uppercase tracking-wider text-stone">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Services</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Net EUR</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-stone">
                      {shortDate(row.paid_on)}
                    </td>
                    <td className="px-4 py-3 text-ink">{clientName(row.client_id)}</td>
                    <td className="px-4 py-3 text-stone">
                      {(row.services ?? []).join(" / ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-stone">{row.invoice_no ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-stone">
                      {row.gross_amount == null
                        ? "—"
                        : `${Number(row.gross_amount).toFixed(2)} ${row.gross_currency}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-ink">
                      {eurExact(Number(row.net_eur ?? 0))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setRemoving(row)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-stone">
            {rows.length} payment{rows.length === 1 ? "" : "s"} · {eurExact(filteredTotal)}
          </p>
        </>
      )}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit payment" : "New payment"}</DialogTitle>
          </DialogHeader>
          <PaymentForm
            key={editing?.id ?? "new"}
            payment={editing}
            clients={clients as never}
            contacts={contacts as never}
            methods={methods}
            saving={savePayment.isPending}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
            onClientCreated={refetchClients}
            onSubmit={(values) =>
              savePayment.mutate(
                { id: editing?.id, values },
                {
                  onSuccess: () => {
                    toast.success(editing ? "Payment updated" : "Payment recorded");
                    setCreating(false);
                    setEditing(null);
                  },
                  onError: (error) => toast.error(error.message),
                },
              )
            }
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing
                ? `${eurExact(Number(removing.net_eur ?? 0))} from ${clientName(removing.client_id)} on ${shortDate(removing.paid_on)} will be removed from every total. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!removing) return;
                deletePayment.mutate(removing.id, {
                  onSuccess: () => {
                    toast.success("Payment deleted");
                    setRemoving(null);
                  },
                  onError: (error) => toast.error(error.message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* --------------------------------------------------------- Payment methods */

const emptyMethod: PaymentMethodInput = {
  name: "",
  kind: "bank_transfer",
  is_active: true,
  account_holder: null,
  account_number: null,
  bank_name: null,
  swift: null,
  notes: null,
};

function MethodsTab({
  loading,
  methods,
}: {
  loading: boolean;
  methods: FinancePaymentMethod[];
}) {
  const [editing, setEditing] = useState<FinancePaymentMethod | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<FinancePaymentMethod | null>(null);
  const saveMethod = useSavePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New method
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-stone">Loading…</p>
      ) : methods.length === 0 ? (
        <p className="text-sm text-stone">
          No payment methods yet. Add the bank account or wallet you get paid into.
        </p>
      ) : (
        <div className="divide-y divide-line border border-line">
          {methods.map((method) => (
            <div key={method.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink">{method.name}</span>
                  {!method.is_active ? <Badge variant="secondary">Inactive</Badge> : null}
                </div>
                <p className="truncate text-xs text-stone">
                  {PAYMENT_METHOD_KIND_LABEL[method.kind] ?? method.kind}
                  {method.account_number ? ` · ${method.account_number}` : ""}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditing(method)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setRemoving(method)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit method" : "New payment method"}</DialogTitle>
          </DialogHeader>
          <MethodForm
            key={editing?.id ?? "new"}
            initial={editing ?? emptyMethod}
            saving={saveMethod.isPending}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
            onSubmit={(values) =>
              saveMethod.mutate(
                { id: editing?.id, values },
                {
                  onSuccess: () => {
                    toast.success("Saved");
                    setCreating(false);
                    setEditing(null);
                  },
                  onError: (error) => toast.error(error.message),
                },
              )
            }
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Payments already recorded keep the name as written, but you will no longer be able
              to pick this method for new ones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!removing) return;
                deleteMethod.mutate(removing.id, {
                  onSuccess: () => {
                    toast.success("Deleted");
                    setRemoving(null);
                  },
                  onError: (error) => toast.error(error.message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MethodForm({
  initial,
  saving,
  onCancel,
  onSubmit,
}: {
  initial: PaymentMethodInput;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: PaymentMethodInput) => void;
}) {
  const [values, setValues] = useState<PaymentMethodInput>(initial);
  const set = <K extends keyof PaymentMethodInput>(key: K, value: PaymentMethodInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="method-name">Name</Label>
        <Input
          id="method-name"
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          placeholder="Revolut Business EUR"
        />
      </div>
      <div className="space-y-2">
        <Label>Kind</Label>
        <Select value={values.kind} onValueChange={(value) => set("kind", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FINANCE_PAYMENT_METHOD_KINDS.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {PAYMENT_METHOD_KIND_LABEL[kind]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="holder">Account holder</Label>
          <Input
            id="holder"
            value={values.account_holder ?? ""}
            onChange={(event) => set("account_holder", event.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account">Account number / IBAN</Label>
          <Input
            id="account"
            value={values.account_number ?? ""}
            onChange={(event) => set("account_number", event.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank">Bank</Label>
          <Input
            id="bank"
            value={values.bank_name ?? ""}
            onChange={(event) => set("bank_name", event.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="swift">SWIFT / BIC</Label>
          <Input
            id="swift"
            value={values.swift ?? ""}
            onChange={(event) => set("swift", event.target.value || null)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="method-notes">Notes</Label>
        <Textarea
          id="method-notes"
          rows={3}
          value={values.notes ?? ""}
          onChange={(event) => set("notes", event.target.value || null)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="active"
          checked={values.is_active}
          onCheckedChange={(checked) => set("is_active", checked)}
        />
        <Label htmlFor="active">Available for new payments</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (!values.name.trim()) {
              toast.error("Give the method a name.");
              return;
            }
            onSubmit({ ...values, name: values.name.trim() });
          }}
          disabled={saving}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  );
}

export { CLIENT_STATUS_LABEL };
