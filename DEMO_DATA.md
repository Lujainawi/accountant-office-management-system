\
# Safe Demo Data

## Purpose

Use only the fictitious records in this document for local demos, screenshots, test data, and GitHub presentation.

Do **not** use real names, real client contact details, real invoices, real tax identifiers, real bank documents, or real financial records.

## Demo Office Settings

```text
Accountant name: יואב לוי
Office name: לוי חשבונאות וניהול
Default VAT rate: 18.00%
Currency: ILS
```

## Demo User

Create this only through a local seed script or environment-driven setup. Do not commit a real password.

```text
Name: מנהל מערכת
Email: admin@example.test
Role: admin
Password: set locally through a development-only environment variable
```

## Demo Clients

| Client name | Business name | Phone | Email | Business ID | Type | Status |
|---|---|---|---|---|---|---|
| דנה כהן | סטודיו דנה — עיצוב פנים | 050-555-0101 | dana@example.test | DEMO-1001 | authorized_dealer | active |
| סאמר ח׳טיב | סאמר טק שירותים | 050-555-0102 | samer@example.test | DEMO-1002 | exempt_dealer | active |
| רמי לוי | רמי לוי ייעוץ | 050-555-0103 | rami@example.test | DEMO-1003 | private_client | inactive |
| אורן ברק | ברק פתרונות בע״מ | 050-555-0104 | oren@example.test | DEMO-1004 | company | active |

## Demo Documents

| Client | Name | Type | Date | Before VAT | VAT rate | VAT | Total | Status |
|---|---|---:|---|---:|---:|---:|---:|---|
| דנה כהן | חשבונית דוגמה — מאי 2026 | invoice | 2026-05-15 | 1,000.00 | 18.00% | 180.00 | 1,180.00 | completed |
| דנה כהן | קבלה דוגמה — מאי 2026 | receipt | 2026-05-20 | 500.00 | 18.00% | 90.00 | 590.00 | new |
| סאמר ח׳טיב | מסמך בנק דוגמה — מאי 2026 | bank_document | 2026-05-10 | 0.00 | 18.00% | 0.00 | 0.00 | in_progress |
| אורן ברק | דוח דוגמה — אפריל 2026 | report | 2026-04-30 | 2,500.00 | 18.00% | 450.00 | 2,950.00 | missing_information |

Create harmless placeholder files (for example, a small text/PDF/image generated only for the demo) rather than using real source documents.

## Demo Tasks

| Client | Title | Due date | Priority | Status |
|---|---|---|---|---|
| דנה כהן | בדיקת קבלה שהועלתה | 2026-05-22 | high | open |
| סאמר ח׳טיב | בקשת מסמך חסר | 2026-05-25 | urgent | in_progress |
| אורן ברק | השלמת נתונים לדוח | 2026-05-18 | urgent | open |
| רמי לוי | עדכון סטטוס לקוח | 2026-05-30 | low | done |

## Demo Payments

| Client | Document | Amount | Status | Date |
|---|---|---:|---|---|
| דנה כהן | חשבונית דוגמה — מאי 2026 | 1,180.00 | paid | 2026-05-18 |
| דנה כהן | קבלה דוגמה — מאי 2026 | 590.00 | pending | — |
| אורן ברק | דוח דוגמה — אפריל 2026 | 1,000.00 | partially_paid | 2026-05-12 |

## Screenshot Checklist

Before publishing a screenshot or recording:

- Confirm all names and contact details are the fictitious values above.
- Confirm no real browser tabs, folders, API keys, terminal history, or local file paths appear.
- Confirm mock pages are labeled as mock/planned.
- Confirm screen captures do not show an `.env` file or development password.
