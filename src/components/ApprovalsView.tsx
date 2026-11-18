import { useState } from 'react';
import { Check, Info, X } from 'lucide-react';
import type { ApprovalRequest, Language, UserPublic } from '../types';
import { translations, translateError } from '../i18n';
import { ApiError, api } from '../lib/api';
import { formatShortTimestamp } from '../lib/expiryDisplay';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  user: UserPublic;
  lang: Language;
  onRefresh: () => void;
  onSelectBatch: (batchId: string) => void;
}

export function ApprovalsView({
  approvals,
  user,
  lang,
  onRefresh,
  onSelectBatch,
}: ApprovalsViewProps) {
  const t = translations[lang];
  const [tab, setTab] = useState<'pending' | 'decided'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pending = approvals.filter((a) => a.status === 'PENDING');
  const decided = approvals.filter((a) => a.status !== 'PENDING');
  const list = tab === 'pending' ? pending : decided;

  async function handleDecide(id: string, decision: 'APPROVED' | 'REJECTED') {
    setErrorMsg(null);
    setBusyId(id);
    try {
      await api.decideApproval(id, decision, notes[id]);
      onRefresh();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setErrorMsg(translateError(code, lang));
    } finally {
      setBusyId(null);
    }
  }

  function describeProposal(ap: ApprovalRequest): string {
    if (ap.requestType === 'QUANTITY_OVERRIDE') {
      return `${t.batchDetail.proposedQty}: ${ap.proposedQuantity ?? 0}`;
    }
    if (ap.requestType === 'ARCHIVE_BATCH') {
      return t.batchDetail.requestTypeArchive;
    }
    const parts: string[] = [];
    if (ap.proposedBatchNumber) parts.push(`${t.addMedicine.batchNumber}: ${ap.proposedBatchNumber}`);
    if (ap.proposedExpiryRaw) parts.push(`${t.addMedicine.expiryDate}: ${ap.proposedExpiryRaw}`);
    return parts.join(' · ') || t.batchDetail.requestTypeEditBatch;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.approvals.title}
        </h1>

        <div className="inline-flex p-1 liquid-pill-track rounded-xl self-start">
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === 'pending'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.approvals.pendingTab} ({pending.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('decided')}
            className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === 'decided'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.approvals.decidedTab} ({decided.length})
          </button>
        </div>
      </div>

      {user.role !== 'OWNER' && (
        <div className="liquid-panel rounded-2xl p-4 flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
          <Info className="w-4.5 h-4.5 text-teal-700 dark:text-teal-300 shrink-0" />
          <span>{t.approvals.ownerOnlyDecideHint}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50/90 dark:bg-red-950/50 border border-red-200/80 dark:border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-800 dark:text-red-200">
          {errorMsg}
        </div>
      )}

      {list.length === 0 ? (
        <div className="liquid-panel rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {tab === 'pending' ? t.approvals.noPending : t.approvals.noDecided}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((ap) => (
            <article key={ap.id} className="liquid-panel rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectBatch(ap.batchId)}
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-300 text-left cursor-pointer"
                  >
                    {ap.medicineName}
                  </button>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular mt-0.5">
                    {ap.batchNumber} · {t.approvals.requestedBy}: {ap.requestedByName} ·{' '}
                    {formatShortTimestamp(ap.requestedAt, lang)}
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold shrink-0 ${
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

              <div className="text-sm text-slate-800 dark:text-slate-100 liquid-subpanel rounded-xl p-3 space-y-1">
                <div>
                  <span className="font-semibold">{t.approvals.proposedChange}: </span>
                  <span className="font-mono-tabular">{describeProposal(ap)}</span>
                </div>
                <div>
                  <span className="font-semibold">{t.approvals.reason}: </span>
                  <span>{ap.reason}</span>
                </div>
              </div>

              {ap.status === 'PENDING' && user.role === 'OWNER' && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    value={notes[ap.id] ?? ''}
                    onChange={(e) => setNotes({ ...notes, [ap.id]: e.target.value })}
                    placeholder={t.approvals.decisionNotePlaceholder}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl liquid-input text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === ap.id}
                      onClick={() => handleDecide(ap.id, 'APPROVED')}
                      className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl liquid-btn-primary text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t.approvals.approveBtn}</span>
                    </button>
                    <button
                      type="button"
                      disabled={busyId === ap.id}
                      onClick={() => handleDecide(ap.id, 'REJECTED')}
                      className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl border border-red-300/80 dark:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-800 dark:text-red-200 text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>{t.approvals.rejectBtn}</span>
                    </button>
                  </div>
                </div>
              )}

              {ap.status !== 'PENDING' && ap.decidedByName && (
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  {t.approvals.decidedBy}: {ap.decidedByName}
                  {ap.decidedAt ? ` · ${formatShortTimestamp(ap.decidedAt, lang)}` : ''}
                  {ap.decisionNote ? ` · "${ap.decisionNote}"` : ''}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
