import type { Language } from './types';

export interface Translations {
  appTitle: string;
  demoBanner: string;
  demoTag: string;
  roleOwner: string;
  roleShopkeeper: string;
  nav: {
    dashboard: string;
    inventory: string;
    addMedicine: string;
    alerts: string;
    approvals: string;
    activity: string;
    reports: string;
    settings: string;
    more: string;
  };
  auth: {
    subtitle: string;
    signInTab: string;
    createShopTab: string;
    username: string;
    password: string;
    signInBtn: string;
    signingIn: string;
    shopName: string;
    shopAddress: string;
    ownerName: string;
    createShopBtn: string;
    creatingShop: string;
    demoAccessTitle: string;
    demoAccessDesc: string;
    demoOwnerBtn: string;
    demoStaffBtn: string;
    signOut: string;
  };
  dashboard: {
    title: string;
    activeBatches: string;
    activeUnits: string;
    expiringSoon: string;
    expiredBatches: string;
    pendingApprovals: string;
    medicinesTracked: string;
    expiryBreakdown: string;
    within7Days: string;
    within15Days: string;
    within30Days: string;
    alreadyExpired: string;
    quickActions: string;
    addNewBatch: string;
    reviewAlerts: string;
    checkInventory: string;
    reviewApprovals: string;
    recentActivity: string;
    viewAllActivity: string;
    noActivityYet: string;
    units: string;
    batches: string;
  };
  addMedicine: {
    title: string;
    subtitle: string;
    modeManual: string;
    modeBarcode: string;
    modePhoto: string;
    barcodeExplainTitle: string;
    barcodeExplainBody: string;
    startCamera: string;
    stopCamera: string;
    scanOrEnterBarcode: string;
    lookupBarcode: string;
    barcodeMatched: string;
    barcodeNotFound: string;
    barcodeNoBatchNote: string;
    cameraUnavailable: string;
    photoExplainTitle: string;
    photoExplainBody: string;
    uploadOrCapturePhoto: string;
    extractingText: string;
    ocrSuccessBanner: string;
    ocrUnavailable: string;
    confirmDetectedHeading: string;
    confirmCheckboxLabel: string;
    medicineName: string;
    existingMedicineHint: string;
    selectExisting: string;
    manufacturer: string;
    category: string;
    barcodeLabel: string;
    batchNumber: string;
    expiryDate: string;
    expiryPlaceholder: string;
    expiryRuleNote: string;
    interpretedCutoff: string;
    quantity: string;
    saveBatch: string;
    saving: string;
    batchSavedSuccess: string;
    addAnother: string;
    viewInventory: string;
  };
  inventory: {
    title: string;
    searchPlaceholder: string;
    filterAll: string;
    filterSafe: string;
    filter30: string;
    filter15: string;
    filter7: string;
    filterExpired: string;
    filterOutOfStock: string;
    filterLowStock: string;
    lowStockLabel: string;
    lowStockThresholdLabel: string;
    viewByBatch: string;
    viewByMedicine: string;
    emptyTitle: string;
    emptyBody: string;
    colMedicine: string;
    colBatch: string;
    colPrintedExpiry: string;
    colDaysLeft: string;
    colQty: string;
    colStatus: string;
    batchCountLabel: string;
    daysLeftSuffix: string;
    expiredAgoSuffix: string;
    expiresToday: string;
    openDetails: string;
  };
  batchDetail: {
    backToInventory: string;
    printedExpiry: string;
    cutoffDate: string;
    remainingQty: string;
    initialQty: string;
    lastChecked: string;
    neverChecked: string;
    stockActionsTitle: string;
    actionChecked: string;
    actionStillAvailable: string;
    actionSold: string;
    actionDamaged: string;
    actionRemoved: string;
    qtyToDeduct: string;
    noteOptional: string;
    submitAction: string;
    actionSuccess: string;
    ownerDirectEdit: string;
    requestRestrictedChange: string;
    requestTypeEditBatch: string;
    requestTypeQtyOverride: string;
    requestTypeArchive: string;
    proposedBatchNumber: string;
    proposedExpiry: string;
    proposedQty: string;
    reasonRequired: string;
    submitRequest: string;
    requestSubmitted: string;
    saveOwnerEdit: string;
    ownerEditSaved: string;
    movementHistory: string;
    noMovements: string;
  };
  alerts: {
    title: string;
    upcomingTitle: string;
    upcomingEmpty: string;
    expiredTitle: string;
    expiredEmpty: string;
    stage30: string;
    stage15: string;
    stage7: string;
    stageExpired: string;
    acknowledge: string;
    acknowledged: string;
    mmYyyyGuideTitle: string;
    mmYyyyGuideBody: string;
    quickAction: string;
  };
  approvals: {
    title: string;
    pendingTab: string;
    decidedTab: string;
    noPending: string;
    noDecided: string;
    requestedBy: string;
    reason: string;
    proposedChange: string;
    approveBtn: string;
    rejectBtn: string;
    decisionNotePlaceholder: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
    decidedBy: string;
    ownerOnlyDecideHint: string;
  };
  activity: {
    title: string;
    filterAll: string;
    actor: string;
    qtyChange: string;
    noRecords: string;
  };
  reports: {
    title: string;
    exportCsv: string;
    exportPdf: string;
    exportingPdf: string;
    upcomingSummaryTitle: string;
    expiredSummaryTitle: string;
    adjustmentsSummaryTitle: string;
    soldTotal: string;
    damagedTotal: string;
    removedTotal: string;
    checkedTotal: string;
    stillAvailableTotal: string;
    noRows: string;
    sixMonthChartTitle: string;
    sixMonthChartSubtitle: string;
    metricUnits: string;
    metricBatches: string;
    urgentTierLabel: string;
    laterTierLabel: string;
    noSixMonthExpiries: string;
    batchesLabel: string;
  };
  settings: {
    title: string;
    languageSection: string;
    languageDesc: string;
    english: string;
    telugu: string;
    themeSection: string;
    themeDesc: string;
    lightMode: string;
    darkMode: string;
    teamSection: string;
    teamOwnerDesc: string;
    teamStaffInfo: string;
    addShopkeeperTitle: string;
    staffDisplayName: string;
    staffUsername: string;
    staffPassword: string;
    addShopkeeperBtn: string;
    activeLabel: string;
    disabledLabel: string;
    disableBtn: string;
    enableBtn: string;
    noShopkeepers: string;
    expiryRuleSection: string;
    demoResetSection: string;
    demoResetDesc: string;
    demoResetBtn: string;
    demoResetDone: string;
    shopkeeperAdded: string;
  };
  globalSearch: {
    placeholder: string;
    openLabel: string;
    clearLabel: string;
    noMatches: string;
    viewAllInInventory: string;
    resultsHeader: string;
  };
  statusLabels: {
    SAFE: string;
    '30_DAYS': string;
    '15_DAYS': string;
    '7_DAYS': string;
    EXPIRED: string;
    ARCHIVED: string;
    OUT_OF_STOCK: string;
  };
  actionLabels: {
    CREATED: string;
    CHECKED: string;
    STILL_AVAILABLE: string;
    SOLD: string;
    DAMAGED: string;
    REMOVED: string;
    OWNER_EDIT: string;
    APPROVAL_APPLIED: string;
  };
  pwa: {
    installApp: string;
    installOnIos: string;
    iosTitle: string;
    iosStep1: string;
    iosStep2: string;
    close: string;
    offlineBadge: string;
    mobileAppSection: string;
    mobileAppDesc: string;
    alreadyInstalled: string;
    androidBrowserHint: string;
  };
  notifications: {
    bellLabel: string;
    drawerTitle: string;
    noNewAlerts: string;
    expiryAlertsSummary: string;
    expiredSummary: string;
    pendingApprovalsSummary: string;
    lowStockSummary: string;
    enableDeviceAlerts: string;
    disableDeviceAlerts: string;
    deviceAlertsActive: string;
    deviceAlertsBlocked: string;
    deviceAlertsUnsupported: string;
    testNotification: string;
    testSent: string;
    testTitle: string;
    testBody: string;
    newExpiryTitle: string;
    newExpiredTitle: string;
    newApprovalTitle: string;
    viewAlertsBtn: string;
    viewApprovalsBtn: string;
    viewLowStockBtn: string;
    alertsExplainTitle: string;
    alertsExplainBody: string;
    sectionTitle: string;
    sectionDesc: string;
  };
  errors: Record<string, string>;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'PharmaShelf',
    demoBanner: 'DEMO DATA ACTIVE — Sample shop & fictional medicine batches for testing',
    demoTag: 'DEMO DATA',
    roleOwner: 'Shop Owner',
    roleShopkeeper: 'Shopkeeper',
    nav: {
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      addMedicine: 'Add Medicine',
      alerts: 'Expiry Alerts',
      approvals: 'Approvals',
      activity: 'Activity',
      reports: 'Reports',
      settings: 'Settings',
      more: 'More',
    },
    auth: {
      subtitle: 'Batch-wise pharmacy stock & expiry tracking',
      signInTab: 'Sign In',
      createShopTab: 'Create New Shop',
      username: 'Username',
      password: 'Password',
      signInBtn: 'Sign In',
      signingIn: 'Signing in...',
      shopName: 'Medical Shop Name',
      shopAddress: 'Shop Address / Area',
      ownerName: 'Owner Full Name',
      createShopBtn: 'Create Shop & Owner Account',
      creatingShop: 'Creating shop...',
      demoAccessTitle: 'Try Demo Pharmacy',
      demoAccessDesc: 'Test separate Owner and Shopkeeper logins on shared demo inventory.',
      demoOwnerBtn: 'Sign in as Demo Owner',
      demoStaffBtn: 'Sign in as Demo Shopkeeper',
      signOut: 'Sign Out',
    },
    dashboard: {
      title: 'Shop Overview',
      activeBatches: 'Active Batches',
      activeUnits: 'Units in Stock',
      expiringSoon: 'Expiring ≤ 30 Days',
      expiredBatches: 'Expired Batches',
      pendingApprovals: 'Pending Approvals',
      medicinesTracked: 'Medicines Tracked',
      expiryBreakdown: 'Expiry Horizon Breakdown',
      within7Days: 'Within 7 Days (Urgent)',
      within15Days: '8 to 15 Days',
      within30Days: '16 to 30 Days',
      alreadyExpired: 'Already Expired',
      quickActions: 'Quick Actions',
      addNewBatch: 'Add Medicine Batch',
      reviewAlerts: 'Review Expiry Alerts',
      checkInventory: 'Search Inventory',
      reviewApprovals: 'Review Approvals',
      recentActivity: 'Recent Stock Activity',
      viewAllActivity: 'View Full History',
      noActivityYet: 'No stock movements recorded yet.',
      units: 'units',
      batches: 'batches',
    },
    addMedicine: {
      title: 'Add Medicine Batch',
      subtitle: 'Every batch is stored separately. Adding a new batch never overwrites existing batches.',
      modeManual: 'Manual Entry',
      modeBarcode: 'Scan Barcode',
      modePhoto: 'Pack Photo (OCR)',
      barcodeExplainTitle: 'How Barcodes Work',
      barcodeExplainBody:
        'A standard medicine barcode identifies the product name only. It usually does not contain the batch number or expiry date. After scanning, enter the printed batch number and expiry date manually.',
      startCamera: 'Start Camera Scanner',
      stopCamera: 'Stop Camera',
      scanOrEnterBarcode: 'Barcode Number',
      lookupBarcode: 'Lookup Product',
      barcodeMatched: 'Matched existing medicine in your shop catalog. Enter this pack’s batch number and expiry date below.',
      barcodeNotFound: 'New barcode — enter the medicine name, batch number, and expiry date below.',
      barcodeNoBatchNote: 'Batch number and expiry date are never guessed from a barcode.',
      cameraUnavailable: 'Live camera or browser BarcodeDetector is unavailable here. You can type the barcode below or switch to Manual Entry.',
      photoExplainTitle: 'Read Medicine Pack Photo',
      photoExplainBody:
        'Take or upload a clear photo of the medicine pack showing the name, batch number (B.No.), and expiry date (EXP). Missing or blurry details are never guessed.',
      uploadOrCapturePhoto: 'Take / Upload Pack Photo',
      extractingText: 'Reading printed pack details...',
      ocrSuccessBanner: 'Detected printed values below. Please verify every field carefully against the physical pack before saving.',
      ocrUnavailable: 'Automatic photo reading is not connected or failed. Please enter the details manually below.',
      confirmDetectedHeading: 'Confirm Details Before Saving',
      confirmCheckboxLabel: 'I have checked the medicine name, batch number, and printed expiry date on the pack.',
      medicineName: 'Medicine Name & Strength',
      existingMedicineHint: 'Or pick existing medicine in shop',
      selectExisting: '— New medicine or choose existing —',
      manufacturer: 'Manufacturer (Optional)',
      category: 'Category (Optional)',
      barcodeLabel: 'Barcode (Optional)',
      batchNumber: 'Batch Number',
      expiryDate: 'Printed Expiry Date',
      expiryPlaceholder: 'MM/YYYY or DD/MM/YYYY or YYYY-MM-DD',
      expiryRuleNote: 'Month/Year (MM/YYYY) is interpreted as the last calendar day of that month.',
      interpretedCutoff: 'Expiry cutoff date',
      quantity: 'Stock Quantity (Units / Strips)',
      saveBatch: 'Save Medicine Batch',
      saving: 'Saving batch...',
      batchSavedSuccess: 'Batch saved separately to shop inventory.',
      addAnother: 'Add Another Batch',
      viewInventory: 'Go to Inventory',
    },
    inventory: {
      title: 'Batch-wise Inventory',
      searchPlaceholder: 'Search medicine name, batch no., or barcode...',
      filterAll: 'All Batches',
      filterSafe: 'Safe (>30d)',
      filter30: '30 Days',
      filter15: '15 Days',
      filter7: '7 Days',
      filterExpired: 'Expired',
      filterOutOfStock: 'Out of Stock',
      filterLowStock: 'Low Stock',
      lowStockLabel: 'Low Stock',
      lowStockThresholdLabel: 'Low stock below',
      viewByBatch: 'Batch List',
      viewByMedicine: 'Group by Medicine',
      emptyTitle: 'No matching batches found',
      emptyBody: 'Try clearing your search or filters, or add a new medicine batch.',
      colMedicine: 'Medicine',
      colBatch: 'Batch No.',
      colPrintedExpiry: 'Printed Expiry',
      colDaysLeft: 'Days Left',
      colQty: 'Qty',
      colStatus: 'Status',
      batchCountLabel: 'batches',
      daysLeftSuffix: 'd left',
      expiredAgoSuffix: 'd expired',
      expiresToday: 'Expires today',
      openDetails: 'Details',
    },
    batchDetail: {
      backToInventory: 'Back to Inventory',
      printedExpiry: 'Printed Expiry',
      cutoffDate: 'Interpreted Cutoff',
      remainingQty: 'Remaining Stock',
      initialQty: 'Initial Stock',
      lastChecked: 'Last Checked',
      neverChecked: 'Not checked yet',
      stockActionsTitle: 'Record Stock Action',
      actionChecked: 'Mark Checked',
      actionStillAvailable: 'Still Available',
      actionSold: 'Sold Quantity',
      actionDamaged: 'Damaged Quantity',
      actionRemoved: 'Removed Quantity',
      qtyToDeduct: 'Quantity',
      noteOptional: 'Note (Optional)',
      submitAction: 'Record Stock Action',
      actionSuccess: 'Stock action recorded and added to history.',
      ownerDirectEdit: 'Owner Direct Batch Edit',
      requestRestrictedChange: 'Request Restricted Change (Owner Approval)',
      requestTypeEditBatch: 'Edit Batch No. / Expiry Date',
      requestTypeQtyOverride: 'Correct Stock Quantity',
      requestTypeArchive: 'Archive / Remove Batch',
      proposedBatchNumber: 'New Batch Number',
      proposedExpiry: 'New Printed Expiry (MM/YYYY or YYYY-MM-DD)',
      proposedQty: 'Corrected Quantity',
      reasonRequired: 'Reason for Change (Required)',
      submitRequest: 'Send Request to Owner',
      requestSubmitted: 'Restricted change request sent to Shop Owner.',
      saveOwnerEdit: 'Save Batch Changes',
      ownerEditSaved: 'Batch details updated.',
      movementHistory: 'Batch Stock History',
      noMovements: 'No movements yet for this batch.',
    },
    alerts: {
      title: 'Expiry Reminders & Expired Stock',
      upcomingTitle: 'Upcoming Expiry Reminders (30 / 15 / 7 Days)',
      upcomingEmpty: 'No batches are currently within 30 days of expiry.',
      expiredTitle: 'Expired Batches (Remove from Active Shelf)',
      expiredEmpty: 'No expired batches with remaining stock.',
      stage30: '30-Day Reminder',
      stage15: '15-Day Reminder',
      stage7: '7-Day Urgent',
      stageExpired: 'Expired',
      acknowledge: 'Acknowledge',
      acknowledged: 'Acknowledged',
      mmYyyyGuideTitle: 'How Month / Year (MM/YYYY) Expiry Dates Are Interpreted',
      mmYyyyGuideBody:
        'When a medicine pack prints only Month and Year (for example 12/2026), PharmaShelf always displays the original printed value and calculates expiry alerts using the last calendar day of that month (2026-12-31).',
      quickAction: 'Stock Action',
    },
    approvals: {
      title: 'Owner Approval Requests',
      pendingTab: 'Pending',
      decidedTab: 'Completed',
      noPending: 'No pending approval requests.',
      noDecided: 'No completed approval decisions yet.',
      requestedBy: 'Requested by',
      reason: 'Reason',
      proposedChange: 'Proposed Change',
      approveBtn: 'Approve Change',
      rejectBtn: 'Reject',
      decisionNotePlaceholder: 'Optional note for staff...',
      statusPending: 'Pending Owner Review',
      statusApproved: 'Approved',
      statusRejected: 'Rejected',
      decidedBy: 'Decision by',
      ownerOnlyDecideHint: 'Only the Shop Owner can approve or reject restricted changes.',
    },
    activity: {
      title: 'Stock Activity History',
      filterAll: 'All Actions',
      actor: 'By',
      qtyChange: 'Qty Change',
      noRecords: 'No activity records yet.',
    },
    reports: {
      title: 'Pharmacy Expiry & Stock Reports',
      exportCsv: 'Download CSV',
      exportPdf: 'Export PDF',
      exportingPdf: 'Generating PDF...',
      upcomingSummaryTitle: 'Upcoming Expiry Batches (Next 30 Days)',
      expiredSummaryTitle: 'Expired Stock Remaining on Record',
      adjustmentsSummaryTitle: 'Stock Adjustment Totals',
      soldTotal: 'Total Sold',
      damagedTotal: 'Total Damaged',
      removedTotal: 'Total Removed',
      checkedTotal: 'Shelf Checks',
      stillAvailableTotal: 'Confirmed Available',
      noRows: 'No batches in this report category.',
      sixMonthChartTitle: '6-Month Upcoming Expiry Forecast',
      sixMonthChartSubtitle: 'Active stock scheduled to expire over the next 6 months',
      metricUnits: 'Units',
      metricBatches: 'Batches',
      urgentTierLabel: 'Urgent (≤ 30 days)',
      laterTierLabel: 'Upcoming (1–6 months)',
      noSixMonthExpiries: 'No active batches scheduled to expire in the next 6 months.',
      batchesLabel: 'batches',
    },
    settings: {
      title: 'Settings, Language & Team',
      languageSection: 'App Language',
      languageDesc: 'Switch all menus, labels, alerts, and error messages between English and Telugu.',
      english: 'English',
      telugu: 'తెలుగు (Telugu)',
      themeSection: 'Appearance (Light / Dark)',
      themeDesc: 'Switch between Light and Dark liquid-glass appearance.',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      teamSection: 'Shopkeeper Accounts',
      teamOwnerDesc: 'Create and manage separate Shopkeeper logins for your shop. All staff share your shop’s inventory.',
      teamStaffInfo: 'You are signed in as a Shopkeeper. Only the Shop Owner can manage staff accounts.',
      addShopkeeperTitle: 'Add Shopkeeper Account',
      staffDisplayName: 'Staff Full Name',
      staffUsername: 'Staff Username',
      staffPassword: 'Password (min 4 chars)',
      addShopkeeperBtn: 'Create Shopkeeper',
      activeLabel: 'Active',
      disabledLabel: 'Disabled',
      disableBtn: 'Disable Access',
      enableBtn: 'Enable Access',
      noShopkeepers: 'No shopkeepers added to this shop yet.',
      expiryRuleSection: 'Expiry Date Interpretation Rule',
      demoResetSection: 'Demo Data Controls',
      demoResetDesc: 'Restore the demo pharmacy inventory, alerts, and sample activity back to the initial state.',
      demoResetBtn: 'Reset Demo Data',
      demoResetDone: 'Demo data has been reset.',
      shopkeeperAdded: 'Shopkeeper account created.',
    },
    globalSearch: {
      placeholder: 'Search medicine, category, manufacturer...',
      openLabel: 'Search inventory',
      clearLabel: 'Clear search',
      noMatches: 'No matching medicines found in inventory.',
      viewAllInInventory: 'View all in Inventory',
      resultsHeader: 'Inventory Matches',
    },
    statusLabels: {
      SAFE: 'Safe',
      '30_DAYS': 'Expiring ≤ 30d',
      '15_DAYS': 'Expiring ≤ 15d',
      '7_DAYS': 'Urgent ≤ 7d',
      EXPIRED: 'Expired',
      ARCHIVED: 'Archived',
      OUT_OF_STOCK: 'Out of Stock',
    },
    actionLabels: {
      CREATED: 'Batch Added',
      CHECKED: 'Checked',
      STILL_AVAILABLE: 'Still Available',
      SOLD: 'Sold',
      DAMAGED: 'Damaged',
      REMOVED: 'Removed',
      OWNER_EDIT: 'Owner Edit',
      APPROVAL_APPLIED: 'Approved Change',
    },
    errors: {
      INVALID_CREDENTIALS: 'Incorrect username or password.',
      ACCOUNT_DISABLED: 'This shopkeeper account has been disabled by the shop owner.',
      USERNAME_TAKEN: 'That username is already in use. Please choose another.',
      INVALID_REGISTRATION_INPUT: 'Please fill in shop name, owner name, username, and a password (min 4 chars).',
      INVALID_SHOPKEEPER_INPUT: 'Please enter staff name, username, and password (min 4 chars).',
      OWNER_ONLY_ACTION: 'Permission denied: only the Shop Owner can perform this action.',
      MEDICINE_NAME_REQUIRED: 'Please enter the medicine name.',
      BATCH_NUMBER_REQUIRED: 'Please enter the batch number.',
      INVALID_NEGATIVE_OR_FRACTIONAL_QUANTITY: 'Quantity must be a whole number of 0 or greater.',
      INVALID_EXPIRY_EMPTY: 'Please enter the printed expiry date.',
      INVALID_EXPIRY_DATE: 'The expiry date is not a valid calendar date.',
      INVALID_EXPIRY_FORMAT: 'Use MM/YYYY (e.g. 12/2026), DD/MM/YYYY, or YYYY-MM-DD.',
      DUPLICATE_BATCH_NUMBER: 'This medicine already has an active batch with that batch number. Open that batch to update its stock.',
      ACTION_QUANTITY_MUST_BE_POSITIVE: 'Enter a whole number greater than 0.',
      NEGATIVE_STOCK_NOT_ALLOWED: 'Action blocked: stock quantity cannot become negative.',
      BATCH_NOT_FOUND: 'Batch not found in your shop.',
      BATCH_ARCHIVED: 'This batch is archived and cannot be modified.',
      REASON_REQUIRED: 'Please enter a reason for this restricted change request.',
      OCR_NOT_CONFIGURED: 'Photo reading (OCR) is not connected on the server. Please use manual entry.',
      OCR_FAILED: 'Could not read text from the photo. Please try a clearer image or enter details manually.',
      NETWORK_ERROR: 'Could not reach the shop server. Please try again.',
    },
    pwa: {
      installApp: 'Install Mobile App',
      installOnIos: 'Install on iPhone',
      iosTitle: 'Install PharmaShelf on iPhone / iPad',
      iosStep1: 'Tap the Share button in Safari’s bottom/top bar.',
      iosStep2: 'Scroll down and tap "Add to Home Screen".',
      close: 'Close',
      offlineBadge: 'Offline Mode — Viewing cached data',
      mobileAppSection: 'Mobile App (Install on Phone)',
      mobileAppDesc:
        'Install PharmaShelf on Android, iPhone, or Desktop for a full-screen app icon, faster launch, offline viewing, and device alerts.',
      alreadyInstalled: 'Running as installed Mobile App (Standalone Mode).',
      androidBrowserHint:
        'On Android Chrome or Edge, tap the browser menu (⋮) and choose "Add to Home screen" or "Install app".',
    },
    notifications: {
      bellLabel: 'Notifications',
      drawerTitle: 'Notifications & Alerts',
      noNewAlerts: 'All caught up! No urgent alerts right now.',
      expiryAlertsSummary: 'Upcoming expiry alerts (≤30d)',
      expiredSummary: 'Expired batches needing removal',
      pendingApprovalsSummary: 'Pending owner approvals',
      lowStockSummary: 'Low stock batches',
      enableDeviceAlerts: 'Enable Phone / Browser Alerts',
      disableDeviceAlerts: 'Pause Phone Alerts',
      deviceAlertsActive: 'Device notifications active',
      deviceAlertsBlocked: 'Blocked in browser settings — allow notifications in site permissions.',
      deviceAlertsUnsupported: 'Device notifications are not supported in this browser.',
      testNotification: 'Send Test Alert',
      testSent: 'Test notification sent to your device.',
      testTitle: 'PharmaShelf Alerts Active',
      testBody: 'Expiry reminders (30/15/7 days) and expired batch alerts will appear here.',
      newExpiryTitle: 'PharmaShelf: Medicine Expiring Soon',
      newExpiredTitle: 'PharmaShelf: Expired Batch on Shelf',
      newApprovalTitle: 'PharmaShelf: Approval Needed',
      viewAlertsBtn: 'Open Expiry Alerts',
      viewApprovalsBtn: 'Review Approvals',
      viewLowStockBtn: 'Check Low Stock',
      alertsExplainTitle: 'How App & Phone Notifications Work',
      alertsExplainBody:
        'All 30/15/7-day expiry reminders and expired alerts appear automatically inside the app (Alerts tab & top bell). Enable Device Alerts to also receive pop-up notifications on your phone or desktop.',
      sectionTitle: 'App & Phone Notifications',
      sectionDesc:
        'Receive pop-up notifications on your phone or browser whenever batches hit 30/15/7-day expiry windows or staff submit approval requests.',
    },
  },
  te: {
    appTitle: 'PharmaShelf',
    demoBanner: 'డెమో డేటా — పరీక్ష కోసం నమూనా దుకాణం మరియు మందుల బ్యాచ్‌లు',
    demoTag: 'డెమో డేటా',
    roleOwner: 'దుకాణ యజమాని',
    roleShopkeeper: 'దుకాణ సిబ్బంది',
    nav: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      inventory: 'స్టాక్ జాబితా',
      addMedicine: 'మందు జోడించు',
      alerts: 'గడువు హెచ్చరికలు',
      approvals: 'అనుమతులు',
      activity: 'చరిత్ర',
      reports: 'నివేదికలు',
      settings: 'సెట్టింగ్‌లు',
      more: 'మరిన్ని',
    },
    auth: {
      subtitle: 'బ్యాచ్ వారీగా మందుల స్టాక్ మరియు గడువు నిర్వహణ',
      signInTab: 'లాగిన్',
      createShopTab: 'కొత్త దుకాణం',
      username: 'యూజర్ పేరు',
      password: 'పాస్‌వర్డ్',
      signInBtn: 'లాగిన్ చేయండి',
      signingIn: 'లాగిన్ అవుతోంది...',
      shopName: 'మెడికల్ షాప్ పేరు',
      shopAddress: 'దుకాణం చిరునామా / ప్రాంతం',
      ownerName: 'యజమాని పూర్తి పేరు',
      createShopBtn: 'దుకాణం & యజమాని ఖాతా సృష్టించండి',
      creatingShop: 'సృష్టించబడుతోంది...',
      demoAccessTitle: 'డెమో ఫార్మసీని ప్రయత్నించండి',
      demoAccessDesc: 'ఒకే దుకాణ స్టాక్‌పై యజమాని మరియు సిబ్బంది లాగిన్‌లను పరీక్షించండి.',
      demoOwnerBtn: 'డెమో యజమానిగా లాగిన్',
      demoStaffBtn: 'డెమో సిబ్బందిగా లాగిన్',
      signOut: 'లాగ్ అవుట్',
    },
    dashboard: {
      title: 'దుకాణం సారాంశం',
      activeBatches: 'క్రియాశీల బ్యాచ్‌లు',
      activeUnits: 'స్టాక్‌లోని యూనిట్లు',
      expiringSoon: '30 రోజుల్లో గడువు ముగిసేవి',
      expiredBatches: 'గడువు ముగిసిన బ్యాచ్‌లు',
      pendingApprovals: 'వేచి ఉన్న అనుమతులు',
      medicinesTracked: 'నమోదైన మందులు',
      expiryBreakdown: 'గడువు సమయ విభజన',
      within7Days: '7 రోజుల్లోపు (అత్యవసరం)',
      within15Days: '8 నుండి 15 రోజులు',
      within30Days: '16 నుండి 30 రోజులు',
      alreadyExpired: 'ఇప్పటికే గడువు ముగిసినవి',
      quickActions: 'త్వరిత చర్యలు',
      addNewBatch: 'కొత్త బ్యాచ్ జోడించండి',
      reviewAlerts: 'గడువు హెచ్చరికలు చూడండి',
      checkInventory: 'స్టాక్ వెతకండి',
      reviewApprovals: 'అనుమతులు సమీక్షించండి',
      recentActivity: 'ఇటీవలి స్టాక్ మార్పులు',
      viewAllActivity: 'పూర్తి చరిత్ర చూడండి',
      noActivityYet: 'ఇంకా స్టాక్ మార్పులు ఏవీ నమోదు కాలేదు.',
      units: 'యూనిట్లు',
      batches: 'బ్యాచ్‌లు',
    },
    addMedicine: {
      title: 'మందు బ్యాచ్ జోడించండి',
      subtitle: 'ప్రతి బ్యాచ్ విడిగా సేవ్ అవుతుంది. కొత్త బ్యాచ్ పాత బ్యాచ్‌ను మార్చదు.',
      modeManual: 'మాన్యువల్ నమోదు',
      modeBarcode: 'బార్‌కోడ్ స్కాన్',
      modePhoto: 'ప్యాక్ ఫోటో (OCR)',
      barcodeExplainTitle: 'బార్‌కోడ్ ఎలా పనిచేస్తుంది',
      barcodeExplainBody:
        'సాధారణ బార్‌కోడ్ మందు పేరును మాత్రమే గుర్తిస్తుంది. అందులో బ్యాచ్ నంబర్ లేదా గడువు తేదీ ఉండవు. స్కాన్ చేసిన తర్వాత బ్యాచ్ నంబర్ మరియు గడువు తేదీని మీరే నమోదు చేయండి.',
      startCamera: 'కెమెరా స్కానర్ ఆన్ చేయండి',
      stopCamera: 'కెమెరా ఆపండి',
      scanOrEnterBarcode: 'బార్‌కోడ్ నంబర్',
      lookupBarcode: 'మందును వెతకండి',
      barcodeMatched: 'మీ దుకాణం జాబితాలో మందు కనుగొనబడింది. ఈ ప్యాక్ బ్యాచ్ నంబర్ మరియు గడువు తేదీ నమోదు చేయండి.',
      barcodeNotFound: 'కొత్త బార్‌కోడ్ — మందు పేరు, బ్యాచ్ నంబర్ మరియు గడువు తేదీ నమోదు చేయండి.',
      barcodeNoBatchNote: 'బార్‌కోడ్ నుండి బ్యాచ్ నంబర్ లేదా గడువు తేదీని ఎప్పుడూ ఊహించము.',
      cameraUnavailable: 'ఈ బ్రౌజర్‌లో లైవ్ కెమెరా లేదా బార్‌కోడ్ స్కానర్ అందుబాటులో లేదు. మీరు బార్‌కోడ్ టైప్ చేయవచ్చు లేదా మాన్యువల్ నమోదు వాడండి.',
      photoExplainTitle: 'మందు ప్యాక్ ఫోటో నుండి చదవండి',
      photoExplainBody:
        'మందు పేరు, బ్యాచ్ నంబర్ (B.No.), మరియు గడువు తేదీ (EXP) స్పష్టంగా కనిపించే ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి. స్పష్టంగా లేని వివరాలను మేము ఊహించము.',
      uploadOrCapturePhoto: 'ఫోటో తీయండి / అప్‌లోడ్ చేయండి',
      extractingText: 'ప్యాక్ వివరాలు చదువుతోంది...',
      ocrSuccessBanner: 'ఫోటో నుండి చదివిన వివరాలు క్రింద ఉన్నాయి. సేవ్ చేసే ముందు అసలు ప్యాక్‌తో సరిచూసి నిర్ధారించండి.',
      ocrUnavailable: 'ఫోటో చదివే సేవ అందుబాటులో లేదు లేదా విఫలమైంది. దయచేసి వివరాలను మాన్యువల్‌గా నమోదు చేయండి.',
      confirmDetectedHeading: 'సేవ్ చేసే ముందు వివరాలను నిర్ధారించండి',
      confirmCheckboxLabel: 'మందు పేరు, బ్యాచ్ నంబర్ మరియు గడువు తేదీని ప్యాక్‌పై చూసి నిర్ధారించాను.',
      medicineName: 'మందు పేరు & మోతాదు',
      existingMedicineHint: 'లేదా దుకాణంలోని మందును ఎంచుకోండి',
      selectExisting: '— కొత్త మందు లేదా ఉన్నదానిని ఎంచుకోండి —',
      manufacturer: 'తయారీదారు (ఐచ్ఛికం)',
      category: 'వర్గం (ఐచ్ఛికం)',
      barcodeLabel: 'బార్‌కోడ్ (ఐచ్ఛికం)',
      batchNumber: 'బ్యాచ్ నంబర్',
      expiryDate: 'ముద్రించిన గడువు తేదీ',
      expiryPlaceholder: 'MM/YYYY లేదా DD/MM/YYYY లేదా YYYY-MM-DD',
      expiryRuleNote: 'నెల/సంవత్సరం (MM/YYYY) ను ఆ నెల చివరి రోజుగా లెక్కించబడుతుంది.',
      interpretedCutoff: 'లెక్కించిన చివరి తేదీ',
      quantity: 'స్టాక్ పరిమాణం (యూనిట్లు / స్ట్రిప్స్)',
      saveBatch: 'బ్యాచ్ సేవ్ చేయండి',
      saving: 'సేవ్ అవుతోంది...',
      batchSavedSuccess: 'కొత్త బ్యాచ్ స్టాక్ జాబితాలో విడిగా సేవ్ చేయబడింది.',
      addAnother: 'మరో బ్యాచ్ జోడించండి',
      viewInventory: 'స్టాక్ జాబితాకు వెళ్ళండి',
    },
    inventory: {
      title: 'బ్యాచ్ వారీ స్టాక్ జాబితా',
      searchPlaceholder: 'మందు పేరు, బ్యాచ్ నం. లేదా బార్‌కోడ్ వెతకండి...',
      filterAll: 'అన్ని బ్యాచ్‌లు',
      filterSafe: 'సురక్షితం (>30రో)',
      filter30: '30 రోజులు',
      filter15: '15 రోజులు',
      filter7: '7 రోజులు',
      filterExpired: 'గడువు ముగిసినవి',
      filterOutOfStock: 'స్టాక్ లేదు',
      filterLowStock: 'తక్కువ స్టాక్',
      lowStockLabel: 'తక్కువ స్టాక్',
      lowStockThresholdLabel: 'తక్కువ స్టాక్ పరిమితి (<)',
      viewByBatch: 'బ్యాచ్ జాబితా',
      viewByMedicine: 'మందు వారీగా',
      emptyTitle: 'సరిపోయే బ్యాచ్‌లు లేవు',
      emptyBody: 'వెతుకులాట లేదా ఫిల్టర్ మార్చి చూడండి, లేదా కొత్త బ్యాచ్ జోడించండి.',
      colMedicine: 'మందు',
      colBatch: 'బ్యాచ్ నం.',
      colPrintedExpiry: 'గడువు తేదీ',
      colDaysLeft: 'మిగిలిన రోజులు',
      colQty: 'పరిమాణం',
      colStatus: 'స్థితి',
      batchCountLabel: 'బ్యాచ్‌లు',
      daysLeftSuffix: 'రో. మిగిలాయి',
      expiredAgoSuffix: 'రో. క్రితం ముగిసింది',
      expiresToday: 'ఈరోజు గడువు ముగుస్తుంది',
      openDetails: 'వివరాలు',
    },
    batchDetail: {
      backToInventory: 'స్టాక్ జాబితాకు తిరిగి వెళ్ళండి',
      printedExpiry: 'ముద్రించిన గడువు',
      cutoffDate: 'చివరి గడువు తేదీ',
      remainingQty: 'మిగిలిన స్టాక్',
      initialQty: 'మొదటి స్టాక్',
      lastChecked: 'చివరి తనిఖీ',
      neverChecked: 'ఇంకా తనిఖీ చేయలేదు',
      stockActionsTitle: 'స్టాక్ చర్య నమోదు చేయండి',
      actionChecked: 'తనిఖీ చేయబడింది',
      actionStillAvailable: 'ఇంకా అందుబాటులో ఉంది',
      actionSold: 'అమ్మిన పరిమాణం',
      actionDamaged: 'దెబ్బతిన్న పరిమాణం',
      actionRemoved: 'తొలగించిన పరిమాణం',
      qtyToDeduct: 'పరిమాణం',
      noteOptional: 'గమనిక (ఐచ్ఛికం)',
      submitAction: 'చర్య నమోదు చేయండి',
      actionSuccess: 'స్టాక్ చర్య నమోదైంది మరియు చరిత్రలో చేర్చబడింది.',
      ownerDirectEdit: 'యజమాని బ్యాచ్ మార్పు',
      requestRestrictedChange: 'నియంత్రిత మార్పు అభ్యర్థించండి (యజమాని అనుమతి)',
      requestTypeEditBatch: 'బ్యాచ్ నం. / గడువు తేదీ మార్పు',
      requestTypeQtyOverride: 'స్టాక్ పరిమాణం సవరణ',
      requestTypeArchive: 'బ్యాచ్ నిలిపివేత / తొలగింపు',
      proposedBatchNumber: 'కొత్త బ్యాచ్ నంబర్',
      proposedExpiry: 'కొత్త గడువు తేదీ (MM/YYYY లేదా YYYY-MM-DD)',
      proposedQty: 'సవరించిన పరిమాణం',
      reasonRequired: 'మార్పుకు కారణం (తప్పనిసరి)',
      submitRequest: 'యజమానికి అభ్యర్థన పంపండి',
      requestSubmitted: 'నియంత్రిత మార్పు అభ్యర్థన యజమానికి పంపబడింది.',
      saveOwnerEdit: 'మార్పులు సేవ్ చేయండి',
      ownerEditSaved: 'బ్యాచ్ వివరాలు నవీకరించబడ్డాయి.',
      movementHistory: 'బ్యాచ్ స్టాక్ చరిత్ర',
      noMovements: 'ఈ బ్యాచ్‌కు ఇంకా మార్పులు ఏవీ లేవు.',
    },
    alerts: {
      title: 'గడువు హెచ్చరికలు & ముగిసిన స్టాక్',
      upcomingTitle: 'రాబోయే గడువు హెచ్చరికలు (30 / 15 / 7 రోజులు)',
      upcomingEmpty: '30 రోజుల్లోపు గడువు ముగిసే బ్యాచ్‌లు ప్రస్తుతం లేవు.',
      expiredTitle: 'గడువు ముగిసిన బ్యాచ్‌లు (షెల్ఫ్ నుండి తొలగించండి)',
      expiredEmpty: 'స్టాక్ మిగిలి ఉన్న గడువు ముగిసిన బ్యాచ్‌లు లేవు.',
      stage30: '30 రోజుల హెచ్చరిక',
      stage15: '15 రోజుల హెచ్చరిక',
      stage7: '7 రోజుల అత్యవసరం',
      stageExpired: 'గడువు ముగిసింది',
      acknowledge: 'గుర్తించబడింది',
      acknowledged: 'గుర్తించబడింది',
      mmYyyyGuideTitle: 'నెల / సంవత్సరం (MM/YYYY) గడువు తేదీని ఎలా లెక్కిస్తాము',
      mmYyyyGuideBody:
        'మందు ప్యాక్‌పై నెల మరియు సంవత్సరం మాత్రమే ముద్రించి ఉంటే (ఉదా: 12/2026), యాప్ అసలు ముద్రించిన విలువను చూపిస్తూ ఆ నెల చివరి రోజును (2026-12-31) గడువు తేదీగా లెక్కిస్తుంది.',
      quickAction: 'స్టాక్ చర్య',
    },
    approvals: {
      title: 'యజమాని అనుమతి అభ్యర్థనలు',
      pendingTab: 'వేచి ఉన్నవి',
      decidedTab: 'పూర్తయినవి',
      noPending: 'వేచి ఉన్న అనుమతి అభ్యర్థనలు లేవు.',
      noDecided: 'పూర్తయిన అనుమతి నిర్ణయాలు ఇంకా లేవు.',
      requestedBy: 'అభ్యర్థించినవారు',
      reason: 'కారణం',
      proposedChange: 'సూచించిన మార్పు',
      approveBtn: 'అనుమతించండి',
      rejectBtn: 'తిరస్కరించండి',
      decisionNotePlaceholder: 'సిబ్బందికి గమనిక (ఐచ్ఛికం)...',
      statusPending: 'యజమాని సమీక్షలో ఉంది',
      statusApproved: 'అనుమతించబడింది',
      statusRejected: 'తిరస్కరించబడింది',
      decidedBy: 'నిర్ణయించినవారు',
      ownerOnlyDecideHint: 'నియంత్రిత మార్పులను దుకాణ యజమాని మాత్రమే అనుమతించగలరు లేదా తిరస్కరించగలరు.',
    },
    activity: {
      title: 'స్టాక్ కార్యకలాపాల చరిత్ర',
      filterAll: 'అన్ని చర్యలు',
      actor: 'చేసినవారు',
      qtyChange: 'పరిమాణ మార్పు',
      noRecords: 'ఇంకా కార్యకలాపాల రికార్డులు లేవు.',
    },
    reports: {
      title: 'గడువు & స్టాక్ నివేదికలు',
      exportCsv: 'CSV డౌన్‌లోడ్',
      exportPdf: 'PDF ఎగుమతి',
      exportingPdf: 'PDF తయారవుతోంది...',
      upcomingSummaryTitle: 'రాబోయే 30 రోజుల్లో గడువు ముగిసే బ్యాచ్‌లు',
      expiredSummaryTitle: 'రికార్డులో మిగిలి ఉన్న గడువు ముగిసిన స్టాక్',
      adjustmentsSummaryTitle: 'స్టాక్ సర్దుబాటు మొత్తాలు',
      soldTotal: 'మొత్తం అమ్మినవి',
      damagedTotal: 'మొత్తం దెబ్బతిన్నవి',
      removedTotal: 'మొత్తం తొలగించినవి',
      checkedTotal: 'షెల్ఫ్ తనిఖీలు',
      stillAvailableTotal: 'అందుబాటులో ఉన్నవి',
      noRows: 'ఈ నివేదిక విభాగంలో బ్యాచ్‌లు లేవు.',
      sixMonthChartTitle: 'రాబోయే 6 నెలల గడువు అంచనా',
      sixMonthChartSubtitle: 'వచ్చే 6 నెలల్లో గడువు ముగియనున్న క్రియాశీల స్టాక్',
      metricUnits: 'యూనిట్లు',
      metricBatches: 'బ్యాచ్‌లు',
      urgentTierLabel: 'అత్యవసరం (≤ 30 రోజులు)',
      laterTierLabel: 'రాబోయేవి (1–6 నెలలు)',
      noSixMonthExpiries: 'రాబోయే 6 నెలల్లో గడువు ముగిసే బ్యాచ్‌లు ఏవీ లేవు.',
      batchesLabel: 'బ్యాచ్‌లు',
    },
    settings: {
      title: 'సెట్టింగ్‌లు, భాష & సిబ్బంది',
      languageSection: 'యాప్ భాష',
      languageDesc: 'అన్ని బటన్లు, లేబుళ్ళు, హెచ్చరికలు మరియు సందేశాలను తెలుగు లేదా ఇంగ్లీష్‌లోకి మార్చండి.',
      english: 'English (ఇంగ్లీష్)',
      telugu: 'తెలుగు',
      themeSection: 'యాప్ రూపం (లైట్ / డార్క్)',
      themeDesc: 'లైట్ మరియు డార్క్ లిక్విడ్ గ్లాస్ మోడ్‌ల మధ్య మార్చండి.',
      lightMode: 'లైట్ మోడ్',
      darkMode: 'డార్క్ మోడ్',
      teamSection: 'దుకాణ సిబ్బంది ఖాతాలు',
      teamOwnerDesc: 'మీ దుకాణం కోసం సిబ్బంది ఖాతాలను సృష్టించండి మరియు నిర్వహించండి.',
      teamStaffInfo: 'మీరు దుకాణ సిబ్బందిగా లాగిన్ అయ్యారు. ఖాతాలను యజమాని మాత్రమే నిర్వహించగలరు.',
      addShopkeeperTitle: 'కొత్త సిబ్బంది ఖాతా జోడించండి',
      staffDisplayName: 'సిబ్బంది పూర్తి పేరు',
      staffUsername: 'సిబ్బంది యూజర్ పేరు',
      staffPassword: 'పాస్‌వర్డ్ (కనీసం 4 అక్షరాలు)',
      addShopkeeperBtn: 'సిబ్బందిని జోడించండి',
      activeLabel: 'క్రియాశీలం',
      disabledLabel: 'నిలిపివేయబడింది',
      disableBtn: 'నిలిపివేయండి',
      enableBtn: 'ప్రారంభించండి',
      noShopkeepers: 'ఈ దుకాణంలో ఇంకా సిబ్బంది ఖాతాలు లేవు.',
      expiryRuleSection: 'గడువు తేదీ లెక్కింపు నియమం',
      demoResetSection: 'డెమో డేటా నియంత్రణ',
      demoResetDesc: 'డెమో దుకాణం స్టాక్, హెచ్చరికలు మరియు చరిత్రను మొదటి స్థితికి రీసెట్ చేయండి.',
      demoResetBtn: 'డెమో డేటా రీసెట్ చేయండి',
      demoResetDone: 'డెమో డేటా రీసెట్ చేయబడింది.',
      shopkeeperAdded: 'సిబ్బంది ఖాతా సృష్టించబడింది.',
    },
    globalSearch: {
      placeholder: 'మందు పేరు, వర్గం లేదా తయారీదారు వెతకండి...',
      openLabel: 'స్టాక్ వెతకండి',
      clearLabel: 'శోధన క్లియర్ చేయండి',
      noMatches: 'సరిపోయే మందులు కనుగొనబడలేదు.',
      viewAllInInventory: 'స్టాక్ జాబితాలో అన్నీ చూడండి',
      resultsHeader: 'స్టాక్ ఫలితాలు',
    },
    statusLabels: {
      SAFE: 'సురక్షితం',
      '30_DAYS': '≤ 30 రోజులు',
      '15_DAYS': '≤ 15 రోజులు',
      '7_DAYS': 'అత్యవసరం ≤ 7రో',
      EXPIRED: 'గడువు ముగిసింది',
      ARCHIVED: 'నిలిపివేయబడింది',
      OUT_OF_STOCK: 'స్టాక్ లేదు',
    },
    actionLabels: {
      CREATED: 'బ్యాచ్ జోడింపు',
      CHECKED: 'తనిఖీ చేయబడింది',
      STILL_AVAILABLE: 'అందుబాటులో ఉంది',
      SOLD: 'అమ్మకం',
      DAMAGED: 'దెబ్బతిన్నది',
      REMOVED: 'తొలగింపు',
      OWNER_EDIT: 'యజమాని మార్పు',
      APPROVAL_APPLIED: 'అనుమతించిన మార్పు',
    },
    errors: {
      INVALID_CREDENTIALS: 'యూజర్ పేరు లేదా పాస్‌వర్డ్ తప్పుగా ఉంది.',
      ACCOUNT_DISABLED: 'ఈ సిబ్బంది ఖాతాను దుకాణ యజమాని నిలిపివేశారు.',
      USERNAME_TAKEN: 'ఆ యూజర్ పేరు ఇప్పటికే ఉపయోగంలో ఉంది. వేరే పేరు ఎంచుకోండి.',
      INVALID_REGISTRATION_INPUT: 'దయచేసి దుకాణం పేరు, యజమాని పేరు, యూజర్ పేరు మరియు పాస్‌వర్డ్ (కనీసం 4 అక్షరాలు) నమోదు చేయండి.',
      INVALID_SHOPKEEPER_INPUT: 'దయచేసి సిబ్బంది పేరు, యూజర్ పేరు మరియు పాస్‌వర్డ్ (కనీసం 4 అక్షరాలు) నమోదు చేయండి.',
      OWNER_ONLY_ACTION: 'అనుమతి లేదు: ఈ పనిని దుకాణ యజమాని మాత్రమే చేయగలరు.',
      MEDICINE_NAME_REQUIRED: 'దయచేసి మందు పేరును నమోదు చేయండి.',
      BATCH_NUMBER_REQUIRED: 'దయచేసి బ్యాచ్ నంబర్‌ను నమోదు చేయండి.',
      INVALID_NEGATIVE_OR_FRACTIONAL_QUANTITY: 'పరిమాణం 0 లేదా అంతకంటే ఎక్కువ పూర్తి సంఖ్య అయి ఉండాలి.',
      INVALID_EXPIRY_EMPTY: 'దయచేసి ముద్రించిన గడువు తేదీని నమోదు చేయండి.',
      INVALID_EXPIRY_DATE: 'ఇది సరైన క్యాలెండర్ తేదీ కాదు.',
      INVALID_EXPIRY_FORMAT: 'MM/YYYY (ఉదా: 12/2026), DD/MM/YYYY, లేదా YYYY-MM-DD ఉపయోగించండి.',
      DUPLICATE_BATCH_NUMBER: 'ఈ మందుకు ఇదే బ్యాచ్ నంబర్‌తో ఇప్పటికే స్టాక్ ఉంది. స్టాక్ మార్చడానికి ఆ బ్యాచ్‌ను తెరవండి.',
      ACTION_QUANTITY_MUST_BE_POSITIVE: '0 కంటే ఎక్కువ పూర్తి సంఖ్యను నమోదు చేయండి.',
      NEGATIVE_STOCK_NOT_ALLOWED: 'నిరోధించబడింది: స్టాక్ పరిమాణం సున్నా కంటే తక్కువ (మైనస్) కాకూడదు.',
      BATCH_NOT_FOUND: 'మీ దుకాణంలో ఈ బ్యాచ్ కనుగొనబడలేదు.',
      BATCH_ARCHIVED: 'ఈ బ్యాచ్ నిలిపివేయబడింది, మార్పులు చేయలేరు.',
      REASON_REQUIRED: 'ఈ నియంత్రిత మార్పుకు కారణం తప్పనిసరిగా వ్రాయండి.',
      OCR_NOT_CONFIGURED: 'ఫోటో చదివే సేవ సర్వర్‌లో కనెక్ట్ కాలేదు. దయచేసి మాన్యువల్ నమోదు ఉపయోగించండి.',
      OCR_FAILED: 'ఫోటో నుండి వివరాలు చదవలేకపోయాము. స్పష్టమైన ఫోటో తీయండి లేదా మాన్యువల్‌గా నమోదు చేయండి.',
      NETWORK_ERROR: 'సర్వర్‌తో కనెక్ట్ కాలేకపోయాము. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    },
    pwa: {
      installApp: 'మొబైల్ యాప్ ఇన్‌స్టాల్',
      installOnIos: 'iPhone లో ఇన్‌స్టాల్',
      iosTitle: 'iPhone / iPad లో PharmaShelf ఇన్‌స్టాల్ చేయండి',
      iosStep1: 'Safari బార్‌లో Share బటన్‌ను నొక్కండి.',
      iosStep2: 'క్రిందికి స్క్రోల్ చేసి "Add to Home Screen" ఎంచుకోండి.',
      close: 'మూసివేయండి',
      offlineBadge: 'ఆఫ్‌లైన్ మోడ్ — సేవ్ చేసిన డేటా చూపుతోంది',
      mobileAppSection: 'మొబైల్ యాప్ (ఫోన్‌లో ఇన్‌స్టాల్)',
      mobileAppDesc:
        'పూర్తి స్క్రీన్ యాప్ ఐకాన్, వేగవంతమైన ఓపెనింగ్, ఆఫ్‌లైన్ వీక్షణ మరియు ఫోన్ హెచ్చరికల కోసం PharmaShelf ను ఫోన్‌లో ఇన్‌స్టాల్ చేయండి.',
      alreadyInstalled: 'ఇన్‌స్టాల్ చేసిన మొబైల్ యాప్ మోడ్‌లో నడుస్తోంది.',
      androidBrowserHint:
        'Android Chrome లేదా Edge లో బ్రౌజర్ మెనూ (⋮) నొక్కి "Install app" లేదా "Add to Home screen" ఎంచుకోండి.',
    },
    notifications: {
      bellLabel: 'నోటిఫికేషన్లు',
      drawerTitle: 'నోటిఫికేషన్లు & హెచ్చరికలు',
      noNewAlerts: 'ప్రస్తుతం అత్యవసర హెచ్చరికలు ఏవీ లేవు.',
      expiryAlertsSummary: 'రాబోయే గడువు హెచ్చరికలు (≤30రో)',
      expiredSummary: 'తొలగించాల్సిన గడువు ముగిసిన బ్యాచ్‌లు',
      pendingApprovalsSummary: 'వేచి ఉన్న యజమాని అనుమతులు',
      lowStockSummary: 'తక్కువ స్టాక్ బ్యాచ్‌లు',
      enableDeviceAlerts: 'ఫోన్ / బ్రౌజర్ అలర్ట్‌లు ఆన్ చేయండి',
      disableDeviceAlerts: 'ఫోన్ అలర్ట్‌లు ఆపండి',
      deviceAlertsActive: 'డివైస్ నోటిఫికేషన్లు ఆన్‌లో ఉన్నాయి',
      deviceAlertsBlocked: 'బ్రౌజర్ సెట్టింగ్‌లలో బ్లాక్ చేయబడింది — సైట్ అనుమతుల్లో అనుమతించండి.',
      deviceAlertsUnsupported: 'ఈ బ్రౌజర్‌లో డివైస్ నోటిఫికేషన్లకు మద్దతు లేదు.',
      testNotification: 'టెస్ట్ అలర్ట్ పంపండి',
      testSent: 'మీ ఫోన్/డివైస్‌కు టెస్ట్ నోటిఫికేషన్ పంపబడింది.',
      testTitle: 'PharmaShelf అలర్ట్‌లు సిద్ధంగా ఉన్నాయి',
      testBody: '30/15/7 రోజుల గడువు హెచ్చరికలు మరియు ముగిసిన స్టాక్ అలర్ట్‌లు ఇక్కడ వస్తాయి.',
      newExpiryTitle: 'PharmaShelf: మందు గడువు దగ్గరపడింది',
      newExpiredTitle: 'PharmaShelf: గడువు ముగిసిన బ్యాచ్',
      newApprovalTitle: 'PharmaShelf: యజమాని అనుమతి అవసరం',
      viewAlertsBtn: 'హెచ్చరికలు చూడండి',
      viewApprovalsBtn: 'అనుమతులు చూడండి',
      viewLowStockBtn: 'తక్కువ స్టాక్ చూడండి',
      alertsExplainTitle: 'యాప్ & ఫోన్ నోటిఫికేషన్లు ఎలా వస్తాయి',
      alertsExplainBody:
        'అన్ని 30/15/7 రోజుల గడువు హెచ్చరికలు యాప్‌లో (హెచ్చరికల ట్యాబ్ & పై బెల్ ఐకాన్) వెంటనే కనిపిస్తాయి. మీ ఫోన్ లేదా బ్రౌజర్‌లో పాప్-అప్ నోటిఫికేషన్ల కోసం డివైస్ అలర్ట్‌లను ఆన్ చేయండి.',
      sectionTitle: 'యాప్ & ఫోన్ నోటిఫికేషన్లు',
      sectionDesc:
        'మందులు 30/15/7 రోజుల గడువుకు చేరినప్పుడు లేదా సిబ్బంది అనుమతి అడిగినప్పుడు మీ ఫోన్/బ్రౌజర్‌లో నోటిఫికేషన్లు పొందండి.',
    },
  },
};

export function translateError(code: string, lang: Language): string {
  const dict = translations[lang].errors;
  return dict[code] ?? dict.NETWORK_ERROR;
}
