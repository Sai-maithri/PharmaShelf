import { useMemo, useState } from 'react';
import type { Language, StockActionType, StockActivity } from '../types';
import { translations } from '../i18n';
import { formatShortTimestamp } from '../lib/expiryDisplay';

interface ActivityHistoryViewProps {
  activities: StockActivity[];
  loading: boolean;
  lang: Language;
  onSelectBatch: (batchId: string) => void;
}

export function ActivityHistoryView({
  activities,
  loading,
  lang,
  onSelectBatch,
}: ActivityHistoryViewProps) {
  const t = translations[lang];
  const [actionFilter, setActionFilter] = useState<'ALL' | StockActionType>('ALL');

  const filtered = useMemo(() => {
    if (actionFilter === 'ALL') return activities;
    return activities.filter((a) => a.actionType === actionFilter);
  }, [activities, actionFilter]);

  const filterOptions: Array<{ id: 'ALL' | StockActionType; label: string }> = [
    { id: 'ALL', label: t.activity.filterAll },
    { id: 'CREATED', label: t.actionLabels.CREATED },
    { id: 'SOLD', label: t.actionLabels.SOLD },
    { id: 'DAMAGED', label: t.actionLabels.DAMAGED },
    { id: 'REMOVED', label: t.actionLabels.REMOVED },
    { id: 'CHECKED', label: t.actionLabels.CHECKED },
    { id: 'APPROVAL_APPLIED', label: t.actionLabels.APPROVAL_APPLIED },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {t.activity.title}
      </h1>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setActionFilter(opt.id)}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              actionFilter === opt.id
                ? 'liquid-btn-primary'
                : 'liquid-subpanel text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && activities.length === 0 ? (
        <div className="h-40 liquid-panel rounded-2xl animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="liquid-panel rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {t.activity.noRecords}
        </div>
      ) : (
        <div className="liquid-panel rounded-2xl divide-y divide-slate-200/60 dark:divide-white/10 overflow-hidden">
          {filtered.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelectBatch(act.batchId)}
              className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {act.medicineName}{' '}
                  <span className="font-mono-tabular font-medium text-slate-600 dark:text-slate-300">
                    ({act.batchNumber})
                  </span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">{t.actionLabels[act.actionType]}</span>
                  {act.note ? ` · ${act.note}` : ''}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t.activity.actor}: {act.actorName} (
                  {act.actorRole === 'OWNER' ? t.roleOwner : t.roleShopkeeper}) ·{' '}
                  <span className="font-mono-tabular">
                    {formatShortTimestamp(act.createdAt, lang)}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono-tabular">
                <div
                  className={`text-sm font-bold ${
                    act.quantityDelta < 0
                      ? 'text-red-700 dark:text-red-400'
                      : act.quantityDelta > 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {act.quantityDelta > 0 ? `+${act.quantityDelta}` : act.quantityDelta}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {act.previousQuantity} → {act.newQuantity}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
