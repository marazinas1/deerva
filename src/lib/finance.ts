/**
 * Shared vocabulary and helpers for the internal Finance section.
 * Nothing here is used by the public website.
 */

/** What Deerva actually sells. Not the StageHomy visualisation list. */
export const FINANCE_SERVICES = [
  "Platform Build",
  "Maintenance",
  "Feature Addition",
  "Consulting",
] as const;

export const FINANCE_PAYMENT_TYPES = ["Full", "Advance", "Balance", "Partial"] as const;

/** Which part of the agreed deal a payment covers. */
export const FINANCE_PAYMENT_KINDS = ["onboarding", "monthly", "other"] as const;

export const PAYMENT_KIND_LABEL: Record<string, string> = {
  onboarding: "Onboarding",
  monthly: "Monthly fee",
  other: "Other",
};

/** Where the money goes out. Lovable credits are the recurring one. */
export const EXPENSE_CATEGORIES = [
  "lovable_credits",
  "hosting",
  "domains",
  "contractor",
  "tools",
  "other",
] as const;

export const EXPENSE_CATEGORY_LABEL: Record<string, string> = {
  lovable_credits: "Lovable credits",
  hosting: "Hosting",
  domains: "Domains",
  contractor: "Contractor",
  tools: "Tools",
  other: "Other",
};

export const FINANCE_CURRENCIES = ["EUR", "USD"] as const;

/** Kinds of payment method, using the wording banks and invoicing tools use. */
export const FINANCE_PAYMENT_METHOD_KINDS = [
  "bank_transfer",
  "e_money",
  "card",
  "cash",
  "other",
] as const;

export const PAYMENT_METHOD_KIND_LABEL: Record<string, string> = {
  bank_transfer: "Bank transfer",
  e_money: "E-money / wallet",
  card: "Card",
  cash: "Cash",
  other: "Other",
};

/** House invoice format: YYMMDD-N, e.g. 260916-1 for the first of 16 Sep 2026. */
export const INVOICE_NO_PATTERN = /^\d{6}-\d+$/;

export const invoiceNoExample = (paidOn: string) => {
  const date = new Date(paidOn);
  if (Number.isNaN(date.getTime())) return "260916-1";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getFullYear() % 100)}${pad(date.getMonth() + 1)}${pad(date.getDate())}-1`;
};

export type ClientStatus = "active" | "dormant" | "old" | "none";

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active: "Active",
  dormant: "Dormant",
  old: "Old",
  none: "No payments",
};

const DAY = 24 * 60 * 60 * 1000;

/**
 * Active: paid within 12 months. Dormant: within 24. Old: paid, but longer
 * ago than that. None: never paid at all.
 */
export function clientStatus(lastPaidOn: string | null): ClientStatus {
  if (!lastPaidOn) return "none";
  const age = Date.now() - new Date(lastPaidOn).getTime();
  if (age <= 365 * DAY) return "active";
  if (age <= 730 * DAY) return "dormant";
  return "old";
}

export const eur = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const eurExact = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const shortDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

export const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Live net figure in EUR. There are no contractors, so net is simply the
 * gross amount converted at the USD rate when the client pays in dollars.
 */
export function computeNetEur(input: {
  gross: number | null;
  currency: string;
  fxRate: number | null;
}): number {
  const rate = input.fxRate && input.fxRate > 0 ? input.fxRate : 1;
  const gross = input.gross ?? 0;
  return round2(input.currency === "EUR" ? gross : gross / rate);
}

/**
 * How much of an agreed sum has actually landed. Agreed figures are kept in
 * the project's own currency, so received amounts are compared in that same
 * currency using the gross value, not the EUR net.
 */
export function collected(
  agreed: number | null,
  received: number,
): { agreed: number; received: number; left: number; percent: number } {
  const target = agreed ?? 0;
  const left = Math.max(0, round2(target - received));
  const percent = target > 0 ? Math.min(100, Math.round((received / target) * 100)) : 0;
  return { agreed: target, received: round2(received), left, percent };
}

export const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[^0-9.,-]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

/** Builds a CSV file in the browser and triggers a download. No server call. */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null)[][],
) {
  const escape = (cell: string | number | null) => {
    const text = cell === null || cell === undefined ? "" : String(cell);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
