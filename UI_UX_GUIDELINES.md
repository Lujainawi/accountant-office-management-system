\
# Accountant Office Management System — UI/UX Guidelines

## 1. Goal

Create a calm, professional, modern internal tool that helps an accountant work quickly without feeling visually overloaded.

The product should feel trustworthy and organized, not like a generic dashboard template. It must prioritize readability, correct data entry, clear status, and fast access to client information.

## 2. Language and Direction

- The MVP interface is Hebrew-first.
- Use `dir="rtl"` and `lang="he"` at the application root.
- Keep text labels centralized in a small `src/content/he.js` or similar file so Arabic/English can be added later without redesigning pages.
- Do not implement a full language switcher in the MVP unless explicitly requested.
- Numbers, currency values, dates, email addresses, and file names should remain readable inside RTL layouts.

## 3. Visual Style

### Brand feeling

- Professional.
- Calm.
- Reliable.
- Clear.
- Modern without looking flashy.

### Suggested visual system

- Light background with white content surfaces.
- Deep navy / dark slate for navigation and key text.
- One restrained accent color, such as teal or blue, for active states and primary actions.
- Semantic status colors only for status meaning: success, warning, danger, neutral.
- Soft borders, moderate rounded corners, and restrained shadows.
- No gradients, neon colors, excessive animation, or decorative clutter in the MVP.

### CSS rules

- Use CSS variables for colors, spacing, radius, shadows, and typography.
- Use a consistent spacing scale: `4, 8, 12, 16, 24, 32` pixels.
- Use a readable sans-serif Hebrew-capable system font stack.
- Do not introduce Tailwind, Bootstrap, Material UI, or another large UI framework unless approved.

## 4. Layout

### Desktop

- Persistent sidebar on the right for RTL.
- Top bar with page title, user menu, and logout action.
- Main content area with comfortable max width and spacing.
- Sidebar menu order:

```text
לוח בקרה
לקוחות
מסמכים
משימות
מחשבון מע״מ
דוחות חודשיים
הגדרות
מודולים עתידיים
```

### Tablet and mobile

- Sidebar collapses into a menu button.
- Tables must remain usable: responsive cards, horizontal scroll with clear headers, or carefully selected columns.
- Primary actions remain visible and easy to tap.
- Forms become one column when width is limited.
- Do not hide important errors or destructive actions behind unclear icons.

## 5. Shared Components

Create reusable components rather than repeating markup:

- `AppLayout`
- `Sidebar`
- `Topbar`
- `PageHeader`
- `PrimaryButton`
- `SecondaryButton`
- `DangerButton`
- `StatusBadge`
- `MetricCard`
- `EmptyState`
- `ErrorMessage`
- `LoadingState`
- `ConfirmDialog`
- `SearchInput`
- `FilterBar`
- `Pagination` only when the dataset requires it
- `FormField`
- `MoneyDisplay`
- `DateDisplay`

## 6. Page Requirements

### 6.1 Login

- Simple centered card.
- Office/system title.
- Email and password labels above inputs.
- Clear invalid-login error message.
- No public signup link.
- No demo credentials shown in production screenshots; safe local demo details can be in developer documentation only.

### 6.2 Dashboard

- Clear welcome/header with current office name.
- Metric cards arranged in meaningful groups: clients, documents, tasks, financial totals.
- Urgent tasks visually distinguishable but not alarming.
- Include a small “needs attention” area for tasks or documents missing information.
- Show an informative empty state if there are no records.
- Do not use fake hard-coded data after dashboard integration is complete.

### 6.3 Client List

- Prominent “הוספת לקוח” primary action.
- Search by name, business, phone, email, and business ID.
- Filter chips/selects for status and client type.
- Table columns should include name, business, contact, type, status, updated date, and actions.
- Status uses a badge, not only color.
- Empty state includes a direct path to add the first client.

### 6.4 Client Details

This is the most important page.

Include:

- Client identity and status at the top.
- Edit and safe archive/delete action.
- Summary metrics for documents, VAT totals, open tasks, and payment status.
- Tabs or clearly separated sections for Documents, Tasks, Payments, and Notes.
- Each section includes a concise list and “add” action.
- Internal notes must be visually labeled as internal.

### 6.5 Document Management

- Clear upload CTA.
- Upload form separates document information from file selection.
- File field describes allowed types and maximum size before upload.
- Never claim that OCR processed a document in the MVP.
- Status badge is visible in lists and detail pages.
- Money values align consistently and always show ILS / two decimal places.
- Date filters should have a clear reset action.
- Download action appears only for an authenticated user with access.

### 6.6 VAT Calculator

- Two clearly separated calculation modes:
  - Amount before VAT → VAT + total.
  - Total including VAT → amount before VAT + VAT.
- Show active VAT rate and a link to Settings.
- Disable/avoid ambiguous calculation when required input is missing.
- Display a small explanatory formula without clutter.

### 6.7 Tasks

- Quick task creation.
- Clear overdue/urgent indicators using both text/icon and color.
- “Mark as done” is immediately visible.
- Filter by client, status, and priority.
- Do not make a task appear completed until the user confirms it.

### 6.8 Monthly Reports

- Month and year selector at top.
- Visible label: `סיכום פנימי למשרד — אינו דוח מס רשמי`.
- Summary cards first, then breakdown tables.
- Values must be derived from the database, not fabricated.
- Empty-state text explains that adding documents for the selected month will populate the report.

### 6.9 Settings

- Group settings logically: office identity, VAT/currency, file-policy display, future integrations.
- Explain that a VAT-rate change applies to new documents only.
- Display permitted file types as informational chips/list.
- Save button should communicate loading, success, and failure states.

### 6.10 Future Modules

- Every page has a large clear status badge: `מתוכנן`, `מצב הדגמה`, or `בקרוב`.
- Explain what the future feature could do.
- Do not show a button that implies a real action is taking place.
- Mock results should be visibly marked “Example / Mock Data”.

## 7. Forms and Validation

- Use labels above inputs, not placeholders as the only label.
- Required fields display a clear required indicator and helpful explanation when needed.
- Show errors next to the related field plus an accessible summary for server-side errors.
- Preserve typed values after a validation failure when practical.
- Disable submit only while a request is actively being sent; do not silently disable forms without an explanation.
- Confirm destructive actions such as deleting a client, document, task, or payment.
- Use date inputs that work in RTL layouts and validate actual dates.
- Ensure amount fields accept valid decimals, not invalid text.

## 8. Accessibility and Quality

- Use semantic HTML (`nav`, `main`, `header`, `button`, `label`, `table`).
- Ensure full keyboard navigation and visible focus states.
- Never communicate status with color alone; include labels/icons/text.
- Keep text/background contrast readable.
- Give buttons descriptive accessible names.
- Use `aria-live` for save/error feedback when appropriate.
- Do not use auto-playing animations or layout shifts.
- Show predictable loading and error states for every data page.

## 9. Data Display Rules

- Dates: use a clear local display format consistently.
- Money: display two decimals and `₪` / `ILS` consistently.
- Phone and email: keep readable inside RTL content.
- Long file names: truncate visually with a title/tooltip while preserving access to the full name.
- Tables: avoid more than 6–8 visible columns on laptop widths.
- Never expose server storage paths or secret configuration values in the UI.

## 10. Definition of Done for UI

A page is visually complete only when it:

- Works in RTL.
- Is usable at desktop and mobile widths.
- Includes loading, empty, error, and success states where relevant.
- Uses real API data once the backend feature exists.
- Has keyboard-accessible controls and readable contrast.
- Clearly separates working MVP features from mock/planned modules.
- Uses only fictitious demo data in screenshots and the GitHub repository.
