export interface ClientExpiryPreview {
  valid: boolean;
  expiryType?: 'MM_YYYY' | 'FULL_DATE';
  expiryRaw?: string;
  normalizedDate?: string;
  errorCode?: string;
}

export function previewExpiryInput(input: string): ClientExpiryPreview {
  const raw = input.trim();
  if (!raw) return { valid: false };

  const mmYyyy = raw.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (mmYyyy) {
    const month = Number(mmYyyy[1]);
    const year = Number(mmYyyy[2]);
    if (month < 1 || month > 12 || year < 2000 || year > 2100) {
      return { valid: false, errorCode: 'INVALID_EXPIRY_DATE' };
    }
    const lastDay = new Date(year, month, 0);
    const normalized = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    return {
      valid: true,
      expiryType: 'MM_YYYY',
      expiryRaw: `${String(month).padStart(2, '0')}/${year}`,
      normalizedDate: normalized,
    };
  }

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    const dt = new Date(y, m - 1, d);
    if (y < 2000 || y > 2100 || dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
      return { valid: false, errorCode: 'INVALID_EXPIRY_DATE' };
    }
    return {
      valid: true,
      expiryType: 'FULL_DATE',
      expiryRaw: raw,
      normalizedDate: raw,
    };
  }

  const dmy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const d = Number(dmy[1]);
    const m = Number(dmy[2]);
    const y = Number(dmy[3]);
    const dt = new Date(y, m - 1, d);
    if (y < 2000 || y > 2100 || dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
      return { valid: false, errorCode: 'INVALID_EXPIRY_DATE' };
    }
    const normalized = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return {
      valid: true,
      expiryType: 'FULL_DATE',
      expiryRaw: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
      normalizedDate: normalized,
    };
  }

  return { valid: false, errorCode: 'INVALID_EXPIRY_FORMAT' };
}

export function formatShortTimestamp(iso: string, lang: 'en' | 'te'): string {
  try {
    const dt = new Date(iso);
    return dt.toLocaleString(lang === 'te' ? 'te-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
