import io
import calendar
from datetime import datetime
from flask import Blueprint, request, make_response, send_file
from sqlalchemy import func
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app import db
from app.models.transaction import Transaction
from app.models.income_source import IncomeSource
from app.models.budget import Budget
from app.utils.auth import require_auth, get_current_user, success_response, error_response
from app.utils.calculations import calculate_financial_health, format_inr

reports_bp = Blueprint('reports', __name__)

def _generate_pdf_buffer(user, report_type="monthly", month=None, year=None):
    now = datetime.utcnow()
    month = month or now.month
    year = year or now.year
    month_name = calendar.month_name[month]
    
    start = datetime(year, month, 1)
    end = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
    
    # 1. Fetch user expenses
    txs = Transaction.query.filter(
        Transaction.user_id == user.id,
        Transaction.type == 'expense',
        Transaction.date >= start,
        Transaction.date < end
    ).order_by(Transaction.date.desc()).all()
    
    total_spent = sum(float(t.amount) for t in txs)
    
    # 2. Fetch income
    income_txs = Transaction.query.filter(
        Transaction.user_id == user.id,
        Transaction.type == 'income',
        Transaction.date >= start,
        Transaction.date < end
    ).all()
    total_income = sum(float(t.amount) for t in income_txs)
    if total_income == 0 and user.monthly_allowance:
        total_income = float(user.monthly_allowance)
        
    net_savings = max(0.0, total_income - total_spent)
    savings_rate = round((net_savings / total_income) * 100) if total_income > 0 else 0
    health_score = calculate_financial_health(user, db.session)
    
    # 3. Category breakdown
    cat_totals = {}
    for t in txs:
        cat_totals[t.category] = cat_totals.get(t.category, 0.0) + float(t.amount)
        
    # 4. Create in-memory PDF
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette Matching Soft Signal UI
    primary_color = colors.HexColor('#172532')
    accent_mint = colors.HexColor('#2E7D5A')
    accent_coral = colors.HexColor('#D9534F')
    light_bg = colors.HexColor('#F8FAF7')
    border_color = colors.HexColor('#E2E8E2')
    text_muted = colors.HexColor('#718078')
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_muted
    )
    
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6
    )
    
    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=primary_color
    )
    
    cell_regular = ParagraphStyle(
        'CellRegular',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=primary_color
    )

    story = []
    
    # Header Banner
    story.append(Paragraph("AI Expense Tracker — Financial Report", title_style))
    story.append(Paragraph(
        f"Generated on {now.strftime('%d %B %Y')} | Account: {user.name} ({user.email}) | Role: {user.role.title()}",
        subtitle_style
    ))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceBefore=4, spaceAfter=14))
    
    # Report Title
    if report_type == 'category':
        report_heading = f"Category Breakdown Report — {month_name} {year}"
    elif report_type == 'semester':
        report_heading = f"Semester Overview Report — H{1 if month <= 6 else 2} {year}"
    else:
        report_heading = f"Monthly Financial Summary — {month_name} {year}"
        
    story.append(Paragraph(report_heading, h2_style))
    story.append(Spacer(1, 6))
    
    # Financial Overview KPI Table
    kpi_data = [
        [
            Paragraph("Total Inflow", cell_bold),
            Paragraph("Total Outflow", cell_bold),
            Paragraph("Net Savings", cell_bold),
            Paragraph("Health Score", cell_bold)
        ],
        [
            Paragraph(f"+₹{total_income:,.0f}", cell_bold),
            Paragraph(f"-₹{total_spent:,.0f}", cell_bold),
            Paragraph(f"₹{net_savings:,.0f} ({savings_rate}%)", cell_bold),
            Paragraph(f"{health_score} / 100", cell_bold)
        ]
    ]
    
    kpi_table = Table(kpi_data, colWidths=[130, 130, 136, 136])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), light_bg),
        ('TEXTCOLOR', (0, 0), (-1, -1), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 16))
    
    # Category Breakdown Table
    story.append(Paragraph("Category Spending Breakdown", h2_style))
    cat_rows = [[
        Paragraph("Category", cell_bold),
        Paragraph("Amount Spent", cell_bold),
        Paragraph("% of Total Spending", cell_bold)
    ]]
    
    if cat_totals:
        for cat, amt in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True):
            pct = round((amt / total_spent) * 100, 1) if total_spent > 0 else 0
            cat_rows.append([
                Paragraph(cat, cell_regular),
                Paragraph(f"₹{amt:,.0f}", cell_regular),
                Paragraph(f"{pct}%", cell_regular)
            ])
    else:
        cat_rows.append([
            Paragraph("No recorded expenses", cell_regular),
            Paragraph("₹0", cell_regular),
            Paragraph("0%", cell_regular)
        ])
        
    cat_table = Table(cat_rows, colWidths=[200, 166, 166])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), light_bg),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(cat_table)
    story.append(Spacer(1, 16))
    
    # Recent Transactions Section
    story.append(Paragraph("Recent Transactions Recorded", h2_style))
    tx_rows = [[
        Paragraph("Date", cell_bold),
        Paragraph("Description / Merchant", cell_bold),
        Paragraph("Category", cell_bold),
        Paragraph("Amount", cell_bold)
    ]]
    
    for t in txs[:8]:
        tx_rows.append([
            Paragraph(t.date.strftime("%d %b %Y"), cell_regular),
            Paragraph(t.name[:25], cell_regular),
            Paragraph(t.category, cell_regular),
            Paragraph(f"-₹{float(t.amount):,.0f}", cell_regular)
        ])
        
    if len(txs) == 0:
        tx_rows.append([
            Paragraph("-", cell_regular),
            Paragraph("No transactions for this period", cell_regular),
            Paragraph("-", cell_regular),
            Paragraph("₹0", cell_regular)
        ])
        
    tx_table = Table(tx_rows, colWidths=[110, 200, 112, 110])
    tx_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), light_bg),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(tx_table)
    story.append(Spacer(1, 16))
    
    # Footer Notice
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=10, spaceAfter=8))
    story.append(Paragraph(
        "Confidential document generated automatically by AI Expense Tracker. Values rounded to nearest whole rupee.",
        subtitle_style
    ))
    
    doc.build(story)
    buf.seek(0)
    return buf

@reports_bp.route('/download', methods=['GET'])
@reports_bp.route('/monthly-pdf', methods=['GET'])
@require_auth
def download_pdf():
    user = get_current_user()
    name = request.args.get('name', '').lower()
    
    now = datetime.utcnow()
    month = int(request.args.get('month', now.month))
    year = int(request.args.get('year', now.year))
    
    report_type = "monthly"
    if "category" in name:
        report_type = "category"
    elif "semester" in name:
        report_type = "semester"
        
    buf = _generate_pdf_buffer(user, report_type=report_type, month=month, year=year)
    
    filename = f"Financial_Report_{user.name.replace(' ', '_')}_{calendar.month_abbr[month]}_{year}.pdf"
    
    response = make_response(buf.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

@reports_bp.route('/list', methods=['GET'])
@require_auth
def list_reports():
    now = datetime.utcnow()
    current_month_name = calendar.month_name[now.month]
    prev_month = now.month - 1 if now.month > 1 else 12
    prev_month_name = calendar.month_name[prev_month]
    
    available = [
        {
            "id": "monthly-current",
            "name": f"Monthly Summary — {current_month_name} {now.year}",
            "type": "PDF",
            "date": "Generated today",
            "report_type": "monthly",
            "month": now.month,
            "year": now.year
        },
        {
            "id": "category-prev",
            "name": f"Category Breakdown — {prev_month_name} {now.year}",
            "type": "PDF",
            "date": f"1 {current_month_name[:3]} {now.year}",
            "report_type": "category",
            "month": prev_month,
            "year": now.year
        },
        {
            "id": "semester-h1",
            "name": f"Semester Overview — H{1 if now.month <= 6 else 2} {now.year}",
            "type": "PDF",
            "date": f"30 {calendar.month_abbr[6 if now.month <= 6 else 12]} {now.year}",
            "report_type": "semester",
            "month": now.month,
            "year": now.year
        }
    ]
    return success_response(available)
