import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Boxes,
  CheckSquare,
  PlusCircle,
  Search,
  XCircle,
} from 'lucide-react';
import type { DashboardSummary, Language } from '../types';
import { translations } from '../i18n';
import { formatShortTimestamp } from '../lib/expiryDisplay';
import type { ScreenId } from './LayoutShell';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  lang: Language;
  onNavigate: (screen: ScreenId, inventoryFilter?: string) => void;
  onSelectBatch: (batchId: string) => void;
}

export function DashboardView({
  summary,
  loading,
  lang,
  onNavigate,
  onSelectBatch,
}: DashboardViewProps) {
  const t = translations[lang];

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-300/50 dark:bg-white/10 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="h-28 liquid-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const data = summary ?? {
    totalActiveBatches: 0,
    totalActiveUnits: 0,
    totalMedicines: 0,
    expiring30Count: 0,
    expiring15Count: 0,
    expiring7Count: 0,
    expiringSoonTotal: 0,
    expiredBatchesCount: 0,
    expiredUnitsCount: 0,
    outOfStockBatchesCount: 0,
    pendingApprovalsCount: 0,
    unacknowledgedRemindersCount: 0,
    recentActivities: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.dashboard.title}
        </h1>
        <button
          type="button"
          onClick={() => onNavigate('add')}
          className="sm:hidden w-full min-h-[48px] px-4 py-3 rounded-2xl liquid-btn-primary font-semibold text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{t.dashboard.addNewBatch}</span>
        </button>
      </div>

      {/* 4-Card Liquid KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => onNavigate('inventory', 'ALL')}
          className="liquid-panel rounded-2xl p-4 sm:p-5 text-left hover:-translate-y-0.5 transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="truncate">{t.dashboard.activeBatches}</span>
            <Boxes className="w-4 h-4 text-teal-700 dark:text-teal-300 shrink-0" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono-tabular">
            {data.totalActiveBatches}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
            {data.totalActiveUnits} {t.dashboard.units} · {data.totalMedicines} {t.dashboard.medicinesTracked}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('alerts')}
          className="liquid-panel rounded-2xl p-4 sm:p-5 text-left hover:-translate-y-0.5 transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="truncate">{t.dashboard.expiringSoon}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-300 font-mono-tabular">
            {data.expiringSoonTotal}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
            7d: {data.expiring7Count} · 15d: {data.expiring15Count} · 30d: {data.expiring30Count}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('inventory', 'EXPIRED')}
          className="liquid-panel rounded-2xl p-4 sm:p-5 text-left hover:-translate-y-0.5 transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="truncate">{t.dashboard.expiredBatches}</span>
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-400 font-mono-tabular">
            {data.expiredBatchesCount}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
            {data.expiredUnitsCount} {t.dashboard.units}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('approvals')}
          className="liquid-panel rounded-2xl p-4 sm:p-5 text-left hover:-translate-y-0.5 transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="truncate">{t.dashboard.pendingApprovals}</span>
            <CheckSquare className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono-tabular">
            {data.pendingApprovalsCount}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t.dashboard.reviewApprovals}
          </div>
        </button>
      </div>

      {/* Main 2-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <section className="liquid-panel rounded-2xl p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {t.dashboard.expiryBreakdown}
            </h2>
            <div className="divide-y divide-slate-200/60 dark:divide-white/10">
              {[
                {
                  label: t.dashboard.alreadyExpired,
                  count: data.expiredBatchesCount,
                  tone: 'text-red-700 dark:text-red-400',
                  filter: 'EXPIRED',
                },
                {
                  label: t.dashboard.within7Days,
                  count: data.expiring7Count,
                  tone: 'text-red-700 dark:text-red-400',
                  filter: '7_DAYS',
                },
                {
                  label: t.dashboard.within15Days,
                  count: data.expiring15Count,
                  tone: 'text-amber-700 dark:text-amber-300',
                  filter: '15_DAYS',
                },
                {
                  label: t.dashboard.within30Days,
                  count: data.expiring30Count,
                  tone: 'text-amber-700 dark:text-amber-300',
                  filter: '30_DAYS',
                },
              ].map((row) => (
                <button
                  key={row.filter}
                  type="button"
                  onClick={() => onNavigate('inventory', row.filter)}
                  className="w-full min-h-[48px] py-3 flex items-center justify-between gap-4 text-left hover:bg-white/50 dark:hover:bg-white/5 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {row.label}
                  </span>
                  <span className={`text-sm font-bold font-mono-tabular ${row.tone}`}>
                    {row.count} {t.dashboard.batches}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="liquid-panel rounded-2xl p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              {t.dashboard.quickActions}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('add')}
                className="min-h-[48px] px-4 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-teal-700 dark:text-teal-300 shrink-0" />
                <span className="truncate">{t.dashboard.addNewBatch}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('alerts')}
                className="min-h-[48px] px-4 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">{t.dashboard.reviewAlerts}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('inventory', 'ALL')}
                className="min-h-[48px] px-4 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <span className="truncate">{t.dashboard.checkInventory}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('approvals')}
                className="min-h-[48px] px-4 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <span className="truncate">{t.dashboard.reviewApprovals}</span>
              </button>
            </div>
          </section>
        </div>

        {/* Recent Activity Feed */}
        <section className="lg:col-span-7 liquid-panel rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.dashboard.recentActivity}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <span>{t.dashboard.viewAllActivity}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.recentActivities.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              {t.dashboard.noActivityYet}
            </p>
          ) : (
            <div className="divide-y divide-slate-200/60 dark:divide-white/10">
              {data.recentActivities.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => onSelectBatch(act.batchId)}
                  className="w-full py-3 flex items-start justify-between gap-4 text-left hover:bg-white/50 dark:hover:bg-white/5 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {act.medicineName}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-mono-tabular">{act.batchNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {t.actionLabels[act.actionType]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{act.actorName}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-mono-tabular font-semibold ${
                        act.quantityDelta < 0
                          ? 'text-red-700 dark:text-red-400'
                          : act.quantityDelta > 0
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {act.quantityDelta > 0 ? `+${act.quantityDelta}` : act.quantityDelta}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-mono-tabular">
                      {formatShortTimestamp(act.createdAt, lang)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
