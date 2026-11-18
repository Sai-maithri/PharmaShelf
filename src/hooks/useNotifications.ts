import { useCallback, useEffect, useState } from 'react';
import type {
  ApprovalRequest,
  EnrichedBatch,
  EnrichedReminder,
  Language,
  UserRole,
} from '../types';
import { translations } from '../i18n';

const DEVICE_NOTIFY_ENABLED_KEY = 'pharmashelf_device_notifications';
const NOTIFIED_KEYS_STORAGE = 'pharmashelf_notified_keys';

export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported';

function getPermissionState(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

function loadEnabledFlag(): boolean {
  try {
    return localStorage.getItem(DEVICE_NOTIFY_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

function loadNotifiedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEYS_STORAGE);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedKeys(keys: Set<string>): void {
  try {
    const arr = Array.from(keys).slice(-250);
    localStorage.setItem(NOTIFIED_KEYS_STORAGE, JSON.stringify(arr));
  } catch {
    // ignore storage errors
  }
}

export async function dispatchDeviceNotification(
  title: string,
  body: string,
  tag: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag,
        });
        return true;
      }
    }
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag,
    });
    return true;
  } catch {
    return false;
  }
}

export function useNotifications(params: {
  lang: Language;
  isAuthenticated: boolean;
  userRole?: UserRole;
  upcomingReminders: EnrichedReminder[];
  expiredBatches: EnrichedBatch[];
  approvals: ApprovalRequest[];
}) {
  const { lang, isAuthenticated, userRole, upcomingReminders, expiredBatches, approvals } =
    params;

  const [permission, setPermission] =
    useState<NotificationPermissionState>(getPermissionState);
  const [enabled, setEnabled] = useState<boolean>(
    () => loadEnabledFlag() && getPermissionState() === 'granted'
  );

  useEffect(() => {
    const syncPermission = () => {
      const nextPerm = getPermissionState();
      setPermission(nextPerm);
      if (nextPerm !== 'granted') {
        setEnabled(false);
      }
    };
    window.addEventListener('focus', syncPermission);
    return () => window.removeEventListener('focus', syncPermission);
  }, []);

  const enableDeviceNotifications = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return false;
    }

    let currentPerm = Notification.permission;
    if (currentPerm === 'default') {
      currentPerm = await Notification.requestPermission();
    }
    setPermission(currentPerm);

    if (currentPerm === 'granted') {
      setEnabled(true);
      try {
        localStorage.setItem(DEVICE_NOTIFY_ENABLED_KEY, 'true');
      } catch {
        // ignore
      }
      return true;
    }

    setEnabled(false);
    try {
      localStorage.setItem(DEVICE_NOTIFY_ENABLED_KEY, 'false');
    } catch {
      // ignore
    }
    return false;
  }, []);

  const disableDeviceNotifications = useCallback(() => {
    setEnabled(false);
    try {
      localStorage.setItem(DEVICE_NOTIFY_ENABLED_KEY, 'false');
    } catch {
      // ignore
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    const t = translations[lang];
    const ok = await enableDeviceNotifications();
    if (!ok) return false;
    return dispatchDeviceNotification(
      t.notifications.testTitle,
      t.notifications.testBody,
      'pharmashelf-test'
    );
  }, [enableDeviceNotifications, lang]);

  // Automatically notify device when new urgent alerts, expired stock, or owner approvals appear
  useEffect(() => {
    if (!isAuthenticated || !enabled || permission !== 'granted') return;
    const t = translations[lang];
    const seen = loadNotifiedKeys();
    let changed = false;

    const newReminders = upcomingReminders.filter(
      (r) => !r.acknowledgedAt && !seen.has(`rem:${r.id}`)
    );
    const newExpired = expiredBatches.filter((b) => !seen.has(`exp:${b.id}`));
    const newApprovals =
      userRole === 'OWNER'
        ? approvals.filter((a) => a.status === 'PENDING' && !seen.has(`apr:${a.id}`))
        : [];

    if (newReminders.length > 0) {
      const urgentFirst =
        newReminders.find((r) => r.stage === '7_DAYS') ?? newReminders[0];
      const extra =
        newReminders.length > 1 ? ` (+${newReminders.length - 1})` : '';
      void dispatchDeviceNotification(
        t.notifications.newExpiryTitle,
        `${urgentFirst.medicineName} (${urgentFirst.batchNumber}) · EXP ${urgentFirst.expiryRaw}${extra}`,
        'pharmashelf-expiry-alert'
      );
      newReminders.forEach((r) => seen.add(`rem:${r.id}`));
      changed = true;
    }

    if (newExpired.length > 0) {
      const first = newExpired[0];
      const extra = newExpired.length > 1 ? ` (+${newExpired.length - 1})` : '';
      void dispatchDeviceNotification(
        t.notifications.newExpiredTitle,
        `${first.medicineName} (${first.batchNumber}) · ${first.quantity} ${t.dashboard.units}${extra}`,
        'pharmashelf-expired-alert'
      );
      newExpired.forEach((b) => seen.add(`exp:${b.id}`));
      changed = true;
    }

    if (newApprovals.length > 0) {
      const first = newApprovals[0];
      const extra =
        newApprovals.length > 1 ? ` (+${newApprovals.length - 1})` : '';
      void dispatchDeviceNotification(
        t.notifications.newApprovalTitle,
        `${first.medicineName} — ${first.requestedByName}${extra}`,
        'pharmashelf-approval-alert'
      );
      newApprovals.forEach((a) => seen.add(`apr:${a.id}`));
      changed = true;
    }

    if (changed) {
      saveNotifiedKeys(seen);
    }
  }, [
    isAuthenticated,
    enabled,
    permission,
    lang,
    userRole,
    upcomingReminders,
    expiredBatches,
    approvals,
  ]);

  return {
    permission,
    enabled,
    enableDeviceNotifications,
    disableDeviceNotifications,
    sendTestNotification,
  };
}
