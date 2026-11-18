# PharmaShelf

Batch-wise pharmacy inventory, expiry reminder, and approval workflow application built with React, Vite, Tailwind CSS, and Express.

## Key Features

- **Batch-wise Inventory Tracking**: Separate medicine catalog and batch records (`MM/YYYY` normalized to the last calendar day of the month while preserving printed dates), low-stock highlighting with configurable threshold, and barcode/photo pack OCR extraction via Gemini.
- **Role-Based Access Control**: Multi-tenant shop isolation with separate **Shop Owner** and **Shopkeeper** logins, stock action audit history (`SOLD`, `DAMAGED`, `REMOVED`, `CHECKED`), and Owner approval requests.
- **Expiry Alerts & Notifications**: Automated 30 / 15 / 7-day and expired alerts inside the app Notification Bell and Alerts screen, plus opt-in browser/device notifications.
- **Reports & Exports**: 6-month upcoming expiry forecast chart (Recharts), CSV export, and formatted PDF summary report export (`jsPDF`).
- **Mobile PWA & Bilingual UI**: Installable Progressive Web App with offline caching, Light/Dark Liquid Morphism UI, and full **English & Telugu** language support.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (copy `.env.example` to `.env` if using pack photo OCR):
   ```bash
   cp .env.example .env
   ```
   Set `GEMINI_API_KEY` in `.env` to enable medicine pack photo OCR.

3. Start the development server on port `3000`:
   ```bash
   npm run dev
   ```

## Production Build

```bash
npm run build
npm start
```
