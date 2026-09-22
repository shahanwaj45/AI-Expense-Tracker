"""
Seed script: Creates demo users and realistic demo data.
Run: python seed.py
Safe to re-run: skips users/data that already exist.
"""
import os
import sys
from datetime import datetime, date, timedelta
import random

from dotenv import load_dotenv
load_dotenv()

from app import create_app, db
from app.models.user import User
from app.models.transaction import Transaction, CATEGORY_COLORS
from app.models.budget import Budget
from app.models.savings_goal import SavingsGoal
from app.models.emergency_fund import EmergencyFund, EmergencyFundContribution
from app.models.subscription import Subscription
from app.models.income_source import IncomeSource
from app.models.project import Project, ProjectExpense
from app.models.semester_budget import SemesterBudget
from app.models.ai_insight import AIInsight

app = create_app('development')

STUDENT_EMAIL = 'student@demo.com'
PROFESSIONAL_EMAIL = 'professional@demo.com'

def create_tables():
    db.create_all()
    print("[DB] Tables created.")

def seed_users():
    student = User.query.filter_by(email=STUDENT_EMAIL).first()
    if not student:
        student = User(
            id='demo-student-001',
            email=STUDENT_EMAIL,
            name='Aarav Rao',
            initials='AR',
            role='student',
            monthly_allowance=30000.00,
        )
        student.set_password('student123')
        db.session.add(student)
        print(f"[SEED] Created student: {STUDENT_EMAIL}")
    else:
        print(f"[SKIP] Student already exists: {STUDENT_EMAIL}")
    
    prof = User.query.filter_by(email=PROFESSIONAL_EMAIL).first()
    if not prof:
        prof = User(
            id='demo-professional-001',
            email=PROFESSIONAL_EMAIL,
            name='Demo Professional',
            initials='DP',
            role='professional',
            monthly_allowance=95200.00,
        )
        prof.set_password('professional123')
        db.session.add(prof)
        print(f"[SEED] Created professional: {PROFESSIONAL_EMAIL}")
    else:
        print(f"[SKIP] Professional already exists: {PROFESSIONAL_EMAIL}")
    
    db.session.commit()
    return User.query.get('demo-student-001'), User.query.get('demo-professional-001')

def seed_student_data(student):
    if Transaction.query.filter_by(user_id=student.id).count() > 0:
        print(f"[SKIP] Student transactions already seeded.")
        return
    
    now = datetime.utcnow()
    
    # Current month transactions
    student_txns = [
        ('Lunch at Green Bowl', 'Food', 250, now - timedelta(hours=2)),
        ('Auto to college', 'Travel', 80, now - timedelta(hours=5)),
        ('Stationery', 'Education', 320, now - timedelta(days=1)),
        ('Movie tickets', 'Entertainment', 500, now - timedelta(days=2)),
        ('Swiggy dinner', 'Food', 380, now - timedelta(days=3)),
        ('Bus pass', 'Travel', 600, now - timedelta(days=4)),
        ('Books', 'Education', 1200, now - timedelta(days=5)),
        ('Cafe with friends', 'Food', 450, now - timedelta(days=6)),
        ('Snacks', 'Food', 150, now - timedelta(days=7)),
        ('College fest ticket', 'Entertainment', 200, now - timedelta(days=8)),
    ]
    
    # Historical transactions (last 6 months)
    categories = ['Food', 'Travel', 'Education', 'Entertainment']
    for months_ago in range(1, 7):
        month_dt = now - timedelta(days=months_ago * 30)
        num_txns = random.randint(8, 15)
        for _ in range(num_txns):
            cat = random.choice(categories)
            amount = random.randint(100, 2000)
            day_offset = random.randint(0, 28)
            dt = month_dt - timedelta(days=day_offset)
            student_txns.append((f'Expense ({cat})', cat, amount, dt))
    
    for name, cat, amount, dt in student_txns:
        tx = Transaction(
            user_id=student.id,
            type='expense',
            name=name,
            amount=amount,
            category=cat,
            payment_method=random.choice(['UPI', 'Cash', 'Card']),
            date=dt,
            color=CATEGORY_COLORS.get(cat, 'coral'),
        )
        db.session.add(tx)
    
    # Budgets
    budgets_data = [
        ('Food', 5000, '#7BE2BE'),
        ('Travel', 2000, '#a9dced'),
        ('Education', 3000, '#a29bf4'),
        ('Entertainment', 1500, '#f6ae8e'),
    ]
    for cat, limit, color in budgets_data:
        b = Budget(
            user_id=student.id,
            category=cat,
            limit_amount=limit,
            color=color,
            month=now.month,
            year=now.year,
        )
        db.session.add(b)
    
    # Savings goals
    goals = [
        ('New laptop', 63000, 42800),
        ('Emergency cushion', 25000, 12000),
        ('Trip to Goa', 15000, 8500),
    ]
    for name, target, current in goals:
        g = SavingsGoal(user_id=student.id, name=name, target_amount=target, current_amount=current)
        db.session.add(g)
    
    # Emergency Fund
    ef = EmergencyFund(user_id=student.id, current_amount=60000, monthly_expense_estimate=30000)
    db.session.add(ef)
    
    # Projects
    projects = [
        ('Final Year Project', 15000, [('Raspberry Pi', 3200), ('Sensors', 1800), ('PCB printing', 800), ('Lab materials', 2600)]),
        ('Hackathon Prep', 5000, [('Cloud credits', 1500), ('Snacks', 700), ('Printing', 1000)]),
        ('Study Group Resources', 3000, [('Books', 1200), ('Notes printing', 600)]),
    ]
    for pname, budget, expenses in projects:
        p = Project(user_id=student.id, name=pname, budget=budget)
        db.session.add(p)
        db.session.flush()
        for ename, amount in expenses:
            e = ProjectExpense(project_id=p.id, name=ename, amount=amount)
            db.session.add(e)
    
    # Semester budgets
    for month in range(7, 13):
        status = 'upcoming'
        if month < now.month:
            status = 'complete'
        elif month == now.month:
            status = 'active'
        sb = SemesterBudget(user_id=student.id, month=month, year=now.year, budget=30000, status=status)
        db.session.add(sb)
    
    # Subscriptions
    subs = [
        ('Netflix', 649, 'Monthly', date(now.year, now.month, 1) + timedelta(days=14), '#e98b68'),
        ('Spotify', 59, 'Monthly', date(now.year, now.month, 5) + timedelta(days=14), '#4caf89'),
    ]
    for name, amount, cycle, next_date, color in subs:
        s = Subscription(user_id=student.id, name=name, amount=amount, cycle=cycle, next_billing_date=next_date, color=color)
        db.session.add(s)
    
    # AI Insight
    insight = AIInsight(
        user_id=student.id,
        headline="Small shift, bigger breathing room.",
        description="Your food expenses this month are trending 18% higher than last month. Reducing two takeout orders per week could save you ₹800 — that's ₹9,600 a year towards your laptop goal.",
        source_period=now.strftime('%B %Y'),
    )
    db.session.add(insight)
    
    db.session.commit()
    print(f"[SEED] Student data seeded successfully.")

def seed_professional_data(prof):
    if Transaction.query.filter_by(user_id=prof.id).count() > 0:
        print(f"[SKIP] Professional transactions already seeded.")
        return
    
    now = datetime.utcnow()
    
    prof_txns = [
        ('Swiggy order', 'Food', 480, now - timedelta(hours=3), 'expense'),
        ('Netflix subscription', 'Subscription', 649, now - timedelta(days=1), 'expense'),
        ('Electricity bill', 'Bills', 2450, now - timedelta(days=6), 'expense'),
        ('Freelance payment', 'Income', 15000, now - timedelta(days=8), 'income'),
        ('Uber commute', 'Travel', 320, now - timedelta(days=9), 'expense'),
        ('Grocery shopping', 'Food', 3200, now - timedelta(days=10), 'expense'),
        ('AWS subscription', 'Subscription', 950, now - timedelta(days=11), 'expense'),
        ('Doctor visit', 'Health', 800, now - timedelta(days=12), 'expense'),
        ('Salary', 'Income', 85000, now - timedelta(days=17), 'income'),
    ]
    
    # Historical transactions (last 8 months for predictions)
    cats = ['Food', 'Travel', 'Bills', 'Health', 'Entertainment', 'Subscription']
    for months_ago in range(1, 9):
        month_dt = now - timedelta(days=months_ago * 30)
        base = 60000 + random.randint(-5000, 5000)
        num_txns = random.randint(10, 20)
        for _ in range(num_txns):
            cat = random.choice(cats)
            amount = random.randint(200, 5000)
            dt = month_dt - timedelta(days=random.randint(0, 28))
            prof_txns.append((f'Expense ({cat})', cat, amount, dt, 'expense'))
        # Monthly salary
        prof_txns.append(('Salary', 'Income', 85000, month_dt, 'income'))
    
    for name, cat, amount, dt, tx_type in prof_txns:
        tx = Transaction(
            user_id=prof.id,
            type=tx_type,
            name=name,
            amount=amount,
            category=cat,
            payment_method=random.choice(['UPI', 'NetBanking', 'Card']),
            date=dt,
            color=CATEGORY_COLORS.get(cat, 'coral'),
        )
        db.session.add(tx)
    
    # Budgets
    for cat, limit, color in [('Food', 21240, '#7BE2BE'), ('Bills', 13740, '#a29bf4'), ('Travel', 9420, '#f6ae8e'), ('Other', 8080, '#a9dced')]:
        b = Budget(user_id=prof.id, category=cat, limit_amount=limit, color=color, month=now.month, year=now.year)
        db.session.add(b)
    
    # Savings goals
    g = SavingsGoal(user_id=prof.id, name='Investment fund', target_amount=300000, current_amount=185000)
    db.session.add(g)
    
    # Emergency fund
    ef = EmergencyFund(user_id=prof.id, current_amount=180000, monthly_expense_estimate=45000)
    db.session.add(ef)
    for i, (dt, amt) in enumerate([(now-timedelta(days=17), 15000), (now-timedelta(days=47), 15000), (now-timedelta(days=77), 20000), (now-timedelta(days=107), 10000)]):
        pass
    db.session.flush()
    ef2 = EmergencyFund.query.filter_by(user_id=prof.id).first()
    for dt_off, amt in [(17, 15000), (47, 15000), (77, 20000), (107, 10000)]:
        c = EmergencyFundContribution(fund_id=ef2.id, amount=amt, date=now-timedelta(days=dt_off))
        db.session.add(c)
    
    # Income sources
    for source, amount, src_type, color in [
        ('Salary', 85000, 'fixed', '#7BE2BE'),
        ('Freelance', 15000, 'variable', '#a29bf4'),
        ('Investments', 3200, 'passive', '#a9dced'),
    ]:
        s = IncomeSource(user_id=prof.id, source=source, amount=amount, type=src_type, date_received=date(now.year, now.month, 1), color=color, is_recurring=True)
        db.session.add(s)
    
    # Subscriptions
    for name, amount, color, day in [('Netflix', 649, '#e98b68', 1), ('Spotify Premium', 119, '#4caf89', 5), ('GitHub Copilot', 950, '#695db3', 10), ('Google One', 130, '#55a9bc', 15), ('Gym membership', 2500, '#a29bf4', 1)]:
        next_month = now.month % 12 + 1
        next_year = now.year if next_month > 1 else now.year + 1
        s = Subscription(user_id=prof.id, name=name, amount=amount, cycle='Monthly', next_billing_date=date(next_year, next_month, day), color=color)
        db.session.add(s)
    
    # AI Insight
    insight = AIInsight(
        user_id=prof.id,
        headline="Steady growth, room to optimise.",
        description="Your subscriptions total ₹4,348/month. Consolidating two streaming services could save ₹800 monthly — nearly ₹9,600 a year that could go towards your investment fund.",
        source_period=now.strftime('%B %Y'),
    )
    db.session.add(insight)
    
    db.session.commit()
    print(f"[SEED] Professional data seeded successfully.")

if __name__ == '__main__':
    with app.app_context():
        create_tables()
        student, prof = seed_users()
        seed_student_data(student)
        seed_professional_data(prof)
        print("\n=== Seed Complete ===")
        print(f"Student login:      {STUDENT_EMAIL} / student123")
        print(f"Professional login: {PROFESSIONAL_EMAIL} / professional123")
