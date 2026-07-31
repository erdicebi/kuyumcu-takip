const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const gramFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export function formatCurrency(value: number | string): string {
  return currencyFormatter.format(Number(value));
}

export function formatGram(value: number | string): string {
  return `${gramFormatter.format(Number(value))} gr`;
}

export function formatInvoiceNumber(value: number | string): string {
  return String(value);
}

export function formatDateTime(value: string): { date: string; time: string } {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Istanbul",
    }).format(date),
    time: new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    }).format(date),
  };
}

export function maskTc(tc: string): string {
  return `${tc.slice(0, 3)}•••••${tc.slice(-3)}`;
}

export function parseTurkishDecimal(value: string): number {
  return Number(value.trim().replace(/\s/g, "").replace(",", "."));
}
