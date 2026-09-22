# AI Expense Tracker — Database Schema & Data Models Documentation

This document details the complete relational database architecture for the **AI Expense Tracker** using **SQLAlchemy ORM** and **SQLite**.

---

## 1. Relational Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────┐
│              users              │
├─────────────────────────────────┤
│ id (PK, String 36)              │
│ email (Unique, String 255)      │
│ password_hash (String 255)      │
│ name (String 100)               │
│ role (String 20)                │
│ initials (String 5)             │
│ monthly_allowance (Numeric)     │
│ savings_target (Numeric)        │
│ created_at (DateTime)           │
└───────────────┬─────────────────┘
                │ 1:N
        ┌───────┴───────┬───────────────┬───────────────┬───────────────┐
        │               │               │               │               │
        ▼               ▼               ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ transactions │ │   budgets    │ │savings_goals │ │emergency_fund│ │subscriptions │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ id (PK)      │ │ id (PK)      │ │ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ user_id (FK) │ │ user_id (FK) │ │ user_id (FK) │ │ user_id (FK) │ │ user_id (FK) │
│ type         │ │ category     │ │ name         │ │ current_amt  │ │ name         │
│ name         │ │ limit_amount │ │ target_amt   │ │ target_months│ │ amount       │
│ amount       │ │ color        │ │ current_amt  │ │ monthly_exp  │ │ cycle        │
│ category     │ │ month        │ │ deadline     │ │ status       │ │ next_due     │
│ payment_meth │ │ year         │ │ icon         │ │ created_at   │ │ active       │
│ date         │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
│ color, notes │
└──────────────┘
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│income_sources│ │   projects   │ │semester_budg │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ user_id (FK) │ │ user_id (FK) │ │ user_id (FK) │
│ source       │ │ name         │ │ semester_name│
│ amount       │ │ total_budget │ │ total_budget │
│ type         │ │ spent        │ │ spent        │
│ is_recurring │ │ status       │ │ start_date   │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. Table Specifications

### 2.1 `users` Table
* **`id`** (`VARCHAR(36)`): Primary Key (UUID v4 string).
* **`email`** (`VARCHAR(255)`): Unique, Indexed. User login identity.
* **`password_hash`** (`VARCHAR(255)`): PBKDF2:SHA256 hashed password.
* **`name`** (`VARCHAR(100)`): Display name (e.g., "Rahul Sharma").
* **`role`** (`VARCHAR(20)`): `'student'` or `'professional'`.
* **`initials`** (`VARCHAR(5)`): 2-character avatar initials (e.g., "RS").
* **`monthly_allowance`** (`NUMERIC(12, 2)`): Monthly baseline budget / allowance.
* **`savings_target`** (`NUMERIC(12, 2)`): User savings goal target.
* **`created_at`** (`DATETIME`): UTC timestamp of creation.

---

### 2.2 `transactions` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`, Indexed.
* **`type`** (`VARCHAR(20)`): `'expense'` or `'income'`.
* **`name`** (`VARCHAR(255)`): Description or merchant name.
* **`amount`** (`NUMERIC(12, 2)`): Transaction value.
* **`category`** (`VARCHAR(100)`): Canonical category (`Food`, `Travel`, `Education`, `Entertainment`, `Bills`, `Health`, `Shopping`, `Subscription`, `Other`).
* **`payment_method`** (`VARCHAR(50)`): Default `'UPI'`.
* **`date`** (`DATETIME`): Date and time of transaction.
* **`color`** (`VARCHAR(20)`): Visual badge color token.
* **`notes`** (`TEXT`): Additional memo (e.g. voice transcripts or OCR tags).

---

### 2.3 `budgets` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`.
* **`category`** (`VARCHAR(100)`): Target category.
* **`limit_amount`** (`NUMERIC(12, 2)`): Monthly spending limit in INR.
* **`color`** (`VARCHAR(20)`): Hex color token.
* **`month`** (`INTEGER`): Calendar month (1-12).
* **`year`** (`INTEGER`): Calendar year (e.g., 2026).

---

### 2.4 `savings_goals` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`.
* **`name`** (`VARCHAR(255)`): Goal title (e.g. "New Laptop").
* **`target_amount`** (`NUMERIC(12, 2)`): Total target cost.
* **`current_amount`** (`NUMERIC(12, 2)`): Amount accumulated to date.
* **`deadline`** (`DATETIME`, Optional): Target completion date.
* **`icon`** (`VARCHAR(50)`): UI icon name.

---

### 2.5 `emergency_funds` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`.
* **`monthly_expense_estimate`** (`NUMERIC(12, 2)`): Average monthly burn.
* **`current_amount`** (`NUMERIC(12, 2)`): Amount in emergency reserves.
* **`target_months`** (`INTEGER`): Desired runway coverage (e.g. 6 months).

---

### 2.6 `subscriptions` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`.
* **`name`** (`VARCHAR(255)`): Service name (e.g. "Netflix", "AWS").
* **`amount`** (`NUMERIC(12, 2)`): Recurring charge.
* **`cycle`** (`VARCHAR(50)`): `'Monthly'` or `'Annual'`.
* **`active`** (`BOOLEAN`): Subscription status.

---

### 2.7 `income_sources` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`.
* **`source`** (`VARCHAR(255)`): Income name (e.g. "Salary", "Consulting").
* **`amount`** (`NUMERIC(12, 2)`): Monthly payout.
* **`type`** (`VARCHAR(50)`): `'fixed'`, `'variable'`, or `'passive'`.
* **`date_received`** (`DATE`): Payout date in calendar month.

---

### 2.8 `projects` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`.
* **`name`** (`VARCHAR(255)`): Academic project name (e.g. "Robotics Quadcopter").
* **`total_budget`** (`NUMERIC(12, 2)`): Budget allocated.
* **`spent`** (`NUMERIC(12, 2)`): Amount spent so far.

---

### 2.9 `semester_budgets` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`.
* **`month`** (`INTEGER`), **`year`** (`INTEGER`): Academic period.
* **`budget`** (`NUMERIC(12, 2)`): Semester allotment.
* **`status`** (`VARCHAR(50)`): Status (e.g. `'On Track'`, `'Warning'`).

---

### 2.10 `ai_insights` Table
* **`id`** (`VARCHAR(36)`): Primary Key.
* **`user_id`** (`VARCHAR(36)`): Foreign Key referencing `users.id`.
* **`headline`** (`VARCHAR(255)`): Catchy advisory header.
* **`description`** (`TEXT`): Actionable financial recommendation.
* **`category`** (`VARCHAR(100)`): Topic tag.
* **`created_at`** (`DATETIME`): Synthesis timestamp.

---

## 3. Database Initialization & Seeding

### 3.1 Seeding Script (`seed.py`)
To populate demo users with realistic financial histories:
```bash
cd Backend
python seed.py
```
This populates:
1. **Student Account:**
   * Email: `student@test.com` (Password: `student123`)
   * Transactions: 6 months of historical college spending (Food, Books, Travel).
   * Active Budget: Food (₹5,000), Entertainment (₹2,500), Travel (₹1,500).
   * Active Savings Goal: "New Laptop" (₹34,000 / ₹50,000).
2. **Professional Account:**
   * Email: `prof@test.com` (Password: `prof123`)
   * Transactions: 6+ months of historical spending across all categories.
   * Income Sources: Salary (₹85,000), Freelance (₹18,200).
   * Subscriptions: Netflix, Spotify, Amazon Prime, Cloud Compute.
   * Emergency Fund: ₹1,80,000 against a ₹3,00,000 target.

### 3.2 Database Migrations
Migrations are managed via Flask-Migrate (Alembic):
```bash
flask db init      # On first setup
flask db migrate -m "migration description"
flask db upgrade
```
During normal development, `run.py` automatically executes `db.create_all()` if tables do not exist.
