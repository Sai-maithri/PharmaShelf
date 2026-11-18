import { useState } from 'react';
import { AlertTriangle, BellRing, Check, Info, XCircle } from 'lucide-react';
import type { EnrichedBatch, EnrichedReminder, Language, StockActionType } from '../types';
import type { NotificationPermissionState } from '../hooks/useNotifications';
import { translations, translateError } from '../i18n';
import { ApiError, api } from '../lib/api';

type QuickActionKind = Extract<
  StockActionType,
  'CHECKED' | 'STILL_AVAILABLE' | 'SOLD' | 'DAMAGED' | 'REMOVED'
>;

interface ExpiryAlertsViewProps {
  upcomingReminders: EnrichedReminder[];
  expiredBatches: EnrichedBatch[];
  loading: boolean;
  lang: Language;
  notificationPermission: NotificationPermissionState;
  notificationsEnabled: boolean;
  onEnableNotifications: () => Promise<boolean>;
  onDisableNotifications: () => void;
  onSendTestNotification: () => Promise<boolean>;
  onSelectBatch: (batchId: string) => void;
  onRefresh: () => void;
}

export function ExpiryAlertsView({
  upcomingReminders,
  expiredBatches,
  loading,
  lang,
  notificationPermission,
  notificationsEnabled,
  onEnableNotifications,
  onDisableNotifications,
  onSendTestNotification,
  onSelectBatch,
  onRefresh,
}: ExpiryAlertsViewProps) {
  const t = translations[lang];
  const [testSent, setTestSent] = useState(false);
  const [activeActionBatchId, setActiveActionBatchId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<QuickActionKind>('CHECKED');
  const [actionQty, setActionQty] = useState('1');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  async function handleAcknowledge(reminderId: string) {
    setBusyId(reminderId);
    setFeedback(null);
    try {
      await api.acknowledgeAlert(reminderId);
      onRefresh();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setFeedback({ type: 'error', text: translateError(code, lang) });
    } finally {
      setBusyId(null);
    }
  }

  async function submitQuickAction(batchId: string) {
    setFeedback(null);
    const needsQty = actionType === 'SOLD' || actionType === 'DAMAGED' || actionType === 'REMOVED';
    const qtyNum = needsQty ? Number(actionQty) : undefined;
    if (needsQty && (!Number.isInteger(qtyNum) || (qtyNum ?? 0) <= 0)) {
      setFeedback({
        type: 'error',
        text: translateError('ACTION_QUANTITY_MUST_BE_POSITIVE', lang),
      });
      return;
    }

    setBusyId(batchId);
    try {
      await api.stockAction(batchId, {
        actionType,
        quantity: qtyNum,
      });
      setActiveActionBatchId(null);
      setFeedback({ type: 'success', text: t.batchDetail.actionSuccess });
      onRefresh();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setFeedback({ type: 'error', text: translateError(code, lang) });
    } finally {
      setBusyId(null);
    }
  }

  function stageLabel(stage: EnrichedReminder['stage']): string {
    if (stage === '7_DAYS') return t.alerts.stage7;
    if (stage === '15_DAYS') return t.alerts.stage15;
    if (stage === '30_DAYS') return t.alerts.stage30;
    return t.alerts.stageExpired;
  }

  function renderQuickActionBox(batchId: string) {
    if (activeActionBatchId !== batchId) return null;
    const needsQty = actionType === 'SOLD' || actionType === 'DAMAGED' || actionType === 'REMOVED';

    return (
      <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-white/10 space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'CHECKED', label: t.batchDetail.actionChecked },
              { id: 'STILL_AVAILABLE', label: t.batchDetail.actionStillAvailable },
              { id: 'SOLD', label: t.batchDetail.actionSold },
              { id: 'DAMAGED', label: t.batchDetail.actionDamaged },
              { id: 'REMOVED', label: t.batchDetail.actionRemoved },
            ] as Array<{ id: QuickActionKind; label: string }>
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActionType(opt.id)}
              className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                actionType === opt.id
                  ? 'liquid-btn-primary'
                  : 'liquid-subpanel text-slate-700 dark:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {needsQty && (
            <input
              type="number"
              min={1}
              step={1}
              value={actionQty}
              onChange={(e) => setActionQty(e.target.value)}
              className="w-28 min-h-[40px] px-3 py-1.5 rounded-xl liquid-input font-mono-tabular text-sm"
            />
          )}
          <button
            type="button"
            disabled={busyId === batchId}
            onClick={() => submitQuickAction(batchId)}
            className="min-h-[40px] px-4 py-1.5 rounded-xl liquid-btn-primary text-xs font-semibold cursor-pointer"
          >
            {t.batchDetail.submitAction}
          </button>
          <button
            type="button"
            onClick={() => setActiveActionBatchId(null)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl liquid-subpanel text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {t.alerts.title}
      </h1>

      {feedback && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            feedback.type === 'success'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* How In-App & Device Notifications Work */}
      <section className="liquid-panel rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <BellRing className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.notifications.alertsExplainTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t.notifications.alertsExplainBody}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {notificationPermission === 'unsupported' ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.notifications.deviceAlertsUnsupported}
            </span>
          ) : notificationPermission === 'denied' ? (
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">
              {t.notifications.deviceAlertsBlocked}
            </span>
          ) : notificationsEnabled ? (
            <>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {t.notifications.deviceAlertsActive}
              </span>
              <button
                type="button"
                onClick={() => {
                  void onSendTestNotification().then((ok) => {
                    if (ok) setTestSent(true);
                  });
                }}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                {t.notifications.testNotification}
              </button>
              <button
                type="button"
                onClick={onDisableNotifications}
                className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer"
              >
                {t.notifications.disableDeviceAlerts}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                void onEnableNotifications();
              }}
              className="min-h-[40px] px-4 py-2 rounded-xl liquid-btn-primary text-xs font-semibold cursor-pointer"
            >
              {t.notifications.enableDeviceAlerts}
            </button>
          )}
          {testSent && (
            <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
              {t.notifications.testSent}
            </span>
          )}
        </div>
      </section>

      {/* Documented MM/YYYY interpretation rule */}
      <section className="liquid-panel rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.alerts.mmYyyyGuideTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {t.alerts.mmYyyyGuideBody}
          </p>
        </div>
      </section>

      {/* Section 1: Upcoming Reminders */}
      <section className="liquid-panel rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.alerts.upcomingTitle}
            </h2>
          </div>
          <span className="text-xs font-mono-tabular font-semibold text-slate-600 dark:text-slate-300">
            {upcomingReminders.length}
          </span>
        </div>

        {loading && upcomingReminders.length === 0 ? (
          <div className="p-6 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-slate-200/50 dark:bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : upcomingReminders.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            {t.alerts.upcomingEmpty}
          </p>
        ) : (
          <div className="divide-y divide-slate-200/60 dark:divide-white/10">
            {upcomingReminders.map((rem) => (
              <div key={rem.id} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <button
                        type="button"
                        onClick={() => onSelectBatch(rem.batchId)}
                        className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-300 text-left cursor-pointer"
                      >
                        {rem.medicineName}
                      </button>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                        ·
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          rem.stage === '7_DAYS'
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {stageLabel(rem.stage)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-mono-tabular flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <span>{rem.batchNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>EXP {rem.expiryRaw}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {rem.quantity} {t.dashboard.units}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          rem.daysRemaining <= 7
                            ? 'text-red-700 dark:text-red-400 font-semibold'
                            : ''
                        }
                      >
                        {rem.daysRemaining === 0
                          ? t.inventory.expiresToday
                          : `${rem.daysRemaining} ${t.inventory.daysLeftSuffix}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveActionBatchId(
                          activeActionBatchId === rem.batchId ? null : rem.batchId
                        )
                      }
                      className="min-h-[40px] px-3.5 py-2 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      {t.alerts.quickAction}
                    </button>

                    {rem.acknowledgedAt ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 px-2">
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.alerts.acknowledged}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === rem.id}
                        onClick={() => handleAcknowledge(rem.id)}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl liquid-btn-primary text-xs font-semibold cursor-pointer"
                      >
                        {t.alerts.acknowledge}
                      </button>
                    )}
                  </div>
                </div>

                {renderQuickActionBox(rem.batchId)}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Expired Batches */}
      <section className="liquid-panel rounded-2xl overflow-hidden border-red-300/60 dark:border-red-500/30">
        <div className="px-5 py-4 border-b border-red-200/70 dark:border-red-500/20 bg-red-500/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <h2 className="text-base font-bold text-red-900 dark:text-red-200">
              {t.alerts.expiredTitle}
            </h2>
          </div>
          <span className="text-xs font-mono-tabular font-semibold text-red-800 dark:text-red-300">
            {expiredBatches.length}
          </span>
        </div>

        {expiredBatches.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            {t.alerts.expiredEmpty}
          </p>
        ) : (
          <div className="divide-y divide-slate-200/60 dark:divide-white/10">
            {expiredBatches.map((b) => (
              <div key={b.id} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <button
                      type="button"
                      onClick={() => onSelectBatch(b.id)}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-300 text-left cursor-pointer"
                    >
                      {b.medicineName}
                    </button>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-mono-tabular flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <span>{b.batchNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>EXP {b.expiryRaw}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {b.quantity} {t.dashboard.units}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-red-700 dark:text-red-400 font-semibold">
                        {Math.abs(b.daysRemaining)} {t.inventory.expiredAgoSuffix}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActionType('REMOVED');
                      setActionQty(String(b.quantity));
                      setActiveActionBatchId(activeActionBatchId === b.id ? null : b.id);
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-xl border border-red-300/80 dark:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-800 dark:text-red-200 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {t.alerts.quickAction}
                  </button>
                </div>

                {renderQuickActionBox(b.id)}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
