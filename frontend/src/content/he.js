export const appTitle = "מערכת ניהול משרד רואה חשבון";

export const navItems = [
  { to: "/", label: "לוח בקרה", end: true },
  { to: "/clients", label: "לקוחות" },
  { to: "/documents", label: "מסמכים" },
  { to: "/tasks", label: "משימות" },
  { to: "/vat-calculator", label: "מחשבון מע״מ" },
  { to: "/reports", label: "דוחות חודשיים" },
  { to: "/settings", label: "הגדרות" },
];

export const pages = {
  login: {
    title: "כניסה למערכת",
    description: "הזינו את פרטי ההתחברות שלכם כדי לגשת למערכת הפנימית.",
  },
  dashboard: {
    title: "לוח בקרה",
    description: "סקירת נתוני המשרד מהמערכת.",
  },
  clients: {
    title: "לקוחות",
    description: "ניהול לקוחות המשרד, חיפוש, סינון ועריכה.",
  },
  addClient: {
    title: "הוספת לקוח",
    description: "הזינו את פרטי הלקוח החדש.",
  },
  editClient: {
    title: "עריכת לקוח",
    description: "עדכנו את פרטי הלקוח. ניתן לנקות שדות אופציונליים על ידי השארתם ריקים.",
  },
  clientDetails: {
    title: "פרטי לקוח",
    description: "צפייה בפרטי הלקוח ופעולות ניהול.",
  },
  documents: {
    title: "מסמכים",
    description: "ניהול מסמכי המשרד, העלאה, חיפוש וסינון.",
  },
  uploadDocument: {
    title: "העלאת מסמך",
    description: "העלאת מסמך חדש עם פרטים וקובץ מאושר לדוגמה.",
  },
  editDocument: {
    title: "עריכת מסמך",
    description: "עדכון פרטי המסמך. הקובץ עצמו אינו משתנה בשלב זה.",
  },
  documentDetails: {
    title: "פרטי מסמך",
    description: "צפייה בפרטי המסמך, הורדה ופעולות ניהול.",
  },
  tasks: {
    title: "משימות",
    description: "ניהול משימות המשרד, מעקב אחר עדיפויות ותאריכי יעד.",
  },
  addTask: {
    title: "הוספת משימה",
    description: "יצירת משימה חדשה עבור לקוח.",
  },
  editTask: {
    title: "עריכת משימה",
    description: "עדכון פרטי המשימה.",
  },
  addPayment: {
    title: "הוספת רשומת תשלום",
    description: "רישום ידני של תשלום שהתקבל מהלקוח.",
  },
  editPayment: {
    title: "עריכת רשומת תשלום",
    description: "עדכון פרטי רשומת התשלום.",
  },
  vatCalculator: {
    title: "מחשבון מע״מ",
    description: "חישוב סכומי מע״מ לפני מע״מ או מסכום כולל מע״מ, לפי שיעור המע״מ הפעיל.",
  },
  reports: {
    title: "דוחות חודשיים",
    description: "דוחות חודשיים יתווספו בשלב מאוחר יותר.",
  },
  settings: {
    title: "הגדרות",
    description: "ניהול פרטי המשרד, ברירות מחדל למע״מ ומדיניות קבצים מותרים להעלאה.",
  },
  notFound: {
    title: "העמוד לא נמצא",
    description: "הכתובת שביקשת אינה קיימת במערכת.",
  },
};

export const ui = {
  emptyStateTitle: "בקרוב",
  openMenu: "פתיחת תפריט",
  closeMenu: "סגירת תפריט",
  mainNavigation: "ניווט ראשי",
  loading: "טוען...",
  error: "אירעה שגיאה",
  backToDashboard: "חזרה ללוח הבקרה",
  view: "צפייה",
  edit: "עריכה",
  notAvailable: "—",
  all: "הכל",
  resetFilters: "איפוס סינון",
  contactPhone: "טלפון",
  contactEmail: "אימייל",
  contactBusinessId: "מספר עוסק / ח.פ.",
};

export const auth = {
  emailLabel: "אימייל",
  passwordLabel: "סיסמה",
  loginButton: "כניסה",
  logoutButton: "יציאה",
  invalidLogin: "אימייל או סיסמה שגויים.",
  unexpectedError: "אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.",
};

export const clients = {
  fields: {
    clientName: "שם הלקוח",
    businessName: "שם העסק",
    clientType: "סוג לקוח",
    status: "סטטוס",
    phone: "טלפון",
    email: "אימייל",
    businessId: "מספר עוסק / ח.פ.",
    address: "כתובת",
    notes: "הערות פנימיות",
    notesHint: "הערות אלו מיועדות לשימוש פנימי במשרד בלבד.",
    updatedAt: "עודכן לאחרונה",
    contact: "יצירת קשר",
  },
  actions: {
    addClient: "הוספת לקוח",
    backToList: "חזרה לרשימת לקוחות",
    cancel: "ביטול",
    saveClient: "שמירת לקוח",
    saveChanges: "שמירת שינויים",
    editClient: "עריכת לקוח",
    archiveClient: "ארכוב לקוח",
    deleteClient: "מחיקה לצמיתות",
    viewDetails: "פרטי לקוח",
  },
  list: {
    searchLabel: "חיפוש לקוחות",
    searchPlaceholder: "שם, עסק, טלפון, אימייל או מספר עוסק",
    statusFilter: "סטטוס",
    typeFilter: "סוג לקוח",
    emptyTitle: "אין לקוחות עדיין",
    emptyDescription: "הוסיפו את הלקוח הראשון כדי להתחיל לנהל את פרטי המשרד.",
    noResultsTitle: "לא נמצאו לקוחות",
    noResultsDescription: "נסו לשנות את החיפוש או את מסנני הסטטוס והסוג.",
    columns: {
      name: "שם",
      business: "עסק",
      contact: "יצירת קשר",
      type: "סוג",
      status: "סטטוס",
      updated: "עודכן",
      actions: "פעולות",
    },
  },
  details: {
    sectionTitle: "פרטי לקוח",
    internalNotesLabel: "הערות פנימיות",
    noNotes: "אין הערות פנימיות.",
    notFoundTitle: "הלקוח לא נמצא",
    notFoundDescription: "ייתכן שהלקוח נמחק או שהמזהה אינו תקין.",
  },
  confirm: {
    cancel: "ביטול",
    archiveTitle: "ארכוב לקוח",
    archiveDescription:
      "הלקוח יסומן כלא פעיל ויישאר במערכת. ניתן להפעיל אותו מחדש בעריכה.",
    archiveConfirm: "ארכוב",
    deleteTitle: "מחיקה לצמיתות",
    deleteDescription:
      "פעולה זו תסיר את הלקוח לצמיתות מהמערכת. לא ניתן לשחזר את הרשומה.",
    deleteConfirm: "מחק לצמיתות",
  },
  validation: {
    clientNameRequired: "שם הלקוח הוא שדה חובה.",
    noChanges: "לא בוצעו שינויים לשמירה.",
  },
  errors: {
    loadFailed: "לא ניתן לטעון את רשימת הלקוחות.",
    loadClientFailed: "לא ניתן לטעון את פרטי הלקוח.",
    loadSummaryFailed: "לא ניתן לטעון את סיכום הלקוח.",
    saveFailed: "לא ניתן לשמור את פרטי הלקוח.",
    archiveFailed: "לא ניתן לארכב את הלקוח.",
    deleteFailed: "לא ניתן למחוק את הלקוח.",
    unexpected: "אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.",
  },
  workspace: {
    summary: {
      documents: "מסמכים",
      openTasks: "משימות פתוחות",
      totalBeforeVat: "סה״כ לפני מע״מ",
      vatTotal: "סה״כ מע״מ",
      totalIncludingVat: "סה״כ כולל מע״מ",
      paymentRecords: "רשומות תשלום",
      paymentStatusTitle: "סטטוס תשלומים",
      paymentStatusUnpaid: "לא שולם",
      paymentStatusPaid: "שולם",
      paymentStatusPartiallyPaid: "שולם חלקית",
      paymentStatusPending: "ממתין",
      paymentStatusFailed: "נכשל",
      documentStatusTitle: "סטטוס מסמכים",
      statusNew: "חדש",
      statusInProgress: "בטיפול",
      statusCompleted: "הושלם",
      statusMissingInfo: "חסר מידע",
    },
    sections: {
      documents: "מסמכים",
      tasks: "משימות",
      payments: "תשלומים",
    },
    documents: {
      explanation: "עדיין אין מסמכים ללקוח זה.",
      viewAll: "כל המסמכים של הלקוח",
      addDocument: "הוספת מסמך",
      loadFailed: "לא ניתן לטעון את מסמכי הלקוח.",
    },
    tasks: {
      explanation: "עדיין אין משימות ללקוח זה.",
      viewAll: "כל המשימות של הלקוח",
      addTask: "הוספת משימה",
      loadFailed: "לא ניתן לטעון את משימות הלקוח.",
    },
    payments: {
      explanation: "עדיין אין רשומות תשלום ללקוח זה.",
      addPayment: "הוספת רשומת תשלום",
      loadFailed: "לא ניתן לטעון את רשומות התשלום של הלקוח.",
    },
    notes: {
      saveNotes: "שמירת הערות",
      saveSuccess: "הערות נשמרו בהצלחה.",
      saveFailed: "לא ניתן לשמור את ההערות.",
    },
  },
};

export const payments = {
  disclaimer:
    "רישום פנימי של תשלומים שהתקבלו מהלקוח. המערכת אינה מבצעת סליקה, גבייה או תשלום בפועל.",
  actions: {
    savePayment: "שמירת רשומת תשלום",
    saveChanges: "שמירת שינויים",
    deletePayment: "מחיקת רשומת תשלום",
    cancel: "ביטול",
    backToClient: "חזרה לפרטי הלקוח",
    backToClients: "חזרה לרשימת לקוחות",
  },
  fields: {
    client: "לקוח",
    amount: "סכום",
    status: "סטטוס תשלום",
    paymentMethod: "אמצעי תשלום",
    paymentDate: "תאריך תשלום",
    paymentPeriod: "תקופה / שירות",
    document: "מסמך מקושר",
    notes: "הערות פנימיות",
    noDocument: "ללא מסמך",
    noMethod: "ללא אמצעי תשלום",
  },
  statuses: {
    unpaid: "לא שולם",
    paid: "שולם",
    partially_paid: "שולם חלקית",
    pending: "ממתין",
    failed: "נכשל",
  },
  methods: {
    cash: "מזומן",
    bank_transfer: "העברה בנקאית",
    check: "צ׳ק",
    bit: "ביט",
    standing_order: "הוראת קבע",
    other: "אחר",
  },
  list: {
    paymentDateLabel: "תאריך",
    methodLabel: "אמצעי",
    periodLabel: "תקופה",
    documentLabel: "מסמך",
  },
  details: {
    notFoundTitle: "רשומת התשלום לא נמצאה",
    notFoundDescription: "ייתכן שהרשומה נמחקה או שהמזהה אינו תקין.",
  },
  confirm: {
    cancel: "ביטול",
    deleteTitle: "מחיקת רשומת תשלום",
    deleteDescription:
      "פעולה זו תסיר את רשומת התשלום לצמיתות. לא ניתן לשחזר את הרשומה.",
    deleteConfirm: "מחק רשומה",
  },
  validation: {
    amountRequired: "סכום התשלום הוא שדה חובה.",
    amountInvalid: "סכום התשלום אינו תקין.",
    amountNegative: "סכום התשלום חייב להיות ערך לא שלילי.",
    amountScale: "סכום התשלום יכול לכלול לכל היותר שתי ספרות עשרוניות.",
    methodRequired: "יש לבחור אמצעי תשלום עבור סטטוס שולם או שולם חלקית.",
    dateRequired: "יש להזין תאריך תשלום עבור סטטוס שולם או שולם חלקית.",
    periodTooLong: "שדה התקופה/שירות יכול לכלול עד 100 תווים.",
    noChanges: "לא בוצעו שינויים לשמירה.",
  },
  errors: {
    loadFailed: "לא ניתן לטעון את רשומות התשלום.",
    loadClientFailed: "לא ניתן לטעון את פרטי הלקוח.",
    saveFailed: "לא ניתן לשמור את רשומת התשלום.",
    deleteFailed: "לא ניתן למחוק את רשומת התשלום.",
    unexpected: "אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.",
    missingClientTitle: "לא ניתן להוסיף רשומת תשלום",
    missingClientDescription:
      "יש לפתוח רשומת תשלום חדשה מתוך פרטי לקוח. בחרו לקוח מהרשימה ונסו שוב.",
  },
};

export const documents = {
  actions: {
    uploadDocument: "העלאת מסמך",
    addDocument: "הוספת מסמך",
    saveDocument: "שמירת מסמך",
    downloadDocument: "הורדת קובץ",
    deleteDocument: "מחיקת מסמך",
    viewDocument: "צפייה במסמך",
    backToDocuments: "חזרה לרשימת מסמכים",
    editDocument: "עריכת מסמך",
    cancel: "ביטול",
    retryLoad: "נסו שוב",
  },
  fields: {
    documentName: "שם המסמך",
    documentType: "סוג מסמך",
    documentDate: "תאריך מסמך",
    amountBeforeVat: "סכום לפני מע״מ",
    vatRate: "שיעור מע״מ (%)",
    vatAmount: "סכום מע״מ",
    totalAmount: "סה״כ כולל מע״מ",
    status: "סטטוס",
    notes: "הערות",
    client: "לקוח",
    originalFilename: "שם קובץ",
    fileSize: "גודל קובץ",
    file: "קובץ",
    fileHintTemplate: "סוגים מותרים: {extensions}. גודל מרבי: {maxSizeMb} MB.",
  },
  form: {
    infoSection: "פרטי המסמך",
    fileSection: "בחירת קובץ",
    selectClient: "בחרו לקוח",
    previewSection: "חישוב לפני שמירה",
    previewEmpty: "הזינו סכום לפני מע״מ ושיעור מע״מ תקינים כדי לראות חישוב.",
    previewNote: "החישוב המוצג הוא לצפייה בלבד. הסכומים הסופיים נקבעים במערכת בעת השמירה.",
    vatPolicyNotice:
      "שינוי שיעור מע״מ ברירת המחדל משפיע על מסמכים חדשים בלבד. מסמכים קיימים שומרים את שיעור המע״מ שנשמר עליהם בעת יצירה או עדכון.",
    createVatHint: "שיעור המע״מ נטען מהגדרות המשרד. ניתן לשנותו למסמך זה לפני השמירה.",
    editVatHint: "מוצג שיעור המע״מ השמור על המסמך. שינוי בהגדרות המשרד לא משנה אותו אוטומטית.",
    settingsLink: "הגדרות המשרד",
  },
  list: {
    searchLabel: "חיפוש מסמכים",
    searchPlaceholder: "שם מסמך או הערות",
    clientFilter: "לקוח",
    typeFilter: "סוג מסמך",
    statusFilter: "סטטוס",
    monthFilter: "חודש",
    yearFilter: "שנה",
    emptyTitle: "אין מסמכים עדיין",
    emptyDescription: "העלו מסמך ראשון כדי להתחיל לנהל את תיק הלקוחות.",
    noResultsTitle: "לא נמצאו מסמכים",
    noResultsDescription: "נסו לשנות את החיפוש או את המסננים.",
    columns: {
      name: "שם",
      client: "לקוח",
      type: "סוג",
      date: "תאריך",
      total: "סה״כ",
      status: "סטטוס",
      actions: "פעולות",
    },
  },
  confirm: {
    deleteTitle: "מחיקת מסמך",
    deleteDescription:
      "פעולה זו תסיר את המסמך ואת הקובץ מהמערכת. לא ניתן לשחזר.",
    deleteConfirm: "מחק מסמך",
    cancel: "ביטול",
  },
  validation: {
    clientRequired: "יש לבחור לקוח.",
    documentNameRequired: "שם המסמך הוא שדה חובה.",
    documentDateRequired: "תאריך מסמך הוא שדה חובה.",
    amountRequired: "סכום לפני מע״מ הוא שדה חובה.",
    noChanges: "לא בוצעו שינויים לשמירה.",
  },
  errors: {
    loadFailed: "לא ניתן לטעון את רשימת המסמכים.",
    loadDocumentFailed: "לא ניתן לטעון את פרטי המסמך.",
    loadUploadPageFailed: "לא ניתן לטעון את הגדרות המשרד הנדרשות להעלאת מסמך.",
    saveFailed: "לא ניתן לשמור את המסמך.",
    uploadFailed: "לא ניתן להעלות את המסמך.",
    downloadFailed: "לא ניתן להוריד את הקובץ.",
    deleteFailed: "לא ניתן למחוק את המסמך.",
    fileRequired: "יש לבחור קובץ להעלאה.",
    unexpected: "אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.",
  },
  details: {
    notFoundTitle: "המסמך לא נמצא",
    notFoundDescription: "ייתכן שהמסמך נמחק או שהמזהה אינו תקין.",
  },
};

export const tasks = {
  actions: {
    addTask: "הוספת משימה",
    saveTask: "שמירת משימה",
    saveChanges: "שמירת שינויים",
    deleteTask: "מחיקת משימה",
    markDone: "סימון כהושלם",
    editTask: "עריכת משימה",
    backToTasks: "חזרה לרשימת משימות",
  },
  fields: {
    client: "לקוח",
    document: "מסמך קשור",
    noDocument: "ללא מסמך",
    documentLoading: "טוען מסמכים…",
    title: "כותרת",
    description: "תיאור",
    dueDate: "תאריך יעד",
    priority: "עדיפות",
    status: "סטטוס",
    clientFilter: "סינון לפי לקוח",
    statusFilter: "סינון לפי סטטוס",
    priorityFilter: "סינון לפי עדיפות",
  },
  list: {
    emptyTitle: "אין משימות עדיין",
    emptyDescription: "הוסיפו משימה ראשונה כדי להתחיל לעקוב אחר עבודה פנימית.",
    noResultsTitle: "לא נמצאו משימות",
    noResultsDescription: "נסו לשנות את הסינון או להוסיף משימה חדשה.",
    columnTitle: "כותרת",
    columnClient: "לקוח",
    columnDueDate: "תאריך יעד",
    columnPriority: "עדיפות",
    columnStatus: "סטטוס",
    columnActions: "פעולות",
  },
  badges: {
    urgent: "דחוף",
    overdue: "באיחור",
  },
  confirm: {
    deleteTitle: "מחיקת משימה",
    deleteDescription: "האם למחוק את המשימה? פעולה זו אינה ניתנת לביטול.",
    deleteConfirm: "מחק משימה",
    markDoneTitle: "סימון משימה כהושלמה",
    markDoneDescription: "האם לסמן את המשימה כהושלמה?",
    markDoneConfirm: "סימון כהושלם",
    cancel: "ביטול",
  },
  validation: {
    clientRequired: "יש לבחור לקוח.",
    titleRequired: "כותרת המשימה היא שדה חובה.",
    noChanges: "לא בוצעו שינויים לשמירה.",
  },
  errors: {
    loadFailed: "לא ניתן לטעון את רשימת המשימות.",
    loadTaskFailed: "לא ניתן לטעון את פרטי המשימה.",
    saveFailed: "לא ניתן לשמור את המשימה.",
    deleteFailed: "לא ניתן למחוק את המשימה.",
    markDoneFailed: "לא ניתן לסמן את המשימה כהושלמה.",
    unexpected: "אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.",
  },
  details: {
    notFoundTitle: "המשימה לא נמצאה",
    notFoundDescription: "ייתכן שהמשימה נמחקה או שהמזהה אינו תקין.",
  },
  priorities: {
    low: "נמוכה",
    medium: "בינונית",
    high: "גבוהה",
    urgent: "דחוף",
  },
  statuses: {
    open: "פתוח",
    in_progress: "בטיפול",
    done: "הושלם",
  },
};

export const dashboard = {
  welcomeTemplate: "ברוכים הבאים ל{officeName}",
  metrics: {
    totalClients: "סה״כ לקוחות",
    activeClients: "לקוחות פעילים",
    totalDocuments: "סה״כ מסמכים",
    openTasks: "משימות פתוחות",
    urgentTasks: "משימות דחופות",
    totalBeforeVat: "סה״כ לפני מע״מ",
    vatTotal: "סה״כ מע״מ",
    totalIncludingVat: "סה״כ כולל מע״מ",
    documentStatusTitle: "סטטוס מסמכים",
    statusNew: "חדש",
    statusInProgress: "בטיפול",
    statusCompleted: "הושלם",
    statusMissingInfo: "חסר מידע",
  },
  sections: {
    clients: "לקוחות",
    documents: "מסמכים",
    tasks: "משימות",
  },
  financialSectionTemplate: "סיכום כספי — {monthLabel}",
  attention: {
    title: "דורש טיפול",
    urgentTasksTitle: "משימות דחופות",
    missingDocumentsTitle: "מסמכים עם חסר מידע",
    noUrgentTasks: "אין משימות דחופות כרגע.",
    noMissingDocuments: "אין מסמכים עם חסר מידע כרגע.",
  },
  emptyOffice: {
    title: "עדיין אין נתוני משרד",
    description:
      "לא נוספו עדיין לקוחות, מסמכים או משימות למערכת. התחילו בהוספת לקוח ראשון כדי לנהל את עבודת המשרד.",
    actionLabel: "הוספת לקוח ראשון",
  },
  errors: {
    loadFailed: "לא ניתן לטעון את לוח הבקרה.",
    retry: "נסו שוב",
  },
  hebrewMonths: [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ],
};

export const settings = {
  sections: {
    identity: "זהות המשרד",
    vatCurrency: "מע״מ ומטבע",
    files: "קבצים מותרים להעלאה",
  },
  fields: {
    accountantName: "שם רואה החשבון",
    officeName: "שם המשרד",
    defaultVatRate: "שיעור מע״מ ברירת מחדל (%)",
    defaultCurrency: "מטבע ברירת מחדל",
    defaultCurrencyHint: "מוצג לקריאה בלבד. המערכת מציגה סכומים בשקלים חדשים (₪).",
    allowedExtensions: "סוגי קבצים מותרים",
  },
  extensionsDescription:
    "ניתן לבחור רק מתוך סוגי הקבצים המאושרים על ידי המערכת. טפסי העלאה משתמשים במדיניות הפעילה בפועל.",
  vatPolicyNotice:
    "שינוי שיעור מע״מ ברירת המחדל משפיע על מסמכים חדשים בלבד. מסמכים קיימים שומרים את שיעור המע״מ שנשמר עליהם בעת יצירה או עדכון.",
  actions: {
    save: "שמירת הגדרות",
    cancel: "ביטול",
    retryLoad: "נסו שוב",
  },
  validation: {
    accountantNameRequired: "שם רואה החשבון הוא שדה חובה.",
    officeNameRequired: "שם המשרד הוא שדה חובה.",
    extensionsRequired: "יש לבחור לפחות סוג קובץ אחד מותר.",
  },
  messages: {
    saveSuccess: "ההגדרות נשמרו בהצלחה.",
    legacyExtensionsWarning:
      "קיימות הגדרות קובץ לא נתמכות או שאין סוגי קבצים פעילים להעלאה. בחרו לפחות סוג קובץ מאובטח אחד ושמרו מחדש.",
    effectiveExtensionsTemplate: "סוגים פעילים להעלאה: {extensions}",
  },
  errors: {
    loadFailed: "לא ניתן לטעון את הגדרות המשרד.",
    saveFailed: "לא ניתן לשמור את ההגדרות.",
  },
};

export const vatCalculator = {
  modes: {
    fromBeforeVat: "סכום לפני מע״מ",
    fromTotalIncludingVat: "סה״כ כולל מע״מ",
  },
  fields: {
    modeLegend: "מצב חישוב",
    amountBeforeVat: "סכום לפני מע״מ",
    totalIncludingVat: "סה״כ כולל מע״מ",
    vatRate: "שיעור מע״מ (%)",
    vatRateHint: "ברירת המחדל מהגדרות המשרד: {rate}%. ניתן לשנות לחישוב זה.",
  },
  formulaHint: "סכום מע״מ = סכום לפני מע״מ × שיעור מע״מ ÷ 100",
  results: {
    title: "תוצאות החישוב",
    amountBeforeVat: "סכום לפני מע״מ",
    vatAmount: "סכום מע״מ",
    totalAmount: "סה״כ כולל מע״מ",
    loading: "מחשב...",
    empty: "הזינו נתונים ולחצו על \"חישוב\" כדי לראות תוצאות.",
  },
  actions: {
    calculate: "חישוב",
    reset: "איפוס",
    settingsLink: "הגדרות המשרד",
    retryLoad: "נסו שוב",
  },
  errors: {
    loadFailed: "לא ניתן לטעון את ברירת המחדל של שיעור המע״מ.",
    calculateFailed: "לא ניתן לבצע את החישוב.",
  },
};
