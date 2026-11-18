import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Bell,
  BellRing,
  Boxes,
  CheckSquare,
  ChevronRight,
  FileBarChart2,
  Globe,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PackageMinus,
  PlusCircle,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import type { EnrichedBatch, Language, Shop, ThemeMode, UserPublic } from '../types';
import type { NotificationPermissionState } from '../hooks/useNotifications';
import { translations } from '../i18n';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { StatusIndicator } from './StatusIndicator';

export type ScreenId =
  | 'dashboard'
  | 'inventory'
  | 'add'
  | 'alerts'
  | 'approvals'
  | 'activity'
  | 'reports'
  | 'settings'
  | 'batchDetail';

interface LayoutShellProps {
  user: UserPublic;
  shop: Shop;
  lang: Language;
  theme: ThemeMode;
  activeScreen: ScreenId;
  batches: EnrichedBatch[];
  alertCount: number;
  upcomingCount: number;
  expiredCount: number;
  lowStockCount: number;
  pendingApprovalCount: number;
  notificationPermission: NotificationPermissionState;
  notificationsEnabled: boolean;
  onEnableNotifications: () => Promise<boolean>;
  onDisableNotifications: () => void;
  onSendTestNotification: () => Promise<boolean>;
  onNavigate: (screen: ScreenId, filter?: string) => void;
  onSelectBatch: (batchId: string) => void;
  onSearchInventory: (query: string) => void;
  onChangeLang: (lang: Language) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  children: ReactNode;
}

export function LayoutShell({
  user,
  shop,
  lang,
  theme,
  activeScreen,
  batches,
  alertCount,
  upcomingCount,
  expiredCount,
  lowStockCount,
  pendingApprovalCount,
  notificationPermission,
  notificationsEnabled,
  onEnableNotifications,
  onDisableNotifications,
  onSendTestNotification,
  onNavigate,
  onSelectBatch,
  onSearchInventory,
  onChangeLang,
  onToggleTheme,
  onLogout,
  children,
}: LayoutShellProps) {
  const t = translations[lang];
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    return batches
      .filter((b) => {
        if (b.status !== 'ACTIVE') return false;
        return (
          b.medicineName.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.manufacturer.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [batches, globalSearch]);

  const showSearchDropdown = searchFocused && globalSearch.trim().length > 0;

  function closeSearchOverlay() {
    setSearchFocused(false);
    setMobileSearchOpen(false);
  }

  function handleSelectSearchResult(batchId: string) {
    closeSearchOverlay();
    setGlobalSearch('');
    onSelectBatch(batchId);
  }

  function handleSubmitSearchAll() {
    const q = globalSearch.trim();
    if (!q) return;
    closeSearchOverlay();
    onSearchInventory(q);
  }

  const navItems: Array<{
    id: ScreenId;
    label: string;
    icon: typeof LayoutDashboard;
    count?: number;
  }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'inventory', label: t.nav.inventory, icon: Boxes },
    { id: 'add', label: t.nav.addMedicine, icon: PlusCircle },
    { id: 'alerts', label: t.nav.alerts, icon: Bell, count: alertCount },
    { id: 'approvals', label: t.nav.approvals, icon: CheckSquare, count: pendingApprovalCount },
    { id: 'activity', label: t.nav.activity, icon: History },
    { id: 'reports', label: t.nav.reports, icon: FileBarChart2 },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const effectiveNavId = activeScreen === 'batchDetail' ? 'inventory' : activeScreen;

  function handleSelect(id: ScreenId, filter?: string) {
    onNavigate(id, filter);
    setMoreOpen(false);
    setNotifOpen(false);
  }

  const totalBadgeCount =
    alertCount + (user.role === 'OWNER' ? pendingApprovalCount : 0) + lowStockCount;

  return (
    <div className="min-h-screen liquid-canvas text-slate-900 dark:text-slate-100 flex relative">
      {/* Ambient liquid refraction glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-teal-400/15 dark:bg-teal-500/12 blur-3xl" />
        <div className="absolute bottom-0 right-1/5 w-96 h-96 rounded-full bg-sky-400/14 dark:bg-sky-500/10 blur-3xl" />
      </div>

      {/* Desktop Frosted Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 liquid-bar border-r z-30">
        <div className="h-16 px-5 border-b border-slate-200/70 dark:border-white/10 flex items-center gap-2.5">
          <BrandLogo className="w-8 h-8 shrink-0 drop-shadow-sm" />
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            {t.appTitle}
          </span>
        </div>

        <div className="px-5 py-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {shop.name}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="truncate">{user.displayName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-teal-700 dark:text-teal-300 shrink-0">
              {user.role === 'OWNER' ? t.roleOwner : t.roleShopkeeper}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = effectiveNavId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-teal-600/15 dark:bg-teal-400/15 text-teal-800 dark:text-teal-200 font-semibold border border-teal-500/25 dark:border-teal-400/25 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 ${
                      active ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-xs font-mono-tabular font-semibold shrink-0 ${
                      active ? 'text-teal-800 dark:text-teal-200' : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200/70 dark:border-white/10 space-y-2">
          <PWAInstallButton lang={lang} />

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full min-h-[42px] px-3 py-2 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <span>{theme === 'dark' ? t.settings.lightMode : t.settings.darkMode}</span>
            </span>
            <span className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? 'ON' : 'OFF'}
            </span>
          </button>

          <div className="flex items-center justify-between px-2 py-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              <span>EN / తెలుగు</span>
            </span>
            <div className="flex items-center gap-1 liquid-pill-track p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('te')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  lang === 'te'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                తె
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>{t.auth.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative z-10">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 liquid-bar border-b h-[52px] lg:h-16 px-4 lg:px-8 flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-2.5 min-w-0 shrink-0 max-w-[44%] sm:max-w-[220px]">
            <BrandLogo className="lg:hidden w-7 h-7 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm lg:text-base font-bold text-slate-900 dark:text-white truncate">
                {shop.name}
              </div>
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{user.role === 'OWNER' ? t.roleOwner : t.roleShopkeeper}</span>
                <span aria-hidden="true">·</span>
                <span>{user.displayName}</span>
              </div>
            </div>
          </div>

          {/* Desktop / Tablet Inline Global Search Bar */}
          <div className="hidden sm:block flex-1 max-w-md relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitSearchAll();
              }}
              className="relative"
            >
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={globalSearch}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    closeSearchOverlay();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder={t.globalSearch.placeholder}
                aria-label={t.globalSearch.openLabel}
                className="w-full min-h-[38px] lg:min-h-[40px] pl-9 pr-8 py-1.5 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSearch('');
                    setSearchFocused(false);
                  }}
                  aria-label={t.globalSearch.clearLabel}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {showSearchDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={closeSearchOverlay}
                />
                <div className="absolute left-0 right-0 top-full mt-2 z-40 liquid-panel rounded-2xl overflow-hidden shadow-2xl max-h-96 flex flex-col">
                  <div className="px-4 py-2.5 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {t.globalSearch.resultsHeader}
                    </span>
                    <span className="font-mono-tabular font-semibold text-teal-700 dark:text-teal-300">
                      {searchResults.length}
                    </span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center">
                      {t.globalSearch.noMatches}
                    </div>
                  ) : (
                    <>
                      <div className="overflow-y-auto divide-y divide-slate-200/60 dark:divide-white/10">
                        {searchResults.slice(0, 7).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(b.id)}
                            className="w-full px-4 py-2.5 text-left hover:bg-white/60 dark:hover:bg-white/8 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {b.medicineName}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {[b.category, b.manufacturer, b.batchNumber]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                              <span className="text-xs font-mono-tabular font-bold text-slate-900 dark:text-white">
                                {b.quantity} {t.dashboard.units}
                              </span>
                              <StatusIndicator
                                status={b.expiryStatus}
                                quantity={b.quantity}
                                lang={lang}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleSubmitSearchAll}
                        className="w-full px-4 py-2.5 border-t border-slate-200/70 dark:border-white/10 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-white/50 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>
                          {t.globalSearch.viewAllInInventory} ({searchResults.length})
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
            {/* Mobile Search Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(true);
                setSearchFocused(true);
                setTimeout(() => mobileInputRef.current?.focus(), 40);
              }}
              aria-label={t.globalSearch.openLabel}
              className="sm:hidden min-w-[38px] min-h-[38px] px-2 rounded-xl liquid-subpanel text-slate-800 dark:text-slate-200 flex items-center justify-center cursor-pointer"
            >
              <Search className="w-4 h-4 shrink-0" />
            </button>

            <div className="lg:hidden">
              <PWAInstallButton lang={lang} compact />
            </div>

            {/* Notification Bell Center */}
            <button
              type="button"
              onClick={() => {
                setTestSent(false);
                setNotifOpen((prev) => !prev);
              }}
              aria-label={t.notifications.bellLabel}
              className="relative min-w-[40px] min-h-[38px] lg:min-h-[40px] px-2.5 rounded-xl liquid-subpanel text-slate-800 dark:text-slate-200 flex items-center justify-center hover:bg-white/75 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {notificationsEnabled ? (
                <BellRing className="w-4 h-4 text-teal-600 dark:text-teal-300 shrink-0" />
              ) : (
                <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200 shrink-0" />
              )}
              {totalBadgeCount > 0 && (
                <span className="ml-1.5 text-[11px] font-mono-tabular font-bold text-red-700 dark:text-red-300">
                  {totalBadgeCount}
                </span>
              )}
            </button>

            {/* Instant Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? t.settings.lightMode : t.settings.darkMode}
              className="min-w-[40px] min-h-[38px] lg:min-h-[40px] px-2.5 lg:px-3 rounded-xl liquid-subpanel text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-white/75 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 shrink-0" />
              )}
              <span className="hidden md:inline whitespace-nowrap">
                {theme === 'dark' ? t.settings.lightMode : t.settings.darkMode}
              </span>
            </button>

            {/* Mobile compact language toggle */}
            <button
              type="button"
              onClick={() => onChangeLang(lang === 'en' ? 'te' : 'en')}
              className="lg:hidden min-h-[38px] px-2.5 py-1.5 rounded-xl liquid-subpanel text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap cursor-pointer"
            >
              {lang === 'en' ? 'తెలుగు' : 'EN'}
            </button>

            <button
              type="button"
              onClick={() => handleSelect('add')}
              className="hidden sm:inline-flex min-h-[40px] px-4 py-2 rounded-xl liquid-btn-primary text-sm font-semibold items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{t.nav.addMedicine}</span>
            </button>

            {/* Notifications Popover */}
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="fixed right-3 left-3 sm:left-auto sm:right-6 top-14 lg:top-16 sm:w-96 z-50 liquid-panel rounded-2xl p-4 space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.notifications.drawerTitle}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {totalBadgeCount === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 py-2">
                      {t.notifications.noNewAlerts}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {upcomingCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSelect('alerts')}
                          className="w-full px-3 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 flex items-center justify-between gap-2 text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{t.notifications.expiryAlertsSummary}</span>
                          </span>
                          <span className="font-mono-tabular text-xs font-bold text-slate-900 dark:text-white">
                            {upcomingCount}
                          </span>
                        </button>
                      )}

                      {expiredCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSelect('alerts')}
                          className="w-full px-3 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 flex items-center justify-between gap-2 text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{t.notifications.expiredSummary}</span>
                          </span>
                          <span className="font-mono-tabular text-xs font-bold text-slate-900 dark:text-white">
                            {expiredCount}
                          </span>
                        </button>
                      )}

                      {lowStockCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSelect('inventory', 'LOW_STOCK')}
                          className="w-full px-3 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 flex items-center justify-between gap-2 text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs font-semibold text-orange-700 dark:text-orange-300">
                            <PackageMinus className="w-4 h-4 shrink-0" />
                            <span>{t.notifications.lowStockSummary}</span>
                          </span>
                          <span className="font-mono-tabular text-xs font-bold text-slate-900 dark:text-white">
                            {lowStockCount}
                          </span>
                        </button>
                      )}

                      {user.role === 'OWNER' && pendingApprovalCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSelect('approvals')}
                          className="w-full px-3 py-2.5 rounded-xl liquid-subpanel hover:bg-white/80 dark:hover:bg-white/10 flex items-center justify-between gap-2 text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300">
                            <CheckSquare className="w-4 h-4 shrink-0" />
                            <span>{t.notifications.pendingApprovalsSummary}</span>
                          </span>
                          <span className="font-mono-tabular text-xs font-bold text-slate-900 dark:text-white">
                            {pendingApprovalCount}
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Device Notification Controls */}
                  <div className="pt-2 border-t border-slate-200/70 dark:border-white/10 space-y-2">
                    {notificationPermission === 'unsupported' ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.notifications.deviceAlertsUnsupported}
                      </p>
                    ) : notificationPermission === 'denied' ? (
                      <p className="text-xs text-red-700 dark:text-red-400">
                        {t.notifications.deviceAlertsBlocked}
                      </p>
                    ) : notificationsEnabled ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          {t.notifications.deviceAlertsActive}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              void onSendTestNotification().then((ok) => {
                                if (ok) setTestSent(true);
                              });
                            }}
                            className="min-h-[34px] px-2.5 py-1 rounded-lg liquid-subpanel text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                          >
                            {t.notifications.testNotification}
                          </button>
                          <button
                            type="button"
                            onClick={onDisableNotifications}
                            className="min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer"
                          >
                            {t.notifications.disableDeviceAlerts}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          void onEnableNotifications();
                        }}
                        className="w-full min-h-[40px] px-3 py-2 rounded-xl liquid-btn-primary text-xs font-semibold cursor-pointer"
                      >
                        {t.notifications.enableDeviceAlerts}
                      </button>
                    )}
                    {testSent && (
                      <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                        {t.notifications.testSent}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Expandable Header Search Overlay */}
          {mobileSearchOpen && (
            <div className="sm:hidden fixed inset-x-0 top-0 z-50">
              <div
                className="fixed inset-0 bg-slate-950/35 backdrop-blur-xs"
                onClick={closeSearchOverlay}
              />
              <div className="relative z-10 liquid-bar border-b px-3 py-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitSearchAll();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={mobileInputRef}
                      type="search"
                      value={globalSearch}
                      onFocus={() => setSearchFocused(true)}
                      onChange={(e) => {
                        setGlobalSearch(e.target.value);
                        setSearchFocused(true);
                      }}
                      placeholder={t.globalSearch.placeholder}
                      className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-xl liquid-input text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={closeSearchOverlay}
                    aria-label={t.globalSearch.clearLabel}
                    className="min-w-[40px] min-h-[40px] rounded-xl liquid-subpanel flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>

                {globalSearch.trim().length > 0 && (
                  <div className="mt-2 liquid-panel rounded-2xl overflow-hidden max-h-80 flex flex-col">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                        {t.globalSearch.noMatches}
                      </div>
                    ) : (
                      <>
                        <div className="overflow-y-auto divide-y divide-slate-200/60 dark:divide-white/10">
                          {searchResults.slice(0, 6).map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => handleSelectSearchResult(b.id)}
                              className="w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {b.medicineName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {[b.category, b.manufacturer, b.batchNumber]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </div>
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                                <span className="text-xs font-mono-tabular font-bold text-slate-900 dark:text-white">
                                  {b.quantity} {t.dashboard.units}
                                </span>
                                <StatusIndicator
                                  status={b.expiryStatus}
                                  quantity={b.quantity}
                                  lang={lang}
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleSubmitSearchAll}
                          className="w-full px-3.5 py-2.5 border-t border-slate-200/70 dark:border-white/10 text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>
                            {t.globalSearch.viewAllInInventory} ({searchResults.length})
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Demo Data Notice */}
        {shop.isDemo && (
          <div className="bg-amber-100/75 dark:bg-amber-950/55 backdrop-blur-md border-b border-amber-300/60 dark:border-amber-500/25 px-4 lg:px-8 py-2 text-xs font-medium text-amber-950 dark:text-amber-200">
            {t.demoBanner}
          </div>
        )}

        {/* Main Scrollable Workspace */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Tab Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 liquid-bar border-t pb-safe">
        <div className="grid grid-cols-5 h-16">
          {[
            { id: 'dashboard' as ScreenId, label: t.nav.dashboard, icon: LayoutDashboard },
            { id: 'inventory' as ScreenId, label: t.nav.inventory, icon: Boxes },
            { id: 'add' as ScreenId, label: t.nav.addMedicine, icon: PlusCircle },
            { id: 'alerts' as ScreenId, label: t.nav.alerts, icon: Bell, count: alertCount },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = effectiveNavId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelect(tab.id)}
                className={`flex flex-col items-center justify-center px-1 min-h-[44px] relative cursor-pointer ${
                  active
                    ? 'text-teal-700 dark:text-teal-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 text-[10px] font-mono-tabular font-bold text-red-700 dark:text-red-300 bg-red-100/90 dark:bg-red-950/90 px-1 rounded">
                      {tab.count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-0.5 truncate max-w-full leading-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center px-1 min-h-[44px] relative cursor-pointer ${
              ['approvals', 'activity', 'reports', 'settings'].includes(effectiveNavId)
                ? 'text-teal-700 dark:text-teal-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {pendingApprovalCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 text-[10px] font-mono-tabular font-bold text-amber-800 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/90 px-1 rounded">
                  {pendingApprovalCount}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 truncate max-w-full leading-tight">
              {t.nav.more}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Bottom Sheet */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full liquid-panel rounded-t-3xl p-5 pb-8 space-y-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-white/10">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {user.displayName} · {user.role === 'OWNER' ? t.roleOwner : t.roleShopkeeper}
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {[
              { id: 'approvals' as ScreenId, label: t.nav.approvals, icon: CheckSquare, count: pendingApprovalCount },
              { id: 'activity' as ScreenId, label: t.nav.activity, icon: History },
              { id: 'reports' as ScreenId, label: t.nav.reports, icon: FileBarChart2 },
              { id: 'settings' as ScreenId, label: t.nav.settings, icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className="w-full min-h-[48px] px-3 py-3 rounded-xl flex items-center justify-between text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-white/60 dark:hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <span>{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-xs font-mono-tabular font-semibold text-amber-700 dark:text-amber-300">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={onLogout}
              className="w-full min-h-[48px] px-3 py-3 rounded-xl flex items-center gap-3 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/40 border-t border-slate-200/70 dark:border-white/10 mt-2 pt-3"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.auth.signOut}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
