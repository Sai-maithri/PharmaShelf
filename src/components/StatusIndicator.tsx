import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ExpiryStatus, Language } from '../types';
import { translations } from '../i18n';

interface StatusIndicatorProps {
  status: ExpiryStatus;
  quantity?: number;
  lang: Language;
}

export function StatusIndicator({ status, quantity, lang }: StatusIndicatorProps) {
  const t = translations[lang];

  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span>{t.statusLabels.OUT_OF_STOCK}</span>
      </span>
    );
  }

  switch (status) {
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
          <span>{t.statusLabels.EXPIRED}</span>
        </span>
      );
    case '7_DAYS':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
          <span>{t.statusLabels['7_DAYS']}</span>
        </span>
      );
    case '15_DAYS':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{t.statusLabels['15_DAYS']}</span>
        </span>
      );
    case '30_DAYS':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{t.statusLabels['30_DAYS']}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t.statusLabels.SAFE}</span>
        </span>
      );
  }
}
