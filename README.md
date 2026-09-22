# AI Expense Tracker — Production Full-Stack Application

An intelligent, dual-persona personal finance platform built with **React 19**, **Python Flask**, **SQLite**, **Google Gemini 1.5 Flash**, **Scikit-Learn**, and **ReportLab**.

---

## Key Features

### Dual-Persona Architecture
* **Student Workspace:** Tailored for collegiate budgeting with Safe-to-Spend metrics, pocket money depletion runways, academic semester fee management, project expenses, and micro-savings goals.
* **Professional Workspace:** Tailored for corporate wealth with active vs. passive income tracking, SaaS subscription recurring burn managers, emergency fund runway calculators, and 3-month predictive expense forecasting.

### Artificial Intelligence & Machine Learning
* **Generative Financial Insights:** Synthesizes spending patterns into actionable CFP-level recommendations via Gemini 1.5 Flash (with zero-configuration offline rule fallback).
* **Predictive Forecasting:** Hybrid Scikit-Learn `LinearRegression` model with autoregressive lag features and moving average cold-start strategies.
* **Voice Command Expense Logging:** Native speech transcription converted into structured expense entities via Gemini NLP.
* **Multimodal Receipt Scanner:** Drag-and-drop receipt image analysis and data extraction using Gemini 1.5 Flash Vision.

### Financial Reporting & Analytics
* **Real-time Analytics:** 12-month spending pulse trend chart, category breakdown, and net cash position.
* **Category Budgeting:** Live category limit tracking and donut chart health utilization.
* **PDF Financial Reports:** Direct in-memory binary PDF generation via ReportLab with instant browser download.

---

## Quick Start Guide

### 1. One-Click Launch (Windows)
Double-click `Start.bat` in the repository root. This will:
1. Start the Flask backend on port `5000`.
2. Start the Vite React frontend on port `3000`.
3. Open `http://localhost:3000` in your default browser.
4. Auto-terminate background servers upon window exit (`CTRL+C`).

---

### 2. Manual Setup

#### Backend Setup
```bash
cd Backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt

# (Optional) Populate database with demo users & transactions
python seed.py

# Start Flask server
python run.py
```
Backend runs at: `http://localhost:5000`

#### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## Automated Testing

Execute the complete 31-test backend test suite:
```bash
cd Backend
python -m pytest
```
*Result: 31 / 31 passed (100%)*

Validate the frontend production build:
```bash
cd Frontend
npm run build
```
*Result: 0 errors*

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Student** | `student@test.com` | `student123` |
| **Professional** | `prof@test.com` | `prof123` |

*(Quick-fill buttons are also available directly on the `/login` screen).*

---

## Comprehensive Documentation Index

* 📘 [**API Documentation**](file:///c:/Users/DELL/Downloads/AI-Expenser-Tracker-main/API_DOCUMENTATION.md): Complete REST endpoint catalog.
* 🗄️ [**Database Documentation**](file:///c:/Users/DELL/Downloads/AI-Expenser-Tracker-main/DATABASE_DOCUMENTATION.md): Relational schema, ERD, and data models.
* 🧠 [**AI & ML Documentation**](file:///c:/Users/DELL/Downloads/AI-Expenser-Tracker-main/AI_ML_DOCUMENTATION.md): Gemini prompts, OCR, and Scikit-Learn pipelines.
* 🧪 [**Final Test Report**](file:///c:/Users/DELL/Downloads/AI-Expenser-Tracker-main/FINAL_TEST_REPORT.md): 31/31 passing test verification and E2E checklist.
* 📋 [**Project Completion Audit**](file:///c:/Users/DELL/Downloads/AI-Expenser-Tracker-main/FINAL_PROJECT_COMPLETION_AUDIT.md): Quantitative feature verification matrix.
* 🚀 [**Master Final Report**](file:///c:/Users/DELL/Downloads/AI-Expenser-Tracker-main/PROJECT_COMPLETE_FINAL_REPORT.md): Full delivery report.
