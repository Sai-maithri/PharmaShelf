import { useCallback, useEffect, useState } from 'react';
import type {
  ApprovalRequest,
  DashboardSummary,
  EnrichedBatch,
  EnrichedReminder,
  Language,
  Medicine,
  ReportsSummary,
  Shop,
  StockActivity,
  ThemeMode,
  UserPublic,
} from './types';
import { api, getStoredToken, setStoredToken } from './lib/api';
import { useNotifications } from './hooks/useNotifications';
import { LoginScreen } from './components/LoginScreen';
import { LayoutShell, type ScreenId } from './components/LayoutShell';
import { DashboardView } from './components/DashboardView';
import { AddMedicineView } from './components/AddMedicineView';
import { InventoryView, type InventoryFilter } from './components/InventoryView';
import { BatchDetailView } from './components/BatchDetailView';
import { ExpiryAlertsView } from './components/ExpiryAlertsView';
import { ApprovalsView } from './components/ApprovalsView';
import { ActivityHistoryView } from './components/ActivityHistoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { OfflineIndicator } from './components/OfflineIndicator';

const LANG_KEY = 'pharmashelf_lang';
const THEME_KEY = 'pharmashelf_theme';
const LOW_STOCK_THRESHOLD_KEY = 'pharmashelf_low_stock_threshold';

function readLowStockThreshold(): number {
  try {
    const raw = localStorage.getItem(LOW_STOCK_THRESHOLD_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 10000) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return 20;
}

function loadInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // ignore
  }
  return 'light';
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      return saved === 'te' ? 'te' : 'en';
    } catch {
      return 'en';
    }
  });

  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  const [screen, setScreen] = useState<ScreenId>('dashboard');
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>('ALL');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventorySearchSeq, setInventorySearchSeq] = useState(0);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<EnrichedBatch[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<EnrichedReminder[]>([]);
  const [expiredBatches, setExpiredBatches] = useState<EnrichedBatch[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [reports, setReports] = useState<ReportsSummary | null>(null);

  function handleChangeLang(nextLang: Language) {
    setLang(nextLang);
    try {
      localStorage.setItem(LANG_KEY, nextLang);
    } catch {
      // ignore storage errors
    }
  }

  function handleToggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  const refreshAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [dashRes, medRes, batRes, alertRes, aprRes, actRes, repRes] =
        await Promise.all([
          api.dashboard(),
          api.medicines(),
          api.batches(),
          api.alerts(),
          api.approvals(),
          api.activities(),
          api.reports(),
        ]);
      setDashboard(dashRes);
      setMedicines(medRes.medicines);
      setBatches(batRes.batches);
      setUpcomingReminders(alertRes.upcomingReminders);
      setExpiredBatches(alertRes.expiredBatches);
      setApprovals(aprRes.approvals);
      setActivities(actRes.activities);
      setReports(repRes);
    } catch {
      // handled per view if needed
    } finally {
      setLoadingData(false);
    }
  }, []);

  const notifications = useNotifications({
    lang,
    isAuthenticated: Boolean(user && shop),
    userRole: user?.role,
    upcomingReminders,
    expiredBatches,
    approvals,
  });

  useEffect(() => {
    if (!user || !shop) return;
    const interval = window.setInterval(() => {
      void refreshAllData();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [user, shop, refreshAllData]);

  useEffect(() => {
    async function checkSession() {
      const token = getStoredToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        const res = await api.me();
        setUser(res.user);
        setShop(res.shop);
        await refreshAllData();
      } catch {
        setStoredToken(null);
        setUser(null);
        setShop(null);
      } finally {
        setCheckingAuth(false);
      }
    }
    void checkSession();
  }, [refreshAllData]);

  async function handleAuthenticated(nextUser: UserPublic, nextShop: Shop) {
    setUser(nextUser);
    setShop(nextShop);
    setScreen('dashboard');
    await refreshAllData();
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setStoredToken(null);
    setUser(null);
    setShop(null);
    setDashboard(null);
    setBatches([]);
    setScreen('dashboard');
  }

  function handleNavigate(nextScreen: ScreenId, nextFilter?: string) {
    if (nextScreen === 'inventory' && nextFilter) {
      setInventoryFilter(nextFilter as InventoryFilter);
    }
    setScreen(nextScreen);
  }

  function handleSelectBatch(batchId: string) {
    setSelectedBatchId(batchId);
    setScreen('batchDetail');
  }

  function handleSearchInventory(query: string) {
    setInventoryFilter('ALL');
    setInventorySearch(query);
    setInventorySearchSeq((n) => n + 1);
    setScreen('inventory');
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen liquid-canvas flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || !shop) {
    return (
      <>
        <LoginScreen
          lang={lang}
          theme={theme}
          onChangeLang={handleChangeLang}
          onToggleTheme={handleToggleTheme}
          onAuthenticated={handleAuthenticated}
        />
        <OfflineIndicator lang={lang} />
      </>
    );
  }

  const alertCount = upcomingReminders.length + expiredBatches.length;
  const pendingApprovalCount = approvals.filter((a) => a.status === 'PENDING').length;
  const threshold = readLowStockThreshold();
  const lowStockCount = batches.filter(
    (b) => b.status === 'ACTIVE' && b.quantity > 0 && b.quantity < threshold
  ).length;

  return (
    <>
    <LayoutShell
      user={user}
      shop={shop}
      lang={lang}
      theme={theme}
      activeScreen={screen}
      batches={batches}
      alertCount={alertCount}
      upcomingCount={upcomingReminders.length}
      expiredCount={expiredBatches.length}
      lowStockCount={lowStockCount}
      pendingApprovalCount={pendingApprovalCount}
      notificationPermission={notifications.permission}
      notificationsEnabled={notifications.enabled}
      onEnableNotifications={notifications.enableDeviceNotifications}
      onDisableNotifications={notifications.disableDeviceNotifications}
      onSendTestNotification={notifications.sendTestNotification}
      onNavigate={(s, f) => handleNavigate(s, f)}
      onSelectBatch={handleSelectBatch}
      onSearchInventory={handleSearchInventory}
      onChangeLang={handleChangeLang}
      onToggleTheme={handleToggleTheme}
      onLogout={handleLogout}
    >
      {screen === 'dashboard' && (
        <DashboardView
          summary={dashboard}
          loading={loadingData}
          lang={lang}
          onNavigate={handleNavigate}
          onSelectBatch={handleSelectBatch}
        />
      )}

      {screen === 'add' && (
        <AddMedicineView
          medicines={medicines}
          lang={lang}
          onBatchSaved={() => {
            void refreshAllData();
          }}
          onGoToInventory={() => handleNavigate('inventory', 'ALL')}
        />
      )}

      {screen === 'inventory' && (
        <InventoryView
          batches={batches}
          loading={loadingData}
          lang={lang}
          initialFilter={inventoryFilter}
          initialSearch={inventorySearch}
          searchSyncKey={inventorySearchSeq}
          onSelectBatch={handleSelectBatch}
          onGoToAdd={() => handleNavigate('add')}
        />
      )}

      {screen === 'batchDetail' && selectedBatchId && (
        <BatchDetailView
          batchId={selectedBatchId}
          user={user}
          lang={lang}
          onBack={() => handleNavigate('inventory')}
          onDataChanged={() => {
            void refreshAllData();
          }}
        />
      )}

      {screen === 'alerts' && (
        <ExpiryAlertsView
          upcomingReminders={upcomingReminders}
          expiredBatches={expiredBatches}
          loading={loadingData}
          lang={lang}
          notificationPermission={notifications.permission}
          notificationsEnabled={notifications.enabled}
          onEnableNotifications={notifications.enableDeviceNotifications}
          onDisableNotifications={notifications.disableDeviceNotifications}
          onSendTestNotification={notifications.sendTestNotification}
          onSelectBatch={handleSelectBatch}
          onRefresh={() => {
            void refreshAllData();
          }}
        />
      )}

      {screen === 'approvals' && (
        <ApprovalsView
          approvals={approvals}
          user={user}
          lang={lang}
          onRefresh={() => {
            void refreshAllData();
          }}
          onSelectBatch={handleSelectBatch}
        />
      )}

      {screen === 'activity' && (
        <ActivityHistoryView
          activities={activities}
          loading={loadingData}
          lang={lang}
          onSelectBatch={handleSelectBatch}
        />
      )}

      {screen === 'reports' && (
        <ReportsView
          reports={reports}
          dashboard={dashboard}
          batches={batches}
          shopName={shop.name}
          isDemo={shop.isDemo}
          actorName={user.displayName}
          loading={loadingData}
          lang={lang}
          onSelectBatch={handleSelectBatch}
        />
      )}

      {screen === 'settings' && (
        <SettingsView
          user={user}
          shop={shop}
          lang={lang}
          theme={theme}
          notificationPermission={notifications.permission}
          notificationsEnabled={notifications.enabled}
          onEnableNotifications={notifications.enableDeviceNotifications}
          onDisableNotifications={notifications.disableDeviceNotifications}
          onSendTestNotification={notifications.sendTestNotification}
          onChangeLang={handleChangeLang}
          onChangeTheme={setTheme}
          onDataReset={() => {
            void refreshAllData();
          }}
        />
      )}
    </LayoutShell>
    <OfflineIndicator lang={lang} />
    </>
  );
}
