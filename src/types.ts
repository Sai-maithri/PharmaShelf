export type UserRole = 'OWNER' | 'SHOPKEEPER';

export type Language = 'en' | 'te';

export type ThemeMode = 'light' | 'dark';

export type ExpiryType = 'MM_YYYY' | 'FULL_DATE';

export type ExpiryStage = '30_DAYS' | '15_DAYS' | '7_DAYS' | 'EXPIRED';

export type ExpiryStatus = ExpiryStage | 'SAFE';

export type BatchStatus = 'ACTIVE' | 'ARCHIVED';

export type StockActionType =
  | 'CREATED'
  | 'CHECKED'
  | 'STILL_AVAILABLE'
  | 'SOLD'
  | 'DAMAGED'
  | 'REMOVED'
  | 'OWNER_EDIT'
  | 'APPROVAL_APPLIED';

export type ApprovalRequestType =
  | 'EDIT_BATCH'
  | 'QUANTITY_OVERRIDE'
  | 'ARCHIVE_BATCH';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Shop {
  id: string;
  name: string;
  address: string;
  isDemo: boolean;
  createdAt: string;
}

export interface UserPublic {
  id: string;
  shopId: string;
  username: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  isDemo: boolean;
  createdAt: string;
}

export interface Medicine {
  id: string;
  shopId: string;
  name: string;
  manufacturer: string;
  barcode: string;
  category: string;
  isDemo: boolean;
  createdAt: string;
}

export interface Batch {
  id: string;
  shopId: string;
  medicineId: string;
  batchNumber: string;
  expiryRaw: string;
  expiryType: ExpiryType;
  expiryNormalizedDate: string; // YYYY-MM-DD
  quantity: number;
  initialQuantity: number;
  status: BatchStatus;
  lastCheckedAt: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedBatch extends Batch {
  medicineName: string;
  manufacturer: string;
  barcode: string;
  category: string;
  daysRemaining: number;
  expiryStatus: ExpiryStatus;
}

export interface ExpiryReminder {
  id: string;
  shopId: string;
  batchId: string;
  stage: ExpiryStage;
  daysRemainingAtTrigger: number;
  triggeredAt: string;
  acknowledgedAt: string | null;
  acknowledgedByName: string | null;
  isDemo: boolean;
}

export interface EnrichedReminder extends ExpiryReminder {
  medicineId: string;
  medicineName: string;
  manufacturer: string;
  batchNumber: string;
  expiryRaw: string;
  expiryType: ExpiryType;
  expiryNormalizedDate: string;
  quantity: number;
  daysRemaining: number;
  batchStatus: BatchStatus;
}

export interface StockActivity {
  id: string;
  shopId: string;
  batchId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  actionType: StockActionType;
  quantityDelta: number;
  previousQuantity: number;
  newQuantity: number;
  note: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  isDemo: boolean;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  shopId: string;
  batchId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  requestType: ApprovalRequestType;
  proposedBatchNumber?: string;
  proposedExpiryRaw?: string;
  proposedQuantity?: number;
  reason: string;
  status: ApprovalStatus;
  requestedById: string;
  requestedByName: string;
  requestedAt: string;
  decidedById: string | null;
  decidedByName: string | null;
  decisionNote: string | null;
  decidedAt: string | null;
  isDemo: boolean;
}

export interface DashboardSummary {
  totalActiveBatches: number;
  totalActiveUnits: number;
  totalMedicines: number;
  expiring30Count: number;
  expiring15Count: number;
  expiring7Count: number;
  expiringSoonTotal: number;
  expiredBatchesCount: number;
  expiredUnitsCount: number;
  outOfStockBatchesCount: number;
  pendingApprovalsCount: number;
  unacknowledgedRemindersCount: number;
  recentActivities: StockActivity[];
}

export interface ReportsSummary {
  upcoming7: EnrichedBatch[];
  upcoming15: EnrichedBatch[];
  upcoming30: EnrichedBatch[];
  expiredBatches: EnrichedBatch[];
  actionTotals: {
    soldUnits: number;
    damagedUnits: number;
    removedUnits: number;
    checkedCount: number;
    stillAvailableCount: number;
  };
  recentAdjustments: StockActivity[];
}

export interface OcrPackResult {
  medicineName: string | null;
  manufacturer: string | null;
  batchNumber: string | null;
  expiryRaw: string | null;
  notes: string | null;
}
