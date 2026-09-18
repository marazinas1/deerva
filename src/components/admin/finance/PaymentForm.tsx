import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  computeNetEur,
  eurExact,
  FINANCE_CURRENCIES,
  FINANCE_PAYMENT_TYPES,
  FINANCE_PAYMENT_KINDS,
  FINANCE_SERVICES,
  invoiceNoExample,
  PAYMENT_KIND_LABEL,
  toNumber,
} from "@/lib/finance";
import { saveClient } from "@/lib/admin.functions";
import type {
  FinanceClient,
  FinanceContact,
  FinancePayment,
  FinancePaymentMethod,
  PaymentInput,
} from "@/hooks/admin/useFinance";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const today = () => new Date().toISOString().slice(0, 10);

export type PaymentFormProps = {
  payment: FinancePayment | null;
  clients: FinanceClient[];
  contacts: FinanceContact[];
  methods: FinancePaymentMethod[];
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: PaymentInput) => void;
  onClientCreated: () => void;
};

export default function PaymentForm({
  payment,
  clients,
  contacts,
  methods,
  saving,
  onCancel,
  onSubmit,
  onClientCreated,
}: PaymentFormProps) {
  const [clientId, setClientId] = useState(payment?.client_id ?? "");
  const [contactId, setContactId] = useState(payment?.contact_id ?? "");
  const [paidOn, setPaidOn] = useState(payment?.paid_on ?? today());
  const [kind, setKind] = useState(payment?.kind ?? "other");
  const [services, setServices] = useState<string[]>(payment?.services ?? []);
  const [paymentType, setPaymentType] = useState(payment?.payment_type ?? "Full");
  const [invoiceNo, setInvoiceNo] = useState(payment?.invoice_no ?? "");
  const [gross, setGross] = useState(payment?.gross_amount?.toString() ?? "");
  const [currency, setCurrency] = useState(payment?.gross_currency ?? "EUR");
  const [fxRate, setFxRate] = useState(payment?.fx_rate?.toString() ?? "");
  const [method, setMethod] = useState(payment?.payment_method ?? "");
  const [description, setDescription] = useState(payment?.description ?? "");
  const [netTouched, setNetTouched] = useState(false);
  const [net, setNet] = useState(payment?.net_eur?.toString() ?? "0");

  const [clientQuery, setClientQuery] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  const computed = useMemo(
    () =>
      computeNetEur({
        gross: toNumber(gross),
        currency,
        fxRate: toNumber(fxRate),
      }),
    [gross, currency, fxRate],
  );

  // The live figure keeps updating until the number is overridden by hand.
  useEffect(() => {
    if (!netTouched) setNet(String(computed));
  }, [computed, netTouched]);

  const visibleClients = useMemo(() => {
    const term = clientQuery.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) => client.name.toLowerCase().includes(term));
  }, [clients, clientQuery]);

  const clientContacts = contacts.filter((contact) => contact.client_id === clientId);
  const activeMethods = methods.filter((item) => item.is_active);

  function toggleService(value: string) {
    setServices((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function createClient() {
    const name = newClientName.trim();
    if (!name) return;
    setCreatingClient(true);
    try {
      const created = await saveClient({
        data: { name, slug: slugify(name) || `client-${Date.now()}`, status: "live" },
      });
      setNewClientName("");
      onClientCreated();
      setClientId(created.id);
      toast.success(`${name} added`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setCreatingClient(false);
    }
  }

  function submit() {
    if (!clientId) {
      toast.error("Pick the client this payment belongs to.");
      return;
    }
    onSubmit({
      client_id: clientId,
      contact_id: contactId || null,
      paid_on: paidOn,
      kind,
      services,
      payment_type: paymentType || null,
      invoice_no: invoiceNo.trim() || null,
      gross_amount: toNumber(gross),
      gross_currency: currency,
      fx_rate: currency === "USD" ? toNumber(fxRate) : null,
      net_eur: toNumber(net) ?? 0,
      payment_method: method || null,
      description: description.trim() || null,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Client</Label>
          <Input
            value={clientQuery}
            onChange={(event) => setClientQuery(event.target.value)}
            placeholder="Search projects"
          />
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a client" />
            </SelectTrigger>
            <SelectContent>
              {visibleClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              value={newClientName}
              onChange={(event) => setNewClientName(event.target.value)}
              placeholder="New client name"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void createClient()}
              disabled={creatingClient || !newClientName.trim()}
            >
              {creatingClient ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Contact (optional)</Label>
          <Select value={contactId || "none"} onValueChange={(v) => setContactId(v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="No contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No contact</SelectItem>
              {clientContacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-stone">
            A payment always belongs to the client. The person is only a note.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="paid_on">Paid on</Label>
          <Input
            id="paid_on"
            type="date"
            value={paidOn}
            onChange={(event) => setPaidOn(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Payment type</Label>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FINANCE_PAYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice_no">Invoice number</Label>
          <Input
            id="invoice_no"
            value={invoiceNo}
            onChange={(event) => setInvoiceNo(event.target.value)}
            placeholder={invoiceNoExample(paidOn)}
          />
          <p className="text-xs text-stone">Format: {invoiceNoExample(paidOn)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Services</Label>
        <div className="flex flex-wrap gap-4">
          {FINANCE_SERVICES.map((service) => (
            <label key={service} className="flex items-center gap-2 text-sm text-ink">
              <Checkbox
                checked={services.includes(service)}
                onCheckedChange={() => toggleService(service)}
              />
              {service}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="gross">Gross amount</Label>
          <Input
            id="gross"
            inputMode="decimal"
            value={gross}
            onChange={(event) => setGross(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FINANCE_CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {currency === "USD" ? (
          <div className="space-y-2">
            <Label htmlFor="fx">USD → EUR rate</Label>
            <Input
              id="fx"
              inputMode="decimal"
              value={fxRate}
              onChange={(event) => setFxRate(event.target.value)}
              placeholder="1.08"
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="net">Net EUR</Label>
          <Input
            id="net"
            inputMode="decimal"
            value={net}
            onChange={(event) => {
              setNetTouched(true);
              setNet(event.target.value);
            }}
          />
          <p className="text-xs text-stone">Calculated: {eurExact(computed)}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Payment method</Label>
          <Select value={method || "none"} onValueChange={(v) => setMethod(v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Not recorded" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not recorded</SelectItem>
              {activeMethods.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeMethods.length === 0 ? (
            <p className="text-xs text-stone">
              No payment methods yet — add one in the Payment methods tab.
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={submit} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {payment ? "Save changes" : "Record payment"}
        </Button>
      </div>
    </div>
  );
}
