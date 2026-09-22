import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

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

def _build_financial_summary(user, db_session):
    from app.models.transaction import Transaction
    from app.utils.calculations import get_current_month_range
    from sqlalchemy import func
    
    start, end = get_current_month_range()
    
    total_spent = db_session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id, Transaction.type == 'expense',
        Transaction.date >= start, Transaction.date < end
    ).scalar() or 0
    
    top_category = db_session.query(
        Transaction.category,
        func.sum(Transaction.amount).label('cat_total')
    ).filter(
        Transaction.user_id == user.id, Transaction.type == 'expense',
        Transaction.date >= start, Transaction.date < end
    ).group_by(Transaction.category).order_by(func.sum(Transaction.amount).desc()).first()
    
    goals = user.savings_goals.all()
    avg_savings_progress = sum(g.percent_complete for g in goals) / len(goals) if goals else 0
    
    return {
        "period": start.strftime("%B %Y"),
        "role": user.role,
        "total_spent_inr": round(float(total_spent), 2),
        "monthly_budget_inr": float(user.monthly_allowance) if user.monthly_allowance else 30000,
        "top_category": top_category.category if top_category else "Other",
        "top_category_amount_inr": round(float(top_category.cat_total), 2) if top_category else 0,
        "avg_savings_goal_progress_pct": round(avg_savings_progress, 1),
    }

def generate_insight(user, db_session):
    """Generate AI insight using Gemini, with fallback to static insights."""
    api_key = os.environ.get('GEMINI_API_KEY', '')
    
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — using fallback insight")
        import random
        fi = random.choice(FALLBACK_INSIGHTS)
        return fi['headline'], fi['description']
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(os.environ.get('AI_MODEL', 'gemini-1.5-flash'))
        
        summary = _build_financial_summary(user, db_session)
        
        prompt = f"""You are a personal finance advisor for an Indian user. Based on the following financial summary, generate ONE concise, actionable, personalised financial insight.

Financial Summary:
- Period: {summary['period']}
- Role: {summary['role']}
- Total spent this month: ₹{summary['total_spent_inr']:,.0f}
- Monthly budget: ₹{summary['monthly_budget_inr']:,.0f}
- Top spending category: {summary['top_category']} (₹{summary['top_category_amount_inr']:,.0f})
- Average savings goal progress: {summary['avg_savings_goal_progress_pct']}%

Respond ONLY with valid JSON in exactly this format, no markdown:
{{"headline": "Short catchy headline under 8 words", "description": "2-3 sentence actionable insight mentioning specific rupee amounts where relevant"}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Strip markdown code blocks if present
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        
        parsed = json.loads(text)
        headline = str(parsed.get('headline', ''))[:255]
        description = str(parsed.get('description', ''))[:1000]
        
        if not headline or not description:
            raise ValueError("Empty AI response fields")
        
        return headline, description
        
    except Exception as e:
        logger.error(f"AI insight generation failed: {e}")
        import random
        fi = random.choice(FALLBACK_INSIGHTS)
        return fi['headline'], fi['description']

def parse_voice_expense(text):
    """Use Gemini to parse spoken text into structured expense data."""
    api_key = os.environ.get('GEMINI_API_KEY', '')
    
    if not api_key:
        return None, "AI service not configured. Please add GEMINI_API_KEY to your .env file."
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(os.environ.get('AI_MODEL', 'gemini-1.5-flash'))
        
        prompt = f"""Extract expense information from this spoken text: "{text}"

Respond ONLY with valid JSON:
{{"name": "expense description", "amount": 250, "category": "Food", "payment_method": "UPI"}}

Valid categories: Food, Travel, Education, Entertainment, Bills, Health, Shopping, Subscription, Other
If you cannot parse an amount, set amount to null.
Do not include markdown or explanation."""

        response = model.generate_content(prompt)
        raw = response.text.strip()
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        
        parsed = json.loads(raw)
        return parsed, None
        
    except Exception as e:
        logger.error(f"Voice parsing failed: {e}")
        return None, f"Could not parse your expense. Please try again."
