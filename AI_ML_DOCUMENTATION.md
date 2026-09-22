# AI Expense Tracker — Artificial Intelligence & Machine Learning Architecture

This document specifies the internal architectures, prompt contracts, fallback algorithms, and mathematical models powering the **AI Expense Tracker**.

---

## 1. System Overview

The application utilizes a hybrid intelligence approach:
1. **Cloud Multimodal Generative AI (Google Gemini 1.5 Flash):** For contextual financial advisory synthesis, natural language speech parsing, and receipt image OCR.
2. **Deterministic Rule Fallback Engine:** To ensure zero-crash resilience if no API key is provided or during network outages.
3. **Statistical Machine Learning (Scikit-Learn Linear Regression):** For autoregressive 3-month spending forecast modeling with adaptive cold-start strategies.

---

## 2. Generative AI Financial Insights Engine

### 2.1 Service Implementation (`Backend/app/services/ai_service.py`)
The AI engine evaluates the user's current calendar month metrics before formulating prompts:
* Total monthly spent (in INR ₹).
* Monthly allowance/budget limit and utilization ratio.
* Top spending category and amount spent in that category.
* Average progress percentage across all active savings goals.

### 2.2 System Prompt Contract
```text
You are a personal finance advisor for an Indian user. Based on the following financial summary, generate ONE concise, actionable, personalised financial insight.

Financial Summary:
- Period: {summary['period']}
- Role: {summary['role']}
- Total spent this month: ₹{summary['total_spent_inr']:,.0f}
- Monthly budget: ₹{summary['monthly_budget_inr']:,.0f}
- Top spending category: {summary['top_category']} (₹{summary['top_category_amount_inr']:,.0f})
- Average savings goal progress: {summary['avg_savings_goal_progress_pct']}%

Respond ONLY with valid JSON in exactly this format, no markdown:
{"headline": "Short catchy headline under 8 words", "description": "2-3 sentence actionable insight mentioning specific rupee amounts where relevant"}
```

### 2.3 Deterministic Fallback Engine
If `GEMINI_API_KEY` is not present in `.env` or an API rate-limit occurs, the service automatically draws from a curated pool of financial best practices:
```python
FALLBACK_INSIGHTS = [
    {
        "headline": "Track every rupee to unlock insights.",
        "description": "Add more transactions to get personalised AI-powered financial insights. The more data you provide, the smarter your recommendations become.",
    },
    {
        "headline": "Small savings add up fast.",
        "description": "Even saving 10% of your monthly budget can compound significantly over a year. Consider setting an automatic savings goal to stay consistent.",
    },
    {
        "headline": "Review your subscriptions.",
        "description": "Many people overpay on subscriptions they rarely use. Review your recurring charges and cancel anything you haven't used in the last month.",
    },
]
```

---

## 3. Voice Command Expense Logging NLP

### 3.1 Architecture
```
[User Speech] 
  ──► Web Speech API (Browser STT)
  ──► Transcribed Text
  ──► POST /api/voice/parse
  ──► Gemini 1.5 Flash NLP Extraction
  ──► Structured JSON
  ──► User Review & Edit UI
  ──► POST /api/voice/confirm
  ──► SQLite DB Commit
```

### 3.2 NLP Extraction Prompt
```text
Extract expense information from this spoken text: "{text}"

Respond ONLY with valid JSON:
{"name": "expense description", "amount": 250, "category": "Food", "payment_method": "UPI"}

Valid categories: Food, Travel, Education, Entertainment, Bills, Health, Shopping, Subscription, Other
If you cannot parse an amount, set amount to null.
Do not include markdown or explanation.
```

---

## 4. Multimodal Receipt OCR Scanner

### 4.1 Ingestion & Vision Extraction
* **Frontend:** Drag-and-drop file upload (`ReceiptScanner.tsx`) validating against PNG, JPG, JPEG, GIF, WEBP, and PDF up to 10MB.
* **Backend (`app/services/ocr_service.py`):**
  * Reads the image file using PIL (`Pillow`).
  * Passes image bytes directly to **Gemini 1.5 Flash Vision** (`gemini-1.5-flash`).
  * Multimodal prompt instructs the vision model to localize the merchant name, date (`YYYY-MM-DD`), total numerical amount, and inferred category.
  * Temporary file is removed immediately from disk to ensure zero residual storage bloat.

---

## 5. Machine Learning Spending Forecaster

### 5.1 Temporal Feature Extraction (`Backend/app/ml/predict.py`)
The forecaster queries monthly expense aggregates over the user's historical transactions:
$$y_t = \sum \text{Transaction.amount} \quad \text{for month } t$$

### 5.2 Adaptive Cold-Start Tiering Strategy
* **Tier 1 — Insufficient Data ($N < 3$ months):**
  * Returns `status: 'insufficient_data'`.
  * Informs the user that at least 3 months of transaction history are required to train the predictive model.
* **Tier 2 — Moving Average ($3 \le N < 6$ months):**
  * Fits a 3-month Simple Moving Average (SMA):
    $$\hat{y}_{t+k} = \left(\frac{1}{3} \sum_{i=0}^2 y_{t-i}\right) \times (1 + 0.02 \times k)$$
* **Tier 3 — Linear Regression ($N \ge 6$ months):**
  * Trains a Scikit-Learn `LinearRegression` model:
    $$X = [0, 1, 2, \dots, N-1]^T, \quad y = [y_0, y_1, \dots, y_{N-1}]^T$$
  * Evaluates multi-step ahead projections for $X_{\text{future}} = [N, N+1, N+2]^T$.
  * Ensures non-negative projections: $\hat{y}_{\text{pred}} = \max(0, \text{model.predict}(X))$.

### 5.3 Trend Percentage & Direction Logic
$$\text{Trend \%} = \frac{\hat{y}_{\text{pred}} - y_{\text{current}}}{y_{\text{current}}} \times 100$$
* If $\text{Trend \%} \le 0$: Flagged as **Positive** (green down arrow $\downarrow$), indicating lower forecasted expenses.
* If $\text{Trend \%} > 0$: Flagged as **Negative** (red up arrow $\uparrow$), alerting the user to an impending spending increase.
