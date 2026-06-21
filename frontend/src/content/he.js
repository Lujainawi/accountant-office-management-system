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
    description: "סיכומי נתונים יוצגו לאחר חיבור למערכת.",
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
    description: "ניהול מסמכים יתווסף בשלב מאוחר יותר.",
  },
  uploadDocument: {
    title: "העלאת מסמך",
    description: "טופס העלאת מסמך יתווסף בשלב מאוחר יותר.",
  },
  editDocument: {
    title: "עריכת מסמך",
    description: "טופס עריכת מסמך יתווסף בשלב מאוחר יותר.",
  },
  tasks: {
    title: "משימות",
    description: "ניהול משימות יתווסף בשלב מאוחר יותר.",
  },
  vatCalculator: {
    title: "מחשבון מע״מ",
    description: "מחשבון המע״מ יתווסף בשלב מאוחר יותר.",
  },
  reports: {
    title: "דוחות חודשיים",
    description: "דוחות חודשיים יתווספו בשלב מאוחר יותר.",
  },
  settings: {
    title: "הגדרות",
    description: "הגדרות המשרד יתווספו בשלב מאוחר יותר.",
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
      disabledAction: "הוספת מסמך תתאפשר בהמשך",
      explanation: "עדיין אין מסמכים ללקוח זה. העלאת מסמכים תהיה זמינה בהמשך.",
    },
    tasks: {
      disabledAction: "ניהול משימות יתווסף בהמשך",
      explanation: "עדיין אין משימות ללקוח זה. ניהול משימות יתווסף בהמשך.",
    },
    payments: {
      disabledAction: "מעקב תשלומים יתווסף בהמשך",
      explanation: "עדיין אין רשומות תשלום ללקוח זה. מעקב תשלומים יתווסף בהמשך.",
    },
    notes: {
      saveNotes: "שמירת הערות",
      saveSuccess: "הערות נשמרו בהצלחה.",
      saveFailed: "לא ניתן לשמור את ההערות.",
    },
  },
};
