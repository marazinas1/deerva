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
  useAssignProjectAccount,
  useClientAccounts,
  useDeleteClientAccount,
  useDeleteExpense,
  useDeletePayment,
  useDeletePaymentMethod,
  useExpenses,
  useFinanceClients,
  useFinanceContacts,
  usePaymentMethods,
  usePayments,
  useSaveClientAccount,
  useSaveExpense,
  useSavePayment,
  useSavePaymentMethod,
  type ClientAccount,
  type Expense,
  type ExpenseInput,
  type FinanceClient,
  type FinanceContact,
  type FinancePayment,
  type FinancePaymentMethod,
  type PaymentMethodInput,
} from "@/hooks/admin/useFinance";
import {
  clientStatus,
  collected,
  computeNetEur,
  downloadCsv,
  eur,
  eurExact,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABEL,
  FINANCE_CURRENCIES,
  FINANCE_PAYMENT_METHOD_KINDS,
  FINANCE_SERVICES,
  money,
  PAYMENT_KIND_LABEL,
  PAYMENT_METHOD_KIND_LABEL,
  shortDate,
  toNumber,
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

const TAB_CLASS =
  "min-h-9 whitespace-normal px-3 text-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:shadow-none sm:text-sm";

function FinanceWorkspace() {
  const clientsQuery = useFinanceClients();
  const contactsQuery = useFinanceContacts();
  const paymentsQuery = usePayments();
  const methodsQuery = usePaymentMethods();
  const expensesQuery = useExpenses();
  const accountsQuery = useClientAccounts();

  const clients = clientsQuery.data ?? [];
  const contacts = contactsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const methods = methodsQuery.data ?? [];
  const expenses = expensesQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];

  // Totals stay hidden until the whole history is in — a partial number is
  // worse than none.
  const loading = paymentsQuery.isPending || clientsQuery.isPending || expensesQuery.isPending;

  return (
    <div className="w-full space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Finance</h1>
        <p className="mt-1 text-sm text-stone">
          Money in, money out and what is still owed. Internal only.
        </p>
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-sand p-1 text-stone sm:inline-grid sm:w-auto sm:grid-cols-5">
          <TabsTrigger value="overview" className={TAB_CLASS}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="payments" className={TAB_CLASS}>
            Income
          </TabsTrigger>
          <TabsTrigger value="expenses" className={TAB_CLASS}>
            Expenses
          </TabsTrigger>
          <TabsTrigger value="clients" className={TAB_CLASS}>
            Clients
          </TabsTrigger>
          <TabsTrigger value="methods" className={TAB_CLASS}>
            Payment methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-8">
          <Overview
            loading={loading}
            payments={payments}
            expenses={expenses}
            clients={clients}
          />
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

        <TabsContent value="expenses" className="pt-8">
          <ExpensesTab
            loading={expensesQuery.isPending}
            expenses={expenses}
            clients={clients}
          />
        </TabsContent>

        <TabsContent value="clients" className="pt-8">
          <ClientsTab
            loading={accountsQuery.isPending || clientsQuery.isPending}
            accounts={accounts}
            clients={clients}
            contacts={contacts}
            payments={payments}
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
  expenses,
  clients,
}: {
  loading: boolean;
  payments: FinancePayment[];
  expenses: Expense[];
  clients: FinanceClient[];
}) {
  const [yearFilter, setYearFilter] = useState("all");

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const row of payments) set.add(new Date(row.paid_on).getFullYear());
    for (const row of expenses) set.add(new Date(row.spent_on).getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [payments, expenses]);

  const stats = useMemo(() => {
    const inYear = (date: string) =>
      yearFilter === "all" || String(new Date(date).getFullYear()) === yearFilter;

    const paid = payments.filter((row) => inYear(row.paid_on));
    const spent = expenses.filter((row) => inYear(row.spent_on));

    const income = paid.reduce((sum, row) => sum + Number(row.net_eur ?? 0), 0);
    const cost = spent.reduce((sum, row) => sum + Number(row.net_eur ?? 0), 0);

    const byYear = new Map<number, { income: number; cost: number }>();
    const bucket = (year: number) => {
      if (!byYear.has(year)) byYear.set(year, { income: 0, cost: 0 });
      return byYear.get(year)!;
    };
    for (const row of payments) {
      bucket(new Date(row.paid_on).getFullYear()).income += Number(row.net_eur ?? 0);
    }
    for (const row of expenses) {
      bucket(new Date(row.spent_on).getFullYear()).cost += Number(row.net_eur ?? 0);
    }

    // Still owed, in each project's own agreed currency.
    const outstanding: { name: string; left: number; currency: string }[] = [];
    for (const client of clients) {
      const received = payments
        .filter((row) => row.client_id === client.id && row.kind === "onboarding")
        .reduce((sum, row) => sum + Number(row.gross_amount ?? 0), 0);
      const progress = collected(client.onboarding_fee, received);
      if (progress.agreed > 0 && progress.left > 0) {
        outstanding.push({
          name: client.name,
          left: progress.left,
          currency: client.onboarding_fee_currency ?? "EUR",
        });
      }
    }

    const lastPaid = new Map<string, string>();
    for (const row of payments) {
      const current = lastPaid.get(row.client_id);
      if (!current || row.paid_on > current) lastPaid.set(row.client_id, row.paid_on);
    }
    const activeClients = clients.filter(
      (client) => clientStatus(lastPaid.get(client.id) ?? null) === "active",
    ).length;

    const rows = [...byYear.entries()].sort((a, b) => a[0] - b[0]);
    const peak = Math.max(1, ...rows.map(([, value]) => Math.max(value.income, value.cost)));

    return {
      income,
      cost,
      profit: income - cost,
      count: paid.length,
      activeClients,
      rows,
      peak,
      outstanding,
    };
  }, [payments, expenses, clients, yearFilter]);

  if (loading) {
    return <p className="text-sm text-stone">Loading the full history…</p>;
  }

  if (payments.length === 0 && expenses.length === 0) {
    return (
      <p className="text-sm text-stone">
        Nothing recorded yet. Add your first payment in the Income tab, or a cost in Expenses.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      <Select value={yearFilter} onValueChange={setYearFilter}>
        <SelectTrigger className="w-40">
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

      <div>
        <span className="block text-5xl font-light tabular-nums text-ink">
          {eur(stats.profit)}
        </span>
        <span className="mt-1 block text-xs text-stone">
          Profit {yearFilter === "all" ? "so far" : `in ${yearFilter}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
        <Figure label="Income" value={eur(stats.income)} />
        <Figure label="Expenses" value={eur(stats.cost)} />
        <Figure label="Payments" value={String(stats.count)} />
        <Figure label="Active clients" value={String(stats.activeClients)} />
      </div>

      {stats.outstanding.length > 0 ? (
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Still to collect</h2>
          <div className="mt-4 space-y-2">
            {stats.outstanding.map((row) => (
              <p key={row.name} className="text-sm text-ink">
                {row.name} — {money(row.left, row.currency)} outstanding
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">
          By year — income and cost
        </h2>
        <div className="mt-6 space-y-5">
          {stats.rows.map(([year, value]) => (
            <div key={year} className="flex items-center gap-4">
              <span className="w-12 text-sm tabular-nums text-stone">{year}</span>
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-sand">
                  <div
                    className="h-2 bg-ink"
                    style={{ width: `${Math.max(2, (value.income / stats.peak) * 100)}%` }}
                  />
                </div>
                <div className="h-2 bg-sand">
                  <div
                    className="h-2 bg-stone"
                    style={{ width: `${Math.max(1, (value.cost / stats.peak) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="w-40 text-right text-sm tabular-nums text-ink">
                {eur(value.income - value.cost)}
              </span>
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
      [
        "Date",
        "Client",
        "Covers",
        "Services",
        "Type",
        "Invoice",
        "Gross",
        "Currency",
        "Net EUR",
        "Method",
      ],
      rows.map((row) => [
        row.paid_on,
        clientName(row.client_id),
        PAYMENT_KIND_LABEL[row.kind] ?? row.kind,
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
                    <td className="px-4 py-3 text-ink">
                      {clientName(row.client_id)}
                      <span className="ml-2 text-xs text-stone">
                        {PAYMENT_KIND_LABEL[row.kind] ?? row.kind}
                      </span>
                    </td>
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
  currency: "EUR",
  account_holder: null,
  beneficiary_address: null,
  account_number: null,
  iban: null,
  routing_number: null,
  account_type: null,
  bank_name: null,
  bank_address: null,
  swift: null,
  intermediary_bank: null,
  transfer_instructions: null,
  notes: null,
};

/** Invoice-ready bank block, formatted to the usual cross-border wire layout. */
function methodInvoiceBlock(method: FinancePaymentMethod): string {
  const lines: string[] = [];
  const push = (label: string, value: string | null) => {
    if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
  };
  push("Beneficiary", method.account_holder);
  push("Beneficiary address", method.beneficiary_address);
  push("Currency", method.currency);
  push("Account type", method.account_type);
  push("IBAN", method.iban);
  push("Account number", method.account_number);
  push("Routing number (ACH/wire)", method.routing_number);
  push("SWIFT/BIC", method.swift);
  push("Bank", method.bank_name);
  push("Bank address", method.bank_address);
  push("Intermediary bank", method.intermediary_bank);
  push("Reference", method.transfer_instructions);
  return lines.join("\n");
}

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

/* ---------------------------------------------------------------- Expenses */

const emptyExpense = (): ExpenseInput => ({
  client_id: null,
  spent_on: new Date().toISOString().slice(0, 10),
  category: "lovable_credits",
  vendor: null,
  gross_amount: null,
  gross_currency: "EUR",
  fx_rate: null,
  net_eur: 0,
  description: null,
});

function ExpensesTab({
  loading,
  expenses,
  clients,
}: {
  loading: boolean;
  expenses: Expense[];
  clients: FinanceClient[];
}) {
  const save = useSaveExpense();
  const remove = useDeleteExpense();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseInput>(emptyExpense());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const clientName = (id: string | null) =>
    id ? (clients.find((c) => c.id === id)?.name ?? "—") : "General";

  const total = expenses.reduce((sum, row) => sum + Number(row.net_eur ?? 0), 0);

  const startNew = () => {
    setEditing(null);
    setForm(emptyExpense());
    setOpen(true);
  };

  const startEdit = (row: Expense) => {
    setEditing(row);
    setForm({
      client_id: row.client_id,
      spent_on: row.spent_on,
      category: row.category,
      vendor: row.vendor,
      gross_amount: row.gross_amount,
      gross_currency: row.gross_currency,
      fx_rate: row.fx_rate,
      net_eur: row.net_eur,
      description: row.description,
    });
    setOpen(true);
  };

  const net = computeNetEur({
    gross: form.gross_amount,
    currency: form.gross_currency,
    fxRate: form.fx_rate,
  });

  const submit = () => {
    save.mutate(
      { id: editing?.id, values: { ...form, net_eur: net } },
      {
        onSuccess: () => {
          toast.success(editing ? "Expense updated." : "Expense added.");
          setOpen(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Figure label="Total spent" value={eur(total)} />
        <Button onClick={startNew}>
          <Plus className="mr-2 h-4 w-4" /> New expense
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-stone">Loading expenses…</p>
      ) : expenses.length === 0 ? (
        <p className="text-sm text-stone">
          No costs recorded yet. Add what you pay for Lovable credits, hosting or domains.
        </p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {expenses.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center gap-4 py-4">
              <span className="w-24 text-sm tabular-nums text-stone">{shortDate(row.spent_on)}</span>
              <span className="min-w-40 flex-1 text-sm text-ink">
                {EXPENSE_CATEGORY_LABEL[row.category] ?? row.category}
                {row.vendor ? <span className="text-stone"> · {row.vendor}</span> : null}
              </span>
              <span className="text-sm text-stone">{clientName(row.client_id)}</span>
              <span className="w-28 text-right text-sm tabular-nums text-ink">
                {eurExact(Number(row.net_eur ?? 0))}
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setConfirmId(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit expense" : "New expense"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="spent_on">Spent on</Label>
                <Input
                  id="spent_on"
                  type="date"
                  value={form.spent_on}
                  onChange={(event) => setForm({ ...form, spent_on: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {EXPENSE_CATEGORY_LABEL[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor">Paid to</Label>
                <Input
                  id="vendor"
                  value={form.vendor ?? ""}
                  placeholder="Lovable, Cloudflare…"
                  onChange={(event) => setForm({ ...form, vendor: event.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={form.client_id ?? "none"}
                  onValueChange={(value) =>
                    setForm({ ...form, client_id: value === "none" ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General (no project)</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="gross">Amount</Label>
                <Input
                  id="gross"
                  value={form.gross_amount ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, gross_amount: toNumber(event.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={form.gross_currency}
                  onValueChange={(value) => setForm({ ...form, gross_currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINANCE_CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.gross_currency === "USD" ? (
                <div className="space-y-2">
                  <Label htmlFor="fx">USD per EUR</Label>
                  <Input
                    id="fx"
                    value={form.fx_rate ?? ""}
                    onChange={(event) => setForm({ ...form, fx_rate: toNumber(event.target.value) })}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-note">Note</Label>
              <Textarea
                id="expense-note"
                value={form.description ?? ""}
                onChange={(event) => setForm({ ...form, description: event.target.value || null })}
              />
            </div>

            <p className="text-sm text-stone">
              Counts as <span className="text-ink">{eurExact(net)}</span> in the accounts.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={save.isPending}>
                {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmId !== null} onOpenChange={(value) => !value && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              The cost disappears from every total. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) {
                  remove.mutate(confirmId, {
                    onSuccess: () => toast.success("Expense deleted."),
                    onError: (error) => toast.error(error.message),
                  });
                }
                setConfirmId(null);
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

/* ----------------------------------------------------------------- Clients */

function ClientsTab({
  loading,
  accounts,
  clients,
  contacts,
  payments,
}: {
  loading: boolean;
  accounts: ClientAccount[];
  clients: FinanceClient[];
  contacts: FinanceContact[];
  payments: FinancePayment[];
}) {
  const save = useSaveClientAccount();
  const remove = useDeleteClientAccount();
  const assign = useAssignProjectAccount();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientAccount | null>(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const startNew = () => {
    setEditing(null);
    setName("");
    setCountry("");
    setNotes("");
    setOpen(true);
  };

  const startEdit = (account: ClientAccount) => {
    setEditing(account);
    setName(account.name);
    setCountry(account.country ?? "");
    setNotes(account.notes ?? "");
    setOpen(true);
  };

  const submit = () => {
    if (!name.trim()) {
      toast.error("A client needs a name.");
      return;
    }
    save.mutate(
      {
        id: editing?.id,
        values: {
          name: name.trim(),
          country: country.trim() || null,
          status: editing?.status ?? "active",
          notes: notes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(editing ? "Client updated." : "Client added.");
          setOpen(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (loading) return <p className="text-sm text-stone">Loading clients…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-stone">
          A client is the person or company that pays. One client can hold several projects.
        </p>
        <Button onClick={startNew}>
          <Plus className="mr-2 h-4 w-4" /> New client
        </Button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-stone">
          No clients yet. Add one, then attach its projects below.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const ownProjects = clients.filter((client) => client.account_id === account.id);
            const projectIds = new Set(ownProjects.map((client) => client.id));
            const received = payments
              .filter((row) => projectIds.has(row.client_id))
              .reduce((sum, row) => sum + Number(row.net_eur ?? 0), 0);
            const people = contacts.filter(
              (contact) =>
                contact.account_id === account.id || projectIds.has(contact.client_id),
            );

            return (
              <div key={account.id} className="space-y-4 border border-line bg-paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-ink">{account.name}</h3>
                    {account.country ? (
                      <p className="text-xs text-stone">{account.country}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(account)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setConfirmId(account.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm tabular-nums text-ink">{eur(received)} received</p>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-stone">People</p>
                  {people.length === 0 ? (
                    <p className="text-sm text-stone">Nobody added yet.</p>
                  ) : (
                    people.map((person) => (
                      <p key={person.id} className="text-sm text-ink">
                        {person.name}
                        {person.is_primary ? (
                          <Badge variant="secondary" className="ml-2">
                            primary
                          </Badge>
                        ) : null}
                      </p>
                    ))
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-stone">Projects</p>
                  {ownProjects.length === 0 ? (
                    <p className="text-sm text-stone">No project attached.</p>
                  ) : (
                    ownProjects.map((project) => (
                      <p key={project.id} className="text-sm text-ink">
                        {project.name}
                      </p>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Projects by client</h2>
        <div className="divide-y divide-line border-y border-line">
          {clients.map((client) => (
            <div key={client.id} className="flex flex-wrap items-center gap-4 py-3">
              <span className="min-w-40 flex-1 text-sm text-ink">{client.name}</span>
              <Select
                value={client.account_id ?? "none"}
                onValueChange={(value) =>
                  assign.mutate(
                    { clientId: client.id, accountId: value === "none" ? null : value },
                    {
                      onSuccess: () => toast.success("Project moved."),
                      onError: (error) => toast.error(error.message),
                    },
                  )
                }
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit client" : "New client"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-country">Country</Label>
              <Input
                id="account-country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-notes">Notes</Label>
              <Textarea
                id="account-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={save.isPending}>
                {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmId !== null} onOpenChange={(value) => !value && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this client?</AlertDialogTitle>
            <AlertDialogDescription>
              Projects and payments stay; they simply lose their client. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) {
                  remove.mutate(confirmId, {
                    onSuccess: () => toast.success("Client deleted."),
                    onError: (error) => toast.error(error.message),
                  });
                }
                setConfirmId(null);
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
