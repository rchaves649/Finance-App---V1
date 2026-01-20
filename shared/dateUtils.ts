
import { Period } from "../types/finance";

/**
 * Normalizes a date or string to YYYY-MM-DD using local time to avoid timezone shifts.
 */
export function toISODate(input: Date | string): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ensures a date range has the smaller date first.
 */
export function clampRange(startISO: string, endISO: string): { startISO: string; endISO: string } {
  if (startISO > endISO) return { startISO: endISO, endISO: startISO };
  return { startISO, endISO };
}

/**
 * Checks if a specific date string falls within a defined period.
 */
export function inPeriod(dateISO: string, period: Period): boolean {
  if (!dateISO) return false;
  // Use simple prefix matching for month/year for performance, range comparison for custom ranges.
  const cleanDate = dateISO.split('T')[0];
  
  switch (period.kind) {
    case 'month': {
      const prefix = `${period.year}-${period.month.toString().padStart(2, '0')}`;
      return cleanDate.startsWith(prefix);
    }
    case 'year': {
      return cleanDate.startsWith(`${period.year}-`);
    }
    case 'range': {
      const { startISO, endISO } = clampRange(period.startISO, period.endISO);
      return cleanDate >= startISO && cleanDate <= endISO;
    }
    default:
      return false;
  }
}
