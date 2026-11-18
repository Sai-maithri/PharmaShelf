import { useEffect, useState, type FormEvent } from 'react';
import {
  BellRing,
  CheckCircle2,
  Globe,
  Info,
  Moon,
  RotateCcw,
  Smartphone,
  Sun,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Language, Shop, ThemeMode, UserPublic } from '../types';
import type { NotificationPermissionState } from '../hooks/useNotifications';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { translations, translateError } from '../i18n';
import { ApiError, api } from '../lib/api';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  user: UserPublic;
  shop: Shop;
  lang: Language;
  theme: ThemeMode;
  notificationPermission: NotificationPermissionState;
  notificationsEnabled: boolean;
  onEnableNotifications: () => Promise<boolean>;
  onDisableNotifications: () => void;
  onSendTestNotification: () => Promise<boolean>;
  onChangeLang: (lang: Language) => void;
  onChangeTheme: (theme: ThemeMode) => void;
  onDataReset: () => void;
}

export function SettingsView({
  user,
  shop,
  lang,
  theme,
  notificationPermission,
  notificationsEnabled,
  onEnableNotifications,
  onDisableNotifications,
  onSendTestNotification,
  onChangeLang,
  onChangeTheme,
  onDataReset,
}: SettingsViewProps) {
  const t = translations[lang];
  const { isInstalled, isInstallable, isIOS } = usePWAInstall();
  const [testSent, setTestSent] = useState(false);
  const [shopkeepers, setShopkeepers] = useState<UserPublic[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [staffFeedback, setStaffFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [resetBusy, setResetBusy] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  async function loadShopkeepers() {
    if (user.role !== 'OWNER') return;
    setLoadingStaff(true);
    try {
      const res = await api.shopkeepers();
      setShopkeepers(res.shopkeepers);
    } catch {
      // handled cleanly
    } finally {
      setLoadingStaff(false);
    }
  }

  useEffect(() => {
    void loadShopkeepers();
  }, [user.role]);

  async function handleAddShopkeeper(e: FormEvent) {
    e.preventDefault();
    setStaffFeedback(null);
    setCreating(true);
    try {
      await api.createShopkeeper({ displayName, username, password });
      setDisplayName('');
      setUsername('');
      setPassword('');
      setStaffFeedback({ type: 'success', text: t.settings.shopkeeperAdded });
      await loadShopkeepers();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setStaffFeedback({ type: 'error', text: translateError(code, lang) });
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleShopkeeper(sk: UserPublic) {
    setStaffFeedback(null);
    try {
      await api.toggleShopkeeper(sk.id, !sk.active);
      await loadShopkeepers();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setStaffFeedback({ type: 'error', text: translateError(code, lang) });
    }
  }

  async function handleResetDemo() {
    setResetBusy(true);
    setResetFeedback(null);
    try {
      await api.resetDemo();
      setResetFeedback(t.settings.demoResetDone);
      onDataReset();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setResetFeedback(translateError(code, lang));
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {t.settings.title}
      </h1>

      {/* Mobile App (PWA) Installation */}
      <section className="liquid-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.pwa.mobileAppSection}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {t.pwa.mobileAppDesc}
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.pwa.alreadyInstalled}</span>
          </div>
        ) : isInstallable || isIOS ? (
          <div className="max-w-xs">
            <PWAInstallButton lang={lang} />
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 liquid-subpanel rounded-xl px-3.5 py-2.5">
            {t.pwa.androidBrowserHint}
          </p>
        )}
      </section>

      {/* Phone & Device Notifications */}
      <section className="liquid-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <BellRing className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.notifications.sectionTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {t.notifications.sectionDesc}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {notificationPermission === 'unsupported' ? (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t.notifications.deviceAlertsUnsupported}
            </span>
          ) : notificationPermission === 'denied' ? (
            <span className="text-sm text-red-700 dark:text-red-400 font-medium">
              {t.notifications.deviceAlertsBlocked}
            </span>
          ) : notificationsEnabled ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t.notifications.deviceAlertsActive}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  void onSendTestNotification().then((ok) => {
                    if (ok) setTestSent(true);
                  });
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                {t.notifications.testNotification}
              </button>
              <button
                type="button"
                onClick={onDisableNotifications}
                className="min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer"
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
              className="min-h-[44px] px-5 py-2.5 rounded-xl liquid-btn-primary text-sm font-semibold cursor-pointer"
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

      {/* Appearance (Light / Dark Mode) */}
      <section className="liquid-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          {theme === 'dark' ? (
            <Moon className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
          ) : (
            <Sun className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.settings.themeSection}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {t.settings.themeDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => onChangeTheme('light')}
            className={`min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'light'
                ? 'liquid-btn-primary'
                : 'liquid-subpanel text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            <Sun className="w-4 h-4 shrink-0" />
            <span>{t.settings.lightMode}</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTheme('dark')}
            className={`min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'dark'
                ? 'liquid-btn-primary'
                : 'liquid-subpanel text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            <Moon className="w-4 h-4 shrink-0" />
            <span>{t.settings.darkMode}</span>
          </button>
        </div>
      </section>

      {/* Language Switcher */}
      <section className="liquid-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.settings.languageSection}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {t.settings.languageDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
              lang === 'en'
                ? 'liquid-btn-primary'
                : 'liquid-subpanel text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            {t.settings.english}
          </button>
          <button
            type="button"
            onClick={() => onChangeLang('te')}
            className={`min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
              lang === 'te'
                ? 'liquid-btn-primary'
                : 'liquid-subpanel text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10'
            }`}
          >
            {t.settings.telugu}
          </button>
        </div>
      </section>

      {/* Shopkeeper Access Management */}
      <section className="liquid-panel rounded-2xl p-5 space-y-5">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.settings.teamSection}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {user.role === 'OWNER' ? t.settings.teamOwnerDesc : t.settings.teamStaffInfo}
            </p>
          </div>
        </div>

        {user.role === 'OWNER' && (
          <>
            {staffFeedback && (
              <div
                className={`rounded-xl px-3.5 py-2.5 text-sm border ${
                  staffFeedback.type === 'success'
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200'
                }`}
              >
                {staffFeedback.text}
              </div>
            )}

            <div className="divide-y divide-slate-200/60 dark:divide-white/10 liquid-subpanel rounded-xl">
              {loadingStaff && shopkeepers.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 dark:text-slate-400">...</div>
              ) : shopkeepers.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
                  {t.settings.noShopkeepers}
                </div>
              ) : (
                shopkeepers.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {sk.displayName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                        @{sk.username} ·{' '}
                        <span
                          className={
                            sk.active
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }
                        >
                          {sk.active ? t.settings.activeLabel : t.settings.disabledLabel}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleShopkeeper(sk)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                        sk.active
                          ? 'border-red-300/80 dark:border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200 hover:bg-red-500/20'
                          : 'border-teal-600/60 bg-teal-500/10 text-teal-800 dark:text-teal-200 hover:bg-teal-500/20'
                      }`}
                    >
                      {sk.active ? t.settings.disableBtn : t.settings.enableBtn}
                    </button>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleAddShopkeeper}
              className="pt-4 border-t border-slate-200/60 dark:border-white/10 space-y-3"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <UserPlus className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                <span>{t.settings.addShopkeeperTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.settings.staffDisplayName}
                  className="min-h-[44px] px-3 py-2 rounded-xl liquid-input text-sm"
                />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.settings.staffUsername}
                  className="min-h-[44px] px-3 py-2 rounded-xl liquid-input text-sm"
                />
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.settings.staffPassword}
                  className="min-h-[44px] px-3 py-2 rounded-xl liquid-input text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="min-h-[44px] px-5 py-2.5 rounded-xl liquid-btn-primary text-sm font-semibold cursor-pointer"
              >
                {t.settings.addShopkeeperBtn}
              </button>
            </form>
          </>
        )}
      </section>

      {/* Expiry Rule Documentation */}
      <section className="liquid-panel rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.settings.expiryRuleSection}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t.alerts.mmYyyyGuideBody}
          </p>
        </div>
      </section>

      {/* Demo Reset Control */}
      {shop.isDemo && user.role === 'OWNER' && (
        <section className="liquid-panel rounded-2xl p-5 space-y-3 border-amber-300/70 dark:border-amber-500/30">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.settings.demoResetSection}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {t.settings.demoResetDesc}
              </p>
            </div>
          </div>
          {resetFeedback && (
            <div className="text-sm font-medium text-teal-800 dark:text-teal-300">
              {resetFeedback}
            </div>
          )}
          <button
            type="button"
            disabled={resetBusy}
            onClick={handleResetDemo}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-amber-400/70 dark:border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-sm font-semibold cursor-pointer"
          >
            {t.settings.demoResetBtn}
          </button>
        </section>
      )}
    </div>
  );
}
