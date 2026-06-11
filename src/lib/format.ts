export function dollars(cents: number | bigint): string {
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

export function shortDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
