import { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../i18n';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  lang: Language;
  compact?: boolean;
}

export function PWAInstallButton({ lang, compact = false }: PWAInstallButtonProps) {
  const t = translations[lang];
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => {
          void install();
        }}
        className={`liquid-btn-primary rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
          compact
            ? 'min-h-[38px] lg:min-h-[40px] px-2.5 lg:px-3'
            : 'w-full min-h-[42px] px-3 py-2'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className={compact ? 'hidden sm:inline whitespace-nowrap' : 'truncate'}>
          {t.pwa.installApp}
        </span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 rounded-xl font-semibold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 cursor-pointer ${
            compact
              ? 'min-h-[38px] lg:min-h-[40px] px-2.5 lg:px-3'
              : 'w-full min-h-[42px] px-3 py-2'
          }`}
        >
          <Smartphone className="w-4 h-4 text-teal-600 dark:text-teal-300 shrink-0" />
          <span className={compact ? 'hidden sm:inline whitespace-nowrap' : 'truncate'}>
            {t.pwa.installOnIos}
          </span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm liquid-panel rounded-2xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl liquid-btn-primary flex items-center justify-center shrink-0">
                    <Smartphone className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.pwa.iosTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ol className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="font-mono-tabular font-bold text-teal-700 dark:text-teal-300">
                    1.
                  </span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <Share className="w-4 h-4 text-teal-600 dark:text-teal-300 inline shrink-0" />
                    <span>{t.pwa.iosStep1}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono-tabular font-bold text-teal-700 dark:text-teal-300">
                    2.
                  </span>
                  <span>{t.pwa.iosStep2}</span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-xl liquid-btn-primary text-sm font-semibold cursor-pointer"
              >
                {t.pwa.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
