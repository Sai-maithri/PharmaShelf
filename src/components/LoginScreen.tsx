import { useState, type FormEvent } from 'react';
import { Building2, Globe, Moon, ShieldCheck, Sun, UserCheck } from 'lucide-react';
import type { Language, Shop, ThemeMode, UserPublic } from '../types';
import { translations, translateError } from '../i18n';
import { ApiError, api, setStoredToken } from '../lib/api';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface LoginScreenProps {
  lang: Language;
  theme: ThemeMode;
  onChangeLang: (lang: Language) => void;
  onToggleTheme: () => void;
  onAuthenticated: (user: UserPublic, shop: Shop) => void;
}

export function LoginScreen({
  lang,
  theme,
  onChangeLang,
  onToggleTheme,
  onAuthenticated,
}: LoginScreenProps) {
  const t = translations[lang];
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.login(username, password);
      setStoredToken(res.token);
      onAuthenticated(res.user, res.shop);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setErrorMsg(translateError(code, lang));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(demoUser: 'owner_demo' | 'staff_demo') {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.login(demoUser, 'demo1234');
      setStoredToken(res.token);
      onAuthenticated(res.user, res.shop);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setErrorMsg(translateError(code, lang));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.registerShop({
        shopName,
        address: shopAddress,
        ownerName,
        username: regUsername,
        password: regPassword,
      });
      setStoredToken(res.token);
      onAuthenticated(res.user, res.shop);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setErrorMsg(translateError(code, lang));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen liquid-canvas flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient liquid refraction orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-24 w-80 h-80 rounded-full bg-teal-400/20 dark:bg-teal-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-sky-400/20 dark:bg-cyan-500/12 blur-3xl" />
      </div>

      {/* Top frosted bar */}
      <header className="liquid-bar border-b px-4 sm:px-8 h-16 flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="w-9 h-9 shrink-0 drop-shadow-sm" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            {t.appTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton lang={lang} compact />

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.settings.lightMode : t.settings.darkMode}
            className="min-w-[40px] min-h-[40px] px-3 rounded-xl liquid-subpanel flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 shrink-0" />
            )}
            <span className="hidden sm:inline whitespace-nowrap">
              {theme === 'dark' ? t.settings.lightMode : t.settings.darkMode}
            </span>
          </button>

          <div className="flex items-center gap-1 p-1 liquid-pill-track rounded-xl">
            <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-2 mr-1 shrink-0" />
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'en'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('te')}
              className={`px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'te'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Auth Card */}
          <section className="lg:col-span-7 liquid-panel rounded-3xl p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight text-balance">
                {t.appTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.auth.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 liquid-pill-track rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`min-h-[44px] px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.auth.signInTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`min-h-[44px] px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.auth.createShopTab}
              </button>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-300/70 dark:border-red-500/30 bg-red-50/90 dark:bg-red-950/50 px-4 py-3 text-sm text-red-800 dark:text-red-200"
              >
                {errorMsg}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.auth.username}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="owner_demo"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.auth.password}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] px-6 py-3 rounded-xl liquid-btn-primary disabled:opacity-60 font-semibold text-base cursor-pointer"
                >
                  {loading ? t.auth.signingIn : t.auth.signInBtn}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.auth.shopName}
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.auth.shopAddress}
                  </label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.auth.ownerName}
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                      {t.auth.username}
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                      {t.auth.password}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl liquid-input text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] px-6 py-3 rounded-xl liquid-btn-primary disabled:opacity-60 font-semibold text-base cursor-pointer"
                >
                  {loading ? t.auth.creatingShop : t.auth.createShopBtn}
                </button>
              </form>
            )}
          </section>

          {/* Right: Demo Pharmacy Access */}
          <aside className="lg:col-span-5 liquid-panel rounded-3xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-teal-700 dark:text-teal-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wide">
                  {t.demoTag}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {t.auth.demoAccessTitle}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {t.auth.demoAccessDesc}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200/70 dark:border-white/10">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('owner_demo')}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {t.auth.demoOwnerBtn}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                      owner_demo / demo1234
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('staff_demo')}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserCheck className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {t.auth.demoStaffBtn}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                      staff_demo / demo1234
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
