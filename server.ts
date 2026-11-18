import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import type { Shop, UserPublic } from './src/types.ts';
import {
  acknowledgeReminder,
  addBatchToShop,
  authenticateSession,
  createApprovalRequest,
  createShopkeeperAccount,
  decideApprovalRequest,
  getAlertsForShop,
  getBatchDetailForShop,
  getDashboardSummary,
  getReportsForShop,
  listActivitiesForShop,
  listApprovalsForShop,
  listBatchesForShop,
  listMedicinesForShop,
  listShopkeepersForShop,
  loginWithCredentials,
  logoutSession,
  ownerEditBatch,
  performStockAction,
  registerNewShopAndOwner,
  resetDemoShopData,
  setShopkeeperActiveStatus,
} from './server/db.ts';
import { extractMedicinePackFromImage } from './server/geminiOcr.ts';

interface AuthedRequest extends Request {
  authUser?: UserPublic;
  authShop?: Shop;
  authToken?: string;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [k, ...rest] = part.trim().split('=');
      if (k === 'pharma_token') {
        return decodeURIComponent(rest.join('='));
      }
    }
  }
  return null;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Authentication required.' });
    return;
  }
  const auth = authenticateSession(token);
  if (!auth) {
    res.status(401).json({ error: 'SESSION_INVALID', message: 'Session expired or invalid.' });
    return;
  }
  req.authUser = auth.user;
  req.authShop = auth.shop;
  req.authToken = token;
  next();
}

function requireOwner(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (!req.authUser || req.authUser.role !== 'OWNER') {
    res.status(403).json({
      error: 'OWNER_ONLY_ACTION',
      message: 'Only the Shop Owner is permitted to perform this action.',
    });
    return;
  }
  next();
}

function mapErrorStatus(code: string): number {
  switch (code) {
    case 'INVALID_CREDENTIALS':
    case 'AUTH_REQUIRED':
    case 'SESSION_INVALID':
      return 401;
    case 'OWNER_ONLY_ACTION':
    case 'ACCOUNT_DISABLED':
      return 403;
    case 'BATCH_NOT_FOUND':
    case 'SHOP_NOT_FOUND':
    case 'SHOPKEEPER_NOT_FOUND':
    case 'APPROVAL_NOT_FOUND':
    case 'REMINDER_NOT_FOUND':
      return 404;
    case 'DUPLICATE_BATCH_NUMBER':
    case 'USERNAME_TAKEN':
    case 'APPROVAL_ALREADY_DECIDED':
      return 409;
    case 'OCR_NOT_CONFIGURED':
      return 503;
    default:
      return 400;
  }
}

function handleRouteError(res: Response, err: unknown): void {
  const code = err instanceof Error ? err.message : 'INTERNAL_ERROR';
  const status = mapErrorStatus(code);
  res.status(status).json({ error: code, message: code });
}

function setSessionCookie(res: Response, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `pharma_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  );
}

function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    'pharma_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // --------------------------------------------------------------------------
  // AUTH ROUTES
  // --------------------------------------------------------------------------
  app.post('/api/auth/register-shop', (req, res) => {
    try {
      const { shopName, address, ownerName, username, password } = req.body ?? {};
      const result = registerNewShopAndOwner({
        shopName: String(shopName ?? ''),
        address: String(address ?? ''),
        ownerName: String(ownerName ?? ''),
        username: String(username ?? ''),
        password: String(password ?? ''),
      });
      setSessionCookie(res, result.token);
      res.status(201).json(result);
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { username, password } = req.body ?? {};
      const result = loginWithCredentials(String(username ?? ''), String(password ?? ''));
      setSessionCookie(res, result.token);
      res.json(result);
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/auth/logout', (req: AuthedRequest, res) => {
    const token = extractToken(req);
    if (token) {
      logoutSession(token);
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
    res.json({
      user: req.authUser,
      shop: req.authShop,
    });
  });

  // --------------------------------------------------------------------------
  // DASHBOARD & MEDICINES & BATCHES
  // --------------------------------------------------------------------------
  app.get('/api/dashboard', requireAuth, (req: AuthedRequest, res) => {
    try {
      res.json(getDashboardSummary(req.authUser!.shopId));
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.get('/api/medicines', requireAuth, (req: AuthedRequest, res) => {
    try {
      res.json({ medicines: listMedicinesForShop(req.authUser!.shopId) });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.get('/api/batches', requireAuth, (req: AuthedRequest, res) => {
    try {
      res.json({ batches: listBatchesForShop(req.authUser!.shopId) });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/batches', requireAuth, (req: AuthedRequest, res) => {
    try {
      const body = req.body ?? {};
      const batch = addBatchToShop(req.authUser!, {
        medicineId: body.medicineId ? String(body.medicineId) : undefined,
        medicineName: String(body.medicineName ?? ''),
        manufacturer: body.manufacturer ? String(body.manufacturer) : '',
        barcode: body.barcode ? String(body.barcode) : '',
        category: body.category ? String(body.category) : '',
        batchNumber: String(body.batchNumber ?? ''),
        expiryInput: String(body.expiryInput ?? ''),
        quantity: Number(body.quantity),
      });
      res.status(201).json({ batch });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.get('/api/batches/:id', requireAuth, (req: AuthedRequest, res) => {
    try {
      const detail = getBatchDetailForShop(req.authUser!.shopId, String(req.params.id));
      res.json(detail);
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/batches/:id/actions', requireAuth, (req: AuthedRequest, res) => {
    try {
      const body = req.body ?? {};
      const actionType = String(body.actionType ?? '');
      if (
        !['CHECKED', 'STILL_AVAILABLE', 'SOLD', 'DAMAGED', 'REMOVED'].includes(actionType)
      ) {
        res.status(400).json({ error: 'INVALID_ACTION_TYPE' });
        return;
      }
      const batch = performStockAction(req.authUser!, String(req.params.id), {
        actionType: actionType as
          | 'CHECKED'
          | 'STILL_AVAILABLE'
          | 'SOLD'
          | 'DAMAGED'
          | 'REMOVED',
        quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
        note: body.note ? String(body.note) : undefined,
      });
      res.json({ batch });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  // OWNER ONLY direct edit
  app.patch('/api/batches/:id', requireAuth, requireOwner, (req: AuthedRequest, res) => {
    try {
      const body = req.body ?? {};
      const batch = ownerEditBatch(req.authUser!, String(req.params.id), {
        batchNumber: body.batchNumber !== undefined ? String(body.batchNumber) : undefined,
        expiryInput: body.expiryInput !== undefined ? String(body.expiryInput) : undefined,
        quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
        status:
          body.status === 'ACTIVE' || body.status === 'ARCHIVED'
            ? body.status
            : undefined,
        note: body.note !== undefined ? String(body.note) : undefined,
      });
      res.json({ batch });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  // --------------------------------------------------------------------------
  // ALERTS, APPROVALS, ACTIVITY, REPORTS
  // --------------------------------------------------------------------------
  app.get('/api/alerts', requireAuth, (req: AuthedRequest, res) => {
    try {
      res.json(getAlertsForShop(req.authUser!.shopId));
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/alerts/:id/acknowledge', requireAuth, (req: AuthedRequest, res) => {
    try {
      const reminder = acknowledgeReminder(req.authUser!, String(req.params.id));
      res.json({ reminder });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.get('/api/approvals', requireAuth, (req: AuthedRequest, res) => {
    try {
      res.json({ approvals: listApprovalsForShop(req.authUser!.shopId) });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/approvals', requireAuth, (req: AuthedRequest, res) => {
    try {
      const body = req.body ?? {};
      const reqType = String(body.requestType ?? '');
      if (!['EDIT_BATCH', 'QUANTITY_OVERRIDE', 'ARCHIVE_BATCH'].includes(reqType)) {
        res.status(400).json({ error: 'INVALID_REQUEST_TYPE' });
        return;
      }
      const approval = createApprovalRequest(req.authUser!, {
        batchId: String(body.batchId ?? ''),
        requestType: reqType as 'EDIT_BATCH' | 'QUANTITY_OVERRIDE' | 'ARCHIVE_BATCH',
        proposedBatchNumber: body.proposedBatchNumber
          ? String(body.proposedBatchNumber)
          : undefined,
        proposedExpiryInput: body.proposedExpiryInput
          ? String(body.proposedExpiryInput)
          : undefined,
        proposedQuantity:
          body.proposedQuantity !== undefined ? Number(body.proposedQuantity) : undefined,
        reason: String(body.reason ?? ''),
      });
      res.status(201).json({ approval });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/approvals/:id/decide', requireAuth, requireOwner, (req: AuthedRequest, res) => {
    try {
      const body = req.body ?? {};
      const decision = String(body.decision ?? '');
      if (decision !== 'APPROVED' && decision !== 'REJECTED') {
        res.status(400).json({ error: 'INVALID_DECISION' });
        return;
      }
      const approval = decideApprovalRequest(
        req.authUser!,
        String(req.params.id),
        decision,
        body.decisionNote ? String(body.decisionNote) : undefined
      );
      res.json({ approval });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.get('/api/activity', requireAuth, (req: AuthedRequest, res) => {
    try {
      res.json({ activities: listActivitiesForShop(req.authUser!.shopId) });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.get('/api/reports', requireAuth, (req: AuthedRequest, res) => {
    try {
      res.json(getReportsForShop(req.authUser!.shopId));
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  // --------------------------------------------------------------------------
  // SHOPKEEPER ACCESS MANAGEMENT (OWNER ONLY)
  // --------------------------------------------------------------------------
  app.get('/api/shopkeepers', requireAuth, requireOwner, (req: AuthedRequest, res) => {
    try {
      res.json({ shopkeepers: listShopkeepersForShop(req.authUser!.shopId) });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/shopkeepers', requireAuth, requireOwner, (req: AuthedRequest, res) => {
    try {
      const body = req.body ?? {};
      const shopkeeper = createShopkeeperAccount(req.authUser!.shopId, {
        displayName: String(body.displayName ?? ''),
        username: String(body.username ?? ''),
        password: String(body.password ?? ''),
      });
      res.status(201).json({ shopkeeper });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.patch('/api/shopkeepers/:id', requireAuth, requireOwner, (req: AuthedRequest, res) => {
    try {
      const body = req.body ?? {};
      const shopkeeper = setShopkeeperActiveStatus(
        req.authUser!.shopId,
        String(req.params.id),
        Boolean(body.active)
      );
      res.json({ shopkeeper });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  // --------------------------------------------------------------------------
  // DEMO RESET & PACK PHOTO OCR
  // --------------------------------------------------------------------------
  app.post('/api/demo/reset', requireAuth, requireOwner, (req: AuthedRequest, res) => {
    try {
      resetDemoShopData(req.authUser!);
      res.json({ ok: true });
    } catch (err) {
      handleRouteError(res, err);
    }
  });

  app.post('/api/ocr/extract-pack', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const { imageBase64, mimeType } = req.body ?? {};
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'IMAGE_REQUIRED' });
        return;
      }
      const extracted = await extractMedicinePackFromImage(
        imageBase64,
        typeof mimeType === 'string' ? mimeType : 'image/jpeg'
      );
      res.json({ extracted });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OCR_FAILED';
      if (msg === 'OCR_NOT_CONFIGURED') {
        res.status(503).json({
          error: 'OCR_NOT_CONFIGURED',
          message: 'Pack photo OCR is not configured on the server.',
        });
        return;
      }
      res.status(500).json({
        error: 'OCR_FAILED',
        message: msg,
      });
    }
  });

  // --------------------------------------------------------------------------
  // FRONTEND SERVING (VITE MIDDLEWARE IN DEV / DIST IN PROD)
  // --------------------------------------------------------------------------
  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(process.cwd(), 'dist');

  if (!isProd || !fs.existsSync(distDir)) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`PharmaShelf server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
