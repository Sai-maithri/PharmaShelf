import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, PlusCircle, Search, TrendingDown } from 'lucide-react';
import type { EnrichedBatch, Language } from '../types';
import { translations } from '../i18n';
import { StatusIndicator } from './StatusIndicator';

export type InventoryFilter =
  | 'ALL'
  | 'SAFE'
  | '30_DAYS'
  | '15_DAYS'
  | '7_DAYS'
  | 'EXPIRED'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK';

const LOW_STOCK_THRESHOLD_KEY = 'pharmashelf_low_stock_threshold';

function loadInitialThreshold(): number {
  try {
    const raw = localStorage.getItem(LOW_STOCK_THRESHOLD_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 10000) {
      return parsed;
    }
  } catch {
    // ignore storage restrictions
  }
  return 20;
}

interface InventoryViewProps {
  batches: EnrichedBatch[];
  loading: boolean;
  lang: Language;
  initialFilter?: InventoryFilter;
  initialSearch?: string;
  searchSyncKey?: number;
  onSelectBatch: (batchId: string) => void;
  onGoToAdd: () => void;
}

export function InventoryView({
  batches,
  loading,
  lang,
  initialFilter = 'ALL',
  initialSearch = '',
  searchSyncKey = 0,
  onSelectBatch,
  onGoToAdd,
}: InventoryViewProps) {
  const t = translations[lang];
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState<InventoryFilter>(initialFilter);
  const [viewMode, setViewMode] = useState<'batch' | 'medicine'>('batch');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(loadInitialThreshold);

  useEffect(() => {
    if (searchSyncKey > 0) {
      setSearch(initialSearch);
      setFilter(initialFilter);
    }
  }, [searchSyncKey, initialSearch, initialFilter]);

  function handleThresholdChange(rawValue: string) {
    if (rawValue === '') {
      setLowStockThreshold(1);
      return;
    }
    const num = Math.max(1, Math.min(10000, Math.floor(Number(rawValue))));
    if (!Number.isNaN(num)) {
      setLowStockThreshold(num);
      try {
        localStorage.setItem(LOW_STOCK_THRESHOLD_KEY, String(num));
      } catch {
        // ignore storage errors
      }
    }
  }

  const activeBatches = useMemo(
    () => batches.filter((b) => b.status === 'ACTIVE'),
    [batches]
  );

  function isLowStock(batch: EnrichedBatch): boolean {
    return batch.quantity > 0 && batch.quantity < lowStockThreshold;
  }

  const lowStockCount = useMemo(
    () => activeBatches.filter((b) => b.quantity > 0 && b.quantity < lowStockThreshold).length,
    [activeBatches, lowStockThreshold]
  );

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeBatches.filter((b) => {
      if (filter === 'OUT_OF_STOCK') {
        if (b.quantity !== 0) return false;
      } else if (filter === 'LOW_STOCK') {
        if (!(b.quantity > 0 && b.quantity < lowStockThreshold)) return false;
      } else if (filter !== 'ALL') {
        if (b.quantity === 0) return false;
        if (b.expiryStatus !== filter) return false;
      }

      if (!q) return true;
      return (
        b.medicineName.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.manufacturer.toLowerCase().includes(q) ||
        b.batchNumber.toLowerCase().includes(q) ||
        b.barcode.toLowerCase().includes(q)
      );
    });
  }, [activeBatches, filter, lowStockThreshold, search]);

  const groupedByMedicine = useMemo(() => {
    const map = new Map<
      string,
      { medicineId: string; medicineName: string; manufacturer: string; batches: EnrichedBatch[] }
    >();
    for (const b of filteredBatches) {
      let group = map.get(b.medicineId);
      if (!group) {
        group = {
          medicineId: b.medicineId,
          medicineName: b.medicineName,
          manufacturer: b.manufacturer,
          batches: [],
        };
        map.set(b.medicineId, group);
      }
      group.batches.push(b);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.medicineName.localeCompare(b.medicineName)
    );
  }, [filteredBatches]);

  function formatDaysLeft(days: number): string {
    if (days === 0) return t.inventory.expiresToday;
    if (days < 0) return `${Math.abs(days)} ${t.inventory.expiredAgoSuffix}`;
    return `${days} ${t.inventory.daysLeftSuffix}`;
  }

  const filterTabs: Array<{ id: InventoryFilter; label: string }> = [
    { id: 'ALL', label: t.inventory.filterAll },
    {
      id: 'LOW_STOCK',
      label: `${t.inventory.filterLowStock} (${lowStockCount})`,
    },
    { id: '7_DAYS', label: t.inventory.filter7 },
    { id: '15_DAYS', label: t.inventory.filter15 },
    { id: '30_DAYS', label: t.inventory.filter30 },
    { id: 'EXPIRED', label: t.inventory.filterExpired },
    { id: 'SAFE', label: t.inventory.filterSafe },
    { id: 'OUT_OF_STOCK', label: t.inventory.filterOutOfStock },
  ];

  function renderLowStockIndicator() {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 whitespace-nowrap">
        <TrendingDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{t.inventory.lowStockLabel}</span>
      </span>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.inventory.title}
        </h1>

        <div className="inline-flex p-1 liquid-pill-track rounded-xl self-start">
          <button
            type="button"
            onClick={() => setViewMode('batch')}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              viewMode === 'batch'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.inventory.viewByBatch}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('medicine')}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              viewMode === 'medicine'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.inventory.viewByMedicine}
          </button>
        </div>
      </div>

      {/* Search, Threshold & Segmented Filters */}
      <div className="liquid-panel rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.inventory.searchPlaceholder}
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl liquid-input text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <label className="flex items-center justify-between sm:justify-start gap-2.5 px-3 py-1.5 rounded-xl liquid-subpanel min-h-[44px] shrink-0">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {t.inventory.lowStockThresholdLabel}
            </span>
            <input
              type="number"
              min={1}
              max={10000}
              step={1}
              value={lowStockThreshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              aria-label={t.inventory.lowStockThresholdLabel}
              className="w-18 min-h-[34px] px-2 py-1 rounded-lg liquid-input text-right font-mono-tabular text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filterTabs.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'liquid-btn-primary'
                    : 'liquid-subpanel text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && batches.length === 0 ? (
        <div className="liquid-panel rounded-2xl p-8 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-200/50 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="liquid-panel rounded-2xl p-8 text-center space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {t.inventory.emptyTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {t.inventory.emptyBody}
          </p>
          <button
            type="button"
            onClick={onGoToAdd}
            className="mt-2 min-h-[44px] px-5 py-2.5 rounded-xl liquid-btn-primary text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.nav.addMedicine}</span>
          </button>
        </div>
      ) : viewMode === 'batch' ? (
        <>
          {/* Mobile List */}
          <div className="lg:hidden liquid-panel rounded-2xl divide-y divide-slate-200/60 dark:divide-white/10 overflow-hidden">
            {filteredBatches.map((b) => {
              const low = isLowStock(b);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBatch(b.id)}
                  className={`w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer ${
                    low ? 'bg-amber-500/8 dark:bg-amber-400/10' : ''
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {b.medicineName}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular">
                      <span>{b.batchNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>EXP {b.expiryRaw}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDaysLeft(b.daysRemaining)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <StatusIndicator
                        status={b.expiryStatus}
                        quantity={b.quantity}
                        lang={lang}
                      />
                      {low && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                            ·
                          </span>
                          {renderLowStockIndicator()}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-base font-bold font-mono-tabular ${
                          low ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {b.quantity}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.dashboard.units}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop High-Density Frosted Data Table */}
          <div className="hidden lg:block liquid-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-white/10 bg-white/40 dark:bg-white/5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4">{t.inventory.colMedicine}</th>
                  <th className="py-3 px-4">{t.inventory.colBatch}</th>
                  <th className="py-3 px-4">{t.inventory.colPrintedExpiry}</th>
                  <th className="py-3 px-4">{t.inventory.colDaysLeft}</th>
                  <th className="py-3 px-4 text-right">{t.inventory.colQty}</th>
                  <th className="py-3 px-4">{t.inventory.colStatus}</th>
                  <th className="py-3 px-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/10 text-sm">
                {filteredBatches.map((b) => {
                  const low = isLowStock(b);
                  return (
                    <tr
                      key={b.id}
                      onClick={() => onSelectBatch(b.id)}
                      className={`hover:bg-white/60 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        low ? 'bg-amber-500/8 dark:bg-amber-400/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {b.medicineName}
                        </div>
                        {b.manufacturer && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {b.manufacturer}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-slate-800 dark:text-slate-200">
                        {b.batchNumber}
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-slate-800 dark:text-slate-200">
                        {b.expiryRaw}
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-slate-700 dark:text-slate-300">
                        {formatDaysLeft(b.daysRemaining)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono-tabular font-bold ${
                          low ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {b.quantity}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                          <StatusIndicator
                            status={b.expiryStatus}
                            quantity={b.quantity}
                            lang={lang}
                          />
                          {low && (
                            <>
                              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                                ·
                              </span>
                              {renderLowStockIndicator()}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline">
                          {t.inventory.openDetails}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Grouped by Medicine View */
        <div className="space-y-4">
          {groupedByMedicine.map((group) => {
            const hasLowBatch = group.batches.some((b) => isLowStock(b));
            return (
              <section
                key={group.medicineId}
                className="liquid-panel rounded-2xl overflow-hidden"
              >
                <div className="px-4 py-3.5 bg-white/40 dark:bg-white/5 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {group.medicineName}
                    </h2>
                    {group.manufacturer && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {group.manufacturer}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    {hasLowBatch && (
                      <>
                        {renderLowStockIndicator()}
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                          ·
                        </span>
                      </>
                    )}
                    <div className="text-xs font-mono-tabular font-semibold text-slate-700 dark:text-slate-300">
                      {group.batches.length} {t.inventory.batchCountLabel}
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-200/60 dark:divide-white/10">
                  {group.batches.map((b) => {
                    const low = isLowStock(b);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onSelectBatch(b.id)}
                        className={`w-full px-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer ${
                          low ? 'bg-amber-500/8 dark:bg-amber-400/10' : ''
                        }`}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="text-xs sm:text-sm font-mono-tabular text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-x-2">
                            <span className="font-semibold">{b.batchNumber}</span>
                            <span aria-hidden="true">·</span>
                            <span>EXP {b.expiryRaw}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatDaysLeft(b.daysRemaining)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                            <StatusIndicator
                              status={b.expiryStatus}
                              quantity={b.quantity}
                              lang={lang}
                            />
                            {low && (
                              <>
                                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                                  ·
                                </span>
                                {renderLowStockIndicator()}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-sm sm:text-base font-bold font-mono-tabular ${
                              low ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {b.quantity} {t.dashboard.units}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
