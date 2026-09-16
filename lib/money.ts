export const SUPPORTED_CURRENCIES = ["USD", "BRL", "EUR", "GBP"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  USD: "en-US",
  BRL: "pt-BR",
  EUR: "de-DE",
  GBP: "en-GB",
};

// All amounts in the backend contract are integer minor units (cents).
export function formatMinorUnits(minorUnits: number, currency: string): string {
  const locale = LOCALE_BY_CURRENCY[currency as CurrencyCode] ?? "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(minorUnits / 100);
}

export function majorToMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
