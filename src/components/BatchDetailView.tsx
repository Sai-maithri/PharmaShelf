import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, ShieldAlert } from 'lucide-react';
import type {
  ApprovalRequest,
  ApprovalRequestType,
  EnrichedBatch,
  ExpiryReminder,
  Language,
  StockActionType,
  StockActivity,
  UserPublic,
} from '../types';
import { translations, translateError } from '../i18n';
import { ApiError, api } from '../lib/api';
import { formatShortTimestamp } from '../lib/expiryDisplay';
import { StatusIndicator } from './StatusIndicator';

type PermittedAction = Extract<
  StockActionType,
  'CHECKED' | 'STILL_AVAILABLE' | 'SOLD' | 'DAMAGED' | 'REMOVED'
>;

interface BatchDetailViewProps {
  batchId: string;
  user: UserPublic;
  lang: Language;
  onBack: () => void;
  onDataChanged: () => void;
}

export function BatchDetailView({
  batchId,
  user,
  lang,
  onBack,
  onDataChanged,
}: BatchDetailViewProps) {
  const t = translations[lang];
  const [batch, setBatch] = useState<EnrichedBatch | null>(null);
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [reminders, setReminders] = useState<ExpiryReminder[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [actionType, setActionType] = useState<PermittedAction>('SOLD');
  const [actionQty, setActionQty] = useState('1');
  const [actionNote, setActionNote] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [editBatchNo, setEditBatchNo] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [reqType, setReqType] = useState<ApprovalRequestType>('QUANTITY_OVERRIDE');
  const [reqBatchNo, setReqBatchNo] = useState('');
  const [reqExpiry, setReqExpiry] = useState('');
  const [reqQty, setReqQty] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqFeedback, setReqFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function loadDetail() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.batchDetail(batchId);
      setBatch(res.batch);
      setActivities(res.activities);
      setReminders(res.reminders);
      setApprovals(res.approvals);
      setEditBatchNo(res.batch.batchNumber);
      setEditExpiry(res.batch.expiryRaw);
      setEditQty(String(res.batch.quantity));
      setReqBatchNo(res.batch.batchNumber);
      setReqExpiry(res.batch.expiryRaw);
      setReqQty(String(res.batch.quantity));
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setLoadError(translateError(code, lang));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
  }, [batchId]);

  async function handleStockAction(e: FormEvent) {
    e.preventDefault();
    if (!batch) return;
    setActionFeedback(null);

    const needsQty = actionType === 'SOLD' || actionType === 'DAMAGED' || actionType === 'REMOVED';
    const qtyNum = needsQty ? Number(actionQty) : undefined;
    if (needsQty && (actionQty === '' || !Number.isInteger(qtyNum) || (qtyNum ?? 0) <= 0)) {
      setActionFeedback({
        type: 'error',
        text: translateError('ACTION_QUANTITY_MUST_BE_POSITIVE', lang),
      });
      return;
    }

    setActionSubmitting(true);
    try {
      await api.stockAction(batch.id, {
        actionType,
        quantity: qtyNum,
        note: actionNote,
      });
      setActionNote('');
      setActionFeedback({ type: 'success', text: t.batchDetail.actionSuccess });
      await loadDetail();
      onDataChanged();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setActionFeedback({ type: 'error', text: translateError(code, lang) });
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleOwnerEdit(e: FormEvent) {
    e.preventDefault();
    if (!batch) return;
    setEditFeedback(null);
    setEditSubmitting(true);
    try {
      await api.ownerEditBatch(batch.id, {
        batchNumber: editBatchNo,
        expiryInput: editExpiry,
        quantity: Number(editQty),
        note: editNote,
      });
      setEditNote('');
      setEditFeedback({ type: 'success', text: t.batchDetail.ownerEditSaved });
      await loadDetail();
      onDataChanged();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setEditFeedback({ type: 'error', text: translateError(code, lang) });
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleRestrictedRequest(e: FormEvent) {
    e.preventDefault();
    if (!batch) return;
    setReqFeedback(null);
    setReqSubmitting(true);
    try {
      await api.createApproval({
        batchId: batch.id,
        requestType: reqType,
        proposedBatchNumber: reqType === 'EDIT_BATCH' ? reqBatchNo : undefined,
        proposedExpiryInput: reqType === 'EDIT_BATCH' ? reqExpiry : undefined,
        proposedQuantity: reqType === 'QUANTITY_OVERRIDE' ? Number(reqQty) : undefined,
        reason: reqReason,
      });
      setReqReason('');
      setReqFeedback({ type: 'success', text: t.batchDetail.requestSubmitted });
      await loadDetail();
      onDataChanged();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setReqFeedback({ type: 'error', text: translateError(code, lang) });
    } finally {
      setReqSubmitting(false);
    }
  }

  if (loading && !batch) {
    return <div className="h-48 liquid-panel rounded-2xl animate-pulse" />;
  }

  if (loadError || !batch) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.batchDetail.backToInventory}</span>
        </button>
        <div className="bg-red-50/90 dark:bg-red-950/50 border border-red-200/80 dark:border-red-500/30 rounded-2xl p-4 text-sm text-red-800 dark:text-red-200">
          {loadError ?? translateError('BATCH_NOT_FOUND', lang)}
        </div>
      </div>
    );
  }

  const needsQtyInput =
    actionType === 'SOLD' || actionType === 'DAMAGED' || actionType === 'REMOVED';

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.batchDetail.backToInventory}</span>
      </button>

      {/* Batch Summary Header */}
      <section className="liquid-panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {batch.medicineName}
            </h1>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                {batch.batchNumber}
              </span>
              {batch.manufacturer && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{batch.manufacturer}</span>
                </>
              )}
              {batch.barcode && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular text-xs">{batch.barcode}</span>
                </>
              )}
            </div>
          </div>
          <StatusIndicator status={batch.expiryStatus} quantity={batch.quantity} lang={lang} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-200/70 dark:border-white/10">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.batchDetail.remainingQty}
            </div>
            <div className="mt-1 text-xl font-bold font-mono-tabular text-slate-900 dark:text-white">
              {batch.quantity}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {t.dashboard.units}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.batchDetail.printedExpiry}
            </div>
            <div className="mt-1 text-lg font-bold font-mono-tabular text-slate-900 dark:text-white">
              {batch.expiryRaw}
            </div>
            {batch.expiryType === 'MM_YYYY' && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
                {t.batchDetail.cutoffDate}: {batch.expiryNormalizedDate}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.batchDetail.initialQty}
            </div>
            <div className="mt-1 text-lg font-semibold font-mono-tabular text-slate-700 dark:text-slate-200">
              {batch.initialQuantity}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.batchDetail.lastChecked}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              {batch.lastCheckedAt
                ? formatShortTimestamp(batch.lastCheckedAt, lang)
                : t.batchDetail.neverChecked}
            </div>
          </div>
        </div>

        {reminders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-x-3 gap-y-1">
            {reminders.map((r) => (
              <span key={r.id} className="font-mono-tabular">
                {t.statusLabels[r.stage]} ({formatShortTimestamp(r.triggeredAt, lang)})
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleStockAction}
            className="liquid-panel rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-teal-700 dark:text-teal-300" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.batchDetail.stockActionsTitle}
              </h2>
            </div>

            {actionFeedback && (
              <div
                className={`rounded-xl px-3.5 py-2.5 text-sm border ${
                  actionFeedback.type === 'success'
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200'
                }`}
              >
                {actionFeedback.text}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'SOLD', label: t.batchDetail.actionSold },
                  { id: 'DAMAGED', label: t.batchDetail.actionDamaged },
                  { id: 'REMOVED', label: t.batchDetail.actionRemoved },
                  { id: 'CHECKED', label: t.batchDetail.actionChecked },
                  { id: 'STILL_AVAILABLE', label: t.batchDetail.actionStillAvailable },
                ] as Array<{ id: PermittedAction; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActionType(opt.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    actionType === opt.id
                      ? 'liquid-btn-primary'
                      : 'liquid-subpanel text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {needsQtyInput && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                  {t.batchDetail.qtyToDeduct}
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={actionQty}
                  onChange={(e) => setActionQty(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input font-mono-tabular text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                {t.batchDetail.noteOptional}
              </label>
              <input
                type="text"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionSubmitting || batch.status !== 'ACTIVE'}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl liquid-btn-primary disabled:opacity-60 font-semibold text-sm cursor-pointer"
            >
              {t.batchDetail.submitAction}
            </button>
          </form>

          {user.role === 'OWNER' ? (
            <form
              onSubmit={handleOwnerEdit}
              className="liquid-panel rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.batchDetail.ownerDirectEdit}
                </h2>
              </div>

              {editFeedback && (
                <div
                  className={`rounded-xl px-3.5 py-2.5 text-sm border ${
                    editFeedback.type === 'success'
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200'
                  }`}
                >
                  {editFeedback.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    {t.addMedicine.batchNumber}
                  </label>
                  <input
                    type="text"
                    value={editBatchNo}
                    onChange={(e) => setEditBatchNo(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl liquid-input font-mono-tabular text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    {t.addMedicine.expiryDate}
                  </label>
                  <input
                    type="text"
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl liquid-input font-mono-tabular text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    {t.batchDetail.remainingQty}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl liquid-input font-mono-tabular text-sm"
                  />
                </div>
              </div>

              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder={t.batchDetail.noteOptional}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl liquid-input text-sm"
              />

              <button
                type="submit"
                disabled={editSubmitting}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-semibold cursor-pointer"
              >
                {t.batchDetail.saveOwnerEdit}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleRestrictedRequest}
              className="liquid-panel rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.batchDetail.requestRestrictedChange}
                </h2>
              </div>

              {reqFeedback && (
                <div
                  className={`rounded-xl px-3.5 py-2.5 text-sm border ${
                    reqFeedback.type === 'success'
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200'
                  }`}
                >
                  {reqFeedback.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'QUANTITY_OVERRIDE', label: t.batchDetail.requestTypeQtyOverride },
                    { id: 'EDIT_BATCH', label: t.batchDetail.requestTypeEditBatch },
                    { id: 'ARCHIVE_BATCH', label: t.batchDetail.requestTypeArchive },
                  ] as Array<{ id: ApprovalRequestType; label: string }>
                ).map((rt) => (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => setReqType(rt.id)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                      reqType === rt.id
                        ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200'
                        : 'liquid-subpanel text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>

              {reqType === 'QUANTITY_OVERRIDE' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                    {t.batchDetail.proposedQty}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={reqQty}
                    onChange={(e) => setReqQty(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl liquid-input font-mono-tabular text-sm"
                  />
                </div>
              )}

              {reqType === 'EDIT_BATCH' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                      {t.batchDetail.proposedBatchNumber}
                    </label>
                    <input
                      type="text"
                      value={reqBatchNo}
                      onChange={(e) => setReqBatchNo(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl liquid-input font-mono-tabular text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                      {t.batchDetail.proposedExpiry}
                    </label>
                    <input
                      type="text"
                      value={reqExpiry}
                      onChange={(e) => setReqExpiry(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl liquid-input font-mono-tabular text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                  {t.batchDetail.reasonRequired}
                </label>
                <input
                  type="text"
                  required
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl liquid-input text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={reqSubmitting}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-semibold cursor-pointer"
              >
                {t.batchDetail.submitRequest}
              </button>
            </form>
          )}
        </div>

        {/* Movement History */}
        <div className="lg:col-span-6 space-y-6">
          <section className="liquid-panel rounded-2xl p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {t.batchDetail.movementHistory}
            </h2>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
                {t.batchDetail.noMovements}
              </p>
            ) : (
              <div className="divide-y divide-slate-200/60 dark:divide-white/10">
                {activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {t.actionLabels[act.actionType]}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {act.note}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {act.actorName} ({act.actorRole === 'OWNER' ? t.roleOwner : t.roleShopkeeper}) ·{' '}
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
                  </div>
                ))}
              </div>
            )}
          </section>

          {approvals.length > 0 && (
            <section className="liquid-panel rounded-2xl p-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                {t.nav.approvals}
              </h2>
              <div className="divide-y divide-slate-200/60 dark:divide-white/10 text-sm">
                {approvals.map((ap) => (
                  <div key={ap.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {ap.requestType}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          ap.status === 'APPROVED'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : ap.status === 'REJECTED'
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {ap.status === 'APPROVED'
                          ? t.approvals.statusApproved
                          : ap.status === 'REJECTED'
                          ? t.approvals.statusRejected
                          : t.approvals.statusPending}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{ap.reason}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
