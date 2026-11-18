import type { ExpiryStage, ExpiryStatus, ExpiryType } from '../src/types.ts';

export interface ParsedExpiry {
  expiryRaw: string;
  expiryType: ExpiryType;
  expiryNormalizedDate: string; // YYYY-MM-DD
}

/**
 * Formats a Date in local calendar YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns today's date string in YYYY-MM-DD (local time)
 */
export function getTodayISO(): string {
  return formatDateISO(new Date());
}

/**
 * Adds N days to today and returns YYYY-MM-DD or MM/YYYY
 */
export function addDaysISO(days: number): string {
  const dt = new Date();
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + days);
  return formatDateISO(dt);
}

/**
 * Validates and parses an expiry date input.
 * Supported formats:
 *  - MM/YYYY or MM-YYYY (e.g. 12/2026 -> normalized to last day of December 2026: 2026-12-31)
 *  - YYYY-MM-DD (ISO full date, e.g. 2026-12-15)
 *  - DD/MM/YYYY or DD-MM-YYYY (e.g. 15/12/2026)
 *
 * Strictly rejects invalid months (>12, <1) and impossible calendar days (e.g. 2026-02-30, 31/04/2026).
 */
export function parseExpiryInput(input: string): ParsedExpiry {
  const raw = input.trim();
  if (!raw) {
    throw new Error('INVALID_EXPIRY_EMPTY');
  }

  // 1. Check MM/YYYY or MM-YYYY
  const mmYyyyMatch = raw.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (mmYyyyMatch) {
    const month = Number(mmYyyyMatch[1]);
    const year = Number(mmYyyyMatch[2]);
    if (month < 1 || month > 12 || year < 2000 || year > 2100) {
      throw new Error('INVALID_EXPIRY_DATE');
    }
    // Day 0 of next month gives the exact last calendar day of `month`
    const lastDayDate = new Date(year, month, 0);
    const normalized = formatDateISO(lastDayDate);
    const canonicalRaw = `${String(month).padStart(2, '0')}/${year}`;
    return {
      expiryRaw: canonicalRaw,
      expiryType: 'MM_YYYY',
      expiryNormalizedDate: normalized,
    };
  }

  // 2. Check YYYY-MM-DD
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!isValidCalendarDate(year, month, day)) {
      throw new Error('INVALID_EXPIRY_DATE');
    }
    return {
      expiryRaw: raw,
      expiryType: 'FULL_DATE',
      expiryNormalizedDate: raw,
    };
  }

  // 3. Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);
    if (!isValidCalendarDate(year, month, day)) {
      throw new Error('INVALID_EXPIRY_DATE');
    }
    const normalized = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const canonicalRaw = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    return {
      expiryRaw: canonicalRaw,
      expiryType: 'FULL_DATE',
      expiryNormalizedDate: normalized,
    };
  }

  throw new Error('INVALID_EXPIRY_FORMAT');
}

export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const dt = new Date(year, month - 1, day);
  return (
    dt.getFullYear() === year &&
    dt.getMonth() === month - 1 &&
    dt.getDate() === day
  );
}

/**
 * Computes whole calendar days remaining from `referenceDateISO` (defaults to today)
 * until `expiryNormalizedDate`. Negative means already expired.
 */
export function computeDaysRemaining(expiryNormalizedDate: string, referenceDateISO?: string): number {
  const refStr = referenceDateISO ?? getTodayISO();
  const [ry, rm, rd] = refStr.split('-').map(Number);
  const [ey, em, ed] = expiryNormalizedDate.split('-').map(Number);
  const refUtc = Date.UTC(ry, rm - 1, rd);
  const expUtc = Date.UTC(ey, em - 1, ed);
  return Math.round((expUtc - refUtc) / 86_400_000);
}

/**
 * Classifies daysRemaining into ExpiryStatus.
 */
export function classifyExpiryStatus(daysRemaining: number): ExpiryStatus {
  if (daysRemaining < 0) return 'EXPIRED';
  if (daysRemaining <= 7) return '7_DAYS';
  if (daysRemaining <= 15) return '15_DAYS';
  if (daysRemaining <= 30) return '30_DAYS';
  return 'SAFE';
}

/**
 * Determines which reminder stage applies for a batch right now (if any).
 * Only batches within <= 30 days or expired trigger a reminder stage.
 */
export function getReminderStageForDays(daysRemaining: number): ExpiryStage | null {
  const status = classifyExpiryStatus(daysRemaining);
  return status === 'SAFE' ? null : status;
}
