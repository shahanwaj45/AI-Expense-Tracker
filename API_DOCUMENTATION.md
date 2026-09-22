# AI Expense Tracker — Comprehensive REST API Documentation

This document provides the authoritative API specification for all endpoints implemented in the Flask backend of the **AI Expense Tracker**.

---

## 1. Authentication & Session API (`/api/auth`)

### 1.1 User Login
* **Method:** `POST`
* **URL:** `/api/auth/login`
* **Auth:** None (Public)
* **Role:** Any
* **Request Body:**
  ```json
  {
    "email": "student@test.com",
    "password": "student123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "uuid-v4-string",
        "email": "student@test.com",
        "name": "Test Student",
        "role": "student",
        "initials": "TS"
      }
    }
  }
  ```
* **Error Responses:**
  * `400 Bad Request`: `{"success": false, "error": {"message": "Email and password required"}}`
  * `401 Unauthorized`: `{"success": false, "error": {"message": "Invalid credentials"}}`
* **Frontend Consumer:** `Login.tsx` / `AuthContext.tsx`

---

### 1.2 User Registration
* **Method:** `POST`
* **URL:** `/api/auth/register`
* **Auth:** None (Public)
* **Request Body:**
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "password": "strongPassword123",
    "role": "student"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUz...",
      "user": {
        "id": "uuid-v4",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "role": "student",
        "initials": "RS"
      }
    }
  }
  ```
* **Error Responses:** `409 Conflict` (Email already registered).

---

### 1.3 Current User Identity
* **Method:** `GET`
* **URL:** `/api/auth/me`
* **Auth:** Required (`Bearer <JWT>`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-v4",
      "email": "student@test.com",
      "name": "Test Student",
      "role": "student",
      "initials": "TS",
      "monthly_allowance": 30000.0,
      "savings_target": 15000.0
    }
  }
  ```
* **Error Responses:** `401 Unauthorized`.

---

### 1.4 User Logout
* **Method:** `POST`
* **URL:** `/api/auth/logout`
* **Auth:** Required
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
* **Frontend Consumer:** `Settings.tsx` / `AuthContext.tsx`

---

## 2. Transactions & Ledger API (`/api/transactions`)

### 2.1 List Transactions
* **Method:** `GET`
* **URL:** `/api/transactions`
* **Auth:** Required
* **Query Parameters:**
  * `limit` (int, default: 50): Number of transactions
  * `offset` (int, default: 0): Pagination offset
  * `search` (string): Wildcard search on merchant/notes
  * `category` (string): Filter by canonical category
  * `type` (string, `expense` | `income`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "uuid-123",
          "name": "Cafe Coffee Day",
          "amount": "-₹250",
          "amount_raw": 250.0,
          "category": "Food",
          "payment_method": "UPI",
          "date": "Today, 02:30 PM",
          "date_raw": "2026-09-22T09:00:00",
          "color": "coral",
          "notes": "Logged via Voice"
        }
      ],
      "total": 42
    }
  }
  ```
* **Frontend Consumer:** `Transactions.tsx`, `Expenses.tsx`, `ReceiptScanner.tsx`

---

### 2.2 Create Transaction
* **Method:** `POST`
* **URL:** `/api/transactions`
* **Auth:** Required
* **Request Body:**
  ```json
  {
    "name": "Campus Bookstore",
    "amount": 1200,
    "category": "Education",
    "payment_method": "UPI",
    "type": "expense",
    "notes": "Algorithms textbook"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-456",
      "name": "Campus Bookstore",
      "amount": "-₹1,200",
      "category": "Education",
      "payment_method": "UPI",
      "color": "violet"
    }
  }
  ```
* **Frontend Consumer:** `AddExpenseModal.tsx`

---

### 2.3 Delete Transaction
* **Method:** `DELETE`
* **URL:** `/api/transactions/<id>`
* **Auth:** Required
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Transaction deleted successfully"
  }
  ```
* **Frontend Consumer:** `TransactionList.tsx`

---

## 3. Analytics API (`/api/analytics`)

### 3.1 12-Month Expense Trend
* **Method:** `GET`
* **URL:** `/api/analytics/trend` (Alias: `/api/analytics/spending-trend`)
* **Auth:** Required
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "month": "Oct",
        "height": 45,
        "isHighlighted": false,
        "amount": 18450.0
      },
      {
        "month": "Sep",
        "height": 85,
        "isHighlighted": true,
        "amount": 28900.0
      }
    ]
  }
  ```
* **Frontend Consumer:** `Analytics.tsx`, `SpendingPulseChart.tsx`

---

### 3.2 Category Distribution
* **Method:** `GET`
* **URL:** `/api/analytics/categories`
* **Auth:** Required
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "category": "Food", "total": 8500.0, "formatted": "₹8,500" },
      { "category": "Travel", "total": 3200.0, "formatted": "₹3,200" }
    ]
  }
  ```
* **Frontend Consumer:** `Analytics.tsx`

---

### 3.3 Cash Summary
* **Method:** `GET`
* **URL:** `/api/analytics/summary`
* **Auth:** Required
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total_spent": 24500.0,
      "total_income": 35000.0,
      "net": 10500.0
    }
  }
  ```
* **Frontend Consumer:** `Analytics.tsx`

---

## 4. Budgets API (`/api/budgets`)

### 4.1 List & Calculate Budgets
* **Method:** `GET`
* **URL:** `/api/budgets`
* **Auth:** Required
* **Query Parameters:** `month` (optional), `year` (optional)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "categories": [
        {
          "id": "budget-uuid-1",
          "label": "Food",
          "category": "Food",
          "value": "₹5,000",
          "limit_amount": 5000.0,
          "spent": 3200.0,
          "spent_formatted": "₹3,200",
          "remaining": 1800.0,
          "percent_used": 64,
          "color": "#7BE2BE"
        }
      ],
      "usedPercent": 64,
      "total_limit": 15000.0,
      "total_spent": 9600.0
    }
  }
  ```
* **Frontend Consumer:** `Budget.tsx`, `BudgetHealthCard.tsx`

---

### 4.2 Create Budget
* **Method:** `POST`
* **URL:** `/api/budgets`
* **Auth:** Required
* **Request Body:**
  ```json
  {
    "category": "Entertainment",
    "limit_amount": 4000.0,
    "color": "#f6ae8e",
    "month": 9,
    "year": 2026
  }
  ```
* **Success Response (201 Created):** Budget object created.

---

## 5. ReportLab PDF Reports API (`/api/reports`)

### 5.1 Download Financial PDF Report
* **Method:** `GET`
* **URL:** `/api/reports/download` (Alias: `/api/reports/monthly-pdf`)
* **Auth:** Required
* **Query Parameters:**
  * `name`: Report title (e.g. `Monthly Summary`, `Category Breakdown`, `Semester Overview`)
  * `month` (int, optional): Target month (1-12)
  * `year` (int, optional): Target year
* **Headers Returned:**
  * `Content-Type: application/pdf`
  * `Content-Disposition: attachment; filename="Financial_Report_Rahul_Sharma_Sep_2026.pdf"`
* **Response Body:** Binary PDF stream (starting with `%PDF-1.4`)
* **Frontend Consumer:** `Reports.tsx`

---

### 5.2 List Available Reports
* **Method:** `GET`
* **URL:** `/api/reports/list`
* **Auth:** Required
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "monthly-current",
        "name": "Monthly Summary — September 2026",
        "type": "PDF",
        "date": "Generated today",
        "report_type": "monthly"
      }
    ]
  }
  ```
* **Frontend Consumer:** `Reports.tsx`

---

## 6. Generative AI Financial Insights API (`/api/insights`)

### 6.1 Get Active Insights
* **Method:** `GET`
* **URL:** `/api/insights`
* **Auth:** Required
* **Success Response (200 OK):** Returns saved insights list with headline, description, and timestamps.

---

### 6.2 Trigger GenAI Insight Synthesis
* **Method:** `POST`
* **URL:** `/api/insights/generate`
* **Auth:** Required
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "headline": "Small savings add up fast",
      "description": "You spent ₹14,200 on dining out this month. Saving even 10% can compound into ₹17,000 annually.",
      "timestamp": "Just now"
    }
  }
  ```
* **Fallback Behavior:** If `GEMINI_API_KEY` is not provided, returns curated financial rules.

---

## 7. Machine Learning Forecasting API (`/api/predictions`)

### 7.1 Predict Next 3 Months
* **Method:** `GET`
* **URL:** `/api/predictions`
* **Auth:** Required
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "available": true,
      "method": "linear_regression",
      "predictions": [
        {
          "month": "October",
          "predicted": "₹28,500",
          "predicted_raw": 28500.0,
          "trend": "↓ 4.2%",
          "positive": true
        },
        {
          "month": "November",
          "predicted": "₹27,800",
          "predicted_raw": 27800.0,
          "trend": "↓ 2.5%",
          "positive": true
        },
        {
          "month": "December",
          "predicted": "₹31,000",
          "predicted_raw": 31000.0,
          "trend": "↑ 11.5%",
          "positive": false
        }
      ],
      "historical": [
        { "month": "Apr", "amount": 25000.0, "year": 2026 },
        { "month": "May", "amount": 27200.0, "year": 2026 }
      ]
    }
  }
  ```
* **Cold Start Behavior (< 3 Months History):** Returns `available: false`, `reason: "insufficient_data"`.

---

## 8. Voice & Multimodal OCR APIs (`/api/voice`, `/api/receipts`)

### 8.1 Parse Spoken Voice Text
* **Method:** `POST`
* **URL:** `/api/voice/parse`
* **Auth:** Required
* **Request Body:** `{"text": "Spent 450 rupees on groceries at Spencer's"}`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "parsed": {
        "name": "Spencer's",
        "amount": 450.0,
        "category": "Shopping",
        "payment_method": "UPI"
      },
      "original_text": "Spent 450 rupees on groceries at Spencer's"
    }
  }
  ```

---

### 8.2 Confirm Voice Expense
* **Method:** `POST`
* **URL:** `/api/voice/confirm`
* **Auth:** Required
* **Request Body:**
  ```json
  {
    "name": "Spencer's",
    "amount": 450.0,
    "category": "Shopping",
    "payment_method": "UPI",
    "original_text": "Spent 450 rupees on groceries at Spencer's"
  }
  ```
* **Success Response (201 Created):** Creates transaction in database.

---

### 8.3 Scan Receipt Image
* **Method:** `POST`
* **URL:** `/api/receipts/scan`
* **Auth:** Required
* **Content-Type:** `multipart/form-data`
* **Form Field:** `file` (Image file: PNG, JPG, JPEG, GIF, WEBP, PDF up to 10MB)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "extracted": {
        "merchant": "Decathlon Sports",
        "amount": 1899.0,
        "date": "2026-09-18",
        "category": "Shopping"
      }
    }
  }
  ```

---

### 8.4 Confirm Scanned Receipt
* **Method:** `POST`
* **URL:** `/api/receipts/confirm`
* **Auth:** Required
* **Request Body:** `{"merchant": "Decathlon", "amount": 1899, "category": "Shopping", "date": "2026-09-18"}`
* **Success Response (201 Created):** Creates transaction in database with note `"Scanned receipt"`.

---

## 9. Role-Specific Feature APIs

### 9.1 Student Endpoints
* `GET /api/dashboard/student`: Safe-to-Spend runway metrics and daily limits.
* `GET /api/semester-budget`, `POST /api/semester-budget`: Academic semester fees & living budgets.
* `GET /api/projects`, `POST /api/projects/<id>/expenses`: Academic team project budgets.
* `GET /api/savings-goals`, `POST /api/savings-goals`: Micro-savings goals.

### 9.2 Professional Endpoints
* `GET /api/dashboard/professional`: Net cash flow, burn rate %, and savings rate %.
* `GET /api/income`, `POST /api/income`: Multi-stream active & passive income tracking.
* `GET /api/subscriptions`, `DELETE /api/subscriptions/<id>`: SaaS recurring burn manager.
* `GET /api/emergency-fund`, `POST /api/emergency-fund`: Runway coverage calculator.
