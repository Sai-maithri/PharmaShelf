import type {
  ApprovalRequest,
  ApprovalRequestType,
  DashboardSummary,
  EnrichedBatch,
  EnrichedReminder,
  ExpiryReminder,
  Medicine,
  OcrPackResult,
  ReportsSummary,
  Shop,
  StockActionType,
  StockActivity,
  UserPublic,
} from '../types';

const TOKEN_STORAGE_KEY = 'pharmashelf_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage restrictions
  }
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 0);
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new ApiError(data.error ?? 'NETWORK_ERROR', res.status);
  }
  return data as T;
}

export const api = {
  me(): Promise<{ user: UserPublic; shop: Shop }> {
    return requestJson('/api/auth/me');
  },

  login(username: string, password: string): Promise<{ token: string; user: UserPublic; shop: Shop }> {
    return requestJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  registerShop(params: {
    shopName: string;
    address: string;
    ownerName: string;
    username: string;
    password: string;
  }): Promise<{ token: string; user: UserPublic; shop: Shop }> {
    return requestJson('/api/auth/register-shop', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  logout(): Promise<{ ok: boolean }> {
    return requestJson('/api/auth/logout', { method: 'POST' });
  },

  dashboard(): Promise<DashboardSummary> {
    return requestJson('/api/dashboard');
  },

  medicines(): Promise<{ medicines: Medicine[] }> {
    return requestJson('/api/medicines');
  },

  batches(): Promise<{ batches: EnrichedBatch[] }> {
    return requestJson('/api/batches');
  },

  addBatch(params: {
    medicineId?: string;
    medicineName: string;
    manufacturer?: string;
    barcode?: string;
    category?: string;
    batchNumber: string;
    expiryInput: string;
    quantity: number;
  }): Promise<{ batch: EnrichedBatch }> {
    return requestJson('/api/batches', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  batchDetail(id: string): Promise<{
    batch: EnrichedBatch;
    activities: StockActivity[];
    reminders: ExpiryReminder[];
    approvals: ApprovalRequest[];
  }> {
    return requestJson(`/api/batches/${encodeURIComponent(id)}`);
  },

  stockAction(
    batchId: string,
    params: {
      actionType: Extract<
        StockActionType,
        'CHECKED' | 'STILL_AVAILABLE' | 'SOLD' | 'DAMAGED' | 'REMOVED'
      >;
      quantity?: number;
      note?: string;
    }
  ): Promise<{ batch: EnrichedBatch }> {
    return requestJson(`/api/batches/${encodeURIComponent(batchId)}/actions`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  ownerEditBatch(
    batchId: string,
    params: {
      batchNumber?: string;
      expiryInput?: string;
      quantity?: number;
      status?: 'ACTIVE' | 'ARCHIVED';
      note?: string;
    }
  ): Promise<{ batch: EnrichedBatch }> {
    return requestJson(`/api/batches/${encodeURIComponent(batchId)}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  },

  alerts(): Promise<{
    upcomingReminders: EnrichedReminder[];
    expiredBatches: EnrichedBatch[];
  }> {
    return requestJson('/api/alerts');
  },

  acknowledgeAlert(reminderId: string): Promise<{ reminder: ExpiryReminder }> {
    return requestJson(`/api/alerts/${encodeURIComponent(reminderId)}/acknowledge`, {
      method: 'POST',
    });
  },

  approvals(): Promise<{ approvals: ApprovalRequest[] }> {
    return requestJson('/api/approvals');
  },

  createApproval(params: {
    batchId: string;
    requestType: ApprovalRequestType;
    proposedBatchNumber?: string;
    proposedExpiryInput?: string;
    proposedQuantity?: number;
    reason: string;
  }): Promise<{ approval: ApprovalRequest }> {
    return requestJson('/api/approvals', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  decideApproval(
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    decisionNote?: string
  ): Promise<{ approval: ApprovalRequest }> {
    return requestJson(`/api/approvals/${encodeURIComponent(id)}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, decisionNote }),
    });
  },

  activities(): Promise<{ activities: StockActivity[] }> {
    return requestJson('/api/activity');
  },

  reports(): Promise<ReportsSummary> {
    return requestJson('/api/reports');
  },

  shopkeepers(): Promise<{ shopkeepers: UserPublic[] }> {
    return requestJson('/api/shopkeepers');
  },

  createShopkeeper(params: {
    displayName: string;
    username: string;
    password: string;
  }): Promise<{ shopkeeper: UserPublic }> {
    return requestJson('/api/shopkeepers', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  toggleShopkeeper(id: string, active: boolean): Promise<{ shopkeeper: UserPublic }> {
    return requestJson(`/api/shopkeepers/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  },

  resetDemo(): Promise<{ ok: boolean }> {
    return requestJson('/api/demo/reset', { method: 'POST' });
  },

  extractPackOcr(imageBase64: string, mimeType: string): Promise<{ extracted: OcrPackResult }> {
    return requestJson('/api/ocr/extract-pack', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType }),
    });
  },
};
