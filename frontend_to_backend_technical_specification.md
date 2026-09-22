# MASTER PROMPT — Complete Frontend Analysis for Backend Planning

## 1. Executive Summary
This document provides a complete, deep-dive technical analysis of the **AI Expense Tracker** frontend repository. The application is built with React, Vite, Tailwind CSS v4, and Wouter, targeting two primary user roles: **Student** and **Professional**. Currently, the frontend operates completely on hardcoded mock data, utilizing simulated asynchronous delays to mimic API responses. The purpose of this specification is to act as the authoritative blueprint for the backend developer to build the database, APIs, and business logic necessary to make the application fully functional.

## 2. Complete Project Inventory

| File | Type | Purpose | Used By | Important Functions | Backend Relevance |
|---|---|---|---|---|---|
| `package.json` | Config | Defines dependencies & scripts | Build System | `vite build`, `dev` | Low |
| `vite.config.ts` | Config | Vite configuration | Build System | Plugin setup | Low |
| `App.tsx` | Router | Main routing definition | Entry Point | `Switch`, `Route` mapping | High |
| `AuthContext.tsx` | Context | Manages user session state | Entire App | `login`, `logout`, `persistUser` | Very High |
| `demoAuth.ts` | Auth | Mock authentication logic | `AuthContext` | `authenticateUser` | Very High |
| `Login.tsx` | Page | Authentication screen | Public Route | `handleSubmit` | Very High |
| `StudentDashboard.tsx` | Page | Main student overview | Student Route | Layout & component composition | High |
| `ProfessionalDashboard.tsx` | Page | Main professional overview | Prof. Route | Layout & component composition | High |
| `AddExpenseModal.tsx` | UI | Form to add an expense | Dashboards | `submit` with `useState` | High |
| `TransactionList.tsx` | UI | Displays recent expenses | Dashboards | Filtering transactions | High |
| `studentData.ts` | Data | Mock data for student role | Student Pages | `studentTransactions`, metrics | Very High |
| `professionalData.ts`| Data | Mock data for prof. role | Prof. Pages | `professionalTransactions` | Very High |
| `expenseService.ts` | Service | Mock API for expenses | Pages | `getTransactions`, `addExpense`| Very High |
| `aiService.ts` | Service | Mock API for AI features | Pages | `getInsights`, `getRecommendation`| Very High |
| `ReceiptScanner.tsx` | Page | UI for receipt upload | Protected Routes | File upload UI | Very High |
| `VoiceExpense.tsx` | Page | UI for voice input | Protected Routes | Microphone interaction UI | Very High |

## 3. Technology Stack

### Frontend
- **React 19.2**: Core library for building the UI. It matters for the backend because it dictates the SPA architecture.
- **TypeScript 5.6**: Static typing. Backend API responses should eventually be typed to match the frontend `types/index.ts`.
- **Vite 7.1**: Build tool. 
- **Tailwind CSS v4**: Styling framework. No direct backend relevance, but handles responsive layouts.
- **Wouter**: Lightweight router. The backend needs to support standard SPA routing (fallback to `index.html`).
- **Framer Motion**: Animation library. Backend independent.
- **Radix UI**: Accessible component primitives.
- **Recharts**: Charting library. Backend must format data structures precisely to feed these charts (e.g., arrays of objects).
- **Sonner**: Toast notification library. Backend error messages will be fed directly into these toasts.
- **Zod & React Hook Form**: Installed in `package.json` but minimally utilized in custom components. The backend must rely on its own robust validation.

## 4. Dependency Analysis

**Production Dependencies**:
- **Routing**: `wouter`
- **UI Components**: `@radix-ui/react-*`, `lucide-react`, `clsx`, `tailwind-merge`
- **Forms & Validation**: `react-hook-form`, `zod`, `@hookform/resolvers` (Installed, but forms like `Login.tsx` and `AddExpenseModal.tsx` currently use standard React `useState` for state tracking and basic logic).
- **Charts**: `recharts` (Requires specific data arrays from the API).
- **Animation**: `framer-motion`, `tailwindcss-animate`
- **Notifications**: `sonner`
- **Utility**: `nanoid`, `axios` (Axios is installed and can be used for future API calls).

*Note: Unused dependencies should be pruned later, but their presence indicates intent for robust form validation (Zod).*

## 5. Application Architecture

```text
                    Landing Page (/)
                         │
                         ▼
                       Login (/login)
                         │
                         ▼
                AuthContext (LocalStorage)
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          Student              Professional
      (/student/*)           (/professional/*)
              │                     │
              ▼                     ▼
        DashboardLayout        DashboardLayout
              │                     │
              ▼                     ▼
          Pages/Views            Pages/Views
              │                     │
              └──────────┬──────────┘
                         ▼
             Shared Services (Services/*.ts)
                         │
                         ▼
             Mock Data (data/*Data.ts)
```

## 6. Routing

| Route | Page | User Role | Protected? | Purpose | Data Required | Actions |
|---|---|---|---|---|---|---|
| `/` | Landing | Public | No | Product introduction | None | Navigate to login |
| `/login` | Login | Public | No | Authentication | Credentials | Login, Demo Accounts |
| `/student` | StudentDashboard | Student | Yes | Main Overview | Metrics, Charts, Transactions| Add Expense |
| `/student/pocket-money` | PocketMoney | Student | Yes | Detail view | Budgets, expenses | View |
| `/student/receipt-scanner`| ReceiptScanner | Student | Yes | OCR Expense | Image File | Upload |
| `/professional` | ProfessionalDashboard | Professional | Yes | Main Overview | Metrics, Income, Expenses | Add Expense |
| `/professional/predictions`| Predictions | Professional | Yes | Future forecasting| Trend Data | View |
| `/*` | NotFound | Any | No | Fallback 404 | None | Redirect Home |

*The app forces redirects if a user tries to access a route not belonging to their role (handled by `ProtectedRoute.tsx`).*

## 7. User Roles

The frontend strictly enforces two roles: **Student** and **Professional**.

**Permissions Matrix**:
| Feature | Student | Professional |
|---|---:|---:|
| Pocket Money | Yes | No |
| Semester Budget | Yes | No |
| Project Expenses | Yes | No |
| Savings Goals | Yes | Yes |
| Receipt Scanner | Yes | Yes |
| Voice Expense | Yes | Yes |
| Income | No | Yes |
| Predictions | No | Yes |
| Emergency Fund | Yes | Yes |
| Subscriptions | Yes | Yes |

*Note: The frontend derives roles from the mocked `AuthContext`. The backend MUST enforce these boundaries via JWT roles or session validation.*

## 8. Permissions Matrix
*(Refer to section 7)*

## 9. Complete Feature Inventory

- **Login / Demo Login**: Uses hardcoded emails. *Backend*: Needs `POST /api/auth/login`.
- **Add Expense Modal**: Uses `useState` for Name, Amount. *Backend*: Needs `POST /api/expenses`.
- **Transaction List**: Filters by text locally. *Backend*: Needs `GET /api/transactions?search=text`.
- **AI Insights Card**: Displays static text. *Backend*: Needs integration with an LLM and a `GET /api/insights` endpoint.
- **Spending Pulse Chart**: Bar chart driven by static `TrendBar` arrays. *Backend*: Needs aggregation query.
- **Receipt Scanner**: UI exists for file drag-and-drop. *Backend*: Needs file upload endpoint and OCR service integration.
- **Voice Expense**: UI exists for microphone. *Backend*: Needs audio upload endpoint or Web Speech API text processing endpoint.
- **Theme Toggle**: Uses localStorage (`theme`). *Backend*: Not required (Frontend only).

## 10. Page-by-Page Analysis

### StudentDashboard
- **Route**: `/student`
- **UI Elements**: Hero Banner (Pocket money remaining), StatCards (Total spending, Financial health), SpendingPulseChart, AIInsightCard, BudgetHealthCard, EmergencyFundCard, SavingsGoalCard, TransactionList, AddExpenseModal.
- **State**: `useState` for `showAdd` modal. `wouter` for navigation.
- **User Actions**: Click 'Add Expense', Click 'View Insight'.
- **Backend Data**: Requires an aggregated dashboard endpoint returning metrics, budget status, chart data, and recent transactions to avoid 10 separate API calls.

### Login
- **Route**: `/login`
- **UI Elements**: Email input, Password input, 'Remember me' checkbox, Demo Account buttons.
- **State**: `useState` for `email`, `password`, `loading`, `showPassword`.
- **User Actions**: Submit form, Click Demo Account.
- **Backend Data**: Expects JWT and User Object upon successful submission.

## 11. Dashboard Analysis

**Student Dashboard**:
- **Hero Metric**: "Pocket money remaining". Derived from Monthly Allowance - Total Expenses.
- **Financial Health**: "78 / 100". Derived from a formula involving budget utilization and savings rate.

**Professional Dashboard**:
- **Hero Metric**: Not completely explicit, but focuses on "Steady growth, smarter decisions" and relies heavily on Income vs Expenses.
- **Emergency Fund**: Professional tracks months of living expenses covered.

*All metrics are currently fetched from hardcoded files like `studentHeroMetric`. The backend will need to perform these calculations.*

## 12. Mock Data Inventory

| Data | File | Used By | Fields | Should Become DB Data? |
|---|---|---|---|---|
| Transactions | `studentData.ts`, `professionalData.ts` | TransactionList | name, category, date, amount, color | Yes |
| TrendBars | `*Data.ts` | SpendingPulseChart | month, height, isHighlighted | Yes (Aggregated) |
| SavingsGoal | `*Data.ts` | SavingsGoalCard | name, current, target, percentComplete | Yes |
| AIInsight | `*Data.ts` | AIInsightCard | headline, description, timestamp | Yes (Generated & Stored) |
| BudgetCategories | `*Data.ts` | BudgetHealthCard | label, value, color | Yes |

## 13. Data Model Discovery

Based on the frontend data structures, the following entities are required:

**User**
- id, email, name, role (student | professional), password_hash, created_at

**Transaction (Expense/Income)**
- id, user_id, type (expense | income), name/description, amount, category, date, payment_method, created_at

**SavingsGoal**
- id, user_id, name, current_amount, target_amount, created_at

**Budget**
- id, user_id, category, limit_amount, current_spent (derived or stored), month, year

**AIInsight**
- id, user_id, headline, description, timestamp, is_read

## 14. Field-Level Data Specification

**Transaction Example**:
| Field | Type | Required | Used By |
|---|---|---|---|
| id | UUID | Yes | Keys in lists |
| amount | string/decimal | Yes | TransactionList, Calculations |
| name | string | Yes | TransactionList |
| category | string | Yes | Filters, Icons |
| color | string | No | UI styling (can be derived from category) |
| date | timestamp | Yes | Sorting, Chart Aggregation |

## 15. Entity Relationships

```text
User (1) ----> (N) Transactions
User (1) ----> (N) SavingsGoals
User (1) ----> (N) Budgets
User (1) ----> (1) EmergencyFund
User (1) ----> (N) AIInsights
```
*Student roles may have specific subtypes of budgets (e.g. Semester Budget).*

## 16. Form Analysis

**AddExpenseModal**:
- **Fields**: Name (text), Amount (number). (Category and Payment method are currently mocked dropdowns).
- **Validation**: Handled manually via `if (!name || !amount) toast.error(...)`.
- **Backend Endpoint**: `POST /api/transactions`
- **Database Entity**: Transaction

**Login Form**:
- **Fields**: Email, Password.
- **Validation**: Basic empty check.
- **Backend Endpoint**: `POST /api/auth/login`

## 17. CRUD Matrix

| Feature | Create | Read | Update | Delete |
|---|:---:|:---:|:---:|:---:|
| Transactions | Yes | Yes | Planned | Planned |
| Savings Goals | Planned | Yes | Planned | Planned |
| AI Insights | Backend | Yes | No | Planned |

*Currently, the UI only explicitly exposes "Create" for Expenses and "Read" for the rest.*

## 18. Current State Management

- **Client State**: `useState` handles modal toggles, password visibility, form inputs.
- **Global Auth State**: `AuthContext` (Context API) handles the logged-in user.
- **Persistent State**: `localStorage` stores the auth object (`expenseTrackerUser`) and theme (`theme`).
*No Redux or Zustand is used. Server state (React Query/SWR) is highly recommended for the future backend integration.*

## 19. Calculations & Business Logic

Currently, calculations like `budgetUsedPercent`, `savingsPercentComplete`, and `remainingPocketMoney` are hardcoded in the mock data objects (e.g., `percentComplete: 68`).
**Migration**: The backend MUST handle these calculations. The frontend should receive pre-calculated percentages or the raw numbers to derive them, but the authoritative source must be the database.

## 20. Financial Metrics

- **Total Spending**: Needs to aggregate all expense transactions for the current month.
- **Financial Health Score**: Needs a backend algorithm (e.g., 0-100 based on budget adherence and savings contributions).

## 21. Charts & Analytics

**SpendingPulseChart**:
- Library: Recharts
- Data Source: `TrendBars` array.
- Structure needed from API: `[{ month: "Jan", height: 36 }, ...]`
- *Note*: The frontend uses "height" as a normalized value (0-100). The backend should return actual totals, and the frontend should scale them, or the backend returns both.

## 22. Search / Filter / Sort

**TransactionList**:
- Features a local text filter over the mocked array: `t.name.toLowerCase().includes(activeQuery.toLowerCase())`.
- **Backend Implementation**: Should be moved to `GET /api/transactions?search={query}` with pagination.

## 23. Local Storage / Persistence

| Key | Value | Purpose | Backend Action |
|---|---|---|---|
| `expenseTrackerUser` | JSON Object | Auth persistence | Replace with HttpOnly Cookies or JWT in localStorage |
| `theme` | "light" / "dark" | UI styling | None (Frontend only) |

## 24. Authentication Analysis

Currently entirely mocked in `demoAuth.ts`.
- **Future Backend**: Needs JWT-based or Session-based authentication.
- **Authorization**: The frontend relies on the `role` property in the context to determine access. The backend must validate this role on every protected API call.

## 25. AI Features

- **AI Insights**: Currently static strings. Will require a scheduled backend job or an on-demand API call to an LLM (e.g., Gemini) analyzing the user's recent transactions.
- **Recommendations**: Static text.

## 26. Receipt Scanner

- **Implemented**: Beautiful drag-and-drop UI, camera access simulation, mock recent scans list.
- **Backend Required**: `POST /api/receipts/scan` accepting `multipart/form-data`. The backend will need to integrate with Google Cloud Vision or a similar OCR service to extract amount, merchant, and date.

## 27. Voice Expense

- **Implemented**: UI mock.
- **Backend Required**: Need a mechanism to accept audio blobs (`POST /api/voice/parse`) or accept transcribed text from the Web Speech API and pass it to an LLM to extract JSON `{ amount, category, name }`.

## 28. Notifications

- Triggered using `sonner` (`toast.success`, `toast.error`).
- Example: "Lunch at Green Bowl added to your expenses".
- **Backend Requirement**: Standardize API error responses so the frontend can easily map them to toast messages.

## 29. Loading States

- Implemented minimally via `loading` state in `Login.tsx` (button spinner).
- Missing widespread Skeleton loaders. When real APIs are introduced, the UI will need skeleton components for the dashboard metrics and charts.

## 30. Error States

- Handled manually in forms (e.g., "Add a name and amount first").
- The backend must provide proper 400, 401, 403, 404, 500 error codes.

## 31. Empty States

- `TransactionList.tsx` has a basic empty state: `No transactions match "query"`.

## 32. Responsive Behavior

- Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`) handle grid reflows.
- Mobile FAB (Floating Action Button) appears on small screens to add expenses.
- Entirely Frontend responsibility.

## 33. Component Dependency Map

```text
StudentDashboard
   ├── DashboardLayout
   ├── HeroMetricCard
   ├── StatCard (x2)
   ├── SpendingPulseChart
   ├── AIInsightCard
   ├── BudgetHealthCard
   ├── EmergencyFundCard
   ├── SavingsGoalCard
   ├── TransactionList
   └── AddExpenseModal
```

## 34. Backend Data Ownership

- **Frontend-only**: Theme, Sidebar open state, Local search queries, Modal open states.
- **Backend-owned**: Users, Transactions, Budgets, Savings Goals.
- **AI-generated (Backend stored)**: Financial Health Score, Insights.

## 35. Security Requirements

- **Authentication**: JWT or Session cookies.
- **Role-based access**: `/api/student/*` vs `/api/professional/*` endpoints MUST verify the user's role. A student must not be able to POST to an income endpoint if it's restricted.
- **Data Isolation**: `user_id` MUST be strictly enforced on all queries to prevent cross-account data leakage.

## 36. Database Requirements

*Decision Required: PostgreSQL is highly recommended for financial data due to ACID compliance and relational integrity.*
- Tables: `users`, `transactions`, `budgets`, `savings_goals`, `insights`.

## 37. File Storage Requirements

- **Receipt Scanner**: Requires an S3 bucket or Google Cloud Storage to store uploaded receipt images temporarily or permanently for auditing.

## 38. External Services

- **Future OCR**: Google Cloud Vision API / AWS Textract.
- **Future AI**: OpenAI / Gemini for insights and parsing.

## 39. Environment Variables

*Future Needs:*
- `VITE_API_URL`
- `DATABASE_URL` (Backend)
- `JWT_SECRET` (Backend)
- `AI_API_KEY` (Backend)

## 40. Frontend → Backend Migration Map

| Current Frontend | Current Source | Future Backend |
|---|---|---|
| Demo login | `demoAuth.ts` | `POST /api/auth/login` |
| Transactions | `studentData.ts` | `GET /api/transactions` |
| Dashboard metrics | Hardcoded | `GET /api/dashboard/metrics` |
| AI insights | `aiService.ts` | `GET /api/insights` |
| Add Expense | `expenseService.ts` | `POST /api/transactions` |

## 41. Required Backend Modules

1. **Auth Module**: Registration, Login, Session validation.
2. **Transaction Module**: CRUD for expenses and income.
3. **Analytics Module**: Aggregation for charts and dashboard metrics.
4. **AI Module**: Processing receipts, voice inputs, and generating insights.

## 42. Backend API Priorities

- **Phase 1**: Auth & Transactions (CRUD)
- **Phase 2**: Analytics & Aggregations (Dashboard data)
- **Phase 3**: AI & OCR Integrations (Receipts, Voice, Insights)

## 43. Business Logic Migration

| Logic | Current Location | Should Move Backend? | Reason |
|---|---|---|---|
| Total spending | Hardcoded | Yes | Must be dynamically calculated |
| Budget percent | Hardcoded | Yes | Ensures consistency across devices |
| Filtering | React (`useMemo`) | Yes | Required for pagination |

## 44. Proposed API Contracts (NOT IMPLEMENTED)

**GET /api/dashboard/student**
```json
{
  "heroMetric": { "remaining": 18450, "percent": 63 },
  "stats": { "totalSpending": 11550, "health": 78 },
  "recentTransactions": [ ... ]
}
```

**POST /api/transactions**
```json
{
  "name": "Lunch",
  "amount": 250,
  "category": "Food",
  "paymentMethod": "UPI"
}
```

## 45. Complete User Flows

**Student Add Expense**:
`Login -> View Dashboard -> Click "Add expense" FAB -> Enter Details -> Click "Save" -> POST /api/transactions -> Refresh Dashboard Metrics -> Toast Success`

## 46. Future Data Flow

```text
React UI -> API Call (Axios/Fetch) -> Express Router -> Auth Middleware -> Controller -> Database -> JSON Response -> React State Update
```

## 47. Frontend-Only Responsibilities

- Framer motion animations (Fade up, stagger).
- Dark/Light mode tracking.
- Mobile layout toggles.
- Sonner toast rendering.

## 48. Backend Decisions / Open Questions

- **Question**: Are receipts stored permanently or just used for OCR and discarded? *Recommendation: Store temporarily, delete after processing to save costs.*
- **Question**: How is "Financial Health" calculated? *Recommendation: Define a strict algorithm on the backend before implementing.*

## 49. Technical Debt

- **Issue**: Lack of Zod/React Hook Form usage in main components despite being installed. *Impact*: Will require refactoring the frontend forms when connecting APIs to ensure robust validation.
- **Issue**: State is heavily local to components. *Impact*: May require introducing TanStack Query (React Query) to cleanly manage remote server state.

## 50. Backend Readiness Assessment

- **Authentication Readiness**: 70/100 (UI is ready, needs actual logic)
- **Data Model Readiness**: 90/100 (UI maps clearly to entities)
- **API Readiness**: 80/100 (Clear where endpoints go)
- **AI Integration Readiness**: 60/100 (UI exists, but prompts/models need defining)
- **Overall Backend Readiness**: **80/100**. The UI is exceptionally well-structured, but the transition from static data to dynamic data will require careful mapping of aggregated endpoints.

## 51. Recommended Backend Development Order

1. Initialize Node/Express/PostgreSQL stack.
2. Implement User & Auth models.
3. Implement Transaction model and CRUD endpoints.
4. Implement Dashboard aggregation endpoints.
5. Integrate external AI/OCR APIs.
6. Connect Frontend to Backend using Axios & React Query.
