import { useMemo, useState } from 'react';
import { CalendarRange, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardSummary, EnrichedBatch, Language, ReportsSummary } from '../types';
import { translations } from '../i18n';

interface ReportsViewProps {
  reports: ReportsSummary | null;
  dashboard: DashboardSummary | null;
  batches?: EnrichedBatch[];
  shopName?: string;
  isDemo?: boolean;
  actorName?: string;
  loading: boolean;
  lang: Language;
  onSelectBatch: (batchId: string) => void;
}

interface SixMonthDatum {
  monthKey: string;
  label: string;
  urgentUnits: number;
  laterUnits: number;
  urgentBatches: number;
  laterBatches: number;
  totalUnits: number;
  totalBatches: number;
}

export function ReportsView({
  reports,
  dashboard,
  batches = [],
  shopName = 'Pharmacy Shop',
  isDemo = false,
  actorName = '',
  loading,
  lang,
  onSelectBatch,
}: ReportsViewProps) {
  const t = translations[lang];
  const [exportingPdf, setExportingPdf] = useState(false);
  const [chartMetric, setChartMetric] = useState<'units' | 'batches'>('units');

  const sixMonthData = useMemo<SixMonthDatum[]>(() => {
    const now = new Date();
    const locale = lang === 'te' ? 'te-IN' : 'en-US';
    const fmt = new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' });
    const buckets: SixMonthDatum[] = [];
    const byKey = new Map<string, SixMonthDatum>();

    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const datum: SixMonthDatum = {
        monthKey,
        label: fmt.format(d),
        urgentUnits: 0,
        laterUnits: 0,
        urgentBatches: 0,
        laterBatches: 0,
        totalUnits: 0,
        totalBatches: 0,
      };
      buckets.push(datum);
      byKey.set(monthKey, datum);
    }

    for (const b of batches) {
      if (b.status !== 'ACTIVE' || b.quantity <= 0 || b.daysRemaining < 0) continue;
      const key = b.expiryNormalizedDate.slice(0, 7);
      const target = byKey.get(key);
      if (!target) continue;
      if (b.daysRemaining <= 30) {
        target.urgentUnits += b.quantity;
        target.urgentBatches += 1;
      } else {
        target.laterUnits += b.quantity;
        target.laterBatches += 1;
      }
      target.totalUnits += b.quantity;
      target.totalBatches += 1;
    }

    return buckets;
  }, [batches, lang]);

  const sixMonthTotals = useMemo(
    () =>
      sixMonthData.reduce(
        (acc, row) => ({
          units: acc.units + row.totalUnits,
          batches: acc.batches + row.totalBatches,
        }),
        { units: 0, batches: 0 }
      ),
    [sixMonthData]
  );

  if (loading && !reports) {
    return <div className="h-48 liquid-panel rounded-2xl animate-pulse" />;
  }

  const data = reports ?? {
    upcoming7: [],
    upcoming15: [],
    upcoming30: [],
    expiredBatches: [],
    actionTotals: {
      soldUnits: 0,
      damagedUnits: 0,
      removedUnits: 0,
      checkedCount: 0,
      stillAvailableCount: 0,
    },
    recentAdjustments: [],
  };

  const allUpcoming: EnrichedBatch[] = [
    ...data.upcoming7,
    ...data.upcoming15,
    ...data.upcoming30,
  ].sort((a, b) => a.daysRemaining - b.daysRemaining);

  function downloadCsv() {
    const headers = [
      'Category',
      'Medicine',
      'BatchNumber',
      'PrintedExpiry',
      'CutoffDate',
      'DaysRemaining',
      'Quantity',
    ];
    const rows: string[][] = [];
    for (const b of data.expiredBatches) {
      rows.push([
        'EXPIRED',
        b.medicineName,
        b.batchNumber,
        b.expiryRaw,
        b.expiryNormalizedDate,
        String(b.daysRemaining),
        String(b.quantity),
      ]);
    }
    for (const b of allUpcoming) {
      rows.push([
        b.expiryStatus,
        b.medicineName,
        b.batchNumber,
        b.expiryRaw,
        b.expiryNormalizedDate,
        String(b.daysRemaining),
        String(b.quantity),
      ]);
    }
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmashelf-expiry-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdfReport() {
    setExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const dateStr = new Date().toISOString().slice(0, 10);
      const generatedAt = new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      doc.setFillColor(15, 118, 110);
      doc.rect(0, 0, 210, 26, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('PharmaShelf - Inventory & Stock Summary Report', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const subtitle = `${shopName}${actorName ? `  |  Prepared by: ${actorName}` : ''}  |  Generated: ${generatedAt}`;
      doc.text(subtitle, 14, 19);

      let cursorY = 33;

      if (isDemo) {
        doc.setFillColor(254, 243, 199);
        doc.rect(14, cursorY - 4, 182, 8, 'F');
        doc.setTextColor(146, 64, 14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('DEMO DATA: Sample pharmacy records for testing purposes only.', 17, cursorY + 1);
        cursorY += 10;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.text('1. Inventory & Stock Adjustment Summary', 14, cursorY);
      cursorY += 3;

      const summaryRows: Array<[string, string, string, string]> = [
        [
          'Active Batches in Stock',
          String(dashboard?.totalActiveBatches ?? '-'),
          'Total Units Sold',
          String(data.actionTotals.soldUnits),
        ],
        [
          'Total Active Stock Units',
          String(dashboard?.totalActiveUnits ?? '-'),
          'Total Units Damaged',
          String(data.actionTotals.damagedUnits),
        ],
        [
          'Expiring Within 30 Days',
          String(allUpcoming.length),
          'Total Units Removed',
          String(data.actionTotals.removedUnits),
        ],
        [
          'Expired Batches (Units)',
          `${data.expiredBatches.length} (${dashboard?.expiredUnitsCount ?? data.expiredBatches.reduce((s, b) => s + b.quantity, 0)} units)`,
          'Shelf Checks / Confirmed Available',
          `${data.actionTotals.checkedCount} / ${data.actionTotals.stillAvailableCount}`,
        ],
      ];

      autoTable(doc, {
        startY: cursorY,
        head: [['Inventory Metric', 'Value', 'Stock Movement Metric', 'Total']],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
        columnStyles: {
          1: { halign: 'right', fontStyle: 'bold' },
          3: { halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });

      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`2. Upcoming Expiry Batches (Next 30 Days) — ${allUpcoming.length} batches`, 14, cursorY);
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [['Medicine', 'Batch No.', 'Printed Exp', 'Cutoff Date', 'Days Left', 'Qty']],
        body:
          allUpcoming.length > 0
            ? allUpcoming.map((b) => [
                b.medicineName,
                b.batchNumber,
                b.expiryRaw,
                b.expiryNormalizedDate,
                String(b.daysRemaining),
                String(b.quantity),
              ])
            : [['No batches expiring within the next 30 days.', '', '', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [180, 83, 9], textColor: 255, fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        columnStyles: {
          4: { halign: 'right' },
          5: { halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });

      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9;

      if (cursorY > 245) {
        doc.addPage();
        cursorY = 18;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(153, 27, 27);
      doc.text(
        `3. Expired Stock Remaining on Record — ${data.expiredBatches.length} batches`,
        14,
        cursorY
      );
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [['Medicine', 'Batch No.', 'Printed Exp', 'Cutoff Date', 'Days Expired', 'Qty']],
        body:
          data.expiredBatches.length > 0
            ? data.expiredBatches.map((b) => [
                b.medicineName,
                b.batchNumber,
                b.expiryRaw,
                b.expiryNormalizedDate,
                String(Math.abs(b.daysRemaining)),
                String(b.quantity),
              ])
            : [['No expired stock remaining on record.', '', '', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [185, 28, 28], textColor: 255, fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        columnStyles: {
          4: { halign: 'right' },
          5: { halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });

      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9;

      if (data.recentAdjustments.length > 0) {
        if (cursorY > 235) {
          doc.addPage();
          cursorY = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(15, 23, 42);
        doc.text('4. Recent Stock Adjustments & Checks', 14, cursorY);
        cursorY += 3;

        autoTable(doc, {
          startY: cursorY,
          head: [['Date', 'Medicine', 'Batch', 'Action', 'Delta', 'New Qty', 'By']],
          body: data.recentAdjustments.slice(0, 20).map((act) => [
            act.createdAt.slice(0, 10),
            act.medicineName,
            act.batchNumber,
            act.actionType,
            act.quantityDelta > 0 ? `+${act.quantityDelta}` : String(act.quantityDelta),
            String(act.newQuantity),
            act.actorName,
          ]),
          theme: 'grid',
          headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8 },
          bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
          columnStyles: {
            4: { halign: 'right' },
            5: { halign: 'right' },
          },
          margin: { left: 14, right: 14 },
        });
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `PharmaShelf External Record  |  MM/YYYY dates normalized to end of printed month  |  Page ${i} of ${pageCount}`,
          14,
          290
        );
      }

      doc.save(`pharmashelf-summary-report-${dateStr}.pdf`);
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.reports.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            disabled={exportingPdf}
            onClick={exportPdfReport}
            className="min-h-[44px] px-4 py-2 rounded-xl liquid-btn-primary disabled:opacity-60 text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>{exportingPdf ? t.reports.exportingPdf : t.reports.exportPdf}</span>
          </button>

          <button
            type="button"
            onClick={downloadCsv}
            className="min-h-[44px] px-4 py-2 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{t.reports.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* Stock Adjustment Totals */}
      <section className="liquid-panel rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          {t.reports.adjustmentsSummaryTitle}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            {
              label: t.reports.soldTotal,
              value: data.actionTotals.soldUnits,
              tone: 'text-teal-700 dark:text-teal-300',
            },
            {
              label: t.reports.damagedTotal,
              value: data.actionTotals.damagedUnits,
              tone: 'text-amber-700 dark:text-amber-300',
            },
            {
              label: t.reports.removedTotal,
              value: data.actionTotals.removedUnits,
              tone: 'text-red-700 dark:text-red-400',
            },
            {
              label: t.reports.checkedTotal,
              value: data.actionTotals.checkedCount,
              tone: 'text-slate-900 dark:text-white',
            },
            {
              label: t.reports.stillAvailableTotal,
              value: data.actionTotals.stillAvailableCount,
              tone: 'text-emerald-700 dark:text-emerald-400',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-t sm:border-t-0 sm:border-l first:border-0 border-slate-200/70 dark:border-white/10 pt-3 sm:pt-0 sm:pl-4 first:pl-0"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
              <div className={`mt-1 text-2xl font-bold font-mono-tabular ${stat.tone}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6-Month Upcoming Expiries Recharts Visualization */}
      <section className="liquid-panel rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CalendarRange className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.reports.sixMonthChartTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {t.reports.sixMonthChartSubtitle}{' '}
                <span className="font-mono-tabular font-semibold text-slate-800 dark:text-slate-100">
                  ({sixMonthTotals.batches} {t.reports.batchesLabel} · {sixMonthTotals.units}{' '}
                  {t.dashboard.units})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 liquid-pill-track rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMetric('units')}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                chartMetric === 'units'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.reports.metricUnits}
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('batches')}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                chartMetric === 'batches'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.reports.metricBatches}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
            <span>{t.reports.urgentTierLabel}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-teal-600 inline-block" />
            <span>{t.reports.laterTierLabel}</span>
          </span>
        </div>

        <div className="w-full h-64 text-slate-500 dark:text-slate-400">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sixMonthData}
              margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              barCategoryGap="24%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.18}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(20, 184, 166, 0.08)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const row = payload[0]?.payload as SixMonthDatum | undefined;
                  if (!row) return null;
                  const urgentVal =
                    chartMetric === 'units' ? row.urgentUnits : row.urgentBatches;
                  const laterVal =
                    chartMetric === 'units' ? row.laterUnits : row.laterBatches;
                  const unitWord =
                    chartMetric === 'units' ? t.dashboard.units : t.reports.batchesLabel;
                  return (
                    <div className="liquid-panel rounded-xl px-3.5 py-2.5 text-xs space-y-1 shadow-lg">
                      <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                      <div className="flex items-center justify-between gap-4 text-amber-700 dark:text-amber-300 font-mono-tabular">
                        <span>{t.reports.urgentTierLabel}</span>
                        <span className="font-bold">
                          {urgentVal} {unitWord}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-teal-700 dark:text-teal-300 font-mono-tabular">
                        <span>{t.reports.laterTierLabel}</span>
                        <span className="font-bold">
                          {laterVal} {unitWord}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey={chartMetric === 'units' ? 'urgentUnits' : 'urgentBatches'}
                stackId="expiry"
                fill="#f59e0b"
                radius={[0, 0, 0, 0]}
                maxBarSize={44}
              />
              <Bar
                dataKey={chartMetric === 'units' ? 'laterUnits' : 'laterBatches'}
                stackId="expiry"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {sixMonthTotals.batches === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {t.reports.noSixMonthExpiries}
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section className="liquid-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.reports.upcomingSummaryTitle}
            </h2>
            <span className="text-xs font-mono-tabular font-semibold text-amber-700 dark:text-amber-300">
              {allUpcoming.length}
            </span>
          </div>
          {allUpcoming.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
              {t.reports.noRows}
            </p>
          ) : (
            <div className="divide-y divide-slate-200/60 dark:divide-white/10">
              {allUpcoming.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBatch(b.id)}
                  className="w-full px-5 py-3 flex items-center justify-between gap-4 text-left hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {b.medicineName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                      {b.batchNumber} · EXP {b.expiryRaw} · {b.daysRemaining}{' '}
                      {t.inventory.daysLeftSuffix}
                    </div>
                  </div>
                  <div className="text-sm font-bold font-mono-tabular text-slate-900 dark:text-white shrink-0">
                    {b.quantity} {t.dashboard.units}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="liquid-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.reports.expiredSummaryTitle}
            </h2>
            <span className="text-xs font-mono-tabular font-semibold text-red-700 dark:text-red-400">
              {data.expiredBatches.length}
            </span>
          </div>
          {data.expiredBatches.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
              {t.reports.noRows}
            </p>
          ) : (
            <div className="divide-y divide-slate-200/60 dark:divide-white/10">
              {data.expiredBatches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBatch(b.id)}
                  className="w-full px-5 py-3 flex items-center justify-between gap-4 text-left hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {b.medicineName}
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-400 font-mono-tabular">
                      {b.batchNumber} · EXP {b.expiryRaw} · {Math.abs(b.daysRemaining)}{' '}
                      {t.inventory.expiredAgoSuffix}
                    </div>
                  </div>
                  <div className="text-sm font-bold font-mono-tabular text-red-700 dark:text-red-400 shrink-0">
                    {b.quantity} {t.dashboard.units}
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
