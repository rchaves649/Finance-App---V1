
/**
 * Rounds a number to exactly 2 decimal places using toFixed(2).
 */
export function roundToTwo(value: number): number {
  return Number(Math.round(value * 100) / 100);
}

/**
 * Formats a number as Brazilian Real (R$).
 * Ensures rounding to 2 decimal places as per business rules.
 */
export function formatCurrency(value: number): string {
  const rounded = roundToTwo(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

/**
 * Parses a string back into a number, handling Brazilian formatting (R$, dots, commas).
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  // Remove currency symbol, spaces and thousands separators (.)
  // Then replace the decimal comma (,) with a dot (.)
  const clean = value
    .replace(/[R$\s.]/g, '')
    .replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : roundToTwo(parsed);
}
