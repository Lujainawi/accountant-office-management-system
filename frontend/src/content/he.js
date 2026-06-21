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
    description: "מסך הכניסה יופעל בשלב מאוחר יותר.",
  },
  dashboard: {
    title: "לוח בקרה",
    description: "סיכומי נתונים יוצגו לאחר חיבור למערכת.",
  },
  clients: {
    title: "לקוחות",
    description: "ניהול לקוחות יתווסף בשלב מאוחר יותר.",
  },
  addClient: {
    title: "הוספת לקוח",
    description: "טופס הוספת לקוח יתווסף בשלב מאוחר יותר.",
  },
  editClient: {
    title: "עריכת לקוח",
    description: "טופס עריכת לקוח יתווסף בשלב מאוחר יותר.",
  },
  clientDetails: {
    title: "פרטי לקוח",
    description: "פרטי הלקוח יוצגו לאחר חיבור למערכת.",
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
};
