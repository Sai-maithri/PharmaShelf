import { WifiOff } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../i18n';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  lang: Language;
}

export function OfflineIndicator({ lang }: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();
  const t = translations[lang];

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 lg:bottom-4 left-4 z-50 liquid-panel border-amber-400/60 dark:border-amber-500/40 bg-amber-500/90 dark:bg-amber-900/90 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{t.pwa.offlineBadge}</span>
    </div>
  );
}
