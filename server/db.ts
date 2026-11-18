import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  ApprovalRequest,
  ApprovalRequestType,
  Batch,
  DashboardSummary,
  EnrichedBatch,
  EnrichedReminder,
  ExpiryReminder,
  ExpiryStage,
  Medicine,
  ReportsSummary,
  Shop,
  StockActionType,
  StockActivity,
  UserPublic,
  UserRole,
} from '../src/types.ts';
import {
  addDaysISO,
  classifyExpiryStatus,
  computeDaysRemaining,
  getReminderStageForDays,
  parseExpiryInput,
} from './expiryUtils.ts';

interface UserRecord extends UserPublic {
  passwordHash: string;
}

interface SessionRecord {
  token: string;
  userId: string;
  shopId: string;
  createdAt: string;
}

interface DatabaseSchema {
  shops: Shop[];
  users: UserRecord[];
  sessions: SessionRecord[];
  medicines: Medicine[];
  batches: Batch[];
  reminders: ExpiryReminder[];
  activities: StockActivity[];
  approvals: ApprovalRequest[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'pharmacy-db.json');

export const DEMO_SHOP_ID = 'shop_demo_1';
export const DEMO_SHOP_2_ID = 'shop_demo_2';

function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

function toPublicUser(u: UserRecord): UserPublic {
  return {
    id: u.id,
    shopId: u.shopId,
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    active: u.active,
    isDemo: u.isDemo,
    createdAt: u.createdAt,
  };
}

function createDemoSeedData(): DatabaseSchema {
  const now = new Date().toISOString();

  const shops: Shop[] = [
    {
      id: DEMO_SHOP_ID,
      name: 'Sri Sai Medicals (DEMO)',
      address: 'MG Road, Vijayawada',
      isDemo: true,
      createdAt: now,
    },
    {
      id: DEMO_SHOP_2_ID,
      name: 'Nagarjuna Pharmacy (DEMO)',
      address: 'Station Road, Guntur',
      isDemo: true,
      createdAt: now,
    },
  ];

  const users: UserRecord[] = [
    {
      id: 'usr_demo_owner',
      shopId: DEMO_SHOP_ID,
      username: 'owner_demo',
      displayName: 'Ramesh Rao (Demo Owner)',
      role: 'OWNER',
      active: true,
      isDemo: true,
      passwordHash: hashPassword('demo1234'),
      createdAt: now,
    },
    {
      id: 'usr_demo_staff',
      shopId: DEMO_SHOP_ID,
      username: 'staff_demo',
      displayName: 'Lakshmi Devi (Demo Staff)',
      role: 'SHOPKEEPER',
      active: true,
      isDemo: true,
      passwordHash: hashPassword('demo1234'),
      createdAt: now,
    },
    {
      id: 'usr_demo2_owner',
      shopId: DEMO_SHOP_2_ID,
      username: 'owner2_demo',
      displayName: 'Srinivas K (Demo Owner 2)',
      role: 'OWNER',
      active: true,
      isDemo: true,
      passwordHash: hashPassword('demo1234'),
      createdAt: now,
    },
  ];

  const demoMedicines: Medicine[] = [
    {
      id: 'med_demo_1',
      shopId: DEMO_SHOP_ID,
      name: 'Paracetamol 650mg (DEMO)',
      manufacturer: 'Apex Health Labs',
      barcode: '8901234560011',
      category: 'Analgesic',
      isDemo: true,
      createdAt: now,
    },
    {
      id: 'med_demo_2',
      shopId: DEMO_SHOP_ID,
      name: 'Amoxicillin 500mg (DEMO)',
      manufacturer: 'MedCore Remedies',
      barcode: '8901234560028',
      category: 'Antibiotic',
      isDemo: true,
      createdAt: now,
    },
    {
      id: 'med_demo_3',
      shopId: DEMO_SHOP_ID,
      name: 'Cetirizine 10mg (DEMO)',
      manufacturer: 'Zenith Pharma',
      barcode: '8901234560035',
      category: 'Antihistamine',
      isDemo: true,
      createdAt: now,
    },
    {
      id: 'med_demo_4',
      shopId: DEMO_SHOP_ID,
      name: 'Omeprazole 20mg (DEMO)',
      manufacturer: 'Apex Health Labs',
      barcode: '8901234560042',
      category: 'Antacid',
      isDemo: true,
      createdAt: now,
    },
    {
      id: 'med_demo_5',
      shopId: DEMO_SHOP_ID,
      name: 'Vitamin D3 60K (DEMO)',
      manufacturer: 'SunRise Bio',
      barcode: '8901234560059',
      category: 'Supplement',
      isDemo: true,
      createdAt: now,
    },
    // Second shop medicine for isolation testing
    {
      id: 'med_demo2_1',
      shopId: DEMO_SHOP_2_ID,
      name: 'Private Shop2 Cough Syrup (DEMO)',
      manufacturer: 'Guntur Formulations',
      barcode: '8909999000011',
      category: 'Syrup',
      isDemo: true,
      createdAt: now,
    },
  ];

  // Dynamic relative dates so demo reminders (30, 15, 7, expired, safe) are always fresh
  const exp5d = addDaysISO(5);
  const exp13d = addDaysISO(13);
  const exp26d = addDaysISO(26);
  const expExpired = addDaysISO(-9);
  const futureDt = new Date();
  futureDt.setMonth(futureDt.getMonth() + 8);
  const futureMmYyyy = `${String(futureDt.getMonth() + 1).padStart(2, '0')}/${futureDt.getFullYear()}`;
  const futureParsed = parseExpiryInput(futureMmYyyy);

  const farDt = new Date();
  farDt.setMonth(farDt.getMonth() + 14);
  const farMmYyyy = `${String(farDt.getMonth() + 1).padStart(2, '0')}/${farDt.getFullYear()}`;
  const farParsed = parseExpiryInput(farMmYyyy);

  const demoBatches: Batch[] = [
    // Multiple batches for Paracetamol 650mg
    {
      id: 'bat_demo_1',
      shopId: DEMO_SHOP_ID,
      medicineId: 'med_demo_1',
      batchNumber: 'PC-401A',
      expiryRaw: exp5d,
      expiryType: 'FULL_DATE',
      expiryNormalizedDate: exp5d,
      quantity: 24,
      initialQuantity: 40,
      status: 'ACTIVE',
      lastCheckedAt: null,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'bat_demo_2',
      shopId: DEMO_SHOP_ID,
      medicineId: 'med_demo_1',
      batchNumber: 'PC-419B',
      expiryRaw: exp26d,
      expiryType: 'FULL_DATE',
      expiryNormalizedDate: exp26d,
      quantity: 60,
      initialQuantity: 60,
      status: 'ACTIVE',
      lastCheckedAt: null,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'bat_demo_3',
      shopId: DEMO_SHOP_ID,
      medicineId: 'med_demo_1',
      batchNumber: 'PC-508C',
      expiryRaw: futureParsed.expiryRaw,
      expiryType: futureParsed.expiryType,
      expiryNormalizedDate: futureParsed.expiryNormalizedDate,
      quantity: 120,
      initialQuantity: 120,
      status: 'ACTIVE',
      lastCheckedAt: now,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    // Multiple batches for Amoxicillin 500mg
    {
      id: 'bat_demo_4',
      shopId: DEMO_SHOP_ID,
      medicineId: 'med_demo_2',
      batchNumber: 'AMX-109',
      expiryRaw: expExpired,
      expiryType: 'FULL_DATE',
      expiryNormalizedDate: expExpired,
      quantity: 12,
      initialQuantity: 30,
      status: 'ACTIVE',
      lastCheckedAt: null,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'bat_demo_5',
      shopId: DEMO_SHOP_ID,
      medicineId: 'med_demo_2',
      batchNumber: 'AMX-214',
      expiryRaw: exp13d,
      expiryType: 'FULL_DATE',
      expiryNormalizedDate: exp13d,
      quantity: 35,
      initialQuantity: 50,
      status: 'ACTIVE',
      lastCheckedAt: null,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    // Cetirizine 10mg expiring in 26 days
    {
      id: 'bat_demo_6',
      shopId: DEMO_SHOP_ID,
      medicineId: 'med_demo_3',
      batchNumber: 'CTZ-88',
      expiryRaw: exp26d,
      expiryType: 'FULL_DATE',
      expiryNormalizedDate: exp26d,
      quantity: 45,
      initialQuantity: 50,
      status: 'ACTIVE',
      lastCheckedAt: null,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    // Omeprazole 20mg expiring in 13 days
    {
      id: 'bat_demo_7',
      shopId: DEMO_SHOP_ID,
      medicineId: 'med_demo_4',
      batchNumber: 'OMP-771',
      expiryRaw: exp13d,
      expiryType: 'FULL_DATE',
      expiryNormalizedDate: exp13d,
      quantity: 18,
      initialQuantity: 30,
      status: 'ACTIVE',
      lastCheckedAt: null,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    // Vitamin D3 far future MM/YYYY
    {
      id: 'bat_demo_8',
      shopId: DEMO_SHOP_ID,
      medicineId: 'med_demo_5',
      batchNumber: 'VD3-990',
      expiryRaw: farParsed.expiryRaw,
      expiryType: farParsed.expiryType,
      expiryNormalizedDate: farParsed.expiryNormalizedDate,
      quantity: 80,
      initialQuantity: 80,
      status: 'ACTIVE',
      lastCheckedAt: now,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    // Shop 2 batch
    {
      id: 'bat_demo2_1',
      shopId: DEMO_SHOP_2_ID,
      medicineId: 'med_demo2_1',
      batchNumber: 'GNT-001',
      expiryRaw: farParsed.expiryRaw,
      expiryType: farParsed.expiryType,
      expiryNormalizedDate: farParsed.expiryNormalizedDate,
      quantity: 50,
      initialQuantity: 50,
      status: 'ACTIVE',
      lastCheckedAt: null,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const demoActivities: StockActivity[] = [
    {
      id: 'act_demo_1',
      shopId: DEMO_SHOP_ID,
      batchId: 'bat_demo_1',
      medicineId: 'med_demo_1',
      medicineName: 'Paracetamol 650mg (DEMO)',
      batchNumber: 'PC-401A',
      actionType: 'CREATED',
      quantityDelta: 40,
      previousQuantity: 0,
      newQuantity: 40,
      note: 'DEMO DATA: Initial batch stock received',
      actorId: 'usr_demo_staff',
      actorName: 'Lakshmi Devi (Demo Staff)',
      actorRole: 'SHOPKEEPER',
      isDemo: true,
      createdAt: new Date(Date.now() - 86_400_000 * 3).toISOString(),
    },
    {
      id: 'act_demo_2',
      shopId: DEMO_SHOP_ID,
      batchId: 'bat_demo_1',
      medicineId: 'med_demo_1',
      medicineName: 'Paracetamol 650mg (DEMO)',
      batchNumber: 'PC-401A',
      actionType: 'SOLD',
      quantityDelta: -16,
      previousQuantity: 40,
      newQuantity: 24,
      note: 'DEMO DATA: Counter sales recorded',
      actorId: 'usr_demo_staff',
      actorName: 'Lakshmi Devi (Demo Staff)',
      actorRole: 'SHOPKEEPER',
      isDemo: true,
      createdAt: new Date(Date.now() - 86_400_000 * 1).toISOString(),
    },
    {
      id: 'act_demo_3',
      shopId: DEMO_SHOP_ID,
      batchId: 'bat_demo_5',
      medicineId: 'med_demo_2',
      medicineName: 'Amoxicillin 500mg (DEMO)',
      batchNumber: 'AMX-214',
      actionType: 'SOLD',
      quantityDelta: -15,
      previousQuantity: 50,
      newQuantity: 35,
      note: 'DEMO DATA: Prescription dispensed',
      actorId: 'usr_demo_staff',
      actorName: 'Lakshmi Devi (Demo Staff)',
      actorRole: 'SHOPKEEPER',
      isDemo: true,
      createdAt: new Date(Date.now() - 3_600_000 * 5).toISOString(),
    },
  ];

  const demoApprovals: ApprovalRequest[] = [
    {
      id: 'apr_demo_1',
      shopId: DEMO_SHOP_ID,
      batchId: 'bat_demo_7',
      medicineId: 'med_demo_4',
      medicineName: 'Omeprazole 20mg (DEMO)',
      batchNumber: 'OMP-771',
      requestType: 'QUANTITY_OVERRIDE',
      proposedQuantity: 15,
      reason: 'DEMO DATA: Physical shelf count found 3 damaged blister packs',
      status: 'PENDING',
      requestedById: 'usr_demo_staff',
      requestedByName: 'Lakshmi Devi (Demo Staff)',
      requestedAt: new Date(Date.now() - 3_600_000 * 2).toISOString(),
      decidedById: null,
      decidedByName: null,
      decisionNote: null,
      decidedAt: null,
      isDemo: true,
    },
  ];

  const db: DatabaseSchema = {
    shops,
    users,
    sessions: [],
    medicines: demoMedicines,
    batches: demoBatches,
    reminders: [],
    activities: demoActivities,
    approvals: demoApprovals,
  };

  syncRemindersOnDb(db, DEMO_SHOP_ID);
  syncRemindersOnDb(db, DEMO_SHOP_2_ID);
  return db;
}

function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seeded = createDemoSeedData();
    saveDb(seeded);
    return seeded;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DatabaseSchema;
}

function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpPath, DB_PATH);
}

let dbCache: DatabaseSchema = loadDb();

function commit(): void {
  saveDb(dbCache);
}

/**
 * Idempotently creates expiry reminders for active batches with quantity > 0.
 * Guarantees at most 1 reminder per (shopId, batchId, stage).
 */
function syncRemindersOnDb(db: DatabaseSchema, shopId: string): boolean {
  let changed = false;
  const shopBatches = db.batches.filter(
    (b) => b.shopId === shopId && b.status === 'ACTIVE' && b.quantity > 0
  );

  for (const batch of shopBatches) {
    const daysRemaining = computeDaysRemaining(batch.expiryNormalizedDate);
    const stage: ExpiryStage | null = getReminderStageForDays(daysRemaining);
    if (!stage) continue;

    const alreadyExists = db.reminders.some(
      (r) => r.shopId === shopId && r.batchId === batch.id && r.stage === stage
    );
    if (!alreadyExists) {
      db.reminders.push({
        id: makeId('rem'),
        shopId,
        batchId: batch.id,
        stage,
        daysRemainingAtTrigger: daysRemaining,
        triggeredAt: new Date().toISOString(),
        acknowledgedAt: null,
        acknowledgedByName: null,
        isDemo: batch.isDemo,
      });
      changed = true;
    }
  }
  return changed;
}

export function syncShopReminders(shopId: string): void {
  if (syncRemindersOnDb(dbCache, shopId)) {
    commit();
  }
}

export function enrichBatch(batch: Batch): EnrichedBatch {
  const med = dbCache.medicines.find(
    (m) => m.id === batch.medicineId && m.shopId === batch.shopId
  );
  const daysRemaining = computeDaysRemaining(batch.expiryNormalizedDate);
  return {
    ...batch,
    medicineName: med?.name ?? 'Unknown Medicine',
    manufacturer: med?.manufacturer ?? '',
    barcode: med?.barcode ?? '',
    category: med?.category ?? '',
    daysRemaining,
    expiryStatus: classifyExpiryStatus(daysRemaining),
  };
}

// ============================================================================
// AUTH & SHOP MANAGEMENT
// ============================================================================

export function authenticateSession(token: string): {
  user: UserPublic;
  shop: Shop;
} | null {
  const session = dbCache.sessions.find((s) => s.token === token);
  if (!session) return null;
  const user = dbCache.users.find(
    (u) => u.id === session.userId && u.shopId === session.shopId
  );
  if (!user || !user.active) return null;
  const shop = dbCache.shops.find((sh) => sh.id === user.shopId);
  if (!shop) return null;
  return { user: toPublicUser(user), shop };
}

export function loginWithCredentials(
  username: string,
  password: string
): { token: string; user: UserPublic; shop: Shop } {
  const cleanUser = username.trim().toLowerCase();
  const user = dbCache.users.find(
    (u) => u.username.toLowerCase() === cleanUser
  );
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('INVALID_CREDENTIALS');
  }
  if (!user.active) {
    throw new Error('ACCOUNT_DISABLED');
  }
  const shop = dbCache.shops.find((s) => s.id === user.shopId);
  if (!shop) {
    throw new Error('SHOP_NOT_FOUND');
  }

  const token = crypto.randomBytes(24).toString('hex');
  dbCache.sessions.push({
    token,
    userId: user.id,
    shopId: shop.id,
    createdAt: new Date().toISOString(),
  });
  syncRemindersOnDb(dbCache, shop.id);
  commit();
  return { token, user: toPublicUser(user), shop };
}

export function logoutSession(token: string): void {
  const idx = dbCache.sessions.findIndex((s) => s.token === token);
  if (idx !== -1) {
    dbCache.sessions.splice(idx, 1);
    commit();
  }
}

export function registerNewShopAndOwner(params: {
  shopName: string;
  address: string;
  ownerName: string;
  username: string;
  password: string;
}): { token: string; user: UserPublic; shop: Shop } {
  const cleanUsername = params.username.trim().toLowerCase();
  if (!params.shopName.trim() || !params.ownerName.trim() || !cleanUsername || params.password.length < 4) {
    throw new Error('INVALID_REGISTRATION_INPUT');
  }
  if (dbCache.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    throw new Error('USERNAME_TAKEN');
  }

  const now = new Date().toISOString();
  const shop: Shop = {
    id: makeId('shop'),
    name: params.shopName.trim(),
    address: params.address.trim(),
    isDemo: false,
    createdAt: now,
  };
  const owner: UserRecord = {
    id: makeId('usr'),
    shopId: shop.id,
    username: cleanUsername,
    displayName: params.ownerName.trim(),
    role: 'OWNER',
    active: true,
    isDemo: false,
    passwordHash: hashPassword(params.password),
    createdAt: now,
  };
  const token = crypto.randomBytes(24).toString('hex');
  dbCache.shops.push(shop);
  dbCache.users.push(owner);
  dbCache.sessions.push({
    token,
    userId: owner.id,
    shopId: shop.id,
    createdAt: now,
  });
  commit();
  return { token, user: toPublicUser(owner), shop };
}

// ============================================================================
// SHOPKEEPER MANAGEMENT (OWNER ONLY)
// ============================================================================

export function listShopkeepersForShop(shopId: string): UserPublic[] {
  return dbCache.users
    .filter((u) => u.shopId === shopId && u.role === 'SHOPKEEPER')
    .map(toPublicUser);
}

export function createShopkeeperAccount(
  shopId: string,
  params: { displayName: string; username: string; password: string }
): UserPublic {
  const cleanUsername = params.username.trim().toLowerCase();
  if (!params.displayName.trim() || !cleanUsername || params.password.length < 4) {
    throw new Error('INVALID_SHOPKEEPER_INPUT');
  }
  if (dbCache.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    throw new Error('USERNAME_TAKEN');
  }
  const shop = dbCache.shops.find((s) => s.id === shopId);
  const record: UserRecord = {
    id: makeId('usr'),
    shopId,
    username: cleanUsername,
    displayName: params.displayName.trim(),
    role: 'SHOPKEEPER',
    active: true,
    isDemo: Boolean(shop?.isDemo),
    passwordHash: hashPassword(params.password),
    createdAt: new Date().toISOString(),
  };
  dbCache.users.push(record);
  commit();
  return toPublicUser(record);
}

export function setShopkeeperActiveStatus(
  shopId: string,
  shopkeeperId: string,
  active: boolean
): UserPublic {
  const user = dbCache.users.find(
    (u) => u.id === shopkeeperId && u.shopId === shopId && u.role === 'SHOPKEEPER'
  );
  if (!user) {
    throw new Error('SHOPKEEPER_NOT_FOUND');
  }
  user.active = active;
  if (!active) {
    dbCache.sessions = dbCache.sessions.filter((s) => s.userId !== user.id);
  }
  commit();
  return toPublicUser(user);
}

// ============================================================================
// MEDICINES & BATCHES
// ============================================================================

export function listMedicinesForShop(shopId: string): Medicine[] {
  return dbCache.medicines
    .filter((m) => m.shopId === shopId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listBatchesForShop(shopId: string): EnrichedBatch[] {
  syncShopReminders(shopId);
  return dbCache.batches
    .filter((b) => b.shopId === shopId)
    .map(enrichBatch)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getBatchDetailForShop(
  shopId: string,
  batchId: string
): {
  batch: EnrichedBatch;
  activities: StockActivity[];
  reminders: ExpiryReminder[];
  approvals: ApprovalRequest[];
} {
  syncShopReminders(shopId);
  const batch = dbCache.batches.find(
    (b) => b.id === batchId && b.shopId === shopId
  );
  if (!batch) {
    throw new Error('BATCH_NOT_FOUND');
  }
  const activities = dbCache.activities
    .filter((a) => a.shopId === shopId && a.batchId === batchId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const reminders = dbCache.reminders
    .filter((r) => r.shopId === shopId && r.batchId === batchId)
    .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));
  const approvals = dbCache.approvals
    .filter((ap) => ap.shopId === shopId && ap.batchId === batchId)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

  return {
    batch: enrichBatch(batch),
    activities,
    reminders,
    approvals,
  };
}

export function addBatchToShop(
  actor: UserPublic,
  params: {
    medicineId?: string;
    medicineName: string;
    manufacturer?: string;
    barcode?: string;
    category?: string;
    batchNumber: string;
    expiryInput: string;
    quantity: number;
  }
): EnrichedBatch {
  const medName = params.medicineName.trim();
  const batchNo = params.batchNumber.trim();
  const qty = Number(params.quantity);

  if (!medName) throw new Error('MEDICINE_NAME_REQUIRED');
  if (!batchNo) throw new Error('BATCH_NUMBER_REQUIRED');
  if (!Number.isInteger(qty) || qty < 0) {
    throw new Error('INVALID_NEGATIVE_OR_FRACTIONAL_QUANTITY');
  }

  const parsedExpiry = parseExpiryInput(params.expiryInput);
  const shop = dbCache.shops.find((s) => s.id === actor.shopId);
  const now = new Date().toISOString();

  // Resolve or create medicine record (strictly separate from batch records)
  let medicine: Medicine | undefined;
  if (params.medicineId) {
    medicine = dbCache.medicines.find(
      (m) => m.id === params.medicineId && m.shopId === actor.shopId
    );
  }
  if (!medicine) {
    medicine = dbCache.medicines.find(
      (m) =>
        m.shopId === actor.shopId &&
        m.name.toLowerCase() === medName.toLowerCase()
    );
  }
  if (!medicine) {
    medicine = {
      id: makeId('med'),
      shopId: actor.shopId,
      name: medName,
      manufacturer: (params.manufacturer ?? '').trim(),
      barcode: (params.barcode ?? '').trim(),
      category: (params.category ?? '').trim(),
      isDemo: Boolean(shop?.isDemo),
      createdAt: now,
    };
    dbCache.medicines.push(medicine);
  } else {
    // Update optional catalog metadata only if currently empty
    if (!medicine.barcode && params.barcode?.trim()) {
      medicine.barcode = params.barcode.trim();
    }
    if (!medicine.manufacturer && params.manufacturer?.trim()) {
      medicine.manufacturer = params.manufacturer.trim();
    }
  }

  // Saving a new batch must NOT overwrite another batch of the same medicine
  const duplicateBatch = dbCache.batches.find(
    (b) =>
      b.shopId === actor.shopId &&
      b.medicineId === medicine!.id &&
      b.batchNumber.toLowerCase() === batchNo.toLowerCase() &&
      b.status === 'ACTIVE'
  );
  if (duplicateBatch) {
    throw new Error('DUPLICATE_BATCH_NUMBER');
  }

  const batch: Batch = {
    id: makeId('bat'),
    shopId: actor.shopId,
    medicineId: medicine.id,
    batchNumber: batchNo,
    expiryRaw: parsedExpiry.expiryRaw,
    expiryType: parsedExpiry.expiryType,
    expiryNormalizedDate: parsedExpiry.expiryNormalizedDate,
    quantity: qty,
    initialQuantity: qty,
    status: 'ACTIVE',
    lastCheckedAt: now,
    isDemo: Boolean(shop?.isDemo),
    createdAt: now,
    updatedAt: now,
  };
  dbCache.batches.push(batch);

  dbCache.activities.push({
    id: makeId('act'),
    shopId: actor.shopId,
    batchId: batch.id,
    medicineId: medicine.id,
    medicineName: medicine.name,
    batchNumber: batch.batchNumber,
    actionType: 'CREATED',
    quantityDelta: qty,
    previousQuantity: 0,
    newQuantity: qty,
    note: `Added batch ${batch.batchNumber} (Printed expiry: ${batch.expiryRaw})`,
    actorId: actor.id,
    actorName: actor.displayName,
    actorRole: actor.role,
    isDemo: batch.isDemo,
    createdAt: now,
  });

  syncRemindersOnDb(dbCache, actor.shopId);
  commit();
  return enrichBatch(batch);
}

export function performStockAction(
  actor: UserPublic,
  batchId: string,
  params: {
    actionType: Extract<
      StockActionType,
      'CHECKED' | 'STILL_AVAILABLE' | 'SOLD' | 'DAMAGED' | 'REMOVED'
    >;
    quantity?: number;
    note?: string;
  }
): EnrichedBatch {
  const batch = dbCache.batches.find(
    (b) => b.id === batchId && b.shopId === actor.shopId
  );
  if (!batch) throw new Error('BATCH_NOT_FOUND');
  if (batch.status !== 'ACTIVE') throw new Error('BATCH_ARCHIVED');

  const med = dbCache.medicines.find(
    (m) => m.id === batch.medicineId && m.shopId === actor.shopId
  );
  const prevQty = batch.quantity;
  let delta = 0;

  if (
    params.actionType === 'SOLD' ||
    params.actionType === 'DAMAGED' ||
    params.actionType === 'REMOVED'
  ) {
    const qty = Number(params.quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error('ACTION_QUANTITY_MUST_BE_POSITIVE');
    }
    if (prevQty - qty < 0) {
      throw new Error('NEGATIVE_STOCK_NOT_ALLOWED');
    }
    delta = -qty;
  }

  const newQty = prevQty + delta;
  const now = new Date().toISOString();
  batch.quantity = newQty;
  batch.lastCheckedAt = now;
  batch.updatedAt = now;

  dbCache.activities.push({
    id: makeId('act'),
    shopId: actor.shopId,
    batchId: batch.id,
    medicineId: batch.medicineId,
    medicineName: med?.name ?? 'Unknown Medicine',
    batchNumber: batch.batchNumber,
    actionType: params.actionType,
    quantityDelta: delta,
    previousQuantity: prevQty,
    newQuantity: newQty,
    note: (params.note ?? '').trim() || `Marked ${params.actionType.toLowerCase().replace('_', ' ')}`,
    actorId: actor.id,
    actorName: actor.displayName,
    actorRole: actor.role,
    isDemo: batch.isDemo,
    createdAt: now,
  });

  syncRemindersOnDb(dbCache, actor.shopId);
  commit();
  return enrichBatch(batch);
}

/**
 * OWNER ONLY direct edit of batch metadata or stock override.
 */
export function ownerEditBatch(
  owner: UserPublic,
  batchId: string,
  params: {
    batchNumber?: string;
    expiryInput?: string;
    quantity?: number;
    status?: 'ACTIVE' | 'ARCHIVED';
    note?: string;
  }
): EnrichedBatch {
  if (owner.role !== 'OWNER') {
    throw new Error('OWNER_ONLY_ACTION');
  }
  const batch = dbCache.batches.find(
    (b) => b.id === batchId && b.shopId === owner.shopId
  );
  if (!batch) throw new Error('BATCH_NOT_FOUND');

  const med = dbCache.medicines.find(
    (m) => m.id === batch.medicineId && m.shopId === owner.shopId
  );
  const prevQty = batch.quantity;
  const changes: string[] = [];

  if (params.batchNumber !== undefined && params.batchNumber.trim() !== batch.batchNumber) {
    const nextNo = params.batchNumber.trim();
    if (!nextNo) throw new Error('BATCH_NUMBER_REQUIRED');
    const conflict = dbCache.batches.find(
      (b) =>
        b.id !== batch.id &&
        b.shopId === owner.shopId &&
        b.medicineId === batch.medicineId &&
        b.batchNumber.toLowerCase() === nextNo.toLowerCase() &&
        b.status === 'ACTIVE'
    );
    if (conflict) throw new Error('DUPLICATE_BATCH_NUMBER');
    changes.push(`batch ${batch.batchNumber} -> ${nextNo}`);
    batch.batchNumber = nextNo;
  }

  if (params.expiryInput !== undefined && params.expiryInput.trim() !== '') {
    const parsed = parseExpiryInput(params.expiryInput);
    if (parsed.expiryRaw !== batch.expiryRaw) {
      changes.push(`expiry ${batch.expiryRaw} -> ${parsed.expiryRaw}`);
      batch.expiryRaw = parsed.expiryRaw;
      batch.expiryType = parsed.expiryType;
      batch.expiryNormalizedDate = parsed.expiryNormalizedDate;
      // Clear stale reminders for this batch so fresh stage reminders evaluate accurately
      dbCache.reminders = dbCache.reminders.filter(
        (r) => !(r.shopId === owner.shopId && r.batchId === batch.id)
      );
    }
  }

  if (params.quantity !== undefined) {
    const nextQty = Number(params.quantity);
    if (!Number.isInteger(nextQty) || nextQty < 0) {
      throw new Error('NEGATIVE_STOCK_NOT_ALLOWED');
    }
    if (nextQty !== prevQty) {
      changes.push(`qty ${prevQty} -> ${nextQty}`);
      batch.quantity = nextQty;
    }
  }

  if (params.status !== undefined && params.status !== batch.status) {
    changes.push(`status ${batch.status} -> ${params.status}`);
    batch.status = params.status;
  }

  const now = new Date().toISOString();
  batch.updatedAt = now;

  dbCache.activities.push({
    id: makeId('act'),
    shopId: owner.shopId,
    batchId: batch.id,
    medicineId: batch.medicineId,
    medicineName: med?.name ?? 'Unknown Medicine',
    batchNumber: batch.batchNumber,
    actionType: 'OWNER_EDIT',
    quantityDelta: batch.quantity - prevQty,
    previousQuantity: prevQty,
    newQuantity: batch.quantity,
    note:
      (params.note ?? '').trim() ||
      (changes.length > 0 ? `Owner edit: ${changes.join(', ')}` : 'Owner verified batch'),
    actorId: owner.id,
    actorName: owner.displayName,
    actorRole: owner.role,
    isDemo: batch.isDemo,
    createdAt: now,
  });

  syncRemindersOnDb(dbCache, owner.shopId);
  commit();
  return enrichBatch(batch);
}

// ============================================================================
// APPROVAL REQUESTS
// ============================================================================

export function listApprovalsForShop(shopId: string): ApprovalRequest[] {
  return dbCache.approvals
    .filter((a) => a.shopId === shopId)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export function createApprovalRequest(
  actor: UserPublic,
  params: {
    batchId: string;
    requestType: ApprovalRequestType;
    proposedBatchNumber?: string;
    proposedExpiryInput?: string;
    proposedQuantity?: number;
    reason: string;
  }
): ApprovalRequest {
  const batch = dbCache.batches.find(
    (b) => b.id === params.batchId && b.shopId === actor.shopId
  );
  if (!batch) throw new Error('BATCH_NOT_FOUND');

  const med = dbCache.medicines.find(
    (m) => m.id === batch.medicineId && m.shopId === actor.shopId
  );
  if (!params.reason.trim()) {
    throw new Error('REASON_REQUIRED');
  }

  let proposedExpiryRaw: string | undefined;
  if (params.requestType === 'EDIT_BATCH' && params.proposedExpiryInput?.trim()) {
    const parsed = parseExpiryInput(params.proposedExpiryInput);
    proposedExpiryRaw = parsed.expiryRaw;
  }

  if (params.requestType === 'QUANTITY_OVERRIDE') {
    const qty = Number(params.proposedQuantity);
    if (!Number.isInteger(qty) || qty < 0) {
      throw new Error('NEGATIVE_STOCK_NOT_ALLOWED');
    }
  }

  const reqRecord: ApprovalRequest = {
    id: makeId('apr'),
    shopId: actor.shopId,
    batchId: batch.id,
    medicineId: batch.medicineId,
    medicineName: med?.name ?? 'Unknown Medicine',
    batchNumber: batch.batchNumber,
    requestType: params.requestType,
    proposedBatchNumber: params.proposedBatchNumber?.trim() || undefined,
    proposedExpiryRaw,
    proposedQuantity:
      params.proposedQuantity !== undefined ? Number(params.proposedQuantity) : undefined,
    reason: params.reason.trim(),
    status: 'PENDING',
    requestedById: actor.id,
    requestedByName: actor.displayName,
    requestedAt: new Date().toISOString(),
    decidedById: null,
    decidedByName: null,
    decisionNote: null,
    decidedAt: null,
    isDemo: batch.isDemo,
  };

  dbCache.approvals.push(reqRecord);
  commit();
  return reqRecord;
}

export function decideApprovalRequest(
  owner: UserPublic,
  approvalId: string,
  decision: 'APPROVED' | 'REJECTED',
  decisionNote?: string
): ApprovalRequest {
  if (owner.role !== 'OWNER') {
    throw new Error('OWNER_ONLY_ACTION');
  }
  const reqRecord = dbCache.approvals.find(
    (a) => a.id === approvalId && a.shopId === owner.shopId
  );
  if (!reqRecord) throw new Error('APPROVAL_NOT_FOUND');
  if (reqRecord.status !== 'PENDING') {
    throw new Error('APPROVAL_ALREADY_DECIDED');
  }

  const now = new Date().toISOString();
  reqRecord.status = decision;
  reqRecord.decidedById = owner.id;
  reqRecord.decidedByName = owner.displayName;
  reqRecord.decisionNote = (decisionNote ?? '').trim() || null;
  reqRecord.decidedAt = now;

  if (decision === 'APPROVED') {
    const batch = dbCache.batches.find(
      (b) => b.id === reqRecord.batchId && b.shopId === owner.shopId
    );
    if (batch) {
      const prevQty = batch.quantity;
      if (reqRecord.requestType === 'QUANTITY_OVERRIDE' && reqRecord.proposedQuantity !== undefined) {
        if (reqRecord.proposedQuantity < 0) throw new Error('NEGATIVE_STOCK_NOT_ALLOWED');
        batch.quantity = reqRecord.proposedQuantity;
      } else if (reqRecord.requestType === 'EDIT_BATCH') {
        if (reqRecord.proposedBatchNumber) {
          batch.batchNumber = reqRecord.proposedBatchNumber;
        }
        if (reqRecord.proposedExpiryRaw) {
          const parsed = parseExpiryInput(reqRecord.proposedExpiryRaw);
          batch.expiryRaw = parsed.expiryRaw;
          batch.expiryType = parsed.expiryType;
          batch.expiryNormalizedDate = parsed.expiryNormalizedDate;
          dbCache.reminders = dbCache.reminders.filter(
            (r) => !(r.shopId === owner.shopId && r.batchId === batch.id)
          );
        }
      } else if (reqRecord.requestType === 'ARCHIVE_BATCH') {
        batch.status = 'ARCHIVED';
      }
      batch.updatedAt = now;

      dbCache.activities.push({
        id: makeId('act'),
        shopId: owner.shopId,
        batchId: batch.id,
        medicineId: batch.medicineId,
        medicineName: reqRecord.medicineName,
        batchNumber: batch.batchNumber,
        actionType: 'APPROVAL_APPLIED',
        quantityDelta: batch.quantity - prevQty,
        previousQuantity: prevQty,
        newQuantity: batch.quantity,
        note: `Approved ${reqRecord.requestType} requested by ${reqRecord.requestedByName}: ${reqRecord.reason}`,
        actorId: owner.id,
        actorName: owner.displayName,
        actorRole: owner.role,
        isDemo: batch.isDemo,
        createdAt: now,
      });
      syncRemindersOnDb(dbCache, owner.shopId);
    }
  } else {
    // Log rejection in immutable activity history for transparency
    const batch = dbCache.batches.find(
      (b) => b.id === reqRecord.batchId && b.shopId === owner.shopId
    );
    const currentQty = batch?.quantity ?? 0;
    dbCache.activities.push({
      id: makeId('act'),
      shopId: owner.shopId,
      batchId: reqRecord.batchId,
      medicineId: reqRecord.medicineId,
      medicineName: reqRecord.medicineName,
      batchNumber: reqRecord.batchNumber,
      actionType: 'CHECKED',
      quantityDelta: 0,
      previousQuantity: currentQty,
      newQuantity: currentQty,
      note: `Rejected ${reqRecord.requestType} requested by ${reqRecord.requestedByName}${reqRecord.decisionNote ? ` (${reqRecord.decisionNote})` : ''}`,
      actorId: owner.id,
      actorName: owner.displayName,
      actorRole: owner.role,
      isDemo: reqRecord.isDemo,
      createdAt: now,
    });
  }

  commit();
  return reqRecord;
}

// ============================================================================
// ALERTS, DASHBOARD, ACTIVITY & REPORTS
// ============================================================================

export function getAlertsForShop(shopId: string): {
  upcomingReminders: EnrichedReminder[];
  expiredBatches: EnrichedBatch[];
} {
  syncShopReminders(shopId);

  const enrichedReminders: EnrichedReminder[] = [];
  for (const rem of dbCache.reminders) {
    if (rem.shopId !== shopId || rem.stage === 'EXPIRED') continue;
    const batch = dbCache.batches.find(
      (b) => b.id === rem.batchId && b.shopId === shopId
    );
    if (!batch || batch.status !== 'ACTIVE' || batch.quantity <= 0) continue;
    const med = dbCache.medicines.find(
      (m) => m.id === batch.medicineId && m.shopId === shopId
    );
    const daysRemaining = computeDaysRemaining(batch.expiryNormalizedDate);
    if (daysRemaining < 0) continue; // Handled in expiredBatches section

    enrichedReminders.push({
      ...rem,
      medicineId: batch.medicineId,
      medicineName: med?.name ?? 'Unknown Medicine',
      manufacturer: med?.manufacturer ?? '',
      batchNumber: batch.batchNumber,
      expiryRaw: batch.expiryRaw,
      expiryType: batch.expiryType,
      expiryNormalizedDate: batch.expiryNormalizedDate,
      quantity: batch.quantity,
      daysRemaining,
      batchStatus: batch.status,
    });
  }

  enrichedReminders.sort((a, b) => a.daysRemaining - b.daysRemaining);

  const expiredBatches = dbCache.batches
    .filter((b) => b.shopId === shopId && b.status === 'ACTIVE' && b.quantity > 0)
    .map(enrichBatch)
    .filter((b) => b.daysRemaining < 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return {
    upcomingReminders: enrichedReminders,
    expiredBatches,
  };
}

export function acknowledgeReminder(
  actor: UserPublic,
  reminderId: string
): ExpiryReminder {
  const rem = dbCache.reminders.find(
    (r) => r.id === reminderId && r.shopId === actor.shopId
  );
  if (!rem) throw new Error('REMINDER_NOT_FOUND');
  rem.acknowledgedAt = new Date().toISOString();
  rem.acknowledgedByName = actor.displayName;
  commit();
  return rem;
}

export function getDashboardSummary(shopId: string): DashboardSummary {
  syncShopReminders(shopId);
  const batches = dbCache.batches
    .filter((b) => b.shopId === shopId && b.status === 'ACTIVE')
    .map(enrichBatch);

  const withStock = batches.filter((b) => b.quantity > 0);
  const expiring30 = withStock.filter((b) => b.expiryStatus === '30_DAYS');
  const expiring15 = withStock.filter((b) => b.expiryStatus === '15_DAYS');
  const expiring7 = withStock.filter((b) => b.expiryStatus === '7_DAYS');
  const expired = withStock.filter((b) => b.expiryStatus === 'EXPIRED');
  const outOfStock = batches.filter((b) => b.quantity === 0);

  const pendingApprovalsCount = dbCache.approvals.filter(
    (a) => a.shopId === shopId && a.status === 'PENDING'
  ).length;

  const activeBatchIds = new Set(withStock.map((b) => b.id));
  const unacknowledgedRemindersCount = dbCache.reminders.filter(
    (r) =>
      r.shopId === shopId &&
      activeBatchIds.has(r.batchId) &&
      !r.acknowledgedAt
  ).length;

  const recentActivities = dbCache.activities
    .filter((a) => a.shopId === shopId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return {
    totalActiveBatches: withStock.length,
    totalActiveUnits: withStock.reduce((sum, b) => sum + b.quantity, 0),
    totalMedicines: dbCache.medicines.filter((m) => m.shopId === shopId).length,
    expiring30Count: expiring30.length,
    expiring15Count: expiring15.length,
    expiring7Count: expiring7.length,
    expiringSoonTotal: expiring30.length + expiring15.length + expiring7.length,
    expiredBatchesCount: expired.length,
    expiredUnitsCount: expired.reduce((sum, b) => sum + b.quantity, 0),
    outOfStockBatchesCount: outOfStock.length,
    pendingApprovalsCount,
    unacknowledgedRemindersCount,
    recentActivities,
  };
}

export function listActivitiesForShop(shopId: string): StockActivity[] {
  return dbCache.activities
    .filter((a) => a.shopId === shopId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReportsForShop(shopId: string): ReportsSummary {
  const batches = dbCache.batches
    .filter((b) => b.shopId === shopId && b.status === 'ACTIVE' && b.quantity > 0)
    .map(enrichBatch)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const upcoming7 = batches.filter((b) => b.expiryStatus === '7_DAYS');
  const upcoming15 = batches.filter((b) => b.expiryStatus === '15_DAYS');
  const upcoming30 = batches.filter((b) => b.expiryStatus === '30_DAYS');
  const expiredBatches = batches.filter((b) => b.expiryStatus === 'EXPIRED');

  const activities = dbCache.activities
    .filter((a) => a.shopId === shopId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  let soldUnits = 0;
  let damagedUnits = 0;
  let removedUnits = 0;
  let checkedCount = 0;
  let stillAvailableCount = 0;

  for (const act of activities) {
    if (act.actionType === 'SOLD') soldUnits += Math.abs(act.quantityDelta);
    if (act.actionType === 'DAMAGED') damagedUnits += Math.abs(act.quantityDelta);
    if (act.actionType === 'REMOVED') removedUnits += Math.abs(act.quantityDelta);
    if (act.actionType === 'CHECKED') checkedCount += 1;
    if (act.actionType === 'STILL_AVAILABLE') stillAvailableCount += 1;
  }

  return {
    upcoming7,
    upcoming15,
    upcoming30,
    expiredBatches,
    actionTotals: {
      soldUnits,
      damagedUnits,
      removedUnits,
      checkedCount,
      stillAvailableCount,
    },
    recentAdjustments: activities.slice(0, 30),
  };
}

export function resetDemoShopData(owner: UserPublic): void {
  if (owner.role !== 'OWNER') {
    throw new Error('OWNER_ONLY_ACTION');
  }
  const shop = dbCache.shops.find((s) => s.id === owner.shopId);
  if (!shop || !shop.isDemo) {
    throw new Error('ONLY_DEMO_SHOP_CAN_RESET');
  }

  const fresh = createDemoSeedData();
  const targetShopId = owner.shopId;

  dbCache.medicines = dbCache.medicines
    .filter((m) => m.shopId !== targetShopId)
    .concat(fresh.medicines.filter((m) => m.shopId === targetShopId));
  dbCache.batches = dbCache.batches
    .filter((b) => b.shopId !== targetShopId)
    .concat(fresh.batches.filter((b) => b.shopId === targetShopId));
  dbCache.reminders = dbCache.reminders
    .filter((r) => r.shopId !== targetShopId)
    .concat(fresh.reminders.filter((r) => r.shopId === targetShopId));
  dbCache.activities = dbCache.activities
    .filter((a) => a.shopId !== targetShopId)
    .concat(fresh.activities.filter((a) => a.shopId === targetShopId));
  dbCache.approvals = dbCache.approvals
    .filter((ap) => ap.shopId !== targetShopId)
    .concat(fresh.approvals.filter((ap) => ap.shopId === targetShopId));

  commit();
}
