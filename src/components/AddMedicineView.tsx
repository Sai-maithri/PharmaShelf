import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Barcode,
  Camera,
  CheckCircle2,
  FileEdit,
  Info,
  Loader2,
  Upload,
} from 'lucide-react';
import type { EnrichedBatch, Language, Medicine, OcrPackResult } from '../types';
import { translations, translateError } from '../i18n';
import { ApiError, api } from '../lib/api';
import { previewExpiryInput } from '../lib/expiryDisplay';

type EntryMode = 'manual' | 'barcode' | 'photo';

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
}

interface AddMedicineViewProps {
  medicines: Medicine[];
  lang: Language;
  onBatchSaved: (batch: EnrichedBatch) => void;
  onGoToInventory: () => void;
}

export function AddMedicineView({
  medicines,
  lang,
  onBatchSaved,
  onGoToInventory,
}: AddMedicineViewProps) {
  const t = translations[lang];
  const [mode, setMode] = useState<EntryMode>('manual');

  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryInput, setExpiryInput] = useState('');
  const [quantity, setQuantity] = useState('');

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraNotice, setCameraNotice] = useState<string | null>(null);
  const [barcodeStatusMsg, setBarcodeStatusMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrPackResult | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [confirmedDetails, setConfirmedDetails] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedBatch, setSavedBatch] = useState<EnrichedBatch | null>(null);

  const expiryPreview = previewExpiryInput(expiryInput);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  function stopCameraStream() {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function handleSelectExistingMedicine(medId: string) {
    setSelectedMedicineId(medId);
    if (!medId) return;
    const med = medicines.find((m) => m.id === medId);
    if (med) {
      setMedicineName(med.name);
      setManufacturer(med.manufacturer);
      setCategory(med.category);
      setBarcode(med.barcode);
    }
  }

  function lookupBarcodeValue(code: string) {
    const clean = code.trim();
    setBarcode(clean);
    if (!clean) return;
    const matched = medicines.find((m) => m.barcode && m.barcode === clean);
    if (matched) {
      setSelectedMedicineId(matched.id);
      setMedicineName(matched.name);
      setManufacturer(matched.manufacturer);
      setCategory(matched.category);
      setBarcodeStatusMsg(t.addMedicine.barcodeMatched);
    } else {
      setSelectedMedicineId('');
      setBarcodeStatusMsg(t.addMedicine.barcodeNotFound);
    }
  }

  async function startBarcodeScanner() {
    setCameraNotice(null);
    setBarcodeStatusMsg(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraNotice(t.addMedicine.cameraUnavailable);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      streamRef.current = stream;
      setCameraActive(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 60);

      const BarcodeDetectorCtor = (
        window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike }
      ).BarcodeDetector;

      if (!BarcodeDetectorCtor) {
        setCameraNotice(t.addMedicine.cameraUnavailable);
        return;
      }

      const detector = new BarcodeDetectorCtor({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'qr_code'],
      });

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0 && codes[0].rawValue) {
            const val = codes[0].rawValue;
            stopCameraStream();
            lookupBarcodeValue(val);
          }
        } catch {
          // ignore transient frame errors
        }
      }, 450);
    } catch {
      setCameraNotice(t.addMedicine.cameraUnavailable);
      stopCameraStream();
    }
  }

  async function handlePhotoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError(null);
    setOcrResult(null);
    setConfirmedDetails(false);
    setOcrLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setPhotoPreviewUrl(dataUrl);
      try {
        const res = await api.extractPackOcr(dataUrl, file.type || 'image/jpeg');
        const ext = res.extracted;
        setOcrResult(ext);
        if (ext.medicineName) setMedicineName(ext.medicineName);
        if (ext.manufacturer) setManufacturer(ext.manufacturer);
        if (ext.batchNumber) setBatchNumber(ext.batchNumber);
        if (ext.expiryRaw) setExpiryInput(ext.expiryRaw);
      } catch (err) {
        const code = err instanceof ApiError ? err.code : 'OCR_FAILED';
        setOcrError(translateError(code, lang));
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function resetFormForAnother() {
    setSelectedMedicineId('');
    setMedicineName('');
    setManufacturer('');
    setCategory('');
    setBarcode('');
    setBatchNumber('');
    setExpiryInput('');
    setQuantity('');
    setOcrResult(null);
    setOcrError(null);
    setPhotoPreviewUrl(null);
    setConfirmedDetails(false);
    setBarcodeStatusMsg(null);
    setErrorMsg(null);
    setSavedBatch(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (ocrResult && !confirmedDetails) {
      setErrorMsg(t.addMedicine.confirmCheckboxLabel);
      return;
    }

    const qtyNum = Number(quantity);
    if (quantity === '' || !Number.isInteger(qtyNum) || qtyNum < 0) {
      setErrorMsg(translateError('INVALID_NEGATIVE_OR_FRACTIONAL_QUANTITY', lang));
      return;
    }

    if (!expiryPreview.valid) {
      setErrorMsg(translateError(expiryPreview.errorCode ?? 'INVALID_EXPIRY_FORMAT', lang));
      return;
    }

    setSaving(true);
    try {
      const res = await api.addBatch({
        medicineId: selectedMedicineId || undefined,
        medicineName,
        manufacturer,
        category,
        barcode,
        batchNumber,
        expiryInput,
        quantity: qtyNum,
      });
      setSavedBatch(res.batch);
      onBatchSaved(res.batch);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setErrorMsg(translateError(code, lang));
    } finally {
      setSaving(false);
    }
  }

  if (savedBatch) {
    return (
      <div className="max-w-2xl mx-auto liquid-panel rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.addMedicine.batchSavedSuccess}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {savedBatch.medicineName} ·{' '}
              <span className="font-mono-tabular font-semibold">{savedBatch.batchNumber}</span> ·{' '}
              <span className="font-mono-tabular">{savedBatch.expiryRaw}</span> ·{' '}
              <span className="font-mono-tabular font-semibold">{savedBatch.quantity}</span>{' '}
              {t.dashboard.units}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={resetFormForAnother}
            className="min-h-[48px] px-5 py-3 rounded-xl liquid-btn-primary font-semibold text-sm cursor-pointer"
          >
            {t.addMedicine.addAnother}
          </button>
          <button
            type="button"
            onClick={onGoToInventory}
            className="min-h-[48px] px-5 py-3 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 font-semibold text-sm cursor-pointer"
          >
            {t.addMedicine.viewInventory}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.addMedicine.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.addMedicine.subtitle}</p>
      </div>

      {/* 3 Entry Mode Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 liquid-pill-track rounded-2xl">
        {[
          { id: 'manual' as EntryMode, label: t.addMedicine.modeManual, icon: FileEdit },
          { id: 'barcode' as EntryMode, label: t.addMedicine.modeBarcode, icon: Barcode },
          { id: 'photo' as EntryMode, label: t.addMedicine.modePhoto, icon: Camera },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id !== 'barcode') stopCameraStream();
                setMode(tab.id);
              }}
              className={`min-h-[48px] px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer ${
                active
                  ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Barcode Mode */}
      {mode === 'barcode' && (
        <section className="liquid-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 liquid-subpanel rounded-xl p-3.5">
            <Info className="w-4.5 h-4.5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {t.addMedicine.barcodeExplainTitle}
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {t.addMedicine.barcodeExplainBody}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {!cameraActive ? (
              <button
                type="button"
                onClick={startBarcodeScanner}
                className="min-h-[44px] px-4 py-2.5 rounded-xl liquid-btn-primary text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t.addMedicine.startCamera}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCameraStream}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-500/40 bg-red-50/90 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-sm font-semibold cursor-pointer"
              >
                {t.addMedicine.stopCamera}
              </button>
            )}
          </div>

          {cameraActive && (
            <div className="rounded-xl overflow-hidden border border-slate-300/60 dark:border-white/15 bg-slate-950 aspect-video max-h-60">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            </div>
          )}

          {cameraNotice && (
            <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-500/30 rounded-xl px-3.5 py-2.5">
              {cameraNotice}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder={t.addMedicine.scanOrEnterBarcode}
              className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input font-mono-tabular text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={() => lookupBarcodeValue(barcode)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-slate-900 dark:text-white text-sm font-semibold whitespace-nowrap cursor-pointer"
            >
              {t.addMedicine.lookupBarcode}
            </button>
          </div>

          {barcodeStatusMsg && (
            <div className="text-xs sm:text-sm text-teal-900 dark:text-teal-200 bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-500/30 rounded-xl px-3.5 py-2.5">
              <div>{barcodeStatusMsg}</div>
              <div className="mt-1 text-xs text-teal-800 dark:text-teal-300 font-medium">
                {t.addMedicine.barcodeNoBatchNote}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Pack Photo OCR Mode */}
      {mode === 'photo' && (
        <section className="liquid-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 liquid-subpanel rounded-xl p-3.5">
            <Info className="w-4.5 h-4.5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {t.addMedicine.photoExplainTitle}
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {t.addMedicine.photoExplainBody}
              </p>
            </div>
          </div>

          <label className="min-h-[52px] px-4 py-3 rounded-xl border border-dashed border-teal-500/70 dark:border-teal-400/50 bg-teal-500/8 hover:bg-teal-500/15 text-teal-800 dark:text-teal-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4.5 h-4.5" />
            <span>{t.addMedicine.uploadOrCapturePhoto}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelected}
              className="hidden"
            />
          </label>

          {photoPreviewUrl && (
            <div className="flex items-center gap-4">
              <img
                src={photoPreviewUrl}
                alt="Medicine pack preview"
                className="w-24 h-24 object-cover rounded-xl border border-slate-200/80 dark:border-white/15 shrink-0"
              />
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {ocrLoading && (
                  <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.addMedicine.extractingText}</span>
                  </div>
                )}
                {ocrResult && !ocrLoading && (
                  <div className="text-emerald-800 dark:text-emerald-300 font-medium">
                    {t.addMedicine.ocrSuccessBanner}
                    {ocrResult.notes && (
                      <div className="mt-1 text-slate-600 dark:text-slate-300 font-normal">
                        {ocrResult.notes}
                      </div>
                    )}
                  </div>
                )}
                {ocrError && !ocrLoading && (
                  <div className="text-amber-800 dark:text-amber-300 font-medium">{ocrError}</div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Batch Details Form */}
      <form onSubmit={handleSubmit} className="liquid-panel rounded-2xl p-5 sm:p-6 space-y-5">
        {ocrResult && (
          <div className="text-sm font-bold text-teal-900 dark:text-teal-200 border-b border-slate-200/70 dark:border-white/10 pb-2">
            {t.addMedicine.confirmDetectedHeading}
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-300/70 dark:border-red-500/30 bg-red-50/90 dark:bg-red-950/50 px-4 py-3 text-sm text-red-800 dark:text-red-200"
          >
            {errorMsg}
          </div>
        )}

        {medicines.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              {t.addMedicine.existingMedicineHint}
            </label>
            <select
              value={selectedMedicineId}
              onChange={(e) => handleSelectExistingMedicine(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">{t.addMedicine.selectExisting}</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.manufacturer ? `(${m.manufacturer})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              {t.addMedicine.medicineName} *
            </label>
            <input
              type="text"
              required
              value={medicineName}
              onChange={(e) => {
                setMedicineName(e.target.value);
                if (selectedMedicineId) setSelectedMedicineId('');
              }}
              placeholder="e.g. Paracetamol 650mg"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              {t.addMedicine.manufacturer}
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              {t.addMedicine.barcodeLabel}
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input font-mono-tabular text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              {t.addMedicine.batchNumber} *
            </label>
            <input
              type="text"
              required
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. B2409A"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input font-mono-tabular text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              {t.addMedicine.quantity} *
            </label>
            <input
              type="number"
              min={0}
              step={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input font-mono-tabular text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              {t.addMedicine.expiryDate} *
            </label>
            <input
              type="text"
              required
              value={expiryInput}
              onChange={(e) => setExpiryInput(e.target.value)}
              placeholder={t.addMedicine.expiryPlaceholder}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input font-mono-tabular text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {t.addMedicine.expiryRuleNote}
            </p>
            {expiryInput.trim() !== '' && (
              <div className="mt-1.5 text-xs font-medium">
                {expiryPreview.valid ? (
                  <span className="text-teal-700 dark:text-teal-300 font-mono-tabular">
                    {t.addMedicine.interpretedCutoff}: {expiryPreview.normalizedDate}
                  </span>
                ) : (
                  <span className="text-red-700 dark:text-red-400">
                    {translateError(expiryPreview.errorCode ?? 'INVALID_EXPIRY_FORMAT', lang)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {ocrResult && (
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/10 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedDetails}
              onChange={(e) => setConfirmedDetails(e.target.checked)}
              className="mt-1 w-4 h-4 accent-teal-600 shrink-0"
            />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.addMedicine.confirmCheckboxLabel}
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-[48px] px-6 py-3 rounded-xl liquid-btn-primary disabled:opacity-60 font-semibold text-base cursor-pointer"
        >
          {saving ? t.addMedicine.saving : t.addMedicine.saveBatch}
        </button>
      </form>
    </div>
  );
}
