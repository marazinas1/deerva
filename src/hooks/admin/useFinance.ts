import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/**
 * Finance data hooks. Every read and write goes through the browser client,
 * so the manager-only RLS policies on the finance tables are the real gate —
 * an editor's session simply gets nothing back.
 */

export type FinanceClient = {
  id: string;
  name: string;
  slug: string;
  status: string;
  country: string | null;
};

export type FinanceContact = {
  id: string;
  client_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
};

export type ContactEmail = {
  id: string;
  contact_id: string;
  email: string;
  status: string | null;
  is_primary: boolean;
};

export type ContactPhone = {
  id: string;
  contact_id: string;
  phone: string;
  label: string | null;
  is_primary: boolean;
};

export type FinancePayment = {
  id: string;
  client_id: string;
  contact_id: string | null;
  paid_on: string;
  services: string[] | null;
  payment_type: string | null;
  invoice_no: string | null;
  gross_amount: number | null;
  gross_currency: string;
  fx_rate: number | null;
  net_eur: number;
  payment_method: string | null;
  description: string | null;
};

export type PaymentInput = {
  client_id: string;
  contact_id: string | null;
  paid_on: string;
  services: string[];
  payment_type: string | null;
  invoice_no: string | null;
  gross_amount: number | null;
  gross_currency: string;
  fx_rate: number | null;
  net_eur: number;
  payment_method: string | null;
  description: string | null;
};

export type FinancePaymentMethod = {
  id: string;
  name: string;
  kind: string;
  is_active: boolean;
  account_holder: string | null;
  account_number: string | null;
  bank_name: string | null;
  swift: string | null;
  notes: string | null;
};

export type PaymentMethodInput = Omit<FinancePaymentMethod, "id">;

export const FINANCE_KEYS = {
  all: ["admin", "finance"] as const,
  clients: ["admin", "finance", "clients"] as const,
  contacts: ["admin", "finance", "contacts"] as const,
  contactEmails: ["admin", "finance", "contact-emails"] as const,
  contactPhones: ["admin", "finance", "contact-phones"] as const,
  payments: ["admin", "finance", "payments"] as const,
  paymentMethods: ["admin", "finance", "payment-methods"] as const,
};

/**
 * The Data API caps a single response at 1000 rows, so every full-table list
 * is read in pages until a short page comes back. Half a total is worse than
 * no total.
 */
const PAGE_SIZE = 1000;

async function fetchAllRows<T>(
  page: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) return rows;
  }
}

export function useFinanceClients() {
  return useQuery({
    queryKey: FINANCE_KEYS.clients,
    queryFn: () =>
      fetchAllRows<FinanceClient>((from, to) =>
        supabase
          .from("clients")
          .select("id, name, slug, status, country")
          .order("name")
          .range(from, to),
      ),
  });
}

export function useFinanceContacts() {
  return useQuery({
    queryKey: FINANCE_KEYS.contacts,
    queryFn: () =>
      fetchAllRows<FinanceContact>((from, to) =>
        supabase
          .from("client_contacts")
          .select("id, client_id, name, role, email, phone, is_primary")
          .order("name")
          .range(from, to),
      ),
  });
}

export function useContactEmails() {
  return useQuery({
    queryKey: FINANCE_KEYS.contactEmails,
    queryFn: () =>
      fetchAllRows<ContactEmail>((from, to) =>
        supabase
          .from("contact_emails")
          .select("id, contact_id, email, status, is_primary")
          .order("email")
          .range(from, to),
      ),
  });
}

export function useContactPhones() {
  return useQuery({
    queryKey: FINANCE_KEYS.contactPhones,
    queryFn: () =>
      fetchAllRows<ContactPhone>((from, to) =>
        supabase
          .from("contact_phones")
          .select("id, contact_id, phone, label, is_primary")
          .order("phone")
          .range(from, to),
      ),
  });
}

export function usePayments() {
  return useQuery({
    queryKey: FINANCE_KEYS.payments,
    queryFn: () =>
      fetchAllRows<FinancePayment>((from, to) =>
        supabase
          .from("payments")
          .select(
            "id, client_id, contact_id, paid_on, services, payment_type, invoice_no, gross_amount, gross_currency, fx_rate, net_eur, payment_method, description",
          )
          .order("paid_on", { ascending: false })
          .order("id")
          .range(from, to),
      ),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: FINANCE_KEYS.paymentMethods,
    queryFn: () =>
      fetchAllRows<FinancePaymentMethod>((from, to) =>
        supabase
          .from("payment_methods")
          .select(
            "id, name, kind, is_active, account_holder, account_number, bank_name, swift, notes",
          )
          .order("name")
          .range(from, to),
      ),
  });
}

function useFinanceInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: FINANCE_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
  };
}

export function useSavePayment() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: PaymentInput }) => {
      const { error } = id
        ? await supabase.from("payments").update(values).eq("id", id)
        : await supabase.from("payments").insert(values);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useDeletePayment() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useSavePaymentMethod() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: PaymentMethodInput }) => {
      const { error } = id
        ? await supabase.from("payment_methods").update(values).eq("id", id)
        : await supabase.from("payment_methods").insert(values);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useDeletePaymentMethod() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_methods").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

/** Adds an address or number, optionally taking over the primary flag. */
export function useAddContactChannel() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async (input:
      | { kind: "email"; contactId: string; value: string; isPrimary: boolean }
      | { kind: "phone"; contactId: string; value: string; isPrimary: boolean }) => {
      if (input.isPrimary) await clearPrimary(input.kind, input.contactId);
      const { error } =
        input.kind === "email"
          ? await supabase.from("contact_emails").insert({
              contact_id: input.contactId,
              email: input.value,
              is_primary: input.isPrimary,
            })
          : await supabase.from("contact_phones").insert({
              contact_id: input.contactId,
              phone: input.value,
              is_primary: input.isPrimary,
            });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useSetPrimaryChannel() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async ({
      kind,
      contactId,
      id,
    }: {
      kind: "email" | "phone";
      contactId: string;
      id: string;
    }) => {
      await clearPrimary(kind, contactId);
      const table = kind === "email" ? "contact_emails" : "contact_phones";
      const { error } = await supabase.from(table).update({ is_primary: true }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteContactChannel() {
  const invalidate = useFinanceInvalidate();
  return useMutation({
    mutationFn: async ({ kind, id }: { kind: "email" | "phone"; id: string }) => {
      const table = kind === "email" ? "contact_emails" : "contact_phones";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

/** Only one primary per person is allowed by the database, so clear first. */
async function clearPrimary(kind: "email" | "phone", contactId: string) {
  const table = kind === "email" ? "contact_emails" : "contact_phones";
  const { error } = await supabase
    .from(table)
    .update({ is_primary: false })
    .eq("contact_id", contactId)
    .eq("is_primary", true);
  if (error) throw new Error(error.message);
}
