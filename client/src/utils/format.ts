const SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function currencySymbol(code?: string): string {
  return (code && SYMBOLS[code]) || "₦";
}

/** Format a number as money with the given currency's symbol. */
export function money(amount: number, code?: string): string {
  return `${currencySymbol(code)}${Math.abs(amount).toLocaleString(undefined, {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })}`;
}
